import { Track, Playlist, Artist, GenreCategory } from '../types';

export const INITIAL_TRACKS: Track[] = [
  // ==================== LATEST TAMIL NEW RELEASES & EVERGREEN CLASSICS ====================
  {
    id: 'tamil-innum-konjam',
    title: 'Innum Konjam Naeram (From "Maryan")',
    artist: 'A.R. Rahman, Vijay Prakash & Shweta Mohan',
    album: 'Maryan',
    duration: '5:14',
    durationSeconds: 314,
    genre: 'Tamil Melodies',
    isLiked: false,
    coverUrl: 'https://c.saavncdn.com/525/Maryan-Tamil-2013-20190822133839-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/525/fe0acac4728484d5c85bfc2e51d8d165_320.mp4',
    fallbackAudioUrl: '/api/stream/tamil-innum-konjam',
    releaseYear: '2013',
    plays: '185M',
    lyrics: [
      'Innum konjam naeram irundha thaan enna,',
      'Aen avasaram enna avasaram pogalaam vaa...',
      'Kooda vandhu neeyum theriyum pothu kooda thoondudhae,',
      'Paadha mudinthu poaghum velai paarkka thoondudhae...',
      'Nenjikkullae nenjikkullae unna vachirukken!'
    ]
  },
  {
    id: 'tamil-manasilaayo',
    title: 'Manasilaayo (From "Vettaiyan")',
    artist: 'Anirudh Ravichander, Malaysia Vasudevan & Yugendran',
    album: 'Vettaiyan',
    duration: '3:45',
    durationSeconds: 225,
    genre: 'Tamil Mass Hits',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b5/fa/46/b5fa4632-dd53-32fc-25fc-e390940f7a43/196872454130.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-manasilaayo',
    fallbackAudioUrl: '/api/stream/tamil-manasilaayo',
    releaseYear: '2024',
    plays: '148M',
    lyrics: [
      'Manasilaayo... Super Star Style-u!',
      'Vettaiyan varum velaiyil athiradi thaan!',
      'Kudumbangal kondaadum thalaivar aatam!',
      'Sikkuna mudinjithu case-u thaane!'
    ]
  },
  {
    id: 'tamil-whistle-podu',
    title: 'Whistle Podu (From "GOAT")',
    artist: 'Thalapathy Vijay & Yuvan Shankar Raja',
    album: 'The Greatest of All Time',
    duration: '4:32',
    durationSeconds: 272,
    genre: 'Tamil Mass Hits',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/01/23/7c/01237c53-201c-8100-6dad-b7403f601e10/8903431991874_cover.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-whistle-podu',
    fallbackAudioUrl: '/api/stream/tamil-whistle-podu',
    releaseYear: '2024',
    plays: '162M',
    lyrics: [
      'Whistle Podu... Thalapathy step-u tharu maaru!',
      'Nanba Nanbi ellaam sernthu kondaadu!',
      'Party started right now!'
    ]
  },
  {
    id: 'tamil-matta',
    title: 'Matta (From "GOAT")',
    artist: 'Yuvan Shankar Raja & Shenbagaraj',
    album: 'The Greatest of All Time',
    duration: '3:42',
    durationSeconds: 222,
    genre: 'Tamil Mass Hits',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/01/23/7c/01237c53-201c-8100-6dad-b7403f601e10/8903431991874_cover.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-matta',
    fallbackAudioUrl: '/api/stream/tamil-matta',
    releaseYear: '2024',
    plays: '78M'
  },
  {
    id: 'tamil-godmode',
    title: 'God Mode (From "Karuppu")',
    artist: 'Sai Abhyankkar & Gana Muthu',
    album: 'Karuppu',
    duration: '3:38',
    durationSeconds: 218,
    genre: 'Tamil Trending',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/41/c3/e8/41c3e832-58d1-9b4f-5465-c4294a519e4f/cover.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-godmode',
    fallbackAudioUrl: '/api/stream/tamil-godmode',
    releaseYear: '2025',
    plays: '16.4M',
    lyrics: [
      '🔥 God Mode Activated...',
      'Karuppu vattaaraathil mass thaan!',
      'Feel the energy, feel the vibe!'
    ]
  },
  {
    id: 'tamil-fear-song',
    title: 'Fear Song (From "Devara")',
    artist: 'Anirudh Ravichander & Jr NTR',
    album: 'Devara Part 1',
    duration: '3:16',
    durationSeconds: 196,
    genre: 'Tamil Mass Hits',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/16/f3/b5/16f3b5b2-c5f1-cfc1-bb63-1f716b7a0b9f/820200469984.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-fear-song',
    fallbackAudioUrl: '/api/stream/tamil-fear-song',
    releaseYear: '2024',
    plays: '124M'
  },
  {
    id: 'tamil-hey-minnale',
    title: 'Hey Minnale (From "Amaran")',
    artist: 'G.V. Prakash Kumar, Haricharan & Shweta Mohan',
    album: 'Amaran',
    duration: '3:58',
    durationSeconds: 238,
    genre: 'Tamil Melodies',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/14/42/d0/1442d02e-1d78-b997-d6fa-3be56a4a9fac/198846526584.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-hey-minnale',
    fallbackAudioUrl: '/api/stream/tamil-hey-minnale',
    releaseYear: '2024',
    plays: '95M',
    lyrics: [
      'Hey minnale en kanavil vandhu pogiraai,',
      'Un ninaivugalai en nenjil thandhu vegiraai...',
      'Uyirin uyire unnoduthaan vaazhkindren!'
    ]
  },
  {
    id: 'tamil-hunter-vantaar',
    title: 'Hunter Vantaar (From "Vettaiyan")',
    artist: 'Anirudh Ravichander & Siddharth Basrur',
    album: 'Vettaiyan',
    duration: '3:12',
    durationSeconds: 192,
    genre: 'Tamil Mass Hits',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b5/fa/46/b5fa4632-dd53-32fc-25fc-e390940f7a43/196872454130.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-hunter-vantaar',
    fallbackAudioUrl: '/api/stream/tamil-hunter-vantaar',
    releaseYear: '2024',
    plays: '62M'
  },
  {
    id: 'tamil-katchi-sera',
    title: 'Katchi Sera',
    artist: 'Sai Abhyankkar',
    album: 'Think Indie',
    duration: '3:10',
    durationSeconds: 190,
    genre: 'Tamil Indie Pop',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/80/df/08/80df0808-17e7-ab41-5972-fec5f83e3819/cover.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-katchi-sera',
    fallbackAudioUrl: '/api/stream/tamil-katchi-sera',
    releaseYear: '2024',
    plays: '112M',
    lyrics: [
      'Katchi sera vaadi en kanmani,',
      'Unna paatha pothum manasu thullum!',
      'Veesum kaathula un vaasam thaan!'
    ]
  },
  {
    id: 'tamil-aasa-kooda',
    title: 'Aasa Kooda',
    artist: 'Sai Abhyankkar & Sai Smriti',
    album: 'Think Indie',
    duration: '3:45',
    durationSeconds: 225,
    genre: 'Tamil Romantic Hits',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/41/c3/e8/41c3e832-58d1-9b4f-5465-c4294a519e4f/cover.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-aasa-kooda',
    fallbackAudioUrl: '/api/stream/tamil-aasa-kooda',
    releaseYear: '2024',
    plays: '142M',
    lyrics: [
      'Aasa kooda sernthu konjam pesu enna paathu,',
      'Kaathu kooda unna thotta kovam varum aetho!'
    ]
  },
  {
    id: 'tamil-naa-ready',
    title: 'Naa Ready (From "Leo")',
    artist: 'Thalapathy Vijay & Anirudh Ravichander',
    album: 'Leo',
    duration: '4:08',
    durationSeconds: 248,
    genre: 'Tamil Mass Hits',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-naa-ready',
    fallbackAudioUrl: '/api/stream/tamil-naa-ready',
    releaseYear: '2023',
    plays: '185M',
    lyrics: [
      'Millu millu kulla mass-u kaattu!',
      'Naa Ready dhaan varava? Anna erangava?'
    ]
  },
  {
    id: 'tamil-hukum',
    title: 'Hukum - Thalaivar Alappara (From "Jailer")',
    artist: 'Anirudh Ravichander & Super Subu',
    album: 'Jailer',
    duration: '3:27',
    durationSeconds: 207,
    genre: 'Tamil Mass Hits',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-hukum',
    fallbackAudioUrl: '/api/stream/tamil-hukum',
    releaseYear: '2023',
    plays: '235M',
    lyrics: [
      'Hukum... Tiger Ka Hukum!',
      'Alappara kelapparom! Thalaivar varaaru vazhiya vidu!'
    ]
  },
  {
    id: 'tamil-badass',
    title: 'Badass (From "Leo")',
    artist: 'Anirudh Ravichander',
    album: 'Leo',
    duration: '3:49',
    durationSeconds: 229,
    genre: 'Tamil Mass Hits',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-badass',
    fallbackAudioUrl: '/api/stream/tamil-badass',
    releaseYear: '2023',
    plays: '150M'
  },
  {
    id: 'tamil-arabic-kuthu',
    title: 'Arabic Kuthu - Halamithi Habibo (From "Beast")',
    artist: 'Anirudh Ravichander & Jonita Gandhi',
    album: 'Beast',
    duration: '4:39',
    durationSeconds: 279,
    genre: 'Tamil Trending',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/e9/19/b9/e919b921-d5a8-9e9a-8508-3551da375aee/196626458629.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-arabic-kuthu',
    fallbackAudioUrl: '/api/stream/tamil-arabic-kuthu',
    releaseYear: '2022',
    plays: '340M',
    lyrics: [
      'Halamithi habibo... Halamithi habibo!',
      'Malama pitha pithadhe!',
      'Holamithi habibo!'
    ]
  },
  {
    id: 'tamil-vaathi-coming',
    title: 'Vaathi Coming (From "Master")',
    artist: 'Anirudh Ravichander & Gana Balachandar',
    album: 'Master',
    duration: '3:50',
    durationSeconds: 230,
    genre: 'Tamil Mass Hits',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-vaathi-coming',
    fallbackAudioUrl: '/api/stream/tamil-vaathi-coming',
    releaseYear: '2020',
    plays: '410M'
  },
  {
    id: 'tamil-vikram-title',
    title: 'Vikram Title Track',
    artist: 'Anirudh Ravichander',
    album: 'Vikram',
    duration: '3:36',
    durationSeconds: 216,
    genre: 'Tamil Mass Hits',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/05/b5/b7/05b5b7cd-e108-dd27-a25e-f4685d3e5f8b/196589228666.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-vikram-title',
    fallbackAudioUrl: '/api/stream/tamil-vikram-title',
    releaseYear: '2022',
    plays: '195M'
  },
  {
    id: 'tamil-rowdy-baby',
    title: 'Rowdy Baby (From "Maari 2")',
    artist: 'Dhanush & Dhee (Yuvan Shankar Raja)',
    album: 'Maari 2',
    duration: '4:41',
    durationSeconds: 281,
    genre: 'Tamil Mass Hits',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/09/0b/4f/090b4ffb-f4eb-f975-ae79-ce5446eeabc8/718598836276.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-rowdy-baby',
    fallbackAudioUrl: '/api/stream/tamil-rowdy-baby',
    releaseYear: '2018',
    plays: '670M'
  },
  {
    id: 'tamil-urvasi',
    title: 'Urvasi Urvasi (From "Kadhalan")',
    artist: 'A.R. Rahman, Suresh Peters & Shahul Hameed',
    album: 'Kadhalan',
    duration: '5:39',
    durationSeconds: 339,
    genre: 'Tamil Retro Hits',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/92/3b/f6/923bf68a-1cd4-615e-9776-c5e96824f6b9/8901854010103.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-urvasi',
    fallbackAudioUrl: '/api/stream/tamil-urvasi',
    releaseYear: '1994',
    plays: '280M'
  },
  {
    id: 'tamil-chaiyya',
    title: 'Chaiyya Chaiyya (From "Uyire")',
    artist: 'A.R. Rahman & Sukhwinder Singh',
    album: 'Uyire',
    duration: '6:54',
    durationSeconds: 414,
    genre: 'Tamil Classic Hits',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/8e/f8/85/8ef88544-a6c7-018b-0a75-dc3b6b024fa0/cover.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-chaiyya',
    fallbackAudioUrl: '/api/stream/tamil-chaiyya',
    releaseYear: '1998',
    plays: '310M'
  },
  {
    id: 'tamil-kannaana-kanney',
    title: 'Kannaana Kanney (From "Viswasam")',
    artist: 'Sid Sriram & D. Imman',
    album: 'Viswasam',
    duration: '4:29',
    durationSeconds: 269,
    genre: 'Tamil Melodies',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ed/1e/aa/ed1eaabc-9ec5-611e-27bb-6ab85de51a78/8901854107605.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-kannaana-kanney',
    fallbackAudioUrl: '/api/stream/tamil-kannaana-kanney',
    releaseYear: '2019',
    plays: '220M'
  },
  {
    id: 'tamil-raja-raja-chozhan',
    title: 'Raja Raja Chozhan',
    artist: 'Ilaiyaraaja & K. J. Yesudas',
    album: 'Rettai Vaal Kuruvi',
    duration: '4:35',
    durationSeconds: 275,
    genre: 'Tamil Evergreen',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/cb/56/fe/cb56fe66-1781-d8c2-6078-3d491e18f931/886448543336.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-raja-raja-chozhan',
    fallbackAudioUrl: '/api/stream/tamil-raja-raja-chozhan',
    releaseYear: '1987',
    plays: '195M'
  },
  {
    id: 'tamil-ennamo-yeadho',
    title: 'Ennamo Yeadho (From "Ko")',
    artist: 'Harris Jayaraj & Aalaap Raju',
    album: 'Ko',
    duration: '5:14',
    durationSeconds: 314,
    genre: 'Tamil Melodies',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/50/e0/04/50e00466-3fba-9d19-3d09-2bb4b1804e72/884977894653.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-ennamo-yeadho',
    fallbackAudioUrl: '/api/stream/tamil-ennamo-yeadho',
    releaseYear: '2011',
    plays: '140M'
  },
  {
    id: 'tamil-munbe-vaa',
    title: 'Munbe Vaa (From "Sillunu Oru Kaadhal")',
    artist: 'Shreya Ghoshal, Naresh Iyer & A.R. Rahman',
    album: 'Sillunu Oru Kaadhal',
    duration: '5:59',
    durationSeconds: 359,
    genre: 'Tamil Romantic Hits',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/7f/e5/dc/7fe5dcf4-1944-3266-9443-113a6c6fd2ac/8904337276584.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-munbe-vaa',
    fallbackAudioUrl: '/api/stream/tamil-munbe-vaa',
    releaseYear: '2006',
    plays: '260M'
  },
  {
    id: 'tamil-mogathirai',
    title: 'Mogathirai (From "Pizza")',
    artist: 'Pradeep Kumar & Santhosh Narayanan',
    album: 'Pizza',
    duration: '3:50',
    durationSeconds: 230,
    genre: 'Tamil Melodies',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/7f/ae/57/7fae5736-23d0-a3b3-651f-0d330ad4aabf/cover.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-mogathirai',
    fallbackAudioUrl: '/api/stream/tamil-mogathirai',
    releaseYear: '2012',
    plays: '75M'
  },
  {
    id: 'tamil-enjoy-enjaami',
    title: 'Enjoy Enjaami',
    artist: 'Dhee & Arivu (feat. Santhosh Narayanan)',
    album: 'Enjoy Enjaami Single',
    duration: '4:43',
    durationSeconds: 283,
    genre: 'Tamil Indie Pop',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/cf/aa/33/cfaa33a6-7144-1e38-e7bb-5e5a226897bd/612508166173.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-enjoy-enjaami',
    fallbackAudioUrl: '/api/stream/tamil-enjoy-enjaami',
    releaseYear: '2021',
    plays: '450M'
  },
  {
    id: 'tamil-kolaveri',
    title: 'Why This Kolaveri Di (From "3")',
    artist: 'Dhanush & Anirudh Ravichander',
    album: '3',
    duration: '4:05',
    durationSeconds: 245,
    genre: 'Tamil Viral Classic',
    isLiked: false,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/09/0b/4f/090b4ffb-f4eb-f975-ae79-ce5446eeabc8/718598836276.jpg/600x600bb.jpg',
    audioUrl: '/api/stream/tamil-kolaveri',
    fallbackAudioUrl: '/api/stream/tamil-kolaveri',
    releaseYear: '2011',
    plays: '520M'
  },

  // ==================== GLOBAL POP & SYNTHWAVE ====================
  {
    id: 'global-1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: '3:20',
    durationSeconds: 200,
    genre: 'Pop & Synthwave',
    isLiked: false,
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    audioUrl: '/api/stream/global-1',
    releaseYear: '2020',
    plays: '4.2B'
  },
  {
    id: 'global-2',
    title: 'Starboy',
    artist: 'The Weeknd & Daft Punk',
    album: 'Starboy',
    duration: '3:50',
    durationSeconds: 230,
    genre: 'Pop & Synthwave',
    isLiked: false,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    audioUrl: '/api/stream/global-2',
    releaseYear: '2016',
    plays: '3.1B'
  },
  {
    id: 'global-3',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: '3:23',
    durationSeconds: 203,
    genre: 'Pop & Dance',
    isLiked: false,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    audioUrl: '/api/stream/global-3',
    releaseYear: '2020',
    plays: '2.4B'
  },
  {
    id: 'south-1',
    title: 'Big Dawgs',
    artist: 'Hanumankind & Kalmi',
    album: 'Big Dawgs Single',
    duration: '3:05',
    durationSeconds: 185,
    genre: 'Desi Hip-Hop & Drill',
    isLiked: false,
    coverUrl: 'https://images.unsplash.com/photo-1446057032654-9d8885db76c6?auto=format&fit=crop&w=600&q=80',
    audioUrl: '/api/stream/south-1',
    releaseYear: '2024',
    plays: '340M'
  }
];

