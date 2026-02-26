import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Song from '../models/Song';
import Sentence from '../models/Sentence';

dotenv.config();

const songs = [
  {
    title: 'Let It Be',
    artist: 'The Beatles',
    level: 'A1',
    genre: 'rock',
    videoUrl: 'https://www.youtube.com/watch?v=QDYfEBY9NM4',
    thumbnailUrl: 'https://img.youtube.com/vi/QDYfEBY9NM4/0.jpg',
    duration: 243,
    description: 'A timeless classic with simple, slow lyrics perfect for beginners.',
    tags: ['classic', 'beginner', 'slow'],
    difficulty: 2,
    bpm: 72,
    language: { vocabularyLevel: 'basic', grammarPoints: ['simple present', 'imperatives'], keyPhrases: ['let it be', 'words of wisdom', 'there will be an answer'] },
    sentences: [
      { text: 'When I find myself in times of trouble', phonetic: '/wɛn aɪ faɪnd maɪˈsɛlf ɪn taɪmz əv ˈtrʌbəl/', startTime: 5.0, endTime: 9.5, words: [{ text: 'When', phonetic: '/wɛn/', startTime: 5.0, endTime: 5.4, isKeyWord: false }, { text: 'I', phonetic: '/aɪ/', startTime: 5.4, endTime: 5.6, isKeyWord: false }, { text: 'find', phonetic: '/faɪnd/', startTime: 5.6, endTime: 6.2, isKeyWord: true, definition: 'to discover' }, { text: 'myself', phonetic: '/maɪˈsɛlf/', startTime: 6.2, endTime: 6.9, isKeyWord: false }, { text: 'in', phonetic: '/ɪn/', startTime: 6.9, endTime: 7.1, isKeyWord: false }, { text: 'times', phonetic: '/taɪmz/', startTime: 7.1, endTime: 7.6, isKeyWord: true, definition: 'periods or moments' }, { text: 'of', phonetic: '/əv/', startTime: 7.6, endTime: 7.8, isKeyWord: false }, { text: 'trouble', phonetic: '/ˈtrʌbəl/', startTime: 7.8, endTime: 9.5, isKeyWord: true, definition: 'difficulty or problems' }] },
      { text: 'Mother Mary comes to me', phonetic: '/ˈmʌðər ˈmɛri kʌmz tuː miː/', startTime: 9.5, endTime: 13.0, words: [{ text: 'Mother', phonetic: '/ˈmʌðər/', startTime: 9.5, endTime: 10.2, isKeyWord: true, definition: 'a female parent' }, { text: 'Mary', phonetic: '/ˈmɛri/', startTime: 10.2, endTime: 10.8, isKeyWord: false }, { text: 'comes', phonetic: '/kʌmz/', startTime: 10.8, endTime: 11.3, isKeyWord: false }, { text: 'to', phonetic: '/tuː/', startTime: 11.3, endTime: 11.5, isKeyWord: false }, { text: 'me', phonetic: '/miː/', startTime: 11.5, endTime: 13.0, isKeyWord: false }] },
      { text: 'Speaking words of wisdom', phonetic: '/ˈspiːkɪŋ wɜːrdz əv ˈwɪzdəm/', startTime: 13.0, endTime: 16.5, words: [{ text: 'Speaking', phonetic: '/ˈspiːkɪŋ/', startTime: 13.0, endTime: 13.8, isKeyWord: false }, { text: 'words', phonetic: '/wɜːrdz/', startTime: 13.8, endTime: 14.5, isKeyWord: true, definition: 'units of language' }, { text: 'of', phonetic: '/əv/', startTime: 14.5, endTime: 14.7, isKeyWord: false }, { text: 'wisdom', phonetic: '/ˈwɪzdəm/', startTime: 14.7, endTime: 16.5, isKeyWord: true, definition: 'deep knowledge and good judgment' }] },
      { text: 'Let it be', phonetic: '/lɛt ɪt biː/', startTime: 16.5, endTime: 20.0, words: [{ text: 'Let', phonetic: '/lɛt/', startTime: 16.5, endTime: 17.2, isKeyWord: true, definition: 'to allow' }, { text: 'it', phonetic: '/ɪt/', startTime: 17.2, endTime: 17.6, isKeyWord: false }, { text: 'be', phonetic: '/biː/', startTime: 17.6, endTime: 20.0, isKeyWord: true, definition: 'to exist as is' }] }
    ]
  },
  {
    title: 'Perfect',
    artist: 'Ed Sheeran',
    level: 'A2',
    genre: 'pop',
    videoUrl: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
    thumbnailUrl: 'https://img.youtube.com/vi/2Vv-BfVoq4g/0.jpg',
    duration: 263,
    description: 'A beautiful love ballad with clear pronunciation and moderate pace.',
    tags: ['love', 'ballad', 'popular'],
    difficulty: 3,
    bpm: 64,
    language: { vocabularyLevel: 'elementary', grammarPoints: ['past simple', 'present perfect'], keyPhrases: ['I found a love', 'darling just dive right in', 'you look perfect'] },
    sentences: [
      { text: 'I found a love for me', phonetic: '/aɪ faʊnd ə lʌv fɔːr miː/', startTime: 14.0, endTime: 18.5, words: [{ text: 'I', phonetic: '/aɪ/', startTime: 14.0, endTime: 14.3, isKeyWord: false }, { text: 'found', phonetic: '/faʊnd/', startTime: 14.3, endTime: 15.1, isKeyWord: true, definition: 'discovered (past tense of find)' }, { text: 'a', phonetic: '/ə/', startTime: 15.1, endTime: 15.3, isKeyWord: false }, { text: 'love', phonetic: '/lʌv/', startTime: 15.3, endTime: 16.2, isKeyWord: true, definition: 'deep affection' }, { text: 'for', phonetic: '/fɔːr/', startTime: 16.2, endTime: 16.6, isKeyWord: false }, { text: 'me', phonetic: '/miː/', startTime: 16.6, endTime: 18.5, isKeyWord: false }] },
      { text: 'Darling just dive right in', phonetic: '/ˈdɑːrlɪŋ dʒʌst daɪv raɪt ɪn/', startTime: 18.5, endTime: 22.0, words: [{ text: 'Darling', phonetic: '/ˈdɑːrlɪŋ/', startTime: 18.5, endTime: 19.2, isKeyWord: true, definition: 'term of endearment' }, { text: 'just', phonetic: '/dʒʌst/', startTime: 19.2, endTime: 19.6, isKeyWord: false }, { text: 'dive', phonetic: '/daɪv/', startTime: 19.6, endTime: 20.3, isKeyWord: true, definition: 'to jump into something' }, { text: 'right', phonetic: '/raɪt/', startTime: 20.3, endTime: 20.8, isKeyWord: false }, { text: 'in', phonetic: '/ɪn/', startTime: 20.8, endTime: 22.0, isKeyWord: false }] },
      { text: 'And follow my lead', phonetic: '/ænd ˈfɒloʊ maɪ liːd/', startTime: 22.0, endTime: 25.5, words: [{ text: 'And', phonetic: '/ænd/', startTime: 22.0, endTime: 22.3, isKeyWord: false }, { text: 'follow', phonetic: '/ˈfɒloʊ/', startTime: 22.3, endTime: 23.2, isKeyWord: true, definition: 'to go behind or after' }, { text: 'my', phonetic: '/maɪ/', startTime: 23.2, endTime: 23.5, isKeyWord: false }, { text: 'lead', phonetic: '/liːd/', startTime: 23.5, endTime: 25.5, isKeyWord: true, definition: 'guidance or direction' }] }
    ]
  },
  {
    title: 'Someone Like You',
    artist: 'Adele',
    level: 'B1',
    genre: 'pop',
    videoUrl: 'https://www.youtube.com/watch?v=hLQl3WQQoQ0',
    thumbnailUrl: 'https://img.youtube.com/vi/hLQl3WQQoQ0/0.jpg',
    duration: 285,
    description: 'An emotionally rich ballad with moderate vocabulary and clear diction.',
    tags: ['emotional', 'ballad', 'iconic'],
    difficulty: 5,
    bpm: 68,
    language: { vocabularyLevel: 'intermediate', grammarPoints: ['conditionals', 'past tense narration'], keyPhrases: ['never mind', 'I wish nothing but the best', 'sometimes it lasts'] },
    sentences: [
      { text: 'I heard that you\'re settled down', phonetic: '/aɪ hɜːrd ðæt jʊr ˈsɛtəld daʊn/', startTime: 11.0, endTime: 15.0, words: [{ text: 'I', phonetic: '/aɪ/', startTime: 11.0, endTime: 11.2, isKeyWord: false }, { text: 'heard', phonetic: '/hɜːrd/', startTime: 11.2, endTime: 11.8, isKeyWord: true, definition: 'past tense of hear' }, { text: 'that', phonetic: '/ðæt/', startTime: 11.8, endTime: 12.1, isKeyWord: false }, { text: 'you\'re', phonetic: '/jʊr/', startTime: 12.1, endTime: 12.5, isKeyWord: false }, { text: 'settled', phonetic: '/ˈsɛtəld/', startTime: 12.5, endTime: 13.4, isKeyWord: true, definition: 'established a stable life' }, { text: 'down', phonetic: '/daʊn/', startTime: 13.4, endTime: 15.0, isKeyWord: false }] },
      { text: 'That you found a girl and you\'re married now', phonetic: '/ðæt juː faʊnd ə ɡɜːrl ænd jʊr ˈmærid naʊ/', startTime: 15.0, endTime: 20.0, words: [{ text: 'That', phonetic: '/ðæt/', startTime: 15.0, endTime: 15.3, isKeyWord: false }, { text: 'you', phonetic: '/juː/', startTime: 15.3, endTime: 15.6, isKeyWord: false }, { text: 'found', phonetic: '/faʊnd/', startTime: 15.6, endTime: 16.2, isKeyWord: false }, { text: 'a', phonetic: '/ə/', startTime: 16.2, endTime: 16.4, isKeyWord: false }, { text: 'girl', phonetic: '/ɡɜːrl/', startTime: 16.4, endTime: 17.0, isKeyWord: false }, { text: 'and', phonetic: '/ænd/', startTime: 17.0, endTime: 17.2, isKeyWord: false }, { text: 'you\'re', phonetic: '/jʊr/', startTime: 17.2, endTime: 17.6, isKeyWord: false }, { text: 'married', phonetic: '/ˈmærid/', startTime: 17.6, endTime: 18.5, isKeyWord: true, definition: 'joined in marriage' }, { text: 'now', phonetic: '/naʊ/', startTime: 18.5, endTime: 20.0, isKeyWord: false }] }
    ]
  },
  {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    level: 'B2',
    genre: 'rock',
    videoUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    thumbnailUrl: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/0.jpg',
    duration: 355,
    description: 'A complex masterpiece that challenges rhythm, range and vocabulary.',
    tags: ['classic', 'challenging', 'iconic'],
    difficulty: 7,
    bpm: 72,
    language: { vocabularyLevel: 'upper-intermediate', grammarPoints: ['conditionals', 'rhetorical questions'], keyPhrases: ['is this the real life', 'easy come easy go', 'nothing really matters'] },
    sentences: [
      { text: 'Is this the real life', phonetic: '/ɪz ðɪs ðə rɪəl laɪf/', startTime: 0.5, endTime: 4.0, words: [{ text: 'Is', phonetic: '/ɪz/', startTime: 0.5, endTime: 1.0, isKeyWord: false }, { text: 'this', phonetic: '/ðɪs/', startTime: 1.0, endTime: 1.5, isKeyWord: false }, { text: 'the', phonetic: '/ðə/', startTime: 1.5, endTime: 1.8, isKeyWord: false }, { text: 'real', phonetic: '/rɪəl/', startTime: 1.8, endTime: 2.5, isKeyWord: true, definition: 'actually existing' }, { text: 'life', phonetic: '/laɪf/', startTime: 2.5, endTime: 4.0, isKeyWord: true, definition: 'the condition of living' }] },
      { text: 'Is this just fantasy', phonetic: '/ɪz ðɪs dʒʌst ˈfæntəsi/', startTime: 4.0, endTime: 8.0, words: [{ text: 'Is', phonetic: '/ɪz/', startTime: 4.0, endTime: 4.3, isKeyWord: false }, { text: 'this', phonetic: '/ðɪs/', startTime: 4.3, endTime: 4.7, isKeyWord: false }, { text: 'just', phonetic: '/dʒʌst/', startTime: 4.7, endTime: 5.2, isKeyWord: false }, { text: 'fantasy', phonetic: '/ˈfæntəsi/', startTime: 5.2, endTime: 8.0, isKeyWord: true, definition: 'imagination or daydream' }] }
    ]
  },
  {
    title: 'Hotel California',
    artist: 'Eagles',
    level: 'C1',
    genre: 'rock',
    videoUrl: 'https://www.youtube.com/watch?v=09839DpTctU',
    thumbnailUrl: 'https://img.youtube.com/vi/09839DpTctU/0.jpg',
    duration: 391,
    description: 'Rich metaphorical lyrics that demand advanced comprehension and nuance.',
    tags: ['classic', 'metaphorical', 'advanced'],
    difficulty: 8,
    bpm: 74,
    language: { vocabularyLevel: 'advanced', grammarPoints: ['metaphor', 'narrative past tense', 'subjunctive'], keyPhrases: ['you can check out any time you like', 'dark desert highway', 'mirrors on the ceiling'] },
    sentences: [
      { text: 'On a dark desert highway, cool wind in my hair', phonetic: '/ɒn ə dɑːrk ˈdɛzərt ˈhaɪweɪ kuːl wɪnd ɪn maɪ hɛr/', startTime: 17.0, endTime: 25.0, words: [{ text: 'On', phonetic: '/ɒn/', startTime: 17.0, endTime: 17.3, isKeyWord: false }, { text: 'a', phonetic: '/ə/', startTime: 17.3, endTime: 17.5, isKeyWord: false }, { text: 'dark', phonetic: '/dɑːrk/', startTime: 17.5, endTime: 18.2, isKeyWord: true, definition: 'having little or no light' }, { text: 'desert', phonetic: '/ˈdɛzərt/', startTime: 18.2, endTime: 19.0, isKeyWord: true, definition: 'a dry barren area' }, { text: 'highway', phonetic: '/ˈhaɪweɪ/', startTime: 19.0, endTime: 20.0, isKeyWord: true, definition: 'a main road' }, { text: 'cool', phonetic: '/kuːl/', startTime: 20.5, endTime: 21.0, isKeyWord: false }, { text: 'wind', phonetic: '/wɪnd/', startTime: 21.0, endTime: 21.8, isKeyWord: false }, { text: 'in', phonetic: '/ɪn/', startTime: 21.8, endTime: 22.0, isKeyWord: false }, { text: 'my', phonetic: '/maɪ/', startTime: 22.0, endTime: 22.3, isKeyWord: false }, { text: 'hair', phonetic: '/hɛr/', startTime: 22.3, endTime: 25.0, isKeyWord: false }] }
    ]
  },
  {
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    level: 'C2',
    genre: 'rock',
    videoUrl: 'https://www.youtube.com/watch?v=QkF3oxziUI4',
    thumbnailUrl: 'https://img.youtube.com/vi/QkF3oxziUI4/0.jpg',
    duration: 482,
    description: 'Poetic, symbolic lyrics at the highest level of English mastery.',
    tags: ['poetic', 'symbolic', 'masterpiece'],
    difficulty: 10,
    bpm: 63,
    language: { vocabularyLevel: 'mastery', grammarPoints: ['symbolism', 'archaic phrasing', 'complex metaphor'], keyPhrases: ['there\'s a lady who\'s sure', 'all that glitters is gold', 'a stairway to heaven'] },
    sentences: [
      { text: "There's a lady who's sure all that glitters is gold", phonetic: '/ðɛrz ə ˈleɪdi huːz ʃʊr ɔːl ðæt ˈɡlɪtərz ɪz ɡoʊld/', startTime: 4.0, endTime: 12.0, words: [{ text: "There's", phonetic: '/ðɛrz/', startTime: 4.0, endTime: 4.8, isKeyWord: false }, { text: 'a', phonetic: '/ə/', startTime: 4.8, endTime: 5.0, isKeyWord: false }, { text: 'lady', phonetic: '/ˈleɪdi/', startTime: 5.0, endTime: 5.8, isKeyWord: false }, { text: "who's", phonetic: '/huːz/', startTime: 5.8, endTime: 6.4, isKeyWord: false }, { text: 'sure', phonetic: '/ʃʊr/', startTime: 6.4, endTime: 7.2, isKeyWord: true, definition: 'certain or confident' }, { text: 'all', phonetic: '/ɔːl/', startTime: 7.2, endTime: 7.6, isKeyWord: false }, { text: 'that', phonetic: '/ðæt/', startTime: 7.6, endTime: 8.0, isKeyWord: false }, { text: 'glitters', phonetic: '/ˈɡlɪtərz/', startTime: 8.0, endTime: 9.0, isKeyWord: true, definition: 'shines with a sparkling light' }, { text: 'is', phonetic: '/ɪz/', startTime: 9.0, endTime: 9.3, isKeyWord: false }, { text: 'gold', phonetic: '/ɡoʊld/', startTime: 9.3, endTime: 12.0, isKeyWord: true, definition: 'precious yellow metal; something valuable' }] }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/english-music');
    console.log('Connected to MongoDB for seeding...');

    await Song.deleteMany({});
    await Sentence.deleteMany({});
    console.log('Cleared existing data');

    for (const songData of songs) {
      const { sentences, ...songFields } = songData;
      const song = await Song.create({ ...songFields, totalSentences: sentences.length });
      const sentenceDocs = sentences.map((s, i) => ({
        songId: song._id,
        index: i,
        text: s.text,
        phonetic: s.phonetic,
        startTime: s.startTime,
        endTime: s.endTime,
        duration: s.endTime - s.startTime,
        words: s.words,
        pitchData: [],
        difficulty: songFields.difficulty,
      }));
      await Sentence.insertMany(sentenceDocs);
      console.log(`✅ Seeded: ${song.title} by ${song.artist} (${sentences.length} sentences)`);
    }

    console.log('\n🎵 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDB();
