export const TIMER_MODES = {
  POMODORO: 'pomodoro',
  DEEP_FOCUS: 'deep_focus',
}

export const TIMER_DURATIONS = {
  pomodoro: 25 * 60,
  deep_focus: 90 * 60,
}

export const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: 'grid_view' },
  { path: '/focus', label: 'Focus', icon: 'timer' },
  { path: '/kesari', label: 'Coach', icon: 'psychology' },
  { path: '/notes', label: 'Notes', icon: 'edit_note' },
  { path: '/analytics', label: 'Stats', icon: 'analytics' },
]

export const NAV_ITEMS_MORE = [
  { path: '/flashcards', label: 'Flashcards', icon: 'style', accent: '#a78bfa' },
  { path: '/leaderboard', label: 'Social', icon: 'group', accent: '#60a5fa' },
  { path: '/scheduler', label: 'Scheduler', icon: 'calendar_month', accent: '#f97316' },
  { path: '/achievements', label: 'Achievements', icon: 'workspace_premium', accent: '#fbbf24' },
]

export const AMBIENT_SOUNDS = [
  { id: 'rain', label: 'Rain', icon: 'water_drop', color: '#60a5fa' },
  { id: 'cafe', label: 'Café', icon: 'local_cafe', color: '#f97316' },
  { id: 'lofi', label: 'Lo-Fi', icon: 'headphones', color: '#a78bfa' },
  { id: 'forest', label: 'Forest', icon: 'forest', color: '#4AE176' },
  { id: 'whitenoise', label: 'White Noise', icon: 'waves', color: '#94a3b8' },
  { id: 'ocean', label: 'Ocean', icon: 'beach_access', color: '#38bdf8' },
]

export const ACHIEVEMENTS_DEFS = [
  // Focus milestones
  { key: 'first_session', label: 'First Step', desc: 'Complete your first focus session', icon: 'rocket_launch', rarity: 'bronze', xp: 50 },
  { key: 'session_10', label: 'Getting Hooked', desc: 'Complete 10 focus sessions', icon: 'bolt', rarity: 'bronze', xp: 100 },
  { key: 'session_50', label: 'Focus Machine', desc: 'Complete 50 focus sessions', icon: 'psychology', rarity: 'silver', xp: 250 },
  { key: 'session_100', label: 'Century Club', desc: 'Complete 100 focus sessions', icon: 'military_tech', rarity: 'gold', xp: 500 },
  // Streak achievements
  { key: 'streak_3', label: 'On a Roll', desc: '3-day study streak', icon: 'local_fire_department', rarity: 'bronze', xp: 75 },
  { key: 'streak_7', label: 'Week Warrior', desc: '7-day study streak', icon: 'local_fire_department', rarity: 'silver', xp: 200 },
  { key: 'streak_30', label: 'Monthly Legend', desc: '30-day study streak', icon: 'local_fire_department', rarity: 'gold', xp: 750 },
  // Time achievements
  { key: 'focus_1h', label: 'Hour Power', desc: 'Focus for 1 hour in a day', icon: 'schedule', rarity: 'bronze', xp: 60 },
  { key: 'focus_4h', label: 'Deep Work', desc: 'Focus for 4 hours in a day', icon: 'self_improvement', rarity: 'silver', xp: 200 },
  { key: 'focus_8h', label: 'Legendary Flow', desc: 'Focus for 8 hours in a day', icon: 'star', rarity: 'gold', xp: 500 },
  // Notes achievements
  { key: 'first_note', label: 'Note Taker', desc: 'Write your first note', icon: 'edit_note', rarity: 'bronze', xp: 40 },
  { key: 'notes_10', label: 'Knowledge Base', desc: 'Create 10 notes', icon: 'library_books', rarity: 'silver', xp: 150 },
  // Flashcard achievements
  { key: 'first_deck', label: 'Card Shark', desc: 'Create your first flashcard deck', icon: 'style', rarity: 'bronze', xp: 50 },
  { key: 'review_50', label: 'Memory Master', desc: 'Review 50 flashcards', icon: 'psychology_alt', rarity: 'silver', xp: 200 },
  // Special
  { key: 'night_owl', label: 'Night Owl', desc: 'Study after 11 PM', icon: 'bedtime', rarity: 'bronze', xp: 80 },
  { key: 'early_bird', label: 'Early Bird', desc: 'Study before 7 AM', icon: 'wb_sunny', rarity: 'bronze', xp: 80 },
  { key: 'xp_1000', label: 'XP Collector', desc: 'Earn 1,000 total XP', icon: 'workspace_premium', rarity: 'silver', xp: 100 },
  { key: 'xp_5000', label: 'XP Legend', desc: 'Earn 5,000 total XP', icon: 'emoji_events', rarity: 'gold', xp: 250 },
]

