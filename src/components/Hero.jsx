import { motion } from 'framer-motion'
import RouterModel from './RouterModel'

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
})

const stats = [
  { value: '98.7%',   label: 'Fall Detection Accuracy' },
  { value: '<200 ms', label: 'Alert Response Time'      },
  { value: '60 m²',   label: 'CSI Coverage Area'        },
]

const ctaButtons = [
  { href: '#fall-detection',      icon: '🛡️', label: 'Fall Detection',      primary: true  },
  { href: '#activity-monitor',    icon: '📊', label: 'Daily Monitor',       primary: false },
  { href: '#social-prescription', icon: '💊', label: 'Social Prescription', primary: false },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-white via-gray-50/60 to-white flex items-center pt-16 overflow-hidden">

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-32 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />

      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 w-full py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

          {/* ── Left text column ──────────────────────────────────── */}
          <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            {/* Event tag */}
            <motion.div {...fade(0.1)}>
              <span className="inline-flex items-center gap-2 bg-brand-500/10 text-brand-600 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-8 border border-brand-500/20">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-brand-500"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                OpenAI × AIAT Hackathon
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...fade(0.2)}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
            >
              Mitr:
              <br />
              <span className="text-gradient-brand">Invisible Care</span>
              <br />
              through Wi‑Fi Waves
            </motion.h1>

            {/* Subheadline */}
            <motion.p {...fade(0.3)} className="text-gray-500 text-lg leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
              A smart Wi-Fi router that uses{' '}
              <span className="text-gray-700 font-semibold">Channel State Information (CSI)</span> to
              silently monitor elderly loved ones — detecting falls, tracking daily habits, and
              generating AI-powered social prescriptions.{' '}
              <span className="text-brand-500 font-semibold">No cameras. No wearables. Just waves.</span>
            </motion.p>

            {/* CTA buttons */}
            <motion.div {...fade(0.4)} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              {ctaButtons.map(btn => (
                <a
                  key={btn.href}
                  href={btn.href}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm transition-all ${
                    btn.primary
                      ? 'bg-brand-500 text-white hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/30'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-brand-300 hover:text-brand-600 hover:shadow-md'
                  }`}
                >
                  <span className="text-base">{btn.icon}</span>
                  {btn.label}
                </a>
              ))}
            </motion.div>
          </div>

          {/* ── Right: product image showcase ───────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex justify-center items-center"
          >
            <RouterModel />
          </motion.div>
        </div>

        {/* ── Stats row ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-20 flex flex-col sm:flex-row justify-center gap-8 sm:gap-16"
        >
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-black text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-400 mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── Scroll cue ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="flex justify-center mt-16"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-1.5 text-gray-400"
          >
            <span className="text-xs font-medium tracking-widest uppercase">Scroll to explore</span>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
