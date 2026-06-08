import circuits from '../data/circuits.json'

const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

const RIVAL_TEAMS = [
  { name: 'McLaren',      color: '#ff8000', d1: 'Norris',      d2: 'Piastri',    rating: 96 },
  { name: 'Ferrari',      color: '#dc0000', d1: 'Leclerc',     d2: 'Sainz',      rating: 93 },
  { name: 'Mercedes',     color: '#27f4d2', d1: 'Hamilton',    d2: 'Russell',    rating: 91 },
  { name: 'Red Bull',     color: '#3671c6', d1: 'Verstappen',  d2: 'Pérez',      rating: 98 },
  { name: 'Williams',     color: '#00a3e0', d1: 'Albon',       d2: 'Colapinto',  rating: 82 },
  { name: 'Alpine',       color: '#0090d0', d1: 'Gasly',       d2: 'Ocon',       rating: 84 },
  { name: 'Aston Martin', color: '#006f62', d1: 'Alonso',      d2: 'Stroll',     rating: 87 },
  { name: 'Haas',         color: '#e8002d', d1: 'Hülkenberg',  d2: 'Magnussen',  rating: 80 },
  { name: 'RB',           color: '#2b4562', d1: 'Tsunoda',     d2: 'Lawson',     rating: 83 },
  { name: 'Kick Sauber',  color: '#52e252', d1: 'Bottas',      d2: 'Zhou',       rating: 79 },
]

function rng(min = 0, max = 1) {
  return min + Math.random() * (max - min)
}

function calculateDriverRacePerf(driverAttrs, chassisAttrs, engineAttrs, circuit, isWet) {
  const c = circuit.modifiers
  const d = driverAttrs
  const ch = chassisAttrs
  const en = engineAttrs

  const aeroPart  = ch.downforce * c.downforce_weight
  const powerPart = en.power * c.power_weight
  const drvPart   = (d.pace * 0.6 + d.racecraft * 0.4) * c.racecraft_weight

  const base = (aeroPart + powerPart + drvPart) / 3

  const wetMult = isWet ? (d.wet_performance / 80) : 1
  const consistBonus = d.consistency / 100 * 6
  const expBonus = d.experience / 100 * 4
  const tireMgmt = d.tire_management / 100 * 4

  return (base + consistBonus + expBonus + tireMgmt) * wetMult
}

function calculateDriverQualyPerf(driverAttrs, chassisAttrs, engineAttrs, circuit) {
  const d = driverAttrs
  const ch = chassisAttrs
  const en = engineAttrs

  // Fixed weights — no qualifying_weight circuit modifier (it only hurt player, not rivals)
  const base = d.qualifying * 0.52 + d.pace * 0.18 + ch.downforce * 0.15 + en.power * 0.15
  return base * rng(0.92, 1.08)
}

function gridBonus(gridPos, overtakingDifficulty) {
  if (gridPos === 1)  return 12
  if (gridPos <= 3)   return 6
  if (gridPos <= 6)   return 1
  if (gridPos <= 10)  return -6 * overtakingDifficulty
  if (gridPos <= 15)  return -12 * overtakingDifficulty
  return -18 * overtakingDifficulty
}

function isDNF(reliabilityAttr, chassisReliability) {
  const combined = (reliabilityAttr + chassisReliability) / 2
  const prob = Math.max(0.02, (100 - combined) / 100 * 0.16)
  return Math.random() < prob
}

const DEFAULT_DRIVER  = { pace: 75, racecraft: 75, consistency: 75, wet_performance: 75, qualifying: 75, experience: 75, tire_management: 75 }
const DEFAULT_CHASSIS = { downforce: 70, mechanical_grip: 70, drag_efficiency: 70, reliability: 70, weight_distribution: 70 }
const DEFAULT_ENGINE  = { power: 70, driveability: 70, fuel_efficiency: 70, reliability: 70, deployment_mode: 70 }

