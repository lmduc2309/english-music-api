# 🎵 English Music API

> Learn English by singing your favorite songs — Node.js Backend API

## Architecture

```
src/
├── app.ts                    # Express entry point
├── config/
│   ├── constants.ts          # CEFR levels, scoring weights, XP config
│   └── database.ts           # MongoDB connection
├── controllers/
│   ├── auth.controller.ts    # Register, login, profile
│   ├── song.controller.ts    # Songs, sentences, levels
│   ├── practice.controller.ts # Submit attempts, scoring, history
│   ├── progress.controller.ts # User progress tracking
│   └── leaderboard.controller.ts # Rankings
├── middleware/
│   ├── auth.ts               # JWT authentication
│   ├── errorHandler.ts       # Global error handler
│   └── validate.ts           # Express-validator middleware
├── models/
│   ├── User.ts               # User profile + stats
│   ├── Song.ts               # Song metadata + language info
│   ├── Sentence.ts           # Lyrics with word-level timing + phonetics
│   ├── PracticeAttempt.ts    # Scoring per attempt
│   ├── SongProgress.ts       # Progress per song per user
│   └── Achievement.ts        # Unlockable badges
├── routes/
│   ├── auth.routes.ts
│   ├── song.routes.ts
│   ├── practice.routes.ts
│   ├── progress.routes.ts
│   └── leaderboard.routes.ts
├── services/
│   ├── scoring.service.ts    # Pitch + duration + pronunciation scoring engine
│   └── progress.service.ts   # XP, streaks, level-up logic
└── seeds/
    └── seeder.ts             # Sample songs A1–C2
```

## Core Features

- **CEFR A1–C2 Leveled Songs** with word-level timing & phonetics
- **3-Dimension Scoring**: pitch (25%), duration (25%), pronunciation (50%)
- **80% Pass Threshold** — must pass to continue to next sentence
- **Word-level feedback** — identifies exactly which words need practice
- **XP + Streak System** with multipliers for consecutive practice
- **Leaderboard** — global and per-level rankings
- **Smart Feedback** — emoji-rich tips based on score breakdown

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get profile |
| PATCH | `/api/auth/profile` | Update profile |
| GET | `/api/songs?level=A1&genre=pop` | Browse songs |
| GET | `/api/songs/levels` | Get level summary |
| GET | `/api/songs/:id` | Song details |
| GET | `/api/songs/:id/sentences` | Get all sentences |
| POST | `/api/practice/attempt` | Submit singing attempt |
| GET | `/api/practice/history` | Attempt history |
| GET | `/api/practice/daily-stats` | Today's stats |
| GET | `/api/progress` | Overall progress |
| GET | `/api/progress/song/:songId` | Per-song progress |
| GET | `/api/leaderboard` | Global leaderboard |
| GET | `/api/leaderboard/level/:level` | Level leaderboard |
| GET | `/api/leaderboard/me` | My rank |

## Quick Start

```bash
# Install
npm install

# Copy env
cp .env.example .env

# Seed database (sample songs A1-C2)
npm run seed

# Development
npm run dev

# Production
npm run build && npm start
```

## Scoring System

The scoring engine analyzes three dimensions:

1. **Pitch (25%)** — Compares pitch contours using semitone distance with linear interpolation
2. **Duration (25%)** — Timing accuracy with ±20% tolerance for full score
3. **Pronunciation (50%)** — Word-by-word Levenshtein similarity scoring

```
Overall = (pitch × 0.25) + (duration × 0.25) + (pronunciation × 0.50)
Pass threshold: 80%
```

## Docker

```bash
docker-compose up -d
```

## Tech Stack

Express.js + TypeScript + MongoDB + Mongoose + JWT + bcrypt
