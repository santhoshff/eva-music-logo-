/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Sync liked songs and user profile to Supabase database
 */
export async function syncUserProfileToSupabase(userProfile: any) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        handle: userProfile.handle,
        name: userProfile.name,
        email: userProfile.email,
        bio: userProfile.bio,
        avatar_url: userProfile.avatarUrl,
        updated_at: new Date().toISOString()
      }, { onConflict: 'handle' });

    if (error) {
      console.warn('Supabase profile sync warning:', error.message);
    }
    return data;
  } catch (err) {
    console.warn('Supabase connection note:', err);
  }
}

export async function syncLikedSongToSupabase(track: any, isLiked: boolean) {
  try {
    if (isLiked) {
      await supabase.from('liked_songs').upsert({
        track_id: track.id,
        title: track.title,
        artist: track.artist,
        cover_url: track.coverUrl,
        audio_url: track.audioUrl,
        created_at: new Date().toISOString()
      }, { onConflict: 'track_id' });
    } else {
      await supabase.from('liked_songs').delete().eq('track_id', track.id);
    }
  } catch (err) {
    console.warn('Supabase liked song sync note:', err);
  }
}
