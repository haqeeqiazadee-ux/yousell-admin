import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = "YouSell <onboarding@resend.dev>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.warn("Resend not configured — email not sent:", subject);
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Email send failed:", err);
    return null;
  }
}

export async function sendScanCompleteAlert(adminEmail: string, scanId: string, productsFound: number) {
  return sendEmail({
    to: adminEmail,
    subject: `YouSell Scan Complete — ${productsFound} products found`,
    html: `
      <h2>Scan Complete</h2>
      <p>Your product scan has finished.</p>
      <ul>
        <li><strong>Scan ID:</strong> ${scanId}</li>
        <li><strong>Products Found:</strong> ${productsFound}</li>
      </ul>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://yousell.netlify.app"}/admin/scan">View Results</a></p>
    `,
  });
}

export async function sendProductAlert(adminEmail: string, productTitle: string, score: number) {
  return sendEmail({
    to: adminEmail,
    subject: `Hot Product Alert: ${productTitle} (Score: ${score})`,
    html: `
      <h2>Hot Product Detected</h2>
      <p><strong>${productTitle}</strong> scored <strong>${score}/100</strong> and may be going viral.</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://yousell.netlify.app"}/admin/products">View in Dashboard</a></p>
    `,
  });
}
