-- Users are handled by Supabase Auth (auth.users). Extend with a profile table:
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  handle text unique,
  email text,
  bio text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists playlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  name text not null,
  description text,
  is_public boolean default false,
  cover_url text,
  created_at timestamptz default now()
);

create table if not exists playlist_tracks (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid references playlists(id) on delete cascade,
  track_id text not null,       -- YouTube Music video/track id
  title text,
  artist text,
  thumbnail_url text,
  duration_seconds int,
  position int,
  added_at timestamptz default now()
);

create table if not exists favorites (
  user_id uuid references profiles(id) on delete cascade,
  track_id text not null,
  title text,
  artist text,
  thumbnail_url text,
  audio_url text,
  added_at timestamptz default now(),
  primary key (user_id, track_id)
);

create table if not exists listening_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  track_id text not null,
  title text,
  artist text,
  played_at timestamptz default now(),
  ms_played int
);

create table if not exists downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  track_id text not null,
  title text,
  artist text,
  storage_path text,           -- path in Supabase Storage
  status text default 'pending', -- pending | downloading | ready | failed
  created_at timestamptz default now()
);

create table if not exists lyrics_cache (
  track_id text primary key,
  synced_lyrics text,
  plain_lyrics text,
  provider text,
  cached_at timestamptz default now()
);

create table if not exists listen_together_sessions (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references profiles(id),
  current_track_id text,
  position_ms int default 0,
  is_playing boolean default false,
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table playlists enable row level security;
alter table playlist_tracks enable row level security;
alter table favorites enable row level security;
alter table listening_history enable row level security;
alter table downloads enable row level security;
alter table listen_together_sessions enable row level security;
