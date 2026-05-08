// ─── 7 permitted action states ────────────────────────────────────────────────
export const ACTIVITY_META = {
  no_person: { label: 'No Person', color: '#94A3B8', bg: '#F8FAFC', icon: '🚫' },
  standing:  { label: 'Standing',  color: '#F59E0B', bg: '#FFFBEB', icon: '🧍' },
  walking:   { label: 'Walking',   color: '#10B981', bg: '#ECFDF5', icon: '🚶' },
  sitting:   { label: 'Sitting',   color: '#8B5CF6', bg: '#F5F3FF', icon: '🪑' },
  lying:     { label: 'Lying',     color: '#3B82F6', bg: '#EFF6FF', icon: '🛏️' },
  get_up:    { label: 'Get Up',    color: '#F97316', bg: '#FFF7ED', icon: '⬆️' },
  get_down:  { label: 'Get Down',  color: '#EF4444', bg: '#FEF2F2', icon: '⚠️' },
}

// ─── Patients — fields from synthetic_osteoporosis_patients.csv ───────────────
// Displayed fields: age, sex, disease_history, mobility_status,
//                   lifestyle_profile, favorite_foods, health_belief, cultural_context
export const PATIENTS = [
  {
    id: 1, name: 'Somchai C.',
    age: 70, sex: 'M',
    disease_history: 'Osteoporosis · Osteoarthritis · Prior fragility fracture · Falls in past year',
    mobility_status: 'independent_with_caution',
    lifestyle_profile: 'Exercise: light · Smoking: never · Alcohol: regular · Fall prevention focus',
    favorite_foods: 'Steamed fish · Stir-fried vegetables',
    health_belief: 'Prefers warm foods and soups during recovery',
    cultural_context: 'Multigenerational Chinese-Thai household',
  },
  {
    id: 2, name: 'Prasan T.',
    age: 74, sex: 'M',
    disease_history: 'Osteoporosis · Vitamin D deficiency · Chronic back pain',
    mobility_status: 'independent_with_caution',
    lifestyle_profile: 'Exercise: sedentary · Smoking: never · Alcohol: regular',
    favorite_foods: 'Grilled fish · Rice porridge · Stir-fried basil',
    health_belief: 'Prefers family-centered decision making',
    cultural_context: 'Central Thai urban family',
  },
  {
    id: 3, name: 'Siriporn K.',
    age: 64, sex: 'F',
    disease_history: 'Osteopenia · Dyslipidemia · Vitamin D deficiency · Chronic back pain',
    mobility_status: 'independent',
    lifestyle_profile: 'Exercise: light · Smoking: never · Alcohol: occasional · Fall prevention focus',
    favorite_foods: 'Fish curry · Rice',
    health_belief: 'Coordinates treatment around prayer times and family support',
    cultural_context: 'Southern Thai Muslim family',
  },
  {
    id: 4, name: 'Malee P.',
    age: 87, sex: 'F',
    disease_history: 'Osteoporosis · Osteoarthritis · Prior fragility fracture',
    mobility_status: 'independent_with_caution',
    lifestyle_profile: 'Exercise: sedentary · Smoking: never · Alcohol: occasional',
    favorite_foods: 'Grilled fish · Papaya salad',
    health_belief: 'Values merit-making and temple visits for wellbeing',
    cultural_context: 'Central Thai urban family',
  },
  {
    id: 5, name: 'Wichian S.',
    age: 69, sex: 'M',
    disease_history: 'Normal bone density · Falls in past year',
    mobility_status: 'independent',
    lifestyle_profile: 'Exercise: light · Smoking: never · Alcohol: occasional',
    favorite_foods: 'Dates · Fish curry · Vegetable soup',
    health_belief: 'Coordinates treatment around prayer times and family support',
    cultural_context: 'Southern Thai Muslim family',
  },
]

