import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  AlertTriangle,
  ArrowUpFromLine,
  Armchair,
  Ban,
  Bed,
  Footprints,
  Loader2,
  UserRound,
} from 'lucide-react'
import WifiWave from './WifiWave'
import RoomScene from './RoomScene'
import samplesCsvUrl from '../../one_correct_sample_per_class.csv?url'

const API_ENDPOINT = 'https://wayuth-wificsi.hf.space/predict'

function parseCsvRows(text) {
  const trimmedText = text.trim()
  const firstLineBreak = trimmedText.search(/\r?\n/)
  const header = firstLineBreak >= 0 ? trimmedText.slice(0, firstLineBreak).trim() : ''

  if (header !== 'class,data') {
    throw new Error('CSV must contain class and data columns.')
  }

  return trimmedText
    .slice(firstLineBreak + 1)
    .split(/\r?\n(?=[^,\r\n]+,")/)
    .map(row => {
      const commaIndex = row.indexOf(',')
      const className = row.slice(0, commaIndex).trim()
      let data = row.slice(commaIndex + 1).trim()
      if (data.startsWith('"') && data.endsWith('"')) {
        data = data.slice(1, -1).replace(/""/g, '"')
      }
      return { className, data }
    })
    .filter(row => row.className && row.data)
}

function confidenceText(value, fallback) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return `${fallback}% confidence`
  }
  return `${(Number(value) * 100).toFixed(1)}% confidence`
}

const STATES = {
  no_person: {
    label: 'No Person',
    Icon: Ban,
    variant: 'neutral',
    alertLevel: 'normal',
    confidence: 99,
    csiNote: 'Flat baseline - environmental noise only',
    prediction: 'Environment empty. No human presence detected in the monitored space.',
  },
  standing: {
    label: 'Standing',
    Icon: UserRound,
    variant: 'normal',
    alertLevel: 'normal',
    confidence: 96,
    csiNote: 'Regular low-frequency oscillations - static presence',
    prediction: 'Person standing still. Vital patterns stable. Posture balanced and upright.',
  },
  walking: {
    label: 'Walking',
    Icon: Footprints,
    variant: 'normal',
    alertLevel: 'normal',
    confidence: 94,
    csiNote: 'Periodic high-amplitude pattern - rhythmic cadence detected',
    prediction: 'Ambulatory movement detected. Gait pattern normal. Pace steady and consistent.',
  },
  sitting: {
    label: 'Sitting',
    Icon: Armchair,
    variant: 'normal',
    alertLevel: 'normal',
    confidence: 92,
    csiNote: 'Reduced amplitude with subtle respiratory signature',
    prediction: 'Sedentary position detected. Person seated comfortably. Low activity level.',
  },
  lying: {
    label: 'Lying',
    Icon: Bed,
    variant: 'normal',
    alertLevel: 'normal',
    confidence: 91,
    csiNote: 'Minimal perturbation - slow respiratory wave pattern',
    prediction: 'Person in horizontal position. Resting or sleeping. Regular breathing rhythm detected.',
  },
  get_up: {
    label: 'Get Up',
    Icon: ArrowUpFromLine,
    variant: 'warning',
    alertLevel: 'warning',
    confidence: 88,
    csiNote: 'Increasing amplitude transient - transition activity',
    prediction: 'Transitional movement detected. Person rising from rest. Monitoring stability closely.',
  },
  get_down: {
    label: 'Get Down (Fall!)',
    Icon: AlertTriangle,
    variant: 'danger',
    alertLevel: 'danger',
    confidence: 97,
    csiNote: 'Sudden spike + impact signature - rapid uncontrolled descent',
    prediction: 'FALL DETECTED. Rapid uncontrolled descent identified. Emergency alert triggered. Caregiver notified via app.',
  },
}

