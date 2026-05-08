import { motion, AnimatePresence } from 'framer-motion'

// ─── Pose definitions (SVG coordinate space 200×260) ─────────────────────────
// Each pose is: head {cx,cy}, body {x1,y1,x2,y2}, lArm, rArm, lLeg, rLeg
const POSES = {
  no_person: null,
  standing: {
    head: { cx: 100, cy: 60 },
    body: { x1: 100, y1: 75,  x2: 100, y2: 145 },
    lArm: { x1: 100, y1: 90,  x2: 75,  y2: 120 },
    rArm: { x1: 100, y1: 90,  x2: 125, y2: 120 },
    lLeg: { x1: 100, y1: 145, x2: 82,  y2: 195 },
    rLeg: { x1: 100, y1: 145, x2: 118, y2: 195 },
  },
  walking: {
    head: { cx: 100, cy: 58 },
    body: { x1: 100, y1: 73,  x2: 102, y2: 143 },
    lArm: { x1: 100, y1: 88,  x2: 120, y2: 118 },
    rArm: { x1: 100, y1: 88,  x2: 80,  y2: 115 },
    lLeg: { x1: 102, y1: 143, x2: 78,  y2: 195 },
    rLeg: { x1: 102, y1: 143, x2: 122, y2: 192 },
  },
  sitting: {
    head: { cx: 100, cy: 68 },
    body: { x1: 100, y1: 83,  x2: 100, y2: 140 },
    lArm: { x1: 100, y1: 98,  x2: 74,  y2: 122 },
    rArm: { x1: 100, y1: 98,  x2: 126, y2: 122 },
    lLeg: { x1: 100, y1: 140, x2: 68,  y2: 140 },
    rLeg: { x1: 100, y1: 140, x2: 132, y2: 140 },
  },
  lying: {
    head: { cx: 52, cy: 178 },
    body: { x1: 66,  y1: 178, x2: 148, y2: 178 },
    lArm: { x1: 95,  y1: 178, x2: 78,  y2: 163 },
    rArm: { x1: 95,  y1: 178, x2: 112, y2: 163 },
    lLeg: { x1: 148, y1: 178, x2: 168, y2: 168 },
    rLeg: { x1: 148, y1: 178, x2: 168, y2: 188 },
  },
  get_up: {
    head: { cx: 84, cy: 105 },
    body: { x1: 92,  y1: 118, x2: 112, y2: 165 },
    lArm: { x1: 98,  y1: 132, x2: 68,  y2: 148 },
    rArm: { x1: 98,  y1: 132, x2: 122, y2: 118 },
    lLeg: { x1: 112, y1: 165, x2: 90,  y2: 200 },
    rLeg: { x1: 112, y1: 165, x2: 140, y2: 192 },
  },
  get_down: {
    head: { cx: 60, cy: 192 },
    body: { x1: 74,  y1: 195, x2: 142, y2: 185 },
    lArm: { x1: 95,  y1: 192, x2: 72,  y2: 175 },
    rArm: { x1: 95,  y1: 192, x2: 115, y2: 172 },
    lLeg: { x1: 142, y1: 185, x2: 162, y2: 174 },
    rLeg: { x1: 142, y1: 185, x2: 158, y2: 196 },
  },
}

const STATE_COLORS = {
  no_person: '#94A3B8',
  standing:  '#F59E0B',
  walking:   '#10B981',
  sitting:   '#8B5CF6',
  lying:     '#3B82F6',
  get_up:    '#F97316',
  get_down:  '#EF4444',
}

