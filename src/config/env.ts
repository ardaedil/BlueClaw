import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().default('file:./blueclaw.db'),
  EBAY_CLIENT_ID: z.string().optional(),
  EBAY_CLIENT_SECRET: z.string().optional(),
  EBAY_MARKETPLACE_ID: z.string().default('EBAY_US'),
  EBAY_MOCK_MODE: z.coerce.boolean().default(true),
  EBAY_MOCK_FILE: z.string().default('src/mocks/ebay-search-response.json'),
  SCHEDULER_ENABLED: z.coerce.boolean().default(true),
  OPENCLAW_WEBHOOK_URL: z.string().optional()
});

export const env = schema.parse(process.env);
