import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TIMER_DURATIONS } from '../lib/constants'

const useAppStore = create(
  persist(
    (set, get) => ({
      // ── User / Profile ────────────────────────────────────
      user: {
        id: null,
        name: 'Scholar',
        email: '',
        avatar: null,
        streak: 0,
        focusScore: 0,
        totalXp: 0,
        totalFocusTime: '0m',
        dailyGoalPct: 0,
        dailyFocusSeconds: 0,
      },
      setUser: (updates) => set((s) => ({ user: { ...s.user, ...updates } })),
      setUserFromProfile: (profile, email = '') => {
        set((s) => ({
          user: {
            ...s.user,
            id: profile.id,
            name: profile.name,
            email,
            streak: profile.streak,
            focusScore: profile.focus_score,
            totalXp: profile.total_xp,
          },
        }))
      },
      clearUser: () =>
        set({
          user: {
            id: null,
            name: 'Scholar',
            email: '',
            avatar: null,
            streak: 0,
            focusScore: 0,
            totalXp: 0,
            totalFocusTime: '0m',
            dailyGoalPct: 0,
            dailyFocusSeconds: 0,
          },
        }),

      // ── Timer ─────────────────────────────────────────────
      timerMode: 'pomodoro',
      timerSeconds: TIMER_DURATIONS.pomodoro,
      timerRunning: false,
      timerTask: 'Study Session',

      // Active session tracking (persisted so refresh can resume)
      activeSessionId: null,
      sessionStartedAt: null, // ISO string — when timer was last started
      elapsedAtPause: 0,      // seconds elapsed before last pause

      setTimerMode: (mode) =>
        set({ timerMode: mode, timerSeconds: TIMER_DURATIONS[mode], timerRunning: false }),
      setTimerSeconds: (s) => set({ timerSeconds: s }),
      setTimerRunning: (v) => set({ timerRunning: v }),
      resetTimer: () =>
        set((s) => ({
          timerSeconds: TIMER_DURATIONS[s.timerMode],
          timerRunning: false,
          activeSessionId: null,
          sessionStartedAt: null,
          elapsedAtPause: 0,
        })),
      setTimerTask: (task) => set({ timerTask: task }),
      setActiveSession: (id, startedAt) =>
        set({ activeSessionId: id, sessionStartedAt: startedAt }),
      clearActiveSession: () =>
        set({ activeSessionId: null, sessionStartedAt: null, elapsedAtPause: 0 }),
      setElapsedAtPause: (elapsed) => set({ elapsedAtPause: elapsed }),

      // ── Tasks ─────────────────────────────────────────────
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
      updateTask: (id, updates) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      removeTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      // ── Settings ──────────────────────────────────────────
      settings: {
        notifications: true,
        soundEnabled: true,
        autoBreak: true,
        pomodoroLength: 25,
        breakLength: 5,
        theme: 'dark',
        blockingSites: ['instagram.com', 'twitter.com', 'reddit.com'],
        focusGoal: 14400, // seconds (4h)
      },
      updateSettings: (updates) =>
        set((s) => ({ settings: { ...s.settings, ...updates } })),
      setSettingsFromDB: (dbRow) => {
        if (!dbRow) return
        set((s) => ({
          settings: {
            ...s.settings,
            pomodoroLength: dbRow.pomodoro_length ?? s.settings.pomodoroLength,
            breakLength: dbRow.break_length ?? s.settings.breakLength,
            focusGoal: dbRow.focus_goal ?? s.settings.focusGoal,
            autoBreak: dbRow.auto_break ?? s.settings.autoBreak,
            soundEnabled: dbRow.sound_enabled ?? s.settings.soundEnabled,
            notifications: dbRow.notifications ?? s.settings.notifications,
            theme: dbRow.theme ?? s.settings.theme,
            blockingSites: dbRow.blocked_sites ?? s.settings.blockingSites,
          },
        }))
      },

      // ── Analytics (local cache) ────────────────────────────
      weeklyData: [],
      setWeeklyData: (data) => set({ weeklyData: data }),
      heatmapData: [],
      setHeatmapData: (data) => set({ heatmapData: data }),
    }),
    {
      name: 'study-hub-store',
      partialize: (state) => ({
        // Only persist what's safe & useful across refreshes
        user: state.user,
        timerMode: state.timerMode,
        timerTask: state.timerTask,
        settings: state.settings,
        activeSessionId: state.activeSessionId,
        sessionStartedAt: state.sessionStartedAt,
        elapsedAtPause: state.elapsedAtPause,
      }),
    }
  )
)

export default useAppStore
