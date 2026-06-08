#!/usr/bin/env node
/**
 * F1 Data Pipeline — reads local f1db JSON files, generates game JSON
 *
 * Prerequisites:
 *   Download f1db-json-splitted.zip to scripts/f1db/ and unzip it.
 *   https://github.com/f1db/f1db/releases/latest
 *
 * Usage:
 *   node scripts/fetch_f1db.js                   # all years 1950-2024
 *   node scripts/fetch_f1db.js --from 2010 --to 2024
 *   node scripts/fetch_f1db.js --year 2023
 *
 * Output: scripts/generated/new_{seasons,drivers,chassis,engines}.json
 * Then run: node scripts/apply_generated.js
 */

const fs = require('fs')
const path = require('path')

const F1DB_DIR = path.join(__dirname, 'f1db')
const DATA_DIR = path.join(__dirname, '../src/data')
const GEN_DIR  = path.join(__dirname, 'generated')
const MAP_DIR  = path.join(__dirname, 'mappings')

fs.mkdirSync(GEN_DIR, { recursive: true })

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
let fromYear = 1950, toYear = 2026
const yearIdx = args.indexOf('--year')
if (yearIdx !== -1) { fromYear = toYear = parseInt(args[yearIdx + 1]) }
const fromIdx = args.indexOf('--from')
if (fromIdx !== -1) fromYear = parseInt(args[fromIdx + 1])
const toIdx = args.indexOf('--to')
if (toIdx !== -1) toYear = parseInt(args[toIdx + 1])

// --force: regenerate all entries, ignoring existing IDs (use with apply_generated --overwrite)
const FORCE = args.includes('--force')

