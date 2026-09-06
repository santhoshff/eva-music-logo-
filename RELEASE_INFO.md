# EVA Music — Release Notes

## 🚀 Version 1.0.0 (Current Release)

### 🎉 Highlights
- **Fastify Audio Proxy Server:** High-speed streaming proxy with track-scoped Redis/Memory caching, HTTP 206 Partial Content range seeking, and CORS support.
- **Race Condition Protection:** Sequence counter (`_currentRequestId`) in `audioEngine.ts` preventing out-of-order track switching overwrites.
- **Transparent AI Badging:** "Why this song?" transparency modal explaining AI recommendations in real-time.
- **Gen Z Aesthetics & Customization:** Dynamic HSL glassmorphism styling, synchronized lyrics, user stats, and equalizer presets.
- **Supabase Cloud Integration:** Cloud synchronization for user profiles, listening history, and favorite tracks.

---

## 🔮 Upcoming Roadmap (v1.1.0)
- Offline PWA caching & service worker installation.
- AI Lyrics Translation into multi-language formats.
- Real-time collaborative listening sessions ("EVA Jam").
