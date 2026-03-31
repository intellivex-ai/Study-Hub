import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PageWrapper from '../layout/PageWrapper'
import { leaderboardService } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import Avatar from '../ui/Avatar'
import PremiumCard from '../ui/PremiumCard'

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
    <motion.div variants={fadeUp} className={`flex flex-col items-center ${scale ? 'scale-110 -translate-y-6' : ''}`}>
      <div className="relative mb-6 group">
        {isFirst && (
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-primary-container/10 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition duration-1000" />
        )}
        <div className={`relative ${isFirst ? 'w-36 h-36 border-4 border-primary shadow-[0_0_30px_rgba(74,225,118,0.2)]' : 'w-24 h-24 border-2 border-outline-variant/30'} rounded-full overflow-hidden bg-surface-container-high ring-4 ring-black/50 transition-all duration-500 group-hover:border-primary/60`}>
          <Avatar name={entry.name} size="full" />
        </div>
        <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 ${
          isFirst
            ? 'bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2 text-lg shadow-[0_4px_15px_rgba(74,225,118,0.4)]'
            : 'bg-surface-container-highest text-on-surface-variant px-4 py-1 text-sm border border-outline-variant/20 shadow-xl'
        } font-black rounded-full z-10`}>
          {entry.rank}
        </div>
        {isFirst && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
            <span className="material-symbols-outlined text-primary text-5xl drop-shadow-[0_0_10px_rgba(74,225,118,0.5)]" style={{ fontVariationSettings: "'FILL' 1" }}>
              workspace_premium
            </span>
          </div>
        )}
      </div>
      <div className="text-center">
        <span className="block font-headline font-black text-on-surface text-xl tracking-tight">{entry.name}</span>
        <span className="block font-mono text-xs font-bold text-primary/80 uppercase tracking-widest mt-1">{(entry.total_xp ?? 0).toLocaleString()} XP</span>
      </div>
    </motion.div>
  )
}

export default function Leaderboard() {
  const { user: authUser } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('All Time')

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
        <motion.div variants={fadeUp} className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-headline font-black tracking-tighter text-white mb-3">
            Social<span className="text-primary">.</span>
          </h1>
          <p className="text-on-surface-variant text-lg font-medium">Rankings and activity in the <span className="text-primary/80">Deep Work Sanctuary</span>.</p>
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

        {/* Tabs */}
        <motion.div variants={fadeUp} className="flex gap-2 bg-surface-container-low/50 backdrop-blur-md p-1.5 rounded-2xl w-fit mx-auto border border-outline-variant/10 shadow-xl">
          {['All Time', 'This Week', 'Today'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-500 overflow-hidden ${
                tab === selectedTab
                  ? 'text-on-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab === selectedTab && (
                <motion.div
                  layoutId="leaderboard-tab"
                  className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container z-0"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
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
                className={`group relative bg-surface-container-low/40 backdrop-blur-sm rounded-2xl p-5 flex items-center gap-5 transition-all duration-500 border overflow-hidden ${
                  entry.id === authUser?.id 
                    ? 'border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(74,225,118,0.15)] ring-1 ring-primary/20' 
                    : 'border-outline-variant/10 hover:border-primary/30 hover:bg-white/5'
                }`}
              >
                {/* User Hover Effect */}
                {entry.id !== authUser?.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                )}

                <span className="font-mono font-black text-on-surface-variant w-10 text-xl italic opacity-50 group-hover:opacity-100 transition-opacity">
                   {entry.rank.toString().padStart(2, '0')}
                </span>
                <Avatar name={entry.name} size="lg" border />
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-on-surface text-lg tracking-tight flex items-center gap-2">
                    {entry.name}
                    {entry.id === authUser?.id && <span className="bg-primary/20 text-primary text-[10px] uppercase font-black px-2 py-0.5 rounded-full ring-1 ring-primary/50">You</span>}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1 text-xs font-bold text-on-surface-variant">
                       <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                       <span>{entry.streak ?? 0}d Streak</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-headline font-black text-on-surface text-xl tracking-tight italic">{(entry.total_xp ?? 0).toLocaleString()}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary opacity-80">Total XP</div>
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
        <PremiumCard className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">timeline</span>
            <h3 className="font-black text-on-surface text-xl tracking-tight">Recent Activity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REACTIONS.map((r, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group">
                <div className={`w-10 h-10 rounded-full ${r.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{r.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">
                    {r.name && <span className="text-primary">{r.name} </span>}
                    {r.sent}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>

      </motion.div>
    </PageWrapper>
  )
}
