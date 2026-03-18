/**
 * Engine-namespaced route: /api/engine/discovery/scan
 * @engine discovery
 *
 * Thin proxy to existing /api/admin/scan route.
 * Provides v8-compliant engine namespace while maintaining backward compatibility.
 */

export { GET, POST } from '@/app/api/admin/scan/route';
