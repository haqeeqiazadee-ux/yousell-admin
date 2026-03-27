/**
 * Engine-namespaced route: /api/engine/profitability
 * @engine profitability
 *
 * Thin proxy to existing /api/admin/financial route.
 */

export { GET, POST } from '@/app/api/admin/financial/route';