function Figure({ pose, color, isFall }) {
  if (!pose) return null
  return (
    <g>
      {/* Shadow */}
      <ellipse cx="100" cy="215" rx="28" ry="6" fill="rgba(0,0,0,0.12)" />
      {/* Legs */}
      <motion.line
        x1={pose.lLeg.x1} y1={pose.lLeg.y1} x2={pose.lLeg.x2} y2={pose.lLeg.y2}
        stroke={color} strokeWidth="7" strokeLinecap="round"
        animate={{ x1: pose.lLeg.x1, y1: pose.lLeg.y1, x2: pose.lLeg.x2, y2: pose.lLeg.y2 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
      />
      <motion.line
        x1={pose.rLeg.x1} y1={pose.rLeg.y1} x2={pose.rLeg.x2} y2={pose.rLeg.y2}
        stroke={color} strokeWidth="7" strokeLinecap="round"
        animate={{ x1: pose.rLeg.x1, y1: pose.rLeg.y1, x2: pose.rLeg.x2, y2: pose.rLeg.y2 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
      />
      {/* Body */}
      <motion.line
        x1={pose.body.x1} y1={pose.body.y1} x2={pose.body.x2} y2={pose.body.y2}
        stroke={color} strokeWidth="8" strokeLinecap="round"
        animate={{ x1: pose.body.x1, y1: pose.body.y1, x2: pose.body.x2, y2: pose.body.y2 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
      />
      {/* Arms */}
      <motion.line
        x1={pose.lArm.x1} y1={pose.lArm.y1} x2={pose.lArm.x2} y2={pose.lArm.y2}
        stroke={color} strokeWidth="6" strokeLinecap="round"
        animate={{ x1: pose.lArm.x1, y1: pose.lArm.y1, x2: pose.lArm.x2, y2: pose.lArm.y2 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
      />
      <motion.line
        x1={pose.rArm.x1} y1={pose.rArm.y1} x2={pose.rArm.x2} y2={pose.rArm.y2}
        stroke={color} strokeWidth="6" strokeLinecap="round"
        animate={{ x1: pose.rArm.x1, y1: pose.rArm.y1, x2: pose.rArm.x2, y2: pose.rArm.y2 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
      />
      {/* Head */}
      <motion.circle
        cx={pose.head.cx} cy={pose.head.cy} r={14}
        fill={isFall ? '#FEF2F2' : '#FFF7ED'} stroke={color} strokeWidth="4"
        animate={{ cx: pose.head.cx, cy: pose.head.cy }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
      />
      {/* Walking legs animation */}
    </g>
  )
}

export default function RoomScene({ state = 'standing', isFall = false }) {
  const pose  = POSES[state]
  const color = STATE_COLORS[state] ?? '#94A3B8'

  return (
    <div className="relative w-full h-full min-h-[240px] select-none overflow-hidden rounded-xl">
      <svg
        viewBox="0 0 200 230"
        className="w-full h-full"
        style={{ background: isFall ? 'linear-gradient(160deg, #FEF2F2 0%, #FFF5F5 100%)' : 'linear-gradient(160deg, #F8FAFF 0%, #EFF6FF 100%)' }}
      >
        {/* Room floor */}
        <rect x="0" y="200" width="200" height="30" fill={isFall ? '#FECACA' : '#DBEAFE'} opacity="0.5" />
        {/* Floor line */}
        <line x1="0" y1="200" x2="200" y2="200" stroke={isFall ? '#FCA5A5' : '#BFDBFE'} strokeWidth="1.5" />

        {/* Back wall decoration */}
        <rect x="10" y="20" width="50" height="70" rx="3" fill="none" stroke={isFall ? '#FCA5A5' : '#BFDBFE'} strokeWidth="1" opacity="0.6" />
        <text x="35" y="60" textAnchor="middle" fontSize="18" opacity="0.5">🖼️</text>

        {/* Chair (visible for sitting) */}
        {state === 'sitting' && (
          <>
            <rect x="60" y="140" width="80" height="8" rx="3" fill="#CBD5E1" />
            <rect x="62" y="148" width="6" height="52" rx="2" fill="#94A3B8" />
            <rect x="132" y="148" width="6" height="52" rx="2" fill="#94A3B8" />
            <rect x="130" y="100" width="8" height="42" rx="3" fill="#CBD5E1" />
          </>
        )}

        {/* Bed (visible for lying / get_up / get_down) */}
        {(state === 'lying' || state === 'get_up' || state === 'get_down') && (
          <>
            <rect x="20" y="180" width="160" height="20" rx="4" fill="#CBD5E1" />
            <rect x="20" y="174" width="36" height="28" rx="4" fill="#E2E8F0" />
          </>
        )}

        {/* No-person indicator */}
        {state === 'no_person' && (
          <g>
            <text x="100" y="115" textAnchor="middle" fontSize="44" opacity="0.25">🚫</text>
            <text x="100" y="150" textAnchor="middle" fontSize="11" fill="#94A3B8" fontWeight="600">No presence detected</text>
          </g>
        )}

        {/* Impact burst for get_down */}
        {isFall && (
          <g>
            {[0,45,90,135,180,225,270,315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180
              return (
                <motion.line
                  key={i}
                  x1={70 + Math.cos(rad) * 8} y1={200 + Math.sin(rad) * 4}
                  x2={70 + Math.cos(rad) * 18} y2={200 + Math.sin(rad) * 8}
                  stroke="#EF4444" strokeWidth="2" strokeLinecap="round"
                  animate={{ opacity: [0.8, 0.2, 0.8] }}
                  transition={{ duration: 0.6, delay: i * 0.05, repeat: Infinity }}
                />
              )
            })}
          </g>
        )}

        {/* Character figure */}
        <Figure pose={pose} color={color} isFall={isFall} />
      </svg>
    </div>
  )
}
