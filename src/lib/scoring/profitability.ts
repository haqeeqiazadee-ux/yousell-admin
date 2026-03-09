/**
 * Profitability Engine
 *
 * Calculates full cost structure and applies auto-rejection rules.
 * Auto-rejects if:
 * - Gross margin < 40%
 * - Shipping > 30% of retail price
 * - Break-even > 2 months at realistic velocity
 * - Hazardous/fragile/special cert required
 * - No USA supplier with < 15 day delivery
 */

export interface CostStructure {
  manufacturingCost: number;
  packagingCost: number;
  shippingCost: number;
  threePLFbaCost: number;
  paymentProcessing: number;  // typically 2.9% + $0.30
  marketplaceFees: number;
  influencerMarketing: number;
  paidAds: number;
}

export interface ProfitabilityInput {
  retailPrice: number;
  costs: CostStructure;
  monthlyVelocity: number;      // estimated units/month
  hasUsSupplier: boolean;
  supplierLeadTime: number;     // days
  isHazardous: boolean;
  isFragile: boolean;
  requiresSpecialCert: boolean;
}

export interface ProfitabilityResult {
  totalCost: number;
  grossMargin: number;          // percentage
  grossProfit: number;          // dollar amount per unit
  breakEvenUnits: number;
  breakEvenMonths: number;
  revenue30day: number;
  revenue60day: number;
  revenue90day: number;
  autoRejected: boolean;
  rejectionReasons: string[];
  riskFlags: string[];
}

export function calculateProfitability(input: ProfitabilityInput): ProfitabilityResult {
  const costs = input.costs;

  // Total cost per unit
  const totalCost =
    costs.manufacturingCost +
    costs.packagingCost +
    costs.shippingCost +
    costs.threePLFbaCost +
    (input.retailPrice * 0.029 + 0.30) + // payment processing
    costs.marketplaceFees +
    costs.influencerMarketing +
    costs.paidAds;

  // Margins
  const grossProfit = input.retailPrice - totalCost;
  const grossMargin = input.retailPrice > 0
    ? (grossProfit / input.retailPrice) * 100
    : 0;

  // Break-even (assuming fixed overhead of ~$500/month for tools/hosting)
  const monthlyOverhead = 500;
  const profitPerUnit = grossProfit;
  const breakEvenUnits = profitPerUnit > 0
    ? Math.ceil(monthlyOverhead / profitPerUnit)
    : 9999;
  const breakEvenMonths = input.monthlyVelocity > 0
    ? breakEvenUnits / input.monthlyVelocity
    : 99;

  // Revenue projections
  const monthlyRevenue = input.monthlyVelocity * input.retailPrice;
  const revenue30day = monthlyRevenue;
  const revenue60day = monthlyRevenue * 2;
  const revenue90day = monthlyRevenue * 3;

  // Risk flags
  const riskFlags: string[] = [];
  if (input.isFragile) riskFlags.push("fragile_high_return");
  if (input.isHazardous) riskFlags.push("hazardous_material");
  if (input.requiresSpecialCert) riskFlags.push("requires_certification");
  if (costs.shippingCost > input.retailPrice * 0.25) riskFlags.push("high_shipping_ratio");
  if (grossMargin < 50) riskFlags.push("thin_margins");

  // Auto-rejection rules
  const rejectionReasons: string[] = [];

  if (grossMargin < 40) {
    rejectionReasons.push(`Gross margin ${grossMargin.toFixed(1)}% is below 40% minimum`);
  }

  if (input.retailPrice > 0 && costs.shippingCost / input.retailPrice > 0.30) {
    rejectionReasons.push(
      `Shipping cost is ${((costs.shippingCost / input.retailPrice) * 100).toFixed(1)}% of retail (max 30%)`
    );
  }

  if (breakEvenMonths > 2) {
    rejectionReasons.push(
      `Break-even at ${breakEvenMonths.toFixed(1)} months exceeds 2-month maximum`
    );
  }

  if ((input.isHazardous || input.isFragile) && input.requiresSpecialCert) {
    rejectionReasons.push("Product is hazardous/fragile and requires special certification not obtained");
  }

  if (!input.hasUsSupplier || input.supplierLeadTime > 15) {
    rejectionReasons.push(
      `No USA supplier with <15 day delivery (current: ${input.supplierLeadTime} days)`
    );
  }

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    grossMargin: Math.round(grossMargin * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100,
    breakEvenUnits,
    breakEvenMonths: Math.round(breakEvenMonths * 10) / 10,
    revenue30day: Math.round(revenue30day),
    revenue60day: Math.round(revenue60day),
    revenue90day: Math.round(revenue90day),
    autoRejected: rejectionReasons.length > 0,
    rejectionReasons,
    riskFlags,
  };
}
