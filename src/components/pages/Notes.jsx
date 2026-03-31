import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '../layout/PageWrapper'
import useAppStore from '../../store/useAppStore'
import { useAuth } from '../../lib/auth'
import { notesService } from '../../lib/api'
import { SkeletonCard, SkeletonText } from '../ui/Skeleton'

const NOTE_COLORS = [
  { id: 'default', bg: 'bg-white/3', border: 'border-white/8', label: 'Default' },
  { id: 'emerald', bg: 'bg-primary/8', border: 'border-primary/25', label: 'Emerald' },
  { id: 'blue', bg: 'bg-blue-500/8', border: 'border-blue-500/25', label: 'Blue' },
  { id: 'purple', bg: 'bg-purple-500/8', border: 'border-purple-500/25', label: 'Purple' },
  { id: 'amber', bg: 'bg-amber-500/8', border: 'border-amber-500/25', label: 'Amber' },
  { id: 'rose', bg: 'bg-rose-500/8', border: 'border-rose-500/25', label: 'Rose' },
]

const TAG_COLORS = [
  'bg-primary/15 text-primary border-primary/20',
  'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'bg-purple-500/15 text-purple-400 border-purple-500/20',
  'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'bg-rose-500/15 text-rose-400 border-rose-500/20',
]

function getTagColor(tag) {
  const idx = Math.abs(tag.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % TAG_COLORS.length
  return TAG_COLORS[idx]
}

function getColorConfig(id) {
  return NOTE_COLORS.find((c) => c.id === id) || NOTE_COLORS[0]
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function NoteCard({ note, isActive, onClick }) {
  const cc = getColorConfig(note.color)
  const preview = note.content.replace(/\n/g, ' ').slice(0, 80)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className={`group relative rounded-2xl p-4 border cursor-pointer transition-all duration-200 ${cc.bg} ${
        isActive ? 'border-primary/50 shadow-[0_0_16px_rgba(74,225,118,0.15)]' : `${cc.border} hover:border-white/20`
      }`}
    >
      {note.is_pinned && (
        <span className="absolute top-3 right-3 material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
          push_pin
        </span>
      )}
      <h3 className="font-black text-white text-sm mb-1 pr-5 truncate">{note.title || 'Untitled'}</h3>
      {preview && (
        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 mb-2">{preview}</p>
      )}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {note.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${getTagColor(tag)}`}>
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="text-[10px] text-on-surface-variant/50 font-mono uppercase tracking-widest">{timeAgo(note.updated_at)}</p>
    </motion.div>
  )
}

function NoteEditor({ note, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [tags, setTags] = useState(note?.tags || [])
  const [folder, setFolder] = useState(note?.folder || 'General')
  const [tagInput, setTagInput] = useState('')
  const [isPinned, setIsPinned] = useState(note?.is_pinned || false)
  const [color, setColor] = useState(note?.color || 'default')
  const [saving, setSaving] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const saveTimeout = useRef(null)

  // Auto-save debounce
  const scheduleAutoSave = useCallback(() => {
    clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      handleSave(false)
    }, 1500)
  }, [title, content, tags, folder, isPinned, color])

  useEffect(() => {
    if (note) scheduleAutoSave()
    return () => clearTimeout(saveTimeout.current)
  }, [title, content, tags, folder, isPinned, color])

  useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setContent(note.content || '')
      setTags(note.tags || [])
      setFolder(note.folder || 'General')
      setIsPinned(note.is_pinned || false)
      setColor(note.color || 'default')
    }
  }, [note?.id])

  const handleSave = async (showFeedback = true) => {
    if (!note) return
    if (showFeedback) setSaving(true)
    const updates = { title: title || 'Untitled', content, tags, folder, is_pinned: isPinned, color }
    await onSave(note.id, updates)
    if (showFeedback) setTimeout(() => setSaving(false), 600)
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
    }
    setTagInput('')
  }

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag))

  const cc = getColorConfig(color)

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 rounded-3xl border border-white/5 bg-white/3 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">edit_note</span>
        </div>
        <p className="text-on-surface-variant font-medium">Select a note or create one</p>
      </div>
    )
  }

  return (
    <div className={`flex-1 flex flex-col min-h-0 rounded-2xl border ${cc.bg} ${cc.border} overflow-hidden`}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 flex-shrink-0">
        <button
          onClick={() => setIsPinned(!isPinned)}
          title="Pin note"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isPinned ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-white hover:bg-white/5'}`}
        >
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: `'FILL' ${isPinned ? 1 : 0}` }}>push_pin</span>
        </button>

        {/* Color picker toggle */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/5 transition-colors"
            title="Note color"
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>palette</span>
          </button>
          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-10 left-0 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 flex gap-1.5 z-10 shadow-xl"
              >
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setColor(c.id); setShowColorPicker(false) }}
                    title={c.label}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${c.bg} ${color === c.id ? 'border-white scale-125' : 'border-white/20 hover:scale-110'}`}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1" />

        {/* Folder */}
        <input
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          placeholder="Folder"
          className="bg-white/5 border border-white/8 rounded-lg px-3 py-1 text-xs text-on-surface-variant focus:outline-none focus:border-primary/40 w-28 transition-colors"
        />

        {/* Save indicator */}
        <motion.button
          onClick={() => handleSave(true)}
          disabled={saving}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
            saving ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-sm">{saving ? 'check_circle' : 'save'}</span>
          {saving ? 'Saved' : 'Save'}
        </motion.button>

        <button
          onClick={() => onDelete(note.id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Delete note"
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/5 transition-colors md:hidden"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      {/* Title */}
      <div className="px-6 pt-5 pb-2 flex-shrink-0">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title…"
          className="w-full bg-transparent text-white text-2xl font-black tracking-tight placeholder:text-white/20 focus:outline-none"
        />
      </div>

      {/* Tags */}
      <div className="px-6 pb-3 flex flex-wrap gap-1.5 items-center flex-shrink-0">
        {tags.map((tag) => (
          <span key={tag} className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${getTagColor(tag)}`}>
            {tag}
            <button onClick={() => removeTag(tag)} className="opacity-60 hover:opacity-100 ml-0.5">×</button>
          </span>
        ))}
        <div className="flex items-center gap-1">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
            placeholder="+ tag"
            className="bg-transparent text-[10px] text-on-surface-variant placeholder:text-white/20 focus:outline-none w-16 focus:w-24 transition-all"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-white/5 flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing…&#10;&#10;Use plain text, markdown hints work too: **bold**, `code`, ## heading"
          className="note-editor"
          style={{ height: '100%' }}
        />
      </div>
    </div>
  )
}

