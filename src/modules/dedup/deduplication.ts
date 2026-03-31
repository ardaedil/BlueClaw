import { prisma } from '../../db/client.js';

export async function isDuplicate(watchJobId: string, ebayItemId: string) {
  const existing = await prisma.seenListing.findUnique({
    where: { watchJobId_ebayItemId: { watchJobId, ebayItemId } }
  });
  return Boolean(existing);
}
