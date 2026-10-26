// The single performance model shared by the season simulator (for the
// player AND every rival team) and the displayed team rating.
// A "team" is the drafted shape: { driver1, driver2, team_principal,
// technical_director, strategist, chassis, engine, tires, aero, budget,
// reliability }. Missing elements fall back to neutral defaults, the same
// for everyone.

import { getSynergyBonus } from './synergies'

export const DEFAULT_DRIVER  = { pace: 75, racecraft: 75, consistency: 75, wet_performance: 75, qualifying: 75, experience: 75, tire_management: 75 }
export const DEFAULT_DRIVER2 = { ...DEFAULT_DRIVER, pace: 65 }
const DEFAULT_CHASSIS = { downforce: 70, mechanical_grip: 70, drag_efficiency: 70, reliability: 70, weight_distribution: 70 }
const DEFAULT_ENGINE  = { power: 70, driveability: 70, fuel_efficiency: 70, reliability: 70, deployment_mode: 70 }
const DEFAULT_TD      = { design_genius: 70, innovation: 70, development_speed: 70, detail_obsession: 70, aerodynamic_vision: 70 }
const DEFAULT_TP      = { team_management: 70, driver_management: 70, political_skill: 70, budget_generation: 70, crisis_management: 70 }
const DEFAULT_ST      = { race_management: 70, pit_timing: 70, undercut_instinct: 70, safety_car_read: 70, pressure_decisions: 70 }
const DEFAULT_TIRES   = { peak_grip: 70, durability: 70, thermal_window: 70, wet_performance: 70 }

export const RACE_VARIANCE_MAX = 1.16

// Precompute everything that doesn't change race to race
export function buildProfile(team, { synergies = true } = {}) {
  const ch   = team.chassis?.attributes ?? DEFAULT_CHASSIS
  const ti   = team.tires?.attributes ?? DEFAULT_TIRES
  const td   = team.technical_director?.attributes ?? DEFAULT_TD
  const tp   = team.team_principal?.attributes ?? DEFAULT_TP
  const aero = team.aero ?? 70
  const budget = team.budget ?? 70
  const rel  = team.reliability ?? 70

  const tdBonus     = td.design_genius / 100 * 2
  const tireBonus   = (ti.peak_grip * 0.4 + ti.thermal_window * 0.3 + ti.durability * 0.3) / 100 * 2
  const budgetBonus = budget / 100 * 1.5
  const relBonus    = rel / 100 * 1.5
  // Team principal: running the factory well is worth a little pace every
  // weekend; crisis management limits how badly a bad weekend can go.
  const tpBonus     = (tp.team_management * 0.6 + tp.driver_management * 0.4) / 100 * 1.5
  const synergyBonus = synergies ? getSynergyBonus(team) : 0

  return {
    d1: team.driver1?.attributes ?? DEFAULT_DRIVER,
    d2: team.driver2?.attributes ?? DEFAULT_DRIVER2,
    ch: { ...ch, downforce: ch.downforce * 0.7 + aero * 0.3 },
    en: team.engine?.attributes ?? DEFAULT_ENGINE,
    td,
    st: team.strategist?.attributes ?? DEFAULT_ST,
    rel,
    bonus: tdBonus + tireBonus + budgetBonus + relBonus + tpBonus + synergyBonus,
    varianceFloor: 0.84 + tp.crisis_management / 100 * 0.05,
  }
}

export function qualyBase(d, p) {
  return d.qualifying * 0.52 + d.pace * 0.18 + p.ch.downforce * 0.15 + p.en.power * 0.15
}

export function raceBase(d, p, circuit, isWet) {
  const c = circuit.modifiers
  const aeroPart  = p.ch.downforce * c.downforce_weight
  const powerPart = p.en.power * c.power_weight
  const drvPart   = (d.pace * 0.6 + d.racecraft * 0.4) * c.racecraft_weight
  const base = (aeroPart + powerPart + drvPart) / 3

  const wetMult = isWet ? (d.wet_performance / 80) : 1
  const consistBonus = d.consistency / 100 * 6
  const expBonus     = d.experience / 100 * 4
  const tireMgmt     = d.tire_management / 100 * 4
  return (base + consistBonus + expBonus + tireMgmt) * wetMult
}

// Strategist: pit timing every race, the undercut where overtaking is hard,
// reading safety cars, and calls under pressure in the wet.
export function strategyBonus(st, circuit, safetyCar, isWet) {
  const c = circuit.modifiers
  return st.race_management / 100 * 0.5
    + st.pit_timing / 100 * 1.0
    + st.undercut_instinct / 100 * 1.5 * c.overtaking_difficulty
    + (safetyCar ? st.safety_car_read / 100 * 2.5 : 0)
    + (isWet ? st.pressure_decisions / 100 * 2 : 0)
}

// Car development through the season, driven by the TD's innovation
export function devBonus(p, raceIdx) {
  return raceIdx >= 9 ? (p.td.innovation / 100) * (raceIdx - 9) * 0.12 : 0
}

export function gridBonus(gridPos, overtakingDifficulty) {
  if (gridPos === 1)  return 12
  if (gridPos <= 3)   return 6
  if (gridPos <= 6)   return 1
  if (gridPos <= 10)  return -6 * overtakingDifficulty
  if (gridPos <= 15)  return -12 * overtakingDifficulty
  return -18 * overtakingDifficulty
}

export function dnfProbability(p) {
  const combined = (p.en.reliability + p.rel) / 2
  return Math.max(0.02, (100 - combined) / 100 * 0.16)
}

// Deterministic expected race score of a profile over a set of circuits:
// the same terms the simulator rolls dice on, at their expected values.
export function expectedStrength(p, circuits, seasonLength = 22) {
  const meanMult = (p.varianceFloor + RACE_VARIANCE_MAX) / 2
  let meanDev = 0
  for (let i = 0; i < seasonLength; i++) meanDev += devBonus(p, i)
  meanDev /= seasonLength
  const finishRate = 1 - dnfProbability(p)

  let total = 0
  for (const circuit of circuits) {
    const c = circuit.modifiers
    const pw = c.wet_probability, psc = c.safety_car_probability
    const strat = p.st.race_management / 100 * 0.5 + p.st.pit_timing / 100 * 1.0
      + p.st.undercut_instinct / 100 * 1.5 * c.overtaking_difficulty
      + psc * p.st.safety_car_read / 100 * 2.5 + pw * p.st.pressure_decisions / 100 * 2
    for (const d of [p.d1, p.d2]) {
      const race = (1 - pw) * raceBase(d, p, circuit, false) + pw * raceBase(d, p, circuit, true)
      // Qualifying converts to grid position; weight it like a share of the race
      const qualy = (qualyBase(d, p) - 75) * 0.35
      total += (race + qualy + p.bonus + meanDev + strat) * meanMult * finishRate
    }
  }
  return total / (circuits.length * 2)
}
