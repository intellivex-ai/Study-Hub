import { useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import FocusScene from '../ui/FocusScene'
import Modal from '../ui/Modal'
import FocusButton from '../ui/FocusButton'
import AmbientSoundPanel from '../ui/AmbientSoundPanel'
import { useTimer } from '../../hooks/useTimer'
import { TIMER_MODES } from '../../lib/constants'
import useAppStore from '../../store/useAppStore'

const NAV_ITEMS = [
  { path: '/', icon: 'grid_view', label: 'Home' },
  { path: '/focus', icon: 'timer', label: 'Focus' },
  { path: '/kesari', icon: 'psychology', label: 'Coach' },
  { path: '/notes', icon: 'edit_note', label: 'Notes' },
  { path: '/analytics', icon: 'analytics', label: 'Stats' },
]

// Break screen shown between Pomodoros
function BreakScreen({ breakLength, onSkip }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/90 backdrop-blur-2xl"
    >
      <div className="flex flex-col items-center gap-8 text-center px-6">
        {/* Breathing orb */}
        <div className="relative">
          <div className="absolute inset-0 w-48 h-48 rounded-full bg-primary/10 blur-3xl breathe" />
          <motion.div
            className="relative w-40 h-40 rounded-full border-2 border-primary/30 bg-primary/5 flex items-center justify-center breathe"
          >
            <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              self_improvement
            </span>
          </motion.div>
        </div>

        <div>
          <h2 className="text-4xl font-headline font-black text-white tracking-tighter mb-2">
            Time to Breathe<span className="text-primary">.</span>
          </h2>
          <p className="text-on-surface-variant text-lg">
            {breakLength}-minute break — you've earned it
          </p>
        </div>

        <div className="space-y-2 text-center">
          <p className="text-sm text-on-surface-variant/60">💡 <em>Drink some water, stretch, or look out the window</em></p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSkip}
          className="px-8 py-3.5 bg-white/5 text-on-surface-variant border border-white/10 font-black rounded-2xl hover:text-white hover:border-white/25 transition-all"
        >
          Skip Break
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function Focus() {
  const { formatted, progress, timerRunning, timerMode, timerTask, toggle, reset, setMode, setTask } = useTimer()
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskDraft, setTaskDraft] = useState(timerTask)
  const [soundPanelOpen, setSoundPanelOpen] = useState(false)
  const [showBreak, setShowBreak] = useState(false)
  const { pathname } = useLocation()
  const ambientSound = useAppStore((s) => s.ambientSound)
  const settings = useAppStore((s) => s.settings)

  const handleSaveTask = () => {
    setTask(taskDraft)
    setTaskModalOpen(false)
  }

  // XP earned this session (1 XP per 6 seconds = 10 XP/min, capped display)
  const sessionXP = Math.floor(progress * (timerMode === TIMER_MODES.DEEP_FOCUS ? 150 : 50))

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Break Screen */}
      <AnimatePresence>
        {showBreak && (
          <BreakScreen
            breakLength={settings.breakLength}
            onSkip={() => { setShowBreak(false); reset() }}
          />
        )}
      </AnimatePresence>

      {/* ── Ambient Glows ─────────────────────────────────────── */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/4 rounded-full blur-[160px] -z-10 pointer-events-none" />
      <AnimatePresence>
        {timerRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/3 rounded-full blur-[200px] -z-10 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-2xl border-b border-white/5">
        <div className="flex justify-between items-center px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[#003915] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                psychology
              </span>
            </div>
            <span className="text-white font-black tracking-widest text-base uppercase font-headline">
              Study<span className="text-primary">Hub</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Session XP ticker */}
            <AnimatePresence>
              {timerRunning && sessionXP > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black"
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                  +{sessionXP} XP
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live status pill */}
            <motion.div
              animate={timerRunning ? { opacity: [1, 0.6, 1] } : { opacity: 1 }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-black uppercase tracking-widest transition-all duration-500 ${
                timerRunning
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-surface-container-high/40 border-white/5 text-on-surface-variant'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${timerRunning ? 'bg-primary animate-pulse' : 'bg-on-surface-variant'}`} />
              {timerRunning ? 'In The Zone' : 'Ready'}
            </motion.div>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 pt-24 pb-36">
        <div className="w-full max-w-xl flex flex-col items-center">

          {/* Mode Selector */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-black/40 backdrop-blur-md border border-white/5 p-1.5 rounded-2xl flex gap-2 mb-12 shadow-xl"
          >
            {[
              { mode: TIMER_MODES.POMODORO, label: 'Pomodoro', icon: 'timer' },
              { mode: TIMER_MODES.DEEP_FOCUS, label: 'Deep Focus', icon: 'self_improvement' },
            ].map(({ mode, label, icon }) => (
              <motion.button
                key={mode}
                whileTap={{ scale: 0.96 }}
                onClick={() => setMode(mode)}
                className={`relative px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 overflow-hidden ${
                  timerMode === mode ? 'text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {timerMode === mode && (
                  <motion.div
                    layoutId="focus-mode-bg"
                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span
                  className="material-symbols-outlined text-[16px] relative z-10"
                  style={timerMode === mode ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {icon}
                </span>
                <span className="relative z-10">{label}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Timer Display */}
          <FocusScene>
            <span className="font-mono text-7xl font-black tracking-tighter text-white" style={{ textShadow: timerRunning ? '0 0 40px rgba(74,225,118,0.3)' : 'none' }}>
              {formatted}
            </span>
            <motion.span
              animate={timerRunning ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
              transition={{ repeat: Infinity, duration: 3 }}
              className={`tracking-[0.25em] mt-2 uppercase text-xs font-black ${timerRunning ? 'text-primary' : 'text-on-surface-variant'}`}
            >
              {timerRunning ? '● In The Zone' : '○ Stay Focused'}
            </motion.span>
          </FocusScene>

          {/* Controls */}
          <div className="flex items-center gap-8 mt-16">
            {/* Reset */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.08 }}
              onClick={reset}
              aria-label="Reset timer"
              className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-md border border-white/5 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all duration-300 shadow-xl"
            >
              <span className="material-symbols-outlined text-xl">refresh</span>
            </motion.button>

            {/* Play/Pause */}
            <FocusButton onClick={toggle}>
              {timerRunning ? 'PAUSE' : 'START'}
            </FocusButton>

            {/* Stop */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.08 }}
              onClick={reset}
              aria-label="Stop timer"
              className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-md border border-white/5 text-on-surface-variant hover:text-red-400 hover:border-red-400/30 transition-all duration-300 shadow-xl"
            >
              <span className="material-symbols-outlined text-xl">stop</span>
            </motion.button>
          </div>

          {/* Progress bar */}
          <div className="w-full mt-10 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Bottom Controls Row — Task + Ambient */}
          <div className="w-full mt-6 flex gap-3">
            {/* Task Context Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex-1 group"
            >
              <div className="relative bg-black/40 backdrop-blur-md border border-white/5 hover:border-primary/20 rounded-2xl p-4 flex items-center justify-between transition-all duration-300">
                <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-gradient-to-b from-primary to-transparent rounded-full" />
                <div className="flex flex-col pl-3">
                  <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest mb-0.5">Current Task</span>
                  <h3 className="text-on-surface font-headline font-bold text-base">{timerTask}</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setTaskDraft(timerTask); setTaskModalOpen(true) }}
                  aria-label="Edit current task"
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Ambient Sound Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative flex-shrink-0"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSoundPanelOpen(!soundPanelOpen)}
                className={`w-full h-full min-w-[56px] min-h-[64px] rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                  ambientSound
                    ? 'bg-primary/10 border-primary/35 text-primary ambient-active'
                    : 'bg-black/40 border-white/5 text-on-surface-variant hover:border-white/20 hover:text-white'
                }`}
                aria-label="Ambient sounds"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: `'FILL' ${ambientSound ? 1 : 0}` }}>
                  headphones
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest">Sound</span>
              </motion.button>

              {/* Panel */}
              <AmbientSoundPanel isOpen={soundPanelOpen} onClose={() => setSoundPanelOpen(false)} />
            </motion.div>
          </div>

        </div>
      </main>

      {/* ── Bottom Nav ──────────────────────────────────────────── */}
      <nav className="fixed bottom-0 w-full px-4 pb-5 z-50">
        <div
          className="w-full flex justify-around items-center py-2 px-2 rounded-[2rem] border border-white/5 max-w-lg mx-auto"
          style={{
            background: 'rgba(10, 12, 12, 0.75)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 -4px 40px rgba(0,0,0,0.6)',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center rounded-2xl px-3 py-2 transition-all duration-300"
              >
                {active && (
                  <motion.div
                    layoutId="focus-nav-bg"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-primary-container"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    style={{ boxShadow: '0 4px 16px rgba(74,225,118,0.3)' }}
                  />
                )}
                <span
                  className={`material-symbols-outlined text-[22px] relative z-10 ${active ? 'text-[#003915]' : 'text-slate-400'}`}
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className={`text-[10px] font-bold tracking-wide mt-0.5 relative z-10 ${active ? 'text-[#003915]' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ── Task Edit Modal ──────────────────────────────────────── */}
      <Modal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} title="What are you focusing on?">
        <div className="space-y-4">
          <input
            id="task-title-input"
            type="text"
            value={taskDraft}
            onChange={(e) => setTaskDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveTask()}
            placeholder="e.g. Linear Algebra Chapter 5"
            className="w-full bg-white/5 border border-white/10 hover:border-primary/30 focus:border-primary/50 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none transition-colors font-body text-sm"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSaveTask}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-[#003915] font-black py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
          >
            Lock In Task
          </motion.button>
        </div>
      </Modal>
    </div>
  )
}
