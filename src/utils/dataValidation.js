// Cross-checks seasons.json against the element datasets.
// errors   → broken data (missing references, parts from a different era)
// warnings → known approximations (the exact part isn't in the dataset, so
//            the closest available one stands in)

const ENGINE_TOLERANCE  = 3   // years an engine may be used outside its listed range
const CHASSIS_TOLERANCE = 0
const DRIVER_TOLERANCE  = 3

const index = list => new Map(list.map(x => [x.id, x]))

export function validateData({ seasons, drivers, chassis, engines, tires, teamPrincipals, technicalDirectors }) {
  const errors = []
  const warnings = []
  const D = index(drivers), C = index(chassis), E = index(engines), T = index(tires)
  const TP = index(teamPrincipals), TD = index(technicalDirectors)

  const ref = (season, field, map, label) => {
    const id = season[field]
    if (id == null) return null
    const el = map.get(id)
    if (!el) errors.push({ season: season.id, kind: `missing_${label}`, msg: `${label} "${id}" no existe` })
    return el ?? null
  }

  const seen = new Set()
  for (const s of seasons) {
    if (seen.has(s.id)) errors.push({ season: s.id, kind: 'duplicate_season', msg: 'id de temporada duplicado' })
    seen.add(s.id)
    const y = s.year

    const tire = ref(s, 'tires', T, 'tire')
    if (tire && (y < tire.years[0] || y > tire.years[1])) {
      errors.push({ season: s.id, kind: 'tire_era', msg: `neumático ${tire.id} (${tire.years.join('-')}) en ${y}` })
    }

    const engine = ref(s, 'engine', E, 'engine')
    const ya = engine?.years_available
    if (ya?.length) {
      const lo = Math.min(...ya), hi = Math.max(...ya)
      if (y < lo - ENGINE_TOLERANCE || y > hi + ENGINE_TOLERANCE) {
        warnings.push({ season: s.id, kind: 'engine_era', msg: `motor ${engine.id} (${lo}-${hi}) en ${y}` })
      }
    }

    const car = ref(s, 'chassis', C, 'chassis')
    if (car?.year && Math.abs(car.year - y) > CHASSIS_TOLERANCE) {
      warnings.push({ season: s.id, kind: 'chassis_era', msg: `chasis ${car.id} (${car.year}) en ${y}` })
    }

    for (const field of ['driver1', 'driver2']) {
      const d = ref(s, field, D, 'driver')
      if (d?.year && Math.abs(d.year - y) > DRIVER_TOLERANCE) {
        warnings.push({ season: s.id, kind: 'driver_era', msg: `piloto ${d.id} (${d.year}) en ${y}` })
      }
    }

    ref(s, 'tp', TP, 'team_principal')
    ref(s, 'td', TD, 'technical_director')
  }

  return { errors, warnings }
}
