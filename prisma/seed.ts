import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { id: 'demo-user' },
    update: {},
    create: { id: 'demo-user', name: 'Demo User' }
  });

  await prisma.watchJob.upsert({
    where: { id: 'demo-watch-ps5' },
    update: {},
    create: {
      id: 'demo-watch-ps5',
      userId: user.id,
      title: 'PS5 under $300',
      rawPrompt: 'Watch eBay for a PS5 under $300 and only Buy It Now',
      query: 'PlayStation 5',
      maxPrice: 300,
      preferredKeywords: JSON.stringify(['ps5', 'console', 'buy it now']),
      excludedKeywords: JSON.stringify(['parts', 'broken']),
      conditionFilters: JSON.stringify(['Used', 'New']),
      sellerRatingThreshold: 95,
      shippingPreferences: 'US only',
      notificationThreshold: 70,
      pollingIntervalMinutes: 30,
      isActive: true
    }
  });

  console.log('Seed complete');
}

main().finally(() => prisma.$disconnect());
