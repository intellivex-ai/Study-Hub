import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageWrapper from '../layout/PageWrapper'
import Button from '../ui/Button'
import useAppStore from '../../store/useAppStore'
import { useAuth } from '../../lib/auth'
import { profileService, analyticsService, settingsService } from '../../lib/api'
import { SkeletonCard, SkeletonText, SkeletonAvatar } from '../ui/Skeleton'

const stagger = { animate: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

function formatFocusTime(seconds) {
  if (!seconds || seconds === 0) return '0m'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export default function Dashboard() {
  const { user: authUser } = useAuth()
  const { user, setUser, setUserFromProfile, setSettingsFromDB } = useAppStore()
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    if (!authUser?.id) return

    const load = async () => {
      setIsFetching(true)
      // Load profile
      const { data: profile } = await profileService.getProfile(authUser.id)
      if (profile) {
        setUserFromProfile(profile, authUser.email)
      }

      // Load today's analytics for daily goal %
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

  return (
    <PageWrapper>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-8">

        {/* Welcome Section */}
        <motion.section variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-on-surface-variant font-medium text-lg flex items-center h-6">
              {isFetching ? <SkeletonText lines={1} className="w-24 mt-1" /> : `Hello, ${user.name}`}
            </h1>
            <p className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-white flex items-center h-[48px]">
              {isFetching ? <SkeletonText lines={1} className="w-48 mt-2" /> : 'Your Sanctuary'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/focus">
              <Button icon="play_arrow">Start Focus</Button>
            </Link>
            <Link to="/scheduler">
              <Button variant="secondary" icon="calendar_today">Schedule</Button>
            </Link>
          </div>
        </motion.section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* AI Coach Card */}
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
            <motion.div variants={fadeUp} className="md:col-span-8 glass-card rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <span className="material-symbols-outlined text-[96px] text-primary">psychology</span>
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                  </div>
                  <span className="text-primary font-bold tracking-wider uppercase text-xs">Kesari AI Coach</span>
                </div>
                <p className="text-2xl md:text-3xl font-headline font-bold text-white max-w-md leading-snug">
                  "Your focus is at{' '}
                  <span className="text-primary">{user.focusScore}%</span> today. Ready for a deep session?"
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-white/5 rounded-full text-xs font-medium text-on-surface-variant">
                    Streak: {user.streak} days 🔥
                  </span>
                  <span className="px-4 py-2 bg-white/5 rounded-full text-xs font-medium text-on-surface-variant">
                    Today: {user.totalFocusTime} focused
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Daily Goal Ring */}
          {isFetching ? (
            <SkeletonCard className="md:col-span-4 p-8 flex flex-col items-center justify-center space-y-6 h-full min-h-[300px]">
              <SkeletonText lines={1} className="w-24 mb-2" />
              <SkeletonAvatar size="w-48 h-48" />
              <SkeletonText lines={2} className="w-32 mt-4 text-center items-center flex flex-col mx-auto" />
            </SkeletonCard>
          ) : (
            <motion.div variants={fadeUp} className="md:col-span-4 bg-surface-container-low rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-6">
              <p className="text-sm font-semibold tracking-widest text-on-surface-variant uppercase">Daily Goal</p>
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
                  <circle cx="96" cy="96" r="88" fill="none" stroke="#222a3d" strokeWidth="12" />
                  <circle
                    cx="96" cy="96" r="88" fill="none"
                    stroke="#4ae176" strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-mono font-bold text-white">{user.dailyGoalPct}%</span>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Completed</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-white font-bold text-xl">Current Streak</p>
                <div className="flex items-center justify-center gap-2 text-primary font-bold">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                  <span>{user.streak} days</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stat Cards */}
          {[
            { icon: 'schedule', label: 'Focus Time', value: user.totalFocusTime },
            { icon: 'analytics', label: 'Focus Score', value: `${user.focusScore}%` },
            { icon: 'workspace_premium', label: 'Total XP', value: user.totalXp?.toLocaleString() ?? '0' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="md:col-span-4 bg-surface-container-high rounded-2xl p-6 flex items-center gap-5 hover:bg-surface-variant transition-all duration-300 cursor-default group"
            >
              <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-mono font-bold text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}

          {/* Workspace Banner */}
          <motion.div variants={fadeUp} className="md:col-span-12 h-64 rounded-2xl overflow-hidden relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-surface-container to-surface-container-high" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,#4ae17620 39px,#4ae17620 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#4ae17620 39px,#4ae17620 40px)',
              }}
            />
            <div className="absolute bottom-0 left-0 p-8">
              <h3 className="text-2xl font-headline font-bold text-white mb-2">Workspace Optimization</h3>
              <p className="text-on-surface-variant max-w-md">
                Your focus environment is set up. Start a session to build your streak and earn XP.
              </p>
            </div>
            <div className="absolute top-8 right-8">
              <div className="bg-primary/20 backdrop-blur-md px-4 py-2 rounded-full border border-primary/30 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-primary text-xs font-bold uppercase tracking-widest">Ready to Focus</span>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </PageWrapper>
  )
}
