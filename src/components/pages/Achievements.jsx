import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '../layout/PageWrapper'
import useAppStore from '../../store/useAppStore'
import { useAuth } from '../../lib/auth'
import { achievementsService } from '../../lib/api'
import { ACHIEVEMENTS_DEFS, XP_LEVELS, getXpLevel } from '../../lib/constants'

const RARITY_CONFIG = {
  bronze: {
    label: 'Bronze',
    color: '#cd7f32',
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/30',
    glow: 'rarity-bronze',
    badge: 'bg-amber-900/30 text-amber-600 border-amber-700/30',
  },
  silver: {
    label: 'Silver',
    color: '#c0c0c0',
    bg: 'bg-slate-500/10',
    border: 'border-slate-400/20',
    glow: 'rarity-silver',
    badge: 'bg-slate-500/20 text-slate-300 border-slate-400/25',
  },
  gold: {
    label: 'Gold',
    color: '#ffd700',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-400/25',
    glow: 'rarity-gold',
    badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
  },
  platinum: {
    label: 'Platinum',
    color: '#4AE176',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    glow: 'rarity-platinum',
    badge: 'bg-primary/20 text-primary border-primary/30',
  },
}

function AchievementBadge({ def, earned, delay = 0 }) {
  const rc = RARITY_CONFIG[def.rarity]
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', bounce: 0.3 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative"
    >
      <div className={`relative rounded-2xl border p-4 flex flex-col items-center gap-3 text-center transition-all duration-300 ${
        earned ? `${rc.bg} ${rc.border} ${rc.glow}` : 'bg-white/2 border-white/5 opacity-40'
      } ${hovered && earned ? 'scale-105' : ''}`}>
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
          style={{
            background: earned ? `${rc.color}18` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${earned ? rc.color + '30' : 'rgba(255,255,255,0.05)'}`,
          }}
        >
          {earned && (
            <div
              className="absolute inset-0 rounded-2xl opacity-30"
              style={{ background: `radial-gradient(circle, ${rc.color}40, transparent 70%)` }}
            />
          )}
          <span
            className="material-symbols-outlined text-3xl relative z-10"
            style={{
              color: earned ? rc.color : 'rgba(255,255,255,0.2)',
              fontVariationSettings: `'FILL' ${earned ? 1 : 0}`,
            }}
          >
            {def.icon}
          </span>
        </div>

        {/* Info */}
        <div>
          <p className={`font-black text-sm ${earned ? 'text-white' : 'text-on-surface-variant'}`}>{def.label}</p>
          <p className="text-[10px] text-on-surface-variant/70 mt-0.5 leading-relaxed">{def.desc}</p>
        </div>

        {/* Rarity badge */}
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${rc.badge}`}>
          {rc.label}
        </span>

        {/* XP */}
        {earned && (
          <div className="flex items-center gap-1 text-[10px] font-black text-primary/80">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            +{def.xp} XP
          </div>
        )}

        {/* Lock overlay */}
        {!earned && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
            <span className="material-symbols-outlined text-white/10 text-2xl">lock</span>
          </div>
        )}
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hovered && !earned && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 border border-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap z-20 shadow-xl"
          >
            Keep studying to unlock!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function XPLevelCard({ totalXp }) {
  const { current, next, progress } = getXpLevel(totalXp)
  const circumference = 2 * Math.PI * 52

  return (
    <div className="relative bg-surface-container-low/40 backdrop-blur-xl border border-outline-variant/10 rounded-2xl p-6 flex flex-col items-center text-center gap-4 overflow-hidden">
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

      <p className="text-[10px] font-black tracking-widest text-on-surface-variant uppercase">Your Level</p>

      {/* Level ring */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(74,225,118,0.06)" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r="52" fill="none"
            stroke="url(#levelGrad)" strokeWidth="8" strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
            style={{ strokeDasharray: circumference }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
          <defs>
            <linearGradient id="levelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#003915" />
              <stop offset="100%" stopColor="#4AE176" />
            </linearGradient>
          </defs>
        </svg>
        <div className="flex flex-col items-center z-10">
          <motion.span className="text-4xl font-black text-white font-headline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            {current.level}
          </motion.span>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">{current.label}</span>
        </div>
      </div>

      {/* XP bar */}
      {next && (
        <div className="w-full space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
            <span>{totalXp.toLocaleString()} XP</span>
            <span>→ {next.minXp.toLocaleString()} XP</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
            />
          </div>
          <p className="text-[10px] text-on-surface-variant">Next: <span className="text-primary font-bold">{next.label}</span></p>
        </div>
      )}
    </div>
  )
}

export default function Achievements() {
  const { user: authUser } = useAuth()
  const { earnedAchievements, setEarnedAchievements, user } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    if (!authUser?.id) return
    const load = async () => {
      setLoading(true)
      const { data } = await achievementsService.getAchievements(authUser.id)
      if (data) setEarnedAchievements(data.map((a) => a.achievement_key))
      setLoading(false)
    }
    load()
  }, [authUser?.id])

  const totalXp = user.totalXp || 0
  const earnedCount = earnedAchievements.length
  const totalCount = ACHIEVEMENTS_DEFS.length

  const FILTERS = ['All', 'Earned', 'Locked', 'Bronze', 'Silver', 'Gold']

  const filteredDefs = ACHIEVEMENTS_DEFS.filter((def) => {
    if (filter === 'All') return true
    if (filter === 'Earned') return earnedAchievements.includes(def.key)
    if (filter === 'Locked') return !earnedAchievements.includes(def.key)
    return def.rarity.toLowerCase() === filter.toLowerCase()
  })

  return (
    <PageWrapper>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end gap-6 justify-between">
          <div>
            <h1 className="text-5xl md:text-6xl font-headline font-black tracking-tighter text-white mb-2">
              Achievements<span className="text-primary">.</span>
            </h1>
            <p className="text-on-surface-variant font-medium">
              <span className="text-primary/80">{earnedCount}</span> of {totalCount} unlocked
            </p>
          </div>
        </motion.div>

        {/* Level + Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <XPLevelCard totalXp={totalXp} />

          {/* Stats */}
          {[
            { label: 'Earned', value: earnedCount, icon: 'emoji_events', color: '#fbbf24' },
            { label: 'Total XP', value: totalXp.toLocaleString(), icon: 'workspace_premium', color: '#4AE176' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-surface-container-low/40 backdrop-blur-xl border border-white/8 rounded-2xl p-6 flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}25` }}>
                <span className="material-symbols-outlined text-xl" style={{ color: stat.color, fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
              </div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{stat.label}</p>
              <motion.p className="text-4xl font-headline font-black text-white tracking-tighter mt-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                {stat.value}
              </motion.p>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`relative px-4 py-2 rounded-xl text-xs font-black tracking-wide transition-all duration-200 overflow-hidden ${
                filter === f ? 'text-on-primary' : 'text-on-surface-variant hover:text-white border border-white/8 hover:border-white/20'
              }`}
            >
              {filter === f && (
                <motion.div layoutId="achievement-filter-bg" className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />
              )}
              <span className="relative z-10">{f}</span>
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-white/3 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {filteredDefs.map((def, i) => (
                <AchievementBadge key={def.key} def={def} earned={earnedAchievements.includes(def.key)} delay={i * 0.03} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredDefs.length === 0 && !loading && (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">emoji_events</span>
            <p>No achievements match this filter.</p>
          </div>
        )}
      </motion.div>
    </PageWrapper>
  )
}
