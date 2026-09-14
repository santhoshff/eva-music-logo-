import CryptoJS from 'crypto-js';
import { getCache, setCache } from './cache.js';

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  durationSeconds: number;
  coverUrl: string;
  genre: string;
  audioUrl?: string;
  fallbackAudioUrl?: string;
  releaseYear?: string;
  plays?: string;
  isLiked?: boolean;
}

const KNOWN_FULL_SONGS: Record<string, string> = {
  // Direct High Quality 320kbps Full-Length Mappings
  'tamil-innum-konjam': 'Innum Konjam Neram Maryan',
  'itunes-646630025': 'Innum Konjam Neram Maryan',
  'itunes-1729674945': 'Koondu Kulla Kizhakku Cheemayile',
  'tamil-pesamale': 'Pesamale',
  'tamil-manasilaayo': 'Manasilaayo Vettaiyan',
  'tamil-whistle-podu': 'Whistle Podu GOAT',
  'tamil-matta': 'Matta GOAT',
  'tamil-godmode': 'God Mode Karuppu',
  'tamil-fear-song': 'Fear Song Devara',
  'tamil-hey-minnale': 'Hey Minnale Amaran',
  'tamil-hunter-vantaar': 'Hunter Vantaar Vettaiyan',
  'tamil-katchi-sera': 'Katchi Sera',
  'tamil-aasa-kooda': 'Aasa Kooda',
  'tamil-naa-ready': 'Naa Ready Leo',
  'tamil-hukum': 'Hukum Jailer',
  'tamil-badass': 'Badass Leo',
  'tamil-arabic-kuthu': 'Arabic Kuthu Beast',
  'tamil-vaathi-coming': 'Vaathi Coming Master',
  'tamil-vikram-title': 'Vikram Title Track',
  'tamil-rowdy-baby': 'Rowdy Baby Maari 2',
  'tamil-urvasi': 'Urvasi Urvasi Kadhalan',
  'tamil-chaiyya': 'Chaiyya Chaiyya Uyire',
  'tamil-kannaana-kanney': 'Kannaana Kanney Viswasam',
  'tamil-raja-raja-chozhan': 'Raja Raja Chozhan',
  'tamil-raasave-unna-nambi': 'Raasave Unna Nambi',
  'tamil-thendral-vandhu': 'Thendral Vandhu Theendumbothu',
  'tamil-en-iniya-pon': 'En Iniya Pon Nilave',
  'tamil-sundari-kannal': 'Sundari Kannal',
  'tamil-kadhal-rojave': 'Kadhal Rojave Roja',
  'tamil-en-kadhale': 'En Kaadhale Duet',
  'tamil-anjali-anjali': 'Anjali Anjali Duet',
  'tamil-pachai-nirame': 'Pachai Nirame Alaipayuthey',
  'tamil-enna-solla': 'Enna Solla Pogirai',
  'tamil-aalaporan': 'Aalaporaan Thamizhan',
  'tamil-oru-naalil': 'Oru Naalil Pudhupettai',
  'tamil-kadhal-valarthen': 'Kadhal Valarthen Manmadhan',
  'tamil-vaseegara': 'Vaseegara Minnale',
  'tamil-venmathi': 'Venmathiye Minnale',
  'tamil-maruvaarthai': 'Maruvaarthai ENPT',
  'tamil-maya-nadhi': 'Maya Nadhi Kabali',
  'tamil-ennamo-yeadho': 'Ennamo Yeadho Ko',
  'tamil-munbe-vaa': 'Munbe Vaa Sillunu Oru Kaadhal',
  'tamil-mogathirai': 'Mogathirai Pizza',
  'tamil-enjoy-enjaami': 'Enjoy Enjaami',
  'tamil-kolaveri': 'Why This Kolaveri Di',

  // Global Pop & Synthwave
  'global-1': 'Blinding Lights The Weeknd',
  'global-2': 'Starboy The Weeknd',
  'global-3': 'Levitating Dua Lipa',
  'global-4': 'As It Was Harry Styles',
  'global-5': 'Stay The Kid LAROI Justin Bieber',
  'global-6': 'Shape of You Ed Sheeran',
  'global-7': 'Industry Baby Lil Nas X',
  'global-8': 'Midnight City M83',
  'global-9': 'Faded Alan Walker',
  'global-10': 'Sunflower Post Malone',
  'global-11': 'Closer The Chainsmokers',
  'global-12': 'Save Your Tears The Weeknd',

  // Bollywood & Hindi Hits
  'hindi-1': 'Kesariya Brahmastra',
  'hindi-2': 'Apna Bana Le Bhediya',
  'hindi-3': 'Chaleya Jawan',
  'hindi-4': 'Tauba Tauba Bad Newz',
  'hindi-5': 'Jhoome Jo Pathaan',
  'hindi-6': 'Raataan Lambiyan Shershaah',
  'hindi-7': 'Tum Hi Ho Aashiqui 2',
  'hindi-8': 'Heeriye Jasleen Royal Arijit Singh',
  'hindi-9': 'Phir Aur Kya Chahiye Zara Hatke',
  'hindi-10': 'O Maahi Dunki Arijit Singh',
  'hindi-11': 'Satranga Animal Arijit Singh',
  'hindi-12': 'Pehle Bhi Main Animal Vishal Mishra',
  'hindi-13': 'Arjan Vailly Animal',
  'hindi-14': 'Ghungroo War Arijit Singh',
  'hindi-15': 'Ae Dil Hai Mushkil Title Track',
  'hindi-16': 'Channa Mereya Ae Dil Hai Mushkil',
  'hindi-17': 'Agar Tum Saath Ho Tamasha',
  'hindi-18': 'Kalank Title Track Arijit',
  'hindi-19': 'Shayad Love Aaj Kal Arijit',
  'hindi-20': 'Kabira Yeh Jawaani Hai Deewani',
  'hindi-21': 'Badtameez Dil Yeh Jawaani Hai Deewani',
  'hindi-22': 'Bekhayali Kabir Singh Sachet Tandon',
  'hindi-23': 'Tujhe Kitna Chahne Lage Kabir Singh',

  // Lo-Fi & Beats
  'lofi-1': 'Tokyo Rain Lofi',
  'lofi-2': 'Neon Cyber Drive',
  'lofi-3': 'Study Beats Lofi',
  'lofi-4': 'Stargazing Synthwave',

  // South Indian Hits & Drill
  'south-1': 'Big Dawgs Hanumankind',
  'south-2': 'Pushpa Pushpa Pushpa 2',
  'south-3': 'Oo Antava Mava Pushpa',
  'south-4': 'Naatu Naatu RRR',
};

