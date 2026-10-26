import { describe, it, expect } from 'vitest'
import circuits from '../data/circuits.json'
import seasons from '../data/seasons.json'
import { simulateSeason, pointsForYear, SEASON_LENGTH } from '../utils/simulator'
import { buildRivalsForYear } from '../utils/rivalBuilder'
import { resolveSeasonElements } from '../utils/dataQueries'
import { buildProfile, expectedStrength } from '../utils/performanceModel'
import { calculateTeamRating, getBenchmark } from '../utils/ratingEngine'
import { mulberry32, seededRng, shuffle } from '../utils/random'

const season = id => resolveSeasonElements(seasons.find(s => s.id === id))
const strength = team => expectedStrength(buildProfile(team), circuits)

describe('random', () => {
  it('seeded rng is reproducible', () => {
    const a = seededRng('x', 1), b = seededRng('x', 1)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('shuffle is an unbiased permutation', () => {
    const rng = mulberry32(42)
    const counts = Array.from({ length: 4 }, () => [0, 0, 0, 0])
    const N = 20000
    for (let i = 0; i < N; i++) {
      shuffle([0, 1, 2, 3], rng).forEach((v, pos) => counts[v][pos]++)
    }
    for (const row of counts) for (const c of row) expect(Math.abs(c / N - 0.25)).toBeLessThan(0.02)
  })
})

describe('pointsForYear', () => {
  it.each([
    [1955, [8, 6, 4, 3, 2]],
    [1960, [8, 6, 4, 3, 2, 1]],
    [1988, [9, 6, 4, 3, 2, 1]],
    [1998, [10, 6, 4, 3, 2, 1]],
    [2005, [10, 8, 6, 5, 4, 3, 2, 1]],
    [2024, [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]],
  ])('%i', (year, pts) => expect(pointsForYear(year)).toEqual(pts))
})

describe('simulateSeason', () => {
  const team = season('mclaren_1988')

  it('is reproducible with a seeded rng', () => {
    const a = simulateSeason(team, buildRivalsForYear(1998), { year: 1998, rng: seededRng('s', 7) })
    const b = simulateSeason(team, buildRivalsForYear(1998), { year: 1998, rng: seededRng('s', 7) })
    expect(a).toEqual(b)
  })

  it('awards exactly the points of the year\'s system each race', () => {
    const r = simulateSeason(team, buildRivalsForYear(1988), { year: 1988, rng: mulberry32(3) })
    expect(r.races).toHaveLength(SEASON_LENGTH)
    const total = r.constructorStandings.reduce((s, t) => s + t.points, 0)
    // Max is 25 points per race (9+6+4+3+2+1); DNFs inside the top six give no points
    expect(total).toBeLessThanOrEqual(25 * SEASON_LENGTH)
    expect(total).toBeGreaterThan(20 * SEASON_LENGTH)
    expect(r.pointsSystem).toEqual([9, 6, 4, 3, 2, 1])
  })

  it('treats the player and rivals with the same model', () => {
    // Player drafts an exact copy of a rival: over many seasons both score alike
    const rivals = buildRivalsForYear(2010)
    const clone = rivals[0].team
    let player = 0, rival = 0
    for (let i = 0; i < 300; i++) {
      const r = simulateSeason(clone, rivals, { year: 2010, rng: mulberry32(i), rivalSynergies: true })
      player += r.playerStats.points
      rival += r.constructorStandings.find(t => t.name === rivals[0].name).points
    }
    expect(Math.abs(player - rival) / rival).toBeLessThan(0.08)
  })
})

describe('performance model', () => {
  const base = season('williams_1992')

  it('a better team principal makes the team faster', () => {
    const weak   = { ...base, team_principal: { attributes: { team_management: 40, driver_management: 40, political_skill: 40, budget_generation: 40, crisis_management: 40 } } }
    const strong = { ...base, team_principal: { attributes: { team_management: 98, driver_management: 98, political_skill: 98, budget_generation: 98, crisis_management: 98 } } }
    expect(strength(strong)).toBeGreaterThan(strength(weak))
  })

  it('a better strategist makes the team faster', () => {
    const attrs = v => ({ race_management: v, pit_timing: v, undercut_instinct: v, safety_car_read: v, pressure_decisions: v })
    expect(strength({ ...base, strategist: { attributes: attrs(98) } }))
      .toBeGreaterThan(strength({ ...base, strategist: { attributes: attrs(40) } }))
  })
})

describe('team rating', () => {
  it('ranks dominant cars above backmarkers', () => {
    expect(calculateTeamRating(season('mercedes_2020'))).toBeGreaterThan(90)
    expect(calculateTeamRating(season('minardi_1986'))).toBeLessThan(50)
  })

  it('benchmark names the real season closest in rating', () => {
    const r = calculateTeamRating(season('red_bull_2023'))
    const b = getBenchmark(r)
    expect(Math.abs(b.rating - r)).toBeLessThan(0.5)
  })
})
