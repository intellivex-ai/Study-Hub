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

      activeSessionId: null,
      sessionStartedAt: null,
      elapsedAtPause: 0,

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
        blockedApps: [],
        focusGoal: 14400,
        showOnLeaderboard: true,
        analyticsSharing: false,
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
            blockedApps: dbRow.blocked_apps ?? s.settings.blockedApps,
            showOnLeaderboard: dbRow.show_on_leaderboard ?? s.settings.showOnLeaderboard,
            analyticsSharing: dbRow.analytics_sharing ?? s.settings.analyticsSharing,
          },
        }))
      },

      // ── Analytics (local cache) ────────────────────────────
      weeklyData: [],
      setWeeklyData: (data) => set({ weeklyData: data }),
      heatmapData: [],
      setHeatmapData: (data) => set({ heatmapData: data }),

      // ── Notes ─────────────────────────────────────────────
      notes: [],
      setNotes: (notes) => set({ notes }),
      addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
      updateNote: (id, updates) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
        })),
      removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      activeNoteId: null,
      setActiveNoteId: (id) => set({ activeNoteId: id }),

      // ── Flashcards ────────────────────────────────────────
      flashcardDecks: [],
      setFlashcardDecks: (decks) => set({ flashcardDecks: decks }),
      addFlashcardDeck: (deck) => set((s) => ({ flashcardDecks: [deck, ...s.flashcardDecks] })),
      removeFlashcardDeck: (id) =>
        set((s) => ({ flashcardDecks: s.flashcardDecks.filter((d) => d.id !== id) })),
      dueCardsCount: 0,
      setDueCardsCount: (n) => set({ dueCardsCount: n }),

      // ── Achievements ──────────────────────────────────────
      earnedAchievements: [],
      setEarnedAchievements: (keys) => set({ earnedAchievements: keys }),
      addEarnedAchievement: (key) =>
        set((s) => ({
          earnedAchievements: s.earnedAchievements.includes(key)
            ? s.earnedAchievements
            : [...s.earnedAchievements, key],
        })),

      // ── XP Toast ──────────────────────────────────────────
      xpToast: null, // { amount, label }
      showXpToast: (amount, label = '') => {
        set({ xpToast: { amount, label } })
        setTimeout(() => set({ xpToast: null }), 3000)
      },

      // ── Ambient Sound ─────────────────────────────────────
      ambientSound: null, // null or sound id string
      ambientVolume: 0.4,
      setAmbientSound: (id) => set({ ambientSound: id }),
      setAmbientVolume: (v) => set({ ambientVolume: v }),
    }),
    {
      name: 'study-hub-store',
      partialize: (state) => ({
        user: state.user,
        timerMode: state.timerMode,
        timerTask: state.timerTask,
        settings: state.settings,
        activeSessionId: state.activeSessionId,
        sessionStartedAt: state.sessionStartedAt,
        elapsedAtPause: state.elapsedAtPause,
        ambientSound: state.ambientSound,
        ambientVolume: state.ambientVolume,
        earnedAchievements: state.earnedAchievements,
      }),
    }
  )
)

export default useAppStore
