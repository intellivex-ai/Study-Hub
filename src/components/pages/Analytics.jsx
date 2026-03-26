import { useEffect, useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import PageWrapper from '../layout/PageWrapper'
import { analyticsService } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { SkeletonCard, SkeletonText, SkeletonAvatar } from '../ui/Skeleton'

const stagger = { animate: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const heatColors = [
  'bg-surface-container-high',
  'bg-primary/20',
  'bg-primary/40',
  'bg-primary/60',
  'bg-primary',
]

function secondsToHm(s) {
  if (!s) return '0m'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

function getHeatLevel(seconds) {
  if (!seconds || seconds === 0) return 0
  if (seconds < 1800) return 1   // < 30m
  if (seconds < 3600) return 2   // < 1h
  if (seconds < 7200) return 3   // < 2h
  return 4                        // 2h+
}

const DAYS_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default function Analytics() {
  const { user: authUser } = useAuth()
  const [weeklyData, setWeeklyData] = useState([])
  const [heatmapData, setHeatmapData] = useState(Array(35).fill(0))
  const [stats, setStats] = useState({ sessions: 0, totalTime: 0, avgLength: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authUser?.id) return
    const load = async () => {
      setLoading(true)

      // Weekly bar chart
      const { data: weekly } = await analyticsService.getWeeklyStats(authUser.id)
      if (weekly) {
        const maxTime = Math.max(...weekly.map((d) => d.total_focus_time), 1)
        const enriched = weekly.map((d) => ({
          day: d.day,
          height: Math.round((d.total_focus_time / maxTime) * 100),
          seconds: d.total_focus_time,
          sessions: d.total_sessions,
        }))
        setWeeklyData(enriched)

        const totalSecs = weekly.reduce((s, d) => s + d.total_focus_time, 0)
        const totalSessions = weekly.reduce((s, d) => s + d.total_sessions, 0)
        setStats({
          sessions: totalSessions,
          totalTime: totalSecs,
          avgLength: totalSessions > 0 ? Math.round(totalSecs / totalSessions / 60) : 0,
        })
      }

      // 35-day heatmap
      const { data: heat } = await analyticsService.getHeatmapData(authUser.id, 35)
      if (heat) {
        const heatMap = {}
        heat.forEach((row) => { heatMap[row.date] = row.total_focus_time })
        const levels = Array.from({ length: 35 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (34 - i))
          const key = d.toISOString().split('T')[0]
          return getHeatLevel(heatMap[key] ?? 0)
        })
        setHeatmapData(levels)
      }

      setLoading(false)
    }
    load()
  }, [authUser?.id])

  const totalWeekHours = (stats.totalTime / 3600).toFixed(1)
  const efficiencyPct = weeklyData.length > 0
    ? Math.min(100, Math.round((stats.sessions / (weeklyData.length * 3)) * 100))
    : 0

  return (
    <PageWrapper>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-8">

        {/* Header */}
        <motion.section variants={fadeUp} className="space-y-2">
          <h1 className="text-primary font-headline font-extrabold text-4xl tracking-tight">
            Performance Analytics
          </h1>
          <p className="text-on-surface-variant font-medium">
            Deep insights into your cognitive flow and focus patterns.
          </p>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Weekly Bar Chart */}
          <motion.div variants={fadeUp} className="md:col-span-8 glass-card rounded-2xl p-8 flex flex-col justify-between min-h-[400px]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">Weekly Focus Hours</h3>
                <p className="text-on-surface-variant text-sm mt-1">
                  Total: {totalWeekHours}h • {stats.sessions} sessions
                </p>
              </div>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">CURRENT WEEK</span>
            </div>

            {loading ? (
              <div className="flex items-end justify-between gap-3 h-48 mb-4">
                {DAYS_SHORT.map((d) => (
                  <div key={d} className="flex flex-col items-center flex-1 gap-3">
                    <SkeletonAvatar size="w-full h-12 !rounded-t-xl !rounded-b-none" className="shrink-0" />
                    <SkeletonText lines={1} className="w-8 shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-end justify-between gap-3 h-48 mb-4">
                {(weeklyData.length > 0 ? weeklyData : DAYS_SHORT.map((d) => ({ day: d, height: 0, seconds: 0 }))).map((d) => (
                  <div key={d.day} className="flex flex-col items-center flex-1 gap-3" title={secondsToHm(d.seconds)}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(d.height, 2)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                      className="w-full bg-primary-container/20 rounded-t-xl relative group overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-container to-primary opacity-80 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                    <span className="text-xs font-mono text-on-surface-variant">{d.day}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Efficiency Donut */}
          {loading ? (
            <SkeletonCard className="md:col-span-4 p-8 flex flex-col justify-between h-full min-h-[400px]">
              <div>
                <SkeletonText lines={1} className="w-32 mb-2" />
                <SkeletonText lines={1} className="w-40" />
              </div>
              <div className="relative w-48 h-48 mx-auto my-6 flex items-center justify-center">
                <SkeletonAvatar size="w-48 h-48" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center"><SkeletonText lines={1} className="w-24" /><SkeletonText lines={1} className="w-12" /></div>
                <div className="flex justify-between items-center"><SkeletonText lines={1} className="w-32" /><SkeletonText lines={1} className="w-12" /></div>
              </div>
            </SkeletonCard>
          ) : (
            <motion.div variants={fadeUp} className="md:col-span-4 bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10 flex flex-col justify-between">
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">Weekly Sessions</h3>
                <p className="text-on-surface-variant text-sm mt-1">Consistency this week</p>
              </div>

              <div className="relative w-48 h-48 mx-auto my-6 flex items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 192 192">
                  <circle cx="96" cy="96" r="80" fill="none" stroke="#222a3d" strokeWidth="16" />
                  <circle
                    cx="96" cy="96" r="80"
                    fill="none" stroke="#4ae176" strokeWidth="16"
                    strokeDasharray={`${2 * Math.PI * 80 * (efficiencyPct / 100)} ${2 * Math.PI * 80 * (1 - efficiencyPct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                  />
                </svg>
                <div className="text-center z-10">
                  <span className="block text-4xl font-black font-headline text-primary">{stats.sessions}</span>
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Sessions</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Total Focus Time', value: secondsToHm(stats.totalTime), color: 'bg-primary' },
                  { label: 'Avg Session Length', value: `${stats.avgLength}m`, color: 'bg-surface-container-high' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-xs font-medium text-on-surface">{item.label}</span>
                    </div>
                    <span className="text-xs font-mono text-on-surface-variant">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Consistency Heatmap */}
          <motion.div variants={fadeUp} className="md:col-span-12 glass-card rounded-2xl p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">Consistency Heatmap</h3>
                <p className="text-on-surface-variant text-sm mt-1">Activity levels over the last 35 days</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-on-surface-variant font-medium">Less</span>
                <div className="flex gap-1.5">
                  {heatColors.map((c, i) => (
                    <div key={i} className={`w-4 h-4 rounded-sm ${c}`} />
                  ))}
                </div>
                <span className="text-xs text-on-surface-variant font-medium">More</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-on-surface-variant font-bold pb-1">{d}</div>
              ))}
              {heatmapData.map((level, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.01 }}
                  className={`aspect-square rounded-sm ${heatColors[level]} hover:scale-110 transition-transform cursor-pointer`}
                  title={`Level ${level}`}
                />
              ))}
            </div>
          </motion.div>

          {/* Quick Stats Row */}
          {[
            { label: 'Sessions This Week', value: String(stats.sessions), sub: 'Completed sessions', icon: 'timer' },
            { label: 'Avg Session Length', value: `${stats.avgLength}m`, sub: 'Per session average', icon: 'trending_up' },
            { label: 'Total Focus Time', value: secondsToHm(stats.totalTime), sub: 'This week', icon: 'schedule' },
            { label: 'Weekly Hours', value: `${totalWeekHours}h`, sub: 'Keep it up!', icon: 'workspace_premium' },
          ].map((stat, i) => (
            loading ? (
              <SkeletonCard key={i} className="md:col-span-3 p-6 flex items-start gap-4">
                <SkeletonAvatar size="w-12 h-12 !rounded-xl shrink-0" />
                <div className="flex-1">
                  <SkeletonText lines={1} className="w-24 mb-2" />
                  <SkeletonText lines={1} className="w-16 h-6 mb-2" />
                  <SkeletonText lines={1} className="w-20" />
                </div>
              </SkeletonCard>
            ) : (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="md:col-span-3 bg-surface-container-high rounded-2xl p-6 flex items-start gap-4 hover:bg-surface-variant transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-mono font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-primary/80 mt-1">{stat.sub}</p>
                </div>
              </motion.div>
            )
          ))}

        </div>
      </motion.div>
    </PageWrapper>
  )
}
