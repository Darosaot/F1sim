// Transform Jolpica API data into game JSON format
const path = require('path')
const constructorNames = require('../mappings/constructor_names.json')
const tiresMap = require('../mappings/tires.json')
const enginesMap = require('../mappings/engines.json')
const tpMap = require('../mappings/team_principals.json')
const tdMap = require('../mappings/technical_directors.json')
const chassisNamesMap = require('../mappings/chassis_names.json')

// New engine definitions that the game doesn't have yet
const NEW_ENGINES = [
  { id:'ferrari_v12_1965',   name:'Ferrari V12 3.0L', supplier:'Ferrari', era:'pre_turbo',
    years_available:[1961,1962,1963,1964,1965,1966,1967,1968,1969,1970,1971,1972,1973,1974],
    attributes:{power:78,driveability:72,fuel_efficiency:65,reliability:74,deployment_mode:60},
    bio:'Ferrari V12 de los años 60-70. Potente pero con menor fiabilidad que el DFV.' },
  { id:'ferrari_v12_1990',   name:'Ferrari V12 3.5L', supplier:'Ferrari', era:'v10_v12',
    years_available:[1989,1990,1991,1992,1993,1994,1995],
    attributes:{power:87,driveability:82,fuel_efficiency:72,reliability:78,deployment_mode:70},
    bio:'Ferrari V12 era Alesi/Berger. Potente pero difícil de domesticar.' },
  { id:'ferrari_v6h_2019',   name:'Ferrari 064 V6 Hybrid', supplier:'Ferrari', era:'hybrid',
    years_available:[2019,2020,2021],
    attributes:{power:91,driveability:88,fuel_efficiency:84,reliability:82,deployment_mode:89},
    bio:'Motor Ferrari 2019-2021. Muy potente en 2019, luego regulado por la FIA.' },
  { id:'mercedes_v10_mclaren', name:'Mercedes-Ilmor FO110 V10', supplier:'Mercedes', era:'v10_v12',
    years_available:[1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006],
    attributes:{power:90,driveability:88,fuel_efficiency:80,reliability:86,deployment_mode:75},
    bio:'Motor Mercedes V10 para McLaren 1995-2006. Fiable y potente, base de múltiples victorias.' },
  { id:'mercedes_m13_2022',  name:'Mercedes-AMG F1 M13 V6', supplier:'Mercedes', era:'current',
    years_available:[2022,2023,2024],
    attributes:{power:94,driveability:91,fuel_efficiency:92,reliability:89,deployment_mode:93},
    bio:'Motor Mercedes 2022+. Suministrado a McLaren, Williams, Aston Martin y Alpine.' },
  { id:'renault_re14_2014',  name:'Renault Energy F1 RE14 V6', supplier:'Renault', era:'hybrid',
    years_available:[2014,2015,2016,2017,2018],
    attributes:{power:82,driveability:80,fuel_efficiency:84,reliability:74,deployment_mode:79},
    bio:'Motor Renault híbrido 2014-2018. Problemático al inicio, mejorado con Red Bull.' },
  { id:'renault_e_tech_2021', name:'Renault E-Tech V6 2019-2021', supplier:'Renault', era:'hybrid',
    years_available:[2019,2020,2021],
    attributes:{power:88,driveability:85,fuel_efficiency:87,reliability:83,deployment_mode:86},
    bio:'Motor Renault/Alpine 2019-2021. Gran mejora respecto al período anterior.' },
  { id:'renault_e_tech_2022', name:'Renault E-Tech V6 2022', supplier:'Renault', era:'current',
    years_available:[2022,2023,2024],
    attributes:{power:90,driveability:87,fuel_efficiency:89,reliability:85,deployment_mode:88},
    bio:'Motor Alpine/Renault 2022-2024. Exclusivo para el equipo Alpine.' },
  { id:'honda_ra615h_2015',  name:'Honda RA615H V6', supplier:'Honda', era:'hybrid',
    years_available:[2015,2016,2017],
    attributes:{power:76,driveability:72,fuel_efficiency:80,reliability:68,deployment_mode:74},
    bio:'"GP2 engine" según Alonso. La asociación McLaren-Honda 2015-2017 fue un desastre histórico.' },
  { id:'honda_ra618h_2019',  name:'Honda RA619H V6', supplier:'Honda', era:'hybrid',
    years_available:[2019,2020],
    attributes:{power:91,driveability:88,fuel_efficiency:86,reliability:84,deployment_mode:89},
    bio:'Honda renació con Red Bull. Verstappen ganó sus primeras carreras con este motor.' },
  { id:'bmw_v10_2000',       name:'BMW P80 V10', supplier:'BMW', era:'v10_v12',
    years_available:[2000,2001,2002,2003,2004,2005],
    attributes:{power:88,driveability:82,fuel_efficiency:76,reliability:78,deployment_mode:72},
    bio:'Motor BMW V10 para Williams 2000-2005. Potencia brutal pero fiabilidad irregular.' },
  { id:'ford_zetec_1994',    name:'Ford Zetec-R V8', supplier:'Ford', era:'v10_v12',
    years_available:[1994,1995],
    attributes:{power:83,driveability:82,fuel_efficiency:79,reliability:81,deployment_mode:72},
    bio:'Motor Ford para Benetton 1994-1995. Con él Schumacher ganó su primer campeonato.' },
  { id:'peugeot_a14_1994',   name:'Peugeot A14 V10', supplier:'Peugeot', era:'v10_v12',
    years_available:[1994,1995,1996,1997],
    attributes:{power:84,driveability:78,fuel_efficiency:77,reliability:72,deployment_mode:68},
    bio:'Motor Peugeot para McLaren y Jordan. Nunca cumplió las expectativas.' },
  { id:'cosworth_ca_2010',   name:'Cosworth CA2010 V8', supplier:'Cosworth', era:'v8',
    years_available:[2010,2011,2012,2013],
    attributes:{power:81,driveability:82,fuel_efficiency:80,reliability:82,deployment_mode:72},
    bio:'Motor Cosworth para Williams, HRT, Virgin/Marussia y Lotus Racing.' },
  { id:'mugen_ho_v10',       name:'Mugen MF-301H V10', supplier:'Mugen-Honda', era:'v10_v12',
    years_available:[1992,1993,1994,1995,1996,1997,1998,1999,2000],
    attributes:{power:84,driveability:83,fuel_efficiency:78,reliability:80,deployment_mode:70},
    bio:'Motor Mugen-Honda (filial no oficial). Usado por Jordan, Lotus y otros equipos medianos.' },
  { id:'judd_cv_1988',       name:'Judd CV V8 3.5L', supplier:'Judd', era:'pre_turbo',
    years_available:[1988,1989,1990],
    attributes:{power:76,driveability:79,fuel_efficiency:78,reliability:76,deployment_mode:65},
    bio:'Motor Judd para Williams 1988 y otros equipos en el año post-turbo.' },
  { id:'mecachrome_v10',     name:'Mecachrome/Supertec V10', supplier:'Mecachrome', era:'v10_v12',
    years_available:[1998,1999,2000],
    attributes:{power:83,driveability:81,fuel_efficiency:79,reliability:80,deployment_mode:70},
    bio:'Motor Renault V10 rebautizado para Williams (1998-1999) y equipos satélite.' },
  { id:'honda_ra006e_2006',  name:'Honda RA806E V8', supplier:'Honda', era:'v8',
    years_available:[2006,2007,2008],
    attributes:{power:82,driveability:80,fuel_efficiency:79,reliability:78,deployment_mode:72},
    bio:'Motor Honda V8 para el equipo Honda F1 2006-2008. Prometedor pero no decisivo.' }
]

