# EVA AI Music — Setup & Development Guide

This document provides step-by-step instructions for installing, configuring, and building the **EVA AI Music** project from source.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js**: `v20.0.0` or later ([nodejs.org](https://nodejs.org/))
- **npm**: `v10.0.0` or later (included with Node.js)
- **Git**: For version control

---

## 🚀 Environment Setup

### 1. Configure Backend Environment (`eva-music-backend/.env`)

Create a `.env` file in the `eva-music-backend` directory:

```env
PORT=8080
HOST=0.0.0.0
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key
REDIS_URL=redis://localhost:6379 # Optional: Redis cache fallback to memory
```

### 2. Configure Frontend Environment (`eva-music-app/.env`)

Create a `.env` file in the `eva-music-app` directory:

```env
VITE_BACKEND_URL=http://localhost:8080/api
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 💻 Running Locally

### Step 1: Start the Fastify Backend Server

```bash
cd eva-music-backend
npm run dev
```

The backend API server will start on `http://localhost:8080`.

### Step 2: Start the Vite React Frontend Application

```bash
cd eva-music-app
npm run dev
```

The web application will launch on `http://localhost:3000`.

---

## 🔍 Verification & Diagnostics

To verify that the local audio streaming pipeline is functioning correctly:

1. Send a request to the backend stream endpoint:
   ```bash
   curl.exe -i http://localhost:8080/api/stream/tamil-1
   ```
2. Confirm the server returns `HTTP 200 OK` or `HTTP 206 Partial Content` with `Content-Type: audio/*` and `Access-Control-Allow-Origin: *`.

---

## ❓ Troubleshooting

### Audio Not Playing or Silent Playback
- Ensure the backend server (`eva-music-backend`) is running on port `8080`.
- Verify `VITE_BACKEND_URL` in `eva-music-app/.env` points to `http://localhost:8080/api`.

### Port Conflicts
- If port `8080` is in use, modify `PORT` in `eva-music-backend/.env` and update `VITE_BACKEND_URL` accordingly in `eva-music-app/.env`.

---

## 📜 Documentation Links

- 🏠 **[README.md](README.md)** — Project overview and architecture.
- 🧠 **[ECHO_BRAIN_DOCS.md](ECHO_BRAIN_DOCS.md)** — Echo Brain AI Engine design.
- 🤝 **[CONTRIBUTING.md](CONTRIBUTING.md)** — Contribution standards.
