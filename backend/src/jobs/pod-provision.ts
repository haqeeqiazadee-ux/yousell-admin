/**
 * POD Provisioning Job Processor
 *
 * Provisions POD products with fulfillment partners (Printful, Printify, Gelato).
 * Feature-flagged: calls provider API only when POD_PROVISION_ENABLED=true.
 */
import { Job } from 'bullmq'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

interface PodProvisionData {
  designId: string
  fulfillmentPartner: 'printful' | 'printify' | 'gelato'
  product_id?: string
  client_id?: string
  userId: string
}

export async function processPodProvision(job: Job<PodProvisionData>) {
  const { designId, fulfillmentPartner, product_id, client_id } = job.data
  console.log(`[pod-provision] Processing: design=${designId}, partner=${fulfillmentPartner}`)

  const enabled = process.env.POD_PROVISION_ENABLED === 'true'

  if (!enabled) {
    console.log(`[pod-provision] Disabled — set POD_PROVISION_ENABLED=true to activate`)

    // If we have a product_id and client_id, create a pending shop_products record
    if (product_id && client_id) {
      await supabase.from('shop_products').insert({
        product_id,
        client_id,
        channel: 'shopify',
        push_status: 'pending',
        metadata: {
          pod_provider: fulfillmentPartner,
          design_id: designId,
          awaiting_config: true,
        },
      })
    }

    return { status: 'disabled', partner: fulfillmentPartner }
  }

  // Feature-flagged provider calls
  switch (fulfillmentPartner) {
    case 'printful': {
      const apiKey = process.env.PRINTFUL_API_KEY
      if (!apiKey) {
        return { status: 'no_api_key', partner: 'printful' }
      }

      try {
        const res = await fetch('https://api.printful.com/store/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            sync_product: { name: `POD Design ${designId}` },
            sync_variants: [{ variant_id: 1, retail_price: '24.99' }],
          }),
          signal: AbortSignal.timeout(30000),
        })

        if (!res.ok) {
          const err = await res.text()
          throw new Error(`Printful API error: ${res.status} ${err}`)
        }

        const result = await res.json()
        console.log(`[pod-provision] Printful product created:`, result.result?.id)
        return { status: 'provisioned', partner: 'printful', external_id: result.result?.id }
      } catch (err) {
        console.error('[pod-provision] Printful error:', err)
        throw err
      }
    }

    case 'printify': {
      const apiKey = process.env.PRINTIFY_API_KEY
      if (!apiKey) return { status: 'no_api_key', partner: 'printify' }
      console.log('[pod-provision] Printify integration — awaiting implementation')
      return { status: 'pending_implementation', partner: 'printify' }
    }

    case 'gelato': {
      const apiKey = process.env.GELATO_API_KEY
      if (!apiKey) return { status: 'no_api_key', partner: 'gelato' }
      console.log('[pod-provision] Gelato integration — awaiting implementation')
      return { status: 'pending_implementation', partner: 'gelato' }
    }

    default:
      return { status: 'unknown_partner', partner: fulfillmentPartner }
  }
}
