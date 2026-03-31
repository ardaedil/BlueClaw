import { beforeAll, describe, expect, test } from 'vitest';
import { prisma } from '../src/db/client.js';
import { pollWatch } from '../src/modules/polling/service.js';

beforeAll(async () => {
  await prisma.user.upsert({ where: { id: 'u-poll' }, update: {}, create: { id: 'u-poll', name: 'Poll User' } });
  await prisma.watchJob.upsert({
    where: { id: 'w-poll' },
    update: {},
    create: {
      id: 'w-poll', userId: 'u-poll', title: 'PS5', query: 'PS5',
      preferredKeywords: JSON.stringify(['ps5']), excludedKeywords: JSON.stringify(['parts']), conditionFilters: JSON.stringify(['Used']),
      maxPrice: 300, notificationThreshold: 70
    }
  });
});

describe('polling cycle', () => {
  test('creates matches and notifications in mock mode', async () => {
    const run = await pollWatch('w-poll');
    expect(run.success).toBe(true);
    const notifications = await prisma.matchNotification.findMany({ where: { watchJobId: 'w-poll' } });
    expect(notifications.length).toBeGreaterThan(0);
  });

  test('suppresses duplicates on second run', async () => {
    const first = await prisma.seenListing.count({ where: { watchJobId: 'w-poll' } });
    await pollWatch('w-poll');
    const second = await prisma.seenListing.count({ where: { watchJobId: 'w-poll' } });
    expect(second).toBe(first);
  });
});
