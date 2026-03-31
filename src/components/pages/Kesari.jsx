import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '../layout/PageWrapper'
import KesariChatInput from '../ui/KesariChatInput'
import KesariSendButton from '../ui/KesariSendButton'
import { useAuth } from '../../lib/auth'
import useAppStore from '../../store/useAppStore'
import { getXpLevel } from '../../lib/constants'

// ── Smart mock response engine ──────────────────────────────────────────────
// Groups of contextual replies keyed by intent
const RESPONSES = {
  plan: [
    (ctx) => `Based on your current streak of **${ctx.streak} days** and **${ctx.focusTime}** studied this week, here's your optimised plan:\n\n**Morning (9–11 AM)** – Deep work: ${ctx.topSubject || 'your hardest subject'}\n**Afternoon (2–4 PM)** – Problem sets and past papers\n**Evening (7–9 PM)** – Light review + flashcard revision\n\nSchedule your hardest topics during your 9–11 AM peak window. You'll retain 40% more.`,
    (ctx) => `For the next 7 days, I'd recommend focusing on ${ctx.pendingTaskCount > 0 ? `your **${ctx.pendingTaskCount} pending tasks**` : 'a mix of deep work + review'} using the **80/20 rule** — study the 20% of topics that appear in 80% of exam questions first.\n\nWant me to break this into daily Pomodoro blocks?`,
  ],
  focus: [
    (ctx) => `Right now, your focus score is **${ctx.focusScore}%**. Here are 3 evidence-based techniques:\n\n1. **2-minute rule** — If a task takes <2 mins, do it now.\n2. **Implementation intentions** — "I will study X at 9 AM in Y place."\n3. **Temptation bundling** — Pair studying with something enjoyable (like lo-fi music 🎵).\n\nYour next Pomodoro starts in... now. Go!`,
    (ctx) => `Your ${ctx.streak}-day streak proves you have discipline. The enemy now is **decision fatigue**. Pre-decide your study tasks the night before so your morning brain doesn't have to choose. Try setting up tomorrow's schedule in the Scheduler right now!`,
  ],
  analyse: [
    (ctx) => `Here's your performance analysis:\n\n📊 **Week Summary**\n- Focus sessions: estimated from your ${ctx.streak}-day streak\n- Daily average: ~${Math.max(1, ctx.streak * 0.3).toFixed(1)} hours\n- XP earned: **${ctx.xp} total** (Level ${ctx.level})\n\n✅ **Strengths:** Consistency — your streak shows discipline\n⚠️ **Gap:** You might be avoiding difficult topics. Push into the discomfort zone.`,
    (ctx) => `Your data tells me you're a **${ctx.streak > 7 ? 'consistent performer' : 'builder'}**. You've accumulated **${ctx.xp} XP** and your focus score is **${ctx.focusScore}%**.\n\nThe biggest leverage point: if you add just **one more 25-min Pomodoro per day**, you'd gain ~180 extra focus hours per year. That's transformative.`,
  ],
  break: [
    () => `**5-minute box breathing reset:**\n\n1. **Inhale** slowly for 4 counts through your nose 👃\n2. **Hold** for 4 counts\n3. **Exhale** slowly for 4 counts through your mouth\n4. **Hold** again for 4 counts\n\nRepeat 4–5 times. This activates your parasympathetic nervous system and lowers cortisol in under 5 minutes. 🧘`,
    () => `Take a micro-break with the **20-20-20 rule**: Look at something **20 feet away** for **20 seconds** every **20 minutes** of screen time. Then do 10 neck rolls left, 10 right. Your focus will return sharper after this reset.`,
  ],
  flashcard: [
    (ctx) => `I've generated some flashcards for you! Head to the **Flashcards** page to start a review session.\n\n💡 Tip: The SM-2 algorithm will show you cards just before you'd forget them — this is the most efficient way to memorise anything long-term. Review **${ctx.dueCards > 0 ? ctx.dueCards : 'your'} due cards** today!`,
    (ctx) => `**Spaced repetition beats re-reading by 90%** (Ebbinghaus forgetting curve research). Your brain consolidates memories during sleep — so review flashcards before bed for maximum retention. You have cards ready in the Flashcards section!`,
  ],
  default: [
    (ctx) => `I'm here to help you study smarter. With your **${ctx.streak}-day streak** and **${ctx.xp} XP**, you're clearly committed.\n\nTry one of the quick actions below — or ask me anything: exam strategies, topic explanations, motivation, time management, or study planning. I've got you.`,
    (ctx) => `Great question! As your AI study coach, I'm trained on evidence-based learning science. Your current Level **${ctx.level} (${ctx.levelLabel})** shows real progress.\n\nThe most powerful thing you can do right now: identify the **one subject you've been avoiding** and spend 25 focused minutes on it today. Avoidance is the enemy of mastery.`,
  ],
}

