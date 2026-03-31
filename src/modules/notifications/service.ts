import { prisma } from '../../db/client.js';
import { env } from '../../config/env.js';

export async function createNotification(params: {
  watchJobId: string;
  seenListingId: string;
  score: number;
  explanation: string;
  reasons: unknown;
}) {
  const notification = await prisma.matchNotification.create({
    data: {
      watchJobId: params.watchJobId,
      seenListingId: params.seenListingId,
      score: params.score,
      explanation: params.explanation,
      reasonsJson: JSON.stringify(params.reasons)
    }
  });

  if (env.OPENCLAW_WEBHOOK_URL) {
    try {
      await fetch(env.OPENCLAW_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'blueclaw.match_alert',
          payload: {
            notificationId: notification.id,
            watchJobId: params.watchJobId,
            score: params.score,
            explanation: params.explanation
          }
        })
      });
      await prisma.matchNotification.update({ where: { id: notification.id }, data: { wasDelivered: true, deliveredAt: new Date() } });
    } catch {
      // Non-fatal in demo mode; retries would be added for production.
    }
  }

  return notification;
}
