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
    return url;
  } catch {
    return null;
  }
}

function cleanTitle(str) {
  return (str || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\..*$/i, '')
    .replace(/ft\..*$/i, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
}

function normalize(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function resolveSong(title, artist, album) {
  console.log(`\nResolving: "${title}" by "${artist}" [${album || ''}]`);

  const tClean = cleanTitle(title);
  const tNorm = normalize(title);
  const firstArtist = (artist || '').split(/[,&/]/)[0].trim();
  const aNorm = normalize(firstArtist);

  const candidateQueries = [
    `${title} ${album ? album.replace(/\(.*?\)/g, '').trim() : ''}`,
    `${title} ${firstArtist}`,
    title,
    tClean,
    `${tClean} Tamil`,
  ].filter(Boolean);

  for (const q of candidateQueries) {
    try {
      const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&cc=in&_marker=0&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      const text = await res.text();
      const data = JSON.parse(text.substring(text.indexOf('{')));
      const results = data.results || [];

      for (const item of results) {
        if (!item.encrypted_media_url) continue;
        const sTitleNorm = normalize(item.song);
        const sArtistNorm = normalize(item.primary_artists || item.singers);

        // Check if titles match (exact, substring, or token overlap)
        const titleMatch = sTitleNorm === tNorm ||
                           sTitleNorm.includes(tNorm) ||
                           tNorm.includes(sTitleNorm) ||
                           (tClean.length >= 4 && sTitleNorm.includes(tClean.split(' ')[0]));

        if (titleMatch) {
          const streamUrl = decryptSaavnMediaUrl(item.encrypted_media_url);
          if (streamUrl) {
            console.log(`[SUCCESS] Matched query "${q}" -> "${item.song}" by "${item.singers}" -> ${streamUrl}`);
            return streamUrl;
          }
        }
      }
    } catch (e) {
      console.warn('Search query error:', e.message);
    }
  }

  console.log('[FAIL] Could not resolve stream');
  return null;
}

async function test() {
  // Test 1: Koondukulla (iTunes 1729674945)
  await resolveSong('Koondukulla', 'Ilaiyaraaja, R. V. Udayakumar, S.P. Balasubrahmanyam & S. Janaki', 'Chinna Gounder');

  // Test 2: Pesamale (iTunes 6794313992)
  await resolveSong('Pesamale', 'Siri Xander & Arra Aria Khayal', 'Pesamale');

  // Test 3: Rasave Unnai
  await resolveSong('Rasave Unnai', 'Ilaiyaraaja & S. P. Sailaja', 'Mudhal Mariyathai');
}

test();
