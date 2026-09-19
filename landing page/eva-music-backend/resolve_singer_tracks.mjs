import CryptoJS from 'crypto-js';
import fs from 'fs';

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

const songsToFind = [
  // Ilaiyaraaja
  { id: 'tamil-raasave-unna-nambi', title: 'Raasave Unna Nambi', query: 'Raasave Unna Nambi', artist: 'Ilaiyaraaja & S. Janaki', album: 'Mudhal Mariyathai' },
  { id: 'tamil-thendral-vandhu', title: 'Thendral Vandhu Theendumbothu', query: 'Thendral Vanthu Avatharam', artist: 'Ilaiyaraaja & S. Janaki', album: 'Avatharam' },
  { id: 'tamil-kanne-kalaimane', title: 'Kanne Kalaimane', query: 'Kanne Kalaimane', artist: 'Ilaiyaraaja & K. J. Yesudas', album: 'Moondram Pirai' },
  { id: 'tamil-ilaya-nila', title: 'Ilaya Nila Pozhigirathe', query: 'Ilaya Nila Pozhigirathe', artist: 'Ilaiyaraaja & S. P. Balasubrahmanyam', album: 'Payanangal Mudivadhillai' },
  { id: 'tamil-sundari-kannal', title: 'Sundari Kannal Oru Sethi', query: 'Sundari Kannal', artist: 'Ilaiyaraaja, SPB & S. Janaki', album: 'Thalapathi' },
  { id: 'tamil-en-iniya-pon', title: 'En Iniya Pon Nilave', query: 'En Iniya Pon Nilave Moodu Pani', artist: 'Ilaiyaraaja & K. J. Yesudas', album: 'Moodu Pani' },

  // SPB
  { id: 'tamil-ilamai-idho', title: 'Ilamai Idho Idho', query: 'Ilamai Idho Idho', artist: 'S. P. Balasubrahmanyam', album: 'Sakalakala Vallavan' },
  { id: 'tamil-kadhal-rojave', title: 'Kadhal Rojave', query: 'Kadhal Rojave Roja', artist: 'S. P. Balasubrahmanyam & Sujatha', album: 'Roja' },
  { id: 'tamil-en-kadhale', title: 'En Kadhale En Kadhale', query: 'En Kaadhale Duet', artist: 'S. P. Balasubrahmanyam', album: 'Duet' },
  { id: 'tamil-mannil-indha', title: 'Mannil Indha Kaadhalandri', query: 'Mannil Indha Kadhalandri', artist: 'S. P. Balasubrahmanyam', album: 'Keladi Kanmani' },
  { id: 'tamil-anjali-anjali', title: 'Anjali Anjali Pushpanjali', query: 'Anjali Anjali Duet', artist: 'S. P. Balasubrahmanyam & K. S. Chithra', album: 'Duet' },

  // AR Rahman
  { id: 'tamil-pachai-nirame', title: 'Pachai Nirame', query: 'Pachai Nirame Alaipayuthey', artist: 'A. R. Rahman & Hariharan', album: 'Alaipayuthey' },
  { id: 'tamil-enna-solla', title: 'Enna Solla Pogirai', query: 'Enna Solla Pogirai', artist: 'A. R. Rahman & Shankar Mahadevan', album: 'Kandukondain Kandukondain' },
  { id: 'tamil-aalaporan', title: 'Aalaporaan Thamizhan', query: 'Aalaporaan Thamizhan Mersal', artist: 'A. R. Rahman, Kailash Kher & Sathya Prakash', album: 'Mersal' },
  { id: 'tamil-nenjame', title: 'Nenjame Nenjame', query: 'Nenjame Nenjame Maamannan', artist: 'A. R. Rahman, Vijay Yesudas & Shakthisree Gopalan', album: 'Maamannan' },

  // Yuvan Shankar Raja
  { id: 'tamil-oru-naalil', title: 'Oru Naalil', query: 'Oru Naalil Pudhupettai', artist: 'Yuvan Shankar Raja', album: 'Pudhupettai' },
  { id: 'tamil-loosu-penne', title: 'Loosu Penne', query: 'Loosu Penne', artist: 'Yuvan Shankar Raja & Silambarasan', album: 'Vallavan' },
  { id: 'tamil-kadhal-valarthen', title: 'Kadhal Valarthen', query: 'Kadhal Valarthen Manmadhan', artist: 'Yuvan Shankar Raja & KK', album: 'Manmadhan' },

  // Harris Jayaraj
  { id: 'tamil-vaseegara', title: 'Vaseegara', query: 'Vaseegara Minnale', artist: 'Harris Jayaraj & Bombay Jayashri', album: 'Minnale' },
  { id: 'tamil-venmathi', title: 'Venmathi Venmathiye', query: 'Venmathiye Minnale', artist: 'Harris Jayaraj, Tippu & Roop Kumar Rathod', album: 'Minnale' },
  { id: 'tamil-mundhinam', title: 'Mundhinam Paarthene', query: 'Mundhinam Paarthene Vaaranam Aayiram', artist: 'Harris Jayaraj & Naresh Iyer', album: 'Vaaranam Aayiram' },
  { id: 'tamil-adiye-kolluthe', title: 'Adiye Kolluthe', query: 'Adiye Kolluthe', artist: 'Harris Jayaraj, Benny Dayal & Krish', album: 'Vaaranam Aayiram' },

  // Sid Sriram
  { id: 'tamil-maruvaarthai', title: 'Maruvaarthai', query: 'Maruvaarthai Enai Noki Paayum Thota', artist: 'Darbuka Siva & Sid Sriram', album: 'Enai Noki Paayum Thota' },
  { id: 'tamil-inkem-inkem', title: 'Inkem Inkem Inkem Kaavaale', query: 'Inkem Inkem Inkem Kaavaale Geetha Govindam', artist: 'Gopi Sundar & Sid Sriram', album: 'Geetha Govindam' },

  // Shreya Ghoshal
  { id: 'tamil-mannipaaya', title: 'Mannipaaya', query: 'Mannipaaya Vinnaithaandi Varuvaayaa', artist: 'A. R. Rahman & Shreya Ghoshal', album: 'Vinnaithaandi Varuvaayaa' },
  { id: 'tamil-ayyayyo', title: 'Ayyayyo', query: 'Ayyayyo Anandham Aadukalam', artist: 'G. V. Prakash Kumar, SPB Charan & Shreya Ghoshal', album: 'Aadukalam' },

  // Pradeep Kumar
  { id: 'tamil-maya-nadhi', title: 'Maya Nadhi', query: 'Maya Nadhi Kabali', artist: 'Santhosh Narayanan, Pradeep Kumar & Ananthu', album: 'Kabali' },
  { id: 'tamil-aagayam-theepiditha', title: 'Aagayam Theepiditha', query: 'Aagayam Theepiditha Madras', artist: 'Santhosh Narayanan & Pradeep Kumar', album: 'Madras' },
];