export default function Notes() {
  const { user: authUser } = useAuth()
  const { notes, setNotes, addNote, updateNote: updateNoteStore, removeNote, activeNoteId, setActiveNoteId } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('All')
  const [selectedTag, setSelectedTag] = useState(null)
  const [showEditor, setShowEditor] = useState(false)

  useEffect(() => {
    if (!authUser?.id) return
    const load = async () => {
      setLoading(true)
      const { data } = await notesService.getNotes(authUser.id)
      if (data) setNotes(data)
      setLoading(false)
    }
    load()
  }, [authUser?.id])

  const activeNote = notes.find((n) => n.id === activeNoteId) || null

  const folders = ['All', ...Array.from(new Set(notes.map((n) => n.folder).filter(Boolean)))]
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])))

  const filteredNotes = notes.filter((n) => {
    if (selectedFolder !== 'All' && n.folder !== selectedFolder) return false
    if (selectedTag && !n.tags?.includes(selectedTag)) return false
    if (search) {
      const q = search.toLowerCase()
      return n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q)
    }
    return true
  })

  const pinned = filteredNotes.filter((n) => n.is_pinned)
  const unpinned = filteredNotes.filter((n) => !n.is_pinned)

  const handleCreate = async () => {
    const { data } = await notesService.createNote(authUser.id, {
      title: '',
      content: '',
      folder: selectedFolder === 'All' ? 'General' : selectedFolder,
      tags: [],
      color: 'default',
    })
    if (data) {
      addNote(data)
      setActiveNoteId(data.id)
      setShowEditor(true)
    }
  }

  const handleSave = async (id, updates) => {
    updateNoteStore(id, updates)
    await notesService.updateNote(id, updates)
  }

  const handleDelete = async (id) => {
    removeNote(id)
    await notesService.deleteNote(id)
    if (activeNoteId === id) {
      setActiveNoteId(notes.find((n) => n.id !== id)?.id || null)
      setShowEditor(false)
    }
  }

  const handleNoteClick = (id) => {
    setActiveNoteId(id)
    setShowEditor(true)
  }

  return (
    <PageWrapper>
      <div className="flex flex-col h-full gap-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between"
        >
          <div>
            <h1 className="text-5xl md:text-6xl font-headline font-black tracking-tighter text-white mb-2">
              Notes<span className="text-primary">.</span>
            </h1>
            <p className="text-on-surface-variant font-medium">
              <span className="text-primary/80">{notes.length} notes</span> across {folders.length - 1} folders
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-primary to-primary-container text-[#003915] font-black rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow text-sm"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Note
          </motion.button>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }} className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="w-full bg-white/5 border border-white/8 hover:border-white/15 focus:border-primary/40 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </motion.div>

        <div className="flex gap-6 flex-1 min-h-0">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
            className="hidden md:flex flex-col gap-4 w-52 flex-shrink-0"
          >
            {/* Folders */}
            <div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2 px-2">Folders</p>
              <div className="space-y-0.5">
                {folders.map((folder) => (
                  <button
                    key={folder}
                    onClick={() => setSelectedFolder(folder)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                      selectedFolder === folder
                        ? 'bg-primary/15 text-primary'
                        : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: `'FILL' ${selectedFolder === folder ? 1 : 0}` }}>
                      {folder === 'All' ? 'folder_open' : 'folder'}
                    </span>
                    <span className="truncate">{folder}</span>
                    <span className="ml-auto text-xs font-mono opacity-50">
                      {folder === 'All' ? notes.length : notes.filter((n) => n.folder === folder).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2 px-2">Tags</p>
                <div className="flex flex-wrap gap-1.5 px-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`text-[10px] font-black px-2 py-1 rounded-full border uppercase tracking-wider transition-all ${
                        selectedTag === tag ? getTagColor(tag) : 'border-white/10 text-on-surface-variant hover:border-white/25'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Notes List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.15 } }}
            className={`flex flex-col gap-3 overflow-y-auto min-h-0 flex-shrink-0 ${showEditor ? 'hidden md:flex w-72' : 'flex-1'}`}
          >
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <SkeletonCard key={i} className="p-4 min-h-[100px]">
                  <SkeletonText lines={1} className="w-36 mb-2" />
                  <SkeletonText lines={2} className="w-full" />
                </SkeletonCard>
              ))
            ) : filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <div className="w-16 h-16 rounded-2xl border border-white/5 bg-white/3 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">sticky_note_2</span>
                </div>
                <div>
                  <p className="font-black text-on-surface text-lg">{search ? 'No matches' : 'No notes yet'}</p>
                  <p className="text-sm text-on-surface-variant mt-1">{search ? 'Try a different search' : 'Create your first note above'}</p>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {pinned.length > 0 && (
                  <>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Pinned</p>
                    {pinned.map((note) => (
                      <NoteCard key={note.id} note={note} isActive={note.id === activeNoteId} onClick={() => handleNoteClick(note.id)} />
                    ))}
                    {unpinned.length > 0 && <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1 pt-2">All Notes</p>}
                  </>
                )}
                {unpinned.map((note) => (
                  <NoteCard key={note.id} note={note} isActive={note.id === activeNoteId} onClick={() => handleNoteClick(note.id)} />
                ))}
              </AnimatePresence>
            )}
          </motion.div>

          {/* Note Editor */}
          <AnimatePresence>
            {showEditor && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 min-h-0 flex"
              >
                <NoteEditor
                  note={activeNote}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onClose={() => { setShowEditor(false); setActiveNoteId(null) }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  )
}
