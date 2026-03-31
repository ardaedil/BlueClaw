import { prisma } from '../../db/client.js';
import { createWatchSchema, updateWatchSchema } from './schemas.js';

function serializeArrays<T extends { preferredKeywords?: string[]; excludedKeywords?: string[]; conditionFilters?: string[] }>(input: T) {
  return {
    ...input,
    preferredKeywords: JSON.stringify(input.preferredKeywords ?? []),
    excludedKeywords: JSON.stringify(input.excludedKeywords ?? []),
    conditionFilters: JSON.stringify(input.conditionFilters ?? [])
  };
}

export async function createWatch(data: unknown) {
  const parsed = createWatchSchema.parse(data);
  return prisma.watchJob.create({ data: serializeArrays(parsed) });
}

export async function listWatches(userId?: string) {
  return prisma.watchJob.findMany({ where: userId ? { userId } : undefined, orderBy: { updatedAt: 'desc' } });
}

export async function getWatch(id: string) {
  return prisma.watchJob.findUnique({ where: { id }, include: { seenListings: { orderBy: { lastSeenAt: 'desc' }, take: 20 } } });
}

export async function updateWatch(id: string, data: unknown) {
  const parsed = updateWatchSchema.parse(data);
  return prisma.watchJob.update({ where: { id }, data: serializeArrays(parsed) });
}

export async function deleteWatch(id: string) {
  await prisma.watchJob.delete({ where: { id } });
}
