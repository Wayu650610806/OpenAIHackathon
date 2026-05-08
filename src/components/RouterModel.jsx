import { motion } from 'framer-motion'

// ─── Pure CSS/SVG 3D router — no image dependency ────────────────────────────
export default function RouterModel() {
  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: 320, height: 340 }}>

      {/* Ambient glow */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-60 h-20 bg-brand-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-40 h-12 bg-brand-500/30 rounded-full blur-2xl" />

      {/* Pulsing rings */}
      <motion.div
        className="absolute inset-0 m-auto w-72 h-72 rounded-full border border-brand-500/10"
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.1, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-0 m-auto w-52 h-52 rounded-full border border-brand-500/15"
        animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.08, 0.3] }}
        transition={{ duration: 4, delay: 0.9, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating router */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 flex flex-col items-center"
        style={{ perspective: 800 }}
      >
        {/* Antennas */}
        <div className="flex justify-between" style={{ width: 164, marginBottom: 2 }}>
          {[{ tilt: -12 }, { tilt: 0 }, { tilt: 12 }].map((ant, i) => (
            <motion.div
              key={i}
              style={{
                width: 5, height: 54,
                background: 'linear-gradient(to top, #374151, #6B7280)',
                borderRadius: 3,
                transformOrigin: 'bottom center',
                rotate: ant.tilt,
                boxShadow: '0 0 8px rgba(255,107,0,0.15)',
              }}
              animate={{ rotate: [ant.tilt - 1.5, ant.tilt + 1.5, ant.tilt - 1.5] }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        {/* Main body */}
        <div style={{
          width: 236,
          background: 'linear-gradient(145deg, #1F2937 0%, #111827 60%, #0F172A 100%)',
          borderRadius: 18,
          padding: '18px 20px 14px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Gloss */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
            borderRadius: 18, pointerEvents: 'none',
          }} />
          {/* Brand accent stripe */}
          <div style={{
            position: 'absolute', top: 0, left: 20, right: 20, height: 2,
            background: 'linear-gradient(90deg, #FF6B00, #FF9D52)',
            borderRadius: '0 0 4px 4px',
          }} />

          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{
              width: 28, height: 28,
              background: 'linear-gradient(135deg, #FF6B00, #FF9D52)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255,107,0,0.4)',
            }}>
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="white" strokeWidth="2.5">
                <path d="M1.5 8.5a15 15 0 0121 0M5 12a11 11 0 0114 0M8.5 15.5a7 7 0 017 0M12 19h.01" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ color: '#F9FAFB', fontWeight: 800, fontSize: 15, letterSpacing: '0.02em' }}>Mitr</span>
            <span style={{ marginLeft: 'auto', color: '#6B7280', fontSize: 10, fontFamily: 'monospace' }}>CSI-v2</span>
          </div>

          {/* LEDs */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
            {[
              { color: '#22C55E', label: 'PWR', delay: 0 },
              { color: '#FF6B00', label: 'CSI', delay: 0.3 },
              { color: '#3B82F6', label: 'NET', delay: 0.6 },
              { color: '#A855F7', label: 'SYS', delay: 0.9 },
            ].map(led => (
              <div key={led.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <motion.div
                  style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: led.color, boxShadow: `0 0 6px ${led.color}` }}
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.2, delay: led.delay, repeat: Infinity }}
                />
                <span style={{ color: '#4B5563', fontSize: 7, fontFamily: 'monospace', fontWeight: 700 }}>{led.label}</span>
              </div>
            ))}
            {/* Signal bars */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end', gap: 2, height: 14 }}>
              {[6, 9, 12, 14].map((h, i) => (
                <motion.div
                  key={i}
                  style={{ width: 4, height: h, background: '#FF6B00', borderRadius: 2 }}
                  animate={{ opacity: [0.3, 0.9, 0.3] }}
                  transition={{ duration: 1.8, delay: i * 0.25, repeat: Infinity }}
                />
              ))}
            </div>
          </div>

          {/* Vent grilles */}
          {[0,1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
              {Array.from({ length: 14 }).map((_, j) => (
                <div key={j} style={{ flex: 1, height: 3, backgroundColor: '#1E293B', borderRadius: 2, border: '1px solid rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ))}

          {/* Ports */}
          <div style={{ marginTop: 14, display: 'flex', gap: 6, justifyContent: 'center' }}>
            {['WAN','LAN1','LAN2','LAN3','USB'].map(p => (
              <div key={p} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ width: 16, height: 10, backgroundColor: '#0F172A', border: '1px solid #374151', borderRadius: 2 }} />
                <span style={{ color: '#374151', fontSize: 6, fontFamily: 'monospace' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom face (isometric feel) */}
        <div style={{
          width: 236, height: 10,
          background: 'linear-gradient(to right, #0F172A, #1E293B)',
          borderRadius: '0 0 10px 10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }} />
      </motion.div>

      {/* Floor shadow */}
      <div style={{
        width: 200, height: 16,
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.18) 0%, transparent 70%)',
        borderRadius: '50%',
        marginTop: 2,
      }} />
    </div>
  )
}