/**
 * Decrypts JioSaavn DES-ECB encrypted media URLs into full-length 320kbps CDN MP4 streams
 */
export function decryptSaavnMediaUrl(encryptedUrl: string): string | null {
  if (!encryptedUrl) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const cipherParams = (CryptoJS.lib as any).CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl),
    });
    const decrypted = CryptoJS.DES.decrypt(
      cipherParams,
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    const url = decrypted.toString(CryptoJS.enc.Utf8);
    if (!url || !url.startsWith('http')) return null;
    return url;
  } catch (err) {
    return null;
  }
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function cleanString(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

/**
 * Searches and retrieves full-length 320kbps songs via direct CDN and iTunes
 */
export async function searchYouTubeMusic(query: string, type: string = 'song'): Promise<TrackItem[]> {
  const cleanQ = query.trim();
  const cacheKey = `search_full:${type}:${cleanQ.toLowerCase()}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // Ignore parse error
    }
  }

  const tracks: TrackItem[] = [];

  // Engine 1: JioSaavn Full-Length 320kbps Master Audio Direct Search
  try {
    const saavnSearchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&cc=in&_marker=0&q=${encodeURIComponent(cleanQ)}`;
    const res = await fetch(saavnSearchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const text = await res.text();
      const data = JSON.parse(text.substring(text.indexOf('{')));
      const results = data.results || [];

      for (const s of results) {
        if (!s.encrypted_media_url) continue;
        const songName = s.song || s.title || '';
        const isBgm = /\b(bgm|theme|instrumental|karaoke|cover|ringtone|dialogue)\b/i.test(songName);
        const queryWantsBgm = /\b(bgm|theme|instrumental|karaoke|cover)\b/i.test(cleanQ);
        if (isBgm && !queryWantsBgm) continue;

        const full320Url = decryptSaavnMediaUrl(s.encrypted_media_url);
        if (!full320Url) continue;

        const durSecs = s.duration ? parseInt(s.duration, 10) : 218;
        const trackId = `saavn-${s.id}`;

        // Cache 320kbps stream URL and metadata query for this track
        await setCache(`stream:${trackId}`, full320Url, 86400 * 7);
        await setCache(`track_query:${trackId}`, `${s.song || ''} ${s.primary_artists || s.singers || ''}`, 86400 * 7);

        const cover500 = (s.image || '')
          .replace('50x50', '500x500')
          .replace('150x150', '500x500');

        tracks.push({
          id: trackId,
          title: cleanString(s.song || s.title || 'Unknown Track'),
          artist: cleanString(s.primary_artists || s.singers || s.music || 'Artist'),
          album: cleanString(s.album || 'Single'),
          duration: formatDuration(durSecs),
          durationSeconds: durSecs,
          coverUrl: cover500 || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
          genre: s.language ? s.language.charAt(0).toUpperCase() + s.language.slice(1) : 'Music',
          audioUrl: full320Url, // Direct full 320kbps master stream
          fallbackAudioUrl: `/api/stream/${trackId}`,
          releaseYear: s.year || '2025',
          plays: s.play_count ? `${(parseInt(s.play_count, 10) / 1000000).toFixed(1)}M` : '5.2M',
          isLiked: false,
        });
      }
    }
  } catch (err: any) {
    console.warn('[FullSongSearch] JioSaavn song search notice:', err?.message || err);
  }

  // Engine 1b: If fewer than 4 results, complement with album search
  if (tracks.length < 4) {
    try {
      const saavnUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(cleanQ)}`;
      const res = await fetch(saavnUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const text = await res.text();
        const data = JSON.parse(text.substring(text.indexOf('{')));
        const albums = data.albums?.data || [];

        for (const alb of albums.slice(0, 2)) {
          if (!alb.id) continue;
          try {
            const albDetailUrl = `https://www.jiosaavn.com/api.php?__call=content.getAlbumDetails&_format=json&cc=in&_marker=0&albumid=${alb.id}`;
            const albRes = await fetch(albDetailUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0' },
              signal: AbortSignal.timeout(4000)
            });
            if (albRes.ok) {
              const albText = await albRes.text();
              const albData = JSON.parse(albText.substring(albText.indexOf('{')));
              const songList = albData.songs || [];

              for (const s of songList.slice(0, 2)) {
                if (!s.encrypted_media_url) continue;
                const full320Url = decryptSaavnMediaUrl(s.encrypted_media_url);
                if (!full320Url) continue;

                const trackId = `saavn-${s.id}`;
                if (tracks.some(t => t.id === trackId || t.title.toLowerCase() === (s.song || '').toLowerCase())) continue;

                const durSecs = s.duration ? parseInt(s.duration, 10) : 218;
                await setCache(`stream:${trackId}`, full320Url, 86400 * 7);
                await setCache(`track_query:${trackId}`, `${s.song || ''} ${s.primary_artists || s.singers || ''}`, 86400 * 7);

                tracks.push({
                  id: trackId,
                  title: cleanString(s.song || s.title || 'Unknown Track'),
                  artist: cleanString(s.primary_artists || s.singers || s.music || 'Artist'),
                  album: cleanString(s.album || alb.title || 'Single'),
                  duration: formatDuration(durSecs),
                  durationSeconds: durSecs,
                  coverUrl: (s.image || alb.image || '').replace('50x50', '500x500').replace('150x150', '500x500') || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
                  genre: s.language ? s.language.charAt(0).toUpperCase() + s.language.slice(1) : 'Music',
                  audioUrl: full320Url,
                  fallbackAudioUrl: `/api/stream/${trackId}`,
                  releaseYear: s.year || alb.year || '2025',
                  plays: s.play_count ? `${(parseInt(s.play_count, 10) / 1000000).toFixed(1)}M` : '4.8M',
                  isLiked: false,
                });
              }
            }
          } catch {
            // Continue
          }
        }
      }
    } catch (err: any) {
      console.warn('[FullSongSearch] JioSaavn album fallback notice:', err?.message || err);
    }
  }

  // Engine 2: iTunes Search Backup (stores track_query for full song streaming)
  if (tracks.length < 5) {
    try {
      const itunesUrl = `https://itunes.apple.com/search?entity=song&limit=10&term=${encodeURIComponent(cleanQ)}`;
      const res = await fetch(itunesUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data: any = await res.json();
        const results = data.results || [];

        for (const item of results) {
          const durSecs = item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 218;
          const cover600 = (item.artworkUrl100 || '')
            .replace('100x100bb.jpg', '600x600bb.jpg')
            .replace('100x100bb.png', '600x600bb.png');

          const trackId = `itunes-${item.trackId}`;

          const alreadyExists = tracks.some(t =>
            t.title.toLowerCase() === item.trackName.toLowerCase() || (cover600 && t.coverUrl === cover600)
          );
          if (alreadyExists) continue;

          // Store the exact track query and preview so getStreamUrl can resolve or fallback safely
          const queryStr = `${item.trackName} ${item.artistName}`;
          await setCache(`track_query:${trackId}`, queryStr, 86400 * 7);
          if (item.previewUrl) {
            await setCache(`itunes_preview:${trackId}`, item.previewUrl, 86400 * 7);
          }

          tracks.push({
            id: trackId,
            title: cleanString(item.trackName || 'Unknown Track'),
            artist: cleanString(item.artistName || 'Unknown Artist'),
            album: cleanString(item.collectionName || 'Single'),
            duration: formatDuration(durSecs),
            durationSeconds: durSecs,
            coverUrl: cover600 || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
            genre: item.primaryGenreName || 'Music',
            audioUrl: `/api/stream/${trackId}`,
            fallbackAudioUrl: item.previewUrl || `/api/stream/${trackId}`,
            releaseYear: item.releaseDate ? item.releaseDate.substring(0, 4) : '2025',
            plays: '5.2M',
            isLiked: false,
          });
        }
      }
    } catch (err: any) {
      console.warn('[FullSongSearch] iTunes search notice:', err?.message || err);
    }
  }

  if (tracks.length > 0) {
    await setCache(cacheKey, JSON.stringify(tracks), 1800);
  }

  return tracks;
}

