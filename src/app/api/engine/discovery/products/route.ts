/**
 * Engine-namespaced route: /api/engine/discovery/products
 * @engine discovery
 *
 * Thin proxy to existing /api/admin/products route.
 * Provides v8-compliant engine namespace while maintaining backward compatibility.
 */

export { GET, POST } from '@/app/api/admin/products/route';
