import { FastifyInstance } from 'fastify';
import { getRelatedRecommendations } from '../services/youtubeMusic.js';

export async function recommendationsRoutes(fastify: FastifyInstance) {
  fastify.get('/api/recommendations', async (request, reply) => {
    const { trackId } = request.query as { trackId?: string };
    try {
      const recommendations = await getRelatedRecommendations(trackId);
      return reply.send({ recommendations });
    } catch (err: any) {
      request.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch recommendations' });
    }
  });
}