// Special driver name overrides (ergast driverId → base game name)
const DRIVER_OVERRIDES = {
  'damon_hill':         'hill_d',
  'graham_hill':        'hill_g',
  'michael_schumacher': 'schumacher',
  'ralf_schumacher':    'r_schumacher',
  'mick_schumacher':    'schumacher_m',
  'gilles_villeneuve':  'villeneuve_g',
  'jacques_villeneuve': 'villeneuve_j',
  'nico_rosberg':       'rosberg_n',
  'keke_rosberg':       'rosberg_k',
  'guanyu_zhou':        'zhou',
  'juan_manuel_fangio': 'fangio',
  'jack_brabham':       'brabham_j',
  'bruce_mclaren':      'mclaren_b',
  'dan_gurney':         'gurney',
  'jo_bonnier':         'bonnier_j',
}

function getEra(year) {
  if (year <= 1965) return 'early'
  if (year <= 1982) return 'pre_turbo'
  if (year <= 1988) return 'turbo'
  if (year <= 2005) return 'v10_v12'
  if (year <= 2013) return 'v8'
  if (year <= 2021) return 'hybrid'
  return 'current'
}

function lookupRange(map, constructorId, year) {
  const ranges = map[constructorId]
  if (!ranges) return null
  for (const r of ranges) {
    if (year >= r.from && year <= r.to) return r
  }
  return null
}

