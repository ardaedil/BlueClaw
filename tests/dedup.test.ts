import { beforeAll, describe, expect, test } from 'vitest';
import { prisma } from '../src/db/client.js';
import { isDuplicate } from '../src/modules/dedup/deduplication.js';

beforeAll(async () => {
  await prisma.user.upsert({ where: { id: 'u-dedup' }, update: {}, create: { id: 'u-dedup', name: 'Dedup' } });
  await prisma.watchJob.upsert({ where: { id: 'w-dedup' }, update: {}, create: { id: 'w-dedup', userId: 'u-dedup', title: 't', query: 'q' } });
  await prisma.seenListing.upsert({
    where: { watchJobId_ebayItemId: { watchJobId: 'w-dedup', ebayItemId: 'abc' } },
    update: {},
    create: { watchJobId: 'w-dedup', ebayItemId: 'abc', title: 't', url: 'u' }
  });
});

describe('isDuplicate', () => {
  test('returns true for seen item', async () => {
    await expect(isDuplicate('w-dedup', 'abc')).resolves.toBe(true);
  });
  test('returns false for unseen item', async () => {
    await expect(isDuplicate('w-dedup', 'new')).resolves.toBe(false);
  });
});
