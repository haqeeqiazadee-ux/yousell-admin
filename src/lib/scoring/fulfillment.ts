/**
 * Fulfillment Recommendation Engine (v8 spec Section 2.4)
 *
 * Decision tree that recommends DROPSHIP / WHOLESALE / POD / DIGITAL / AFFILIATE
 * based on product attributes, price thresholds, and platform constraints.
 */

export type FulfillmentType = 'DROPSHIP' | 'WHOLESALE' | 'POD' | 'DIGITAL' | 'AFFILIATE' | 'MANUAL_REVIEW';

export interface FulfillmentInput {
  price: number;
  category?: string;
  source?: string;   // tiktok | amazon | shopify | pinterest | digital | affiliate
  isPhysical?: boolean;
  isCustomDesign?: boolean;
  isDigitalProduct?: boolean;
  isSaaS?: boolean;
  hasDropshipSupplier?: boolean;
  demandSignalStrength?: number; // 0-100
}

export interface FulfillmentRecommendation {
  primary: FulfillmentType;
  alternatives: FulfillmentType[];
  reasoning: string;
  marginComparison: {
    type: FulfillmentType;
    estimatedMargin: string;
    upfrontCost: string;
    timeToMarket: string;
  }[];
  platformConstraints: string[];
}

export function recommendFulfillment(input: FulfillmentInput): FulfillmentRecommendation {
  const constraints: string[] = [];
  const alternatives: FulfillmentType[] = [];

  // Platform-specific constraints
  if (input.source === 'tiktok') {
    constraints.push('TikTok Shop: Must ship within 2-3 days. US-based fulfillment only.');
  }
  if (input.source === 'amazon') {
    constraints.push('Amazon FBA: Must be seller of record. No third-party branding.');
  }

  // Digital products → DIGITAL
  if (input.isDigitalProduct || input.source === 'digital') {
    return buildResult('DIGITAL', alternatives, 'Digital product — no physical fulfillment needed.', constraints);
  }

  // SaaS / subscription → AFFILIATE
  if (input.isSaaS || input.source === 'affiliate') {
    return buildResult('AFFILIATE', alternatives, 'SaaS/subscription product — affiliate commission model.', constraints);
  }

  // Custom design / apparel → POD
  if (input.isCustomDesign) {
    if (input.source !== 'amazon') {
      return buildResult('POD', ['DROPSHIP'], 'Custom design product — print-on-demand recommended.', constraints);
    }
    constraints.push('Amazon: POD requires Merch by Amazon or FBA from POD supplier.');
    return buildResult('POD', ['WHOLESALE'], 'Custom design for Amazon — POD via Merch or FBA.', constraints);
  }

  // Physical products — price-based decision tree
  const isPhysical = input.isPhysical !== false; // Default to physical
  if (isPhysical) {
    // < $30 → DROPSHIP
    if (input.price < 30) {
      if (input.source === 'tiktok') {
        constraints.push('TikTok: Must use US-based dropship supplier (no AliExpress direct).');
      }
      if (input.hasDropshipSupplier) {
        return buildResult('DROPSHIP', ['WHOLESALE'], 'Physical product under $30 with available dropship supplier.', constraints);
      }
      return buildResult('DROPSHIP', [], 'Physical product under $30 — dropship recommended for low risk.', constraints);
    }

    // $30-100 → WHOLESALE (if demand signals strong)
    if (input.price <= 100) {
      const highDemand = (input.demandSignalStrength ?? 0) >= 60;
      if (highDemand) {
        alternatives.push('DROPSHIP');
        if (input.hasDropshipSupplier) {
          return buildResult('WHOLESALE', ['DROPSHIP'], 'Physical $30-100 with strong demand — wholesale for better margins. Dropship also viable.', constraints);
        }
        return buildResult('WHOLESALE', alternatives, 'Physical $30-100 with strong demand — wholesale recommended.', constraints);
      }
      // Lower demand: start with dropship to validate
      return buildResult('DROPSHIP', ['WHOLESALE'], 'Physical $30-100 — start with dropship to validate demand, then consider wholesale.', constraints);
    }

    // > $100 → WHOLESALE ONLY
    return buildResult('WHOLESALE', [], 'Physical product over $100 — wholesale only (margins justify bulk purchase).', constraints);
  }

  // Fallback: unknown/mixed → flag for manual review
  return buildResult('MANUAL_REVIEW', [], 'Product type unclear — flagged for admin manual review.', constraints);
}

function buildResult(
  primary: FulfillmentType,
  alternatives: FulfillmentType[],
  reasoning: string,
  constraints: string[],
): FulfillmentRecommendation {
  return {
    primary,
    alternatives,
    reasoning,
    marginComparison: getMarginComparison(primary, alternatives),
    platformConstraints: constraints,
  };
}

function getMarginComparison(primary: FulfillmentType, alternatives: FulfillmentType[]) {
  const all = [primary, ...alternatives];
  const margins: Record<FulfillmentType, { margin: string; upfront: string; time: string }> = {
    DROPSHIP:       { margin: '10-30%', upfront: '$0',            time: 'Days' },
    WHOLESALE:      { margin: '30-50%', upfront: '$500-5,000',    time: 'Weeks' },
    POD:            { margin: '30-60%', upfront: '$0',            time: 'Days' },
    DIGITAL:        { margin: '80-97%', upfront: '$0',            time: 'Days' },
    AFFILIATE:      { margin: '1-45%',  upfront: '$0',            time: 'Immediate' },
    MANUAL_REVIEW:  { margin: 'TBD',    upfront: 'TBD',          time: 'TBD' },
  };
  return all.map(type => ({
    type,
    estimatedMargin: margins[type].margin,
    upfrontCost: margins[type].upfront,
    timeToMarket: margins[type].time,
  }));
}
