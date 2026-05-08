import { ACTIVITY_META } from '../data/mockData'

const ACTION_KEYS = ['no_person', 'standing', 'walking', 'sitting', 'lying', 'get_up', 'get_down']

function openAIConfig() {
  return {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o',
  }
}

function extractResponseText(data) {
  const chunks = []
  for (const item of data.output || []) {
    if (item.type !== 'message') continue
    for (const content of item.content || []) {
      if (content.type === 'output_text') chunks.push(content.text)
    }
  }
  return chunks.join('\n').trim() || data.output_text || ''
}

async function callOpenAI(prompt, maxOutputTokens = 1200) {
  const { apiKey, model } = openAIConfig()
  if (!apiKey || apiKey.includes('your-openai-api-key')) {
    throw new Error('Missing VITE_OPENAI_API_KEY in .env')
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      instructions: 'You are a clinical wellness analytics assistant. Write in English. Be practical, concise, and cautious.',
      input: prompt,
      temperature: 0.2,
      max_output_tokens: maxOutputTokens,
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`OpenAI API error ${response.status}: ${detail}`)
  }

  const data = await response.json()
  return extractResponseText(data)
}

function percent(value, total) {
  if (!total) return 0
  return Math.round((value / total) * 1000) / 10
}

function longestRun(actions, intervalMinutes) {
  let bestAction = null
  let bestCount = 0
  let currentAction = null
  let currentCount = 0

  actions.forEach(action => {
    if (action === currentAction) {
      currentCount += 1
    } else {
      currentAction = action
      currentCount = 1
    }
    if (currentCount > bestCount) {
      bestAction = currentAction
      bestCount = currentCount
    }
  })

  return {
    action: bestAction,
    minutes: bestCount * intervalMinutes,
    label: ACTIVITY_META[bestAction]?.label || bestAction,
  }
}

export function summarizeShortActivityLog(data) {
  const intervalMinutes = 3
  const actionMinutes = Object.fromEntries(ACTION_KEYS.map(key => [key, 0]))
  data.forEach(entry => {
    if (actionMinutes[entry.activity] !== undefined) actionMinutes[entry.activity] += intervalMinutes
  })
  const totalMinutes = data.length * intervalMinutes

  return {
    source: '1-hour activity monitor log',
    start_time: data[0]?.time,
    end_time: data[data.length - 1]?.time,
    sampling_interval_minutes: intervalMinutes,
    total_minutes: totalMinutes,
    action_minutes: actionMinutes,
    action_percent: Object.fromEntries(ACTION_KEYS.map(key => [key, percent(actionMinutes[key], totalMinutes)])),
    action_labels: Object.fromEntries(ACTION_KEYS.map(key => [key, ACTIVITY_META[key]?.label || key])),
    get_up_count: data.filter(entry => entry.activity === 'get_up').length,
    get_down_count: data.filter(entry => entry.activity === 'get_down').length,
    longest_continuous_state: longestRun(data.map(entry => entry.activity), intervalMinutes),
  }
}

export function summarizePattern(pattern) {
  const intervalMinutes = 30
  const actionMinutes = Object.fromEntries(ACTION_KEYS.map(key => [key, 0]))
  pattern.blocks.forEach(action => {
    if (actionMinutes[action] !== undefined) actionMinutes[action] += intervalMinutes
  })
  const totalMinutes = pattern.blocks.length * intervalMinutes
  const nightBlocks = pattern.blocks.slice(0, 12).concat(pattern.blocks.slice(44))
  const dayBlocks = pattern.blocks.slice(12, 44)
  const nightActiveMinutes = nightBlocks.filter(action => ['walking', 'standing', 'sitting', 'get_up'].includes(action)).length * intervalMinutes
  const daytimeSedentaryMinutes = dayBlocks.filter(action => ['sitting', 'lying'].includes(action)).length * intervalMinutes

  return {
    source: '24-hour activity pattern',
    activity_pattern_name: pattern.name,
    sampling_interval_minutes: intervalMinutes,
    total_minutes: totalMinutes,
    action_minutes: actionMinutes,
    action_percent: Object.fromEntries(ACTION_KEYS.map(key => [key, percent(actionMinutes[key], totalMinutes)])),
    action_labels: Object.fromEntries(ACTION_KEYS.map(key => [key, ACTIVITY_META[key]?.label || key])),
    walking_minutes: actionMinutes.walking,
    standing_minutes: actionMinutes.standing,
    sitting_minutes: actionMinutes.sitting,
    lying_minutes: actionMinutes.lying,
    daytime_sedentary_minutes: daytimeSedentaryMinutes,
    daytime_sedentary_percent: percent(daytimeSedentaryMinutes, dayBlocks.length * intervalMinutes),
    night_active_minutes: nightActiveMinutes,
    get_up_count: pattern.blocks.filter(action => action === 'get_up').length,
    get_down_count: pattern.blocks.filter(action => action === 'get_down').length,
    longest_continuous_state: longestRun(pattern.blocks, intervalMinutes),
    behavior_flags: [
      ...(daytimeSedentaryMinutes / (dayBlocks.length * intervalMinutes) >= 0.7 ? ['daytime_sedentary_high'] : []),
      ...(actionMinutes.walking < 30 ? ['walking_minutes_low'] : []),
      ...(nightActiveMinutes / (nightBlocks.length * intervalMinutes) >= 0.2 ? ['night_restlessness'] : []),
      ...(actionMinutes.get_up + actionMinutes.get_down >= 60 ? ['many_transfer_events'] : []),
    ],
  }
}

