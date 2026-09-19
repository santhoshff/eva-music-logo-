import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import CryptoJS from 'crypto-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const musicDataPath = path.resolve(__dirname, '../src/data/musicData.ts');
let content = fs.readFileSync(musicDataPath, 'utf8');

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
  } catch (err) {
    return null;
  }
}

const SEARCH_QUERIES = {
  'tamil-innum-konjam': 'Innum Konjam Naeram Maryan',
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
  'tamil-ennamo-yeadho': 'Ennamo Yeadho Ko',
  'tamil-munbe-vaa': 'Munbe Vaa Sillunu Oru Kaadhal',
  'tamil-mogathirai': 'Mogathirai Pizza',
  'tamil-enjoy-enjaami': 'Enjoy Enjaami',
  'tamil-kolaveri': 'Why This Kolaveri Di',

  // Global & English Hits
  'global-1': 'Blinding Lights The Weeknd',
  'global-2': 'Starboy The Weeknd',
  'global-3': 'Levitating Dua Lipa',

  // South Hits
  'south-1': 'Big Dawgs Hanumankind',
};

async function searchSaavn(query) {
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&cc=in&_marker=0&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const text = await res.text();
      const data = JSON.parse(text.substring(text.indexOf('{')));
      const results = data.results || [];
      for (const s of results) {
        if (s.encrypted_media_url) {
          const fullUrl = decryptSaavnMediaUrl(s.encrypted_media_url);
          if (fullUrl) {
            return {
              fullUrl,
              title: s.song,
              artist: s.primary_artists || s.singers,
              duration: parseInt(s.duration || '218', 10),
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

async function main() {
  console.log(`Resolving FULL-LENGTH 320kbps streams for all songs...`);
  const fullSongsMap = {};

  for (const [id, query] of Object.entries(SEARCH_QUERIES)) {
    process.stdout.write(`Resolving "${id}" (${query})... `);
    const result = await searchSaavn(query);
    if (result) {
      fullSongsMap[id] = result;
      console.log(`✔ [${result.title} (${result.duration}s)] -> ${result.fullUrl}`);
    } else {
      console.log(`✖ No result found`);
    }
    await new Promise(r => setTimeout(r, 150));
  }

  // Save map to file
  fs.writeFileSync(path.resolve(__dirname, 'fullSongsMap.json'), JSON.stringify(fullSongsMap, null, 2));

  // Now replace audioUrl in musicData.ts with the full 320kbps URL and update durationSeconds!
  for (const [id, data] of Object.entries(fullSongsMap)) {
    const idEscaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Replace audioUrl
    const urlRegex = new RegExp(`(id:\\s*'${idEscaped}',[\\s\\S]*?audioUrl:\\s*')([^']+)(')`, 'g');
    content = content.replace(urlRegex, `$1${data.fullUrl}$3`);

    // Replace durationSeconds
    if (data.duration && data.duration > 30) {
      const durRegex = new RegExp(`(id:\\s*'${idEscaped}',[\\s\\S]*?durationSeconds:\\s*)([0-9]+)`, 'g');
      content = content.replace(durRegex, `$1${data.duration}`);

      // Also update duration string e.g. "3:45"
      const mins = Math.floor(data.duration / 60);
      const secs = data.duration % 60;
      const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      const durStrRegex = new RegExp(`(id:\\s*'${idEscaped}',[\\s\\S]*?duration:\\s*')([^']+)(')`, 'g');
      content = content.replace(durStrRegex, `$1${formatted}$3`);
    }
  }

  fs.writeFileSync(musicDataPath, content, 'utf8');
  console.log(`\n🎉 Successfully updated ${Object.keys(fullSongsMap).length} songs with FULL-LENGTH 320kbps streams!`);
}

main().catch(console.error);
