import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { apiRouter } from './routes/api.js';
import { startScheduler } from './modules/polling/scheduler.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/', express.static(path.join(__dirname, '..', 'dashboard')));

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(400).json({ error: error.message ?? 'Unknown error' });
});

app.listen(env.PORT, () => {
  console.log(`BlueClaw listening on http://localhost:${env.PORT}`);
});

if (env.SCHEDULER_ENABLED) startScheduler();