// ==================== 15 TOP TAMIL SINGERS & MUSIC DIRECTORS ====================
export const TAMIL_SINGERS: Artist[] = [
  {
    id: 'art-anirudh',
    name: 'Anirudh Ravichander',
    handle: '@anirudhofficial',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Anirudh_Ravichander_at_Audi_Ritz_Style_Awards_2017_%28cropped%29.jpg/960px-Anirudh_Ravichander_at_Audi_Ritz_Style_Awards_2017_%28cropped%29.jpg',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/600x600bb.jpg',
    monthlyListeners: '34.6M',
    followers: '12.8M',
    bio: 'Rockstar composer and sensational singer reigning Indian cinema with explosive mass anthems, viral melodies, and global chartbusters like Leo, Jailer, Vettaiyan, Devara, Beast and Master.',
    topTracks: [
      INITIAL_TRACKS.find(t => t.id === 'tamil-naa-ready')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-hukum')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-manasilaayo')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-fear-song')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-badass')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-arabic-kuthu')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-vaathi-coming')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-vikram-title')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-hunter-vantaar')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-kolaveri')!,
    ].filter(Boolean),
    isFollowing: true
  },
  {
    id: 'art-arrahman',
    name: 'A. R. Rahman',
    handle: '@arrahman',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/10/AR_Rahman_at_Premier_Futsal_Press_Meet_%28cropped%29.jpg',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/92/3b/f6/923bf68a-1cd4-615e-9776-c5e96824f6b9/8901854010103.jpg/600x600bb.jpg',
    monthlyListeners: '38.2M',
    followers: '18.4M',
    bio: 'Isai Puyal and two-time Academy Oscar Award winner. Revered globally for revolutionizing Indian film music with timeless orchestral soul, electronic fusion, and spiritual melodies.',
    topTracks: [
      INITIAL_TRACKS.find(t => t.id === 'tamil-urvasi')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-chaiyya')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-munbe-vaa')!,
    ].filter(Boolean),
    isFollowing: true
  },
  {
    id: 'art-yuvan',
    name: 'Yuvan Shankar Raja',
    handle: '@itsyuvan',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Yuvan_Shankar_Raja_exclusive_HQ_Photos_Silverscreen.jpg',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/01/23/7c/01237c53-201c-8100-6dad-b7403f601e10/8903431991874_cover.jpg/600x600bb.jpg',
    monthlyListeners: '22.8M',
    followers: '8.7M',
    bio: 'The undisputed King of BGM (U1). Pioneered youth pop, hip-hop, and emotional anthems in Tamil cinema with unforgettable scores like GOAT, Maari 2, Mankatha, and Pudhupettai.',
    topTracks: [
      INITIAL_TRACKS.find(t => t.id === 'tamil-whistle-podu')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-matta')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-rowdy-baby')!,
    ].filter(Boolean),
    isFollowing: true
  },
  {
    id: 'art-sidsriram',
    name: 'Sid Sriram',
    handle: '@sidsriram',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Sid_Sriram.jpg',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ed/1e/aa/ed1eaabc-9ec5-611e-27bb-6ab85de51a78/8901854107605.jpg/600x600bb.jpg',
    monthlyListeners: '19.4M',
    followers: '7.2M',
    bio: 'Carnatic-trained global vocalist and melody maestro behind heart-melting hits like Kannaana Kanney, Inkem Inkem, Maru Varthai, and Hey Minnale.',
    topTracks: [
      INITIAL_TRACKS.find(t => t.id === 'tamil-kannaana-kanney')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-hey-minnale')!,
    ].filter(Boolean),
    isFollowing: true
  },
  {
    id: 'art-saiabhyankkar',
    name: 'Sai Abhyankkar',
    handle: '@saiabhyankkar',
    avatarUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/80/df/08/80df0808-17e7-ab41-5972-fec5f83e3819/cover.jpg/600x600bb.jpg',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/41/c3/e8/41c3e832-58d1-9b4f-5465-c4294a519e4f/cover.jpg/600x600bb.jpg',
    monthlyListeners: '16.5M',
    followers: '3.1M',
    bio: 'Breakout Gen Z singer, composer and multi-instrumentalist whose independent releases Katchi Sera, Aasa Kooda & God Mode became record-shattering viral anthems.',
    topTracks: [
      INITIAL_TRACKS.find(t => t.id === 'tamil-katchi-sera')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-aasa-kooda')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-godmode')!,
    ].filter(Boolean),
    isFollowing: true
  },
  {
    id: 'art-ilaiyaraaja',
    name: 'Ilaiyaraaja',
    handle: '@ilaiyaraaja',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Ilaiyaraaja_at_Merku_Thodarchi_Malai_Press_Meet_%28cropped%29.jpg',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/cb/56/fe/cb56fe66-1781-d8c2-6078-3d491e18f931/886448543336.jpg/600x600bb.jpg',
    monthlyListeners: '15.9M',
    followers: '9.3M',
    bio: 'Isaignani Ilaiyaraaja, the living legend of Indian music. Composed over 7,000 songs and 1,000 film scores blending Western classical counterpoint with Indian folk.',
    topTracks: [
      INITIAL_TRACKS.find(t => t.id === 'tamil-raja-raja-chozhan')!,
    ].filter(Boolean),
    isFollowing: true
  },
  {
    id: 'art-harris',
    name: 'Harris Jayaraj',
    handle: '@jharrisjayaraj',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Harris_Jayaraj_at_Gethu_Audio_Launch_%28cropped%29.jpg',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/50/e0/04/50e00466-3fba-9d19-3d09-2bb4b1804e72/884977894653.jpg/600x600bb.jpg',
    monthlyListeners: '14.1M',
    followers: '5.8M',
    bio: 'Master of urban romantic melodies and glossy electronic soundscapes with classics from Minnale, Ko, Vaaranam Aayiram, and Ghajini.',
    topTracks: [
      INITIAL_TRACKS.find(t => t.id === 'tamil-ennamo-yeadho')!,
    ].filter(Boolean),
    isFollowing: true
  },
  {
    id: 'art-santhosh',
    name: 'Santhosh Narayanan',
    handle: '@musicsanthosh',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Santhosh_Narayanan_-_WIki_profile.jpg',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/cf/aa/33/cfaa33a6-7144-1e38-e7bb-5e5a226897bd/612508166173.jpg/600x600bb.jpg',
    monthlyListeners: '18.2M',
    followers: '6.4M',
    bio: 'Innovative composer celebrated for raw street folk, brass bands, acoustic blues and blockbusters like Enjoy Enjaami, Kabali, Vada Chennai and Kalki 2898 AD.',
    topTracks: [
      INITIAL_TRACKS.find(t => t.id === 'tamil-enjoy-enjaami')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-mogathirai')!,
    ].filter(Boolean),
    isFollowing: true
  },
  {
    id: 'art-shreya',
    name: 'Shreya Ghoshal',
    handle: '@shreyaghoshal',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Shreya_Ghoshal_Behindwoods_Gold_Icons_Awards_2023_%28cropped%29.jpg',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/7f/e5/dc/7fe5dcf4-1944-3266-9443-113a6c6fd2ac/8904337276584.jpg/600x600bb.jpg',
    monthlyListeners: '46.1M',
    followers: '28.3M',
    bio: 'The golden voice of modern India and five-time National Film Award winner. Her Tamil classics like Munbe Vaa and Mannipaaya define romantic perfection.',
    topTracks: [
      INITIAL_TRACKS.find(t => t.id === 'tamil-munbe-vaa')!,
    ].filter(Boolean),
    isFollowing: true
  },
  {
    id: 'art-pradeep',
    name: 'Pradeep Kumar',
    handle: '@pradeepkumar',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Pradeep_Rangaswamy_Kumar.png',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/7f/ae/57/7fae5736-23d0-a3b3-651f-0d330ad4aabf/cover.jpg/600x600bb.jpg',
    monthlyListeners: '9.8M',
    followers: '3.4M',
    bio: 'Acoustic slide guitarist and deeply emotional singer with soul-stirring vocal performances on Mogathirai, Maya Nadhi, and Aagayam Theepiditha.',
    topTracks: [
      INITIAL_TRACKS.find(t => t.id === 'tamil-mogathirai')!,
    ].filter(Boolean),
    isFollowing: false
  },
  {
    id: 'art-jonita',
    name: 'Jonita Gandhi',
    handle: '@jonitagandhi',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Jonita_Gandhi_snapped_at_an_event_in_Juhu_%28cropped%29.jpg',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/e9/19/b9/e919b921-d5a8-9e9a-8508-3551da375aee/196626458629.jpg/600x600bb.jpg',
    monthlyListeners: '21.3M',
    followers: '5.9M',
    bio: 'International powerhouse vocalist bringing infectious energy to modern Tamil chartbusters like Arabic Kuthu, Chellama, and Private Party.',
    topTracks: [
      INITIAL_TRACKS.find(t => t.id === 'tamil-arabic-kuthu')!,
    ].filter(Boolean),
    isFollowing: false
  },
  {
    id: 'art-spb',
    name: 'S. P. Balasubrahmanyam',
    handle: '@spb_legend',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/S._P._Balasubrahmanyam_at_the_%27Gurkha%27_Audio_Launch.jpg/960px-S._P._Balasubrahmanyam_at_the_%27Gurkha%27_Audio_Launch.jpg',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/cb/56/fe/cb56fe66-1781-d8c2-6078-3d491e18f931/886448543336.jpg/600x600bb.jpg',
    monthlyListeners: '18.7M',
    followers: '14.2M',
    bio: 'Padma Vibhushan SPB, the immortal voice that graced over 40,000 songs across Indian languages, touching every generation of listeners.',
    topTracks: [
      INITIAL_TRACKS.find(t => t.id === 'tamil-urvasi')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-raja-raja-chozhan')!,
    ].filter(Boolean),
    isFollowing: true
  },
  {
    id: 'art-dhanush',
    name: 'Dhanush',
    handle: '@dhanushkraja',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Dhanush_at_the_%E2%80%98Asuran%E2%80%99_Success_Meet_%28cropped%29.jpg',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/09/0b/4f/090b4ffb-f4eb-f975-ae79-ce5446eeabc8/718598836276.jpg/600x600bb.jpg',
    monthlyListeners: '12.4M',
    followers: '11.0M',
    bio: 'Actor, director, and distinctive singer whose casual, soulful vocals spawned world phenomena like Why This Kolaveri Di and Rowdy Baby.',
    topTracks: [
      INITIAL_TRACKS.find(t => t.id === 'tamil-rowdy-baby')!,
      INITIAL_TRACKS.find(t => t.id === 'tamil-kolaveri')!,
    ].filter(Boolean),
    isFollowing: false
  },
  {
    id: 'art-dimman',
    name: 'D. Imman',
    handle: '@immancomposer',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/DSC00325_copy-lowres.jpg/960px-DSC00325_copy-lowres.jpg',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ed/1e/aa/ed1eaabc-9ec5-611e-27bb-6ab85de51a78/8901854107605.jpg/600x600bb.jpg',
    monthlyListeners: '11.2M',
    followers: '4.5M',
    bio: 'National Award-winning music director behind emotional, heartwarming rural melodies like Kannaana Kanney (Viswasam) and Kurumba.',
    topTracks: [
      INITIAL_TRACKS.find(t => t.id === 'tamil-kannaana-kanney')!,
    ].filter(Boolean),
    isFollowing: false
  },
  {
    id: 'art-seanroldan',
    name: 'Sean Roldan',
    handle: '@seanroldan',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Sean_Roldan.jpg',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/50/e0/04/50e00466-3fba-9d19-3d09-2bb4b1804e72/884977894653.jpg/600x600bb.jpg',
    monthlyListeners: '7.6M',
    followers: '2.1M',
    bio: 'Acoustic folk and blues visionary singer-composer known for unique vocal textures and melodic depth in contemporary cinema.',
    topTracks: [
      INITIAL_TRACKS.find(t => t.id === 'tamil-katchi-sera')!,
    ].filter(Boolean),
    isFollowing: false
  }
];

