import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '../layout/PageWrapper'
import useAppStore from '../../store/useAppStore'
import { useAuth } from '../../lib/auth'
import { flashcardsService } from '../../lib/api'
import { sm2 } from '../../lib/constants'
import Modal from '../ui/Modal'
import { SkeletonCard, SkeletonText } from '../ui/Skeleton'

const SUBJECT_COLORS = {
  Mathematics: '#4AE176',
  Physics: '#60a5fa',
  Chemistry: '#f97316',
  Biology: '#a78bfa',
  History: '#fbbf24',
  English: '#f472b6',
  Computer: '#38bdf8',
  General: '#94a3b8',
}
function getSubjectColor(subject) {
  return SUBJECT_COLORS[subject] || '#94a3b8'
}

// ── FlashCard 3D Flip Component ──────────────────────────────────────────────
function FlashCard({ front, back }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="perspective w-full max-w-lg mx-auto" style={{ height: 280 }}>
      <div
        className={`flip-card w-full h-full relative cursor-pointer ${flipped ? 'flipped' : ''}`}
        onClick={() => setFlipped(!flipped)}
      >
        {/* Front */}
        <div className="flip-front absolute inset-0 flex flex-col items-center justify-center p-8 rounded-3xl border border-white/10 bg-surface-container-low/60 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-4 right-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50">Front</div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[10px] text-on-surface-variant/50">
            <span className="material-symbols-outlined text-sm">touch_app</span>
            <span className="uppercase tracking-widest font-bold">Tap to reveal</span>
          </div>
          <p className="text-xl font-black text-white text-center leading-relaxed">{front}</p>
        </div>

        {/* Back */}
        <div className="flip-back absolute inset-0 flex flex-col items-center justify-center p-8 rounded-3xl border border-primary/30 bg-primary/8 backdrop-blur-xl shadow-2xl shadow-primary/10">
          <div
            className="absolute inset-0 rounded-3xl opacity-30"
            style={{ background: 'radial-gradient(circle at center, rgba(74,225,118,0.15), transparent 70%)' }}
          />
          <div className="absolute top-4 right-4 text-[10px] font-black text-primary/60 uppercase tracking-widest">Answer</div>
          <p className="text-lg font-bold text-white text-center leading-relaxed relative z-10">{back}</p>
        </div>
      </div>
    </div>
  )
}

