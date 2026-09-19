import { FastifyInstance } from 'fastify';
import { fetchTrackLyrics } from '../services/lyricsProvider.js';

export async function lyricsRoutes(fastify: FastifyInstance) {
  fastify.get('/api/lyrics/:trackId', async (request, reply) => {
    const { trackId } = request.params as { trackId: string };
    const { title, artist } = request.query as { title?: string; artist?: string };

    if (!trackId) {
      return reply.code(400).send({ error: 'trackId parameter is required' });
    }

    try {
      const lyricsData = await fetchTrackLyrics(trackId, title, artist);
      return reply.send(lyricsData);
    } catch (err: any) {
      request.log.error(err);
      return reply.code(500).send({ error: 'Lyrics fetch failed', details: err?.message });
    }
  });
}
