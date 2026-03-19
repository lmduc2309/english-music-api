# 🎵 SingLish API — english-music-api

Learn English through singing! NestJS backend with AI-powered pronunciation scoring.

## Architecture

```
src/
├── auth/            # JWT authentication (register, login, profile)
├── songs/           # Song CRUD, lyrics management, YouTube integration
├── practice/        # Practice sessions, attempt submission, 80% gate
├── scoring/         # Scoring engine (pitch, pronunciation, timing, words)
├── vllm/            # vLLM integration (Qwen2.5-7B) for AI assessment
├── youtube/         # YouTube video info and caption fetching
├── vocabulary/      # Word learning with SM-2 spaced repetition
├── gamification/    # Achievements, XP, streaks, level progression
├── leaderboard/     # Global and weekly leaderboards
├── entities/        # 8 TypeORM entities
└── seed.ts          # Database seed with 5 sample songs
```

## Scoring Formula

Each singing attempt is scored across 4 dimensions:
- **Pitch (30%)** — Stability of vocal pitch via FFT analysis
- **Pronunciation (30%)** — AI-assessed via vLLM (Qwen2.5-7B)
- **Timing (20%)** — Duration match against reference
- **Word Accuracy (20%)** — Levenshtein-based word matching

Score >= 80% → pass and continue. Below 80% → retry the line.

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/lmduc2309/english-music-api.git
cd english-music-api
npm install

# 2. Start PostgreSQL and Redis
docker run -d --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
docker run -d --name redis -p 6379:6379 redis:7

# 3. Create database
createdb english_music

# 4. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 5. Seed sample data
npx ts-node src/seed.ts

# 6. Run the server
npm run start:dev
```

API: http://localhost:3000/api/v1
Swagger: http://localhost:3000/api/docs
Demo login: `demo@singlish.app` / `demo1234`

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Get JWT token |
| GET | `/auth/profile` | Current user profile |

### Songs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/songs` | List songs (filter by level, genre, search) |
| GET | `/songs/:id` | Get song with lyrics |
| POST | `/songs` | Create song with lyrics |
| GET | `/songs/level/:level` | Songs by CEFR level |
| POST | `/songs/:id/auto-import-lyrics` | Import from YouTube captions |

### Practice (Core Game Loop)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/practice/sessions/start` | Begin practice session |
| POST | `/practice/attempts/submit` | Submit singing attempt → scores |
| GET | `/practice/sessions/:id` | Session details |
| PATCH | `/practice/sessions/:id/abandon` | Abandon session |

### Vocabulary
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vocabulary` | User word list |
| GET | `/vocabulary/review` | Words due for SRS review |
| POST | `/vocabulary/:wordId/review` | Submit review (SM-2) |

### Gamification
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/gamification/stats` | XP, streaks, level |
| GET | `/gamification/achievements` | All achievements |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leaderboard/global` | All-time XP ranking |
| GET | `/leaderboard/weekly` | This week's top singers |
| GET | `/leaderboard/me` | Current user rank |

## vLLM Configuration

```env
VLLM_URL=http://192.168.20.228:8000/v1/completions
VLLM_MODEL=Qwen/Qwen2.5-7B-Instruct-AWQ
```

Used for: pronunciation assessment, feedback generation, vocabulary definitions.

## Sample Songs (seeded)

| Song | Artist | Level |
|------|--------|-------|
| Let It Be | The Beatles | A1 |
| Perfect | Ed Sheeran | A2 |
| Shape of You | Ed Sheeran | B1 |
| Someone Like You | Adele | B1 |
| Bohemian Rhapsody | Queen | C1 |

## Tech Stack

NestJS · TypeORM · PostgreSQL · Redis · JWT · Passport · Swagger · Axios · vLLM (Qwen2.5-7B)
