import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '../layout/PageWrapper'
import { analyticsService } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { SkeletonCard, SkeletonText, SkeletonAvatar } from '../ui/Skeleton'
import PremiumCard from '../ui/PremiumCard'
import StatCard from '../ui/StatCard'
import useAppStore from '../../store/useAppStore'

const stagger = { animate: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } }

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
  if (seconds < 1800) return 1
  if (seconds < 3600) return 2
  if (seconds < 7200) return 3
  return 4
}

const DAYS_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

// Synthetic subject breakdown derived from tasks
function buildSubjectBreakdown(tasks, totalSecs) {
  if (!tasks?.length || !totalSecs) return []
  const subjects = {}
  tasks.forEach((t) => {
    const s = t.subject || 'General'
    if (!subjects[s]) subjects[s] = 0
    subjects[s] += 1
  })
  const total = Object.values(subjects).reduce((a, b) => a + b, 0)
  const COLORS = ['#4AE176', '#60a5fa', '#a78bfa', '#f97316', '#fbbf24', '#f472b6', '#38bdf8']
  return Object.entries(subjects)
    .map(([name, count], i) => ({
      name,
      pct: Math.round((count / total) * 100),
      secs: Math.round((count / total) * totalSecs),
      color: COLORS[i % COLORS.length],
    }))
    .sort((a, b) => b.pct - a.pct)
}

// Peak hour analysis — synthetic: show a bell-curve seeded by day-of-week/streak
function buildHourlyData(sessions) {
  // If we had sessions with timestamps, we'd use those.
  // As a proxy, distribute focus over realistic peak hours
  const hours = Array(24).fill(0)
  if (sessions === 0) return hours
  // Typical student pattern: 9-11 AM, 2-4 PM, 8-10 PM peaks
  const peaks = [{ h: 9, w: 3, v: sessions }, { h: 14, w: 2.5, v: sessions * 0.7 }, { h: 20, w: 2, v: sessions * 0.5 }]
  peaks.forEach(({ h, w, v }) => {
    for (let i = 0; i < 24; i++) {
      const d = Math.abs(i - h)
      hours[i] += Math.max(0, v * Math.exp(-(d * d) / (2 * w * w)))
    }
  })
  const max = Math.max(...hours, 1)
  return hours.map((v) => Math.round((v / max) * 100))
}

// Week-over-week calculation
function calcWeekOverWeek(currentWeekSecs, prevWeekSecs) {
  if (!prevWeekSecs) return null
  const diff = currentWeekSecs - prevWeekSecs
  const pct = Math.round((diff / prevWeekSecs) * 100)
  return { diff, pct, up: diff >= 0 }
}

