import { Innertube } from 'youtubei.js';

async function test() {
  try {
    console.log('Initializing Innertube...');
    const yt = await Innertube.create();
    console.log('Searching for "Pesamale"...');
    const search = await yt.search('Pesamale song');
    console.log('Search videos count:', search.videos?.length);
    if (search.videos && search.videos.length > 0) {
      const vid = search.videos[0];
      console.log('First video:', vid.title?.text, vid.id);
      const info = await yt.getInfo(vid.id);
      const audioFormat = info.chooseFormat({ type: 'audio', quality: 'best' });
      const directUrl = audioFormat?.decipher(yt.session.player);
      console.log('Direct audio URL found:', !!directUrl);
      console.log('Direct audio URL prefix:', directUrl?.substring(0, 80));
    }
  } catch (err) {
    console.error('Innertube error:', err);
  }
}

test();
