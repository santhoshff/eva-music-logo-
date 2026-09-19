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

const songs = [
  { id: 'tamil-koondu-kulla', title: 'Koondu Kulla', query: 'Koondu Kulla Chinna Gounder', artist: 'Ilaiyaraaja, SPB & S. Janaki', album: 'Chinna Gounder', genre: 'Tamil Classic' },
  { id: 'tamil-rasave-unnai', title: 'Rasave Unnai', query: 'Rasave Unnai Mudhal Mariyathai', artist: 'Ilaiyaraaja & S. Janaki', album: 'Mudhal Mariyathai', genre: 'Tamil Classic' },
  { id: 'tamil-pesamale', title: 'Pesamal Pesi Parthen', query: 'Pesamal Pesi Parthen', artist: 'Karthik', album: 'Devi', genre: 'Tamil Melody' },
  { id: 'tamil-kanne-kalaimane', title: 'Kanne Kalaimane', query: 'Kanne Kalaimane Moondram Pirai', artist: 'Ilaiyaraaja & K. J. Yesudas', album: 'Moondram Pirai', genre: 'Tamil Classic' },
  { id: 'tamil-ilaya-nila', title: 'Ilaya Nila Pozhigirathe', query: 'Ilaya Nila Pozhigirathe', artist: 'Ilaiyaraaja & SPB', album: 'Payanangal Mudivadhillai', genre: 'Tamil Classic' },
  { id: 'tamil-ilamai-idho', title: 'Ilamai Idho Idho', query: 'Ilamai Idho Idho Sakalakala Vallavan', artist: 'S. P. Balasubrahmanyam', album: 'Sakalakala Vallavan', genre: 'Tamil Retro Pop' },
  { id: 'tamil-mannil-indha', title: 'Mannil Indha Kaadhalandri', query: 'Mannil Indha Kadhalandri Keladi Kanmani', artist: 'S. P. Balasubrahmanyam', album: 'Keladi Kanmani', genre: 'Tamil Classic' },
  { id: 'tamil-nenjame', title: 'Nenjame Nenjame', query: 'Nenjame Nenjame Maamannan', artist: 'A. R. Rahman & Vijay Yesudas', album: 'Maamannan', genre: 'Tamil Melody' },
  { id: 'tamil-loosu-penne', title: 'Loosu Penne', query: 'Loosu Penne Vallavan', artist: 'Yuvan Shankar Raja & Silambarasan', album: 'Vallavan', genre: 'Tamil Youth Pop' },
  { id: 'tamil-mundhinam', title: 'Mundhinam Paarthene', query: 'Mundhinam Paarthene Vaaranam Aayiram', artist: 'Harris Jayaraj & Naresh Iyer', album: 'Vaaranam Aayiram', genre: 'Tamil Romance' },
  { id: 'tamil-adiye-kolluthe', title: 'Adiye Kolluthe', query: 'Adiye Kolluthe Vaaranam Aayiram', artist: 'Harris Jayaraj & Benny Dayal', album: 'Vaaranam Aayiram', genre: 'Tamil Rock' },
  { id: 'tamil-inkem-inkem', title: 'Inkem Inkem Inkem Kaavaale', query: 'Inkem Inkem Inkem Kaavaale Geetha Govindam', artist: 'Sid Sriram', album: 'Geetha Govindam', genre: 'South Romance' },
  { id: 'tamil-mannipaaya', title: 'Mannipaaya', query: 'Mannipaaya Vinnaithaandi Varuvaayaa', artist: 'A. R. Rahman & Shreya Ghoshal', album: 'Vinnaithaandi Varuvaayaa', genre: 'Tamil Romance' },
  { id: 'tamil-ayyayyo', title: 'Ayyayyo', query: 'Ayyayyo Anandham Aadukalam', artist: 'G. V. Prakash Kumar & Shreya Ghoshal', album: 'Aadukalam', genre: 'Tamil Folk Romance' },
  { id: 'tamil-aagayam-theepiditha', title: 'Aagayam Theepiditha', query: 'Aagayam Theepiditha Madras', artist: 'Pradeep Kumar', album: 'Madras', genre: 'Tamil Soul' },
];

async function resolve() {
  const verified = [];
  for (const s of songs) {
    try {
      const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&cc=in&_marker=0&q=${encodeURIComponent(s.query)}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      const text = await res.text();
      const data = JSON.parse(text.substring(text.indexOf('{')));
      const results = data.results || [];

      let found = null;
      for (const r of results) {
        if (!r.encrypted_media_url) continue;
        const streamUrl = decryptSaavnMediaUrl(r.encrypted_media_url);
        if (!streamUrl) continue;

        const headRes = await fetch(streamUrl, { method: 'HEAD' });
        const len = parseInt(headRes.headers.get('content-length') || '0', 10);
        if (headRes.ok && len > 500000) {
          found = {
            id: s.id,
            title: s.title,
            artist: s.artist,
            album: s.album,
            duration: r.duration ? `${Math.floor(parseInt(r.duration, 10) / 60)}:${(parseInt(r.duration, 10) % 60).toString().padStart(2, '0')}` : '4:30',
            durationSeconds: r.duration ? parseInt(r.duration, 10) : 270,
            coverUrl: (r.image || '').replace('50x50', '500x500').replace('150x150', '500x500') || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
            genre: s.genre,
            audioUrl: streamUrl,
            lengthMB: (len / (1024 * 1024)).toFixed(2),
            matchedSong: r.song,
          };
          break;
        }
      }

      if (found) {
        console.log(`[PASS] ${s.title} -> ${found.matchedSong} (${found.lengthMB} MB) -> ${found.audioUrl}`);
        verified.push(found);
      } else {
        console.log(`[FAIL] ${s.title}`);
      }
    } catch (e) {
      console.log(`[ERROR] ${s.title}: ${e.message}`);
    }
  }

  console.log(`\nVerified ${verified.length} of ${songs.length} songs`);
  console.log(JSON.stringify(verified, null, 2));
}

resolve();