export const POPULAR_ARTISTS: Artist[] = [
  ...TAMIL_SINGERS,
  {
    id: 'art-weeknd',
    name: 'The Weeknd',
    handle: '@theweeknd',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    monthlyListeners: '105.4M',
    followers: '48.2M',
    bio: 'Grammy winning global superstar redefining pop, R&B and synthwave worldwide.',
    topTracks: INITIAL_TRACKS.filter(t => t.artist.includes('Weeknd')),
    isFollowing: true
  },
  {
    id: 'art-dualipa',
    name: 'Dua Lipa',
    handle: '@dualipa',
    avatarUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    monthlyListeners: '78.3M',
    followers: '24.1M',
    bio: 'Global pop sensation behind Future Nostalgia and dance floor chart toppers.',
    topTracks: INITIAL_TRACKS.filter(t => t.artist.includes('Dua Lipa')),
    isFollowing: false
  }
];

// ==================== NEWLY RELEASED SONGS LINEUP ====================
export const NEW_RELEASES_LINEUP: Track[] = [
  INITIAL_TRACKS.find(t => t.id === 'tamil-manasilaayo')!,
  INITIAL_TRACKS.find(t => t.id === 'tamil-whistle-podu')!,
  INITIAL_TRACKS.find(t => t.id === 'tamil-matta')!,
  INITIAL_TRACKS.find(t => t.id === 'tamil-godmode')!,
  INITIAL_TRACKS.find(t => t.id === 'tamil-fear-song')!,
  INITIAL_TRACKS.find(t => t.id === 'tamil-hey-minnale')!,
  INITIAL_TRACKS.find(t => t.id === 'tamil-katchi-sera')!,
  INITIAL_TRACKS.find(t => t.id === 'tamil-aasa-kooda')!,
  INITIAL_TRACKS.find(t => t.id === 'tamil-hunter-vantaar')!,
  INITIAL_TRACKS.find(t => t.id === 'tamil-naa-ready')!,
  INITIAL_TRACKS.find(t => t.id === 'tamil-hukum')!,
  INITIAL_TRACKS.find(t => t.id === 'tamil-badass')!,
].filter(Boolean);

