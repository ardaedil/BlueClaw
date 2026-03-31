import { describe, expect, test } from 'vitest';
import { scoreListing } from '../src/modules/scoring/scoring.js';

const watch: any = {
  maxPrice: 300,
  preferredKeywords: JSON.stringify(['ps5', 'console']),
  excludedKeywords: JSON.stringify(['parts']),
  conditionFilters: JSON.stringify(['Used', 'New']),
  sellerRatingThreshold: 95
};

describe('scoreListing', () => {
  test('scores high for strong listing', () => {
    const res = scoreListing(watch, {
      ebayItemId: '1',
      title: 'PS5 Console Used Excellent',
      price: 250,
      url: 'x',
      sellerName: 'trusted',
      sellerFeedbackPercent: 99,
      condition: 'Used',
      location: 'US',
      metadata: {}
    });
    expect(res.score).toBeGreaterThanOrEqual(80);
  });

  test('penalizes excluded keyword', () => {
    const res = scoreListing(watch, {
      ebayItemId: '2', title: 'PS5 for parts', price: 100, url: 'x', sellerName: 'y', metadata: {}
    });
    expect(res.score).toBeLessThan(70);
  });
});