// ── Review Session ────────────────────────────────────────────────────────────
function ReviewSession({ cards, deckName, onFinish }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [results, setResults] = useState([]) // { card, rating, newData }
  const [done, setDone] = useState(false)

  const card = cards[currentIdx]

  const handleRate = useCallback(async (rating) => {
    if (!card) return
    const newData = sm2(card, rating)
    await flashcardsService.updateCard(card.id, newData)

    const newResults = [...results, { card, rating, newData }]
    setResults(newResults)

    if (currentIdx + 1 >= cards.length) {
      setDone(true)
    } else {
      setCurrentIdx(currentIdx + 1)
    }
  }, [card, currentIdx, results])

  const RATING_BUTTONS = [
    { rating: 0, label: 'Forgot', icon: 'close', color: 'bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25' },
    { rating: 1, label: 'Hard', icon: 'sentiment_dissatisfied', color: 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25' },
    { rating: 2, label: 'Good', icon: 'thumb_up', color: 'bg-blue-500/15 border-blue-500/30 text-blue-400 hover:bg-blue-500/25' },
    { rating: 3, label: 'Easy', icon: 'sentiment_satisfied', color: 'bg-primary/15 border-primary/30 text-primary hover:bg-primary/25' },
  ]

  const masteredCount = results.filter((r) => r.rating >= 2).length

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-8 py-10 text-center"
      >
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
          <div className="absolute -inset-2 rounded-full border border-primary/20 animate-ping opacity-20" />
        </div>
        <div>
          <h2 className="text-3xl font-headline font-black text-white tracking-tighter">Session Complete!</h2>
          <p className="text-on-surface-variant mt-2">
            <span className="text-primary font-bold">{masteredCount}/{cards.length}</span> cards mastered
          </p>
        </div>
        <div className="flex gap-2">
          {results.map((r, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${r.rating >= 2 ? 'bg-primary' : r.rating === 1 ? 'bg-amber-400' : 'bg-rose-400'}`}
            />
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onFinish}
          className="px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-[#003915] font-black rounded-2xl shadow-lg shadow-primary/20"
        >
          Done
        </motion.button>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full"
            animate={{ width: `${((currentIdx) / cards.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-xs font-mono font-black text-on-surface-variant">{currentIdx + 1}/{cards.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          <FlashCard front={card.front} back={card.back} />
        </motion.div>
      </AnimatePresence>

      {/* Rating buttons */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        {RATING_BUTTONS.map(({ rating, label, icon, color }) => (
          <motion.button
            key={rating}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleRate(rating)}
            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border font-bold text-xs transition-all duration-200 ${color}`}
          >
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            {label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── Deck Card ─────────────────────────────────────────────────────────────────
function DeckCard({ deck, onStudy, onDelete, dueCount }) {
  const color = getSubjectColor(deck.subject)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      className="group relative bg-surface-container-low/40 backdrop-blur-xl border border-white/8 hover:border-white/20 rounded-2xl p-5 overflow-hidden transition-all duration-300"
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(to right, transparent, ${color}, transparent)` }}
      />
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          <span className="material-symbols-outlined text-2xl" style={{ color, fontVariationSettings: "'FILL' 1" }}>style</span>
        </div>
        {dueCount > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/25 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 text-[10px] font-black uppercase tracking-widest">{dueCount} due</span>
          </div>
        )}
      </div>
      <h3 className="font-headline font-black text-white text-lg tracking-tight mb-0.5">{deck.name}</h3>
      <p className="text-xs text-on-surface-variant mb-4">{deck.subject} · {deck.card_count} cards</p>
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onStudy(deck)}
          className="flex-1 py-2.5 bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-black text-sm rounded-xl border border-primary/25 hover:border-primary/50 transition-all flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          Study
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onDelete(deck.id)}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/5 text-on-surface-variant hover:text-rose-400 hover:border-rose-500/25 transition-all"
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </motion.button>
      </div>
    </motion.div>
  )
}

// ── Add Card Modal ────────────────────────────────────────────────────────────
function AddCardModal({ deck, onClose, onAdd }) {
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [loading, setLoading] = useState(false)
  const { user: authUser } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!front.trim() || !back.trim()) return
    setLoading(true)
    await onAdd(deck.id, authUser.id, front, back)
    setFront('')
    setBack('')
    setLoading(false)
    onClose()
  }

  const inputClass = "w-full bg-white/5 border border-white/8 hover:border-primary/30 focus:border-primary/50 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-all text-sm"

  return (
    <Modal open onClose={onClose} title={`Add Card — ${deck.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Front (Question)</label>
          <textarea rows={3} value={front} onChange={(e) => setFront(e.target.value)} placeholder="What is Newton's 2nd Law?" className={`${inputClass} resize-none`} autoFocus />
        </div>
        <div>
          <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Back (Answer)</label>
          <textarea rows={3} value={back} onChange={(e) => setBack(e.target.value)} placeholder="F = ma — Force equals mass times acceleration." className={`${inputClass} resize-none`} />
        </div>
        <motion.button type="submit" disabled={loading || !front.trim() || !back.trim()} whileTap={{ scale: 0.97 }}
          className="w-full py-3.5 bg-gradient-to-br from-primary to-primary-container text-[#003915] font-black rounded-xl disabled:opacity-50 shadow-lg shadow-primary/20">
          {loading ? 'Adding…' : '+ Add Card'}
        </motion.button>
      </form>
    </Modal>
  )
}

// ── Main Flashcards Page ──────────────────────────────────────────────────────
export default function Flashcards() {
  const { user: authUser } = useAuth()
  const { flashcardDecks, setFlashcardDecks, addFlashcardDeck, removeFlashcardDeck, dueCardsCount, setDueCardsCount } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [showNewDeck, setShowNewDeck] = useState(false)
  const [activeDeck, setActiveDeck] = useState(null) // deck being studied
  const [addingCards, setAddingCards] = useState(null) // deck to add card to
  const [deckCards, setDeckCards] = useState([]) // cards for current review session
  const [dueCards, setDueCards] = useState([])
  const [newDeckForm, setNewDeckForm] = useState({ name: '', subject: 'General' })

  useEffect(() => {
    if (!authUser?.id) return
    const load = async () => {
      setLoading(true)
      const { data: decks } = await flashcardsService.getDecks(authUser.id)
      if (decks) setFlashcardDecks(decks)
      const { data: due } = await flashcardsService.getDueCards(authUser.id)
      if (due) { setDueCards(due); setDueCardsCount(due.length) }
      setLoading(false)
    }
    load()
  }, [authUser?.id])

  const handleCreateDeck = async (e) => {
    e.preventDefault()
    if (!newDeckForm.name.trim()) return
    const { data } = await flashcardsService.createDeck(authUser.id, newDeckForm)
    if (data) addFlashcardDeck(data)
    setNewDeckForm({ name: '', subject: 'General' })
    setShowNewDeck(false)
  }

  const handleDeleteDeck = async (id) => {
    removeFlashcardDeck(id)
    await flashcardsService.deleteDeck(id)
  }

  const handleStudy = async (deck) => {
    const { data: cards } = await flashcardsService.getCards(deck.id)
    if (cards && cards.length > 0) {
      setDeckCards(cards)
      setActiveDeck(deck)
    }
  }

  const handleStudyDue = () => {
    setDeckCards(dueCards)
    setActiveDeck({ name: 'Due Cards' })
  }

  const handleAddCard = async (deckId, userId, front, back) => {
    await flashcardsService.createCard(deckId, userId, front, back)
    // refresh deck
    const { data: decks } = await flashcardsService.getDecks(userId)
    if (decks) setFlashcardDecks(decks)
  }

  const SUBJECTS = ['General', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'English', 'Computer']

  if (activeDeck) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => { setActiveDeck(null); setDeckCards([]) }}
              className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-white hover:border-white/25 transition-all"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="text-2xl font-headline font-black text-white tracking-tight">{activeDeck.name}</h1>
              <p className="text-xs text-on-surface-variant">{deckCards.length} cards in this session</p>
            </div>
          </div>
          <ReviewSession cards={deckCards} deckName={activeDeck.name} onFinish={() => { setActiveDeck(null); setDeckCards([]) }} />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-5xl md:text-6xl font-headline font-black tracking-tighter text-white mb-2">
              Flashcards<span className="text-primary">.</span>
            </h1>
            <p className="text-on-surface-variant font-medium">
              <span className="text-primary/80">{flashcardDecks.length} decks</span> · spaced repetition engine
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowNewDeck(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-primary to-primary-container text-[#003915] font-black rounded-2xl shadow-lg shadow-primary/20 text-sm"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Deck
          </motion.button>
        </div>

        {/* Due Cards Banner */}
        {dueCardsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/8 p-5 flex items-center justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-400 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>notification_important</span>
              </div>
              <div>
                <p className="font-black text-white text-lg">{dueCardsCount} cards due for review</p>
                <p className="text-xs text-amber-400/80">Review now to strengthen your memory</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleStudyDue}
              className="px-5 py-2.5 bg-amber-500/20 text-amber-400 font-black text-sm rounded-xl border border-amber-500/30 hover:bg-amber-500/30 transition-all"
            >
              Review Now →
            </motion.button>
          </motion.div>
        )}

        {/* Decks Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} className="p-5 min-h-[200px]" />
            ))}
          </div>
        ) : flashcardDecks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-20 h-20 rounded-3xl border border-white/5 bg-white/3 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">style</span>
            </div>
            <p className="font-black text-on-surface text-xl">No decks yet.</p>
            <p className="text-sm text-on-surface-variant">Create your first deck to start memorizing smarter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {flashcardDecks.map((deck) => {
                const due = dueCards.filter((c) => c.deck_id === deck.id).length
                return (
                  <DeckCard key={deck.id} deck={deck} dueCount={due} onStudy={handleStudy} onDelete={handleDeleteDeck} />
                )
              })}
            </AnimatePresence>
            {/* Add card to last deck shortcut - deck cards done per deck */}
          </div>
        )}

        {/* New Deck Modal */}
        <AnimatePresence>
          {showNewDeck && (
            <Modal open onClose={() => setShowNewDeck(false)} title="Create New Deck">
              <form onSubmit={handleCreateDeck} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Deck Name *</label>
                  <input value={newDeckForm.name} onChange={(e) => setNewDeckForm({ ...newDeckForm, name: e.target.value })}
                    placeholder="e.g. Physics — Chapter 5"
                    className="w-full bg-white/5 border border-white/8 hover:border-primary/30 focus:border-primary/50 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none text-sm" autoFocus />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Subject</label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map((s) => (
                      <button
                        key={s} type="button"
                        onClick={() => setNewDeckForm({ ...newDeckForm, subject: s })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          newDeckForm.subject === s
                            ? 'bg-primary/20 text-primary border-primary/35'
                            : 'border-white/8 text-on-surface-variant hover:border-white/20'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <motion.button type="submit" whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 bg-gradient-to-br from-primary to-primary-container text-[#003915] font-black rounded-xl shadow-lg shadow-primary/20">
                  Create Deck
                </motion.button>
              </form>
            </Modal>
          )}
        </AnimatePresence>
      </motion.div>
    </PageWrapper>
  )
}