function getContextualResponse(message, ctx) {
  const msg = message.toLowerCase()
  let bucket = 'default'
  if (/plan|schedule|timetable|week|today/i.test(msg)) bucket = 'plan'
  else if (/focus|concentrate|distract|procrastinat/i.test(msg)) bucket = 'focus'
  else if (/analys|stat|progress|how am i|performance/i.test(msg)) bucket = 'analyse'
  else if (/break|breathe|tired|burnt|rest/i.test(msg)) bucket = 'break'
  else if (/flashcard|memorize|memorise|card|deck/i.test(msg)) bucket = 'flashcard'

  const responses = RESPONSES[bucket]
  return responses[Math.floor(Math.random() * responses.length)](ctx)
}

const QUICK_PROMPTS = [
  { icon: 'insights', label: 'Analyse my progress', intent: 'Analyse my study progress and tell me where I stand.' },
  { icon: 'calendar_month', label: 'Plan my week', intent: 'Create an optimised study plan for this week.' },
  { icon: 'psychology', label: 'Boost my focus', intent: 'Give me techniques to boost my focus right now.' },
  { icon: 'emoji_food_beverage', label: 'Break ritual', intent: "I'm feeling burnt out, give me a break ritual." },
  { icon: 'style', label: 'Flashcard tips', intent: 'Explain how to use flashcards and spaced repetition effectively.' },
  { icon: 'school', label: 'Study strategy', intent: 'What is the best study strategy for high performance?' },
]

const ACTION_BUTTONS = [
  { icon: 'style', label: 'Generate Flashcards', path: '/flashcards', color: '#a78bfa' },
  { icon: 'calendar_month', label: 'Open Scheduler', path: '/scheduler', color: '#f97316' },
  { icon: 'edit_note', label: 'Open Notes', path: '/notes', color: '#4AE176' },
  { icon: 'analytics', label: 'View Stats', path: '/analytics', color: '#60a5fa' },
]

function formatContent(text) {
  // Convert **bold** to <strong> and newlines to <br>
  return text
    .split('\n')
    .map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return <span key={i} dangerouslySetInnerHTML={{ __html: formatted + (i < text.split('\n').length - 1 ? '<br/>' : '') }} />
    })
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex items-center gap-2 max-w-[80%]"
    >
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-md shadow-primary/20 flex-shrink-0">
        <span className="material-symbols-outlined text-on-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
      </div>
      <div className="bg-surface-container-low/70 backdrop-blur-md border border-white/5 px-5 py-4 rounded-3xl rounded-tl-none">
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function AssistantBubble({ msg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col items-start max-w-[88%]"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-on-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
        </div>
        <span className="text-[10px] text-primary font-black uppercase tracking-widest font-mono">Kesari AI</span>
        <span className="text-[10px] text-on-surface-variant/40 font-mono">{msg.timestamp}</span>
      </div>

      <div className="relative bg-surface-container-low/70 backdrop-blur-md border border-white/5 p-5 rounded-3xl rounded-tl-none shadow-xl">
        <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary to-transparent rounded-full" />
        <div className="text-on-surface leading-relaxed pl-2 text-sm">
          {formatContent(msg.content)}
        </div>
      </div>
    </motion.div>
  )
}

function UserBubble({ msg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-end max-w-[84%] self-end"
    >
      <span className="text-[10px] text-on-surface-variant/40 font-mono mb-1.5">{msg.timestamp}</span>
      <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/25 px-5 py-3.5 rounded-3xl rounded-br-none shadow-lg">
        <p className="text-on-surface text-sm leading-relaxed">{msg.content}</p>
      </div>
    </motion.div>
  )
}

function getTimestamp() {
  const now = new Date()
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
}

const INITIAL_MESSAGE = (ctx) => ({
  id: 1,
  role: 'assistant',
  content: `Hey ${ctx.name}! 👋 I'm **Kesari**, your AI study coach.\n\nI can see you're on a **${ctx.streak}-day streak** with **${ctx.xp} XP** earned — Level **${ctx.level} ${ctx.levelLabel}**. That's solid work.\n\nWhat do you need help with today? Ask me anything — study plans, focus techniques, topic explanations, or just a pep talk.`,
  timestamp: 'Now',
})

