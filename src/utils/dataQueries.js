import driversData from '../data/drivers.json'
import chassisData from '../data/chassis.json'
import enginesData from '../data/engines.json'
import tpData from '../data/team_principals.json'
import tdData from '../data/technical_directors.json'
import tiresData from '../data/tires.json'
import seasonsData from '../data/seasons.json'
import strategistsData from '../data/strategists.json'
import { hashString } from './random'

const ERA_RANGES = {
  all:        null,
  early:      [1950, 1965],
  pre_turbo:  [1966, 1982],
  turbo:      [1983, 1988],
  v10:        [1989, 2005],
  v8:         [2006, 2013],
  hybrid:     [2014, 2021],
  current:    [2022, 2026],
}

function matchesEra(item, era) {
  if (!era || era === 'all') return true
  const range = ERA_RANGES[era]
  if (!range) return true
  const [min, max] = range
  const year = item.year || (item.years_available ? item.years_available[0] : null)
  if (!year) {
    return item.era === era || (item.peak_years || []).some(y => y >= min && y <= max)
  }
  return year >= min && year <= max
}

export function getFilteredSeasons(era) {
  return seasonsData.filter(s => matchesEra(s, era))
}

function weightedRandom(items, weightFn, rng) {
  const weights = items.map(weightFn)
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rng() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

// difficulty: 'hard' | 'medium' | 'easy'
// hard    → team-equal probability (every team equally likely, random year within team)
// medium  → weighted by budget_index^1.5 (better teams moderately more likely)
// easy    → weighted by budget_index^3   (top teams heavily favoured)
export function getRandomSeason(era, excludeIds = [], difficulty = 'hard', rng = Math.random) {
  const filtered = getFilteredSeasons(era).filter(s => !excludeIds.includes(s.id))
  if (filtered.length === 0) return null

  if (difficulty === 'easy') {
    return weightedRandom(filtered, s => Math.pow(Math.max(1, s.budget_index ?? 50), 3), rng)
  }
  if (difficulty === 'medium') {
    return weightedRandom(filtered, s => Math.pow(Math.max(1, s.budget_index ?? 50), 1.5), rng)
  }

  // Hard: team-equal probability — each team equally likely regardless of seasons count
  const byTeam = {}
  for (const s of filtered) {
    if (!byTeam[s.team]) byTeam[s.team] = []
    byTeam[s.team].push(s)
  }
  const teams = Object.values(byTeam)
  const randomTeam = teams[Math.floor(rng() * teams.length)]
  return randomTeam[Math.floor(rng() * randomTeam.length)]
}

const STRATEGIST_ATTRS = ['race_management', 'pit_timing', 'undercut_instinct', 'safety_car_read', 'pressure_decisions']

// The pit wall for a season: a named strategist when one worked for this
// team within two years of a peak season, otherwise the team's generic
// strategy group, rated from its budget (richer teams, better tools).
export function resolveStrategist(season) {
  const named = strategistsData.find(st =>
    st.teams.some(t => t.toLowerCase() === season.team.toLowerCase()) &&
    st.peak_years.some(y => Math.abs(y - season.year) <= 2)
  )
  if (named) return named

  const base = 42 + (season.budget_index ?? 50) * 0.42
  const h = hashString(season.id)
  const attributes = {}
  STRATEGIST_ATTRS.forEach((k, i) => {
    const jitter = ((h >>> (i * 5)) % 9) - 4 // deterministic -4..+4
    attributes[k] = Math.max(30, Math.min(88, Math.round(base + jitter)))
  })
  return {
    id: `wall:${season.id}`,
    name: `Muro de ${season.team}`,
    team: season.team,
    year: season.year,
    generic: true,
    attributes,
    bio: `El equipo de estrategia de ${season.team} en ${season.year}.`,
  }
}

function strategistFromId(id) {
  if (!id) return null
  if (id.startsWith('wall:')) {
    const season = seasonsData.find(s => s.id === id.slice(5))
    return season ? resolveStrategist(season) : null
  }
  return strategistsData.find(s => s.id === id) ?? null
}

export function resolveSeasonElements(season) {
  return {
    season,
    driver1: driversData.find(d => d.id === season.driver1) || null,
    driver2: season.driver2 ? driversData.find(d => d.id === season.driver2) : null,
    chassis: chassisData.find(c => c.id === season.chassis) || null,
    engine: enginesData.find(e => e.id === season.engine) || null,
    team_principal: tpData.find(t => t.id === season.tp) || null,
    technical_director: tdData.find(t => t.id === season.td) || null,
    strategist: resolveStrategist(season),
    tires: tiresData.find(t => t.id === season.tires) || null,
    aero: season.aero_index,
    budget: season.budget_index,
    reliability: season.reliability_index,
  }
}

// Resolve a decoded share payload (IDs) back to full element objects
export function resolveSharedTeam(p) {
  if (!p) return null
  return {
    driver1:            driversData.find(d => d.id === p.d1) ?? null,
    driver2:            driversData.find(d => d.id === p.d2) ?? null,
    team_principal:     tpData.find(t => t.id === p.tp) ?? null,
    technical_director: tdData.find(t => t.id === p.td) ?? null,
    strategist:         strategistFromId(p.st),
    chassis:            chassisData.find(c => c.id === p.ch) ?? null,
    engine:             enginesData.find(e => e.id === p.en) ?? null,
    tires:              tiresData.find(t => t.id === p.ti) ?? null,
    aero:               typeof p.ae === 'number' ? p.ae : null,
    budget:             typeof p.bu === 'number' ? p.bu : null,
    reliability:        typeof p.re === 'number' ? p.re : null,
  }
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
