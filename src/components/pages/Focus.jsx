import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '../layout/PageWrapper'
import TimerCircle from '../ui/TimerCircle'
import Modal from '../ui/Modal'
import { useTimer } from '../../hooks/useTimer'
import { TIMER_MODES } from '../../lib/constants'

const NAV_ITEMS = [
  { path: '/', icon: 'grid_view', label: 'Home' },
  { path: '/focus', icon: 'timer', label: 'Focus' },
  { path: '/kesari', icon: 'psychology', label: 'Coach' },
  { path: '/analytics', icon: 'analytics', label: 'Stats' },
  { path: '/leaderboard', icon: 'group', label: 'Social' },
]

export default function Focus() {
  const { formatted, progress, timerRunning, timerMode, timerTask, toggle, reset, setMode, setTask } = useTimer()
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskDraft, setTaskDraft] = useState(timerTask)
  const { pathname } = useLocation()

  const handleSaveTask = () => {
    setTask(taskDraft)
    setTaskModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      {/* Inline TopBar for focus page */}
      <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[#003915] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              psychology
            </span>
          </div>
          <span className="text-primary font-black tracking-widest text-lg uppercase font-headline">STUDY HUB</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/10">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-headline font-bold tracking-tight text-sm text-primary">Kesari AI Coach</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-6 pt-24 pb-32">
        <div className="w-full max-w-xl flex flex-col items-center">

          {/* Mode Selector */}
          <div className="bg-surface-container-low p-1.5 rounded-2xl flex gap-2 mb-12 backdrop-blur-md">
            {[
              { mode: TIMER_MODES.POMODORO, label: 'Pomodoro' },
              { mode: TIMER_MODES.DEEP_FOCUS, label: 'Deep Focus' },
            ].map(({ mode, label }) => (
              <motion.button
                key={mode}
                whileTap={{ scale: 0.97 }}
                onClick={() => setMode(mode)}
                className={`px-8 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  timerMode === mode
                    ? 'bg-primary-container text-on-primary-container shadow-lg'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {label}
              </motion.button>
            ))}
          </div>

          {/* Timer Ring */}
          <TimerCircle progress={progress} size={320}>
            <span className="font-mono text-7xl font-medium tracking-tighter text-on-surface">
              {formatted}
            </span>
            <span className="text-on-surface-variant font-medium tracking-[0.2em] mt-2 uppercase text-xs">
              {timerRunning ? 'In The Zone' : 'Stay Focused'}
            </span>
          </TimerCircle>

          {/* Controls */}
          <div className="flex items-center gap-10 mt-16">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={reset}
              aria-label="Reset timer"
              className="w-14 h-14 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all"
            >
              <span className="material-symbols-outlined text-2xl">refresh</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.05 }}
              onClick={toggle}
              aria-label={timerRunning ? 'Pause timer' : 'Start timer'}
              className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-[#4ae176] to-[#00a74b] text-[#003915] shadow-[0_20px_40px_rgba(0,167,75,0.3)]"
            >
              <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {timerRunning ? 'pause' : 'play_arrow'}
              </span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={reset}
              aria-label="Stop timer"
              className="w-14 h-14 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all"
            >
              <span className="material-symbols-outlined text-2xl">stop</span>
            </motion.button>
          </div>

          {/* Task Context Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-20 w-full glass-panel p-6 rounded-2xl border border-outline-variant/10 flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span className="text-xs font-medium text-primary uppercase tracking-widest mb-1">Current Task</span>
              <h3 className="text-on-surface font-headline font-bold">{timerTask}</h3>
            </div>
            <button
              onClick={() => { setTaskDraft(timerTask); setTaskModalOpen(true) }}
              aria-label="Edit current task"
              className="p-2 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">edit</span>
            </button>
          </motion.div>

        </div>
      </main>

      {/* Atmospheric glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Bottom Nav — using Link to prevent full page reloads that kill timer state */}
      <nav className="fixed bottom-0 w-full px-6 pb-6 z-50">
        <div className="bg-[#2d3449]/60 backdrop-blur-[20px] rounded-[2rem] flex items-center justify-around max-w-md mx-auto py-2 border border-outline-variant/10">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center rounded-2xl px-4 py-2 transition-all duration-300 ${
                  active
                    ? 'bg-gradient-to-br from-[#4ae176] to-[#00a74b] text-[#003915] scale-110'
                    : 'text-slate-400 hover:text-green-300'
                }`}
              >
                <span className="material-symbols-outlined mb-0.5" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {item.icon}
                </span>
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Task Edit Modal */}
      <Modal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} title="Edit Current Task">
        <div className="space-y-4">
          <input
            id="task-title-input"
            type="text"
            value={taskDraft}
            onChange={(e) => setTaskDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveTask()}
            placeholder="What are you focusing on?"
            className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50 font-body"
          />
          <button
            onClick={handleSaveTask}
            className="w-full bg-gradient-to-br from-[#4ae176] to-[#00a74b] text-[#003915] font-bold py-3 rounded-xl"
          >
            Save Task
          </button>
        </div>
      </Modal>
    </div>
  )
}

