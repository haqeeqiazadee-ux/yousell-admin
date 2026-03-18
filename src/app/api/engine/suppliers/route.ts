/**
 * Engine-namespaced route: /api/engine/suppliers
 * @engine supplier-discovery
 *
 * Thin proxy to existing /api/admin/suppliers route.
 */

export { GET, POST } from '@/app/api/admin/suppliers/route';
