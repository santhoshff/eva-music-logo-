import { FastifyInstance } from 'fastify';
import { getMotionCanvas } from '../services/appleCanvasProvider.js';

export async function canvasRoutes(fastify: FastifyInstance) {
  fastify.get('/api/canvas', async (request, reply) => {
    const { song, title, artist, album, storefront } = request.query as {
      song?: string;
      title?: string;
      artist?: string;
      album?: string;
      storefront?: string;
    };

    const trackName = song || title;
    if (!trackName || !artist) {
      return reply.code(400).send({
        error: 'Missing required parameters: song/title and artist are required',
      });
    }

    try {
      const canvas = await getMotionCanvas(trackName, artist, album, storefront || 'us');
      if (canvas) {
        return reply.send(canvas);
      } else {
        return reply.send({ found: false, message: 'No motion canvas available for this track' });
      }
    } catch (err: any) {
      request.log.error(err);
      return reply.code(500).send({ error: 'Canvas fetch failed', details: err?.message });
    }
  });
}