export async function analyzeActivityWithOpenAI(activitySummary) {
  const prompt = `Analyze the following WiFi CSI activity data. The CSI signal has already been converted into action labels.

Write the answer as one single English paragraph only. Do not use headings, bullet points, numbering, tables, or Markdown section titles. The paragraph should be concise but cover the activity overview, day-vs-night pattern if present, mobility/sedentary pattern, potential concern signals, and useful follow-up metrics. Aim for 5-7 sentences.

Important constraints:
- Use only the activity table summary below.
- Do not mention patient identity, demographics, diagnoses, medications, fall risk, or social context.
- Ground every insight in the provided activity summary.
- Do not diagnose disease.

Activity summary JSON:
${JSON.stringify(activitySummary, null, 2)}`

  return callOpenAI(prompt, 900)
}

export async function generateSocialPrescriptionWithOpenAI(patient, activitySummary, activityAnalysis) {
  const patientForPrompt = {
    ...patient,
    age: Math.round(Number(patient.age)),
    sex_label: patient.sex === 'M' ? 'male' : patient.sex === 'F' ? 'female' : patient.sex,
    diagnosis: patient.diagnosis || String(patient.disease_history || '').split('·')[0].trim(),
  }
  const hasRiskSignals = Boolean(activitySummary.behavior_flags?.length)
    || String(patientForPrompt.fall_risk_level || '').toLowerCase() === 'moderate'
    || String(patientForPrompt.fall_risk_level || '').toLowerCase() === 'high'
    || Boolean(patientForPrompt.history_of_falls_past_year)
    || Boolean(patientForPrompt.prior_fragility_fracture)

  const riskInstruction = hasRiskSignals
    ? "Include a section titled '## Risk Signals to Monitor'. Keep it very short: maximum 3 concise bullets, only risks supported by the data."
    : 'Do not include a Risk Signals section because no clear risk signal is present in the provided data.'

  const prompt = `Use the prior WiFi CSI activity analysis together with the osteoporosis patient profile to produce Behavioral Insights and a Social Prescription.

Write the answer in English Markdown with this structure:
1. Start with '# Integrated Clinical-Behavioral Snapshot'. Under it, include only one patient info line using this exact style: '**Patient:** [age as integer]-year-old [sex_label], [diagnosis], fall risk: [level], mobility: [status].' Do not add any paragraph, bullet, or extra sentence under this heading.
2. Then include '## Behavioral Insights' as the main section with practical, data-grounded bullets.
3. Then include '## Social Prescription' as the main action section with practical bullets.
4. ${riskInstruction}

Important constraints:
- Do not make a new medical diagnosis and do not replace clinician advice.
- Tailor recommendations to fall risk, osteoporosis/osteopenia context, mobility status, activity barriers, cultural context, and social goal.
- Social Prescription should include practical home/family/community actions that are safe for a person with osteoporosis risk.
- Do not include a Care Team / Family Follow-Up section.
- Keep the overall response concise. The main content should be Behavioral Insights and Social Prescription.
- If the evidence is limited to one day of activity data, say so clearly.

Patient profile JSON:
${JSON.stringify(patientForPrompt, null, 2)}

Computed activity summary JSON:
${JSON.stringify(activitySummary, null, 2)}

Prior OpenAI activity-only analysis:
${activityAnalysis}`

  return callOpenAI(prompt, 1800)
}
