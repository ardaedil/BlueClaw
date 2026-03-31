import type { WatchJob } from '@prisma/client';
import type { NormalizedListing, ScoreReason, ScoreResult } from '../watch/types.js';

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function scoreListing(watch: WatchJob, listing: NormalizedListing): ScoreResult {
  const reasons: ScoreReason[] = [];
  let score = 50;
  const title = listing.title.toLowerCase();

  if (watch.maxPrice && listing.price !== undefined) {
    if (listing.price <= watch.maxPrice) {
      score += 20;
      reasons.push({ type: 'price', impact: 20, detail: `Price $${listing.price} is under $${watch.maxPrice}` });
    } else {
      score -= 25;
      reasons.push({ type: 'price', impact: -25, detail: `Price $${listing.price} is over target` });
    }
  }

  const preferred = parseJsonArray(watch.preferredKeywords);
  const excluded = parseJsonArray(watch.excludedKeywords);
  const conditions = parseJsonArray(watch.conditionFilters);

  const preferredMatches = preferred.filter((k) => title.includes(k.toLowerCase()));
  if (preferredMatches.length > 0) {
    const boost = Math.min(20, preferredMatches.length * 7);
    score += boost;
    reasons.push({ type: 'preferred_keyword', impact: boost, detail: `Matched keywords: ${preferredMatches.join(', ')}` });
  }

  const excludedMatches = excluded.filter((k) => title.includes(k.toLowerCase()));
  if (excludedMatches.length > 0) {
    score -= 40;
    reasons.push({ type: 'excluded_keyword', impact: -40, detail: `Contains excluded: ${excludedMatches.join(', ')}` });
  }

  if (conditions.length > 0 && listing.condition) {
    if (conditions.some((c) => listing.condition?.toLowerCase().includes(c.toLowerCase()))) {
      score += 10;
      reasons.push({ type: 'condition', impact: 10, detail: `Condition matches: ${listing.condition}` });
    } else {
      score -= 8;
      reasons.push({ type: 'condition', impact: -8, detail: `Condition outside preference: ${listing.condition}` });
    }
  }

  if (watch.sellerRatingThreshold && listing.sellerFeedbackPercent !== undefined) {
    if (listing.sellerFeedbackPercent >= watch.sellerRatingThreshold) {
      score += 10;
      reasons.push({ type: 'seller_rating', impact: 10, detail: `Seller ${listing.sellerFeedbackPercent}% >= threshold` });
    } else {
      score -= 15;
      reasons.push({ type: 'seller_rating', impact: -15, detail: `Seller ${listing.sellerFeedbackPercent}% < threshold` });
    }
  }

  if (!listing.price || !listing.sellerName) {
    score -= 8;
    reasons.push({ type: 'data_quality', impact: -8, detail: 'Listing has incomplete metadata' });
  }

  score = Math.max(0, Math.min(100, score));
  const explanation = reasons.slice(0, 2).map((r) => r.detail).join(' • ') || 'Neutral listing match';
  return { score, explanation, reasons };
}
