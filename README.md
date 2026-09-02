<div align="center">
  <h1>✨ EVA AI Music</h1>
  <p><strong>A Next-Generation Ad-Free AI Music Streaming Web Application & Intelligence Engine</strong></p>

  [![Version](https://img.shields.io/badge/version-1.0.0-purple.svg?style=for-the-badge)](RELEASE_INFO.md)
  [![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)
  [![Tech](https://img.shields.io/badge/React-19-cyan.svg?style=for-the-badge&logo=react)](https://react.dev)
  [![Backend](https://img.shields.io/badge/Fastify-5.2-green.svg?style=for-the-badge&logo=fastify)](https://fastify.dev)
</div>

---

## 🎵 Overview

**EVA AI Music** is a state-of-the-art web application designed for high-fidelity, ad-free music streaming powered by **Echo Brain**, an on-device contextual AI recommendation engine. EVA combines a modern Gen Z dark-mode UI, glassmorphism design tokens, real-time synchronized lyrics, user stats tracking, and a robust Fastify backend proxy for seamless audio playback.

---

## 🌟 Key Features

### 🎧 Ad-Free Streaming & Audio Engine
- **High-Fidelity Audio:** Stream 320kbps MP3 / AAC audio streams with 206 Partial Content byte-range seeking.
- **HTML5 Web Audio Engine:** Centralized [audioEngine.ts](file:///d:/all/ai%20agent/eva%20music/eva-music-app/src/services/audioEngine.ts) supporting play queueing, volume binding, muting, seeking, and equalizer presets.
- **Race Condition Protection:** Internal sequence counter (`_currentRequestId`) discards stale async responses during rapid track changes.

### 🧠 Echo Brain AI Recommendation Engine
- **On-Device Neural Persona:** Analyzes listening momentum without sending private user data to third-party tracking servers.
- **Three Pillars Aggregation:** Merges candidate tracks from **Anchor** (current track sonic match), **Momentum** (previous track bridge), and **Vault** (all-time top favorites).
- **"Why this song?" Transparency:** Queue items feature a `✨ AI` badge with transparent explanations for why each track was injected.
- **Skip Penalty & Affinity Tracking:** Automatically penalizes tracks skipped within 15 seconds while boosting affinities for tracks played >30 seconds.

### 🎤 Synchronized Lyrics & Player Experience
- **Real-Time Synced Lyrics:** Smoothly highlights active lyric lines as the track plays.
- **Expandable Full Player:** Includes album art visualizers, equalizer presets, queue management, and sharing capabilities.
- **Offline Download Manager:** Trigger track downloads for offline listening.

### 👤 Profile & Listening Analytics
- **Gen Z Aesthetics:** Dynamic background glows, smooth micro-animations powered by Framer Motion, and HSL palette styling.
- **Personalized Stats:** Track total minutes streamed, listening streak days, top percentile ranks, and collectible badges.
- **Supabase Cloud Sync:** Sync profile edits and favorite songs directly to Supabase storage.

---

## 📁 Project Architecture

```
eva music/
├── eva-music-app/             # React 19 Frontend Web Client
│   ├── src/
│   │   ├── components/        # UI Components (HomeScreen, DiscoverScreen, Player Modals)
│   │   ├── services/          # audioEngine.ts, echoBrainService.ts, backendApi.ts
│   │   ├── data/              # Initial music data & category definitions
│   │   ├── types.ts           # Shared TypeScript interfaces
│   │   └── App.tsx            # Root application state & navigation router
│   ├── package.json
│   └── vite.config.ts
│
└── eva-music-backend/         # Fastify API Proxy & Audio Resolution Server
    ├── src/
    │   ├── routes/            # stream.ts, lyrics.ts, library.ts, search.ts
    │   ├── services/          # youtubeMusic.ts, cache.ts, supabase.ts
    │   └── server.ts          # Fastify entry point
    └── package.json
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher

### 1. Clone & Install Dependencies

```bash
# Frontend setup
cd eva-music-app
npm install

# Backend setup
cd ../eva-music-backend
npm install
```

### 2. Start Development Servers

```bash
# Terminal 1: Backend Server (Port 8080)
cd eva-music-backend
npm run dev

# Terminal 2: Frontend Web App (Port 3000)
cd eva-music-app
npm run dev
```

Open **[http://localhost:3000/](http://localhost:3000/)** in your browser.

---

## 📖 Documentation Index

- 🛠️ **[SETUP.md](SETUP.md)** — Comprehensive installation and environment configuration guide.
- 🧠 **[ECHO_BRAIN_DOCS.md](ECHO_BRAIN_DOCS.md)** — Architectural breakdown of the Echo Brain AI engine.
- 🤝 **[CONTRIBUTING.md](CONTRIBUTING.md)** — Guidelines for code style, PRs, and issues.
- 📜 **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** — Community guidelines and standards.
- 🔒 **[SECURITY.md](SECURITY.md)** — Security policies and vulnerability disclosure.
- 🚀 **[RELEASE_INFO.md](RELEASE_INFO.md)** — Release notes and version history.

---

<div align="center">
  Licensed under the <a href="LICENSE">MIT License</a>.
</div>
