/**
 * POD Fulfillment Sync Job Processor
 *
 * Syncs order status between Shopify and POD fulfillment partners.
 * Feature-flagged: POD_SYNC_ENABLED must be true.
 */
import { Job } from 'bullmq'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

interface PodFulfillmentSyncData {
  orderId: string
  fulfillmentPartner: string
  userId?: string
}

export async function processPodFulfillmentSync(job: Job<PodFulfillmentSyncData>) {
  const { orderId, fulfillmentPartner } = job.data
  console.log(`[pod-fulfillment-sync] Syncing order=${orderId}, partner=${fulfillmentPartner}`)

  const enabled = process.env.POD_SYNC_ENABLED === 'true'
  if (!enabled) {
    console.log('[pod-fulfillment-sync] Disabled — set POD_SYNC_ENABLED=true')
    return { status: 'disabled' }
  }

  // Fetch the order
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (!order) {
    console.log(`[pod-fulfillment-sync] Order not found: ${orderId}`)
    return { status: 'order_not_found' }
  }

  // Check POD partner for fulfillment status
  switch (fulfillmentPartner) {
    case 'printful': {
      const apiKey = process.env.PRINTFUL_API_KEY
      if (!apiKey) return { status: 'no_api_key' }

      try {
        const externalOrderId = (order.metadata as Record<string, string>)?.printful_order_id
        if (!externalOrderId) return { status: 'no_external_order' }

        const res = await fetch(`https://api.printful.com/orders/${externalOrderId}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(15000),
        })

        if (!res.ok) return { status: 'api_error', code: res.status }

        const data = await res.json()
        const printfulStatus = data.result?.status

        // Map Printful status to our status
        const statusMap: Record<string, string> = {
          draft: 'processing',
          pending: 'processing',
          inprocess: 'processing',
          fulfilled: 'shipped',
          canceled: 'cancelled',
        }

        const newStatus = statusMap[printfulStatus] || 'processing'

        await supabase
          .from('orders')
          .update({
            fulfillment_status: newStatus,
            metadata: { ...(order.metadata || {}), printful_status: printfulStatus, last_sync: new Date().toISOString() },
          })
          .eq('id', orderId)

        return { status: 'synced', fulfillment_status: newStatus }
      } catch (err) {
        console.error('[pod-fulfillment-sync] Printful error:', err)
        return { status: 'error' }
      }
    }

    default:
      console.log(`[pod-fulfillment-sync] Partner ${fulfillmentPartner} not yet implemented`)
      return { status: 'partner_not_implemented' }
  }
}
