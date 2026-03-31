import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '../../store/useAppStore'
import { AMBIENT_SOUNDS } from '../../lib/constants'

// Generates simple Web Audio API sounds (no external files needed)
function createAudioContext() {
  if (typeof window === 'undefined') return null
  return new (window.AudioContext || window.webkitAudioContext)()
}

function generateWhiteNoise(ctx, volume) {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 800

  const gainNode = ctx.createGain()
  gainNode.gain.value = volume * 0.4

  source.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)
  source.start()
  return { source, gainNode }
}

function generateOceanSound(ctx, volume) {
  // LFO-modulated filtered noise = ocean waves
  const bufferSize = ctx.sampleRate * 4
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 400
  filter.Q.value = 0.5

  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.1
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 200
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)
  lfo.start()

  const gainNode = ctx.createGain()
  gainNode.gain.value = volume * 0.5

  source.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)
  source.start()
  return { source, gainNode, lfo }
}

function generateRainSound(ctx, volume) {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 1500

  const gainNode = ctx.createGain()
  gainNode.gain.value = volume * 0.25

  source.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)
  source.start()
  return { source, gainNode }
}

function generateCafeSound(ctx, volume) {
  // Mix of lowpass noise (murmur) + occasional high ticks (cups/spoons)
  const bufferSize = ctx.sampleRate * 3
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 600

  const gainNode = ctx.createGain()
  gainNode.gain.value = volume * 0.35

  source.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)
  source.start()
  return { source, gainNode }
}

function generateLofi(ctx, volume) {
  // Simple chord tones played in a loop pattern = lo-fi vibe
  const gainNode = ctx.createGain()
  gainNode.gain.value = volume * 0.15
  gainNode.connect(ctx.destination)

  // We'll do a repeating chord pattern with oscillators
  const notes = [261.63, 329.63, 392.00, 523.25] // C E G C
  const oscillators = notes.map((freq) => {
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    oscGain.gain.value = 0.25

    // Gentle vibrato
    const vibrato = ctx.createOscillator()
    vibrato.frequency.value = 5
    const vibratoGain = ctx.createGain()
    vibratoGain.gain.value = 2
    vibrato.connect(vibratoGain)
    vibratoGain.connect(osc.frequency)
    vibrato.start()

    osc.connect(oscGain)
    oscGain.connect(gainNode)
    osc.start()
    return { osc, vibrato }
  })

  return { source: { stop: () => oscillators.forEach(({ osc, vibrato }) => { osc.stop(); vibrato.stop() }) }, gainNode }
}

function generateForest(ctx, volume) {
  // Layered bandpass noise = wind through trees
  const bufferSize = ctx.sampleRate * 4
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  // Wind: high-frequency narrow band
  const windFilter = ctx.createBiquadFilter()
  windFilter.type = 'bandpass'
  windFilter.frequency.value = 900
  windFilter.Q.value = 0.3

  const gainNode = ctx.createGain()
  gainNode.gain.value = volume * 0.2

  source.connect(windFilter)
  windFilter.connect(gainNode)
  gainNode.connect(ctx.destination)
  source.start()
  return { source, gainNode }
}

const GENERATORS = {
  rain: generateRainSound,
  cafe: generateCafeSound,
  lofi: generateLofi,
  forest: generateForest,
  whitenoise: generateWhiteNoise,
  ocean: generateOceanSound,
}

export default function AmbientSoundPanel({ isOpen, onClose }) {
  const { ambientSound, ambientVolume, setAmbientSound, setAmbientVolume } = useAppStore()
  const audioRef = useRef(null) // { ctx, source, gainNode }

  const stopCurrent = () => {
    if (audioRef.current) {
      try {
        audioRef.current.source?.stop()
        audioRef.current.ctx?.close()
      } catch (_) {}
      audioRef.current = null
    }
  }

  const playSound = (id) => {
    stopCurrent()
    if (!id) {
      setAmbientSound(null)
      return
    }
    try {
      const ctx = createAudioContext()
      if (!ctx) return
      const gen = GENERATORS[id]
      if (!gen) return
      const nodes = gen(ctx, ambientVolume)
      audioRef.current = { ctx, ...nodes }
      setAmbientSound(id)
    } catch (e) {
      console.warn('Audio generation failed:', e)
    }
  }

  const handleToggle = (id) => {
    if (ambientSound === id) {
      stopCurrent()
      setAmbientSound(null)
    } else {
      playSound(id)
    }
  }

  const handleVolume = (v) => {
    setAmbientVolume(v)
    if (audioRef.current?.gainNode) {
      const soundDef = AMBIENT_SOUNDS.find((s) => s.id === ambientSound)
      if (soundDef) {
        audioRef.current.gainNode.gain.value = v * (ambientSound === 'lofi' ? 0.15 : 0.35)
      }
    }
  }

  // Stop on unmount
  useEffect(() => () => stopCurrent(), [])

  // Resume if sound was active when component mounts (after tab switch)
  useEffect(() => {
    if (ambientSound && !audioRef.current) {
      playSound(ambientSound)
    }
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="absolute bottom-full mb-3 right-0 w-80 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/60 z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  headphones
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Ambient Sounds</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Sound Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {AMBIENT_SOUNDS.map((sound) => {
              const active = ambientSound === sound.id
              return (
                <motion.button
                  key={sound.id}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => handleToggle(sound.id)}
                  className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${
                    active
                      ? 'border-primary/50 bg-primary/10 ambient-active'
                      : 'border-white/5 bg-white/3 hover:border-white/15'
                  }`}
                >
                  {active && (
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ background: `radial-gradient(circle at center, ${sound.color}20, transparent)` }}
                    />
                  )}
                  <span
                    className="material-symbols-outlined text-xl relative"
                    style={{
                      color: active ? sound.color : 'rgba(255,255,255,0.4)',
                      fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {sound.icon}
                  </span>
                  <span className={`text-[10px] font-bold relative ${active ? 'text-white' : 'text-on-surface-variant'}`}>
                    {sound.label}
                  </span>
                </motion.button>
              )
            })}
          </div>

          {/* Volume Slider */}
          {ambientSound && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border-t border-white/5 pt-4"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">volume_down</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => handleVolume(Number(e.target.value))}
                  className="flex-1 h-1 rounded-full appearance-none bg-white/10 cursor-pointer accent-primary"
                  style={{ accentColor: '#4AE176' }}
                />
                <span className="material-symbols-outlined text-on-surface-variant text-lg">volume_up</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