export default function Kesari() {
  const { user: authUser } = useAuth()
  const { user, tasks, notes, dueCardsCount } = useAppStore()
  const [messages, setMessages] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  const { current: xpLevel } = getXpLevel(user.totalXp || 0)

  const ctx = {
    name: user.name?.split(' ')[0] || 'Scholar',
    streak: user.streak || 0,
    xp: user.totalXp || 0,
    focusScore: user.focusScore || 0,
    level: xpLevel.level,
    levelLabel: xpLevel.label,
    focusTime: user.totalFocusTime || '0m',
    pendingTaskCount: tasks.filter((t) => !t.done).length,
    topSubject: tasks.find((t) => t.priority === 'high' && !t.done)?.subject || null,
    dueCards: dueCardsCount || 0,
  }

  useEffect(() => {
    setMessages([INITIAL_MESSAGE(ctx)])
  }, [user.name])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async (text) => {
    if (!text.trim()) return
    const userMsg = { id: Date.now(), role: 'user', content: text, timestamp: getTimestamp() }
    setMessages((prev) => [...prev, userMsg])
    setInputVal('')
    setIsTyping(true)

    // Simulate streaming delay (400ms–1400ms based on response length)
    const response = getContextualResponse(text, ctx)
    const delay = 600 + Math.min(response.length * 4, 1200)
    await new Promise((r) => setTimeout(r, delay))

    setIsTyping(false)
    const aiMsg = { id: Date.now() + 1, role: 'assistant', content: response, timestamp: getTimestamp() }
    setMessages((prev) => [...prev, aiMsg])
  }

  const handleSubmit = () => sendMessage(inputVal)
  const handleQuickPrompt = (prompt) => sendMessage(prompt.intent)

  return (
    <PageWrapper>
      <div className="flex flex-col h-full gap-0" style={{ minHeight: 'calc(100vh - 200px)' }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-xl shadow-primary/25">
              <span className="material-symbols-outlined text-2xl text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-black animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-black text-white tracking-tight">
              Kesari<span className="text-primary">.</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest">AI Active · Context-aware</span>
            </div>
          </div>

          {/* Context pills */}
          <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
            <span className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              {ctx.streak}d streak
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full bg-white/5 text-on-surface-variant border border-white/8">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              Lv {ctx.level}
            </span>
          </div>
        </motion.div>

        {/* ── Quick Prompts ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.1 } }}
          className="mb-5"
        >
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2.5">Quick prompts</p>
          <div className="flex gap-2 flex-wrap">
            {QUICK_PROMPTS.map((p) => (
              <motion.button
                key={p.label}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleQuickPrompt(p)}
                disabled={isTyping}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-white/4 border border-white/8 text-on-surface-variant hover:text-white hover:border-primary/30 hover:bg-primary/8 transition-all duration-200 disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-sm">{p.icon}</span>
                {p.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Chat Area ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto space-y-5 min-h-0 pr-1 pb-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) =>
              msg.role === 'assistant' ? (
                <AssistantBubble key={msg.id} msg={msg} />
              ) : (
                <UserBubble key={msg.id} msg={msg} />
              )
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isTyping && <TypingIndicator key="typing" />}
          </AnimatePresence>

          <div ref={chatEndRef} />
        </div>

        {/* ── Action Buttons ──────────────────────────────────────── */}
        <div className="mt-4 mb-3">
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2.5">Quick actions</p>
          <div className="grid grid-cols-4 gap-2">
            {ACTION_BUTTONS.map((action) => (
              <motion.a
                key={action.path}
                href={action.path}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/5 bg-white/3 hover:border-white/15 transition-all duration-200 group"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ background: `${action.color}15`, border: `1px solid ${action.color}25` }}
                >
                  <span className="material-symbols-outlined text-lg" style={{ color: action.color, fontVariationSettings: "'FILL' 1" }}>{action.icon}</span>
                </div>
                <span className="text-[9px] font-bold text-on-surface-variant group-hover:text-white transition-colors text-center leading-tight">{action.label}</span>
              </motion.a>
            ))}
          </div>
        </div>

        {/* ── Input ───────────────────────────────────────────────── */}
        <div className="flex items-end gap-3 mt-2">
          <div className="flex-1">
            <KesariChatInput
              value={inputVal}
              onChange={setInputVal}
              onSubmit={handleSubmit}
              disabled={isTyping}
              placeholder={isTyping ? 'Kesari is thinking…' : 'Ask anything — exams, focus, plans…'}
            />
          </div>
          <KesariSendButton onClick={handleSubmit} disabled={!inputVal.trim() || isTyping} />
        </div>

      </div>
    </PageWrapper>
  )
}
