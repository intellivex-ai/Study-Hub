import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import PageWrapper from '../layout/PageWrapper'
import useAppStore from '../../store/useAppStore'
import { useAuth } from '../../lib/auth'
import { profileService, settingsService } from '../../lib/api'
import Avatar from '../ui/Avatar'
import Switch from '../ui/Switch'
import PremiumCard from '../ui/PremiumCard'
import { Capacitor } from '@capacitor/core'
import AppBlocker from '../../lib/appBlocker'

const stagger = { animate: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const NAV_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: 'person' },
  { id: 'focus', label: 'Focus & Blocking', icon: 'lock_open' },
  { id: 'appearance', label: 'Appearance', icon: 'palette' },
  { id: 'privacy', label: 'Privacy & Data', icon: 'security' },
]

function SettingRow({ label, desc, value, onChange, type = 'toggle' }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-outline-variant/10 last:border-0">
      <div className="space-y-0.5">
        <div className="font-semibold text-on-surface text-sm">{label}</div>
        {desc && <div className="text-xs text-on-surface-variant">{desc}</div>}
      </div>
      {type === 'toggle' && <Switch checked={value} onChange={onChange} />}
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
  const [isDeleting, setIsDeleting] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)
  const syncTimer = useRef(null)

  const [nativeApps, setNativeApps] = useState([])
  const [devicePermissions, setDevicePermissions] = useState({ hasOverlay: false, hasAccessibility: false })
  const isNative = Capacitor.isNativePlatform()

  useEffect(() => {
    if (isNative) {
      AppBlocker.getInstalledApps().then(res => {
        if (res?.apps) setNativeApps(res.apps)
      }).catch(console.error)
      
      const checkPerms = () => {
        AppBlocker.checkPermissions().then(res => {
          if (res) setDevicePermissions(res)
        }).catch(console.error)
      }
      checkPerms()
      // Re-check when app comes to foreground
      document.addEventListener('visibilitychange', checkPerms)
      return () => document.removeEventListener('visibilitychange', checkPerms)
    }
  }, [isNative])

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
        blocked_apps: merged.blockedApps,
        show_on_leaderboard: merged.showOnLeaderboard,
        analytics_sharing: merged.analyticsSharing,
      })
      if (isNative && merged.blockedApps) {
        AppBlocker.setBlockedApps({ packages: merged.blockedApps }).catch(console.error)
      }
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

  const handleToggleApp = (pkgName) => {
    const current = settings.blockedApps || []
    const updated = current.includes(pkgName)
      ? current.filter(p => p !== pkgName)
      : [...current, pkgName]
    syncSettings({ blockedApps: updated })
  }

  const handleRequestAccessibility = () => AppBlocker.requestAccessibilityPermission()
  const handleRequestOverlay = () => AppBlocker.requestOverlayPermission()

  const handleDeleteAccount = async () => {
    if (!authUser?.id) return
    if (!window.confirm('Are you sure? This action is permanent and cannot be undone.')) return
    
    setIsDeleting(true)
    try {
      const { error } = await profileService.deleteAccount()
      if (error) throw error
      
      await signOut()
    } catch (err) {
      console.error('Failed to delete account:', err)
      alert('Failed to delete account. Please try again.')
      setIsDeleting(false)
    }
  }

  return (
    <PageWrapper>
      <motion.div variants={stagger} initial="initial" animate="animate" className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div variants={fadeUp} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-headline font-black tracking-tighter text-white mb-3">
            Settings<span className="text-primary">.</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl font-medium leading-relaxed">
            Configure your focus sanctuary for <span className="text-primary/80">peak performance</span>.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* Sidebar Nav */}
          <motion.div variants={fadeUp} className="md:col-span-4">
            <nav className="flex flex-col gap-2 sticky top-28 bg-surface-container-low/30 backdrop-blur-xl p-2 rounded-2xl border border-outline-variant/10 shadow-2xl">
              {NAV_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`group relative flex items-center gap-3 px-5 py-4 rounded-xl text-left transition-all duration-500 overflow-hidden ${
                    activeSection === s.id
                      ? 'text-on-primary font-bold shadow-lg shadow-primary/20'
                      : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                  }`}
                >
                  {/* Background Gradient for Active State */}
                  {activeSection === s.id && (
                    <motion.div
                      layoutId="sidebar-active-bg"
                      className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container z-0"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  {/* Hover Highlight (Non-active only) */}
                  {activeSection !== s.id && (
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary/0 group-hover:bg-primary/20 transition-all duration-300" />
                  )}

                  <span className={`material-symbols-outlined text-2xl relative z-10 transition-transform duration-500 ${
                    activeSection === s.id ? 'scale-110' : 'group-hover:scale-110 group-hover:text-primary'
                  }`} style={activeSection === s.id ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {s.icon}
                  </span>
                  <span className="relative z-10 tracking-tight">{s.label}</span>
                  
                  {/* Glow effect on active */}
                  {activeSection === s.id && (
                    <div className="absolute top-1/2 -right-2 w-4 h-4 bg-white/20 blur-md rounded-full" />
                  )}
                </button>
              ))}

              <div className="my-4 mx-4 h-px bg-outline-variant/10" />

              <button
                onClick={signOut}
                className="group flex items-center gap-3 px-5 py-4 rounded-xl text-left text-red-400 hover:bg-red-500/10 transition-all duration-300"
              >
                <span className="material-symbols-outlined text-2xl transition-transform group-hover:-translate-x-1">logout</span>
                <span className="font-semibold">Sign Out</span>
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
                <PremiumCard className="space-y-6">
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
                </PremiumCard>
              </section>
            )}

            {activeSection === 'focus' && (
              <section className="space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 px-2">
                  Focus & Blocking
                </h2>
                <PremiumCard>
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
                </PremiumCard>

                <PremiumCard>
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
                </PremiumCard>

                {isNative && (
                  <PremiumCard>
                    <h3 className="font-bold text-on-surface mb-2">Blocked Mobile Apps</h3>
                    <p className="text-xs text-on-surface-variant mb-4">Select the Android apps you want to block completely during focus sessions.</p>
                    
                    {(!devicePermissions.hasOverlay || !devicePermissions.hasAccessibility) && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                        <h4 className="text-amber-500 font-bold text-sm mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined">warning</span> Action Required
                        </h4>
                        <p className="text-xs text-amber-500/80 mb-3">Study Hub needs system permissions to lock you out of other apps.</p>
                        <div className="flex flex-col gap-2">
                          {!devicePermissions.hasAccessibility && (
                            <button onClick={handleRequestAccessibility} className="bg-amber-500/20 text-amber-500 px-4 py-2 rounded-lg text-xs font-bold text-left hover:bg-amber-500/30 transition-colors">
                              Enable Accessibility Service
                            </button>
                          )}
                          {!devicePermissions.hasOverlay && (
                            <button onClick={handleRequestOverlay} className="bg-amber-500/20 text-amber-500 px-4 py-2 rounded-lg text-xs font-bold text-left hover:bg-amber-500/30 transition-colors">
                              Allow Display Over Other Apps
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                      {nativeApps.length === 0 ? (
                        <p className="text-sm text-on-surface-variant text-center py-4">No blockable apps found.</p>
                      ) : (
                        nativeApps.map((app) => {
                          const isBlocked = (settings.blockedApps || []).includes(app.packageName);
                          return (
                            <div key={app.packageName} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${isBlocked ? 'bg-red-500/5 border-red-500/20' : 'bg-surface-container-highest border-transparent'}`}>
                              <div className="flex items-center gap-3">
                                {app.icon ? (
                                  <img src={app.icon} alt={app.name} className="w-8 h-8 rounded-lg" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm text-on-surface-variant">android</span>
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-bold text-on-surface">{app.name}</div>
                                  <div className="text-[10px] text-on-surface-variant font-mono truncate max-w-[150px]">{app.packageName}</div>
                                </div>
                              </div>
                              <Switch checked={isBlocked} onChange={() => handleToggleApp(app.packageName)} />
                            </div>
                          )
                        })
                      )}
                    </div>
                  </PremiumCard>
                )}
              </section>
            )}

            {activeSection === 'appearance' && (
              <section className="space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 px-2">Appearance</h2>
                <PremiumCard className="space-y-4">
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
                </PremiumCard>
              </section>
            )}

            {activeSection === 'privacy' && (
              <section className="space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 px-2">Privacy & Data</h2>
                <PremiumCard>
                  <SettingRow
                    label="Push Notifications"
                    desc="Session reminders and streak alerts"
                    value={settings.notifications}
                    onChange={(v) => syncSettings({ notifications: v })}
                  />
                  <SettingRow
                    label="Show on Leaderboard"
                    desc="Let others see your focus stats"
                    value={settings.showOnLeaderboard ?? true}
                    onChange={(v) => syncSettings({ showOnLeaderboard: v })}
                  />
                  <SettingRow
                    label="Analytics Sharing"
                    desc="Help improve Kesari AI with your data"
                    value={settings.analyticsSharing ?? false}
                    onChange={(v) => syncSettings({ analyticsSharing: v })}
                  />
                </PremiumCard>
                <PremiumCard variant="danger" className="mt-8">
                  <h3 className="font-bold text-red-500 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Danger Zone
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-6">These actions are irreversible and will permanently affect your data.</p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => {
                        const data = { user, settings }
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url; a.download = 'studyhub-data.json'; a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="px-6 py-2.5 bg-red-500/10 text-red-400 text-sm font-bold rounded-xl border border-red-500/20 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all duration-300"
                    >
                      Export Data
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="px-6 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-900/20 hover:bg-red-500 hover:shadow-red-500/40 transition-all duration-300 disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Deleting…
                        </span>
                      ) : 'Delete Account'}
                    </button>
                  </div>
                </PremiumCard>
              </section>
            )}

          </motion.div>
        </div>
      </motion.div>
    </PageWrapper>
  )
}
