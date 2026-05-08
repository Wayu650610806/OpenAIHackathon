import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { PRESET_A, PRESET_B, ACTIVITY_META } from '../data/mockData'

const ACTIVITY_KEYS = ['no_person', 'standing', 'walking', 'sitting', 'lying', 'get_up', 'get_down']

function summarise(data) {
  const counts = {}
  ACTIVITY_KEYS.forEach(k => (counts[k] = 0))
  data.forEach(d => { if (counts[d.activity] !== undefined) counts[d.activity] += 3 })
  return ACTIVITY_KEYS
    .map(k => ({ activity: k, label: ACTIVITY_META[k]?.label ?? k, minutes: counts[k], color: ACTIVITY_META[k]?.color ?? '#999' }))
    .filter(d => d.minutes > 0)
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ActivityMonitor() {
  const [preset, setPreset]             = useState(PRESET_A)
  const [data, setData]                 = useState(PRESET_A.data)
  const [hovered, setHovered]           = useState(null)
  const [analyzing, setAnalyzing]       = useState(false)
  const [analysis, setAnalysis]         = useState(null)
  // Custom builder state
  const [selectedActivity, setSelected] = useState('walking')
  const [customLabel, setCustomLabel]   = useState('')

  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const summary = summarise(data)

  function loadPreset(p) {
    setPreset(p)
    setData(p.data)
    setAnalysis(null)
  }

  function appendCustom() {
    if (!selectedActivity) return
    setData(prev => {
      const last = prev[prev.length - 1]
      const [h, m] = last.time.split(':').map(Number)
      const newM = m + 3
      const time = `${String(h + Math.floor(newM / 60)).padStart(2, '0')}:${String(newM % 60).padStart(2, '0')}`
      const label = customLabel.trim() || ACTIVITY_META[selectedActivity]?.label || selectedActivity
      return [...prev.slice(-19), { time, activity: selectedActivity, label }]
    })
    setCustomLabel('')
  }

  function triggerAnalysis() {
    setAnalyzing(true)
    setAnalysis(null)
    setTimeout(() => {
      setAnalyzing(false)
      setAnalysis(
        preset.name === 'Restless Night'
          ? 'Patient shows fragmented sleep with multiple get_up transitions (3×). Repeated mid-night walking and sitting events are consistent with pain-related insomnia or early-stage anxiety. Recommend a GP consultation for sleep quality assessment and fall-risk review.'
          : 'Patient demonstrates a healthy active morning routine with adequate mobility transitions, walking bursts, and restful baseline. Activity distribution looks optimal for their age group. No intervention required at this time.'
      )
    }, 2200)
  }

  return (
    <section id="activity-monitor" ref={ref} className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Header ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-1.5 bg-brand-500/10 text-brand-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            Feature 02
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Time-Based Activity Monitor
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Behavior logged every 3 minutes over 1 hour. Load a preset or build your own log to see AI-powered insights.
          </p>
        </motion.div>

        {/* ── Controls panel ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ── Preset Logs ─────────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Preset Logs</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5">
                {[PRESET_A, PRESET_B].map(p => (
                  <button
                    key={p.name}
                    onClick={() => loadPreset(p)}
                    className={`flex-1 flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      preset.name === p.name
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl leading-none mt-0.5">{p.emoji}</span>
                    <div>
                      <div className={`text-sm font-bold ${preset.name === p.name ? 'text-brand-600' : 'text-gray-800'}`}>
                        {p.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Starting {p.startLabel} · 20 entries
                      </div>
                    </div>
                    {preset.name === p.name && (
                      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-brand-500 ml-auto shrink-0 mt-0.5" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3 8l3.5 3.5L13 4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Custom Log Builder ──────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Custom Log Builder</span>
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] text-gray-400">Appends to timeline</span>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50">
                {/* Activity type selector */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Activity Type</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ACTIVITY_KEYS.map(k => {
                      const meta = ACTIVITY_META[k]
                      const isSelected = selectedActivity === k
                      return (
                        <button
                          key={k}
                          onClick={() => setSelected(k)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
                          style={
                            isSelected
                              ? { backgroundColor: meta?.color, borderColor: meta?.color, color: '#fff' }
                              : { backgroundColor: '#fff', borderColor: '#E5E7EB', color: '#6B7280' }
                          }
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : meta?.color }}
                          />
                          {meta?.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Label input + append */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Custom label (optional)"
                    value={customLabel}
                    onChange={e => setCustomLabel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && appendCustom()}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-400 bg-white placeholder-gray-300"
                  />
                  <button
                    onClick={appendCustom}
                    disabled={!selectedActivity}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-all shrink-0"
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5">
                      <path d="M8 3v10M3 8h10" strokeLinecap="round"/>
                    </svg>
                    Append
                  </button>
                </div>

                {/* Preview chip of what will be appended */}
                {selectedActivity && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Preview:</span>
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-white"
                      style={{ backgroundColor: ACTIVITY_META[selectedActivity]?.color }}
                    >
                      {customLabel.trim() || ACTIVITY_META[selectedActivity]?.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Main content grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Timeline + chart ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-bold text-gray-900 text-lg">{preset.emoji} {preset.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">Starting {preset.startLabel} — 3 min intervals</div>
              </div>
              <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">{data.length} entries</div>
            </div>

            {/* Timeline strip */}
            <div className="relative">
              <div className="flex gap-0.5 mb-1">
                {data.map((item, i) => (
                  <div
                    key={i}
                    className="flex-1 min-w-0 rounded-sm cursor-pointer transition-transform hover:scale-y-110 origin-bottom"
                    style={{
                      height: 44,
                      backgroundColor: ACTIVITY_META[item.activity]?.color ?? '#E5E7EB',
                      opacity: hovered === i ? 1 : 0.82,
                      outline: hovered === i ? `2px solid ${ACTIVITY_META[item.activity]?.color}` : 'none',
                    }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                  />
                ))}
              </div>

              {/* Time labels */}
              <div className="flex justify-between text-xs text-gray-400 mt-1.5 select-none">
                <span>{data[0]?.time}</span>
                <span>{data[Math.floor(data.length / 4)]?.time}</span>
                <span>{data[Math.floor(data.length / 2)]?.time}</span>
                <span>{data[Math.floor(data.length * 3 / 4)]?.time}</span>
                <span>{data[data.length - 1]?.time}</span>
              </div>

              {/* Hover tooltip */}
              {hovered !== null && (
                <div className="absolute -top-10 left-0 right-0 flex justify-center pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 shadow-xl">
                    <span className="font-bold">{data[hovered]?.time}</span>
                    <span className="text-gray-300 ml-2">{data[hovered]?.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
              {ACTIVITY_KEYS.map(k => (
                <div key={k} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: ACTIVITY_META[k]?.color }} />
                  {ACTIVITY_META[k]?.label}
                </div>
              ))}
            </div>

            {/* Duration bar chart */}
            <div className="mt-6">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Duration Summary (minutes)</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={summary} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 6" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    axisLine={false} tickLine={false} interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    axisLine={false} tickLine={false} unit=" min"
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                    formatter={v => [`${v} min`, 'Duration']}
                  />
                  <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                    {summary.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* ── OpenAI analysis pane ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col"
          >
            {/* OpenAI branding */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
                </svg>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">OpenAI Behavior Analysis</div>
                <div className="text-xs text-gray-400">Powered by {import.meta.env.VITE_OPENAI_MODEL || 'GPT-4o'}</div>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <div className="flex-1 rounded-xl bg-gray-50 border border-gray-100 p-4 min-h-[160px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {analyzing ? (
                    <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-3 text-center"
                    >
                      <div className="flex gap-1.5">
                        {[0, 0.15, 0.3].map((d, i) => (
                          <motion.div key={i} className="w-2 h-2 bg-brand-500 rounded-full"
                            animate={{ y: [0, -8, 0] }} transition={{ duration: 0.8, delay: d, repeat: Infinity }}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">Analyzing behavior trends…</p>
                    </motion.div>
                  ) : analysis ? (
                    <motion.p key="r" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-gray-700 leading-relaxed"
                    >{analysis}</motion.p>
                  ) : (
                    <motion.p key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-sm text-gray-400 text-center italic"
                    >
                      Load a preset and click <strong className="text-gray-600">Analyze</strong> to generate insights.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={triggerAnalysis}
                disabled={analyzing}
                className="w-full bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {analyzing ? 'Analyzing…' : (
                  <>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm.75 4.25a.75.75 0 00-1.5 0v4.5l-1.97 1.97a.75.75 0 101.06 1.06l2.25-2.25a.75.75 0 00.22-.53V6.25z"/>
                    </svg>
                    Analyze Behavior
                  </>
                )}
              </button>

              <p className="text-[11px] text-gray-300 text-center">
                Set <code className="bg-gray-100 text-gray-500 px-1 rounded">VITE_OPENAI_API_KEY</code> in .env for live analysis
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
