import { FastifyInstance } from 'fastify';
import { supabase } from '../db/supabaseClient.js';
import { verifyAuth } from '../middleware/auth.js';

export async function downloadsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyAuth);

  fastify.post('/api/downloads/:trackId', async (request, reply) => {
    const userId = request.user?.id;
    const { trackId } = request.params as { trackId: string };
    const { title, artist } = request.body as any || {};

    try {
      const storagePath = `users/${userId}/downloads/${trackId}.mp3`;
      const { data, error } = await supabase
        .from('downloads')
        .upsert({
          user_id: userId,
          track_id: trackId,
          title: title || 'Track',
          artist: artist || 'Artist',
          storage_path: storagePath,
          status: 'ready',
        })
        .select()
        .single();

      if (error) {
        return reply.code(400).send({ error: error.message });
      }
      return reply.send({ download: data, message: 'Download initiated and indexed' });
    } catch (err: any) {
      return reply.code(500).send({ error: err.message });
    }
  });

  fastify.get('/api/downloads', async (request, reply) => {
    const userId = request.user?.id;
    try {
      const { data, error } = await supabase
        .from('downloads')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        return reply.send({ downloads: [] });
      }
      return reply.send({ downloads: data || [] });
    } catch (err: any) {
      return reply.send({ downloads: [] });
    }
  });

  fastify.get('/api/downloads/:trackId/file', async (request, reply) => {
    const userId = request.user?.id;
    const { trackId } = request.params as { trackId: string };

    try {
      const { data, error } = await supabase
        .from('downloads')
        .select('storage_path')
        .eq('user_id', userId)
        .eq('track_id', trackId)
        .single();

      if (error || !data) {
        return reply.code(404).send({ error: 'Download record not found' });
      }

      // Redirect to audio stream API or Supabase signed URL
      return reply.redirect(`/api/stream/${trackId}`);
    } catch (err: any) {
      return reply.code(500).send({ error: err.message });
    }
  });
}
