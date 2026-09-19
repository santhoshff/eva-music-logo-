import { FastifyInstance } from 'fastify';
import { getSongShareLink } from '../services/odesli.js';

export async function shareRoutes(fastify: FastifyInstance) {
  fastify.get('/api/share/:trackId', async (request, reply) => {
    const { trackId } = request.params as { trackId: string };
    const { title, artist } = request.query as { title?: string; artist?: string };

    try {
      const shareData = await getSongShareLink(trackId, title, artist);
      return reply.send(shareData);
    } catch (err: any) {
      request.log.error(err);
      return reply.code(500).send({ error: 'Failed to resolve share link' });
    }
  });
}
