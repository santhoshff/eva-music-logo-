import { Readable } from 'node:stream';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const audioUrl = req.query.url;
  if (!audioUrl || !audioUrl.startsWith('http')) {
    return res.status(400).send('Missing valid audio url');
  }

  try {
    const upstreamHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': 'https://www.jiosaavn.com/',
    };
    if (req.headers.range) {
      upstreamHeaders['Range'] = req.headers.range;
    }

    const upstream = await fetch(audioUrl, { headers: upstreamHeaders });

    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'audio/mp4');

    const contentRange = upstream.headers.get('content-range');
    if (contentRange) res.setHeader('Content-Range', contentRange);

    const contentLength = upstream.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);

    res.status(upstream.status);

    if (req.method === 'HEAD') {
      return res.end();
    }

    if (upstream.body) {
      const nodeStream = Readable.fromWeb(upstream.body);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    console.error('Stream proxy error:', err);
    res.redirect(audioUrl);
  }
}
