/**
 * Shopify Product Operations via GraphQL Admin API
 *
 * Uses `productSet` mutation (the canonical GraphQL way to create/update products).
 * Replaces deprecated REST POST /admin/api/.../products.json.
 *
 * @engine store-integration
 */

import { shopifyGraphQLWithRetry, type ShopifyClientConfig } from './client'

// --- Types ---

export interface ProductInput {
  title: string
  descriptionHtml?: string
  vendor?: string
  productType?: string
  tags?: string[]
  images?: string[]
  variants?: VariantInput[]
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
}

export interface VariantInput {
  price: string
  compareAtPrice?: string
  sku?: string
  inventoryManagement?: 'SHOPIFY' | null
  inventoryQuantity?: number
  weight?: number
  weightUnit?: 'GRAMS' | 'KILOGRAMS' | 'OUNCES' | 'POUNDS'
}

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  onlineStoreUrl: string | null
  status: string
  variants: {
    nodes: Array<{
      id: string
      price: string
      sku: string | null
    }>
  }
  images: {
    nodes: Array<{
      id: string
      url: string
    }>
  }
}

interface ProductSetResponse {
  productSet: {
    product: ShopifyProduct | null
    userErrors: Array<{
      field: string[]
      message: string
    }>
  }
}

interface ProductDeleteResponse {
  productDelete: {
    deletedProductId: string | null
    userErrors: Array<{
      field: string[]
      message: string
    }>
  }
}

// --- Mutations ---

const PRODUCT_SET_MUTATION = `
  mutation productSet($input: ProductSetInput!, $synchronous: Boolean!) {
    productSet(input: $input, synchronous: $synchronous) {
      product {
        id
        title
        handle
        onlineStoreUrl
        status
        variants(first: 10) {
          nodes {
            id
            price
            sku
          }
        }
        images(first: 10) {
          nodes {
            id
            url
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

const PRODUCT_DELETE_MUTATION = `
  mutation productDelete($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`

const GET_PRODUCT_QUERY = `
  query getProduct($id: ID!) {
    product(id: $id) {
      id
      title
      handle
      onlineStoreUrl
      status
      variants(first: 10) {
        nodes {
          id
          price
          sku
        }
      }
      images(first: 10) {
        nodes {
          id
          url
        }
      }
    }
  }
`

// --- Functions ---

/**
 * Create or update a product on Shopify using the `productSet` mutation.
 * This is idempotent — if productId is provided, it updates; otherwise creates.
 */
export async function pushProduct(
  config: ShopifyClientConfig,
  product: ProductInput,
  existingShopifyProductId?: string,
): Promise<ShopifyProduct> {
  const variants = (product.variants && product.variants.length > 0)
    ? product.variants
    : [{ price: '0.00' }]

  const input: Record<string, unknown> = {
    title: product.title,
    descriptionHtml: product.descriptionHtml || '',
    vendor: product.vendor || 'YouSell',
    productType: product.productType || '',
    tags: product.tags || [],
    status: product.status || 'ACTIVE',
    productOptions: [{
      name: 'Default',
      values: [{ name: 'Default' }],
    }],
    variants: variants.map((v, i) => ({
      optionValues: [{ optionName: 'Default', name: 'Default' }],
      price: v.price,
      compareAtPrice: v.compareAtPrice || undefined,
      sku: v.sku || undefined,
      position: i + 1,
    })),
  }

  // If updating an existing product, include the ID
  if (existingShopifyProductId) {
    input.id = existingShopifyProductId
  }

  // Add images if provided
  if (product.images && product.images.length > 0) {
    input.files = product.images.map(src => ({
      originalSource: src,
      contentType: 'IMAGE',
    }))
  }

  const result = await shopifyGraphQLWithRetry<ProductSetResponse>(
    config,
    PRODUCT_SET_MUTATION,
    { input, synchronous: true },
  )

  const data = result.data?.productSet
  if (!data) {
    throw new Error('No response from productSet mutation')
  }

  if (data.userErrors && data.userErrors.length > 0) {
    const messages = data.userErrors.map(e => `${e.field.join('.')}: ${e.message}`).join('; ')
    throw new Error(`Shopify product errors: ${messages}`)
  }

  if (!data.product) {
    throw new Error('productSet returned no product')
  }

  return data.product
}

/**
 * Get a product by its Shopify GID.
 */
export async function getProduct(
  config: ShopifyClientConfig,
  shopifyProductId: string,
): Promise<ShopifyProduct | null> {
  const result = await shopifyGraphQLWithRetry<{ product: ShopifyProduct | null }>(
    config,
    GET_PRODUCT_QUERY,
    { id: shopifyProductId },
  )

  return result.data?.product || null
}

/**
 * Delete a product from Shopify.
 */
export async function deleteProduct(
  config: ShopifyClientConfig,
  shopifyProductId: string,
): Promise<boolean> {
  const result = await shopifyGraphQLWithRetry<ProductDeleteResponse>(
    config,
    PRODUCT_DELETE_MUTATION,
    { input: { id: shopifyProductId } },
  )

  const data = result.data?.productDelete
  if (data?.userErrors && data.userErrors.length > 0) {
    const messages = data.userErrors.map(e => e.message).join('; ')
    throw new Error(`Shopify delete errors: ${messages}`)
  }

  return !!data?.deletedProductId
}

/**
 * Build a ProductInput from a YOUSELL product database row.
 */
export function toShopifyProduct(dbProduct: {
  title: string
  description?: string | null
  price?: number | null
  compare_at_price?: number | null
  category?: string | null
  source?: string | null
  trend_stage?: string | null
  image_url?: string | null
  sku?: string | null
}): ProductInput {
  return {
    title: dbProduct.title,
    descriptionHtml: dbProduct.description || '',
    vendor: 'YouSell',
    productType: dbProduct.category || '',
    tags: [dbProduct.source, dbProduct.trend_stage].filter(Boolean) as string[],
    images: dbProduct.image_url ? [dbProduct.image_url] : [],
    variants: [{
      price: String(dbProduct.price || '0.00'),
      compareAtPrice: dbProduct.compare_at_price ? String(dbProduct.compare_at_price) : undefined,
      sku: dbProduct.sku || undefined,
    }],
    status: 'ACTIVE',
  }
}
