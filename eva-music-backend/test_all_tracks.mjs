import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';

// Load musicData.ts by reading file and parsing or extracting tracks
const musicDataPath = 'd:/all/ai agent/eva music/eva-music-app/src/data/musicData.ts';
const content = fs.readFileSync(musicDataPath, 'utf8');

// Regex extract all tracks in INITIAL_TRACKS
const trackRegex = /id:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?audioUrl:\s*'([^']+)'/g;

let match;
const tracks = [];
while ((match = trackRegex.exec(content)) !== null) {
  tracks.push({
    id: match[1],
    title: match[2],
    audioUrl: match[3]
  });
}

console.log(`Found ${tracks.length} tracks in musicData.ts.`);

async function checkUrl(url) {
  return new Promise((resolve) => {
    let resolvedUrl = url;
    if (url.startsWith('/api/')) {
      resolvedUrl = 'http://localhost:8080' + url;
    }

    const client = resolvedUrl.startsWith('https') ? https : http;
    const req = client.request(resolvedUrl, { method: 'HEAD' }, (res) => {
      resolve({
        statusCode: res.statusCode,
        location: res.headers.location,
        contentType: res.headers['content-type'],
        contentLength: res.headers['content-length']
      });
    });

    req.on('error', (err) => {
      resolve({ error: err.message });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ error: 'timeout' });
    });

    req.end();
  });
}

async function run() {
  const failed = [];
  const ok = [];

  for (const track of tracks) {
    let res = await checkUrl(track.audioUrl);
    
    // Follow redirect if 302/301
    if (res.statusCode === 302 || res.statusCode === 301) {
      const redirectUrl = res.location;
      const redirectRes = await checkUrl(redirectUrl);
      if (redirectRes.statusCode === 200) {
        ok.push({ ...track, redirect: redirectUrl, size: redirectRes.contentLength });
      } else {
        failed.push({ ...track, redirect: redirectUrl, error: `Redirect returned ${redirectRes.statusCode}` });
      }
    } else if (res.statusCode === 200) {
      ok.push({ ...track, size: res.contentLength });
    } else {
      failed.push({ ...track, status: res.statusCode, error: res.error });
    }
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`OK: ${ok.length}/${tracks.length}`);
  console.log(`FAILED: ${failed.length}/${tracks.length}`);

  if (failed.length > 0) {
    console.log(`\nFailed tracks:`);
    for (const f of failed) {
      console.log(`- [${f.id}] "${f.title}": ${f.error || f.status} (${f.audioUrl})`);
    }
  }
}

run();
