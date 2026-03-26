import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './lib/auth'
import Auth from './components/pages/Auth'
import SplashLoader from './components/ui/SplashLoader'
import PageLoader from './components/ui/PageLoader'

const Dashboard  = lazy(() => import('./components/pages/Dashboard'))
const Focus      = lazy(() => import('./components/pages/Focus'))
const Kesari     = lazy(() => import('./components/pages/Kesari'))
const Analytics  = lazy(() => import('./components/pages/Analytics'))
const Scheduler  = lazy(() => import('./components/pages/Scheduler'))
const Leaderboard = lazy(() => import('./components/pages/Leaderboard'))
const Settings   = lazy(() => import('./components/pages/Settings'))

function AnimatedRoutes() {
  const location = useLocation()
  const { user, loading } = useAuth()

  return (
    <>
      <SplashLoader isLoading={loading} />

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
