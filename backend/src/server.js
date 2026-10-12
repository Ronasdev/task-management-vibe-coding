import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { createApp } from './app.js';

async function start() {
  await connectDB();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`🚀 API démarrée sur le port ${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} reçu, arrêt en cours…`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    // Arrêt forcé si des connexions traînent
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

start().catch((err) => {
  console.error('❌ Échec du démarrage :', err.message);
  process.exit(1);
});
