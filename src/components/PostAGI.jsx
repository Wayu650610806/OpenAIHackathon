import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const PILLARS = [
  {
    icon: '💓',
    title: 'Heartbeat Monitoring',
    body: 'Wi-Fi CSI detects micro-Doppler shifts caused by cardiac wall motion, enabling continuous, contactless heart-rate monitoring without any wearable device.',
  },
  {
    icon: '🫁',
    title: 'Respiration Tracking',
    body: 'Sub-millimeter chest displacement modulates the wireless channel. Mitr extracts breathing rate and tidal volume patterns around the clock — even during deep sleep.',
  },
  {
    icon: '🧠',
    title: 'Neurological Anomaly Detection',
    body: 'Gait micro-tremors and subtle postural drift are early markers of Parkinson\'s and stroke risk. AGI-scale models will flag these deviations months before clinical onset.',
  },
]

function GlowOrb({ size, x, y, delay }) {
  return (
    <motion.div
      className="absolute rounded-full bg-brand-500 blur-3xl pointer-events-none"
      style={{ width: size, height: size, left: x, top: y, opacity: 0 }}
      animate={{ opacity: [0, 0.12, 0] }}
      transition={{ duration: 6, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export default function PostAGI() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="post-agi" ref={ref} className="relative bg-gray-950 text-white overflow-hidden py-28">
      {/* Ambient glows */}
      <GlowOrb size={600} x="-100px"  y="-100px"  delay={0}   />
      <GlowOrb size={500} x="60%"     y="40%"     delay={2}   />
      <GlowOrb size={400} x="10%"     y="60%"     delay={4}   />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#FF6B00 1px, transparent 1px), linear-gradient(90deg, #FF6B00 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* ── Header ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 border border-brand-500/40 text-brand-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6"
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-brand-500"
            />
            Post-AGI Vision
          </motion.span>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
            Beyond Actions:
            <br />
            <span className="text-gradient-brand">Predicting the Unseen</span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Today, Mitr classifies human actions. In a Post-AGI world, it will read the
            invisible — the flutter of a heartbeat, the rhythm of breath, the tremor no
            eye can see — and predict disease before any symptom appears.
          </p>
        </motion.div>

        {/* ── Pillars grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-20">
          {PILLARS.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              className="group bg-gray-900/60 border border-gray-800 hover:border-brand-500/50 rounded-2xl p-6 transition-all hover:bg-gray-900"
            >
              <div className="text-3xl mb-4">{p.icon}</div>
              <h3 className="font-bold text-white mb-2 text-lg group-hover:text-brand-400 transition-colors">
                {p.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Central vision statement ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative bg-gradient-to-br from-gray-900 to-gray-950 border border-brand-500/20 rounded-3xl p-10 text-center overflow-hidden"
        >
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent rounded-3xl pointer-events-none" />

          <motion.div
            className="text-6xl mb-6"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            🌐
          </motion.div>

          <h3 className="text-3xl sm:text-4xl font-black text-white mb-4">
            From Action Detection
            <br />
            <span className="text-gradient-brand">to Disease Prevention</span>
          </h3>

          <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed mb-8">
            With AGI-scale multimodal reasoning applied to continuous Wi-Fi CSI streams,
            Mitr will cross-correlate micro-movement patterns, cardiac rhythm anomalies,
            respiratory irregularities, and sleep architecture — building a health fingerprint
            unique to each individual and detecting deviations long before clinical symptoms emerge.
          </p>

          {/* Timeline */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-0 max-w-xl mx-auto">
            {[
              { phase: 'Now', desc: 'Action & Fall Detection' },
              { phase: '2026', desc: 'Vital Signs Monitoring' },
              { phase: '2027', desc: 'Anomaly Prediction' },
              { phase: 'AGI', desc: 'Disease Prevention' },
            ].map((step, i, arr) => (
              <div key={i} className="flex items-center gap-0">
                <div className="flex flex-col items-center px-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border-2 ${
                    i === 0
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : i === arr.length - 1
                      ? 'bg-transparent border-brand-500/50 text-brand-400'
                      : 'bg-transparent border-gray-700 text-gray-500'
                  }`}>{step.phase}</div>
                  <div className="text-[11px] text-gray-400 mt-1.5 text-center max-w-[80px]">{step.desc}</div>
                </div>
                {i < arr.length - 1 && (
                  <div className="hidden sm:block h-px w-8 bg-gradient-to-r from-brand-500/40 to-gray-700 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Footer ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-800 pt-8"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2">
                <path d="M1.5 8.5a15 15 0 0121 0M5 12a11 11 0 0114 0M8.5 15.5a7 7 0 017 0M12 19h.01" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-white">Mitr</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500 text-sm">OpenAI × AIAT Hackathon</span>
          </div>

          <div className="flex items-center gap-6">
            {['Fall Detection', 'Activity Monitor', 'Social Rx', 'Post-AGI'].map(l => (
              <span key={l} className="text-gray-500 hover:text-gray-300 text-sm cursor-pointer transition-colors">{l}</span>
            ))}
          </div>

          <p className="text-gray-600 text-sm">
            © 2026 Mitr · Built with <span className="text-brand-500">♥</span> & Wi-Fi waves
          </p>
        </motion.div>
      </div>
    </section>
  )
}
