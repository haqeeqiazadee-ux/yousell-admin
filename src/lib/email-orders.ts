const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'orders@yousell.online'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

interface OrderStatusEmailData {
  to: string
  customerName: string
  orderNumber: string
  status: 'confirmed' | 'shipped' | 'delivered' | string
  productName: string
  trackingNumber?: string
  trackingUrl?: string
}

const STATUS_SUBJECTS: Record<string, string> = {
  confirmed: 'Order Confirmed',
  shipped: 'Your Order Has Shipped',
  delivered: 'Your Order Has Been Delivered',
}

const STATUS_BODY: Record<string, (data: OrderStatusEmailData) => string> = {
  confirmed: (d) => `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #10b981, #34d399); color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;">Order Confirmed</div>
      </div>
      <h2 style="color: #111; margin-bottom: 8px;">Hi ${escapeHtml(d.customerName)},</h2>
      <p style="color: #555; line-height: 1.6;">Thank you for your order! We've received your order <strong>#${escapeHtml(d.orderNumber)}</strong> for <strong>${escapeHtml(d.productName)}</strong> and it's being processed.</p>
      <p style="color: #555; line-height: 1.6;">We'll send you another email when your order ships.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px; text-align: center;">YouSell &mdash; Powered by AI Commerce Intelligence</p>
    </div>
  `,
  shipped: (d) => `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a78bfa); color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;">Order Shipped</div>
      </div>
      <h2 style="color: #111; margin-bottom: 8px;">Hi ${escapeHtml(d.customerName)},</h2>
      <p style="color: #555; line-height: 1.6;">Great news! Your order <strong>#${escapeHtml(d.orderNumber)}</strong> for <strong>${escapeHtml(d.productName)}</strong> is on its way!</p>
      ${d.trackingNumber ? `<p style="color: #555; line-height: 1.6;">Tracking Number: <strong>${escapeHtml(d.trackingNumber)}</strong></p>` : ''}
      ${d.trackingUrl ? `<p><a href="${escapeHtml(d.trackingUrl)}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a78bfa); color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Track Your Package</a></p>` : ''}
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px; text-align: center;">YouSell &mdash; Powered by AI Commerce Intelligence</p>
    </div>
  `,
  delivered: (d) => `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #10b981, #34d399); color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;">Delivered!</div>
      </div>
      <h2 style="color: #111; margin-bottom: 8px;">Hi ${escapeHtml(d.customerName)},</h2>
      <p style="color: #555; line-height: 1.6;">Your order <strong>#${escapeHtml(d.orderNumber)}</strong> for <strong>${escapeHtml(d.productName)}</strong> has been delivered!</p>
      <p style="color: #555; line-height: 1.6;">We hope you love it. If you have any questions, don't hesitate to reach out.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px; text-align: center;">YouSell &mdash; Powered by AI Commerce Intelligence</p>
    </div>
  `,
}

export async function sendOrderStatusEmail(data: OrderStatusEmailData): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn('[Order Email] RESEND_API_KEY not set, skipping email')
    return
  }

  const subject = STATUS_SUBJECTS[data.status] || `Order Update #${data.orderNumber}`
  const bodyFn = STATUS_BODY[data.status]
  const html = bodyFn ? bodyFn(data) : `<p>Your order #${escapeHtml(data.orderNumber)} status has been updated to: ${escapeHtml(data.status)}</p>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: data.to,
        subject: `${subject} - #${data.orderNumber}`,
        html,
      }),
    })

    if (!res.ok) {
      console.error('[Order Email] Failed to send:', await res.text())
    }
  } catch (error) {
    console.error('[Order Email] Error sending email:', error)
  }
}