async function resolveAll() {
  const resolved = [];

  for (const s of songsToFind) {
    try {
      const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&cc=in&_marker=0&q=${encodeURIComponent(s.query)}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const text = await res.text();
      const data = JSON.parse(text.substring(text.indexOf('{')));
      const results = data.results || [];

      let found = null;
      for (const item of results) {
        if (item.encrypted_media_url) {
          const direct = decryptSaavnMediaUrl(item.encrypted_media_url);
          if (direct) {
            // Verify link works
            const headRes = await fetch(direct, { method: 'HEAD' });
            if (headRes.ok) {
              found = {
                id: s.id,
                title: s.title,
                artist: s.artist,
                album: s.album,
                duration: item.duration ? `${Math.floor(parseInt(item.duration, 10) / 60)}:${(parseInt(item.duration, 10) % 60).toString().padStart(2, '0')}` : '4:15',
                durationSeconds: item.duration ? parseInt(item.duration, 10) : 255,
                coverUrl: (item.image || '').replace('50x50', '500x500').replace('150x150', '500x500'),
                audioUrl: direct,
                matchedSong: item.song,
                matchedSingers: item.singers
              };
              break;
            }
          }
        }
      }

      if (found) {
        resolved.push(found);
        console.log(`[RESOLVED] ${s.title} -> "${found.matchedSong}" (${found.audioUrl.substring(0, 50)}...)`);
      } else {
        console.log(`[NOT FOUND] ${s.title}`);
      }
    } catch (e) {
      console.error(`[ERROR] ${s.title}:`, e.message);
    }
  }

  console.log(`\nSuccessfully resolved ${resolved.length}/${songsToFind.length} songs!`);
  fs.writeFileSync('d:/all/ai agent/eva music/eva-music-backend/resolved_singer_songs.json', JSON.stringify(resolved, null, 2));
}

resolveAll();
