import driversData from '../data/drivers.json'
import chassisData from '../data/chassis.json'
import enginesData from '../data/engines.json'
import tpData from '../data/team_principals.json'
import tdData from '../data/technical_directors.json'
import tiresData from '../data/tires.json'
import seasonsData from '../data/seasons.json'

const ERA_RANGES = {
  all:        null,
  early:      [1950, 1965],
  pre_turbo:  [1966, 1982],
  turbo:      [1983, 1988],
  v10:        [1989, 2005],
  v8:         [2006, 2013],
  hybrid:     [2014, 2021],
  current:    [2022, 2025],
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

export function getRandomSeason(era, excludeIds = []) {
  const filtered = getFilteredSeasons(era).filter(s => !excludeIds.includes(s.id))
  if (filtered.length === 0) return null
  return filtered[Math.floor(Math.random() * filtered.length)]
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
    tires: tiresData.find(t => t.id === season.tires) || null,
    aero: season.aero_index,
    budget: season.budget_index,
    reliability: season.reliability_index,
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
