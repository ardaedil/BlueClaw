import { createWatch, deleteWatch, listWatches, updateWatch } from '../watch/service.js';
import { prisma } from '../../db/client.js';

export async function handleOpenClawAction(action: string, payload: any) {
  switch (action) {
    case 'create_watch':
      return createWatch(payload);
    case 'list_watches': {
      const watches = await listWatches(payload?.userId);
      if (!payload?.activeOnly) return watches;
      return watches.filter((watch: { isActive: boolean }) => watch.isActive);
    }
    case 'update_watch':
      return updateWatch(payload.id, payload.data);
    case 'pause_watch':
      return updateWatch(payload.id, { isActive: false });
    case 'resume_watch':
      return updateWatch(payload.id, { isActive: true });
    case 'delete_watch':
      return deleteWatch(payload.id);
    case 'recent_matches':
      return prisma.seenListing.findMany({
        where: { watchJobId: payload.watchJobId },
        orderBy: { firstSeenAt: 'desc' },
        take: payload.limit ?? 10
      });
    default:
      throw new Error(`Unknown OpenClaw action: ${action}`);
  }
}
