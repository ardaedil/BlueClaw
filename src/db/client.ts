import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
process.env.DATABASE_URL ??= 'file:./prisma/blueclaw.db';

export const prisma = new PrismaClient();
