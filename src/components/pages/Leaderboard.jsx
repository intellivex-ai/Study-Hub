import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PageWrapper from '../layout/PageWrapper'
import { leaderboardService } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import Avatar from '../ui/Avatar'

const stagger = { animate: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const REACTIONS = [
  { icon: 'auto_awesome', sent: 'sent you a spark', name: 'Sarah J.', bg: 'bg-secondary-container/20' },
  { icon: 'front_hand', sent: 'clapped for your streak', name: 'Alex M.', bg: 'bg-tertiary-container/20' },
  { icon: 'schedule', sent: 'You completed 3 focus rounds', name: null, bg: 'bg-surface-container-highest' },
]

function PodiumCard({ entry, scale = false }) {
  const isFirst = entry.rank === 1
  return (
    <motion.div variants={fadeUp} className={`flex flex-col items-center ${scale ? 'scale-110 -translate-y-4' : ''}`}>
      <div className="relative mb-4 group">
        {isFirst && (
          <div className="absolute -inset-2 bg-gradient-to-tr from-primary to-secondary rounded-full blur-md opacity-40 group-hover:opacity-70 transition duration-700" />
        )}
        {!isFirst && (
          <div className="absolute -inset-1 bg-gradient-to-tr from-slate-400 to-slate-200 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500" />
        )}
        <div className={`relative ${isFirst ? 'w-32 h-32 border-4 border-primary' : 'w-20 h-20 border-4 border-slate-400/30'} rounded-full overflow-hidden bg-surface-container-high`}>
          <Avatar name={entry.name} size={isFirst ? 'xl' : 'lg'} />
        </div>
        <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 ${
          isFirst
            ? 'bg-gradient-to-br from-primary to-primary-container text-on-primary px-5 py-1.5 text-base'
            : 'bg-slate-400 text-surface px-3 py-1 text-sm'
        } font-black rounded-full shadow-lg`}>
          {entry.rank}
        </div>
        {isFirst && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              workspace_premium
            </span>
          </div>
        )}
      </div>
      <span className="font-headline font-bold text-on-surface text-center mt-2">{entry.name}</span>
      <span className="font-mono text-xs text-on-surface-variant">{(entry.total_xp ?? 0).toLocaleString()} XP</span>
      <div className="flex items-center gap-1 mt-1 text-primary">
        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
        <span className="text-xs font-bold">{entry.streak ?? 0}d</span>
      </div>
    </motion.div>
  )
}

export default function Leaderboard() {
  const { user: authUser } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await leaderboardService.getTopUsers(10)
      if (data) setEntries(data)
      setLoading(false)
    }
    load()
  }, [])

  const top3Display = entries.length >= 3
    ? [entries[1], entries[0], entries[2]]   // 2nd, 1st, 3rd for podium
    : entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <PageWrapper>
      <motion.div variants={stagger} initial="initial" animate="animate" className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <motion.div variants={fadeUp} className="text-center">
          <h1 className="font-headline font-extrabold text-4xl mb-2 tracking-tight text-on-surface">
            Season 4 Leaderboard
          </h1>
          <p className="text-on-surface-variant font-medium">Top contributors in the Deep Work Sanctuary</p>
        </motion.div>

        {/* Podium */}
        {!loading && top3Display.length >= 3 && (
          <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 items-end mb-4 px-2">
            {top3Display.map((entry) => (
              <PodiumCard key={entry.id} entry={entry} scale={entry.rank === 1} />
            ))}
          </motion.div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Tabs (cosmetic — all from same leaderboard view) */}
        <motion.div variants={fadeUp} className="flex gap-2 bg-surface-container-low p-1.5 rounded-2xl w-fit mx-auto">
          {['All Time', 'This Week', 'Today'].map((tab, i) => (
            <button
              key={tab}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                i === 0
                  ? 'bg-primary-container text-on-primary-container shadow-lg'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Rest of Leaderboard */}
        {!loading && rest.length > 0 && (
          <div className="space-y-3">
            {rest.map((entry) => (
              <motion.div
                key={entry.id}
                variants={fadeUp}
                className={`bg-surface-container-low rounded-2xl p-4 flex items-center gap-4 hover:bg-surface-container-high transition-all duration-300 border ${
                  entry.id === authUser?.id ? 'border-primary/30 bg-primary/5' : 'border-outline-variant/10'
                }`}
              >
                <span className="font-mono font-bold text-on-surface-variant w-8 text-center">#{entry.rank}</span>
                <Avatar name={entry.name} size="md" border />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-on-surface">
                    {entry.name}
                    {entry.id === authUser?.id && <span className="ml-2 text-xs text-primary font-semibold">(You)</span>}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                    <span>{entry.streak ?? 0} day streak</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-on-surface">{(entry.total_xp ?? 0).toLocaleString()}</div>
                  <div className="text-xs text-on-surface-variant">XP</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3 block opacity-40">leaderboard</span>
            <p className="font-medium">No rankings yet.</p>
            <p className="text-sm mt-1">Complete focus sessions to appear on the leaderboard!</p>
          </div>
        )}

        {/* Activity Feed */}
        <motion.div variants={fadeUp} className="mt-6 bg-surface-container-low p-6 rounded-2xl">
          <h3 className="font-bold text-on-surface mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {REACTIONS.map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${r.bg} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{r.icon}</span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  {r.name && <span className="text-on-surface font-semibold">{r.name} </span>}
                  {r.sent}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </PageWrapper>
  )
}
