import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageWrapper from '../layout/PageWrapper'
import AnimatedStartFocusButton from '../ui/AnimatedStartFocusButton'
import ScheduleButton from '../ui/ScheduleButton'
import useAppStore from '../../store/useAppStore'
import { useAuth } from '../../lib/auth'
import { profileService, analyticsService, settingsService } from '../../lib/api'
import { SkeletonCard, SkeletonText, SkeletonAvatar } from '../ui/Skeleton'
import AICoachCard from '../ui/AICoachCard'
import DashboardStatCard from '../ui/DashboardStatCard'
import { getXpLevel, NAV_ITEMS_MORE } from '../../lib/constants'

const stagger = { animate: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } }

function formatFocusTime(seconds) {
  if (!seconds || seconds === 0) return '0m'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}

function getDailyMissions(user, tasks, notes) {
  return [
    {
      id: 'focus',
      label: 'Complete 1 focus session',
      icon: 'timer',
      done: (user.dailyFocusSeconds || 0) >= 1500, // ≥25 min
      path: '/focus',
      xp: 30,
    },
    {
      id: 'note',
      label: 'Write a note',
      icon: 'edit_note',
      done: notes.some((n) => {
        const d = new Date(n.created_at)
        const today = new Date()
        return d.toDateString() === today.toDateString()
      }),
      path: '/notes',
      xp: 15,
    },
    {
      id: 'task',
      label: 'Complete a scheduled task',
      icon: 'task_alt',
      done: tasks.some((t) => t.done),
      path: '/scheduler',
      xp: 20,
    },
  ]
}

