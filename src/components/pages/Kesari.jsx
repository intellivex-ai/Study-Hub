import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '../layout/PageWrapper'

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'assistant',
    content: "I noticed your heart rate peaked during that last deep-work block. Perhaps it's time for a mental reset before we dive into Advanced Calculus?",
    timestamp: 'Just now',
    suggestions: [
      { icon: 'self_care', title: 'Take a 5-minute breather?', desc: 'Guided box-breathing to lower cortisol levels.' },
      { icon: 'headphones', title: 'Try a lo-fi focus track', desc: '85 BPM curated for deep mathematical focus.' },
    ],
  },
  {
    id: 2,
    role: 'user',
    content: 'Good call, Kesari. Let\'s do the breather. I\'m feeling a bit burnt out.',
    timestamp: '1m ago',
  },
]

function AssistantBubble({ msg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-start max-w-[85%]"
    >
      <div className="glass-panel p-5 rounded-3xl rounded-tl-none border border-white/5 shadow-xl">
        <p className="text-on-surface leading-relaxed">{msg.content}</p>
      </div>
      {msg.suggestions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 w-full max-w-lg">
          {msg.suggestions.map((s) => (
            <button key={s.title} className="bg-surface-container-low hover:bg-surface-container-high transition-all p-5 rounded-3xl text-left border border-white/5 group">
              <div className="w-10 h-10 rounded-2xl bg-secondary-container/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
              <h3 className="font-headline font-bold text-on-surface text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-on-surface-variant">{s.desc}</p>
            </button>
          ))}
        </div>
      )}
      <span className="text-[10px] text-on-surface-variant mt-2 ml-1 font-mono uppercase tracking-widest">
        Kesari • {msg.timestamp}
      </span>
    </motion.div>
  )
}

function UserBubble({ msg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-end max-w-[85%] self-end"
    >
      <div className="bg-gradient-to-br from-primary to-primary-container p-5 rounded-3xl rounded-tr-none shadow-lg shadow-primary/10">
        <p className="text-on-primary font-medium leading-relaxed">{msg.content}</p>
      </div>
      <span className="text-[10px] text-on-surface-variant mt-2 mr-1 font-mono uppercase tracking-widest">
        You • {msg.timestamp}
      </span>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex items-center gap-4 text-on-surface-variant">
      <div className="flex gap-1 bg-surface-container-low px-4 py-3 rounded-2xl">
        {[0, 150, 300].map((delay) => (
          <div key={delay} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: `${delay}ms` }} />
        ))}
      </div>
      <span className="text-xs font-mono uppercase tracking-tighter">Kesari is reflecting...</span>
    </motion.div>
  )
}

export default function Kesari() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg = { id: Date.now(), role: 'user', content: input, timestamp: 'Just now' }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      const responses = [
        "Great insight! Based on your study patterns, I recommend a 5-minute mindfulness break before your next session. Your focus tends to peak 10 minutes after a proper reset.",
        "I've analyzed your recent sessions. You perform 34% better on analytical tasks between 9–11 AM. Want me to block your schedule for deep work during that window?",
        "Your consistency this week has been outstanding. You're on track to hit your weekly goal of 30 focus hours. Keep up the momentum — the streak is yours to lose!",
      ]
      const reply = {
        id: Date.now() + 1,
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: 'Just now',
      }
      setMessages((prev) => [...prev, reply])
    }, 1800)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* TopBar */}
      <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
          </div>
          <div>
            <h1 className="text-primary font-black tracking-widest text-lg uppercase font-headline">STUDY HUB</h1>
            <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-tighter">Kesari AI Coach</p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-slate-400">notifications</span>
        </button>
      </header>

      <main className="flex-grow flex flex-col px-6 pt-24 pb-44 max-w-4xl mx-auto w-full">
        {/* Welcome */}
        <section className="mb-8">
          <h2 className="font-headline font-bold text-3xl text-on-surface mb-2">Hello, Alex.</h2>
          <p className="text-on-surface-variant text-lg">
            You've been focused for{' '}
            <span className="text-primary font-mono">42:15</span>. Your sanctuary is ready for the next step.
          </p>
        </section>

        {/* Chat Canvas */}
        <div className="flex flex-col gap-6">
          <AnimatePresence>
            {messages.map((msg) =>
              msg.role === 'assistant'
                ? <AssistantBubble key={msg.id} msg={msg} />
                : <UserBubble key={msg.id} msg={msg} />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isTyping && <TypingIndicator key="typing" />}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input Bar */}
      <div className="fixed bottom-24 left-0 right-0 px-6 z-40">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel p-2 rounded-full border border-white/5 flex items-center shadow-2xl">
            <button className="w-12 h-12 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tell Kesari how you feel..."
              className="bg-transparent border-none outline-none flex-grow text-on-surface placeholder:text-on-surface-variant/50 px-4 font-body"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              className="bg-gradient-to-br from-primary to-primary-container w-12 h-12 flex items-center justify-center rounded-full text-on-primary shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full px-6 pb-6 z-50">
        <div className="bg-[#2d3449]/60 backdrop-blur-[20px] rounded-[2rem] flex items-center justify-around max-w-lg mx-auto py-2 shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-outline-variant/10">
          {[
            { path: '/', icon: 'grid_view', label: 'Home', active: false },
            { path: '/focus', icon: 'timer', label: 'Focus', active: false },
            { path: '/kesari', icon: 'psychology', label: 'Coach', active: true },
            { path: '/analytics', icon: 'analytics', label: 'Stats', active: false },
            { path: '/leaderboard', icon: 'group', label: 'Social', active: false },
          ].map((item) => (
            <a key={item.path} href={item.path}
              className={`flex flex-col items-center justify-center rounded-2xl px-4 py-2 transition-all duration-300 ${
                item.active
                  ? 'bg-gradient-to-br from-[#4ae176] to-[#00a74b] text-[#003915] scale-110'
                  : 'text-slate-400 hover:text-green-300'
              }`}
            >
              <span className="material-symbols-outlined mb-0.5" style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  )
}
