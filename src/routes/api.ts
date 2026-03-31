import { Router } from 'express';
import { z } from 'zod';
import { createWatch, deleteWatch, getWatch, listWatches, updateWatch } from '../modules/watch/service.js';
import { prisma } from '../db/client.js';
import { pollAllActiveWatches, pollWatch } from '../modules/polling/service.js';
import { handleOpenClawAction } from '../modules/openclaw/bridge.js';
import { env } from '../config/env.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => res.json({ ok: true }));
apiRouter.get('/settings', (_req, res) => res.json({ mockMode: env.EBAY_MOCK_MODE }));

apiRouter.post('/watches', async (req, res) => res.json(await createWatch(req.body)));
apiRouter.get('/watches', async (req, res) => res.json(await listWatches(req.query.userId as string | undefined)));
apiRouter.get('/watches/:id', async (req, res) => res.json(await getWatch(req.params.id)));
apiRouter.patch('/watches/:id', async (req, res) => res.json(await updateWatch(req.params.id, req.body)));
apiRouter.delete('/watches/:id', async (req, res) => {
  await deleteWatch(req.params.id);
  res.status(204).send();
});

apiRouter.get('/matches/recent', async (_req, res) => {
  const items = await prisma.seenListing.findMany({ orderBy: { firstSeenAt: 'desc' }, take: 50, include: { watchJob: true } });
  res.json(items);
});

apiRouter.get('/notifications', async (_req, res) => {
  const data = await prisma.matchNotification.findMany({ orderBy: { createdAt: 'desc' }, take: 50, include: { seenListing: true, watchJob: true } });
  res.json(data);
});

apiRouter.get('/poll-runs', async (_req, res) => {
  const data = await prisma.pollRun.findMany({ orderBy: { startedAt: 'desc' }, take: 50, include: { watchJob: true } });
  res.json(data);
});

apiRouter.post('/poll/:watchJobId/run', async (req, res) => res.json(await pollWatch(req.params.watchJobId)));
apiRouter.post('/poll/run-all', async (_req, res) => res.json(await pollAllActiveWatches()));

apiRouter.post('/openclaw/action', async (req, res) => {
  const parsed = z.object({ action: z.string(), payload: z.any().optional() }).parse(req.body);
  res.json(await handleOpenClawAction(parsed.action, parsed.payload));
});
