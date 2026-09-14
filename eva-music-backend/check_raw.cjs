const CryptoJS = require('crypto-js');

function decryptRaw(encryptedUrl) {
  const key = CryptoJS.enc.Utf8.parse('38346591');
  const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) });
  const decrypted = CryptoJS.DES.decrypt(cipherParams, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

const queries = ['Vaseegara Minnale Bombay', 'Venmathiye Minnale', 'Maruvaarthai', 'Kabali Maya Nadhi', 'Kadhal Valarthen Manmadhan'];

async function test() {
  for (const q of queries) {
    const res = await fetch('https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&cc=in&_marker=0&q=' + encodeURIComponent(q), { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await res.text();
    const data = JSON.parse(text.substring(text.indexOf('{')));
    for (const s of (data.results || []).slice(0, 2)) {
      if (s.encrypted_media_url) {
        const raw = decryptRaw(s.encrypted_media_url);
        const head = await fetch(raw, { method: 'HEAD' });
        console.log(s.song, raw, head.status, head.headers.get('content-type'), (Number(head.headers.get('content-length'))/1024/1024).toFixed(2) + ' MB');
      }
    }
  }
}
test();
