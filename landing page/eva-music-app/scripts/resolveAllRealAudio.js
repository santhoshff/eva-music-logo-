import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const musicDataPath = path.resolve(__dirname, '../src/data/musicData.ts');
let content = fs.readFileSync(musicDataPath, 'utf8');

// Explicit search terms for known iconic hits to guarantee 100% exact matches
const KNOWN_EXACT_SEARCHES = {
  'tamil-innum-konjam': 'Innum Konjam Naeram Maryan',
  'tamil-manasilaayo': 'Manasilaayo Vettaiyan',
  'tamil-whistle-podu': 'Whistle Podu GOAT',
  'tamil-matta': 'Matta GOAT',
  'tamil-godmode': 'God Mode Karuppu',
  'tamil-fear-song': 'Fear Song Devara',
  'tamil-hey-minnale': 'Hey Minnale Amaran',
  'tamil-hunter-vantaar': 'Hunter Vantaar Vettaiyan',
  'tamil-katchi-sera': 'Katchi Sera Sai Abhyankkar',
  'tamil-aasa-kooda': 'Aasa Kooda Sai Abhyankkar',
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
  'tamil-ennamo-yeadho': 'Ennamo Yeadho Ko',
  'tamil-munbe-vaa': 'Munbe Vaa Sillunu Oru Kaadhal',
  'tamil-mogathirai': 'Mogathirai Pizza',
  'tamil-enjoy-enjaami': 'Enjoy Enjaami',
  'tamil-kolaveri': 'Why This Kolaveri Di',

  // Global & English Hits
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

  // Hindi Hits
  'hindi-1': 'Kesariya Brahmastra',
  'hindi-2': 'Apna Bana Le Bhediya',
  'hindi-3': 'Chaleya Jawan',
  'hindi-4': 'Tauba Tauba Bad Newz',
  'hindi-5': 'Jhoome Jo Pathaan',
  'hindi-6': 'Raataan Lambiyan Shershaah',
  'hindi-7': 'Tum Hi Ho Aashiqui 2',
  'hindi-8': 'Heeriye Jasleen Royal Arijit Singh',

  // South Hits
  'south-1': 'Big Dawgs Hanumankind',
  'south-2': 'Pushpa Pushpa Pushpa 2',
  'south-3': 'Oo Antava Mava Pushpa',
  'south-4': 'Naatu Naatu RRR',
};

async function queryItunes(term, country = 'IN') {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=${country}&entity=song&limit=5`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        for (const item of data.results) {
          if (item.previewUrl) {
            return {
              previewUrl: item.previewUrl,
              trackName: item.trackName,
              artistName: item.artistName
            };
          }
        }
      }
    }
  } catch (err) {
    // Continue
  }
  return null;
}

async function searchTrack(id, title, artist) {
  // 1. Check known explicit search query
  if (KNOWN_EXACT_SEARCHES[id]) {
    const term = KNOWN_EXACT_SEARCHES[id];
    let res = await queryItunes(term, 'IN');
    if (!res) res = await queryItunes(term, 'US');
    if (res) return res;
  }

  // 2. Clean title and artist
  const cleanTitle = title
    .replace(/\(From "[^"]+"\)/gi, '')
    .replace(/\([^)]+\)/g, '')
    .replace(/[-–—]/g, ' ')
    .trim();
  const primaryArtist = artist.split(/[,&]/)[0].trim();
  const fullTerm = `${cleanTitle} ${primaryArtist}`;

  let res = await queryItunes(fullTerm, 'IN');
  if (!res) res = await queryItunes(fullTerm, 'US');
  if (!res) res = await queryItunes(cleanTitle, 'IN');
  if (!res) res = await queryItunes(cleanTitle, 'US');

  return res;
}

async function main() {
  const trackBlockRegex = /{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*artist:\s*'([^']+)'/g;
  const matches = [];
  let match;
  while ((match = trackBlockRegex.exec(content)) !== null) {
    matches.push({
      id: match[1],
      title: match[2],
      artist: match[3],
    });
  }

  console.log(`Resolving real Apple Music CDN streams for ${matches.length} tracks...`);
  const audioMap = {};

  for (let i = 0; i < matches.length; i++) {
    const { id, title, artist } = matches[i];
    process.stdout.write(`[${i + 1}/${matches.length}] "${title}"... `);

    const found = await searchTrack(id, title, artist);
    if (found) {
      audioMap[id] = found.previewUrl;
      console.log(`✔ [${found.trackName} - ${found.artistName}]`);
    } else {
      console.log(`✖ No online stream found, leaving fallback`);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  fs.writeFileSync(path.resolve(__dirname, 'resolvedAudioMap.json'), JSON.stringify(audioMap, null, 2));

  // Update musicData.ts
  for (const [id, previewUrl] of Object.entries(audioMap)) {
    const idEscaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(id:\\s*'${idEscaped}',[\\s\\S]*?audioUrl:\\s*')([^']+)(')`, 'g');
    content = content.replace(regex, `$1${previewUrl}$3`);
  }

  fs.writeFileSync(musicDataPath, content, 'utf8');
  console.log(`\n🎉 Successfully resolved ${Object.keys(audioMap).length} / ${matches.length} tracks with REAL original audio streams!`);
}

main().catch(console.error);
