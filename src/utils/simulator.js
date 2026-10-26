import circuits from '../data/circuits.json'
import {
  buildProfile, qualyBase, raceBase, strategyBonus, devBonus, gridBonus,
  dnfProbability, RACE_VARIANCE_MAX,
} from './performanceModel'
import { buildRivalsForYear } from './rivalBuilder'
import { between, shuffle } from './random'

export const SEASON_LENGTH = 22
const PLAYER_NAME  = 'Tu Equipo'
const PLAYER_COLOR = '#e05535'

// Points for P1, P2, ... in the scoring system used that year
// (fastest-lap and shared-drive points left out)
export function pointsForYear(year) {
  if (year == null || year >= 2010) return [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
  if (year >= 2003) return [10, 8, 6, 5, 4, 3, 2, 1]
  if (year >= 1991) return [10, 6, 4, 3, 2, 1]
  if (year >= 1961) return [9, 6, 4, 3, 2, 1]
  if (year === 1960) return [8, 6, 4, 3, 2, 1]
  return [8, 6, 4, 3, 2]
}

function computeHeadline(d1Dnf, d2Dnf, d1RacePos, d2RacePos, d1QualyPos, d2QualyPos, isWet, safetyCar, d1Name, d2Name) {
  if (d1Dnf && d2Dnf) return `⚠️ Fin de semana negro — abandonan los dos pilotos`
  if (d1Dnf) return `💥 ${d1Name} abandona con fallo mecánico`
  if (d2Dnf) return `💥 ${d2Name} abandona con fallo mecánico`
  const winner = d1RacePos === 1 ? d1Name : d2RacePos === 1 ? d2Name : null
  if (winner) {
    const winnerQualyPos = winner === d1Name ? d1QualyPos : d2QualyPos
    if (isWet) return `🌧️ ${winner} domina bajo la lluvia`
    if (winnerQualyPos === 1) return `🏆 Pole y victoria para ${winner}`
    const gain = winnerQualyPos - 1
    if (gain >= 8) return `🔥 ${winner} — remontada épica de P${winnerQualyPos} a victoria`
    if (gain >= 4) return `⚡ ${winner} — remontada de P${winnerQualyPos} a victoria`
    return `🏆 Victoria para ${winner}`
  }
  if (!d1Dnf && !d2Dnf && d1RacePos <= 3 && d2RacePos <= 3) return `🥇 Doble podio del equipo`
  const poleDriver = d1QualyPos === 1 ? d1Name : d2QualyPos === 1 ? d2Name : null
  if (poleDriver) return `⚡ Pole position para ${poleDriver}`
  if (safetyCar) return `🚨 Safety car — el campo se reagrupa`
  return null
}

// Rivals: [{ name, color, d1, d2, team }] from buildRivalsForYear.
// Options:
//   year     – scoring system to use (defaults to the rivals' year, 2024)
//   rng      – random source, for reproducible seasons
//   rivalSynergies – apply draft synergies to rival teams too (default
//               false: they reward drafting, real teams don't draft)
export function simulateSeason(team, rivals = null, { year = 2024, rng = Math.random, rivalSynergies = false } = {}) {
  const rivalPool = rivals ?? buildRivalsForYear(year)
  const POINTS = pointsForYear(year)
  const seasonCircuits = shuffle(circuits, rng).slice(0, SEASON_LENGTH)

  const player = buildProfile(team)
  const d1Name = team.driver1?.name ?? 'Piloto 1'
  const d2Name = team.driver2?.name ?? 'Piloto 2'

  // Index 0 is always the player
  const teams = [
    { name: PLAYER_NAME, color: PLAYER_COLOR, d1: d1Name, d2: d2Name, profile: player, isPlayer: true },
    ...rivalPool.map(r => ({
      name: r.name, color: r.color, d1: r.d1, d2: r.d2, isPlayer: false,
      profile: buildProfile(r.team, { synergies: rivalSynergies }),
    })),
  ].map(t => ({
    ...t,
    dnfProb: dnfProbability(t.profile),
    seats: [1, 2].map(() => ({ points: 0, wins: 0, podiums: 0, poles: 0, dnfs: 0 })),
  }))

  const races = []
  let playerTotal = 0

  for (let raceIdx = 0; raceIdx < seasonCircuits.length; raceIdx++) {
    const circuit = seasonCircuits[raceIdx]
    const c = circuit.modifiers
    const isWet = rng() < c.wet_probability
    const safetyCar = rng() < c.safety_car_probability

    const entries = teams.flatMap((t, ti) => [0, 1].map(seat => ({
      ti, seat, drv: seat === 0 ? t.profile.d1 : t.profile.d2,
    })))

    // --- QUALIFYING ---
    for (const e of entries) {
      e.qualy = qualyBase(e.drv, teams[e.ti].profile) * between(rng, 0.92, 1.08)
    }
    ;[...entries].sort((a, b) => b.qualy - a.qualy).forEach((e, i) => { e.grid = i + 1 })

    // --- RACE ---
    for (const e of entries) {
      const t = teams[e.ti]
      const p = t.profile
      e.dnf = rng() < t.dnfProb
      e.score = e.dnf ? -Infinity : (
        raceBase(e.drv, p, circuit, isWet)
        + p.bonus
        + devBonus(p, raceIdx)
        + gridBonus(e.grid, c.overtaking_difficulty)
        + strategyBonus(p.st, circuit, safetyCar, isWet)
      ) * between(rng, p.varianceFloor, RACE_VARIANCE_MAX)
    }
    const order = [...entries].sort((a, b) => b.score - a.score)
    order.forEach((e, i) => {
      e.pos = i + 1
      e.points = e.dnf ? 0 : (POINTS[i] ?? 0)
      const st = teams[e.ti].seats[e.seat]
      st.points += e.points
      if (e.grid === 1) st.poles++
      if (e.dnf) { st.dnfs++; return }
      if (e.pos === 1) st.wins++
      if (e.pos <= 3) st.podiums++
    })

    const [pd1, pd2] = entries.filter(e => e.ti === 0)
    playerTotal += pd1.points + pd2.points
    races.push({
      circuit: circuit.name,
      country: circuit.country,
      emoji: circuit.emoji,
      type: circuit.type,
      isWet,
      safetyCar,
      d1QualyPos: pd1.grid, d1RacePos: pd1.pos, d1Points: pd1.points, d1Dnf: pd1.dnf,
      d2QualyPos: pd2.grid, d2RacePos: pd2.pos, d2Points: pd2.points, d2Dnf: pd2.dnf,
      racePoints: pd1.points + pd2.points,
      playerPoints: playerTotal,
      headline: computeHeadline(pd1.dnf, pd2.dnf, pd1.pos, pd2.pos, pd1.grid, pd2.grid, isWet, safetyCar, d1Name, d2Name),
    })
  }

  // --- STANDINGS ---
  const driverStandings = teams.flatMap(t => [0, 1].map(seat => ({
    name: seat === 0 ? t.d1 : t.d2,
    team: t.name,
    points: t.seats[seat].points,
    wins: t.seats[seat].wins,
    podiums: t.seats[seat].podiums,
    isPlayer: t.isPlayer,
    isD1: t.isPlayer && seat === 0,
    color: t.color,
  }))).sort((a, b) => b.points - a.points || b.wins - a.wins)

  const constructorStandings = teams.map(t => ({
    name: t.name,
    color: t.color,
    points: t.seats[0].points + t.seats[1].points,
    wins: t.seats[0].wins + t.seats[1].wins,
    isPlayer: t.isPlayer,
  })).sort((a, b) => b.points - a.points || b.wins - a.wins)

  const d1FinalPos     = driverStandings.findIndex(d => d.isPlayer && d.isD1) + 1
  const d2FinalPos     = driverStandings.findIndex(d => d.isPlayer && !d.isD1) + 1
  const constructorPos = constructorStandings.findIndex(s => s.isPlayer) + 1
  const [s1, s2] = teams[0].seats

  return {
    races,
    driverStandings,
    constructorStandings,
    // Legacy field (kept for ChampionshipCard compat)
    standings: constructorStandings,
    developmentBonusApplied: true,
    pointsSystem: POINTS,
    d1FinalPos,
    d2FinalPos,
    constructorPos,
    finalPosition: d1FinalPos,
    d1Name,
    d2Name,
    playerStats: {
      points:  s1.points + s2.points,
      wins:    s1.wins + s2.wins,
      podiums: s1.podiums + s2.podiums,
      poles:   s1.poles + s2.poles,
      dnfs:    s1.dnfs + s2.dnfs,
      bestResult: Math.min(...races.map(r => Math.min(r.d1RacePos, r.d2RacePos))),
    },
    d1Stats: { ...s1 },
    d2Stats: { ...s2 },
  }
}

export function getVerdict(d1Pos, d2Pos, constructorPos) {
  const bestDriver = Math.min(d1Pos, d2Pos)
  const bothOnPodium = d1Pos <= 3 && d2Pos <= 3
  if (bestDriver === 1 && constructorPos === 1) return '🏆 ¡DOBLETE HISTÓRICO! Campeones de pilotos y constructores.'
  if (bestDriver === 1) return '🏆 ¡CAMPEÓN DE PILOTOS! Dominio absoluto en pista.'
  if (constructorPos === 1 && bothOnPodium) return '🏆 ¡CAMPEONES DE CONSTRUCTORES! Los dos pilotos en el podio.'
  if (constructorPos === 1) return '🏆 ¡CAMPEONES DE CONSTRUCTORES! El mejor equipo de la parrilla.'
  if (bestDriver <= 3 && constructorPos <= 3) return '🥇 Podio en ambos campeonatos. Temporada brillante.'
  if (bestDriver <= 3) return `🥈 P${bestDriver} en el campeonato de pilotos. Podio en parrilla.`
  if (constructorPos <= 3) return `🥉 P${constructorPos} constructores. Buen trabajo de equipo.`
  if (bestDriver <= 5) return `P${bestDriver} pilotos · P${constructorPos} constructores. Cerca de lo más alto.`
  return `P${bestDriver} pilotos · P${constructorPos} constructores. Hay margen de mejora.`
}

// Re-run the same season many times to show how much of a result was luck:
// title odds, podium odds and the spread of constructor points.
export function simulateOutcomes(team, rivals, { year = 2024, runs = 200, rng = Math.random } = {}) {
  const positions = []
  const points = []
  let driverTitles = 0
  for (let i = 0; i < runs; i++) {
    const r = simulateSeason(team, rivals, { year, rng })
    positions.push(r.constructorPos)
    points.push(r.playerStats.points)
    if (r.d1FinalPos === 1 || r.d2FinalPos === 1) driverTitles++
  }
  const share = pred => positions.filter(pred).length / runs
  const sorted = [...points].sort((a, b) => a - b)
  const pct = q => sorted[Math.min(runs - 1, Math.floor(q * runs))]
  const histogram = Array.from({ length: rivals.length + 1 }, (_, i) => share(p => p === i + 1))
  return {
    runs,
    constructorTitle: share(p => p === 1),
    driverTitle: driverTitles / runs,
    podium: share(p => p <= 3),
    medianPosition: [...positions].sort((a, b) => a - b)[Math.floor(runs / 2)],
    points: { p10: pct(0.1), p50: pct(0.5), p90: pct(0.9) },
    histogram,
  }
}
