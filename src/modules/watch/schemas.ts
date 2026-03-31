import { z } from 'zod';

const csvToArray = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((v) => {
    if (!v) return [];
    if (Array.isArray(v)) return v.filter(Boolean);
    return v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  });

export const createWatchSchema = z.object({
  userId: z.string(),
  title: z.string().min(2),
  rawPrompt: z.string().optional(),
  query: z.string().min(2),
  maxPrice: z.number().optional(),
  preferredKeywords: csvToArray,
  excludedKeywords: csvToArray,
  conditionFilters: csvToArray,
  sellerRatingThreshold: z.number().optional(),
  shippingPreferences: z.string().optional(),
  notificationThreshold: z.number().min(0).max(100).default(70),
  pollingIntervalMinutes: z.number().int().min(1).max(1440).default(30),
  isActive: z.boolean().default(true)
});

export const updateWatchSchema = createWatchSchema.partial();
