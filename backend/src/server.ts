import { config as loadDotenv } from 'dotenv';

import { createApp } from './app/create-app.js';
import { parseEnvironment } from './shared/config/environment.js';

loadDotenv({ quiet: true });

async function start(): Promise<void> {
  const config = parseEnvironment(process.env);
  const app = await createApp({ config });

  const close = async (): Promise<void> => {
    await app.close();
    process.exit(0);
  };
  process.once('SIGINT', () => void close());
  process.once('SIGTERM', () => void close());

  await app.listen({ host: config.host, port: config.port });
}

try {
  await start();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown startup failure';
  console.error(`Sofiie API failed to start: ${message}`);
  process.exitCode = 1;
}
