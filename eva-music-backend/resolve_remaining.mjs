import CryptoJS from 'crypto-js';

function decryptSaavnMediaUrl(encryptedUrl) {
  if (!encryptedUrl) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) });
    const decrypted = CryptoJS.DES.decrypt(cipherParams, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    const url = decrypted.toString(CryptoJS.enc.Utf8);
    return (url && url.startsWith('http')) ? url : null;
  } catch {
    return null;
  }
}

const queries = [
  { id: 'tamil-kanne-kalaimane', q: 'Kanne Kalaimane' },
  { id: 'tamil-mannil-indha', q: 'Mannil Intha Kadhal' },
  { id: 'tamil-nenjame', q: 'Nenjame Nenjame' },
  { id: 'tamil-loosu-penne', q: 'Loosu Penne' },
  { id: 'tamil-mundhinam', q: 'Mundhinam Paarthene' },
  { id: 'tamil-adiye-kolluthe', q: 'Adiye Kolluthe' },
  { id: 'tamil-mannipaaya', q: 'Mannipaaya' },
  { id: 'tamil-ayyayyo', q: 'Ayyayyo' },
  { id: 'tamil-aagayam-theepiditha', q: 'Aagayam Theepiditha' }
];

async function run() {
  for (const item of queries) {
    try {
      const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&cc=in&_marker=0&q=${encodeURIComponent(item.q)}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const text = await res.text();
      const data = JSON.parse(text.substring(text.indexOf('{')));
      const first = data.results?.find(r => r.encrypted_media_url);
      if (first) {
        const direct = decryptSaavnMediaUrl(first.encrypted_media_url);
        const head = await fetch(direct, { method: 'HEAD' });
        console.log(`'${item.id}': '${direct}', // ${first.song} (${(head.headers.get('content-length')/(1024*1024)).toFixed(2)} MB, status ${head.status})`);
      } else {
        console.log(`NO RESULTS for ${item.q}`);
      }
    } catch (e) {
      console.log(`ERROR for ${item.q}: ${e.message}`);
    }
  }
}

run();