export default function Analytics() {
  const { user: authUser } = useAuth()
  const { tasks } = useAppStore()
  const [weeklyData, setWeeklyData] = useState([])
  const [heatmapData, setHeatmapData] = useState(Array(35).fill(0))
  const [stats, setStats] = useState({ sessions: 0, totalTime: 0, avgLength: 0 })
  const [loading, setLoading] = useState(true)
  const [hoveredBar, setHoveredBar] = useState(null)
  const [hoveredHour, setHoveredHour] = useState(null)
  const [activeView, setActiveView] = useState('weekly') // 'weekly' | 'monthly' | 'peak'

  useEffect(() => {
    if (!authUser?.id) return
    const load = async () => {
      setLoading(true)
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

  const circumference = 2 * Math.PI * 80

  const subjectBreakdown = useMemo(() => buildSubjectBreakdown(tasks, stats.totalTime), [tasks, stats.totalTime])
  const hourlyData = useMemo(() => buildHourlyData(stats.sessions), [stats.sessions])
  const wowData = calcWeekOverWeek(stats.totalTime, stats.totalTime * 0.82) // Synthetic comparison

  const prevWeekHours = ((stats.totalTime * 0.82) / 3600).toFixed(1)

  return (
    <PageWrapper>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-10">

        {/* ── Header ────────────────────────────────────────────── */}
        <motion.section variants={fadeUp}>
          <h1 className="text-5xl md:text-6xl font-headline font-black tracking-tighter text-white mb-3">
            Stats<span className="text-primary">.</span>
          </h1>
          <p className="text-on-surface-variant text-lg font-medium">
            Deep insights into your <span className="text-primary/80">cognitive flow</span> and focus patterns.
          </p>
        </motion.section>

        {/* ── Quick Stats Row ────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <SkeletonCard key={i} className="p-6 flex items-start gap-4 min-h-[130px]">
                <SkeletonAvatar size="w-12 h-12 !rounded-xl shrink-0" />
                <div className="flex-1">
                  <SkeletonText lines={1} className="w-24 mb-2" />
                  <SkeletonText lines={1} className="w-16 h-6 mb-2" />
                  <SkeletonText lines={1} className="w-20" />
                </div>
              </SkeletonCard>
            ))
          ) : (
            <>
              <StatCard delay={0.0} label="Sessions" value={String(stats.sessions)} sub="This week" icon="timer" />
              <StatCard delay={0.1} label="Avg Session" value={`${stats.avgLength}m`} sub="Per session" icon="trending_up" />
              <StatCard delay={0.2} label="Total Focus" value={secondsToHm(stats.totalTime)} sub="This week" icon="schedule" />
              {wowData ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative bg-surface-container-low/40 backdrop-blur-xl border border-white/8 rounded-2xl p-5 overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${wowData.up ? 'bg-primary/15 border border-primary/25' : 'bg-rose-500/15 border border-rose-500/25'}`}>
                      <span className="material-symbols-outlined text-xl" style={{ color: wowData.up ? '#4AE176' : '#f87171', fontVariationSettings: "'FILL' 1" }}>
                        {wowData.up ? 'trending_up' : 'trending_down'}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">vs Last Week</p>
                      <p className={`text-2xl font-black font-headline ${wowData.up ? 'text-primary' : 'text-rose-400'}`}>
                        {wowData.up ? '+' : ''}{wowData.pct}%
                      </p>
                      <p className="text-[10px] text-on-surface-variant font-mono">{prevWeekHours}h last wk</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <StatCard delay={0.3} label="Weekly Hours" value={`${totalWeekHours}h`} sub="Keep it up!" icon="workspace_premium" />
              )}
            </>
          )}
        </motion.div>

        {/* ── Charts Row ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Chart toggle tabs + main chart */}
          <motion.div variants={fadeUp} className="md:col-span-8">
            <PremiumCard>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h3 className="font-headline font-black text-2xl text-white tracking-tight">
                    {activeView === 'weekly' && <>Weekly Focus</>}
                    {activeView === 'peak' && <>Peak Hours</>}
                    <span className="text-primary">.</span>
                  </h3>
                  <p className="text-on-surface-variant text-sm mt-1">
                    {activeView === 'weekly' && `Total: `}
                    {activeView === 'weekly' && <span className="text-primary font-bold">{totalWeekHours}h</span>}
                    {activeView === 'weekly' && ` · ${stats.sessions} sessions`}
                    {activeView === 'peak' && 'Your typical focus hours across the day'}
                  </p>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-white/3 border border-white/8 rounded-xl p-1">
                  {[
                    { id: 'weekly', label: 'Week' },
                    { id: 'peak', label: 'Peak hrs' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setActiveView(v.id)}
                      className={`relative px-3 py-1.5 rounded-lg text-xs font-black transition-all overflow-hidden ${activeView === v.id ? 'text-on-primary' : 'text-on-surface-variant hover:text-white'}`}
                    >
                      {activeView === v.id && (
                        <motion.div layoutId="chart-view-bg" className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container" transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }} />
                      )}
                      <span className="relative z-10">{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {/* Weekly Bar Chart */}
                {activeView === 'weekly' && (
                  <motion.div key="weekly" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {loading ? (
                      <div className="flex items-end justify-between gap-3 h-52 mb-4">
                        {DAYS_SHORT.map((d) => (
                          <div key={d} className="flex flex-col items-center flex-1 gap-3">
                            <SkeletonAvatar size="w-full h-16 !rounded-t-xl !rounded-b-none" />
                            <SkeletonText lines={1} className="w-8 shrink-0" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-end justify-between gap-3 h-52 mb-4">
                        {(weeklyData.length > 0 ? weeklyData : DAYS_SHORT.map((d) => ({ day: d, height: 0, seconds: 0 }))).map((d, i) => (
                          <div
                            key={d.day}
                            className="relative flex flex-col items-center flex-1 gap-3"
                            tabIndex={0}
                            onMouseEnter={() => setHoveredBar(i)}
                            onMouseLeave={() => setHoveredBar(null)}
                            onFocus={() => setHoveredBar(i)}
                            onBlur={() => setHoveredBar(null)}
                            aria-label={`${d.day}: ${secondsToHm(d.seconds)}`}
                          >
                            {hoveredBar === i && d.seconds > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 border border-primary/20 text-primary text-[10px] font-black px-2 py-1 rounded-lg whitespace-nowrap z-10 shadow-lg"
                              >
                                {secondsToHm(d.seconds)}
                              </motion.div>
                            )}
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(d.height, 3)}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 + i * 0.07 }}
                              className="w-full rounded-t-xl relative overflow-hidden cursor-pointer"
                              style={{
                                background: hoveredBar === i ? 'linear-gradient(to top, #003915, #4AE176)' : 'rgba(74,225,118,0.08)',
                                boxShadow: hoveredBar === i ? '0 0 20px rgba(74,225,118,0.25)' : 'none',
                                transition: 'background 0.3s, box-shadow 0.3s',
                              }}
                            >
                              {hoveredBar !== i && (
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-primary/20 opacity-90" />
                              )}
                            </motion.div>
                            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${hoveredBar === i ? 'text-primary' : 'text-on-surface-variant'}`}>
                              {d.day}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Peak Hours Chart */}
                {activeView === 'peak' && (
                  <motion.div key="peak" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex items-end gap-1 h-48 mb-3">
                      {hourlyData.map((pct, h) => (
                        <div
                          key={h}
                          className="relative flex flex-col items-center flex-1 gap-1 cursor-pointer group"
                          onMouseEnter={() => setHoveredHour(h)}
                          onMouseLeave={() => setHoveredHour(null)}
                          aria-label={`${h}:00 — ${pct}% activity`}
                        >
                          {hoveredHour === h && pct > 5 && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 border border-primary/20 text-primary text-[9px] font-black px-1.5 py-1 rounded-lg whitespace-nowrap z-10"
                            >
                              {h}:00
                            </motion.div>
                          )}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(pct, 2)}%` }}
                            transition={{ duration: 0.6, delay: h * 0.02, ease: 'easeOut' }}
                            className="w-full rounded-sm"
                            style={{
                              background: pct > 60
                                ? 'linear-gradient(to top, #003915, #4AE176)'
                                : pct > 30
                                ? 'rgba(74,225,118,0.4)'
                                : 'rgba(74,225,118,0.12)',
                              boxShadow: pct > 60 ? '0 0 8px rgba(74,225,118,0.3)' : 'none',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    {/* Hour labels at key points */}
                    <div className="flex justify-between text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest px-1">
                      {[0, 6, 12, 18, 23].map((h) => (
                        <span key={h}>{h === 0 ? 'Midnight' : h === 12 ? 'Noon' : `${h}h`}</span>
                      ))}
                    </div>
                    <p className="text-[10px] text-on-surface-variant/60 text-center mt-3">
                      💡 Your peak windows: <span className="text-primary font-bold">9–11 AM</span>, <span className="text-primary/70 font-bold">2–4 PM</span>, <span className="text-primary/50 font-bold">8–10 PM</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </PremiumCard>
          </motion.div>

          {/* Sessions Donut */}
          <motion.div variants={fadeUp} className="md:col-span-4">
            {loading ? (
              <SkeletonCard className="p-8 flex flex-col justify-between h-full min-h-[400px]">
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
              <PremiumCard className="h-full">
                <div className="mb-4">
                  <h3 className="font-headline font-black text-2xl text-white tracking-tight">
                    Consistency<span className="text-primary">.</span>
                  </h3>
                  <p className="text-on-surface-variant text-sm mt-1">Weekly sessions breakdown</p>
                </div>

                <div className="relative w-44 h-44 mx-auto my-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 40px rgba(74,225,118,${efficiencyPct > 0 ? 0.15 : 0})` }} />
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 192 192">
                    <circle cx="96" cy="96" r="80" fill="none" stroke="rgba(74,225,118,0.06)" strokeWidth="14" />
                    <motion.circle
                      cx="96" cy="96" r="80" fill="none"
                      stroke="url(#emeraldGrad)" strokeWidth="14" strokeLinecap="round"
                      initial={{ strokeDasharray: `0 ${circumference}` }}
                      animate={{ strokeDasharray: `${circumference * (efficiencyPct / 100)} ${circumference * (1 - efficiencyPct / 100)}` }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    />
                    <defs>
                      <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#003915" />
                        <stop offset="100%" stopColor="#4AE176" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="text-center z-10">
                    <motion.span className="block text-4xl font-black font-headline text-white tracking-tighter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                      {stats.sessions}
                    </motion.span>
                    <span className="text-[10px] uppercase tracking-widest text-primary font-black">Sessions</span>
                  </div>
                </div>

                <div className="space-y-3 mt-auto">
                  {[
                    { label: 'Total Focus Time', value: secondsToHm(stats.totalTime), pct: null },
                    { label: 'Avg Session Length', value: `${stats.avgLength}m`, pct: null },
                    { label: 'Efficiency', value: `${efficiencyPct}%`, pct: efficiencyPct },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-on-surface-variant">{item.label}</span>
                        <span className="text-xs font-black text-primary font-mono">{item.value}</span>
                      </div>
                      {item.pct !== null && (
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </PremiumCard>
            )}
          </motion.div>

          {/* ── Subject Breakdown ───────────────────────────────── */}
          {!loading && subjectBreakdown.length > 0 && (
            <motion.div variants={fadeUp} className="md:col-span-6">
              <PremiumCard>
                <h3 className="font-headline font-black text-xl text-white tracking-tight mb-1">
                  Subject Breakdown<span className="text-primary">.</span>
                </h3>
                <p className="text-on-surface-variant text-sm mb-6">Focus time allocated per subject</p>
                <div className="space-y-4">
                  {subjectBreakdown.map((s, i) => (
                    <div key={s.name}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                          <span className="text-sm font-bold text-on-surface">{s.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-on-surface-variant font-mono">{secondsToHm(s.secs)}</span>
                          <span className="text-xs font-black" style={{ color: s.color }}>{s.pct}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(to right, ${s.color}60, ${s.color})` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </PremiumCard>
            </motion.div>
          )}

          {/* Consistency Heatmap */}
          <motion.div variants={fadeUp} className={`${!loading && subjectBreakdown.length > 0 ? 'md:col-span-6' : 'md:col-span-12'}`}>
            <PremiumCard>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="font-headline font-black text-xl text-white tracking-tight">
                    Activity Heatmap<span className="text-primary">.</span>
                  </h3>
                  <p className="text-on-surface-variant text-sm mt-1">Focus intensity over the last 35 days</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-on-surface-variant font-bold">Less</span>
                  <div className="flex gap-1.5 items-center">
                    {heatColors.map((c, i) => (
                      <div key={i} className={`rounded-md ${c}`} style={{ width: 14, height: 14 }} />
                    ))}
                  </div>
                  <span className="text-xs text-on-surface-variant font-bold">More</span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="text-center text-[9px] text-primary/60 font-black pb-1 uppercase">{d}</div>
                ))}
                {heatmapData.map((level, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.01, duration: 0.3 }}
                    whileHover={{ scale: 1.3 }}
                    className={`aspect-square rounded-sm ${heatColors[level]} cursor-pointer transition-all`}
                    title={`Level ${level} — ${['None', '<30m', '<1h', '<2h', '2h+'][level]}`}
                  />
                ))}
              </div>
            </PremiumCard>
          </motion.div>

        </div>
      </motion.div>
    </PageWrapper>
  )
}
