import { useRef, useEffect } from 'react'

// ─── Wave configuration per action state ──────────────────────────────────────
// speed values are intentionally small — the animation multiplier is ×8 (not ×60)
// so even speed=2 gives a gentle ~2 Hz rhythm, not a strobe
const CFG = {
  no_person: {
    waves: [
      { amp: 5,  freq: 0.012, phase: 0,   speed: 0.18 },
      { amp: 3,  freq: 0.018, phase: 2.1, speed: 0.14 },
    ],
    rgb: [148, 163, 184],
    glow: 0.10,
    noise: 0,
  },
  standing: {
    waves: [
      { amp: 30, freq: 0.035, phase: 0,   speed: 0.55 },
      { amp: 18, freq: 0.050, phase: 2.1, speed: 0.44 },
      { amp: 12, freq: 0.026, phase: 4.2, speed: 0.66 },
    ],
    rgb: [255, 107, 0],
    glow: 0.20,
    noise: 0,
  },
  walking: {
    waves: [
      { amp: 48, freq: 0.055, phase: 0,   speed: 1.20 },
      { amp: 32, freq: 0.040, phase: 1.6, speed: 1.05 },
      { amp: 22, freq: 0.072, phase: 3.1, speed: 1.35 },
    ],
    rgb: [255, 107, 0],
    glow: 0.22,
    noise: 0,
  },
  sitting: {
    waves: [
      { amp: 14, freq: 0.028, phase: 0,   speed: 0.32 },
      { amp: 9,  freq: 0.038, phase: 1.6, speed: 0.26 },
    ],
    rgb: [255, 140, 58],
    glow: 0.15,
    noise: 0,
  },
  lying: {
    // Breath-like: ~0.25 Hz = 1 cycle every 4 seconds — very peaceful
    waves: [
      { amp: 8,  freq: 0.020, phase: 0,   speed: 0.20 },
      { amp: 5,  freq: 0.026, phase: 1.0, speed: 0.16 },
    ],
    rgb: [59, 130, 246],
    glow: 0.12,
    noise: 0,
  },
  get_up: {
    waves: [
      { amp: 38, freq: 0.044, phase: 0,   speed: 0.85 },
      { amp: 28, freq: 0.064, phase: 1.6, speed: 0.72 },
      { amp: 18, freq: 0.052, phase: 3.1, speed: 0.96 },
    ],
    rgb: [245, 158, 11],
    glow: 0.22,
    noise: 3,
  },
  get_down: {
    // Chaotic but not a strobe — noise kept moderate
    waves: [
      { amp: 60, freq: 0.085, phase: 0,   speed: 2.10 },
      { amp: 45, freq: 0.068, phase: 0.8, speed: 2.50 },
      { amp: 52, freq: 0.100, phase: 1.6, speed: 1.80 },
      { amp: 38, freq: 0.076, phase: 2.4, speed: 2.80 },
    ],
    rgb: [239, 68, 68],
    glow: 0.35,
    noise: 10,
  },
}

export default function WifiWave({ state = 'none' }) {
  const canvasRef = useRef(null)
  const stateRef  = useRef(state)
  const animRef   = useRef(null)
  const tRef      = useRef(0)

  useEffect(() => { stateRef.current = state }, [state])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const loop = () => {
      const w = canvas.width
      const h = canvas.height
      if (!w || !h) { animRef.current = requestAnimationFrame(loop); return }

      const cfg = CFG[stateRef.current] ?? CFG.no_person
      const [r, g, b] = cfg.rgb

      ctx.clearRect(0, 0, w, h)

      // Subtle grid
      ctx.strokeStyle = 'rgba(200,210,220,0.12)'
      ctx.lineWidth = 0.5
      ;[0.25, 0.5, 0.75].forEach(frac => {
        ctx.beginPath()
        ctx.moveTo(0, h * frac)
        ctx.lineTo(w, h * frac)
        ctx.stroke()
      })
      ctx.setLineDash([4, 8])
      ctx.strokeStyle = 'rgba(200,210,220,0.22)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke()
      ctx.setLineDash([])

      // Advance time slowly — ×8 multiplier keeps all waves calm and breath-like
      tRef.current += 0.008

      cfg.waves.forEach((wave, i) => {
        const alpha = 1.0 - i * 0.22
        const lineW = 2.5  - i * 0.4

        ctx.globalAlpha = alpha
        ctx.shadowBlur  = 14 + i * 4
        ctx.shadowColor = `rgba(${r},${g},${b},${cfg.glow})`
        ctx.strokeStyle = `rgb(${r},${g},${b})`
        ctx.lineWidth   = lineW < 0.5 ? 0.5 : lineW

        ctx.beginPath()
        for (let x = 0; x <= w; x++) {
          const noise = cfg.noise ? (Math.random() - 0.5) * cfg.noise : 0
          // Multiplier ×8 (was ×60) — this is the key change that calms the animation
          const y = h / 2
            + wave.amp * Math.sin(wave.freq * x + wave.phase + tRef.current * wave.speed * 8)
            + noise
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
      })

      ctx.globalAlpha = 1
      ctx.shadowBlur  = 0
      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect() }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full block" />
}