// ==================== USER TOP 20 SONGS (TAILORED TO USER TASTE) ====================
export const USER_TOP_20_TRACKS: (Track & { rank: number; tasteTag: string })[] = [
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-manasilaayo')!, rank: 1, tasteTag: '99% Match • On Repeat 54x' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-katchi-sera')!, rank: 2, tasteTag: 'Heavy Rotation • Daily Jam' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-whistle-podu')!, rank: 3, tasteTag: 'Top Mass Anthem • 97% Match' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-aasa-kooda')!, rank: 4, tasteTag: 'Indie Romance Favorite' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-godmode')!, rank: 5, tasteTag: 'High Energy Boost' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-naa-ready')!, rank: 6, tasteTag: 'Frequent Replay' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-hukum')!, rank: 7, tasteTag: 'Gym & Drive Energy' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-hey-minnale')!, rank: 8, tasteTag: 'Late Night Acoustic' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-fear-song')!, rank: 9, tasteTag: 'Adrenaline Rush' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-matta')!, rank: 10, tasteTag: 'Trending Club Vibe' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-arabic-kuthu')!, rank: 11, tasteTag: 'Dance Floor Hit' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-kannaana-kanney')!, rank: 12, tasteTag: 'Soulful Melody' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-badass')!, rank: 13, tasteTag: 'Mass Swagger' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-urvasi')!, rank: 14, tasteTag: 'Evergreen Nostalgia' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-vaathi-coming')!, rank: 15, tasteTag: 'Party Catalyst' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-munbe-vaa')!, rank: 16, tasteTag: 'Deep Emotional Chill' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-rowdy-baby')!, rank: 17, tasteTag: 'Groove Supreme' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-vikram-title')!, rank: 18, tasteTag: 'Cinematic Thrill' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-ennamo-yeadho')!, rank: 19, tasteTag: 'Feel-Good Rhythm' },
  { ...INITIAL_TRACKS.find(t => t.id === 'tamil-mogathirai')!, rank: 20, tasteTag: 'Acoustic Bliss' },
].map(item => ({
  ...item,
  isEvaBrain: true,
  evaBrainReason: `Rank #${item.rank} • ${item.tasteTag}`,
  isEchoBrain: true,
  echoBrainReason: `Rank #${item.rank} • ${item.tasteTag}`
}));

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getRandomizedTracks(): Track[] {
  return shuffleArray(INITIAL_TRACKS);
}

