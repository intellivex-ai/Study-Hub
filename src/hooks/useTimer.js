import { useEffect, useRef, useCallback } from 'react'
import useAppStore from '../store/useAppStore'
import { sessionsService } from '../lib/api'
import { useAuth } from '../lib/auth'

export function useTimer() {
  const { user: authUser } = useAuth()
  const {
    timerSeconds, timerRunning, timerMode, timerTask,
    setTimerSeconds, setTimerRunning, resetTimer,
    setTimerMode, setTimerTask,
    activeSessionId, sessionStartedAt, elapsedAtPause,
    setActiveSession, clearActiveSession, setElapsedAtPause,
    settings,
  } = useAppStore()

  const intervalRef = useRef(null)
  const sessionIdRef = useRef(activeSessionId)

  // Keep ref in sync so interval closure always has latest value
  useEffect(() => { sessionIdRef.current = activeSessionId }, [activeSessionId])

  // ── On mount: restore in-progress session from DB ──────────
  useEffect(() => {
    if (!authUser?.id || !activeSessionId) return
    const restoreSession = async () => {
      const { data } = await sessionsService.getActiveSession(authUser.id)
      if (data && data.id === activeSessionId) {
        // Session still active in DB — resume where we left off
        if (data.status === 'running' && sessionStartedAt) {
          const secondsElapsed = Math.floor(
            (Date.now() - new Date(sessionStartedAt).getTime()) / 1000
          ) + elapsedAtPause
          const totalDuration = timerMode === 'pomodoro'
            ? (settings.pomodoroLength * 60)
            : (90 * 60)
          const remaining = Math.max(0, totalDuration - secondsElapsed)
          setTimerSeconds(remaining)
          if (remaining > 0) setTimerRunning(true)
        }
      } else {
        // Session no longer active — clean up local state
        clearActiveSession()
      }
    }
    restoreSession()
    // Only run on mount — intentionally not including all deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Countdown interval ─────────────────────────────────────
  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        const current = useAppStore.getState().timerSeconds
        if (current <= 1) {
          clearInterval(intervalRef.current)
          // Auto-complete the session
          handleAutoComplete()
        } else {
          setTimerSeconds(Math.max(0, current - 1))
        }
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerRunning])

  // ── Auto-complete when timer hits 0 ───────────────────────
  const handleAutoComplete = useCallback(async () => {
    setTimerSeconds(0)
    setTimerRunning(false)
    const sid = sessionIdRef.current
    if (sid) {
      const totalDuration = timerMode === 'pomodoro'
        ? (settings.pomodoroLength * 60)
        : (90 * 60)
      await sessionsService.endSession(sid, totalDuration)
      clearActiveSession()
    }
  }, [timerMode, settings.pomodoroLength, setTimerRunning, setTimerSeconds, clearActiveSession])

  // ── Toggle (start / pause / resume) ───────────────────────
  const toggle = useCallback(async () => {
    const running = useAppStore.getState().timerRunning
    const sid = sessionIdRef.current

    if (!running) {
      // START or RESUME
      if (!sid) {
        // Brand new session
        if (authUser?.id) {
          const { data } = await sessionsService.startSession(
            authUser.id,
            timerMode,
            timerTask
          )
          if (data) {
            setActiveSession(data.id, new Date().toISOString())
          }
        }
      } else {
        // Resume a paused session
        if (authUser?.id) {
          await sessionsService.resumeSession(sid)
          setActiveSession(sid, new Date().toISOString())
        }
      }
      setTimerRunning(true)
    } else {
      // PAUSE
      const elapsed = useAppStore.getState().elapsedAtPause +
        Math.floor(
          (Date.now() - new Date(useAppStore.getState().sessionStartedAt).getTime()) / 1000
        )
      setElapsedAtPause(elapsed)
      if (sid && authUser?.id) {
        await sessionsService.pauseSession(sid)
      }
      setTimerRunning(false)
    }
  }, [authUser, timerMode, timerTask, setTimerRunning, setActiveSession, setElapsedAtPause])

  // ── Reset + abandon ────────────────────────────────────────
  const reset = useCallback(async () => {
    clearInterval(intervalRef.current)
    const sid = sessionIdRef.current
    if (sid && authUser?.id) {
      // Count elapsed seconds so far as focus time (partial credit)
      const totalDuration = timerMode === 'pomodoro'
        ? (settings.pomodoroLength * 60)
        : (90 * 60)
      const currentRemaining = useAppStore.getState().timerSeconds
      const elapsed = totalDuration - currentRemaining
      if (elapsed >= 60) {
        // Only save if at least 1 minute was focused
        await sessionsService.endSession(sid, elapsed)
      } else {
        await sessionsService.abandonSession(sid, elapsed)
      }
    }
    clearActiveSession()
    resetTimer()
  }, [authUser, timerMode, settings.pomodoroLength, clearActiveSession, resetTimer])

  // ── Mode change ────────────────────────────────────────────
  const setMode = useCallback(async (mode) => {
    // If a session is in progress, abandon it
    const sid = sessionIdRef.current
    if (sid && authUser?.id) {
      await sessionsService.abandonSession(sid, 0)
      clearActiveSession()
    }
    setTimerMode(mode)
  }, [authUser, clearActiveSession, setTimerMode])

  // ── Formatting ─────────────────────────────────────────────
  const formatted = (() => {
    const m = Math.floor(timerSeconds / 60).toString().padStart(2, '0')
    const s = (timerSeconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  })()

  const totalDuration = timerMode === 'pomodoro'
    ? (settings.pomodoroLength * 60)
    : (90 * 60)
  const progress = 1 - timerSeconds / totalDuration

  return {
    formatted,
    progress,
    timerSeconds,
    timerRunning,
    timerMode,
    timerTask,
    toggle,
    reset,
    setMode,
    setTask: setTimerTask,
  }
}
