import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';

export default function globalSetup() {
  const databaseUrl = process.env.DATABASE_URL ?? 'file:./prisma/blueclaw.test.db';
  process.env.DATABASE_URL = databaseUrl;

  const dbPrefix = 'file:';
  if (databaseUrl.startsWith(dbPrefix)) {
    const dbPath = databaseUrl.slice(dbPrefix.length);
    if (existsSync(dbPath)) {
      rmSync(dbPath, { force: true });
    }
  }

  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl
    }
  });
}
