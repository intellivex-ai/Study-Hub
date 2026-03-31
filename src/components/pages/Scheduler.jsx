import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageWrapper from '../layout/PageWrapper'
import PremiumCard from '../ui/PremiumCard'
import useAppStore from '../../store/useAppStore'
import { useAuth } from '../../lib/auth'
import { tasksService } from '../../lib/api'
import { SkeletonCard, SkeletonText, SkeletonAvatar } from '../ui/Skeleton'
import Modal from '../ui/Modal'

const stagger = { animate: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const PRIORITY_CONFIG = {
  high: {
    border: 'border-primary/40',
    bg: 'bg-primary/5',
    badge: 'bg-primary/15 text-primary border border-primary/20',
    dot: 'bg-primary',
    label: 'High',
    icon: 'priority_high',
  },
  medium: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    dot: 'bg-amber-400',
    label: 'Medium',
    icon: 'drag_handle',
  },
  low: {
    border: 'border-white/5',
    bg: 'bg-white/2',
    badge: 'bg-white/5 text-on-surface-variant border border-white/5',
    dot: 'bg-on-surface-variant',
    label: 'Low',
    icon: 'arrow_downward',
  },
}

function AddTaskModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '', subject: '', scheduled_time: '', duration: '60m', priority: 'medium',
  })
  const [loading, setLoading] = useState(false)

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)
    await onCreate(form)
    setLoading(false)
    onClose()
  }

  const inputClass = "w-full bg-white/5 border border-white/8 hover:border-primary/30 focus:border-primary/50 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-all duration-200 text-sm"

  return (
    <Modal open onClose={onClose} title="Add Focus Session">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="task-title" className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Task Title *</label>
          <input id="task-title" value={form.title} onChange={update('title')} placeholder="e.g. Linear Algebra Review"
            className={inputClass} required autoFocus />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-subject" className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Subject</label>
            <input id="task-subject" value={form.subject} onChange={update('subject')} placeholder="Mathematics" className={inputClass} />
          </div>
          <div>
            <label htmlFor="task-time" className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Time</label>
            <input id="task-time" value={form.scheduled_time} onChange={update('scheduled_time')} placeholder="9:00 AM" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-duration" className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Duration</label>
            <input id="task-duration" value={form.duration} onChange={update('duration')} placeholder="60m" className={inputClass} />
          </div>
          <div>
            <label htmlFor="task-priority" className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Priority</label>
            <select id="task-priority" value={form.priority} onChange={update('priority')} className={`${inputClass} cursor-pointer appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]`} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}>
              <option value="high" className="bg-[#1a1c2c]">🔴 High</option>
              <option value="medium" className="bg-[#1a1c2c]">🟡 Medium</option>
              <option value="low" className="bg-[#1a1c2c]">⚪ Low</option>
            </select>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3.5 bg-gradient-to-br from-primary to-primary-container text-[#003915] font-black rounded-xl mt-2 disabled:opacity-50 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-[#003915]/30 border-t-[#003915] rounded-full animate-spin" />
              Adding…
            </span>
          ) : '+ Add Session'}
        </motion.button>
      </form>
    </Modal>
  )
}

