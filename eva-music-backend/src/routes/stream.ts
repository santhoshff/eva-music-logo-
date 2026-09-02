import { FastifyInstance } from 'fastify';
import { getStreamUrl } from '../services/youtubeMusic.js';
import { getCache, setCache } from '../services/cache.js';

export async function streamRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: ['GET', 'HEAD'],
    url: '/api/stream/:trackId',
    handler: async (request, reply) => {
      const { trackId } = request.params as { trackId: string };

      if (!trackId) {
        return reply.code(400).send({ error: 'trackId is required' });
      }

      // 1. Resolve Audio Stream URL
      let streamUrl = await getStreamUrl(trackId);

      if (!streamUrl) {
        // Safe guaranteed fallback preview from Apple Music
        streamUrl = 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/61/e5/73/61e57386-fcad-ea54-2e51-20d14f56880c/mzaf_4603457977202265048.plus.aac.p.m4a';
      }

      reply.header('Access-Control-Allow-Origin', '*');
      reply.header('Access-Control-Allow-Headers', '*');
      reply.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      reply.header('Accept-Ranges', 'bytes');

      if (request.method === 'HEAD') {
        reply.header('Content-Type', 'audio/mp4');
        return reply.code(200).send();
      }

      const range = request.headers.range;
      const upstreamHeaders: Record<string, string> = {};
      if (range) {
        upstreamHeaders['Range'] = range;
      }

      try {
        const upstream = await fetch(streamUrl, { headers: upstreamHeaders });

        const contentType = upstream.headers.get('content-type') ?? 'audio/mp4';
        const contentRange = upstream.headers.get('content-range');
        const contentLength = upstream.headers.get('content-length');

        reply.header('Content-Type', contentType);
        if (contentRange) reply.header('Content-Range', contentRange);
        if (contentLength) reply.header('Content-Length', contentLength);

        reply.code(upstream.status);
        const arrayBuffer = await upstream.arrayBuffer();
        return reply.send(Buffer.from(arrayBuffer));
      } catch (err: any) {
        console.error(`[stream] proxy fetch error for trackId=${trackId}:`, err);
        return reply.redirect(streamUrl);
      }
    },
  });
}
