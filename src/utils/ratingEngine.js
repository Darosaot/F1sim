import circuits from '../data/circuits.json'
import seasonsData from '../data/seasons.json'
import { buildProfile, expectedStrength } from './performanceModel'
import { resolveSeasonElements } from './dataQueries'

export const SLOT_LABELS = {
  driver1:             { label: 'Piloto 1',           emoji: '🪖' },
  driver2:             { label: 'Piloto 2',           emoji: '🏎️' },
  team_principal:      { label: 'Jefe de Equipo',     emoji: '🎯' },
  technical_director:  { label: 'Director Técnico',   emoji: '🔧' },
  strategist:          { label: 'Estratega',          emoji: '📻' },
  chassis:             { label: 'Chasis',              emoji: '⚙️' },
  engine:              { label: 'Motor',               emoji: '🔋' },
  tires:               { label: 'Neumáticos',          emoji: '🔵' },
  aero:                { label: 'Aerodinámica',        emoji: '💨' },
  budget:              { label: 'Financiación',        emoji: '💰' },
  reliability:         { label: 'Fiabilidad',          emoji: '🛡️' },
}

export const SLOT_KEYS  = Object.keys(SLOT_LABELS)
export const SLOT_COUNT = SLOT_KEYS.length

// Maps the model's expected race score onto a 30–99 scale. Calibrated on
// every real season in the dataset: the weakest backmarkers (~38) land at
// 30, the dominant cars (Mercedes 2019, Red Bull 2022, ~113) at 99.
const RAW_MIN = 38
const RAW_MAX = 113
function toRating(raw) {
  const r = 30 + (raw - RAW_MIN) * (69 / (RAW_MAX - RAW_MIN))
  return Math.round(Math.max(0, Math.min(99, r)) * 10) / 10
}

// Team rating = the simulator's own performance model at expected values,
// so a higher rating really means more points. Empty slots count as the
// same neutral defaults the simulator uses.
export function calculateTeamRating(team) {
  return toRating(expectedStrength(buildProfile(team), circuits))
}

export function getElementValue(element, slotKey) {
  if (!element) return 0
  if (slotKey === 'aero' || slotKey === 'budget' || slotKey === 'reliability') {
    return typeof element === 'number' ? element : 0
  }
  const attrs = element.attributes
  if (!attrs) return 0
  const values = Object.values(attrs)
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

let seasonRatings = null
function getSeasonRatings() {
  if (!seasonRatings) {
    seasonRatings = seasonsData
      .map(s => ({ season: s, rating: calculateTeamRating(resolveSeasonElements(s)) }))
      .sort((a, b) => b.rating - a.rating)
  }
  return seasonRatings
}

// The real team-season whose rating is closest to the given one
export function getBenchmark(rating) {
  let best = null
  for (const entry of getSeasonRatings()) {
    if (!best || Math.abs(entry.rating - rating) < Math.abs(best.rating - rating)) best = entry
  }
  return best && { name: `${best.season.team} ${best.season.year}`, rating: best.rating }
}
