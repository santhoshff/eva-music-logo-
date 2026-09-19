import { FastifyInstance } from 'fastify';
import { searchYouTubeMusic } from '../services/youtubeMusic.js';

export async function searchRoutes(fastify: FastifyInstance) {
  fastify.get('/api/search', async (request, reply) => {
    const { q, type } = request.query as { q?: string; type?: string };
    if (!q || q.trim().length === 0) {
      return reply.code(400).send({ error: 'Query parameter "q" is required' });
    }

    try {
      const results = await searchYouTubeMusic(q.trim(), type || 'song');
      return reply.send({ query: q, type: type || 'song', results });
    } catch (err: any) {
      request.log.error(err);
      return reply.code(500).send({ error: 'Search failed', details: err?.message });
    }
  });
}
