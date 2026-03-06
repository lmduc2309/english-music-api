# 🎵 English Music API

> Learn English through singing! A NestJS backend that powers a music-based language learning app with real-time scoring of pronunciation, pitch, and rhythm.

## 🏗 Architecture

```
src/
├── common/              # Shared enums, guards, decorators, DTOs
├── modules/
│   ├── auth/            # JWT authentication (register, login, refresh)
│   ├── users/           # User profiles, XP, streaks
│   ├── songs/           # Song catalog & sentence-by-sentence lyrics
│   ├── lessons/         # Structured lessons with unlock progression
│   ├── scoring/         # 🎯 Core engine: pitch, pronunciation, duration
│   │   └── services/
│   │       ├── pitch-analysis.service.ts       # Cent-based pitch comparison
│   │       ├── pronunciation.service.ts        # Levenshtein word matching
│   │       ├── duration-analysis.service.ts    # Rhythm/tempo scoring
│   │       └── feedback.service.ts             # Smart feedback generator
│   ├── progress/        # Per-song, per-sentence progress tracking
│   ├── leaderboard/     # Global, weekly, and per-song rankings
│   └── achievements/    # Gamification badges & rewards
└── database/
    └── seeds/           # Sample songs with sentences & pitch data
```

## 🎯 How Scoring Works

Each singing attempt is evaluated on 3 dimensions:

| Dimension | Weight | How It Works |
|-----------|--------|--------------|
| **Pronunciation** | 50% | Speech-to-text → word-by-word Levenshtein comparison |
| **Pitch** | 30% | Frequency contour comparison using cent deviation |
| **Duration** | 20% | Timing accuracy vs expected sentence duration |

- **Pass threshold**: 80% total score
- Failed attempts → must retry the same sentence
- Passed → unlock next sentence + earn XP

## 🚀 Quick Start

```bash
# 1. Clone & install
git clone https://github.com/lmduc2309/english-music-api.git
cd english-music-api
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Start database (Docker)
docker-compose up -d postgres

# 4. Run in dev mode
npm run start:dev

# 5. Seed sample data
npm run seed
```

API docs available at: `http://localhost:3000/docs`

## 🐳 Docker

```bash
docker-compose up -d
```

## 📡 API Endpoints

### Auth
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Songs
- `GET /api/v1/songs` - List songs (filter by level, genre, search)
- `GET /api/v1/songs/:id` - Song details with sentences
- `GET /api/v1/songs/:id/sentences` - Get all sentences
- `GET /api/v1/songs/level/:level` - Songs by CEFR level

### Lessons
- `GET /api/v1/lessons/:songId` - Start/continue a song lesson
- `GET /api/v1/lessons/recommendations/:level` - Get recommendations

### Scoring
- `POST /api/v1/scoring/evaluate` - Submit singing attempt
- `GET /api/v1/scoring/history` - Score history

### Progress
- `GET /api/v1/progress` - All song progress
- `GET /api/v1/progress/stats` - User statistics
- `GET /api/v1/progress/:songId` - Song-specific progress

### Leaderboard
- `GET /api/v1/leaderboard/global` - Global XP rankings
- `GET /api/v1/leaderboard/weekly` - Weekly score rankings
- `GET /api/v1/leaderboard/song/:songId` - Per-song rankings

### Achievements
- `GET /api/v1/achievements` - All achievements
- `GET /api/v1/achievements/mine` - User's unlocked achievements

## 🎓 CEFR Levels

| Level | Description | Song Characteristics |
|-------|-------------|---------------------|
| A1 | Beginner | Simple words, slow tempo, clear pronunciation |
| A2 | Elementary | Daily vocabulary, moderate tempo |
| B1 | Intermediate | Idioms, faster songs, connected speech |
| B2 | Upper Intermediate | Complex lyrics, natural speed |
| C1 | Advanced | Slang, rapid delivery, subtle pronunciation |
| C2 | Mastery | Native-level complexity, any genre |

## 🛠 Tech Stack

- **NestJS** - Framework
- **TypeORM** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Swagger** - API Documentation
- **Docker** - Containerization

## 📝 License

MIT
