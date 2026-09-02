import dotenv from 'dotenv';
import { supabase } from '../db/supabaseClient.js';

dotenv.config();

const SEED_TRACKS = [
  {
    track_id: 'tamil-1',
    title: 'God Mode (From "Karuppu")',
    artist: 'Sai Abhyankkar & Gana Muthu',
    thumbnail_url: 'https://c.saavncdn.com/083/God-Mode-From-Karuppu-Tamil-2025-20250129181105-500x500.jpg',
    duration_seconds: 218,
    audio_url: '/api/stream/tamil-1'
  },
  {
    track_id: 'tamil-2',
    title: 'Katchi Sera',
    artist: 'Sai Abhyankkar',
    thumbnail_url: 'https://c.saavncdn.com/718/Katchi-Sera-Tamil-2024-20240122170311-500x500.jpg',
    duration_seconds: 190,
    audio_url: '/api/stream/tamil-2'
  },
  {
    track_id: 'tamil-3',
    title: 'Aasa Kooda',
    artist: 'Sai Abhyankkar & Sai Smriti',
    thumbnail_url: 'https://c.saavncdn.com/533/Aasa-Kooda-From-Think-Indie-Tamil-2024-20240613180907-500x500.jpg',
    duration_seconds: 225,
    audio_url: '/api/stream/tamil-3'
  },
  {
    track_id: 'tamil-4',
    title: 'Naa Ready (From "Leo")',
    artist: 'Thalapathy Vijay & Anirudh Ravichander',
    thumbnail_url: 'https://c.saavncdn.com/165/Leo-Tamil-2023-20231019183424-500x500.jpg',
    duration_seconds: 248,
    audio_url: '/api/stream/tamil-4'
  },
  {
    track_id: 'tamil-5',
    title: 'Hukum - Thalaivar Alappara (From "Jailer")',
    artist: 'Anirudh Ravichander',
    thumbnail_url: 'https://c.saavncdn.com/665/Jailer-Tamil-2023-20230728183141-500x500.jpg',
    duration_seconds: 207,
    audio_url: '/api/stream/tamil-5'
  },
  {
    track_id: 'global-1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    duration_seconds: 200,
    audio_url: '/api/stream/global-1'
  },
  {
    track_id: 'global-2',
    title: 'Starboy',
    artist: 'The Weeknd & Daft Punk',
    thumbnail_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    duration_seconds: 230,
    audio_url: '/api/stream/global-2'
  },
  {
    track_id: 'hindi-1',
    title: 'Kesariya (From "Brahmastra")',
    artist: 'Arijit Singh & Pritam',
    thumbnail_url: 'https://c.saavncdn.com/191/Kesariya-From-Brahmastra-Hindi-2022-20220717092820-500x500.jpg',
    duration_seconds: 268,
    audio_url: '/api/stream/hindi-1'
  },
  {
    track_id: 'south-1',
    title: 'Big Dawgs',
    artist: 'Hanumankind & Kalmi',
    thumbnail_url: 'https://c.saavncdn.com/159/Big-Dawgs-English-2024-20240710183305-500x500.jpg',
    duration_seconds: 234,
    audio_url: '/api/stream/south-1'
  }
];

async function seed() {
  console.log('🌱 Starting EVA Music Songs Installation / Seeding...');

  try {
    // 1. Seed Featured Playlist
    const { data: playlist, error: plError } = await supabase
      .from('playlists')
      .upsert({
        name: 'Top Tamil & Global Chart Hits 2025 🔥',
        description: 'Installed core catalog for EVA AI Music Streaming',
        is_public: true,
        cover_url: 'https://c.saavncdn.com/083/God-Mode-From-Karuppu-Tamil-2025-20250129181105-500x500.jpg',
      })
      .select()
      .single();

    if (plError) {
      console.warn('Playlist seed note:', plError.message);
    } else {
      console.log('✅ Created/Verified Playlist:', playlist?.name);

      if (playlist?.id) {
        for (let i = 0; i < SEED_TRACKS.length; i++) {
          const t = SEED_TRACKS[i];
          const { error: trkError } = await supabase
            .from('playlist_tracks')
            .upsert({
              playlist_id: playlist.id,
              track_id: t.track_id,
              title: t.title,
              artist: t.artist,
              thumbnail_url: t.thumbnail_url,
              duration_seconds: t.duration_seconds,
              position: i + 1,
            });
          if (trkError) console.warn(`Track ${t.title} note:`, trkError.message);
        }
        console.log(`✅ Installed ${SEED_TRACKS.length} tracks into playlist!`);
      }
    }

    console.log('✨ Songs installation completed successfully.');
  } catch (err: any) {
    console.error('❌ Seeding error:', err?.message || err);
  }
}

seed();