// ── Load f1db files ───────────────────────────────────────────────────────────
function loadF1db(name) {
  const p = path.join(F1DB_DIR, name)
  if (!fs.existsSync(p)) throw new Error(`f1db file not found: ${name}\nDownload from https://github.com/f1db/f1db/releases/latest`)
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

console.log('Loading f1db files...')
const entrantConstructors = loadF1db('f1db-seasons-entrants-constructors.json')
const entrantChassis      = loadF1db('f1db-seasons-entrants-chassis.json')
const entrantEngines      = loadF1db('f1db-seasons-entrants-engines.json')
const entrantDrivers      = loadF1db('f1db-seasons-entrants-drivers.json')
const entrantTyres        = loadF1db('f1db-seasons-entrants-tyre-manufacturers.json')
const constructorStandings = loadF1db('f1db-seasons-constructor-standings.json')
const driverStandings      = loadF1db('f1db-seasons-driver-standings.json')
const raceResults          = loadF1db('f1db-races-race-results.json')
const driversDb            = loadF1db('f1db-drivers.json')
const chassisDb            = loadF1db('f1db-chassis.json')
const enginesDb            = loadF1db('f1db-engines.json')

// ── Load mapping files ────────────────────────────────────────────────────────
const constructorNames = JSON.parse(fs.readFileSync(path.join(MAP_DIR, 'constructor_names.json'), 'utf8'))
const engineMapping    = JSON.parse(fs.readFileSync(path.join(MAP_DIR, 'engines.json'), 'utf8'))
const tpMapping        = JSON.parse(fs.readFileSync(path.join(MAP_DIR, 'team_principals.json'), 'utf8'))
const tdMapping        = JSON.parse(fs.readFileSync(path.join(MAP_DIR, 'technical_directors.json'), 'utf8'))
const tyreMapping      = JSON.parse(fs.readFileSync(path.join(MAP_DIR, 'tires.json'), 'utf8'))

// ── Load existing game data for deduplication ─────────────────────────────────
function loadGameData(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'))
}
const existingSeasons = loadGameData('seasons.json')
const existingDrivers = loadGameData('drivers.json')
const existingChassis = loadGameData('chassis.json')
const existingEngines = loadGameData('engines.json')

const existingSeasonIds    = new Set(existingSeasons.map(s => s.id))
const existingSeasonYearTeam = new Set(existingSeasons.map(s => `${s.year}_${s.team}`))
const existingDriverIds    = new Set(existingDrivers.map(d => d.id))
const existingChassisIds   = new Set(existingChassis.map(c => c.id))
const existingEngineIds    = new Set(existingEngines.map(e => e.id))

// ── f1db ID → underscore key ──────────────────────────────────────────────────
function toKey(id) { return id.replace(/-/g, '_') }

// ── f1db constructorId special-case overrides for team name lookup ────────────
// Maps f1db constructorId → key used in constructor_names.json
const CONSTRUCTOR_KEY_OVERRIDES = {
  'alfa-romeo':    'alfa_romeo',   // game mapping has 'alfa' but we add 'alfa_romeo'
  'racing-bulls':  'rb',
  'kick-sauber':   'sauber',
  'lotus-f1':      'lotus_f1',
  'lotus-racing':  'lotus_racing',
}

// Extended constructor names (covers f1db IDs not in original mapping)
const F1DB_CONSTRUCTOR_NAMES = {
  'alfa_romeo':     'Alfa Romeo',
  'racing_bulls':   'Racing Bulls',
  'kick_sauber':    'Kick Sauber',
  'talbot_lago':    'Talbot-Lago',
  'gordini':        'Gordini',
  'osca':           'OSCA',
  'connaught':      'Connaught',
  'alta':           'Alta',
  'emi':            'EMI',
  'kurtis_kraft':   'Kurtis Kraft',
  'wetteroth':      'Wetteroth',
  'hws':            'HWS',
  'novak':          'Novak',
  'sherman':        'Sherman',
  'deidt':          'Deidt',
  'ewing':          'Ewing',
  'bromme':         'Bromme',
  'marchese':       'Marchese',
  'christensen':    'Christensen',
  'lesovsky':       'Lesovsky',
  'erskine':        'Erskine Staley',
  'fwd':            'FWD',
  'afm':            'AFM',
  'frazer_nash':    'Frazer Nash',
  'hec_miller':     'HEC Miller',
  'schroeder':      'Schroeder',
  'klenk':          'Klenk',
  'stovebolt':      'Stovebolt',
  'pawl':           'Pawl',
  'arzani_volpini': 'Arzani-Volpini',
  'enrico_platé':   'Enrico Platé',
  'bmw':            'BMW',
  'matra':          'Matra',
  'de_tomaso':      'De Tomaso',
  'surtees':        'Surtees',
  'iso_marlboro':   'Iso Marlboro',
  'penske':         'Penske',
  'fittipaldi':     'Fittipaldi',
  'hesketh':        'Hesketh',
  'embassy_hill':   'Embassy Hill',
  'martini':        'Martini',
  'ats':            'ATS',
  'rebaque':        'Rebaque',
  'ensign':         'Ensign',
  'foca':           'FOCA',
  'theodore':       'Theodore',
  'ram':            'RAM',
  'spirit':         'Spirit',
  'life':           'Life',
  'first':          'First',
}

function getTeamName(constructorId) {
  const override = CONSTRUCTOR_KEY_OVERRIDES[constructorId]
  const key = override || toKey(constructorId)
  return constructorNames[key] || F1DB_CONSTRUCTOR_NAMES[key] || toTitle(constructorId)
}

function toTitle(str) {
  return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ── Era by year ───────────────────────────────────────────────────────────────
function getEra(year) {
  if (year <= 1965) return 'early'
  if (year <= 1982) return 'pre_turbo'
  if (year <= 1988) return 'turbo'
  if (year <= 2005) return 'v10_v12'
  if (year <= 2013) return 'v8'
  if (year <= 2021) return 'hybrid'
  return 'current'
}

// ── Lookup helpers ────────────────────────────────────────────────────────────
// Build index: year+entrantId → row (for chassis/engine/tyre — one entry per entrant)
function buildIndex(arr, keys) {
  const idx = {}
  for (const row of arr) {
    const k = keys.map(k => row[k]).join('|')
    if (!idx[k]) idx[k] = []
    idx[k].push(row)
  }
  return idx
}

const chassisIdx   = buildIndex(entrantChassis,  ['year', 'entrantId'])
const engineIdx    = buildIndex(entrantEngines,   ['year', 'entrantId'])
const tyreIdx      = buildIndex(entrantTyres,     ['year', 'entrantId'])
const driverIdx    = buildIndex(entrantDrivers,   ['year', 'entrantId'])

// By year+constructorId for standings
const standingsMap = {}
for (const s of constructorStandings) {
  standingsMap[`${s.year}|${s.constructorId}`] = s
}

// By year+constructorId for race results (DNF calc)
const raceMap = {}
for (const r of raceResults) {
  const k = `${r.year}|${r.constructorId}`
  if (!raceMap[k]) raceMap[k] = []
  raceMap[k].push(r)
}

// Driver stats lookup
const driverStatsMap = {}
for (const d of driversDb) driverStatsMap[d.id] = d

// Chassis lookup by f1db id
const chassisInfoMap = {}
for (const c of chassisDb) chassisInfoMap[c.id] = c

// Engine info lookup
const engineInfoMap = {}
for (const e of enginesDb) engineInfoMap[e.id] = e

// Driver standings for year (best position)
const driverStandingsMap = {}
for (const ds of driverStandings) {
  const k = `${ds.year}|${ds.driverId}`
  if (!driverStandingsMap[k]) driverStandingsMap[k] = ds
}

// ── Constructor standings by year — group entrants by constructorId ─────────
// f1db entrants: multiple entrants can share a constructorId (customer teams)
// We want one game entry per constructor per year

// Build: year+constructorId → list of entrantIds
const constructorEntrants = {}
for (const row of entrantConstructors) {
  const k = `${row.year}|${row.constructorId}`
  if (!constructorEntrants[k]) constructorEntrants[k] = []
  if (!constructorEntrants[k].includes(row.entrantId)) {
    constructorEntrants[k].push(row.entrantId)
  }
}

// ── TP/TD lookup ──────────────────────────────────────────────────────────────
function lookupMapping(mappingObj, constructorId, year) {
  const override = CONSTRUCTOR_KEY_OVERRIDES[constructorId]
  const key = override || toKey(constructorId)
  const entries = mappingObj[key]
  if (!entries) return null
  for (const e of entries) {
    const val = e.tp || e.td
    if (year >= e.from && year <= e.to) return val
  }
  return null
}

// ── Engine mapping: constructorId + year → game engine ID ────────────────────
function lookupEngine(constructorId, year) {
  const override = CONSTRUCTOR_KEY_OVERRIDES[constructorId]
  const key = override || toKey(constructorId)
  const entries = engineMapping[key]
  if (!entries) return null
  for (const e of entries) {
    if (year >= e.from && year <= e.to) return e.engine
  }
  return null
}

// ── Generate game engine ID from f1db engine ──────────────────────────────────
function f1dbEngineToGameId(engineId) {
  // e.g. "ferrari-066-10-16-v6-t-h" → "ferrari_066_10_16_v6_t_h"
  return toKey(engineId)
}

// ── Generate game chassis ID ─────────────────────────────────────────────────
function f1dbChassisToGameId(chassisId, year) {
  return `${toKey(chassisId)}_${year}`
}

// ── Driver ID from f1db driverId ──────────────────────────────────────────────
function f1dbDriverToGameId(driverId, year) {
  // "juan-manuel-fangio" → "fangio_1954"
  const parts = driverId.split('-')
  const last = parts[parts.length - 1]
  return `${last}_${year}`
}

// ── Derive driver nationality from f1db ──────────────────────────────────────
const COUNTRY_TO_CODE = {
  'united-kingdom': 'GBR', 'great-britain': 'GBR', 'germany': 'DEU', 'france': 'FRA',
  'italy': 'ITA', 'brazil': 'BRA', 'argentina': 'ARG', 'australia': 'AUS',
  'austria': 'AUT', 'finland': 'FIN', 'spain': 'ESP', 'netherlands': 'NLD',
  'belgium': 'BEL', 'sweden': 'SWE', 'south-africa': 'ZAF', 'canada': 'CAN',
  'united-states-of-america': 'USA', 'new-zealand': 'NZL', 'mexico': 'MEX',
  'japan': 'JPN', 'monaco': 'MCO', 'colombia': 'COL', 'russia': 'RUS',
  'denmark': 'DNK', 'switzerland': 'CHE', 'portugal': 'PRT', 'poland': 'POL',
  'china': 'CHN', 'india': 'IND', 'indonesia': 'IDN', 'venezuela': 'VEN',
  'chile': 'CHL', 'ireland': 'IRL', 'hungary': 'HUN', 'uruguay': 'URY',
  'thailand': 'THA', 'czechoslovakia': 'CZE', 'hong-kong': 'HKG',
  'malaysia': 'MYS', 'morocco': 'MAR', 'rhodesia': 'ZWE',
}

function getNationality(driverInfo) {
  if (!driverInfo) return 'UNK'
  const code = COUNTRY_TO_CODE[driverInfo.nationalityCountryId] ||
               COUNTRY_TO_CODE[driverInfo.countryOfBirthCountryId] || 'UNK'
  return code
}

// ── Derive driver attributes from career stats + year-specific standing ──────
// yearStanding: { positionNumber, points } from f1db-seasons-driver-standings
function deriveDriverAttributes(driverInfo, yearStanding) {
  if (!driverInfo) return { pace: 60, racecraft: 60, consistency: 60, wet_performance: 60, qualifying: 60, experience: 60, tire_management: 60 }

  const wins   = driverInfo.totalRaceWins || 0
  const pods   = driverInfo.totalPodiums || 0
  const champs = driverInfo.totalChampionshipWins || 0
  const poles  = driverInfo.totalPolePositions || 0
  const flaps  = driverInfo.totalFastestLaps || 0
  const starts = Math.max(1, driverInfo.totalRaceStarts || 1)
  const pts    = driverInfo.totalChampionshipPoints || 0
  const bestPos = driverInfo.bestChampionshipPosition || 99

  const winRate  = wins / starts
  const podRate  = pods / starts
  const poleRate = poles / starts
  const flapRate = flaps / starts

  // Career-level bonuses (capped to avoid all-time legends dominating too much)
  const champBonus   = Math.min(champs * 6, 24)
  const bestPosBonus = bestPos <= 5 ? Math.max(0, (6 - bestPos) * 3) : 0  // max +15 for P1

  // Year-specific championship standing — primary quality signal
  // P1 → +30, P5 → +18, P10 → +10.5, P20 → 0
  const yearPos   = yearStanding?.positionNumber || null
  const yearBonus = yearPos ? Math.max(0, (21 - yearPos) * 1.5) : 0

  const base = 52

  const pace         = Math.min(99, Math.round(base + winRate*70 + poleRate*40 + champBonus + bestPosBonus + yearBonus*0.6))
  const racecraft    = Math.min(99, Math.round(base + winRate*60 + podRate*25 + champBonus*0.8 + yearBonus*0.6))
  const consistency  = Math.min(99, Math.round(base + podRate*40 + (pts/starts)*0.15 + champBonus*0.5 + yearBonus*0.5))
  const qualifying   = Math.min(99, Math.round(base + poleRate*100 + winRate*20 + champBonus*0.5 + yearBonus*0.4))
  const tireMgmt     = Math.min(99, Math.round(base + flapRate*60 + podRate*20 + yearBonus*0.4))
  const experience   = Math.min(99, Math.round(50 + Math.min(starts / 3, 35) + champBonus + bestPosBonus * 0.5))
  const wet          = Math.min(99, Math.round(55 + winRate*25 + champBonus*0.5 + bestPosBonus*0.3 + yearBonus*0.3))

  return {
    pace:             Math.max(45, pace),
    racecraft:        Math.max(45, racecraft),
    consistency:      Math.max(45, consistency),
    wet_performance:  Math.max(45, wet),
    qualifying:       Math.max(45, qualifying),
    experience:       Math.max(45, experience),
    tire_management:  Math.max(45, tireMgmt),
  }
}

// ── Derive chassis attributes ─────────────────────────────────────────────────
function deriveChassisAttributes(standing, year) {
  // standing: { positionNumber, points, championshipWon }
  const pos    = standing?.positionNumber || 10
  const won    = standing?.championshipWon || false
  const pts    = standing?.points || 0

  // Rough scale: 1st place ≈ 90, 10th ≈ 55
  const base = won ? 92 : Math.max(45, 92 - (pos - 1) * 5)

  return {
    downforce:          Math.min(99, Math.round(base * 0.95 + (Math.random() * 6 - 3))),
    mechanical_grip:    Math.min(99, Math.round(base * 0.90 + (Math.random() * 6 - 3))),
    drag_efficiency:    Math.min(99, Math.round(base * 0.85 + (Math.random() * 6 - 3))),
    reliability:        Math.min(99, Math.round(base * 0.88 + (Math.random() * 6 - 3))),
    weight_distribution:Math.min(99, Math.round(base * 0.87 + (Math.random() * 6 - 3))),
  }
}

// ── Derive engine attributes from f1db engine info ───────────────────────────
function deriveEngineAttributes(engineInfo, standing, era) {
  const pos  = standing?.positionNumber || 8
  const base = Math.max(45, 90 - (pos - 1) * 4)

  // Aspiration affects power/efficiency
  const isT   = engineInfo?.aspiration === 'TURBOCHARGED'
  const isH   = engineInfo?.aspiration === 'HYBRID'
  const powerBonus  = isH ? 10 : isT ? 5 : 0
  const effPenalty  = isT ? -10 : 0

  return {
    power:          Math.min(99, Math.round(base + powerBonus + (Math.random() * 8 - 4))),
    driveability:   Math.min(99, Math.round(base * 0.9 + effPenalty + (Math.random() * 8 - 4))),
    fuel_efficiency:Math.min(99, Math.round(base * 0.8 + effPenalty + (Math.random() * 8 - 4))),
    reliability:    Math.min(99, Math.round(base * 0.85 + (Math.random() * 8 - 4))),
    deployment_mode:Math.min(99, Math.round((isH ? base : base * 0.7) + (Math.random() * 8 - 4))),
  }
}

// ── Budget & aero indices ─────────────────────────────────────────────────────
function deriveBudgetIndex(standing) {
  const pos = standing?.positionNumber || 10
  return Math.max(20, Math.min(95, Math.round(90 - (pos - 1) * 6)))
}

function deriveAeroIndex(standing) {
  const pos = standing?.positionNumber || 10
  return Math.max(25, Math.min(95, Math.round(88 - (pos - 1) * 5)))
}

// ── Reliability index from race results ──────────────────────────────────────
function deriveReliability(year, constructorId) {
  const key = `${year}|${constructorId}`
  const results = raceMap[key]
  if (!results || results.length === 0) return 70

  const total  = results.length
  const dnfs   = results.filter(r => r.reasonRetired && r.reasonRetired !== 'Accident' && r.reasonRetired !== 'Collision').length
  const rate   = dnfs / total
  return Math.max(45, Math.min(95, Math.round((1 - rate) * 95)))
}

// ── Pick top 2 drivers for a constructor+year ─────────────────────────────────
function getTopDrivers(year, entrantIds) {
  // Collect all non-test drivers with their round counts
  const driverRounds = {}
  for (const entrantId of entrantIds) {
    const key = `${year}|${entrantId}`
    const rows = driverIdx[key] || []
    for (const row of rows) {
      if (row.testDriver) continue
      const id = row.driverId
      if (!driverRounds[id]) driverRounds[id] = 0
      driverRounds[id] += (row.rounds || []).length
    }
  }
  // Sort by rounds descending
  const sorted = Object.entries(driverRounds)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)

  return sorted.slice(0, 2)
}

// ── Get primary chassis for a constructor+year ────────────────────────────────
function getPrimaryChassis(year, entrantIds) {
  const counts = {}
  for (const entrantId of entrantIds) {
    const key = `${year}|${entrantId}`
    const rows = chassisIdx[key] || []
    for (const row of rows) {
      counts[row.chassisId] = (counts[row.chassisId] || 0) + 1
    }
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] || null
}

// ── Get primary engine for a constructor+year ─────────────────────────────────
function getPrimaryEngine(year, entrantIds) {
  for (const entrantId of entrantIds) {
    const key = `${year}|${entrantId}`
    const rows = engineIdx[key] || []
    if (rows[0]) return rows[0].engineId
  }
  return null
}

// ── Get tyre for a constructor+year ───────────────────────────────────────────
function getTyreId(manufacturer, year) {
  if (manufacturer === 'pirelli') return year >= 2022 ? 'pirelli_2022' : 'pirelli_2011'
  const MAP = {
    'bridgestone': 'bridgestone_potenza',
    'michelin':    'michelin_modern',
    'goodyear':    'goodyear_eagle',
    'dunlop':      'dunlop_classic',
    'firestone':   'firestone_f1',
    'continental': 'continental_racing',
    'avon':        'dunlop_classic',
    'englebert':   'dunlop_classic',
    'india':       'dunlop_classic',
  }
  return MAP[manufacturer] || null
}

function getTyre(year, entrantIds) {
  for (const entrantId of entrantIds) {
    const key = `${year}|${entrantId}`
    const rows = tyreIdx[key] || []
    if (rows[0]) {
      const mapped = getTyreId(rows[0].tyreManufacturerId, year)
      if (mapped) return mapped
    }
  }
  return tyreMapping[String(year)] || 'dunlop_classic'
}

// ── Main pipeline ─────────────────────────────────────────────────────────────
const result = { seasons: [], drivers: [], chassis: [], engines: [] }
const newEngineIds = new Set()
const newChassisIds = new Set()
const newDriverIds = new Set()

// Track what we generated (to add to output)
const generatedEngines = {}
const generatedChassis = {}
const generatedDrivers = {}

console.log(`Processing years ${fromYear}–${toYear}...`)

for (let year = fromYear; year <= toYear; year++) {
  // Find all unique constructorIds active this year
  const yearConstructors = new Set()
  for (const row of entrantConstructors) {
    if (row.year === year) yearConstructors.add(row.constructorId)
  }

  if (yearConstructors.size === 0) continue

  const era = getEra(year)
  let yearNew = 0

  for (const constructorId of yearConstructors) {
    const teamName   = getTeamName(constructorId)
    const seasonId   = `${toKey(constructorId)}_${year}`
    const yearTeamKey = `${year}_${teamName}`

    // Skip if already in game (unless --force regenerates existing pipeline entries)
    if (!FORCE && (existingSeasonIds.has(seasonId) || existingSeasonYearTeam.has(yearTeamKey))) continue

    const entrantIds = constructorEntrants[`${year}|${constructorId}`] || []
    const standing   = standingsMap[`${year}|${constructorId}`]

    // ── Chassis ───────────────────────────────────────────────────────────────
    const f1dbChassisId = getPrimaryChassis(year, entrantIds)
    let gameChassisId = null

    if (f1dbChassisId) {
      gameChassisId = f1dbChassisToGameId(f1dbChassisId, year)
      if ((FORCE || !existingChassisIds.has(gameChassisId)) && !newChassisIds.has(gameChassisId)) {
        const chassisInfo = chassisInfoMap[f1dbChassisId]
        const attrs = deriveChassisAttributes(standing, year)
        generatedChassis[gameChassisId] = {
          id:   gameChassisId,
          name: chassisInfo?.fullName || toTitle(f1dbChassisId),
          team: teamName,
          year,
          era,
          attributes: attrs,
          bio: `${teamName} ${year} chassis.`,
        }
        newChassisIds.add(gameChassisId)
      }
    }

    // ── Engine ────────────────────────────────────────────────────────────────
    let gameEngineId = lookupEngine(constructorId, year)

    if (!gameEngineId) {
      // Try to derive from f1db
      const f1dbEngineId = getPrimaryEngine(year, entrantIds)
      if (f1dbEngineId) {
        gameEngineId = f1dbEngineToGameId(f1dbEngineId)
        if ((FORCE || !existingEngineIds.has(gameEngineId)) && !newEngineIds.has(gameEngineId)) {
          const engInfo = engineInfoMap[f1dbEngineId]
          const attrs = deriveEngineAttributes(engInfo, standing, era)
          generatedEngines[gameEngineId] = {
            id:             gameEngineId,
            name:           engInfo?.fullName || toTitle(f1dbEngineId),
            supplier:       toTitle(engInfo?.engineManufacturerId || constructorId),
            era,
            years_available: [year],
            attributes:     attrs,
            bio:            `${engInfo?.fullName || toTitle(f1dbEngineId)} engine.`,
          }
          newEngineIds.add(gameEngineId)
        } else if (generatedEngines[gameEngineId]) {
          // Extend years_available
          if (!generatedEngines[gameEngineId].years_available.includes(year)) {
            generatedEngines[gameEngineId].years_available.push(year)
          }
        }
      }
    }

    // ── Drivers ───────────────────────────────────────────────────────────────
    const topDrivers = getTopDrivers(year, entrantIds)
    const gameDriverIds = []

    for (const driverId of topDrivers) {
      const gameDriverId = f1dbDriverToGameId(driverId, year)
      gameDriverIds.push(gameDriverId)

      if ((FORCE || !existingDriverIds.has(gameDriverId)) && !newDriverIds.has(gameDriverId)) {
        const driverInfo   = driverStatsMap[driverId]
        const yearStanding = driverStandingsMap[`${year}|${driverId}`]
        const attrs = deriveDriverAttributes(driverInfo, yearStanding)
        const nat   = getNationality(driverInfo)
        generatedDrivers[gameDriverId] = {
          id:          gameDriverId,
          name:        driverInfo?.name || toTitle(driverId),
          nationality: nat,
          team:        teamName,
          year,
          era,
          attributes:  attrs,
          titles:      driverInfo?.totalChampionshipWins || 0,
          bio:         `${driverInfo?.name || toTitle(driverId)}, ${year} season.`,
        }
        newDriverIds.add(gameDriverId)
      }
    }

    // ── Tyre ──────────────────────────────────────────────────────────────────
    const tyreId = getTyre(year, entrantIds)

    // ── TP & TD ───────────────────────────────────────────────────────────────
    const tp = lookupMapping(tpMapping, constructorId, year)
    const td = lookupMapping(tdMapping, constructorId, year)

    // ── Season entry ──────────────────────────────────────────────────────────
    const season = {
      id:               seasonId,
      team:             teamName,
      year,
      era,
      driver1:          gameDriverIds[0] || null,
      driver2:          gameDriverIds[1] || null,
      chassis:          gameChassisId,
      engine:           gameEngineId || null,
      tp:               tp || null,
      td:               td || null,
      tires:            tyreId,
      budget_index:     deriveBudgetIndex(standing),
      aero_index:       deriveAeroIndex(standing),
      reliability_index: deriveReliability(year, constructorId),
    }

    result.seasons.push(season)
    yearNew++
  }

  if (yearNew > 0) process.stdout.write(`  ${year}: +${yearNew} teams\n`)
}

// Flatten generated objects into arrays
result.drivers = Object.values(generatedDrivers)
result.chassis = Object.values(generatedChassis)
result.engines = Object.values(generatedEngines)

// ── Write output ──────────────────────────────────────────────────────────────
for (const [key, data] of Object.entries(result)) {
  const file = path.join(GEN_DIR, `new_${key}.json`)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

console.log('\n=== Generated ===')
console.log(`  Seasons:  ${result.seasons.length}`)
console.log(`  Drivers:  ${result.drivers.length}`)
console.log(`  Chassis:  ${result.chassis.length}`)
console.log(`  Engines:  ${result.engines.length}`)
console.log('\nRun: node scripts/apply_generated.js')