function toGameDriverId(ergastId, year) {
  const override = DRIVER_OVERRIDES[ergastId]
  if (override) return `${override}_${year}`
  const parts = ergastId.split('_')
  return `${parts[parts.length - 1]}_${year}`
}

function rnd(base, spread) {
  return Math.round(Math.min(99, Math.max(60, base + (Math.random() - 0.5) * spread)))
}

function deriveDriverAttributes(championshipPos, year) {
  const pos = championshipPos || 15
  const base = Math.max(70, Math.min(96, 97 - (pos - 1) * 2))
  return {
    pace:            rnd(base, 5),
    racecraft:       rnd(base, 5),
    consistency:     rnd(base - 2, 5),
    wet_performance: rnd(base - 2, 8),
    qualifying:      rnd(base, 5),
    experience:      Math.round(50 + Math.min(48, pos < 5 ? 40 : pos < 10 ? 30 : 20)),
    tire_management: rnd(base - 2, 5)
  }
}

function deriveChassiAttributes(aeroIndex, budgetIndex, reliabilityIndex) {
  const aero = aeroIndex || 75
  const budget = budgetIndex || 70
  const rel = reliabilityIndex || 80
  return {
    downforce:          rnd(aero, 4),
    mechanical_grip:    rnd((aero + budget) / 2 - 3, 4),
    drag_efficiency:    rnd(aero - 5, 5),
    reliability:        rnd(rel, 4),
    weight_distribution: rnd(80, 6)
  }
}

function calculateBudget(pos, points, maxPoints, constructorId) {
  const posBase = Math.max(42, 97 - (pos - 1) * 5.5)
  const ptsFrac = maxPoints > 0 ? points / maxPoints : 0
  const base = posBase * 0.65 + (40 + ptsFrac * 55) * 0.35
  const premium = ['ferrari', 'mercedes', 'mclaren', 'red_bull'].includes(constructorId) ? 4 : 0
  return Math.round(Math.min(98, Math.max(40, base + premium)))
}

function calculateAero(pos, points, maxPoints) {
  if (maxPoints <= 0) return 70
  const ptsFrac = points / maxPoints
  const posScore = Math.max(0, 1 - (pos - 1) * 0.08)
  return Math.round(Math.min(97, Math.max(42, 40 + (ptsFrac * 0.6 + posScore * 0.4) * 57)))
}

function calculateReliability(constructorId, races) {
  let starts = 0, dnfs = 0
  for (const race of races) {
    for (const r of race.Results || []) {
      if (r.Constructor.constructorId === constructorId) {
        starts++
        if (r.status !== 'Finished' && !r.status.startsWith('+')) dnfs++
      }
    }
  }
  if (starts === 0) return 80
  const dnfRate = dnfs / starts
  return Math.round(Math.min(96, Math.max(55, 100 - dnfRate * 80)))
}

