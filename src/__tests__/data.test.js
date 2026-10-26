import { describe, it, expect } from 'vitest'
import { validateData } from '../utils/dataValidation'
import seasons from '../data/seasons.json'
import drivers from '../data/drivers.json'
import chassis from '../data/chassis.json'
import engines from '../data/engines.json'
import tires from '../data/tires.json'
import teamPrincipals from '../data/team_principals.json'
import technicalDirectors from '../data/technical_directors.json'

describe('data integrity', () => {
  const { errors } = validateData({ seasons, drivers, chassis, engines, tires, teamPrincipals, technicalDirectors })

  it('every season reference resolves and tyres match the season year', () => {
    expect(errors).toEqual([])
  })

  it('flags a tyre used outside its years', () => {
    const bad = [{ ...seasons[0], year: 2020 }]
    const { errors } = validateData({ seasons: bad, drivers, chassis, engines, tires, teamPrincipals, technicalDirectors })
    expect(errors.some(e => e.kind === 'tire_era')).toBe(true)
  })
})