export default function Scheduler() {
  const { user: authUser } = useAuth()
  const { tasks, setTasks, addTask, updateTask: updateTaskStore, removeTask } = useAppStore()
  const [view, setView] = useState('Day')
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authUser?.id) return
    const load = async () => {
      setLoading(true)
      const { data } = await tasksService.getTasks(authUser.id)
      if (data) setTasks(data)
      setLoading(false)
    }
    load()
  }, [authUser?.id])

  const toggleDone = useCallback(async (id) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    updateTaskStore(id, { done: !task.done })
    await tasksService.updateTask(id, { done: !task.done })
  }, [tasks, updateTaskStore])

  const handleCreate = useCallback(async (formData) => {
    const { data } = await tasksService.createTask(authUser.id, {
      ...formData,
      subject: formData.subject || 'General',
    })
    if (data) addTask(data)
  }, [authUser?.id, addTask])

  const handleDelete = useCallback(async (id) => {
    removeTask(id)
    await tasksService.deleteTask(id)
  }, [removeTask])

  const remaining = tasks.filter((s) => !s.done).length
  const done = tasks.filter((s) => s.done).length
  const totalPct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <PageWrapper>
      <AnimatePresence>
        {showAddModal && <AddTaskModal onClose={() => setShowAddModal(false)} onCreate={handleCreate} />}
      </AnimatePresence>

      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-8">

        {/* ── Header ────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-headline font-black tracking-tighter text-white mb-3">
              Schedule<span className="text-primary">.</span>
            </h1>
            <p className="text-on-surface-variant font-medium">
              <span className="text-primary/80">{today}</span> — {remaining} sessions remaining
            </p>
          </div>

          {/* View switcher */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/5 p-1.5 rounded-2xl w-fit">
            {['Day', 'Week', 'Month'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`relative px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 overflow-hidden ${
                  view === v ? 'text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {view === v && (
                  <motion.div
                    layoutId="scheduler-view-bg"
                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{v}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Left Sidebar ─────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-5">

            {/* Coach Insight */}
            <motion.div variants={fadeUp}>
              <PremiumCard>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Kesari Insight</span>
                </div>
                <h3 className="font-headline font-black text-xl text-white tracking-tight mb-2">
                  Stay Consistent<span className="text-primary">.</span>
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Complete your scheduled sessions to build your streak and earn XP. Every session counts toward your focus mastery.
                </p>
              </PremiumCard>
            </motion.div>

            {/* Daily Progress */}
            <motion.div variants={fadeUp}>
              <div className="bg-surface-container-low/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-black text-on-surface text-lg tracking-tight">Daily Progress</h3>
                  <span className="font-mono text-primary font-black text-sm">{done}/{tasks.length}</span>
                </div>

                {tasks.length === 0 ? (
                  <p className="text-xs text-on-surface-variant">Add sessions to track progress.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-on-surface-variant font-bold">Sessions Complete</span>
                      <span className="text-xs text-primary font-black font-mono">{totalPct}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${totalPct}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                        className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full"
                        style={{ boxShadow: '0 0 12px rgba(74,225,118,0.4)' }}
                      />
                    </div>

                    {/* Session type breakdown */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => {
                        const count = tasks.filter((t) => t.priority === key).length
                        return (
                          <div key={key} className={`text-center py-2 px-1 rounded-xl border ${cfg.border} ${cfg.bg}`}>
                            <div className={`text-lg font-black font-mono ${key === 'high' ? 'text-primary' : key === 'medium' ? 'text-amber-400' : 'text-on-surface-variant'}`}>{count}</div>
                            <div className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant mt-0.5">{cfg.label}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick go to Focus */}
            <motion.div variants={fadeUp}>
              <Link to="/focus">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center gap-4 bg-gradient-to-br from-primary/10 to-primary-container/5 border border-primary/20 hover:border-primary/40 rounded-2xl p-5 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                  </div>
                  <div>
                    <p className="font-black text-white text-sm">Start Focus Session</p>
                    <p className="text-xs text-primary/70">Open the timer →</p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </div>

          {/* ── Session Timeline ──────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} className="p-6 flex items-start gap-4">
                  <SkeletonAvatar size="w-5 h-5 shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <SkeletonText lines={1} className="w-12 h-4 !rounded-full shrink-0" />
                      <SkeletonText lines={1} className="w-24 h-4 shrink-0" />
                    </div>
                    <SkeletonText lines={1} className="w-48 h-5" />
                  </div>
                </SkeletonCard>
              ))
            ) : tasks.length === 0 ? (
              <motion.div
                variants={fadeUp}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-white/3 border border-white/5 flex items-center justify-center mb-6 mx-auto">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">event_note</span>
                </div>
                <p className="font-black text-on-surface text-xl mb-2">No sessions yet.</p>
                <p className="text-sm text-on-surface-variant mb-6">Add your first focus session below.</p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-primary/10 border border-primary/25 text-primary font-black rounded-xl hover:bg-primary/20 transition-colors text-sm"
                >
                  + Add Session
                </motion.button>
              </motion.div>
            ) : (
              <AnimatePresence>
                {tasks.map((session) => {
                  const cfg = PRIORITY_CONFIG[session.priority] || PRIORITY_CONFIG.low
                  return (
                    <motion.div
                      key={session.id}
                      variants={fadeUp}
                      layout
                      exit={{ opacity: 0, x: -20, scale: 0.97 }}
                      className={`group relative rounded-2xl p-5 border-l-2 border transition-all duration-300 overflow-hidden ${cfg.border} ${cfg.bg} ${
                        session.done ? 'opacity-40' : 'hover:border-l-4'
                      }`}
                    >
                      {/* Hover shimmer */}
                      {!session.done && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/2 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                      )}

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          {/* Checkbox */}
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => toggleDone(session.id)}
                            className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                              session.done
                                ? 'bg-primary border-primary shadow-[0_0_12px_rgba(74,225,118,0.4)]'
                                : `border-outline-variant/40 hover:border-primary/60 ${cfg.bg}`
                            }`}
                          >
                            <AnimatePresence>
                              {session.done && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className="material-symbols-outlined text-[14px] text-on-primary"
                                  style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                  check
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span 
                                className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${cfg.badge}`}
                                aria-label={`Priority: ${cfg.label}`}
                              >
                                {cfg.label}
                              </span>
                              {session.subject && (
                                <span className="text-xs text-on-surface-variant font-medium">{session.subject}</span>
                              )}
                            </div>
                            <h3 className={`font-headline font-black text-lg text-white tracking-tight ${session.done ? 'line-through opacity-60' : ''}`}>
                              {session.title}
                            </h3>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          {session.scheduled_time && (
                            <div className="text-sm font-mono font-black text-white">{session.scheduled_time}</div>
                          )}
                          {session.duration && (
                            <div className="text-xs text-on-surface-variant mt-0.5">{session.duration}</div>
                          )}
                        </div>
                      </div>

                      {!session.done && (
                        <div className="mt-4 flex gap-2">
                          <Link to="/focus">
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              className="px-4 py-1.5 bg-primary/10 text-primary text-[11px] font-black rounded-xl hover:bg-primary/20 transition-colors flex items-center gap-1.5 border border-primary/15"
                            >
                              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                              Start Now
                            </motion.button>
                          </Link>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleDelete(session.id)}
                            className="px-4 py-1.5 bg-red-900/10 text-red-400 text-[11px] font-black rounded-xl hover:bg-red-900/20 transition-colors flex items-center gap-1.5 border border-red-900/15"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Remove
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}

            {/* Add Button */}
            <motion.button
              variants={fadeUp}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddModal(true)}
              className="w-full py-5 rounded-2xl border border-dashed border-white/10 hover:border-primary/30 text-on-surface-variant hover:text-primary transition-all duration-300 flex items-center justify-center gap-2 font-black text-sm group"
            >
              <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform duration-300">add_circle</span>
              Add Focus Session
            </motion.button>
          </div>
        </div>
      </motion.div>
    </PageWrapper>
  )
}
