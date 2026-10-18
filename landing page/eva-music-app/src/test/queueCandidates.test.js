import { describe, it, expect } from 'bun:test';
import { availableCandidates } from '../services/queueCandidates';
const song = (id, audioUrl) => ({ id, audioUrl, title: id, artist: 'Artist', genre: 'Pop', duration: '3:00', durationSeconds: 180, coverUrl: '' });
describe('AI listening queue candidates', () => {
  it('excludes previews and songs without full audio', () => {
    expect(availableCandidates([song('full', 'https://audio.example/song.mp3'), song('preview', 'https://itunes.apple.com/preview.m4a'), song('missing')]).map(t => t.id)).toEqual(['full']);
  });
  it('removes repeated songs', () => {
    expect(availableCandidates([song('a', 'https://audio.example/a.mp3'), song('a', 'https://audio.example/a.mp3')])).toHaveLength(1);
  });
});
