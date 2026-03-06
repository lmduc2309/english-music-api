import { AchievementType } from '@/common/enums/achievement-type.enum';

export const achievementSeeds = [
  {
    type: AchievementType.FIRST_SONG,
    name: 'First Notes',
    description: 'Complete your first song!',
    xpReward: 50,
  },
  {
    type: AchievementType.PERFECT_SCORE,
    name: 'Pitch Perfect',
    description: 'Score 100% on any sentence.',
    xpReward: 100,
  },
  {
    type: AchievementType.STREAK_7,
    name: 'Week Warrior',
    description: 'Practice 7 days in a row!',
    xpReward: 200,
  },
  {
    type: AchievementType.STREAK_30,
    name: 'Monthly Master',
    description: 'Practice 30 days in a row!',
    xpReward: 500,
  },
  {
    type: AchievementType.SONGS_10,
    name: 'Rising Star',
    description: 'Complete 10 songs.',
    xpReward: 150,
  },
  {
    type: AchievementType.SONGS_50,
    name: 'Music Lover',
    description: 'Complete 50 songs.',
    xpReward: 300,
  },
  {
    type: AchievementType.SONGS_100,
    name: 'Legendary Singer',
    description: 'Complete 100 songs!',
    xpReward: 1000,
  },
  {
    type: AchievementType.PRONUNCIATION_MASTER,
    name: 'Word Wizard',
    description: 'Score 95%+ pronunciation on 20 sentences.',
    xpReward: 250,
  },
  {
    type: AchievementType.RHYTHM_KING,
    name: 'Rhythm King',
    description: 'Score 95%+ duration on 20 sentences.',
    xpReward: 250,
  },
];