export const FEATURED_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-discover',
    title: 'Top Tamil & South Chart Hits 2025 🔥',
    subtitle: 'Manasilaayo, GOAT, God Mode & Leo',
    badge: 'TRENDING #1',
    description: 'The biggest Tamil chartbusters featuring Anirudh, Yuvan Shankar Raja, Sai Abhyankkar & Thalapathy Vijay.',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b5/fa/46/b5fa4632-dd53-32fc-25fc-e390940f7a43/196872454130.jpg/600x600bb.jpg',
    tracks: INITIAL_TRACKS.filter(t => t.id.startsWith('tamil-') || t.id.startsWith('south-')),
    trackCount: INITIAL_TRACKS.filter(t => t.id.startsWith('tamil-') || t.id.startsWith('south-')).length,
    color: 'from-purple-600 to-pink-600'
  },
  {
    id: 'pl-singers',
    title: 'Tamil Maestros & Legendary Voices 🎙️',
    subtitle: 'Anirudh, AR Rahman, Yuvan, Sid Sriram & Ilaiyaraaja',
    badge: 'STAR CURATION',
    description: 'Best of Tamil film legends and melody titans.',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/92/3b/f6/923bf68a-1cd4-615e-9776-c5e96824f6b9/8901854010103.jpg/600x600bb.jpg',
    tracks: INITIAL_TRACKS.filter(t => t.id.startsWith('tamil-')),
    trackCount: 20,
    color: 'from-amber-600 via-rose-600 to-purple-800'
  }
];

export const GENRE_CATEGORIES: GenreCategory[] = [
  {
    id: 'g-trending',
    name: 'Tamil Trending & Mass',
    subtitle: 'Manasilaayo, GOAT, God Mode & Leo',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b5/fa/46/b5fa4632-dd53-32fc-25fc-e390940f7a43/196872454130.jpg/600x600bb.jpg',
    color: 'from-purple-600 via-indigo-700 to-slate-950',
    trackCount: 30
  },
  {
    id: 'g-pop',
    name: 'Pop & Synthwave',
    subtitle: 'Blinding Lights, Levitating & Retro Wave',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    color: 'from-pink-600 via-purple-700 to-indigo-950',
    trackCount: 25
  },
  {
    id: 'g-melodies',
    name: 'Tamil Melodies & Soul',
    subtitle: 'Hey Minnale, Kannaana Kanney & Munbe Vaa',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/14/42/d0/1442d02e-1d78-b997-d6fa-3be56a4a9fac/198846526584.jpg/600x600bb.jpg',
    color: 'from-rose-600 via-pink-700 to-slate-950',
    trackCount: 24
  }
];
