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
  { path: '/analytics', label: 'Stats', icon: 'analytics' },
  { path: '/leaderboard', label: 'Social', icon: 'group' },
]

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

export const WEEKLY_DATA = [
  { day: 'MON', height: 60 },
  { day: 'TUE', height: 85 },
  { day: 'WED', height: 45 },
  { day: 'THU', height: 95 },
  { day: 'FRI', height: 70 },
  { day: 'SAT', height: 30 },
  { day: 'SUN', height: 20 },
]
