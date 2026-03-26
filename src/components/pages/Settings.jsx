import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import PageWrapper from '../layout/PageWrapper'
import useAppStore from '../../store/useAppStore'
import { useAuth } from '../../lib/auth'
import { profileService, settingsService } from '../../lib/api'
import Avatar from '../ui/Avatar'

const stagger = { animate: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const NAV_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: 'person' },
  { id: 'focus', label: 'Focus & Blocking', icon: 'lock_open' },
  { id: 'appearance', label: 'Appearance', icon: 'palette' },
  { id: 'privacy', label: 'Privacy & Data', icon: 'security' },
]

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${checked ? 'bg-primary' : 'bg-surface-container-highest'}`}
    >
      <motion.div
        animate={{ x: checked ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
      />
    </button>
  )
}

function SettingRow({ label, desc, value, onChange, type = 'toggle' }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-outline-variant/10 last:border-0">
      <div className="space-y-0.5">
        <div className="font-semibold text-on-surface text-sm">{label}</div>
        {desc && <div className="text-xs text-on-surface-variant">{desc}</div>}
      </div>
      {type === 'toggle' && <Toggle checked={value} onChange={onChange} />}
      {type === 'number' && (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 bg-surface-container-highest border border-outline-variant/20 rounded-xl px-3 py-1.5 text-on-surface text-sm text-center font-mono focus:outline-none focus:border-primary/50"
        />
      )}
    </div>
  )
}

export default function Settings() {
  const { user: authUser, signOut } = useAuth()
  const { user, setUser, settings, updateSettings, setSettingsFromDB } = useAppStore()
  const [activeSection, setActiveSection] = useState('profile')
  const [nameEdit, setNameEdit] = useState(user.name)
  const [newSite, setNewSite] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)
  const syncTimer = useRef(null)

  // Load settings from DB on mount
  useEffect(() => {
    if (!authUser?.id) return
    settingsService.getSettings(authUser.id).then(({ data }) => {
      if (data) setSettingsFromDB(data)
    })
  }, [authUser?.id])

  // Clear debounce timer on unmount to prevent setState on unmounted component
  useEffect(() => {
    return () => { clearTimeout(syncTimer.current) }
  }, [])

  // Debounced sync: whenever settings change, save to DB after 800ms
  const syncSettings = useCallback((updates) => {
    const merged = { ...settings, ...updates }
    updateSettings(updates)
    clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      if (!authUser?.id) return
      settingsService.upsertSettings(authUser.id, {
        pomodoro_length: merged.pomodoroLength,
        break_length: merged.breakLength,
        focus_goal: merged.focusGoal,
        auto_break: merged.autoBreak,
        sound_enabled: merged.soundEnabled,
        notifications: merged.notifications,
        theme: merged.theme,
        blocked_sites: merged.blockingSites,
      })
    }, 800)
  }, [authUser?.id, settings, updateSettings])

  const handleSaveName = async () => {
    if (!nameEdit.trim() || !authUser?.id) return
    setSavingName(true)
    const { data } = await profileService.updateProfile(authUser.id, { name: nameEdit.trim() })
    if (data) {
      setUser({ name: nameEdit.trim() })
      setNameSuccess(true)
      setTimeout(() => setNameSuccess(false), 2000)
    }
    setSavingName(false)
  }

  const handleAddSite = () => {
    if (newSite.trim()) {
      syncSettings({ blockingSites: [...settings.blockingSites, newSite.trim()] })
      setNewSite('')
    }
  }

  const handleRemoveSite = (site) => {
    syncSettings({ blockingSites: settings.blockingSites.filter((s) => s !== site) })
  }

  return (
    <PageWrapper>
      <motion.div variants={stagger} initial="initial" animate="animate" className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div variants={fadeUp} className="mb-10">
          <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tight mb-2">Settings</h1>
          <p className="text-on-surface-variant">Customize your sanctuary for maximum cognitive performance.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* Sidebar Nav */}
          <motion.div variants={fadeUp} className="md:col-span-4">
            <nav className="flex flex-col gap-1 sticky top-28">
              {NAV_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeSection === s.id
                      ? 'bg-surface-container-high text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl" style={activeSection === s.id ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {s.icon}
                  </span>
                  {s.label}
                </button>
              ))}

              <button
                onClick={signOut}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-400 hover:bg-red-900/10 transition-all mt-4"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                Sign Out
              </button>
            </nav>
          </motion.div>

          {/* Content Area */}
          <motion.div variants={fadeUp} className="md:col-span-8 space-y-8">

            {activeSection === 'profile' && (
              <section className="space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 px-2">
                  Account Information
                </h2>
                <div className="glass-panel p-6 rounded-2xl space-y-6 border border-outline-variant/10">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar name={user.name} size="xl" border />
                    </div>
                    <div>
                      <p className="font-headline font-bold text-xl text-on-surface">{user.name}</p>
                      <p className="text-sm text-on-surface-variant">{user.streak} day streak · {user.totalXp?.toLocaleString() ?? 0} XP</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Display Name</label>
                      <div className="flex gap-2">
                        <input
                          value={nameEdit}
                          onChange={(e) => setNameEdit(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                          className="flex-1 bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50"
                        />
                        <button
                          onClick={handleSaveName}
                          disabled={savingName}
                          className={`px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                            nameSuccess
                              ? 'bg-primary/20 text-primary'
                              : 'bg-primary/10 text-primary hover:bg-primary/20'
                          } disabled:opacity-60`}
                        >
                          {savingName ? '…' : nameSuccess ? '✓ Saved' : 'Save'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Email</label>
                      <input
                        defaultValue={authUser?.email ?? ''}
                        className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface opacity-60 cursor-not-allowed"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'focus' && (
              <section className="space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 px-2">
                  Focus & Blocking
                </h2>
                <div className="glass-panel p-6 rounded-2xl border border-outline-variant/10">
                  <h3 className="font-bold text-on-surface mb-4">Timer Settings</h3>
                  <SettingRow
                    label="Pomodoro Length (minutes)"
                    desc="Duration of each focus block"
                    value={settings.pomodoroLength}
                    onChange={(v) => syncSettings({ pomodoroLength: v })}
                    type="number"
                  />
                  <SettingRow
                    label="Break Length (minutes)"
                    desc="Short break between sessions"
                    value={settings.breakLength}
                    onChange={(v) => syncSettings({ breakLength: v })}
                    type="number"
                  />
                  <SettingRow
                    label="Auto-start Breaks"
                    desc="Automatically begin break timer"
                    value={settings.autoBreak}
                    onChange={(v) => syncSettings({ autoBreak: v })}
                  />
                  <SettingRow
                    label="Focus Sounds"
                    desc="Play ambient audio during sessions"
                    value={settings.soundEnabled}
                    onChange={(v) => syncSettings({ soundEnabled: v })}
                  />
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-outline-variant/10">
                  <h3 className="font-bold text-on-surface mb-2">Blocked Sites</h3>
                  <p className="text-xs text-on-surface-variant mb-4">These sites will be blocked during focus sessions.</p>
                  <div className="flex gap-2 mb-4">
                    <input
                      value={newSite}
                      onChange={(e) => setNewSite(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSite()}
                      placeholder="e.g. youtube.com"
                      className="flex-1 bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50"
                    />
                    <button onClick={handleAddSite}
                      className="px-4 py-2.5 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">add</span> Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {settings.blockingSites.map((site) => (
                      <div key={site} className="flex items-center justify-between bg-surface-container-highest px-4 py-2.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-on-surface-variant">block</span>
                          <span className="text-sm font-mono text-on-surface">{site}</span>
                        </div>
                        <button onClick={() => handleRemoveSite(site)} className="text-on-surface-variant hover:text-red-400 transition-colors">
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'appearance' && (
              <section className="space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 px-2">Appearance</h2>
                <div className="glass-panel p-6 rounded-2xl border border-outline-variant/10 space-y-4">
                  <h3 className="font-bold text-on-surface">Theme</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {['dark', 'deep', 'forest'].map((t) => (
                      <button key={t}
                        onClick={() => syncSettings({ theme: t })}
                        className={`p-4 rounded-xl border-2 transition-all ${settings.theme === t ? 'border-primary bg-primary/10' : 'border-outline-variant/20 bg-surface-container-high'}`}>
                        <div className={`w-full h-10 rounded-lg mb-2 ${t === 'dark' ? 'bg-black' : t === 'deep' ? 'bg-[#060e20]' : 'bg-[#001a0e]'}`} />
                        <span className="text-xs font-bold capitalize text-on-surface-variant">{t}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'privacy' && (
              <section className="space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 px-2">Privacy & Data</h2>
                <div className="glass-panel p-6 rounded-2xl border border-outline-variant/10">
                  <SettingRow
                    label="Push Notifications"
                    desc="Session reminders and streak alerts"
                    value={settings.notifications}
                    onChange={(v) => syncSettings({ notifications: v })}
                  />
                  <SettingRow label="Show on Leaderboard" desc="Let others see your focus stats" value={true} onChange={() => {}} />
                  <SettingRow label="Analytics Sharing" desc="Help improve Kesari AI with your data" value={false} onChange={() => {}} />
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-red-900/20">
                  <h3 className="font-bold text-red-400 mb-2">Danger Zone</h3>
                  <p className="text-xs text-on-surface-variant mb-4">These actions are irreversible.</p>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-red-900/20 text-red-400 text-sm font-bold rounded-xl border border-red-900/20 hover:bg-red-900/30 transition-colors">
                      Export Data
                    </button>
                    <button className="px-4 py-2 bg-red-900/20 text-red-400 text-sm font-bold rounded-xl border border-red-900/20 hover:bg-red-900/30 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </section>
            )}

          </motion.div>
        </div>
      </motion.div>
    </PageWrapper>
  )
}
