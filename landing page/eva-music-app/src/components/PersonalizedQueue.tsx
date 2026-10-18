import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Play, X, Square } from 'lucide-react';
import type { Track } from '../types';
import { Button } from './ui/Button';
import { createPersonalizedQueue, type PersonalizedQueue as Queue } from '../services/personalizedQueue';
export function PersonalizedQueue({ tracks, signedIn, onSignIn, onPlay }: { tracks: Track[]; signedIn: boolean; onSignIn?: () => void; onPlay: (tracks: Track[]) => void }) {
  const [artists, setArtists] = useState(''); const [genres, setGenres] = useState(''); const [mood, setMood] = useState('Relaxed');
  const [queue, setQueue] = useState<Queue | null>(null); const [busy, setBusy] = useState(false); const [status, setStatus] = useState(''); const [error, setError] = useState('');
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => { request.current?.abort(); setQueue(null); setError(''); }, [signedIn]);
  const split = (value: string) => [...new Set(value.split(',').map(part => part.trim()).filter(Boolean))].slice(0, 8);
  async function generate(event: React.FormEvent) {
    event.preventDefault();
    if (!signedIn) { onSignIn?.(); return; }
    const controller = new AbortController(); request.current = controller;
    setBusy(true); setError(''); setQueue(null);
    try {
      const result = await createPersonalizedQueue({ artists: split(artists), genres: split(genres), mood: mood.trim() }, tracks, controller.signal, message => { if (!controller.signal.aborted) setStatus(message); });
      if (!controller.signal.aborted) setQueue(result);
    } catch (error) { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Could not create your queue.'); }
    finally { if (request.current === controller) { request.current = null; setBusy(false); setStatus(''); } }
  }
  return <section className="eva-ai-section" aria-labelledby="personalized-title">
    <h3 id="personalized-title"><Sparkles size={20} />Your AI mix</h3>
    <form onSubmit={generate}>
      <label>Favorite artists<input value={artists} onChange={event => setArtists(event.target.value)} maxLength={600} placeholder="Anirudh, A. R. Rahman" disabled={busy} /></label>
      <label>Favorite genres<input value={genres} onChange={event => setGenres(event.target.value)} maxLength={400} placeholder="Tamil melodies, pop" disabled={busy} /></label>
      <label>Mood<input value={mood} onChange={event => setMood(event.target.value)} maxLength={120} list="eva-moods" required disabled={busy} /></label>
      <datalist id="eva-moods">{['Relaxed', 'Happy', 'Focused', 'Energetic', 'Romantic', 'Feeling blue'].map(value => <option key={value} value={value} />)}</datalist>
      {busy ? <Button type="button" onClick={() => request.current?.abort()}><Square size={16} />Cancel</Button> : <Button type="submit"><Sparkles size={16} />{signedIn ? 'Create my queue' : 'Sign in to create a queue'}</Button>}
    </form>
    {busy && <p role="status">{status}</p>}
    {error && <p className="eva-ai-error" role="alert">{error}</p>}
    {queue && <div className="eva-ai-result"><h4>{queue.title}</h4><p>{queue.explanation}</p><ol>{queue.tracks.map(track => <li key={track.id}><span><strong>{track.title}</strong><small>{track.artist}</small></span><Button type="button" className="eva-ai-icon" aria-label={`Remove ${track.title}`} title={`Remove ${track.title}`} onClick={() => setQueue({ ...queue, tracks: queue.tracks.filter(song => song.id !== track.id) })}><X size={16} /></Button></li>)}</ol><Button disabled={!queue.tracks.length} onClick={() => onPlay(queue.tracks)}><Play size={16} />Play queue · {queue.tracks.length} songs</Button></div>}
  </section>;
}
