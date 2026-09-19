/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to get Bearer Authorization headers for backend API requests
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };
    }
  } catch {
    // Return standard header if session unavailable
  }
  return { 'Content-Type': 'application/json' };
}

/**
 * Trigger Google OAuth sign in
 */
export async function signInWithGoogle() {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
}

/**
 * Derive a consistent, clean database handle for any user
 * This guarantees a unique profile row in Supabase PostgreSQL
 */
export function getUserHandle(email?: string, id?: string): string {
  const clean = (email || '').toLowerCase().trim();
  if (clean) {
    const slug = clean.replace(/[^a-z0-9]/g, '_').slice(0, 48);
    return `u_${slug}`;
  }
  if (id) {
    const slug = id.replace(/[^a-z0-9]/g, '_').slice(0, 48);
    return `u_${slug}`;
  }
  return 'u_guest';
}

/**
 * Fetch library data (both IDs and rich Track objects) partitioned strictly to a user
 */
export async function fetchUserLibraryData(
  userId?: string,
  userEmail?: string
): Promise<{ likedIds: string[]; likedTracks: any[] }> {
  try {
    const cleanEmail = (userEmail || '').toLowerCase().trim();
    const handle = getUserHandle(cleanEmail, userId);

    // 1. Primary: query profiles by handle (unique constraint)
    let { data, error } = await supabase
      .from('profiles')
      .select('bio, email, handle, id')
      .eq('handle', handle);

    // 2. Fallback: query by email if handle didn't return rows
    if ((!data || data.length === 0) && cleanEmail) {
      const emailQuery = await supabase
        .from('profiles')
        .select('bio, email, handle, id')
        .eq('email', cleanEmail);
      if (!emailQuery.error && emailQuery.data && emailQuery.data.length > 0) {
        data = emailQuery.data;
      }
    }

    if (data && data.length > 0) {
      for (const row of data) {
        if (row.bio) {
          try {
            const parsed = JSON.parse(row.bio);
            const likedIds: string[] = Array.isArray(parsed.likedTrackIds) ? parsed.likedTrackIds : [];
            const likedTracks: any[] = Array.isArray(parsed.likedTracks) ? parsed.likedTracks : [];
            return { likedIds, likedTracks };
          } catch {
            // Bio was not JSON, continue
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Supabase] Fetch library error:', err);
  }
  return { likedIds: [], likedTracks: [] };
}

/**
 * Fetch favorite track IDs specifically for a given user from Supabase
 */
export async function fetchUserFavoriteTrackIds(userId?: string, userEmail?: string): Promise<string[]> {
  const { likedIds } = await fetchUserLibraryData(userId, userEmail);
  return likedIds;
}

/**
 * Permanently save a user's library and liked songs to Supabase PostgreSQL Cloud
 */
export async function saveUserLibraryData(
  userId: string | undefined,
  userEmail: string | undefined,
  likedTrackIds: string[],
  likedTracks: any[] = [],
  userProfile?: any
): Promise<boolean> {
  try {
    const cleanEmail = (userEmail || '').toLowerCase().trim();
    if (!cleanEmail && !userId) return false;

    const handle = getUserHandle(cleanEmail, userId);
    const displayName = userProfile?.name || (cleanEmail ? cleanEmail.split('@')[0] : 'Member');
    const avatarUrl = userProfile?.avatarUrl || null;

    const payload: any = {
      handle,
      email: cleanEmail || null,
      name: displayName,
      bio: JSON.stringify({
        likedTrackIds,
        likedTracks,
        updatedAt: new Date().toISOString(),
      }),
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    };

    // Upsert into profiles using handle as conflict target (guaranteed unique constraint)
    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'handle' });

    if (error) {
      console.warn('[Supabase] Save library warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Save library error:', err);
    return false;
  }
}

/**
 * Backward-compatible helper for saving user favorites list
 */
export async function saveUserFavoritesList(
  userId: string,
  userEmail: string,
  likedTrackIds: string[],
  userProfile?: any,
  likedTracks: any[] = []
): Promise<boolean> {
  return saveUserLibraryData(userId, userEmail, likedTrackIds, likedTracks, userProfile);
}

/**
 * Single-track like/unlike helper with dual local + cloud persistence
 */
export async function saveUserFavorite(
  userId: string,
  track: { id: string; title: string; artist: string },
  isLiked: boolean,
  userEmail?: string,
  userProfile?: any
): Promise<boolean> {
  const email = (userEmail || '').toLowerCase().trim();
  const primaryKey = email ? `eva_user_${email}_likes` : `eva_user_${userId}_likes`;
  const fallbackKey = userId ? `eva_user_${userId}_likes` : '';

  try {
    const raw = localStorage.getItem(primaryKey) || (fallbackKey ? localStorage.getItem(fallbackKey) : null);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const nextList = isLiked
      ? Array.from(new Set([...list, track.id]))
      : list.filter((id) => id !== track.id);

    localStorage.setItem(primaryKey, JSON.stringify(nextList));
    if (fallbackKey && fallbackKey !== primaryKey) {
      localStorage.setItem(fallbackKey, JSON.stringify(nextList));
    }

    return await saveUserLibraryData(userId, email, nextList, [], userProfile);
  } catch {
    return false;
  }
}

/**
 * Sync user profile to Supabase database
 */
export async function syncUserProfileToSupabase(userProfile: any) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          handle: userProfile.handle,
          name: userProfile.name,
          email: userProfile.email,
          bio: userProfile.bio,
          avatar_url: userProfile.avatarUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'handle' }
      );

    if (error) {
      console.warn('Supabase profile sync warning:', error.message);
    }
    return data;
  } catch (err) {
    console.warn('Supabase connection note:', err);
  }
}
