import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import PageWrapper from '../layout/PageWrapper'
import useAppStore from '../../store/useAppStore'
import { useAuth } from '../../lib/auth'
import { tasksService } from '../../lib/api'
import { SkeletonCard, SkeletonText, SkeletonAvatar } from '../ui/Skeleton'

const stagger = { animate: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const priorityColors = {
  high: 'border-l-primary bg-primary/5',
  medium: 'border-l-secondary bg-secondary/5',
  low: 'border-l-surface-variant bg-surface-container-high/50',
}

const priorityLabels = {
  high: { bg: 'bg-primary/10 text-primary', text: 'High' },
  medium: { bg: 'bg-secondary/10 text-secondary', text: 'Medium' },
  low: { bg: 'bg-outline/20 text-on-surface-variant', text: 'Low' },
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-md bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10"
      >
        <h2 className="font-headline font-bold text-xl text-on-surface mb-6">Add Focus Session</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Title *</label>
            <input value={form.title} onChange={update('title')} placeholder="e.g. Linear Algebra Review"
              className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Subject</label>
              <input value={form.subject} onChange={update('subject')} placeholder="Mathematics"
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Time</label>
              <input value={form.scheduled_time} onChange={update('scheduled_time')} placeholder="9:00 AM"
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Duration</label>
              <input value={form.duration} onChange={update('duration')} placeholder="60m"
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Priority</label>
              <select value={form.priority} onChange={update('priority')}
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-br from-[#4ae176] to-[#00a74b] text-[#003915] font-bold rounded-xl mt-2 disabled:opacity-60">
            {loading ? 'Adding…' : 'Add Session'}
          </button>
        </form>
      </motion.div>
    </div>
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

  return (
    <PageWrapper>
      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onCreate={handleCreate}
        />
      )}

      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-8">

        {/* Header */}
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline font-bold text-4xl text-on-surface tracking-tight">Today's Focus</h1>
            <p className="text-on-surface-variant font-medium mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} •{' '}
              {remaining} sessions remaining
            </p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-low p-2 rounded-2xl">
            {['Day', 'Week', 'Month'].map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  view === v
                    ? 'bg-surface-container-high text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}>
                {v}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div variants={fadeUp} className="bg-surface-container-low p-6 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl">psychology</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Coach Insight</span>
              </div>
              <h3 className="text-xl font-headline font-bold mb-2">Stay Consistent</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Complete your scheduled sessions to build your streak and earn XP. Every session counts.
              </p>
            </motion.div>

            {/* Progress */}
            <motion.div variants={fadeUp} className="bg-surface-container-high rounded-2xl p-6">
              <h3 className="font-bold text-on-surface mb-4">Daily Progress</h3>
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <p className="text-xs text-on-surface-variant">Add sessions above to track progress.</p>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant font-medium">Sessions Complete</span>
                      <span className="text-primary font-mono font-bold">{done} / {tasks.length}</span>
                    </div>
                    <div className="h-2 bg-surface-container-lowest rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                        className="h-full bg-gradient-to-r from-[#4ae176] to-[#00a74b] rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Session Timeline */}
          <div className="lg:col-span-8 space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} className="p-6 flex items-start gap-4">
                  <SkeletonAvatar size="w-[20px] h-[20px] shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <SkeletonText lines={1} className="w-12 h-4 !rounded-full shrink-0" />
                      <SkeletonText lines={1} className="w-24 h-4 shrink-0" />
                    </div>
                    <SkeletonText lines={1} className="w-48 h-5" />
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <SkeletonText lines={1} className="w-16 h-4" />
                    <SkeletonText lines={1} className="w-8 h-3" />
                  </div>
                </SkeletonCard>
              ))
            ) : tasks.length === 0 ? (
              <motion.div variants={fadeUp} className="text-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-3 block opacity-40">event_note</span>
                <p className="font-medium">No sessions scheduled yet.</p>
                <p className="text-sm mt-1">Add one below to get started.</p>
              </motion.div>
            ) : (
              tasks.map((session, i) => (
                <motion.div
                  key={session.id}
                  variants={fadeUp}
                  className={`
                    rounded-2xl p-6 border-l-4 border border-outline-variant/10 transition-all duration-300
                    ${priorityColors[session.priority]}
                    ${session.done ? 'opacity-50' : 'hover:bg-surface-container-high'}
                  `}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <button
                        onClick={() => toggleDone(session.id)}
                        className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          session.done
                            ? 'bg-primary border-primary'
                            : 'border-outline-variant hover:border-primary'
                        }`}
                      >
                        {session.done && (
                          <span className="material-symbols-outlined text-[12px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check
                          </span>
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${priorityLabels[session.priority].bg}`}>
                            {priorityLabels[session.priority].text}
                          </span>
                          <span className="text-xs text-on-surface-variant">{session.subject}</span>
                        </div>
                        <h3 className={`font-headline font-bold text-on-surface ${session.done ? 'line-through' : ''}`}>
                          {session.title}
                        </h3>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      {session.scheduled_time && (
                        <div className="text-sm font-mono font-bold text-on-surface">{session.scheduled_time}</div>
                      )}
                      {session.duration && (
                        <div className="text-xs text-on-surface-variant">{session.duration}</div>
                      )}
                    </div>
                  </div>

                  {!session.done && (
                    <div className="mt-4 flex gap-2">
                      <a href="/focus">
                        <button className="px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-colors flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                          Start Now
                        </button>
                      </a>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="px-4 py-1.5 bg-red-900/10 text-red-400 text-xs font-bold rounded-xl hover:bg-red-900/20 transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        Remove
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            )}

            {/* Add Session Button */}
            <motion.button
              variants={fadeUp}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddModal(true)}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-outline-variant/30 text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2 font-medium"
            >
              <span className="material-symbols-outlined">add_circle</span>
              Add Focus Session
            </motion.button>
          </div>
        </div>
      </motion.div>
    </PageWrapper>
  )
}