const alertColors = {
  normal:  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  warning: { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  danger:  { bg: 'bg-red-50',     border: 'border-red-300',     text: 'text-red-700',     dot: 'bg-red-500' },
}

const buttonVariants = {
  neutral: 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200',
  normal: 'bg-white hover:bg-brand-50 text-gray-700 border-gray-200 hover:border-brand-300',
  warning: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200',
  danger: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300',
}

const BUTTON_ORDER = ['no_person', 'standing', 'walking', 'sitting', 'lying', 'get_up', 'get_down']

export default function FallDetection() {
  const [activeState, setActiveState] = useState('standing')
  const [samples, setSamples] = useState([])
  const [csvError, setCsvError] = useState('')
  const [hasUserSelected, setHasUserSelected] = useState(false)
  const [requestNonce, setRequestNonce] = useState(0)
  const [predicting, setPredicting] = useState(false)
  const [predictionResult, setPredictionResult] = useState(null)
  const [predictError, setPredictError] = useState('')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const info = STATES[activeState]
  const colors = alertColors[info.alertLevel]
  const isFall = activeState === 'get_down'
  const selectedRow = useMemo(
    () => samples.find(sample => sample.className === activeState),
    [samples, activeState],
  )

  useEffect(() => {
    let cancelled = false

    async function loadCsv() {
      setCsvError('')
      try {
        const response = await fetch(samplesCsvUrl)
        if (!response.ok) throw new Error(`Cannot load sample CSV (${response.status})`)
        const parsed = parseCsvRows(await response.text())
        if (!parsed.length) throw new Error('No sample rows found in CSV.')
        if (!cancelled) setSamples(parsed)
      } catch (error) {
        if (!cancelled) setCsvError(error.message)
      }
    }

    loadCsv()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function runPrediction() {
      if (!hasUserSelected || !selectedRow) return
      setPredicting(true)
      setPredictError('')
      setPredictionResult(null)

      try {
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: selectedRow.data,
          }),
          signal: controller.signal,
        })
        if (!response.ok) {
          let detail = ''
          try {
            const errorPayload = await response.json()
            detail = errorPayload?.detail ? `: ${errorPayload.detail}` : ''
          } catch {
            detail = ''
          }
          throw new Error(`Prediction API returned ${response.status}${detail}`)
        }
        if (!cancelled) setPredictionResult(await response.json())
      } catch (error) {
        if (error.name === 'AbortError') return
        if (!cancelled) {
          setPredictError(error.message || 'Prediction failed. Please check that the Hugging Face Space is running.')
        }
      } finally {
        if (!cancelled) setPredicting(false)
      }
    }

    runPrediction()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [selectedRow, hasUserSelected, requestNonce])

  const modelClass = predictionResult?.predicted_class || '-'
  const modelConfidence = predictionResult ? confidenceText(predictionResult.confidence, info.confidence) : '-'
  const modelPredictionText = predictionResult
    ? `Selected action: ${activeState}. Model predicted: ${predictionResult.predicted_class}.`
    : info.prediction

  return (
    <section id="fall-detection" ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
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
            Click a state below to see how Wi-Fi CSI waves change - and how the AI classifies the action in real time.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2.5 mb-10"
        >
          {BUTTON_ORDER.map(key => {
            const state = STATES[key]
            const Icon = state.Icon
            const isActive = activeState === key
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveState(key)
                  setHasUserSelected(true)
                  setRequestNonce(value => value + 1)
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  isActive
                    ? key === 'get_down'
                      ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-200 scale-105'
                      : key === 'get_up'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200 scale-105'
                      : 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/30 scale-105'
                    : buttonVariants[state.variant]
                }`}
              >
                <Icon size={15} strokeWidth={2.3} />
                {state.label}
              </button>
            )
          })}
        </motion.div>

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
                <div className="text-red-100 text-sm">Emergency alert dispatched - Caregiver app notified - Response time &lt;200 ms</div>
              </div>
              <div className="ml-auto text-right shrink-0">
                <div className="text-2xl font-black">{predictionResult?.confidence ? (predictionResult.confidence * 100).toFixed(0) : 97}%</div>
                <div className="text-red-200 text-xs">confidence</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className={`rounded-2xl border-2 transition-colors duration-500 p-6 flex flex-col items-center gap-5 min-h-[400px] ${
            isFall ? 'border-red-300 bg-red-50' : 'border-gray-100 bg-gray-50'
          }`}>
            <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Monitored Room</div>
            <div className={`relative w-full flex-1 rounded-xl overflow-hidden border-2 transition-colors duration-500 ${
              isFall ? 'border-red-200' : 'border-gray-200'
            }`} style={{ minHeight: 260 }}>
              <RoomScene state={activeState} isFall={isFall} />
              <div className="absolute bottom-3 left-3">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeState}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border ${colors.bg} ${colors.border} ${colors.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${isFall ? 'animate-ping' : ''}`} />
                    {info.label}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-gray-100 bg-white p-6 flex flex-col gap-5">
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
              <div className={`rounded-xl overflow-hidden transition-colors duration-500 ${isFall ? 'bg-red-950' : 'bg-gray-950'}`} style={{ height: 180 }}>
                <WifiWave state={activeState} />
              </div>
              <div className="mt-2 text-xs text-gray-400">{info.csiNote}</div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Sub-carrier Amplitude Map</div>
              <div className="flex gap-0.5 h-8">
                {Array.from({ length: 56 }, (_, i) => {
                  const base = activeState === 'no_person' ? 0.10
                    : activeState === 'lying' ? 0.25
                    : activeState === 'sitting' ? 0.40
                    : activeState === 'standing' ? 0.55
                    : activeState === 'get_up' ? 0.70
                    : activeState === 'walking' ? 0.75
                    : 0.90
                  const val = Math.min(1, Math.max(0.05, base + Math.sin(i * 0.4) * 0.2))
                  const color = isFall ? `rgba(239,68,68,${val})` : `rgba(255,107,0,${val})`
                  return <div key={i} className="flex-1 rounded-sm" style={{ backgroundColor: color }} />
                })}
              </div>
            </div>

            <div className={`rounded-xl border p-4 transition-all duration-300 ${colors.bg} ${colors.border}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">AI Prediction</div>
                <div className={`text-xs font-bold ${colors.text}`}>
                  {predicting ? 'Predicting...' : predictionResult ? modelConfidence : 'Waiting for model'}
                </div>
              </div>
              <motion.p
                key={`${activeState}-${predicting}-${predictionResult?.predicted_class || predictError || csvError}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className={`text-sm font-medium leading-relaxed ${colors.text}`}
              >
                {csvError
                  ? `CSV unavailable: ${csvError}`
                  : predictError
                  ? `Model API unavailable: ${predictError}`
                  : predicting
                  ? 'Sending the selected CSV sample to the FastAPI model...'
                  : predictionResult
                  ? modelPredictionText
                  : 'Choose an action to send its CSV sample to the FastAPI model.'}
              </motion.p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <ResultStat label="Selected Action" value={activeState} />
                <ResultStat label="Predicted Class" value={modelClass} />
                <ResultStat label="Confidence" value={predicting ? '...' : modelConfidence.replace(' confidence', '')} />
              </div>

              <div className="mt-3 pt-3 border-t border-current/10 flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-gray-800 flex items-center justify-center text-white">
                  {predicting ? <Loader2 size={10} className="animate-spin" /> : <IconBadge />}
                </div>
                <span className="text-xs text-gray-400">
                  FastAPI REST - <span className="font-mono">/predict</span>
                  <span className="mx-1">-</span>
                  <span>Predicted: {modelClass}</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function ResultStat({ label, value }) {
  return (
    <div className="rounded-lg bg-white/70 border border-current/10 px-3 py-2">
      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</div>
      <div className="mt-1 text-sm font-bold text-gray-800 break-words">{value}</div>
    </div>
  )
}

function IconBadge() {
  return (
    <svg viewBox="0 0 10 10" fill="currentColor" className="w-2.5 h-2.5">
      <path d="M5 1L9 9H1z" />
    </svg>
  )
}
