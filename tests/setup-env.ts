import dotenv from 'dotenv';

dotenv.config({ path: '.env.test', override: true });

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'file:./prisma/blueclaw.test.db';
process.env.EBAY_MOCK_MODE ??= 'true';
