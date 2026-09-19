import CryptoJS from 'crypto-js';

function decryptSaavnMediaUrl(encryptedUrl) {
  if (!encryptedUrl) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl),
    });
    const decrypted = CryptoJS.DES.decrypt(cipherParams, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    const url = decrypted.toString(CryptoJS.enc.Utf8);
    if (!url || !url.startsWith('http')) return null;
    return url.replace('_96.mp4', '_320.mp4').replace('_160.mp4', '_320.mp4');
  } catch {
    return null;
  }
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const q = req.query.q || '';
  if (!q || q.trim().length < 2) {
    return res.status(200).json({ results: [] });
  }

  try {
    const saavnUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&cc=in&_marker=0&n=25&p=1&q=${encodeURIComponent(q.trim())}`;
    const response = await fetch(saavnUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://www.jiosaavn.com/',
      },
    });

    if (!response.ok) {
      return res.status(200).json({ results: [] });
    }

    const text = await response.text();
    const jsonStart = text.indexOf('{');
    if (jsonStart === -1) {
      return res.status(200).json({ results: [] });
    }

    const data = JSON.parse(text.substring(jsonStart));
    const items = data.results || [];
    const results = [];

    for (const item of items) {
      if (!item.encrypted_media_url) continue;
      const audioUrl = decryptSaavnMediaUrl(item.encrypted_media_url);
      if (!audioUrl) continue;

      const durSecs = parseInt(item.duration || '218', 10);
      const mins = Math.floor(durSecs / 60);
      const secs = durSecs % 60;
      const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

      const cover = (item.image || '')
        .replace('50x50', '500x500')
        .replace('150x150', '500x500') ||
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';

      results.push({
        id: `saavn-${item.id}`,
        title: cleanText(item.song || item.title || ''),
        artist: cleanText(item.primary_artists || item.singers || item.music || 'Artist'),
        album: cleanText(item.album || 'Single'),
        duration: durationStr,
        durationSeconds: durSecs,
        coverUrl: cover,
        genre: item.language ? item.language.charAt(0).toUpperCase() + item.language.slice(1) : 'Tamil Pop',
        audioUrl,
        fallbackAudioUrl: audioUrl,
        releaseYear: item.year || '2024',
        plays: item.play_count ? `${(parseInt(item.play_count, 10) / 1000000).toFixed(1)}M` : '12M',
        isLiked: false,
      });
    }

    return res.status(200).json({ results });
  } catch (err) {
    console.error('Saavn API Search Error:', err);
    return res.status(200).json({ results: [] });
  }
}