// ─── Activity patterns — downsampled from activity_tables CSVs ────────────────
// 48 blocks × 30 min each = 24 h. Each value is the mode action over 6×5-min rows.
export const ACTIVITY_PATTERNS = {
  active_day_good_sleep: {
    name: 'Active Day · Good Sleep',
    emoji: '☀️',
    blocks: [
      'lying','lying','lying','lying','lying','lying','lying','lying','lying','lying','lying','lying',
      'walking','sitting','walking','walking','walking','walking','walking','no_person',
      'walking','walking','walking','walking','sitting','walking','walking','standing',
      'walking','sitting','walking','walking','walking','sitting','sitting','sitting',
      'walking','sitting','sitting',
      'lying','lying','lying','lying','lying','lying','lying','lying','lying',
    ],
  },
  insomnia_restless_night: {
    name: 'Insomnia · Restless Night',
    emoji: '🌙',
    blocks: [
      'lying','walking','sitting','lying','walking','sitting','lying','walking','sitting','standing','lying','lying',
      'walking','sitting','sitting','walking','sitting','walking','no_person','sitting','sitting','sitting',
      'lying','lying','lying','walking','sitting','lying','lying','lying','walking','sitting','sitting',
      'walking','sitting','sitting','sitting','lying','lying','walking','sitting',
      'lying','lying','walking','sitting','lying','walking','sitting',
    ],
  },
  dementia_night_wandering: {
    name: 'Dementia · Night Wandering',
    emoji: '🌃',
    blocks: [
      'walking','walking','walking','sitting','walking','walking','no_person','sitting','walking','standing',
      'lying','lying','lying','walking','sitting','walking','sitting','lying','lying','lying','lying','lying',
      'sitting','walking','sitting','lying','lying','lying','lying','lying','walking','sitting',
      'walking','lying','lying','lying','lying','sitting','walking','lying','lying',
      'walking','walking','walking','walking','sitting','walking','walking',
    ],
  },
  depressed_sedentary: {
    name: 'Depressed · Sedentary Day',
    emoji: '🪑',
    blocks: [
      'lying','lying','lying','lying','lying','lying','lying','lying','lying','lying','lying','lying','lying','lying',
      'standing','sitting','sitting','sitting','sitting','sitting','standing','sitting','sitting','sitting',
      'sitting','sitting','sitting','sitting','sitting','sitting','standing','sitting','sitting','sitting',
      'sitting','sitting','sitting','walking','sitting','sitting','sitting','sitting','sitting',
      'lying','lying','lying','lying','lying',
    ],
  },
}

// ─── Activity monitor preset logs (3-min intervals) ───────────────────────────
export const PRESET_A = {
  name: 'Active Morning',
  emoji: '☀️',
  startLabel: '07:00',
  data: [
    { time: '07:00', activity: 'lying',    label: 'Deep Sleep' },
    { time: '07:03', activity: 'lying',    label: 'Deep Sleep' },
    { time: '07:06', activity: 'lying',    label: 'Light Sleep' },
    { time: '07:09', activity: 'lying',    label: 'Light Sleep' },
    { time: '07:12', activity: 'lying',    label: 'Stirring' },
    { time: '07:15', activity: 'get_up',   label: 'Getting Up' },
    { time: '07:18', activity: 'standing', label: 'Standing Up' },
    { time: '07:21', activity: 'walking',  label: 'Morning Walk' },
    { time: '07:24', activity: 'walking',  label: 'Morning Walk' },
    { time: '07:27', activity: 'walking',  label: 'Light Exercise' },
    { time: '07:30', activity: 'standing', label: 'Stretching' },
    { time: '07:33', activity: 'walking',  label: 'Exercise' },
    { time: '07:36', activity: 'walking',  label: 'Cooling Down' },
    { time: '07:39', activity: 'standing', label: 'Breakfast Prep' },
    { time: '07:42', activity: 'sitting',  label: 'Eating Breakfast' },
    { time: '07:45', activity: 'sitting',  label: 'Eating Breakfast' },
    { time: '07:48', activity: 'walking',  label: 'Tidying Up' },
    { time: '07:51', activity: 'sitting',  label: 'Reading / Resting' },
    { time: '07:54', activity: 'sitting',  label: 'Reading' },
    { time: '07:57', activity: 'walking',  label: 'Moving Around' },
  ],
}

export const PRESET_B = {
  name: 'Restless Night',
  emoji: '🌙',
  startLabel: '02:00',
  data: [
    { time: '02:00', activity: 'lying',    label: 'Sleeping' },
    { time: '02:03', activity: 'lying',    label: 'Sleeping' },
    { time: '02:06', activity: 'lying',    label: 'Tossing & Turning' },
    { time: '02:09', activity: 'get_up',   label: 'Suddenly Awake' },
    { time: '02:12', activity: 'walking',  label: 'Pacing Bedroom' },
    { time: '02:15', activity: 'walking',  label: 'Restless Pacing' },
    { time: '02:18', activity: 'sitting',  label: 'Sitting on Bed' },
    { time: '02:21', activity: 'lying',    label: 'Attempted Sleep' },
    { time: '02:24', activity: 'lying',    label: 'Restless Sleep' },
    { time: '02:27', activity: 'get_up',   label: 'Woke Again' },
    { time: '02:30', activity: 'walking',  label: 'Pacing Hallway' },
    { time: '02:33', activity: 'walking',  label: 'Walking to Kitchen' },
    { time: '02:36', activity: 'standing', label: 'Standing in Kitchen' },
    { time: '02:39', activity: 'walking',  label: 'Pacing Again' },
    { time: '02:42', activity: 'lying',    label: 'Back to Bed' },
    { time: '02:45', activity: 'lying',    label: 'Restless Sleep' },
    { time: '02:48', activity: 'lying',    label: 'Restless Sleep' },
    { time: '02:51', activity: 'get_up',   label: 'Woke Up Again' },
    { time: '02:54', activity: 'walking',  label: 'Pacing' },
    { time: '02:57', activity: 'lying',    label: 'Finally Resting' },
  ],
}