export const XP_LEVELS = [
  { level: 1, minXp: 0, label: 'Novice' },
  { level: 2, minXp: 200, label: 'Apprentice' },
  { level: 3, minXp: 500, label: 'Student' },
  { level: 4, minXp: 1000, label: 'Scholar' },
  { level: 5, minXp: 2000, label: 'Researcher' },
  { level: 6, minXp: 3500, label: 'Expert' },
  { level: 7, minXp: 5500, label: 'Master' },
  { level: 8, minXp: 8000, label: 'Sage' },
  { level: 9, minXp: 11000, label: 'Genius' },
  { level: 10, minXp: 15000, label: 'Legend' },
]

export function getXpLevel(totalXp) {
  let current = XP_LEVELS[0]
  let next = XP_LEVELS[1]
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= XP_LEVELS[i].minXp) {
      current = XP_LEVELS[i]
      next = XP_LEVELS[i + 1] || null
      break
    }
  }
  const progress = next
    ? Math.round(((totalXp - current.minXp) / (next.minXp - current.minXp)) * 100)
    : 100
  return { current, next, progress, totalXp }
}

// SM-2 Spaced Repetition Algorithm
export function sm2(card, rating) {
  // rating: 0=forgot, 1=hard, 2=good, 3=easy
  const q = [0, 3, 4, 5][rating]
  let { ease_factor, interval, repetitions } = card

  if (q < 3) {
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * ease_factor)
    repetitions += 1
  }

  ease_factor = Math.max(1.3, ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))

  const next_review = new Date()
  next_review.setDate(next_review.getDate() + interval)

  return {
    ease_factor: Math.round(ease_factor * 100) / 100,
    interval,
    repetitions,
    next_review: next_review.toISOString().split('T')[0],
  }
}

export const MOCK_USERS = [
  { id: 1, name: 'Alex M.', duration: '45m', active: true },
  { id: 2, name: 'Sarah J.', duration: '1h 12m', active: true },
  { id: 3, name: 'Marcus T.', duration: '22m', active: true },
  { id: 4, name: 'Lena K.', duration: '3h 05m', active: true },
  { id: 5, name: 'Sofia R.', duration: '18m', active: true },
  { id: 6, name: 'Daniel W.', duration: '54m', active: true },
]

export const LEADERBOARD_DATA = [
  { rank: 1, name: 'Priya S.', xp: 18750, streak: 21, avatar: null },
  { rank: 2, name: 'Marcus V.', xp: 14200, streak: 14, avatar: null },
  { rank: 3, name: 'Emma R.', xp: 11890, streak: 9, avatar: null },
  { rank: 4, name: 'James L.', xp: 9450, streak: 7, avatar: null },
  { rank: 5, name: 'Yuki T.', xp: 8200, streak: 12, avatar: null },
  { rank: 6, name: 'Alex M.', xp: 7100, streak: 5, avatar: null },
  { rank: 7, name: 'Fatima H.', xp: 6800, streak: 8, avatar: null },
]
