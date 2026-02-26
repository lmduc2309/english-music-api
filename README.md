# 🎵 English Music API

**Learn English by Singing Songs** — A Node.js backend that powers an interactive English learning experience through music.

## 🎯 Concept

Users listen to English songs sentence-by-sentence, then sing/speak each sentence back. The system scores them on:
- **Pitch Accuracy** — How well they match the musical notes
- **Duration Accuracy** — Timing and rhythm of their delivery  
- **Pronunciation Score** — Correctness of English pronunciation
- **Overall Score** — Weighted combination of all three

Users must score **≥80%** to advance to the next sentence. Songs are categorized by CEFR levels (A1→C2).

## 🏗 Architecture

```
src/
├── config/          # Database, auth, app config
├── controllers/     # Route handlers
├── middleware/      # Auth, error handling, validation
├── models/          # MongoDB/Mongoose schemas
├── routes/          # API route definitions
├── services/        # Business logic & scoring engine
├── utils/           # Helpers, constants
├── seeds/           # Sample data seeder
└── app.ts           # Express app entry
```

## 🚀 Quick Start

```bash
npm install
cp .env.example .env
npm run seed
npm run dev
```

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Songs  
- `GET /api/songs` — List songs (filter by level, genre)
- `GET /api/songs/:id` — Get song details with sentences
- `GET /api/songs/levels/summary` — Songs count per CEFR level

### Practice & Scoring
- `POST /api/practice/score` — Submit attempt & get score
- `GET /api/practice/history` — Practice history
- `GET /api/practice/song/:songId/progress` — Song progress

### Progress & Achievements  
- `GET /api/progress/dashboard` — User dashboard
- `GET /api/achievements` — All achievements
- `GET /api/leaderboard` — Global leaderboard

## 🎮 Scoring System

| Component | Weight | Description |
|-----------|--------|-------------|
| Pronunciation | 50% | Word-level accuracy via speech-to-text |
| Pitch | 25% | Musical note matching |
| Duration | 25% | Rhythm and timing |

**Pass Threshold:** 80% overall score to advance.

## 🏆 CEFR Levels

| Level | Description | Song Examples |
|-------|-------------|---------------|
| A1 | Beginner | Simple children's songs, slow ballads |
| A2 | Elementary | Pop songs with clear pronunciation |
| B1 | Intermediate | Standard pop/rock songs |
| B2 | Upper Intermediate | Songs with idioms, phrasal verbs |
| C1 | Advanced | Fast-paced songs, complex lyrics |
| C2 | Mastery | Rap, songs with slang & cultural refs |

## 🛠 Tech Stack

- **Runtime:** Node.js + TypeScript  
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt

## 📄 License
MIT
