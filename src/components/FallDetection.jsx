import { useRef } from 'react'
import { useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import WifiWave from './WifiWave'
import RoomScene from './RoomScene'

// ─── State metadata ───────────────────────────────────────────────────────────
const STATES = {
  no_person: {
    label: 'No Person',
    icon: '🚫',
    variant: 'neutral',
    alertLevel: 'normal',
    confidence: 99,
    csiNote: 'Flat baseline — environmental noise only',
    prediction: 'Environment empty. No human presence detected in the monitored space.',
  },
  standing: {
    label: 'Standing',
    icon: '🧍',
    variant: 'normal',
    alertLevel: 'normal',
    confidence: 96,
    csiNote: 'Regular low-frequency oscillations — static presence',
    prediction: 'Person standing still. Vital patterns stable. Posture balanced and upright.',
  },
  walking: {
    label: 'Walking',
    icon: '🚶',
    variant: 'normal',
    alertLevel: 'normal',
    confidence: 94,
    csiNote: 'Periodic high-amplitude pattern — rhythmic cadence detected',
    prediction: 'Ambulatory movement detected. Gait pattern normal. Pace steady and consistent.',
  },
  sitting: {
    label: 'Sitting',
    icon: '🪑',
    variant: 'normal',
    alertLevel: 'normal',
    confidence: 92,
    csiNote: 'Reduced amplitude with subtle respiratory signature',
    prediction: 'Sedentary position detected. Person seated comfortably. Low activity level.',
  },
  lying: {
    label: 'Lying',
    icon: '🛏️',
    variant: 'normal',
    alertLevel: 'normal',
    confidence: 91,
    csiNote: 'Minimal perturbation — slow respiratory wave pattern',
    prediction: 'Person in horizontal position. Resting or sleeping. Regular breathing rhythm detected.',
  },
  get_up: {
    label: 'Get Up',
    icon: '⬆️',
    variant: 'warning',
    alertLevel: 'warning',
    confidence: 88,
    csiNote: 'Increasing amplitude transient — transition activity',
    prediction: 'Transitional movement detected. Person rising from rest. Monitoring stability closely.',
  },
  get_down: {
    label: 'Get Down (Fall!)',
    icon: '⚠️',
    variant: 'danger',
    alertLevel: 'danger',
    confidence: 97,
    csiNote: 'Sudden spike + impact signature — rapid uncontrolled descent',
    prediction: '🚨 FALL DETECTED. Rapid uncontrolled descent identified. Emergency alert triggered. Caregiver notified via app.',
  },
}

// ─── Colour helpers ───────────────────────────────────────────────────────────
const alertColors = {
  normal:  { bg: 'bg-emerald-50',  border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500'  },
  warning: { bg: 'bg-amber-50',    border: 'border-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-500'    },
  danger:  { bg: 'bg-red-50',      border: 'border-red-300',     text: 'text-red-700',     dot: 'bg-red-500'      },
}

const buttonVariants = {
  neutral: 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200',
  normal:  'bg-white hover:bg-brand-50 text-gray-700 border-gray-200 hover:border-brand-300',
  warning: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200',
  danger:  'bg-red-50 hover:bg-red-100 text-red-700 border-red-300',
}

const BUTTON_ORDER = ['no_person', 'standing', 'walking', 'sitting', 'lying', 'get_up', 'get_down']

// ─── Component ────────────────────────────────────────────────────────────────
export default function FallDetection() {
  const [activeState, setActiveState] = useState('standing')
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const info   = STATES[activeState]
  const colors = alertColors[info.alertLevel]
  const isFall = activeState === 'get_down'

  return (
    <section id="fall-detection" ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Section header ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-1.5 bg-brand-500/10 text-brand-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            Feature 01
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Action & Fall Detection
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Click a state below to see how Wi-Fi CSI waves change — and how the AI classifies the action in real time.
          </p>
        </motion.div>

        {/* ── State selector buttons ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2.5 mb-10"
        >
          {BUTTON_ORDER.map(key => {
            const s = STATES[key]
            const isActive = activeState === key
            return (
              <button
                key={key}
                onClick={() => setActiveState(key)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  isActive
                    ? key === 'get_down'
                      ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-200 scale-105'
                      : key === 'get_up'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200 scale-105'
                      : 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/30 scale-105'
                    : buttonVariants[s.variant]
                }`}
              >
                <span>{s.icon}</span>
                {s.label}
              </button>
            )
          })}
        </motion.div>

        {/* ── Fall alert banner ───────────────────────────── */}
        <AnimatePresence>
          {isFall && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="mb-8 bg-red-500 text-white rounded-2xl p-4 flex items-center gap-4 shadow-xl shadow-red-300"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                className="shrink-0"
              >
                <AlertTriangle size={32} strokeWidth={2.5} />
              </motion.div>
              <div>
                <div className="font-black text-lg">FALL DETECTED</div>
                <div className="text-red-100 text-sm">Emergency alert dispatched · Caregiver app notified · Response time &lt;200 ms</div>
              </div>
              <div className="ml-auto text-right shrink-0">
                <div className="text-2xl font-black">97%</div>
                <div className="text-red-200 text-xs">confidence</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Split screen ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* ── Left: monitored room with image ─────────────── */}
          <div className={`rounded-2xl border-2 transition-colors duration-500 p-6 flex flex-col items-center gap-5 min-h-[400px] ${
            isFall ? 'border-red-300 bg-red-50' : 'border-gray-100 bg-gray-50'
          }`}>
            <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Monitored Room</div>

            {/* Room scene — programmatic SVG character */}
            <div className={`relative w-full flex-1 rounded-xl overflow-hidden border-2 transition-colors duration-500 ${
              isFall ? 'border-red-200' : 'border-gray-200'
            }`} style={{ minHeight: 260 }}>
              <RoomScene state={activeState} isFall={isFall} />

              {/* State label chip */}
              <div className="absolute bottom-3 left-3">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeState}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border ${
                      colors.bg
                    } ${colors.border} ${colors.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${isFall ? 'animate-ping' : ''}`} />
                    {STATES[activeState].label}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Right: CSI waves + AI prediction ────────────── */}
          <div className="rounded-2xl border-2 border-gray-100 bg-white p-6 flex flex-col gap-5">

            {/* Wave display */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-gray-700">Wi-Fi CSI Signal Analysis</div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-brand-500"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                  Live
                </div>
              </div>
              <div className={`rounded-xl overflow-hidden transition-colors duration-500 ${
                isFall ? 'bg-red-950' : 'bg-gray-950'
              }`} style={{ height: 180 }}>
                <WifiWave state={activeState} />
              </div>
              <div className="mt-2 text-xs text-gray-400">{info.csiNote}</div>
            </div>

            {/* Sub-carrier amplitude heatmap (decorative) */}
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Sub-carrier Amplitude Map</div>
              <div className="flex gap-0.5 h-8">
                {Array.from({ length: 56 }, (_, i) => {
                  const base = activeState === 'no_person' ? 0.10
                    : activeState === 'lying'    ? 0.25
                    : activeState === 'sitting'  ? 0.40
                    : activeState === 'standing' ? 0.55
                    : activeState === 'get_up'   ? 0.70
                    : activeState === 'walking'  ? 0.75
                    : 0.90
                  const val = Math.min(1, Math.max(0.05, base + Math.sin(i * 0.4) * 0.2))
                  const color = isFall
                    ? `rgba(239,68,68,${val})`
                    : `rgba(255,107,0,${val})`
                  return <div key={i} className="flex-1 rounded-sm" style={{ backgroundColor: color }} />
                })}
              </div>
            </div>

            {/* AI prediction box */}
            <div className={`rounded-xl border p-4 transition-all duration-300 ${colors.bg} ${colors.border}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">AI Prediction</div>
                <div className={`text-xs font-bold ${colors.text}`}>{info.confidence}% confidence</div>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeState}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                  className={`text-sm font-medium leading-relaxed ${colors.text}`}
                >
                  {info.prediction}
                </motion.p>
              </AnimatePresence>

              <div className="mt-3 pt-3 border-t border-current/10 flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-gray-800 flex items-center justify-center">
                  <svg viewBox="0 0 10 10" fill="white" className="w-2.5 h-2.5">
                    <path d="M5 1L9 9H1z"/>
                  </svg>
                </div>
                <span className="text-xs text-gray-400">
                  Mitr CSI-Model ·&nbsp;
                  <span className="font-mono">{import.meta.env.VITE_CSI_MODEL || 'mitr-csi-v1'}</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