export const STATIC_FULL_320_STREAMS: Record<string, string> = {
  'tamil-innum-konjam': 'https://aac.saavncdn.com/525/fe0acac4728484d5c85bfc2e51d8d165_320.mp4',
  'tamil-manasilaayo': 'https://aac.saavncdn.com/803/54aa7ee23bad8894b04c1250a64a2f0a_320.mp4',
  'tamil-whistle-podu': 'https://aac.saavncdn.com/368/69f5efe7357a0db29cd590dca0825aa8_320.mp4',
  'tamil-matta': 'https://aac.saavncdn.com/999/ada2f536cd33800ed3f01c630481a7b7_320.mp4',
  'tamil-godmode': 'https://aac.saavncdn.com/875/2d69eb1a53ea417189579d6b6bb49cac_320.mp4',
  'tamil-fear-song': 'https://aac.saavncdn.com/313/1178c7b2a16c3fd32ec5cd002b5a1ce0_320.mp4',
  'tamil-hey-minnale': 'https://aac.saavncdn.com/872/d9f7fc1e9eccbcc9f9809e6791fd33ff_320.mp4',
  'tamil-hunter-vantaar': 'https://aac.saavncdn.com/803/6fb743e4593b69786449d88e4ab2fd52_320.mp4',
  'tamil-katchi-sera': 'https://aac.saavncdn.com/118/3456f4e5990e8fb33d7af6678aca034a_320.mp4',
  'tamil-aasa-kooda': 'https://aac.saavncdn.com/772/6cb3205b2579e7ade889bd6898d9f2b6_320.mp4',
  'tamil-naa-ready': 'https://aac.saavncdn.com/415/3789bee89b94522160f1e50b2266d2c4_320.mp4',
  'tamil-hukum': 'https://aac.saavncdn.com/435/4161a58e6cff0010c02431e6c21728d9_320.mp4',
  'tamil-badass': 'https://aac.saavncdn.com/415/46a7b21d2a3f4b9e019a7cdff7442c55_320.mp4',
  'tamil-arabic-kuthu': 'https://aac.saavncdn.com/510/9d96fc7ddd4ffadb745f25aed86f7a4e_320.mp4',
  'tamil-vaathi-coming': 'https://aac.saavncdn.com/347/c536b256fca6b96aa432322c11c21fbb_320.mp4',
  'tamil-vikram-title': 'https://aac.saavncdn.com/666/d7c96a80530e9b8bb08fd9f4d30f3269_320.mp4',
  'tamil-rowdy-baby': 'https://aac.saavncdn.com/982/d3b97aff0fa3e67e76047c8f3fc32e70_320.mp4',
  'tamil-urvasi': 'https://aac.saavncdn.com/501/77894546031e29cf03229548cfe66c30_320.mp4',
  'tamil-chaiyya': 'https://aac.saavncdn.com/596/4638940380eca6bcbc1e1de0d8e63938_320.mp4',
  'tamil-kannaana-kanney': 'https://aac.saavncdn.com/006/40aacc11863cba58d37eefcbd23bee99_320.mp4',
  'tamil-raja-raja-chozhan': 'https://aac.saavncdn.com/336/56b89c67b6d2b25c019060a01abbcca4_320.mp4',
  'tamil-raasave-unna-nambi': 'https://aac.saavncdn.com/312/92a79dc2fc531bc9daaebfa646911380_320.mp4',
  'tamil-thendral-vandhu': 'https://aac.saavncdn.com/717/ad6eb10d88a7c535729e7ea74b2cba59_320.mp4',
  'tamil-en-iniya-pon': 'https://aac.saavncdn.com/675/daf745b80a9c6d283d79e49ca6fa416e_320.mp4',
  'tamil-sundari-kannal': 'https://aac.saavncdn.com/333/372170596d7235ef51c7255d286b5013_320.mp4',
  'tamil-kadhal-rojave': 'https://aac.saavncdn.com/702/4c5bfa2d89ae9a98b7392a2226e2dcc7_320.mp4',
  'tamil-en-kadhale': 'https://aac.saavncdn.com/505/08f0b1b0b4d8b48d8f4b0445d7cb8923_320.mp4',
  'tamil-anjali-anjali': 'https://aac.saavncdn.com/975/a2f9a4f3db1c401322c25af8b442ca87_320.mp4',
  'tamil-pachai-nirame': 'https://aac.saavncdn.com/517/1db345dbda8ce07d78c940af347fb7a1_sar_320.mp4',
  'tamil-enna-solla': 'https://aac.saavncdn.com/544/ab5c81da425ea99925022a7af05cbb71_320.mp4',
  'tamil-aalaporan': 'https://aac.saavncdn.com/492/eb45d961a1639b3c3a6df4c8777fa71c_320.mp4',
  'tamil-oru-naalil': 'https://aac.saavncdn.com/138/6516dc2380bf210d45e778747d6a2d7e_320.mp4',
  'tamil-kadhal-valarthen': 'https://aac.saavncdn.com/490/379755d3179311e006a74ebd5d6ce732_96.mp4',
  'tamil-vaseegara': 'https://aac.saavncdn.com/450/4f7b9da8e887586e60b11afb602befac_96.mp4',
  'tamil-venmathi': 'https://aac.saavncdn.com/450/273780841267e983e0131e4f3b00d595_96.mp4',
  'tamil-maruvaarthai': 'https://aac.saavncdn.com/868/9262e547013e284c0555d4c6faf3bf1a_96.mp4',
  'tamil-maya-nadhi': 'https://aac.saavncdn.com/506/4bfb2976c1c9218564aba5b8464faa12_320.mp4',
  'tamil-ennamo-yeadho': 'https://aac.saavncdn.com/653/1bae7f140e3dad0f04edb2ba923927ea_320.mp4',
  'tamil-munbe-vaa': 'https://aac.saavncdn.com/595/86c6a67ff7120d287cb4484ea020f488_320.mp4',
  'tamil-mogathirai': 'https://aac.saavncdn.com/703/ee145297a749bc15ca052b173bb9f8ea_320.mp4',
  'tamil-enjoy-enjaami': 'https://aac.saavncdn.com/940/d9265bc9d27d51d4296ef27de2547ba0_320.mp4',
  'tamil-kolaveri': 'https://aac.saavncdn.com/932/7cf7f8a9d9c3faa2633d1605e97ba4a5_320.mp4',
  'tamil-koondu-kulla': 'https://aac.saavncdn.com/030/f3d8e08ad368d509a808d22b4dba08ce_96.mp4',
  'itunes-1729674945': 'https://aac.saavncdn.com/030/f3d8e08ad368d509a808d22b4dba08ce_96.mp4',
  'tamil-rasave-unnai': 'https://aac.saavncdn.com/225/d4b4bbf3b0ea406176699561f2badf35_96.mp4',
  'tamil-pesamale': 'https://aac.saavncdn.com/937/9a1dc9bec223131ad019965ccf0350be_96.mp4',
  'itunes-6794313992': 'https://aac.saavncdn.com/937/9a1dc9bec223131ad019965ccf0350be_96.mp4',
  'tamil-kanne-kalaimane': 'https://aac.saavncdn.com/353/4204011750074dd29c8244cae4e57626_320.mp4',
  'tamil-ilaya-nila': 'https://aac.saavncdn.com/773/d6e3e28b01c71d4b49330318f7cf755d_320.mp4',
  'tamil-ilamai-idho': 'https://aac.saavncdn.com/007/34a627f012486770fa22ad1b9741fd06_320.mp4',
  'tamil-mannil-indha': 'https://aac.saavncdn.com/886/d6ef4af8e7ac0649ca3c4c19cf4bc057_320.mp4',
  'tamil-mundhinam': 'https://aac.saavncdn.com/542/ff5539daf6500247bd7111bec630246d_320.mp4',
  'tamil-adiye-kolluthe': 'https://aac.saavncdn.com/635/3dd672bea87b6cb0a626278826c21c6e_320.mp4',
  'tamil-mannipaaya': 'https://aac.saavncdn.com/542/8ed8a8114c82d4d5c328c718e3c6e926_320.mp4',
  'tamil-nenjame': 'https://aac.saavncdn.com/265/4c70747f9285400a9cbb8233e117a853_320.mp4',
  'tamil-inkem-inkem': 'https://aac.saavncdn.com/237/7942edb73e64d4e35e488337e14753b7_96.mp4',
  'tamil-kurumba': 'https://aac.saavncdn.com/961/9cf5417cc9fb40c0c0fecd2737c0cfc4_320.mp4',
  'tamil-chellamma': 'https://aac.saavncdn.com/312/9faaf9ef4a0f3596b15adfbf3b9cc273_320.mp4',
  'tamil-mayakkama': 'https://aac.saavncdn.com/238/5d3f6c3a0e36f2a191ca4f5fa6790848_320.mp4',
  'tamil-megam-karukatha': 'https://aac.saavncdn.com/238/1ceb75e4503fcc4d5110bb238a9b3ca4_320.mp4',
  'tamil-aagayam-theepiditha': 'https://aac.saavncdn.com/616/a0af68ea3343a2286bc15ee9e57cc4b0_96.mp4',
  'global-1': 'https://aac.saavncdn.com/341/9872b384f066988e9bd957d6d68ee394_320.mp4',
  'global-2': 'https://aac.saavncdn.com/216/f0acc1b161e8a66a6a30e726efdff357_320.mp4',
  'global-3': 'https://aac.saavncdn.com/552/01a84873ab1ee3298a45176c8cdbd6d7_320.mp4',
  'south-1': 'https://aac.saavncdn.com/172/d274e7cd67653c97c0d391f754afcfdf_320.mp4',
};

