import type { NormalizedListing } from '../watch/types.js';

export function normalizeEbayListing(raw: any): NormalizedListing {
  return {
    ebayItemId: raw.itemId,
    title: raw.title ?? 'Untitled listing',
    price: raw.price?.value ? Number(raw.price.value) : undefined,
    url: raw.itemWebUrl ?? '#',
    sellerName: raw.seller?.username,
    sellerFeedbackPercent: raw.seller?.feedbackPercentage ? Number(raw.seller.feedbackPercentage) : undefined,
    condition: raw.condition,
    location: raw.itemLocation?.country,
    buyItNow: raw.buyingOptions?.includes('FIXED_PRICE'),
    metadata: raw
  };
}