// ─── Social Prescription generator ────────────────────────────────────────────
export function generatePrescription(patient, patternKey) {
  const pattern = ACTIVITY_PATTERNS[patternKey]
  const blocks  = pattern.blocks
  const counts  = {}
  Object.keys(ACTIVITY_META).forEach(k => (counts[k] = 0))
  blocks.forEach(b => { if (counts[b] !== undefined) counts[b]++ })

  const lyingHrs   = ((counts.lying   * 30) / 60).toFixed(1)
  const sittingHrs = ((counts.sitting * 30) / 60).toFixed(1)
  const walkingHrs = ((counts.walking * 30) / 60).toFixed(1)
  const getDowns   = counts.get_down

  const isRestless  = patternKey === 'insomnia_restless_night'
  const isWandering = patternKey === 'dementia_night_wandering'
  const isSedentary = patternKey === 'depressed_sedentary'

  const riskLine = patient.mobility_status === 'independent_with_caution'
    ? `⚠️ Mobility status: **independent with caution** — recommend supervised transitions and fall prevention aids.`
    : `✅ Mobility status: **independent** — encourage daily self-directed activity.`

  const culturalTip = patient.cultural_context.includes('Muslim')
    ? `\n5. 🕌 **Prayer-Aligned Activity Windows** — Schedule gentle walks and stretching around Fajr and Dhuhr prayer times, using the natural rhythm as a movement cue.`
    : patient.cultural_context.includes('Chinese-Thai')
    ? `\n5. 🍵 **Morning Tai Chi** — Consistent with traditional Chinese wellness practices, a 20-min tai chi session builds balance and reduces fall anxiety.`
    : `\n5. 🛕 **Community Temple Walk** — A gentle walk to the local temple twice a week satisfies the patient's health belief and provides structured outdoor movement.`

  return `**Patient:** ${patient.name} · ${patient.age}y · ${patient.sex === 'M' ? 'Male' : 'Female'}
**Conditions:** ${patient.disease_history}
**Culture:** ${patient.cultural_context}

${riskLine}

**24-Hour Pattern: ${pattern.name}**
Sleep ${lyingHrs}h · Sitting ${sittingHrs}h · Walking ${walkingHrs}h${getDowns > 0 ? ` · ⚠️ ${getDowns} fall event(s)` : ''}

**Social Prescription**

1. 🌞 **Morning Sunlight Walk** — 15 min at sunrise. Sunlight supports calcium absorption — critical for ${patient.disease_history.split('·')[0].trim()}.

2. 🥗 **Nutrition Support** — Encourage culturally preferred foods: ${patient.favorite_foods}. Ensure adequate calcium and vitamin D alongside current medications.

3. ${isRestless || isWandering ? '😴 **Sleep Hygiene Program**' : isSedentary ? '🚶 **Break Sedentary Patterns**' : '🌱 **Community Group Activity**'} — ${
    isRestless   ? 'Refer to sleep clinic. Nighttime waking pattern detected — avoid screens 1h before bed, use dim lighting.'
    : isWandering ? 'Safe wandering protocol: secure environment, GPS wearable, nighttime lighting. Family caregiver education recommended.'
    : isSedentary ? 'Hourly stand-and-walk reminders. Target < 8h sitting/day. Current: ' + sittingHrs + 'h.'
    : 'Join a local senior group (gardening, reading, or craft) twice weekly to reduce isolation and sustain light physical activity.'
  }

4. 💊 **Medication Reminder** — ${patient.lifestyle_profile.includes('sedentary') ? 'Patient is sedentary — ensure medication adherence tracking is in place.' : 'Encourage consistent medication routine aligned with daily walk schedule.'}${culturalTip}

*Generated by Mitr AI · Powered by OpenAI GPT-4o · For informational purposes only.*`
}
