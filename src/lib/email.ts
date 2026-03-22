import { getCircuitBreaker } from '@/lib/circuit-breaker';
import { engineLogger } from '@/lib/logger';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yousell.online';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@yousell.online';
const log = engineLogger('resend');
const breaker = () => getCircuitBreaker('resend');

// --- Notification batching: max 3 alert emails per day ---
const MAX_ALERTS_PER_DAY = 3;
let alertsSentToday = 0;
let alertResetDate = new Date().toDateString();

function canSendAlert(): boolean {
  const today = new Date().toDateString();
  if (today !== alertResetDate) {
    alertsSentToday = 0;
    alertResetDate = today;
  }
  if (alertsSentToday >= MAX_ALERTS_PER_DAY) {
    log.warn('Daily alert limit reached, skipping email', { limit: MAX_ALERTS_PER_DAY });
    return false;
  }
  alertsSentToday++;
  return true;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface ScanResult {
  scanId: string;
  mode: string;
  totalProducts: number;
  platforms: string[];
  duration: number;
}

interface ProductAlertData {
  title: string;
  price: number;
  viral_score: number;
  source: string;
  url: string;
}

export async function sendScanCompleteAlert(result: ScanResult): Promise<void> {
  if (!RESEND_API_KEY) {
    log.warn('RESEND_API_KEY not set, skipping email alert');
    return;
  }

  try {
    await breaker().execute(async () => {
      log.info('Sending scan complete alert', { scanId: result.scanId, products: result.totalProducts });
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `Scan Complete: ${escapeHtml(result.mode)} - ${result.totalProducts} products found`,
          html: `
            <h2>Scan Complete</h2>
            <p><strong>Scan ID:</strong> ${escapeHtml(result.scanId)}</p>
            <p><strong>Mode:</strong> ${escapeHtml(result.mode)}</p>
            <p><strong>Products Found:</strong> ${result.totalProducts}</p>
            <p><strong>Platforms:</strong> ${escapeHtml(result.platforms.join(', '))}</p>
            <p><strong>Duration:</strong> ${result.duration}ms</p>
          `,
        }),
      });
      if (!res.ok) throw new Error(`Resend API error: ${res.status}`);
    });
  } catch (error) {
    log.error('Failed to send scan complete email', { error, scanId: result.scanId });
  }
}

export async function sendProductAlert(product: ProductAlertData): Promise<void> {
  if (!RESEND_API_KEY) {
    log.warn('RESEND_API_KEY not set, skipping product alert');
    return;
  }

  if (!canSendAlert()) return;

  try {
    await breaker().execute(async () => {
      log.info('Sending product alert', { title: product.title, viralScore: product.viral_score });
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `Viral Product Alert: ${escapeHtml(product.title)}`,
          html: `
            <h2>Viral Product Detected</h2>
            <p><strong>Title:</strong> ${escapeHtml(product.title)}</p>
            <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
            <p><strong>Viral Score:</strong> ${product.viral_score}/100</p>
            <p><strong>Source:</strong> ${escapeHtml(product.source)}</p>
            <p><a href="${escapeHtml(product.url)}">View Product</a></p>
          `,
        }),
      });
      if (!res.ok) throw new Error(`Resend API error: ${res.status}`);
    });
  } catch (error) {
    log.error('Failed to send product alert email', { error, title: product.title });
  }
}
