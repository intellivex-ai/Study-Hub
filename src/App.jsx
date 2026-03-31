import { lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './lib/auth'
import Auth from './components/pages/Auth'
import SplashLoader from './components/ui/SplashLoader'
import PageLoader from './components/ui/PageLoader'
import XPToast from './components/ui/XPToast'
import useAppStore from './store/useAppStore'
import AppBlocker from './lib/appBlocker'
import { Capacitor } from '@capacitor/core'

const Dashboard   = lazy(() => import('./components/pages/Dashboard'))
const Focus       = lazy(() => import('./components/pages/Focus'))
const Kesari      = lazy(() => import('./components/pages/Kesari'))
const Analytics   = lazy(() => import('./components/pages/Analytics'))
const Scheduler   = lazy(() => import('./components/pages/Scheduler'))
const Leaderboard = lazy(() => import('./components/pages/Leaderboard'))
const Settings    = lazy(() => import('./components/pages/Settings'))
const Notes       = lazy(() => import('./components/pages/Notes'))
const Flashcards  = lazy(() => import('./components/pages/Flashcards'))
const Achievements = lazy(() => import('./components/pages/Achievements'))

function AnimatedRoutes() {
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()
  const [minLoadingDone, setMinLoadingDone] = useState(false)
  const timerRunning = useAppStore(s => s.timerRunning)

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      AppBlocker.setBlockingActive({ active: timerRunning }).catch(console.error)
    }
  }, [timerRunning])

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingDone(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const loading = authLoading || !minLoadingDone

  return (
    <>
      <SplashLoader isLoading={loading} />
      <XPToast />

      {!loading && !user && <Auth />}

      {!loading && user && (
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/focus" element={<Focus />} />
              <Route path="/kesari" element={<Kesari />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/scheduler" element={<Scheduler />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      )}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
