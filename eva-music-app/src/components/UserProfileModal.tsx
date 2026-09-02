import React, { useState } from 'react';
import { 
  X, Edit3, Sparkles, Flame, Headphones, Zap, Share2, Award, 
  BarChart3, Disc, Music, Check, Camera, Crown, Heart, Play, Pause,
  Globe, Radio, Sliders, Volume2, ShieldCheck, ChevronRight
} from 'lucide-react';
import { UserProfile, Track } from '../types';
import { audioEngine } from '../services/audioEngine';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  allTracks: Track[];
  onPlayTrack: (track: Track) => void;
  isPlaying: boolean;
  currentTrackId: string | null;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
];

const MOOD_PRESETS = [
  { emoji: '🎧', text: 'Vibing to Synthwave' },
  { emoji: '✨', text: 'Main Character Energy' },
  { emoji: '🌙', text: '3 AM Overthinking Beats' },
  { emoji: '⚡', text: 'Hyperpop Speed Run' },
  { emoji: '☕', text: 'Lo-Fi Chill & Code' },
  { emoji: '🔥', text: 'On a 94-Day Streak' }
];

const VIBE_ARCHETYPES = [
  'Aesthetic Dreamer 🌌',
  'Cyber-Pop Enthusiast ⚡',
  'Midnight Overthinker 🌙',
  'Hyperpop Chaos ⚡',
  'Lo-Fi Cozy Producer ☕',
  'Indie Sleaze Retro 🎸'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  allTracks,
  onPlayTrack,
  isPlaying,
  currentTrackId
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'capsule' | 'badges' | 'edit'>('overview');
  const [isCopied, setIsCopied] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(profile.name);
  const [editHandle, setEditHandle] = useState(profile.handle);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editAvatarUrl, setEditAvatarUrl] = useState(profile.avatarUrl);
  const [editStatusEmoji, setEditStatusEmoji] = useState(profile.statusEmoji);
  const [editStatusMood, setEditStatusMood] = useState(profile.statusMood);
  const [editVibeArchetype, setEditVibeArchetype] = useState(profile.vibeArchetype);
  const [editAnthemId, setEditAnthemId] = useState(profile.anthemTrackId);

  if (!isOpen) return null;

  const anthemTrack = allTracks.find(t => t.id === profile.anthemTrackId) || allTracks[0];
  const isAnthemPlaying = isPlaying && currentTrackId === anthemTrack?.id;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: editName,
      handle: editHandle,
      bio: editBio,
      avatarUrl: editAvatarUrl,
      statusEmoji: editStatusEmoji,
      statusMood: editStatusMood,
      vibeArchetype: editVibeArchetype,
      anthemTrackId: editAnthemId
    });
    setActiveTab('overview');
  };

  const handleShareProfile = () => {
    navigator.clipboard?.writeText?.(`https://evamusic.app/@${profile.handle}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-purple-900/90 via-slate-900/95 to-slate-950 rounded-[2.5rem] border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Cover Banner */}
        <div className="relative h-36 w-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 overflow-hidden">
          {/* Animated Glow Blobs */}
          <div className="absolute top-[-50%] left-[-20%] w-60 h-60 bg-indigo-400/40 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-[-30%] right-[-10%] w-52 h-52 bg-pink-400/50 rounded-full blur-2xl" />
          
          {/* Cover Overlay & Close button */}
          <div className="absolute inset-0 bg-black/10" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-all border border-white/20 active:scale-95"
          >
            <X size={18} />
          </button>

          {/* Vibe Badge */}
          <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
            <Sparkles size={13} className="text-yellow-300 animate-spin-slow" />
            <span>{profile.vibeArchetype}</span>
          </div>
        </div>

        {/* Profile Avatar & Primary Info Section */}
        <div className="relative px-6 pt-0 pb-3 flex flex-col items-center text-center -mt-14 z-10">
          {/* Avatar Container with Glow Ring */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-purple-500 via-pink-400 to-indigo-400 rounded-full blur-md opacity-80 group-hover:opacity-100 transition duration-300" />
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="relative w-24 h-24 rounded-full object-cover border-4 border-slate-900 shadow-xl"
            />
            {profile.isPro && (
              <span className="absolute bottom-1 right-1 p-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg border border-slate-900" title="EVA Pro Member">
                <Crown size={14} className="fill-slate-950" />
              </span>
            )}
          </div>

          {/* User Name & Tag */}
          <div className="mt-2.5 flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight">{profile.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              PRO
            </span>
          </div>
          <p className="text-xs font-semibold text-purple-300/80">@{profile.handle}</p>

          {/* Gen Z Status / Mood Pill */}
          <div className="mt-3 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs font-medium flex items-center gap-2 shadow-inner">
            <span className="text-sm">{profile.statusEmoji}</span>
            <span className="italic">{profile.statusMood}</span>
          </div>

          {/* Bio */}
          <p className="mt-2 text-xs text-slate-300 max-w-xs leading-relaxed font-normal">
            {profile.bio}
          </p>

          {/* Action Bar */}
          <div className="mt-4 flex items-center gap-2 w-full justify-center">
            <button
              onClick={() => setActiveTab('edit')}
              className="flex-1 py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 transition-all active:scale-95"
            >
              <Edit3 size={14} />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={handleShareProfile}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-purple-500/30 transition-all active:scale-95"
            >
              {isCopied ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
              <span>{isCopied ? 'Copied!' : 'Share Vibe'}</span>
            </button>
          </div>
        </div>

        {/* Gen Z Navigation Tabs */}
        <div className="px-6 border-b border-purple-900/40 flex items-center justify-around text-xs font-bold text-slate-400">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-pink-500 text-pink-400 font-extrabold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Zap size={14} />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('capsule')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'capsule'
                ? 'border-pink-500 text-pink-400 font-extrabold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Disc size={14} />
            <span>Music Capsule</span>
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'badges'
                ? 'border-pink-500 text-pink-400 font-extrabold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Award size={14} />
            <span>Badges</span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              
              {/* Personal Anthem Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/30 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="relative group cursor-pointer" onClick={() => onPlayTrack(anthemTrack)}>
                    <img
                      src={anthemTrack.coverUrl}
                      alt={anthemTrack.title}
                      className="w-14 h-14 rounded-xl object-cover shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isAnthemPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white fill-white" />}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-400 flex items-center gap-1">
                      <Music size={10} /> Personal Anthem
                    </span>
                    <h4 className="text-sm font-bold text-white truncate max-w-[150px]">{anthemTrack.title}</h4>
                    <p className="text-xs text-slate-400 truncate max-w-[150px]">{anthemTrack.artist}</p>
                  </div>
                </div>

                <button
                  onClick={() => onPlayTrack(anthemTrack)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isAnthemPlaying 
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/50 animate-pulse' 
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  {isAnthemPlaying ? <Pause size={16} /> : <Play size={16} className="fill-white ml-0.5" />}
                </button>
              </div>

              {/* Gen Z Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-purple-400">
                    <Headphones size={18} />
                    <span className="text-[10px] font-bold text-slate-400">Top 0.5%</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xl font-black text-white">{profile.stats.minutesStreamed.toLocaleString()}</p>
                    <p className="text-[11px] font-medium text-slate-400">Minutes Listened</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-amber-400">
                    <Flame size={18} />
                    <span className="text-[10px] font-bold text-slate-400">Streak</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xl font-black text-white">{profile.stats.listeningStreakDays} Days 🔥</p>
                    <p className="text-[11px] font-medium text-slate-400">Daily Listening</p>
                  </div>
                </div>
              </div>

              {/* Social Handles */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/20 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-400">Connected Socials</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-purple-500/10 flex items-center justify-between">
                    <span className="text-slate-300 font-medium">Instagram</span>
                    <span className="text-pink-400 font-bold">@{profile.handle}</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-purple-500/10 flex items-center justify-between">
                    <span className="text-slate-300 font-medium">TikTok</span>
                    <span className="text-cyan-400 font-bold">@{profile.handle}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MUSIC CAPSULE / VIBE RADAR */}
          {activeTab === 'capsule' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <BarChart3 size={14} /> My Vibe Radar
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">2026 Wrapped Vibe</span>
                </div>

                <div className="space-y-3 pt-1">
                  {profile.stats.topGenres.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-200">
                        <span>{item.genre}</span>
                        <span>{item.percentage}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color} transition-all duration-500`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gen Z AI Compatibility */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-slate-900 border border-pink-500/30 space-y-2">
                <div className="flex items-center gap-2 text-pink-400">
                  <Sparkles size={16} />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider">EVA AI Music Match</h4>
                </div>
                <p className="text-2xl font-black text-white">98% Match ✨</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your taste aligns with late-night neon synthwave & cozy lo-fi beats. You are 4.2x more likely to discover underground hyperpop tracks before they go viral!
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: BADGES */}
          {activeTab === 'badges' && (
            <div className="grid grid-cols-2 gap-3">
              {profile.stats.badges.map((badge) => (
                <div key={badge.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/20 flex flex-col items-center text-center gap-2 hover:border-purple-500/50 transition-colors">
                  <span className="text-3xl">{badge.icon}</span>
                  <div>
                    <h5 className="text-xs font-bold text-white">{badge.label}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: EDIT PROFILE */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-medium">
              
              {/* Display Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-purple-500/30 text-white focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              {/* Handle */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Username / Handle</label>
                <div className="flex items-center px-3 py-2 rounded-xl bg-slate-800 border border-purple-500/30 text-white">
                  <span className="text-purple-400 font-bold mr-1">@</span>
                  <input
                    type="text"
                    value={editHandle}
                    onChange={(e) => setEditHandle(e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-white"
                    required
                  />
                </div>
              </div>

              {/* Vibe Status Mood */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Mood Emoji</label>
                  <input
                    type="text"
                    value={editStatusEmoji}
                    onChange={(e) => setEditStatusEmoji(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-purple-500/30 text-white text-center text-base"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Current Vibe Status</label>
                  <input
                    type="text"
                    value={editStatusMood}
                    onChange={(e) => setEditStatusMood(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-purple-500/30 text-white"
                  />
                </div>
              </div>

              {/* Quick Mood Presets */}
              <div>
                <label className="block text-slate-400 text-[10px] font-bold mb-1">Quick Mood Presets</label>
                <div className="flex flex-wrap gap-1.5">
                  {MOOD_PRESETS.map((m, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEditStatusEmoji(m.emoji);
                        setEditStatusMood(m.text);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-900/60 text-slate-300 text-[10px] flex items-center gap-1 border border-purple-500/20"
                    >
                      <span>{m.emoji}</span>
                      <span>{m.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vibe Archetype */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Musical Persona Tag</label>
                <select
                  value={editVibeArchetype}
                  onChange={(e) => setEditVibeArchetype(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-purple-500/30 text-white focus:outline-none"
                >
                  {VIBE_ARCHETYPES.map((vibe, idx) => (
                    <option key={idx} value={vibe}>{vibe}</option>
                  ))}
                </select>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Bio</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-purple-500/30 text-white focus:outline-none"
                />
              </div>

              {/* Avatar Presets / Custom URL */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Avatar Image Preset</label>
                <div className="flex gap-2 mb-2">
                  {AVATAR_PRESETS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Preset"
                      onClick={() => setEditAvatarUrl(url)}
                      className={`w-10 h-10 rounded-full object-cover cursor-pointer border-2 transition-all ${
                        editAvatarUrl === url ? 'border-pink-500 scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="Or paste custom image URL..."
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-purple-500/30 text-white text-[11px]"
                />
              </div>

              {/* Select Personal Anthem */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Personal Anthem Track</label>
                <select
                  value={editAnthemId}
                  onChange={(e) => setEditAnthemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-purple-500/30 text-white focus:outline-none"
                >
                  {allTracks.map((t) => (
                    <option key={t.id} value={t.id}>{t.title} - {t.artist}</option>
                  ))}
                </select>
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-lg shadow-pink-500/30 hover:opacity-95 active:scale-95 transition-all"
                >
                  Save Profile Changes ✨
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
