import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import dotenv from 'dotenv';

import { searchRoutes } from './routes/search.js';
import { streamRoutes } from './routes/stream.js';
import { libraryRoutes } from './routes/library.js';
import { downloadsRoutes } from './routes/downloads.js';
import { lyricsRoutes } from './routes/lyrics.js';
import { recommendationsRoutes } from './routes/recommendations.js';
import { shareRoutes } from './routes/share.js';
import { setupListenTogetherRealtime } from './realtime/listenTogether.js';

dotenv.config();

const server = Fastify({
  logger: true,
});

async function main() {
  await server.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  await server.register(websocket);

  // Register API Routes
  await server.register(searchRoutes);
  await server.register(streamRoutes);
  await server.register(libraryRoutes);
  await server.register(downloadsRoutes);
  await server.register(lyricsRoutes);
  await server.register(recommendationsRoutes);
  await server.register(shareRoutes);

  // Setup WebSocket Realtime
  setupListenTogetherRealtime(server);

  // Health check route
  server.get('/health', async () => {
    return { status: 'ok', service: 'EVA AI Music Backend', timestamp: new Date().toISOString() };
  });

  const port = parseInt(process.env.PORT || '8080', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await server.listen({ port, host });
    console.log(`🚀 EVA AI Music Backend running on http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
