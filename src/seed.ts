import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

// Run: npx ts-node src/seed.ts
const AppDataSource = new DataSource({
  type: 'postgres', host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres', password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'english_music', entities: [__dirname + '/entities/*.entity{.ts,.js}'], synchronize: true,
});

const SONGS = [
  { title: 'Let It Be', artist: 'The Beatles', youtubeVideoId: 'QDYfEBY9NM4', level: 'A1', genre: 'Rock', bpm: 71, tags: ['slow','classic','easy'],
    lyrics: [
      { lineNumber: 1, text: 'When I find myself in times of trouble', startTime: 11.0, endTime: 14.5 },
      { lineNumber: 2, text: 'Mother Mary comes to me', startTime: 14.5, endTime: 17.5 },
      { lineNumber: 3, text: 'Speaking words of wisdom', startTime: 17.5, endTime: 20.0 },
      { lineNumber: 4, text: 'Let it be', startTime: 20.0, endTime: 23.0 },
      { lineNumber: 5, text: 'And in my hour of darkness', startTime: 23.0, endTime: 26.0 },
      { lineNumber: 6, text: 'She is standing right in front of me', startTime: 26.0, endTime: 29.5 },
      { lineNumber: 7, text: 'Speaking words of wisdom', startTime: 29.5, endTime: 32.0 },
      { lineNumber: 8, text: 'Let it be', startTime: 32.0, endTime: 35.0 },
    ]},
  { title: 'Perfect', artist: 'Ed Sheeran', youtubeVideoId: '2Vv-BfVoq4g', level: 'A2', genre: 'Pop', bpm: 63, tags: ['love','slow'],
    lyrics: [
      { lineNumber: 1, text: 'I found a love for me', startTime: 16.0, endTime: 20.0 },
      { lineNumber: 2, text: 'Oh darling just dive right in', startTime: 20.5, endTime: 24.0 },
      { lineNumber: 3, text: 'And follow my lead', startTime: 24.0, endTime: 27.0 },
      { lineNumber: 4, text: 'Well I found a girl beautiful and sweet', startTime: 27.5, endTime: 32.0 },
      { lineNumber: 5, text: 'Oh I never knew you were the someone', startTime: 32.0, endTime: 36.0 },
      { lineNumber: 6, text: 'Waiting for me', startTime: 36.0, endTime: 39.0 },
    ]},
  { title: 'Shape of You', artist: 'Ed Sheeran', youtubeVideoId: 'JGwWNGJdvx8', level: 'B1', genre: 'Pop', bpm: 96, tags: ['upbeat','catchy'],
    lyrics: [
      { lineNumber: 1, text: 'The club is not the best place to find a lover', startTime: 5.0, endTime: 8.5 },
      { lineNumber: 2, text: 'So the bar is where I go', startTime: 8.5, endTime: 11.0 },
      { lineNumber: 3, text: 'Me and my friends at the table doing shots', startTime: 11.0, endTime: 14.5 },
      { lineNumber: 4, text: 'Drinking fast and then we talk slow', startTime: 14.5, endTime: 17.5 },
    ]},
  { title: 'Someone Like You', artist: 'Adele', youtubeVideoId: 'hLQl3WQQoQ0', level: 'B1', genre: 'Pop', bpm: 68, tags: ['ballad','emotional'],
    lyrics: [
      { lineNumber: 1, text: 'I heard that you are settled down', startTime: 18.0, endTime: 22.5 },
      { lineNumber: 2, text: 'That you found a girl and you are married now', startTime: 22.5, endTime: 28.0 },
      { lineNumber: 3, text: 'I heard that your dreams came true', startTime: 28.0, endTime: 33.0 },
      { lineNumber: 4, text: 'Guess she gave you things I did not give to you', startTime: 33.0, endTime: 38.5 },
    ]},
  { title: 'Bohemian Rhapsody', artist: 'Queen', youtubeVideoId: 'fJ9rUzIMcZQ', level: 'C1', genre: 'Rock', bpm: 72, tags: ['classic','challenging'],
    lyrics: [
      { lineNumber: 1, text: 'Is this the real life', startTime: 0.5, endTime: 3.0 },
      { lineNumber: 2, text: 'Is this just fantasy', startTime: 3.0, endTime: 6.5 },
      { lineNumber: 3, text: 'Caught in a landslide', startTime: 6.5, endTime: 10.0 },
      { lineNumber: 4, text: 'No escape from reality', startTime: 10.0, endTime: 14.5 },
      { lineNumber: 5, text: 'Open your eyes', startTime: 14.5, endTime: 18.0 },
      { lineNumber: 6, text: 'Look up to the skies and see', startTime: 18.0, endTime: 23.0 },
    ]},
];

async function seed() {
  await AppDataSource.initialize();
  console.log('Connected to database');
  const songRepo = AppDataSource.getRepository('Song');
  const lyricRepo = AppDataSource.getRepository('LyricLine');
  const userRepo = AppDataSource.getRepository('User');

  const existingUser = await userRepo.findOne({ where: { email: 'demo@singlish.app' } } as any);
  if (!existingUser) {
    const hashed = await bcrypt.hash('demo1234', 12);
    await userRepo.save(userRepo.create({ email: 'demo@singlish.app', password: hashed, displayName: 'Demo Singer', nativeLanguage: 'vi' }));
    console.log('Created demo user: demo@singlish.app / demo1234');
  }

  for (const s of SONGS) {
    const existing = await songRepo.findOne({ where: { youtubeVideoId: s.youtubeVideoId } } as any);
    if (existing) { console.log(`Skipping "${s.title}"`); continue; }
    const song = await songRepo.save(songRepo.create({
      title: s.title, artist: s.artist, youtubeVideoId: s.youtubeVideoId,
      thumbnailUrl: `https://img.youtube.com/vi/${s.youtubeVideoId}/hqdefault.jpg`,
      level: s.level, genre: s.genre, bpm: s.bpm, totalLines: s.lyrics.length, tags: s.tags,
    }));
    for (const line of s.lyrics) await lyricRepo.save(lyricRepo.create({ songId: (song as any).id, ...line }));
    console.log(`Seeded "${s.title}" by ${s.artist} (${s.level})`);
  }
  console.log('Seed complete!');
  await AppDataSource.destroy();
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
