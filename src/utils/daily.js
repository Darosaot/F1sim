// Daily challenge: everyone gets the same configuration, the same seeded
// sequence of rolls and the same seeded season for a given UTC day, so
// scores are comparable and a shared team reproduces its exact result.
import { seededRng } from './random'
import { getAvailableRivalYears } from './rivalBuilder'

export function todayKey(now = new Date()) {
  return now.toISOString().slice(0, 10)
}

export function dailyConfig(date) {
  const years = getAvailableRivalYears()
  const rivalYear = years[Math.floor(seededRng('daily', date, 'rivals')() * years.length)]
  return { era: 'all', mode: 'vip', draftDifficulty: 'medium', rivalYear }
}

// One rng per roll, keyed by roll number: roll N draws from the same
// sequence for every player
export function dailyRollRng(date, rollNumber) {
  return seededRng('daily', date, 'roll', rollNumber)
}

export function dailySeasonRng(date) {
  return seededRng('daily', date, 'season')
}

export function dailyShareText({ date, rivalYear, constructorPos, points, d1FinalPos, d2FinalPos, url }) {
  const medal = constructorPos === 1 ? '🏆' : constructorPos <= 3 ? '🥇' : '🏁'
  return [
    `F1—P1 · Reto diario ${date}`,
    `${medal} P${constructorPos} constructores · ${points} pts`,
    `🪖 Pilotos P${d1FinalPos} / P${d2FinalPos} · vs parrilla ${rivalYear}`,
    url,
  ].filter(Boolean).join('\n')
}
