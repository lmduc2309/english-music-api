# English Music API

NestJS backend for the English Music Learning App — learn English by singing songs!

## Tech Stack

- **Framework:** NestJS v10
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + Passport
- **Validation:** class-validator / class-transformer

## Project Structure

```
src/
  main.ts                   # App bootstrap
  app.module.ts             # Root module
  common/
    constants.ts            # CEFR levels, scoring config
    guards/                 # JwtAuthGuard
    decorators/             # @UserId, @CurrentUser
    filters/                # HttpExceptionFilter
  modules/
    auth/                   # Register, login, JWT strategy
    users/                  # Profile, stats, change password
    songs/                  # Song list, sentences, levels
    practice/               # Submit attempts, scoring, history
    progress/               # User & song progress tracking
    leaderboard/            # Global & level leaderboards
    achievements/           # Achievement unlock system
  services/
    scoring.service.ts      # Pitch, duration, pronunciation scoring
    progress-helper.service # Streak, level-up, XP helpers
  models/                   # Mongoose schemas
  seeds/                    # DB seed data
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | - | Register |
| POST | /api/auth/login | - | Login |
| GET | /api/auth/profile | JWT | My profile |
| GET | /api/users/profile | JWT | Profile |
| PUT | /api/users/profile | JWT | Update profile |
| PUT | /api/users/change-password | JWT | Change password |
| GET | /api/users/stats | JWT | User stats |
| GET | /api/songs | JWT | List songs |
| GET | /api/songs/levels | JWT | CEFR levels |
| GET | /api/songs/:id | JWT | Song detail |
| GET | /api/songs/:id/sentences | JWT | Song sentences |
| POST | /api/practice/attempt | JWT | Submit singing attempt |
| GET | /api/practice/history | JWT | Attempt history |
| GET | /api/practice/daily-stats | JWT | Today's stats |
| GET | /api/progress | JWT | Overall progress |
| GET | /api/progress/songs/:id | JWT | Song progress |
| GET | /api/leaderboard | JWT | Global leaderboard |
| GET | /api/leaderboard/me | JWT | My rank |
| GET | /api/leaderboard/level/:lvl | JWT | Level leaderboard |
| GET | /api/achievements | JWT | All achievements |
| GET | /api/achievements/mine | JWT | My achievements |
| POST | /api/achievements/check | JWT | Check & award new |

## Setup

```bash
npm install
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET
npm run dev
```

## Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/english_music
JWT_SECRET=your_secret
JWT_EXPIRES_IN=30d
PORT=3000
```
