import cron from 'node-cron';
import { prisma } from '../../db/client.js';
import { pollWatch } from './service.js';

export function startScheduler() {
  return cron.schedule('*/1 * * * *', async () => {
    const now = Date.now();
    const watches = await prisma.watchJob.findMany({ where: { isActive: true } });
    for (const watch of watches) {
      const last = watch.lastPolledAt?.getTime() ?? 0;
      const due = now - last >= watch.pollingIntervalMinutes * 60 * 1000;
      if (due) await pollWatch(watch.id);
    }
  });
}