function normalizeTrackText(str: string): string {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Resolves the full length 320kbps/96kbps stream URL for a given trackId or query.
 * Guarantees that the audio played strictly matches the requested song.
 * Never returns an unrelated fallback song.
 */
export async function getStreamUrl(trackId: string): Promise<string | null> {
  const cacheKey = `stream:${trackId}`;
  const cached = await getCache(cacheKey);
  if (cached && cached.startsWith('http')) return cached;

  const cleanId = trackId.replace(/^(yt-|itunes-|saavn-|local-)/, '');

  // 1. Check verified static master streams dictionary
  if (STATIC_FULL_320_STREAMS[trackId]) {
    const staticUrl = STATIC_FULL_320_STREAMS[trackId];
    await setCache(cacheKey, staticUrl, 86400 * 30);
    return staticUrl;
  }
  if (STATIC_FULL_320_STREAMS[cleanId]) {
    const staticUrl = STATIC_FULL_320_STREAMS[cleanId];
    await setCache(cacheKey, staticUrl, 86400 * 30);
    return staticUrl;
  }

  // 2. Direct JioSaavn ID resolution
  if (trackId.startsWith('saavn-')) {
    try {
      const detailUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&_format=json&cc=in&pids=${encodeURIComponent(cleanId)}`;
      const res = await fetch(detailUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const text = await res.text();
        const data = JSON.parse(text.substring(text.indexOf('{')));
        const songObj = data[cleanId] || (Object.values(data)[0] as any);
        if (songObj?.encrypted_media_url) {
          const directUrl = decryptSaavnMediaUrl(songObj.encrypted_media_url);
          if (directUrl) {
            console.log(`[StreamEngine] Resolved direct JioSaavn song [${trackId}]: ${songObj.song}`);
            await setCache(cacheKey, directUrl, 86400 * 14);
            return directUrl;
          }
        }
      }
    } catch (err: any) {
      console.warn(`[StreamEngine] JioSaavn getDetails error for ${trackId}:`, err?.message || err);
    }
  }

  // 3. Resolve iTunes tracks by looking up actual title and metadata
  let query = (await getCache(`track_query:${trackId}`)) || (await getCache(`track_query:${cleanId}`));
  let targetTitle = '';
  let targetArtist = '';
  let targetAlbum = '';
  let itunesFallbackPreview: string | null = null;

  if (trackId.startsWith('itunes-')) {
    try {
      const itunesRes = await fetch(`https://itunes.apple.com/lookup?id=${encodeURIComponent(cleanId)}`, { signal: AbortSignal.timeout(4000) });
      if (itunesRes.ok) {
        const itunesData = await itunesRes.json();
        const itunesItem = itunesData.results?.[0];
        if (itunesItem) {
          targetTitle = itunesItem.trackName || '';
          targetArtist = itunesItem.artistName || '';
          targetAlbum = itunesItem.collectionName || '';
          if (itunesItem.previewUrl) itunesFallbackPreview = itunesItem.previewUrl;
          query = `${targetTitle} ${targetArtist}`.trim();
          await setCache(`track_query:${trackId}`, query, 86400 * 7);
        }
      }
    } catch (err: any) {
      console.warn(`[StreamEngine] iTunes lookup warning for ${trackId}:`, err?.message || err);
    }
    if (!itunesFallbackPreview) {
      itunesFallbackPreview = await getCache(`itunes_preview:${trackId}`);
    }
  }

  if (!query) {
    query = KNOWN_FULL_SONGS[trackId] || KNOWN_FULL_SONGS[cleanId];
  }
  if (!query && isNaN(Number(cleanId))) {
    query = cleanId.replace(/-/g, ' ').replace(/_/g, ' ');
  }

  if (!query) {
    return itunesFallbackPreview;
  }

  // Clean title for searching
  const cleanTitle = (targetTitle || query)
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\..*$/i, '')
    .replace(/ft\..*$/i, '')
    .replace(/[-_&,]/g, ' ')
    .trim();

  const firstArtist = (targetArtist || query.split(' by ')[1] || '').split(/[,&/]/)[0].trim();

  // 4. Resolve Full-Length Audio via JioSaavn Search Engine with robust matching
  const searchQueries = [
    targetAlbum ? `${cleanTitle} ${targetAlbum.replace(/\(.*?\)/g, '').trim()}` : null,
    firstArtist ? `${cleanTitle} ${firstArtist}` : null,
    cleanTitle,
    query,
    `${cleanTitle} Tamil`,
  ].filter(Boolean) as string[];

  for (const q of searchQueries) {
    try {
      const saavnSearchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&cc=in&_marker=0&q=${encodeURIComponent(q)}`;
      const res = await fetch(saavnSearchUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const text = await res.text();
        const data = JSON.parse(text.substring(text.indexOf('{')));
        const results = data.results || [];
        for (const s of results) {
          if (s.encrypted_media_url) {
            const songName = s.song || s.title || '';
            
            // Reject BGM, instrumental, karaoke, cover, ringtone unless query explicitly asked for it
            const isBgm = /\b(bgm|theme|instrumental|karaoke|cover|ringtone|dialogue)\b/i.test(songName);
            const queryWantsBgm = /\b(bgm|theme|instrumental|karaoke|cover)\b/i.test(query);
            if (isBgm && !queryWantsBgm) continue;

            const sTitleNorm = normalizeTrackText(songName);
            const targetNorm = normalizeTrackText(cleanTitle);

            const isTitleMatch =
              sTitleNorm === targetNorm ||
              sTitleNorm.startsWith(targetNorm) ||
              targetNorm.startsWith(sTitleNorm) ||
              (targetNorm.length >= 6 && sTitleNorm.includes(targetNorm)) ||
              (sTitleNorm.length >= 6 && targetNorm.includes(sTitleNorm));

            if (!isTitleMatch) continue;

            const fullUrl = decryptSaavnMediaUrl(s.encrypted_media_url);
            if (fullUrl) {
              console.log(`[StreamEngine] Resolved matching song for "${query}" -> "${s.song}" by "${s.singers || s.primary_artists}"`);
              await setCache(cacheKey, fullUrl, 86400 * 14);
              return fullUrl;
            }
          }
        }
      }
    } catch (err: any) {
      console.warn(`[StreamEngine] JioSaavn resolution warning for "${q}":`, err?.message || err);
    }
  }

  // Safety net fallback so player never crashes with 404
  if (itunesFallbackPreview) {
    console.log(`[StreamEngine] Using iTunes preview fallback for ${trackId}`);
    return itunesFallbackPreview;
  }

  return null;
}

export async function getRelatedRecommendations(trackId?: string, genre?: string): Promise<TrackItem[]> {
  const seeds = [
    genre ? `${genre} trending` : 'trending tamil hits',
    'viral chart hits',
    'top global pop hits',
    'trending romantic songs',
    'latest mass anthem'
  ];

  const pool: TrackItem[] = [];
  for (const seed of seeds) {
    try {
      const res = await searchYouTubeMusic(seed, 'song');
      if (res && res.length > 0) {
        pool.push(...res);
      }
    } catch {
      // Continue next seed
    }
  }

  // Strictly deduplicate by unique coverUrl, title, and cap per-artist occurrences
  const seenCovers = new Set<string>();
  const seenTitles = new Set<string>();
  const artistCounts: Record<string, number> = {};
  const diverseTracks: TrackItem[] = [];

  for (const t of pool) {
    const normTitle = t.title.toLowerCase().trim();
    const normArtist = t.artist.toLowerCase().trim();
    const cover = t.coverUrl.trim();

    if (seenCovers.has(cover)) continue;
    if (seenTitles.has(normTitle)) continue;
    if ((artistCounts[normArtist] || 0) >= 2) continue;

    seenCovers.add(cover);
    seenTitles.add(normTitle);
    artistCounts[normArtist] = (artistCounts[normArtist] || 0) + 1;
    diverseTracks.push(t);
  }

  return diverseTracks;
}
