import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { RefreshCw, Sparkles, ChevronDown, Activity } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { PATIENTS, ACTIVITY_PATTERNS, ACTIVITY_META, generatePrescription } from '../data/mockData'

// ─── Animated elderly character (SVG, programmatic) ──────────────────────────
function ElderlyCharacter() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: 160, height: 220 }}
    >
      <svg viewBox="0 0 160 220" width="160" height="220">
        {/* Shadow */}
        <ellipse cx="80" cy="210" rx="30" ry="6" fill="rgba(0,0,0,0.08)" />

        {/* Cane */}
        <motion.line
          x1="105" y1="130" x2="118" y2="185"
          stroke="#92400E" strokeWidth="4" strokeLinecap="round"
          animate={{ rotate: [-2, 2, -2] }}
          style={{ transformOrigin: '105px 130px' }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle cx="117" cy="186" r="3" fill="#78350F" />

        {/* Body */}
        <motion.g
          animate={{ rotate: [-1, 1, -1] }}
          style={{ transformOrigin: '80px 140px' }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Torso / shirt */}
          <rect x="62" y="98" width="36" height="50" rx="10" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5" />
          {/* Collar */}
          <rect x="74" y="97" width="12" height="10" rx="3" fill="#BFDBFE" />

          {/* Left arm */}
          <motion.line
            x1="65" y1="108" x2="48" y2="138"
            stroke="#FCD34D" strokeWidth="9" strokeLinecap="round"
            animate={{ x2: [46, 50, 46], y2: [136, 140, 136] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Right arm (holding cane) */}
          <line x1="95" y1="108" x2="108" y2="132" stroke="#FCD34D" strokeWidth="9" strokeLinecap="round" />

          {/* Pants / legs */}
          <rect x="63" y="144" width="14" height="40" rx="6" fill="#6B7280" />
          <rect x="83" y="144" width="14" height="40" rx="6" fill="#6B7280" />

          {/* Shoes */}
          <ellipse cx="70" cy="184" rx="9" ry="5" fill="#374151" />
          <ellipse cx="90" cy="184" rx="9" ry="5" fill="#374151" />
        </motion.g>

        {/* Head */}
        <motion.g
          animate={{ rotate: [-2, 2, -2] }}
          style={{ transformOrigin: '80px 80px' }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Hair / top */}
          <ellipse cx="80" cy="60" rx="22" ry="8" fill="#D1D5DB" />
          {/* Face */}
          <circle cx="80" cy="72" r="20" fill="#FDE68A" stroke="#FCD34D" strokeWidth="1.5" />
          {/* Smile */}
          <path d="M72 78 Q80 86 88 78" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
          {/* Eyes */}
          <circle cx="74" cy="68" r="2.5" fill="#374151" />
          <circle cx="86" cy="68" r="2.5" fill="#374151" />
          {/* Glasses */}
          <circle cx="74" cy="68" r="6" fill="none" stroke="#6B7280" strokeWidth="1.5" />
          <circle cx="86" cy="68" r="6" fill="none" stroke="#6B7280" strokeWidth="1.5" />
          <line x1="80" y1="68" x2="80" y2="68" stroke="#6B7280" strokeWidth="1.5" />
          <line x1="68" y1="68" x2="64" y2="66" stroke="#6B7280" strokeWidth="1.5" />
          <line x1="92" y1="68" x2="96" y2="66" stroke="#6B7280" strokeWidth="1.5" />
          {/* Eyebrows */}
          <path d="M70 62 Q74 60 78 62" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M82 62 Q86 60 90 62" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>

        {/* Floating health orbs */}
        {[
          { cx: 30, cy: 60, emoji: '💙', delay: 0 },
          { cx: 135, cy: 75, emoji: '🦴', delay: 0.8 },
          { cx: 20, cy: 140, emoji: '❤️', delay: 1.6 },
        ].map((orb, i) => (
          <motion.text
            key={i}
            x={orb.cx} y={orb.cy}
            textAnchor="middle" fontSize="14"
            animate={{ y: [orb.cy, orb.cy - 8, orb.cy], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.4, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            {orb.emoji}
          </motion.text>
        ))}
      </svg>
    </motion.div>
  )
}


function InfoRow({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
      <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</div>
      <div className="text-xs text-gray-700 leading-snug">{value}</div>
    </div>
  )
}

// ─── Build pie data from pattern ─────────────────────────────────────────────
function buildPieData(patternKey) {
  const blocks = ACTIVITY_PATTERNS[patternKey].blocks
  const counts = {}
  Object.keys(ACTIVITY_META).forEach(k => (counts[k] = 0))
  blocks.forEach(b => { if (counts[b] !== undefined) counts[b]++ })
  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({
      name: ACTIVITY_META[k].label,
      value: Math.round((v / 48) * 100),
      color: ACTIVITY_META[k].color,
    }))
}

// ─── 24-hr timeline bar ───────────────────────────────────────────────────────
function Timeline({ patternKey }) {
  const blocks = ACTIVITY_PATTERNS[patternKey].blocks
  const hours = ['12a','1','2','3','4','5','6','7','8','9','10','11','12p','1','2','3','4','5','6','7','8','9','10','11']
  return (
    <div>
      <div className="flex gap-px mb-1">
        {blocks.map((act, i) => (
          <motion.div
            key={i}
            title={`${Math.floor(i / 2).toString().padStart(2,'0')}:${i % 2 === 0 ? '00' : '30'} — ${ACTIVITY_META[act]?.label}`}
            className="flex-1 rounded-sm cursor-pointer"
            style={{ height: 28, backgroundColor: ACTIVITY_META[act]?.color ?? '#E5E7EB', opacity: 0.85 }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.3, delay: i * 0.005 }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-gray-400 mt-1 select-none px-0.5">
        {hours.map((h, i) => (
          <span key={i}>{h}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SocialPrescription() {
  const [patientIdx, setPatientIdx]     = useState(0)
  const [patternKey, setPatternKey]     = useState('active_day_good_sleep')
  const [dropOpen, setDropOpen]         = useState(false)
  const [generating, setGenerating]     = useState(false)
  const [prescription, setPrescription] = useState(null)

  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const patient = PATIENTS[patientIdx]
  const pattern = ACTIVITY_PATTERNS[patternKey]
  const pieData = buildPieData(patternKey)

  function randomizePatient() {
    let next
    do { next = Math.floor(Math.random() * PATIENTS.length) } while (next === patientIdx)
    setPatientIdx(next)
    setPrescription(null)
  }

  function generate() {
    setGenerating(true)
    setPrescription(null)
    setTimeout(() => {
      setGenerating(false)
      setPrescription(generatePrescription(patient, patternKey))
    }, 2000)
  }

  return (
    <section id="social-prescription" ref={ref} className="py-24 bg-orange-50/40">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Section header ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-1.5 bg-brand-500/10 text-brand-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            Feature 03
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            AI Social Prescription
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Select a patient and activity pattern. The AI generates a personalized social prescription based on bone health data and 24-hour behavior.
          </p>
        </motion.div>

        {/* ── Row 1: Patient card + 3D model + Pie chart ──── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
        >
          {/* ── Patient Card ─────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Patient</span>
              <button
                onClick={randomizePatient}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-full transition-all"
              >
                <RefreshCw size={12} strokeWidth={2.5} />
                Randomize
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-3"
              >
                {/* Name + gender icon */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm text-xl font-bold ${
                    patient.sex === 'M' ? 'bg-blue-500' : 'bg-pink-500'
                  }`}>
                    {patient.sex === 'M' ? '♂' : '♀'}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg leading-tight">{patient.name}</div>
                    <div className="text-sm text-gray-400">{patient.age} years old</div>
                  </div>
                </div>

                {/* Fields grid */}
                <div className="flex flex-col gap-2">
                  <InfoRow label="Disease History" value={patient.disease_history} />
                  <InfoRow label="Mobility" value={patient.mobility_status.replace(/_/g, ' ')} />
                  <InfoRow label="Lifestyle" value={patient.lifestyle_profile} />
                  <InfoRow label="Favourite Foods" value={patient.favorite_foods} />
                  <InfoRow label="Health Belief" value={patient.health_belief} />
                  <InfoRow label="Cultural Context" value={patient.cultural_context} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Animated SVG elderly character ────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col items-center justify-center min-h-[320px] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-blue-50" />
            <div className="relative z-10 w-full h-full flex items-center justify-center" style={{ minHeight: 280 }}>
              <ElderlyCharacter />
            </div>
          </div>

          {/* ── Activity Pie chart + pattern selector ─────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Activity Distribution</div>

            {/* Pattern dropdown */}
            <div className="relative mb-4">
              <button
                onClick={() => setDropOpen(o => !o)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-brand-300 transition-all"
              >
                <span>{pattern.emoji} {pattern.name}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {dropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden"
                  >
                    {Object.entries(ACTIVITY_PATTERNS).map(([key, p]) => (
                      <button
                        key={key}
                        onClick={() => { setPatternKey(key); setDropOpen(false); setPrescription(null) }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors ${
                          key === patternKey ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{p.emoji}</span>
                        {p.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={patternKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={76}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 11 }}
                      formatter={v => [`${v}%`, 'Share']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-1">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      {d.name} <span className="text-gray-400">({d.value}%)</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Row 2: 24-hr timeline + AI Prescription ────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* ── 24-hr timeline ────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-brand-500" />
              <span className="font-bold text-gray-900 text-sm">24-Hour Activity Timeline</span>
              <span className="ml-auto text-xs text-gray-400">{pattern.emoji} {pattern.name}</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={patternKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Timeline patternKey={patternKey} />
              </motion.div>
            </AnimatePresence>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-4">
              {Object.entries(ACTIVITY_META).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: v.color }} />
                  {v.icon} {v.label}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
              Each block = 30 min · 48 blocks total · Data from Mitr CSI router
            </div>
          </div>

          {/* ── OpenAI Prescription generator ────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
                </svg>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">AI Social Prescription</div>
                <div className="text-xs text-gray-400">
                  {patient.name} · {pattern.name} · Powered by {import.meta.env.VITE_OPENAI_MODEL || 'GPT-4o'}
                </div>
              </div>
            </div>

            <div className="flex-1 rounded-xl bg-gray-50 border border-gray-100 p-4 min-h-[200px] overflow-y-auto mb-4">
              <AnimatePresence mode="wait">
                {generating ? (
                  <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center gap-3 h-full py-8 text-center"
                  >
                    <div className="flex gap-1.5">
                      {[0, 0.15, 0.3].map((d, i) => (
                        <motion.div key={i} className="w-2 h-2 bg-brand-500 rounded-full"
                          animate={{ y: [0, -8, 0] }} transition={{ duration: 0.8, delay: d, repeat: Infinity }}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">Generating prescription for {patient.name}…</p>
                  </motion.div>
                ) : prescription ? (
                  <motion.div key="p" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    {prescription.split('\n').map((line, i) => {
                      if (!line.trim()) return <div key={i} className="h-2" />
                      if (line.startsWith('**') && line.endsWith('**'))
                        return <div key={i} className="font-bold text-gray-800 text-xs mt-3 mb-1">{line.replace(/\*\*/g, '')}</div>
                      if (line.startsWith('*') && line.endsWith('*'))
                        return <div key={i} className="text-[10px] text-gray-400 italic mt-2">{line.replace(/\*/g, '')}</div>
                      return <div key={i} className="text-sm text-gray-700 leading-relaxed">{line}</div>
                    })}
                  </motion.div>
                ) : (
                  <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center gap-3 h-full py-8 text-center"
                  >
                    <Sparkles size={28} className="text-gray-300" />
                    <p className="text-sm text-gray-400 italic max-w-[220px]">
                      Select a patient and pattern, then click <strong className="text-gray-600">Generate</strong> to create a personalized prescription.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={generate}
              disabled={generating}
              className="w-full bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {generating ? 'Generating…' : (
                <>
                  <Sparkles size={16} />
                  Generate Social Prescription
                </>
              )}
            </button>

            <p className="text-[11px] text-gray-300 text-center mt-2">
              Set <code className="bg-gray-100 text-gray-500 px-1 rounded">VITE_OPENAI_API_KEY</code> in .env for live AI generation
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