export function simulateSeason(team) {
  const seasonCircuits = [...circuits].sort(() => Math.random() - 0.5).slice(0, 22)

  const d1Attrs  = team.driver1?.attributes  ?? DEFAULT_DRIVER
  const d2Attrs  = team.driver2?.attributes  ?? { ...DEFAULT_DRIVER, pace: 65 }
  const chAttrs  = team.chassis?.attributes  ?? DEFAULT_CHASSIS
  const enAttrs  = team.engine?.attributes   ?? DEFAULT_ENGINE
  const tdAttrs  = team.technical_director?.attributes ?? { design_genius: 70, innovation: 70, development_speed: 70, detail_obsession: 70 }
  const tiAttrs  = team.tires?.attributes    ?? { peak_grip: 70, durability: 70, thermal_window: 70, wet_performance: 70 }
  const aeroVal  = team.aero      ?? 70
  const budgetVal= team.budget    ?? 70
  const relVal   = team.reliability ?? 70

  // Effective chassis with aero/budget boost
  const effCh = {
    ...chAttrs,
    downforce: (chAttrs.downforce * 0.7 + aeroVal * 0.3),
  }
  const effEn = { ...enAttrs }

  const tdBonus    = tdAttrs.design_genius / 100 * 2
  const tireBonus  = (tiAttrs.peak_grip * 0.4 + tiAttrs.thermal_window * 0.3 + tiAttrs.durability * 0.3) / 100 * 2
  const budgetBonus= budgetVal / 100 * 1.5
  const relBonus   = relVal / 100 * 1.5
  const teamBonus  = tdBonus + tireBonus + budgetBonus + relBonus

  // Rivals: each team has 2 drivers (D1 slightly stronger than D2)
  const rivals = RIVAL_TEAMS.map(r => ({
    ...r,
    d1Rating: r.rating * rng(0.95, 1.08),
    d2Rating: r.rating * rng(0.82, 0.97),
    d1Points: 0, d1Wins: 0, d1Podiums: 0,
    d2Points: 0, d2Wins: 0, d2Podiums: 0,
    points: 0,
  }))

  let playerD1Points = 0, playerD2Points = 0
  let playerD1Wins = 0, playerD2Wins = 0
  let playerD1Podiums = 0, playerD2Podiums = 0
  let playerD1Poles = 0, playerD2Poles = 0
  let playerD1DNFs = 0, playerD2DNFs = 0

  const races = []

  for (const circuit of seasonCircuits) {
    const c  = circuit.modifiers
    const isWet = Math.random() < c.wet_probability
    const safetyCar = Math.random() < c.safety_car_probability
    // --- QUALIFYING ---
    const d1QualyBase = calculateDriverQualyPerf(d1Attrs, effCh, effEn, circuit)
    const d2QualyBase = calculateDriverQualyPerf(d2Attrs, effCh, effEn, circuit)

    const rivalQualyScores = rivals.flatMap(r => [
      { name: r.d1, team: r.name, color: r.color, score: r.d1Rating * 0.90 * rng(0.92, 1.08), isPlayer: false },
      { name: r.d2, team: r.name, color: r.color, score: r.d2Rating * 0.90 * rng(0.92, 1.08), isPlayer: false },
    ])

    const allQualyEntries = [
      { name: team.driver1?.name ?? 'Piloto 1', team: 'Tu Equipo', score: d1QualyBase, isPlayer: true, isD1: true },
      { name: team.driver2?.name ?? 'Piloto 2', team: 'Tu Equipo', score: d2QualyBase, isPlayer: true, isD1: false },
      ...rivalQualyScores,
    ].sort((a, b) => b.score - a.score)

    const d1GridPos = allQualyEntries.findIndex(e => e.isPlayer && e.isD1) + 1
    const d2GridPos = allQualyEntries.findIndex(e => e.isPlayer && !e.isD1) + 1

    if (d1GridPos === 1) playerD1Poles++
    if (d2GridPos === 1) playerD2Poles++

    // --- RACE ---
    const d1DNF = isDNF(enAttrs.reliability, relVal)
    const d2DNF = isDNF(enAttrs.reliability, relVal)

    const d1RaceBase = d1DNF ? 0
      : (calculateDriverRacePerf(d1Attrs, effCh, effEn, circuit, isWet)
        + teamBonus
        + gridBonus(d1GridPos, c.overtaking_difficulty)) * rng(0.84, 1.16)

    const d2RaceBase = d2DNF ? 0
      : (calculateDriverRacePerf(d2Attrs, effCh, effEn, circuit, isWet)
        + teamBonus
        + gridBonus(d2GridPos, c.overtaking_difficulty)) * rng(0.84, 1.16)

    const rivalRaceScores = rivals.flatMap(r => [
      { name: r.d1, team: r.name, color: r.color, teamRef: r, isD1: true,  score: r.d1Rating * rng(0.82, 1.18), isPlayer: false },
      { name: r.d2, team: r.name, color: r.color, teamRef: r, isD1: false, score: r.d2Rating * rng(0.82, 1.18), isPlayer: false },
    ])

    const allRaceEntries = [
      { name: team.driver1?.name ?? 'Piloto 1', team: 'Tu Equipo', score: d1RaceBase, isPlayer: true, isD1: true,  dnf: d1DNF },
      { name: team.driver2?.name ?? 'Piloto 2', team: 'Tu Equipo', score: d2RaceBase, isPlayer: true, isD1: false, dnf: d2DNF },
      ...rivalRaceScores,
    ].sort((a, b) => b.score - a.score)

    const d1RacePos = allRaceEntries.findIndex(e => e.isPlayer && e.isD1) + 1
    const d2RacePos = allRaceEntries.findIndex(e => e.isPlayer && !e.isD1) + 1

    const d1RacePoints = d1DNF ? 0 : (POINTS[d1RacePos - 1] || 0)
    const d2RacePoints = d2DNF ? 0 : (POINTS[d2RacePos - 1] || 0)

    playerD1Points += d1RacePoints
    playerD2Points += d2RacePoints
    if (!d1DNF && d1RacePos === 1) playerD1Wins++
    if (!d2DNF && d2RacePos === 1) playerD2Wins++
    if (!d1DNF && d1RacePos <= 3) playerD1Podiums++
    if (!d2DNF && d2RacePos <= 3) playerD2Podiums++
    if (d1DNF) playerD1DNFs++
    if (d2DNF) playerD2DNFs++

    // Award rival points
    for (const entry of allRaceEntries) {
      if (!entry.isPlayer && entry.teamRef) {
        const pts = POINTS[allRaceEntries.indexOf(entry)] || 0
        if (entry.isD1) {
          entry.teamRef.d1Points += pts
          if (allRaceEntries.indexOf(entry) === 0) entry.teamRef.d1Wins++
          if (allRaceEntries.indexOf(entry) < 3)  entry.teamRef.d1Podiums++
        } else {
          entry.teamRef.d2Points += pts
          if (allRaceEntries.indexOf(entry) === 0) entry.teamRef.d2Wins++
          if (allRaceEntries.indexOf(entry) < 3)  entry.teamRef.d2Podiums++
        }
        entry.teamRef.points += pts
      }
    }

    races.push({
      circuit: circuit.name,
      country: circuit.country,
      emoji: circuit.emoji,
      type: circuit.type,
      isWet,
      safetyCar,
      // Driver 1
      d1QualyPos: d1GridPos,
      d1RacePos,
      d1Points: d1RacePoints,
      d1Dnf: d1DNF,
      // Driver 2
      d2QualyPos: d2GridPos,
      d2RacePos,
      d2Points: d2RacePoints,
      d2Dnf: d2DNF,
      // Combined (for chart)
      racePoints: d1RacePoints + d2RacePoints,
      playerPoints: playerD1Points + playerD2Points,
    })
  }

  // --- STANDINGS ---
  const d1Name = team.driver1?.name ?? 'Piloto 1'
  const d2Name = team.driver2?.name ?? 'Piloto 2'

  // Driver standings (22 drivers)
  const driverStandings = [
    { name: d1Name, team: 'Tu Equipo', points: Math.round(playerD1Points), wins: playerD1Wins, podiums: playerD1Podiums, isPlayer: true, isD1: true, color: '#e05535' },
    { name: d2Name, team: 'Tu Equipo', points: Math.round(playerD2Points), wins: playerD2Wins, podiums: playerD2Podiums, isPlayer: true, isD1: false, color: '#e05535' },
    ...rivals.flatMap(r => [
      { name: r.d1, team: r.name, points: Math.round(r.d1Points), wins: r.d1Wins, podiums: r.d1Podiums, isPlayer: false, color: r.color },
      { name: r.d2, team: r.name, points: Math.round(r.d2Points), wins: r.d2Wins, podiums: r.d2Podiums, isPlayer: false, color: r.color },
    ]),
  ].sort((a, b) => b.points - a.points)

  // Constructor standings (11 teams)
  const constructorStandings = [
    {
      name: 'Tu Equipo',
      color: '#e05535',
      points: Math.round(playerD1Points + playerD2Points),
      wins: playerD1Wins + playerD2Wins,
      isPlayer: true,
    },
    ...rivals.map(r => ({
      name: r.name,
      color: r.color,
      points: Math.round(r.points),
      wins: r.d1Wins + r.d2Wins,
      isPlayer: false,
    })),
  ].sort((a, b) => b.points - a.points)

  const d1FinalPos    = driverStandings.findIndex(d => d.isPlayer && d.isD1) + 1
  const d2FinalPos    = driverStandings.findIndex(d => d.isPlayer && !d.isD1) + 1
  const constructorPos = constructorStandings.findIndex(s => s.isPlayer) + 1

  return {
    races,
    driverStandings,
    constructorStandings,
    // Legacy field (kept for ChampionshipCard compat)
    standings: constructorStandings,
    d1FinalPos,
    d2FinalPos,
    constructorPos,
    finalPosition: d1FinalPos,
    d1Name,
    d2Name,
    playerStats: {
      points: Math.round(playerD1Points + playerD2Points),
      wins:   playerD1Wins + playerD2Wins,
      podiums: playerD1Podiums + playerD2Podiums,
      poles:  playerD1Poles + playerD2Poles,
      dnfs:   playerD1DNFs + playerD2DNFs,
      bestResult: Math.min(...races.map(r => Math.min(r.d1RacePos, r.d2RacePos))),
    },
    d1Stats: {
      points: Math.round(playerD1Points),
      wins: playerD1Wins,
      podiums: playerD1Podiums,
      poles: playerD1Poles,
      dnfs: playerD1DNFs,
    },
    d2Stats: {
      points: Math.round(playerD2Points),
      wins: playerD2Wins,
      podiums: playerD2Podiums,
      poles: playerD2Poles,
      dnfs: playerD2DNFs,
    },
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