function getSmartSuggestion(user, tasks) {
  const hour = new Date().getHours()
  const pendingHigh = tasks.find((t) => t.priority === 'high' && !t.done)

  if (pendingHigh) {
    return { text: `You have a high-priority task: "${pendingHigh.title}". Tackle it now while your energy is high.`, icon: 'priority_high', color: '#4AE176' }
  }
  if (hour >= 9 && hour <= 11) {
    return { text: 'It\'s your peak focus window (9–11 AM). Start a Deep Focus session now!', icon: 'bolt', color: '#fbbf24' }
  }
  if ((user.streak || 0) === 0) {
    return { text: 'Start a study session today to begin your streak. Consistency is everything.', icon: 'local_fire_department', color: '#f97316' }
  }
  if ((user.dailyGoalPct || 0) < 50) {
    return { text: `You're ${user.dailyGoalPct || 0}% through your daily goal. One more Pomodoro will make a big difference!`, icon: 'trending_up', color: '#60a5fa' }
  }
  return { text: 'Great work today! Review your flashcards to keep your knowledge sharp.', icon: 'style', color: '#a78bfa' }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const { user, setUser, setUserFromProfile, setSettingsFromDB, notes, tasks } = useAppStore()
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    if (!authUser?.id) return
    const load = async () => {
      setIsFetching(true)
      const { data: profile } = await profileService.getProfile(authUser.id)
      if (profile) setUserFromProfile(profile, authUser.email)

      const { data: settings } = await settingsService.getSettings(authUser.id)
      if (settings) setSettingsFromDB(settings)

      const { data: today } = await analyticsService.getDailyStats(authUser.id)
      const focusGoal = settings?.focus_goal ?? 14400
      const focusSecs = today?.total_focus_time ?? 0
      const dailyGoalPct = Math.min(100, Math.round((focusSecs / focusGoal) * 100))

      setUser({
        totalFocusTime: formatFocusTime(focusSecs),
        dailyFocusSeconds: focusSecs,
        dailyGoalPct,
        focusScore: profile?.focus_score ?? 0,
        streak: profile?.streak ?? 0,
      })
      setIsFetching(false)
    }
    load()
  }, [authUser?.id])

  const circumference = 2 * Math.PI * 88
  const offset = circumference * (1 - (user.dailyGoalPct || 0) / 100)
  const firstName = user.name?.split(' ')[0] || 'Scholar'
  const greeting = getTimeOfDay()
  const { current: xpLevel, progress: xpProgress } = getXpLevel(user.totalXp || 0)
  const missions = getDailyMissions(user, tasks, notes)
  const missionsDone = missions.filter((m) => m.done).length
  const suggestion = getSmartSuggestion(user, tasks)

  return (
    <PageWrapper>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-8">

        {/* ── Welcome Section ────────────────────────────────────── */}
        <motion.section variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-primary/70 uppercase tracking-widest font-mono">
                Good {greeting}
              </span>
            </div>
            <h1 className="text-on-surface-variant font-medium text-lg flex items-center h-6">
              {isFetching ? <SkeletonText lines={1} className="w-28 mt-1" /> : `Hello, ${firstName}`}
            </h1>
            <p
              className="text-4xl md:text-5xl font-headline font-black tracking-tighter text-white flex items-center h-[52px]"
              style={{ textShadow: '0 0 20px rgba(255,255,255,0.1)' }}
            >
              {isFetching ? (
                <SkeletonText lines={1} className="w-52 mt-2" />
              ) : (
                <>Your Sanctuary<span className="text-primary" style={{ textShadow: '0 0 15px rgba(74,225,118,0.4)' }}>.</span></>
              )}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-row gap-3 w-full max-w-sm md:max-w-xs">
            <Link to="/focus" className="flex-1 min-w-0">
              <AnimatedStartFocusButton />
            </Link>
            <Link to="/scheduler" className="flex-1 min-w-0">
              <ScheduleButton />
            </Link>
          </div>
        </motion.section>

        {/* ── Smart Suggestion Banner ───────────────────────────── */}
        {!isFetching && (
          <motion.div
            variants={fadeUp}
            className="relative rounded-2xl border border-white/8 bg-white/3 p-4 flex items-center gap-4 overflow-hidden group hover:border-white/15 transition-colors"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: `radial-gradient(ellipse at left, ${suggestion.color}08, transparent 60%)` }}
            />
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${suggestion.color}15`, border: `1px solid ${suggestion.color}25` }}
            >
              <span className="material-symbols-outlined text-lg" style={{ color: suggestion.color, fontVariationSettings: "'FILL' 1" }}>
                {suggestion.icon}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed relative">{suggestion.text}</p>
          </motion.div>
        )}

        {/* ── Main Bento Grid ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

          {/* AI Coach Card — spans 8 cols */}
          {isFetching ? (
            <SkeletonCard className="md:col-span-8 p-8 min-h-[260px] flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-6">
                <SkeletonAvatar size="w-12 h-12" />
                <SkeletonText lines={1} className="w-32" />
              </div>
              <SkeletonText lines={2} className="w-3/4 max-w-md" />
              <div className="mt-8 flex gap-3">
                <SkeletonText lines={1} className="w-32" />
                <SkeletonText lines={1} className="w-40" />
              </div>
            </SkeletonCard>
          ) : (
            <motion.div variants={fadeUp} className="md:col-span-8">
              <AICoachCard focusScore={user.focusScore} streak={user.streak} time={user.totalFocusTime} />
            </motion.div>
          )}

          {/* Daily Goal Ring — spans 4 cols */}
          {isFetching ? (
            <SkeletonCard className="md:col-span-4 p-8 flex flex-col items-center justify-center space-y-6 h-full min-h-[300px]">
              <SkeletonText lines={1} className="w-24 mb-2" />
              <SkeletonAvatar size="w-48 h-48" />
              <SkeletonText lines={2} className="w-32 mt-4 text-center items-center flex flex-col mx-auto" />
            </SkeletonCard>
          ) : (
            <motion.div
              variants={fadeUp}
              className="md:col-span-4 relative bg-surface-container-low/40 backdrop-blur-xl rounded-2xl border border-outline-variant/10 p-6 flex flex-col items-center justify-center text-center space-y-4 overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

              <p className="text-[10px] font-black tracking-widest text-on-surface-variant uppercase relative">Daily Goal</p>

              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192" role="img" aria-label={`Daily goal progress: ${user.dailyGoalPct}%`}>
                  <circle cx="96" cy="96" r="88" fill="none" stroke="rgba(74,225,118,0.06)" strokeWidth="12" />
                  <motion.circle
                    cx="96" cy="96" r="88" fill="none"
                    stroke="url(#dashGrad)" strokeWidth="12"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#003915" />
                      <stop offset="100%" stopColor="#4AE176" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <motion.span className="text-4xl font-black text-white font-headline tracking-tighter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    {user.dailyGoalPct}%
                  </motion.span>
                  <span className="text-[10px] text-primary font-black uppercase tracking-widest">Done</span>
                </div>
              </div>

              {/* XP Level mini display */}
              <div className="w-full space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Level {xpLevel.level}</span>
                  <span className="text-[10px] font-black text-primary font-mono">{xpLevel.label}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1.2, delay: 0.5 }}
                  />
                </div>
              </div>

              {/* Streak */}
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                <span className="font-black font-mono text-xl">{user.streak}</span>
                <span className="text-sm text-on-surface-variant">days</span>
              </div>
            </motion.div>
          )}

          {/* ── Stat Cards Row ─────────────────────────────────── */}
          {[
            { icon: 'schedule', label: 'Focus Time Today', value: user.totalFocusTime },
            { icon: 'analytics', label: 'Focus Score', value: `${user.focusScore}%` },
            { icon: 'workspace_premium', label: 'Total XP', value: (user.totalXp ?? 0).toLocaleString() },
          ].map((stat, i) =>
            isFetching ? (
              <SkeletonCard key={i} className="md:col-span-4 p-6 flex items-start gap-4 min-h-[120px]">
                <SkeletonAvatar size="w-12 h-12 !rounded-xl shrink-0" />
                <div className="flex-1">
                  <SkeletonText lines={1} className="w-24 mb-2" />
                  <SkeletonText lines={1} className="w-16 h-6 mb-2" />
                </div>
              </SkeletonCard>
            ) : (
              <motion.div key={stat.label} variants={fadeUp} className="md:col-span-4">
                <DashboardStatCard label={stat.label} value={stat.value} icon={stat.icon} delay={0.1 * i} />
              </motion.div>
            )
          )}

          {/* ── Daily Missions ────────────────────────────────── */}
          <motion.div variants={fadeUp} className="md:col-span-12">
            <div className="bg-surface-container-low/40 backdrop-blur-xl border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Daily Missions</p>
                  <h2 className="font-headline font-black text-xl text-white tracking-tight mt-0.5">
                    {missionsDone}/{missions.length} Complete<span className="text-primary">.</span>
                  </h2>
                </div>
                <Link to="/achievements" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                  All Achievements →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {missions.map((m, i) => (
                  <Link key={m.id} to={m.path}>
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        m.done
                          ? 'bg-primary/8 border-primary/25'
                          : 'bg-white/3 border-white/8 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${m.done ? 'bg-primary/20 border border-primary/30' : 'bg-white/5 border border-white/8'}`}>
                        <span className="material-symbols-outlined text-lg" style={{ color: m.done ? '#4AE176' : undefined, fontVariationSettings: `'FILL' ${m.done ? 1 : 0}` }}>
                          {m.done ? 'check_circle' : m.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${m.done ? 'text-primary line-through opacity-70' : 'text-white'}`}>{m.label}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">+{m.xp} XP</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── More Features Tiles ───────────────────────────── */}
          {NAV_ITEMS_MORE.map((tile, i) => (
            <motion.div key={tile.path} variants={fadeUp} className="md:col-span-3">
              <Link to={tile.path} className="block h-full">
                <motion.div
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative h-full bg-surface-container-low/40 backdrop-blur-xl border border-outline-variant/10 hover:border-white/15 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${tile.accent}15`, border: `1px solid ${tile.accent}25` }}
                  >
                    <span className="material-symbols-outlined text-xl" style={{ color: tile.accent, fontVariationSettings: "'FILL' 1" }}>
                      {tile.icon}
                    </span>
                  </div>
                  <div className="relative">
                    <p className="font-black text-on-surface text-sm tracking-tight">{tile.label}</p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-on-surface-variant/70 ml-auto text-lg transition-colors">
                    arrow_forward_ios
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          ))}

        </div>
      </motion.div>
    </PageWrapper>
  )
}
