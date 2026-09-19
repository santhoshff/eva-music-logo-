import { FastifyInstance } from 'fastify';
import { supabase } from '../db/supabaseClient.js';
import { verifyAuth } from '../middleware/auth.js';

export async function libraryRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyAuth);

  // --- PLAYLISTS ---
  fastify.get('/api/library/playlists', async (request, reply) => {
    const userId = request.user?.id;
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*, playlist_tracks(*)')
        .eq('owner_id', userId);

      if (error) {
        return reply.send({ playlists: [] });
      }
      return reply.send({ playlists: data || [] });
    } catch (err: any) {
      return reply.send({ playlists: [] });
    }
  });

  fastify.post('/api/library/playlists', async (request, reply) => {
    const userId = request.user?.id;
    const { name, description, isPublic, coverUrl } = request.body as any;

    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          owner_id: userId,
          name: name || 'My Playlist',
          description: description || '',
          is_public: !!isPublic,
          cover_url: coverUrl || '',
        })
        .select()
        .single();

      if (error) {
        return reply.code(400).send({ error: error.message });
      }
      return reply.send({ playlist: data });
    } catch (err: any) {
      return reply.code(500).send({ error: err.message });
    }
  });

  fastify.post('/api/library/playlists/:id/tracks', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { trackId, title, artist, thumbnailUrl, durationSeconds } = request.body as any;

    try {
      const { data, error } = await supabase
        .from('playlist_tracks')
        .insert({
          playlist_id: id,
          track_id: trackId,
          title,
          artist,
          thumbnail_url: thumbnailUrl,
          duration_seconds: durationSeconds || 200,
        })
        .select()
        .single();

      if (error) {
        return reply.code(400).send({ error: error.message });
      }
      return reply.send({ track: data });
    } catch (err: any) {
      return reply.code(500).send({ error: err.message });
    }
  });

  fastify.delete('/api/library/playlists/:id/tracks/:trackId', async (request, reply) => {
    const { id, trackId } = request.params as { id: string; trackId: string };
    try {
      const { error } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', id)
        .eq('track_id', trackId);

      if (error) {
        return reply.code(400).send({ error: error.message });
      }
      return reply.send({ success: true });
    } catch (err: any) {
      return reply.code(500).send({ error: err.message });
    }
  });

  // --- FAVORITES / LIKED SONGS ---
  fastify.get('/api/library/favorites', async (request, reply) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .limit(100);

      if (error) {
        return reply.send({ favorites: [] });
      }
      return reply.send({ favorites: data || [] });
    } catch {
      return reply.send({ favorites: [] });
    }
  });

  fastify.post('/api/library/favorites', async (request, reply) => {
    const { trackId, title, artist } = request.body as any;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .upsert({
          track_id: trackId,
          title: title || 'Track',
          artist: artist || 'Artist',
        })
        .select();

      if (error) {
        return reply.send({ success: true, note: error.message });
      }
      return reply.send({ success: true, favorite: data });
    } catch {
      return reply.send({ success: true });
    }
  });

  fastify.delete('/api/library/favorites/:trackId', async (request, reply) => {
    const { trackId } = request.params as { trackId: string };

    try {
      await supabase
        .from('favorites')
        .delete()
        .eq('track_id', trackId);

      return reply.send({ success: true });
    } catch {
      return reply.send({ success: true });
    }
  });

  // --- LISTENING HISTORY ---
  fastify.get('/api/library/history', async (request, reply) => {
    const userId = request.user?.id;
    try {
      const { data, error } = await supabase
        .from('listening_history')
        .select('*')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(30);

      if (error) {
        return reply.send({ history: [] });
      }
      return reply.send({ history: data || [] });
    } catch (err: any) {
      return reply.send({ history: [] });
    }
  });

  fastify.post('/api/library/history', async (request, reply) => {
    const userId = request.user?.id;
    const { trackId, title, artist, msPlayed } = request.body as any;

    try {
      const { data, error } = await supabase
        .from('listening_history')
        .insert({
          user_id: userId,
          track_id: trackId,
          title,
          artist,
          ms_played: msPlayed || 0,
        })
        .select()
        .single();

      if (error) {
        return reply.code(400).send({ error: error.message });
      }
      return reply.send({ record: data });
    } catch (err: any) {
      return reply.code(500).send({ error: err.message });
    }
  });
}
