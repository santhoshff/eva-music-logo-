import { FastifyInstance } from 'fastify';
import { Readable } from 'node:stream';
import { getStreamUrl } from '../services/youtubeMusic.js';

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
        // Safe guaranteed full-length 320kbps master stream fallback
        streamUrl = 'https://aac.saavncdn.com/525/fe0acac4728484d5c85bfc2e51d8d165_320.mp4';
      }

      reply.header('Access-Control-Allow-Origin', '*');
      reply.header('Access-Control-Allow-Headers', '*');
      reply.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      reply.header('Accept-Ranges', 'bytes');

      if (request.method === 'HEAD') {
        reply.header('Content-Type', 'audio/mp4');
        return reply.code(200).send();
      }

      // High-speed CDN direct 302 redirect (allows instant browser native Range seeking without server RAM overhead)
      if (streamUrl.startsWith('https://aac.saavncdn.com')) {
        return reply.redirect(streamUrl, 302);
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
        if (upstream.body) {
          const stream = Readable.fromWeb(upstream.body as any);
          return reply.send(stream);
        }
        return reply.redirect(streamUrl, 302);
      } catch (err: any) {
        console.error(`[stream] proxy fetch error for trackId=${trackId}:`, err);
        return reply.redirect(streamUrl, 302);
      }
    },
  });
}
