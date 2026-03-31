import { prisma } from '../../db/client.js';
import { searchListings } from '../ebay/client.js';
import { isDuplicate } from '../dedup/deduplication.js';
import { scoreListing } from '../scoring/scoring.js';
import { createNotification } from '../notifications/service.js';

export async function pollWatch(watchJobId: string) {
  const watch = await prisma.watchJob.findUnique({ where: { id: watchJobId } });
  if (!watch) throw new Error('Watch not found');

  const pollRun = await prisma.pollRun.create({ data: { watchJobId, success: false } });

  try {
    const listings = await searchListings(watch.query, watch.maxPrice ?? undefined);
    let newListingCount = 0;
    let notifiedCount = 0;

    for (const listing of listings) {
      if (await isDuplicate(watch.id, listing.ebayItemId)) {
        await prisma.seenListing.update({
          where: { watchJobId_ebayItemId: { watchJobId: watch.id, ebayItemId: listing.ebayItemId } },
          data: { lastSeenAt: new Date() }
        });
        continue;
      }

      const scored = scoreListing(watch, listing);
      const seen = await prisma.seenListing.create({
        data: {
          watchJobId: watch.id,
          ebayItemId: listing.ebayItemId,
          title: listing.title,
          price: listing.price,
          url: listing.url,
          sellerName: listing.sellerName,
          sellerFeedbackPercent: listing.sellerFeedbackPercent,
          condition: listing.condition,
          location: listing.location,
          lastScore: scored.score,
          lastScoreExplanation: scored.explanation,
          metadataJson: JSON.stringify(listing.metadata)
        }
      });

      newListingCount += 1;
      if (scored.score >= watch.notificationThreshold) {
        await createNotification({
          watchJobId: watch.id,
          seenListingId: seen.id,
          score: scored.score,
          explanation: scored.explanation,
          reasons: scored.reasons
        });
        notifiedCount += 1;
      }
    }

    await prisma.watchJob.update({ where: { id: watch.id }, data: { lastPolledAt: new Date() } });
    return prisma.pollRun.update({
      where: { id: pollRun.id },
      data: {
        success: true,
        completedAt: new Date(),
        resultCount: listings.length,
        newListingCount,
        notifiedCount
      }
    });
  } catch (error) {
    return prisma.pollRun.update({
      where: { id: pollRun.id },
      data: {
        success: false,
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}

export async function pollAllActiveWatches() {
  const watches = await prisma.watchJob.findMany({ where: { isActive: true } });
  const results = [];
  for (const watch of watches) {
    results.push(await pollWatch(watch.id));
  }
  return results;
}
