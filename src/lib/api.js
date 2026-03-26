import { supabase } from './supabase'

// ─── AUTH ──────────────────────────────────────────────────────────────────────
export const authService = {
  signUp: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getUser: async () => {
    const { data, error } = await supabase.auth.getUser()
    return { data, error }
  },
}

// ─── PROFILE ───────────────────────────────────────────────────────────────────
export const profileService = {
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },
}

// ─── SESSIONS ──────────────────────────────────────────────────────────────────
export const sessionsService = {
  getActiveSession: async (userId) => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['running', 'paused'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return { data, error }
  },

  getSessions: async (userId, limit = 20) => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  startSession: async (userId, mode, taskTitle) => {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        mode,
        task_title: taskTitle,
        status: 'running',
        start_time: new Date().toISOString(),
      })
      .select()
      .single()
    return { data, error }
  },

  pauseSession: async (sessionId) => {
    const { data, error } = await supabase
      .from('sessions')
      .update({
        status: 'paused',
        paused_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single()
    return { data, error }
  },

  resumeSession: async (sessionId) => {
    const { data, error } = await supabase
      .from('sessions')
      .update({
        status: 'running',
        paused_at: null,
      })
      .eq('id', sessionId)
      .select()
      .single()
    return { data, error }
  },

  endSession: async (sessionId, durationSeconds) => {
    const { data, error } = await supabase
      .from('sessions')
      .update({
        status: 'completed',
        end_time: new Date().toISOString(),
        duration: durationSeconds,
        paused_at: null,
      })
      .eq('id', sessionId)
      .select()
      .single()
    return { data, error }
  },

  abandonSession: async (sessionId, elapsedSeconds) => {
    const { data, error } = await supabase
      .from('sessions')
      .update({
        status: 'abandoned',
        end_time: new Date().toISOString(),
        duration: elapsedSeconds > 0 ? elapsedSeconds : 0,
        paused_at: null,
      })
      .eq('id', sessionId)
      .select()
      .single()
    return { data, error }
  },
}

// ─── ANALYTICS ─────────────────────────────────────────────────────────────────
export const analyticsService = {
  getWeeklyStats: async (userId) => {
    const { data, error } = await supabase.rpc('get_weekly_analytics', {
      p_user_id: userId,
    })
    return { data, error }
  },

  getDailyStats: async (userId, date) => {
    const targetDate = date || new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('user_id', userId)
      .eq('date', targetDate)
      .maybeSingle()
    return { data, error }
  },

  getHeatmapData: async (userId, days = 35) => {
    const from = new Date()
    from.setDate(from.getDate() - days)
    const { data, error } = await supabase
      .from('analytics')
      .select('date, total_focus_time, total_sessions')
      .eq('user_id', userId)
      .gte('date', from.toISOString().split('T')[0])
      .order('date', { ascending: true })
    return { data, error }
  },
}

// ─── TASKS ─────────────────────────────────────────────────────────────────────
export const tasksService = {
  getTasks: async (userId) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    return { data, error }
  },

  createTask: async (userId, task) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ user_id: userId, ...task })
      .select()
      .single()
    return { data, error }
  },

  updateTask: async (taskId, updates) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()
    return { data, error }
  },

  deleteTask: async (taskId) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
    return { error }
  },
}

// ─── SETTINGS ──────────────────────────────────────────────────────────────────
export const settingsService = {
  getSettings: async (userId) => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    return { data, error }
  },

  upsertSettings: async (userId, updates) => {
    const { data, error } = await supabase
      .from('settings')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    return { data, error }
  },
}

// ─── LEADERBOARD ───────────────────────────────────────────────────────────────
export const leaderboardService = {
  getTopUsers: async (limit = 10) => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('total_xp', { ascending: false })
      .limit(limit)
    return { data, error }
  },
}
