/**
 * Engine-namespaced route: /api/engine/allocations
 * @engine client-allocation
 *
 * Thin proxy to existing /api/admin/allocations route.
 */

export { GET, POST } from '@/app/api/admin/allocations/route';
