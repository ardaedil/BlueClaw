import fs from 'node:fs/promises';
import { env } from '../../config/env.js';
import { normalizeEbayListing } from './normalization.js';
import type { NormalizedListing } from '../watch/types.js';

let accessTokenCache: { token: string; expiresAt: number } | undefined;

async function getEbayToken() {
  if (accessTokenCache && Date.now() < accessTokenCache.expiresAt) return accessTokenCache.token;
  if (!env.EBAY_CLIENT_ID || !env.EBAY_CLIENT_SECRET) throw new Error('Missing eBay credentials');

  const auth = Buffer.from(`${env.EBAY_CLIENT_ID}:${env.EBAY_CLIENT_SECRET}`).toString('base64');
  const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope'
  });

  if (!response.ok) throw new Error(`Failed to get eBay token: ${response.statusText}`);
  const json = (await response.json()) as { access_token: string; expires_in: number };
  accessTokenCache = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 - 60000 };
  return json.access_token;
}

export async function searchListings(query: string, maxPrice?: number): Promise<NormalizedListing[]> {
  if (env.EBAY_MOCK_MODE) {
    const data = JSON.parse(await fs.readFile(env.EBAY_MOCK_FILE, 'utf-8')) as { itemSummaries?: unknown[] };
    return (data.itemSummaries ?? []).map((item) => normalizeEbayListing(item));
  }

  const token = await getEbayToken();
  const params = new URLSearchParams({ q: query, limit: '50' });
  if (maxPrice) params.append('filter', `price:[..${maxPrice}]`);

  // For production, apply growth-check/rate-limit strategy with backoff + queued polling.
  const response = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': env.EBAY_MARKETPLACE_ID
    }
  });

  if (!response.ok) throw new Error(`eBay Browse API failed: ${response.status}`);
  const json = (await response.json()) as { itemSummaries?: unknown[] };
  return (json.itemSummaries ?? []).map((item) => normalizeEbayListing(item));
}