function getMainDrivers(constructorId, races) {
  const counts = {}
  const info = {}
  for (const race of races) {
    for (const r of race.Results || []) {
      if (r.Constructor.constructorId === constructorId) {
        const did = r.Driver.driverId
        counts[did] = (counts[did] || 0) + 1
        info[did] = r.Driver
      }
    }
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return {
    d1: sorted[0] ? { ergastId: sorted[0][0], driver: info[sorted[0][0]] } : null,
    d2: sorted[1] ? { ergastId: sorted[1][0], driver: info[sorted[1][0]] } : null
  }
}

function processYear(year, standings, driverStandings, races, existingIds) {
  const out = { seasons: [], drivers: [], chassis: [], engines: [] }
  if (!standings.length) return out

  const maxPoints = Math.max(...standings.map(s => parseFloat(s.points) || 0))

  // Build driver position lookup
  const driverPos = {}
  for (const d of driverStandings) {
    driverPos[d.Driver.driverId] = parseInt(d.position)
  }

  const newEngineIds = new Set(NEW_ENGINES.map(e => e.id))

  for (const standing of standings) {
    const cid = standing.Constructor.constructorId
    const teamName = constructorNames[cid] || standing.Constructor.name
    const era = getEra(year)
    const pos = parseInt(standing.position)
    const points = parseFloat(standing.points) || 0
    const seasonId = `${cid}_${year}`

    if (existingIds.seasons.has(seasonId)) continue

    // Indices
    const budgetIdx = calculateBudget(pos, points, maxPoints, cid)
    const aeroIdx = calculateAero(pos, points, maxPoints)
    const relIdx = calculateReliability(cid, races)

    // Chassis
    const chassisKey = `${cid}_${year}`
    const chassisOverride = chassisNamesMap[chassisKey]
    const chassisId = chassisOverride
      ? chassisOverride.id
      : `${cid}_${year}_chassis`
    const chassisName = chassisOverride
      ? chassisOverride.name
      : `${teamName} ${year}`

    if (!existingIds.chassis.has(chassisId)) {
      out.chassis.push({
        id: chassisId,
        name: chassisName,
        team: teamName,
        year,
        era,
        attributes: deriveChassiAttributes(aeroIdx, budgetIdx, relIdx),
        bio: `${chassisName} — ${teamName} ${year}.`
      })
      existingIds.chassis.add(chassisId)
    }

    // Engine
    const engRange = lookupRange(enginesMap, cid, year)
    const engineId = engRange ? engRange.engine : `${cid}_engine_${year}`
    if (engRange && newEngineIds.has(engineId) && !existingIds.engines.has(engineId)) {
      const def = NEW_ENGINES.find(e => e.id === engineId)
      if (def) { out.engines.push(def); existingIds.engines.add(engineId) }
    }

    // Tire
    const tireId = tiresMap[String(year)] || 'pirelli_2011'

    // TP / TD
    const tpRange = lookupRange(tpMap, cid, year)
    const tdRange = lookupRange(tdMap, cid, year)
    const tpId = tpRange ? tpRange.tp : null
    const tdId = tdRange ? tdRange.td : null

    // Drivers
    const { d1, d2 } = getMainDrivers(cid, races)

    function processDriver(driverSlot) {
      if (!driverSlot) return null
      const gameId = toGameDriverId(driverSlot.ergastId, year)
      if (existingIds.drivers.has(gameId)) return gameId

      const ergast = driverSlot.driver
      const dPos = driverPos[driverSlot.ergastId] || 15
      out.drivers.push({
        id: gameId,
        name: `${ergast.givenName} ${ergast.familyName}`,
        nationality: ergast.nationality,
        team: teamName,
        year,
        era,
        attributes: deriveDriverAttributes(dPos, year),
        titles: 0,
        bio: `${ergast.givenName} ${ergast.familyName} — ${teamName} ${year}.`
      })
      existingIds.drivers.add(gameId)
      return gameId
    }

    const driver1Id = processDriver(d1)
    const driver2Id = processDriver(d2)

    out.seasons.push({
      id: seasonId,
      team: teamName,
      year,
      era,
      driver1: driver1Id,
      driver2: driver2Id,
      chassis: chassisId,
      engine: engineId,
      tp: tpId,
      td: tdId,
      tires: tireId,
      budget_index: budgetIdx,
      aero_index: aeroIdx,
      reliability_index: relIdx
    })
  }

  return out
}

module.exports = { processYear, NEW_ENGINES }
