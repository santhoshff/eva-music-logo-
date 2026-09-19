import React, { useState, useRef } from 'react';
import { X, Upload, Music, Plus, CheckCircle2, Sparkles, FolderUp, Download, Play, Trash2 } from 'lucide-react';
import { Track } from '../types';
import { INITIAL_TRACKS } from '../data/musicData';

interface SongInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallTracks: (newTracks: Track[]) => void;
  existingTracks: Track[];
}

export const SongInstallModal: React.FC<SongInstallModalProps> = ({
  isOpen,
  onClose,
  onInstallTracks,
  existingTracks,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'packs'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<Track[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local audio file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newTracks: Track[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const objectUrl = URL.createObjectURL(file);
      
      // Clean up file name to derive title and artist
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      let title = nameWithoutExt;
      let artist = 'Local Artist';

      if (nameWithoutExt.includes('-')) {
        const parts = nameWithoutExt.split('-');
        artist = parts[0].trim();
        title = parts.slice(1).join('-').trim();
      } else if (nameWithoutExt.includes('_')) {
        const parts = nameWithoutExt.split('_');
        artist = parts[0].trim();
        title = parts.slice(1).join(' ').trim();
      }

      // Generate a vibrant cover image or placeholder
      const covers = [
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      ];
      const randomCover = covers[i % covers.length];

      const newTrack: Track = {
        id: `local-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        title: title || 'Untitled Audio Track',
        artist: artist || 'Offline Device Audio',
        album: 'Installed Local Songs',
        duration: '3:30',
        durationSeconds: 210,
        genre: 'Installed Local Audio',
        isLiked: false,
        coverUrl: randomCover,
        audioUrl: objectUrl,
        fallbackAudioUrl: objectUrl,
        releaseYear: new Date().getFullYear().toString(),
        plays: 'Local',
      };

      newTracks.push(newTrack);
    }

    setUploadedFiles(prev => [...prev, ...newTracks]);
    setIsProcessing(false);
  };

  const handleInstallUploaded = () => {
    if (uploadedFiles.length === 0) return;
    onInstallTracks(uploadedFiles);
    setSuccessMessage(`Successfully installed ${uploadedFiles.length} song(s) to your EVA library!`);
    setUploadedFiles([]);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  const handleRemovePending = (id: string) => {
    setUploadedFiles(prev => prev.filter(t => t.id !== id));
  };

  // Preset Packs
  const packs = [
    {
      id: 'pack-tamil',
      name: '2025 Tamil Viral & Mass Hits Pack',
      description: 'God Mode (Karuppu), Katchi Sera, Aasa Kooda, Leo, Jailer, GOAT & more',
      count: INITIAL_TRACKS.filter(t => t.id.startsWith('tamil-')).length,
      cover: 'https://c.saavncdn.com/083/God-Mode-From-Karuppu-Tamil-2025-20250129181105-500x500.jpg',
      badge: '🔥 MOST POPULAR',
      tracks: INITIAL_TRACKS.filter(t => t.id.startsWith('tamil-')),
    },
    {
      id: 'pack-global',
      name: 'Global Billboard & Synthwave Pack',
      description: 'The Weeknd, Dua Lipa, Harry Styles, Post Malone, Alan Walker, M83',
      count: INITIAL_TRACKS.filter(t => t.id.startsWith('global-')).length,
      cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      badge: '🌍 BILLBOARD',
      tracks: INITIAL_TRACKS.filter(t => t.id.startsWith('global-')),
    },
    {
      id: 'pack-bollywood',
      name: 'Bollywood Romance & Party Pack',
      description: 'Kesariya, Apna Bana Le, Chaleya, Tauba Tauba, Jhoome Jo Pathaan',
      count: INITIAL_TRACKS.filter(t => t.id.startsWith('hindi-')).length,
      cover: 'https://c.saavncdn.com/191/Kesariya-From-Brahmastra-Hindi-2022-20220717092820-500x500.jpg',
      badge: '💃 DESI HITS',
      tracks: INITIAL_TRACKS.filter(t => t.id.startsWith('hindi-')),
    },
    {
      id: 'pack-lofi',
      name: 'Midnight Lo-Fi & Study Beats Pack',
      description: '4:20 AM Tokyo Rain, Neon Cyber Drive, Midnight Coffee, Stargazing',
      count: INITIAL_TRACKS.filter(t => t.id.startsWith('lofi-')).length,
      cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      badge: '🌌 CHILL STUDY',
      tracks: INITIAL_TRACKS.filter(t => t.id.startsWith('lofi-')),
    },
    {
      id: 'pack-south',
      name: 'South Indian Superstars & Hip-Hop Pack',
      description: 'Big Dawgs (Hanumankind), Pushpa Pushpa, Oo Antava, Naatu Naatu',
      count: INITIAL_TRACKS.filter(t => t.id.startsWith('south-')).length,
      cover: 'https://c.saavncdn.com/159/Big-Dawgs-English-2024-20240710183305-500x500.jpg',
      badge: '⚡ MASS ENERGY',
      tracks: INITIAL_TRACKS.filter(t => t.id.startsWith('south-')),
    },
  ];

  const handleInstallPack = (packTracks: Track[], packName: string) => {
    onInstallTracks(packTracks);
    setSuccessMessage(`Installed "${packName}" (${packTracks.length} songs)!`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white/95 rounded-3xl shadow-2xl border border-white/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-300/50">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Install Songs to EVA</h2>
              <p className="text-xs font-semibold text-slate-500">
                Import local audio files or install curated hit bundles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 px-6 pt-4 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-3 text-xs font-extrabold transition-all border-b-2 ${
              activeTab === 'upload'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            📥 Import Local MP3 / Audio Files
          </button>
          <button
            onClick={() => setActiveTab('packs')}
            className={`pb-3 px-3 text-xs font-extrabold transition-all border-b-2 ${
              activeTab === 'packs'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            🔥 1-Click Music Packs
          </button>
        </div>

        {/* Toast Notification */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 size={16} className="text-emerald-600" />
            {successMessage}
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              {/* Dropzone / Upload Trigger */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/40 hover:bg-purple-50/80 rounded-3xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="audio/*,.mp3,.m4a,.wav,.aac,.flac,.ogg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                  <FolderUp size={28} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Click to select audio files from your device
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports MP3, M4A, WAV, AAC, FLAC, OGG (Multiple files supported)
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-md shadow-purple-300/40"
                >
                  Browse Files
                </button>
              </div>

              {/* Pending Uploaded Tracks List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
                    <span>{uploadedFiles.length} file(s) ready to install</span>
                    <button
                      onClick={() => setUploadedFiles([])}
                      className="text-rose-500 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {uploadedFiles.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={track.coverUrl}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {track.title}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {track.artist}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemovePending(track.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleInstallUploaded}
                    disabled={isProcessing}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-purple-300/50 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Install {uploadedFiles.length} Song(s) to Library
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">
                Install pre-built music packs into your active library with zero setup:
              </p>

              {packs.map((pack) => {
                const alreadyInstalled = pack.tracks.every(pt =>
                  existingTracks.some(et => et.id === pt.id)
                );

                return (
                  <div
                    key={pack.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50/50 border border-slate-100 hover:border-purple-200 transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
                      <img
                        src={pack.cover}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover shadow-2xs flex-none"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                            {pack.badge}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {pack.count} tracks
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate mt-1">
                          {pack.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {pack.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleInstallPack(pack.tracks, pack.name)}
                      className={`flex-none px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        alreadyInstalled
                          ? 'bg-purple-100 text-purple-800 cursor-default'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm hover:shadow-md active:scale-95'
                      }`}
                    >
                      {alreadyInstalled ? (
                        <>
                          <CheckCircle2 size={13} />
                          Active
                        </>
                      ) : (
                        <>
                          <Download size={13} />
                          Install
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-6">
          <span>Active Library: {existingTracks.length} tracks</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
