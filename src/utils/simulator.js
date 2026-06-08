import circuits from '../data/circuits.json'

const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0, 0]
const RIVAL_TEAMS = [
  { name: 'McLaren Rivals', color: '#ff8000' },
  { name: 'Ferrari Rivals', color: '#dc0000' },
  { name: 'Mercedes Rivals', color: '#27f4d2' },
  { name: 'Red Bull Rivals', color: '#3671c6' },
  { name: 'Williams Rivals', color: '#00a3e0' },
  { name: 'Alpine', color: '#0090d0' },
  { name: 'Aston Martin', color: '#006f62' },
  { name: 'Haas', color: '#e8002d' },
  { name: 'AlphaTauri', color: '#2b4562' },
  { name: 'Kick Sauber', color: '#52e252' },
]

function rng(min = 0, max = 1) {
  return min + Math.random() * (max - min)
}

function calculateRacePerf(team, circuit) {
  const c = circuit.modifiers
  const d1 = team.driver1?.attributes ?? { pace: 75, racecraft: 75, consistency: 75, wet_performance: 75 }
  const d2 = team.driver2?.attributes ?? { pace: 65, racecraft: 65, consistency: 65, wet_performance: 65 }
  const ch = team.chassis?.attributes ?? { downforce: 70, mechanical_grip: 70, drag_efficiency: 70, weight_distribution: 70 }
  const en = team.engine?.attributes ?? { power: 70, driveability: 70, fuel_efficiency: 70, reliability: 70 }
  const st = team.strategist?.attributes ?? { race_management: 70, pit_timing: 70, undercut_instinct: 70, safety_car_read: 70 }
  const ti = team.tires?.attributes ?? { peak_grip: 70, durability: 70, thermal_window: 70, wet_performance: 70 }
  const td = team.technical_director?.attributes ?? { design_genius: 70, innovation: 70, development_speed: 70, detail_obsession: 70 }
  const tp = team.team_principal?.attributes ?? { team_management: 70, driver_management: 70, political_skill: 70, crisis_management: 70 }
  const aero = team.aero ?? 70
  const budget = team.budget ?? 70
  const reliability = team.reliability ?? 70

  const aeroPart = (ch.downforce * c.downforce_weight + aero * 0.3)
  const powerPart = en.power * c.power_weight
  const driverPart = (d1.pace * 0.6 + d1.racecraft * 0.4) * c.racecraft_weight
  const consistencyBonus = d1.consistency / 100 * 8
  const engineReliab = en.reliability / 100 * 5
  const stratBonus = (st.race_management * 0.4 + st.pit_timing * 0.3 + st.undercut_instinct * 0.3) / 100 * 10
  const tdBonus = td.design_genius / 100 * 8
  const tiresBonus = (ti.peak_grip * 0.4 + ti.thermal_window * 0.3 + ti.durability * 0.3) / 100 * 8
  const budgetBonus = budget / 100 * 5
  const d2Bonus = (d2.pace * 0.5 + d2.racecraft * 0.5) / 100 * 6

  const base = (aeroPart + powerPart + driverPart) / 3

  return base + consistencyBonus + engineReliab + stratBonus + tdBonus + tiresBonus + budgetBonus + d2Bonus
}

function isDNF(team) {
  const relEngine = team.engine?.attributes?.reliability ?? 78
  const relChassis = team.reliability ?? 78
  const combined = (relEngine + relChassis) / 2
  const dnfProb = Math.max(0.02, (100 - combined) / 100 * 0.18)
  return Math.random() < dnfProb
}

export function simulateSeason(team) {
  const seasonCircuits = [...circuits].sort(() => Math.random() - 0.5).slice(0, 22)

  // Rival rating range: 62–98, spread so competition feels real
  const rivals = RIVAL_TEAMS.map((r, i) => ({
    ...r,
    rating: rng(62 + i * 1.5, 92 + i * 0.5),
    points: 0,
    wins: 0,
    podiums: 0,
  }))

  const playerTeamName = team.chassis?.team || 'Your Team'
  let playerPoints = 0
  let playerWins = 0
  let playerPodiums = 0
  let playerPoles = 0
  let playerDNFs = 0

  const races = []

  for (const circuit of seasonCircuits) {
    const playerPerf = calculateRacePerf(team, circuit)
    const playerVariance = rng(0.82, 1.18)
    let playerScore = playerPerf * playerVariance

    const isWet = Math.random() < circuit.modifiers.wet_probability
    if (isWet) {
      const wetFactor = (team.driver1?.attributes?.wet_performance ?? 75) / 75
      playerScore *= wetFactor
    }

    const safetyCar = Math.random() < circuit.modifiers.safety_car_probability
    if (safetyCar) {
      const stratBonus = (team.strategist?.attributes?.safety_car_read ?? 70) / 100 * 4
      playerScore += stratBonus
    }

    const dnf = isDNF(team)
    if (dnf) {
      playerScore = 0
      playerDNFs++
    }

    const rivalScores = rivals.map(r => ({
      ...r,
      raceScore: r.rating * rng(0.80, 1.20),
    }))

    const allEntries = [
      { name: 'Your Team', score: playerScore, isPlayer: true },
      ...rivalScores.map(r => ({ name: r.name, score: r.raceScore, isPlayer: false, color: r.color })),
    ]

    allEntries.sort((a, b) => b.score - a.score)

    const playerPos = allEntries.findIndex(e => e.isPlayer) + 1
    const racePoints = dnf ? 0 : (POINTS[playerPos - 1] || 0)

    // Pole position (best qualifying)
    const isPole = !dnf && (playerScore === Math.max(...allEntries.map(e => e.score * rng(0.97, 1.03))))
    if (isPole) playerPoles++

    playerPoints += racePoints
    if (playerPos === 1 && !dnf) playerWins++
    if (playerPos <= 3 && !dnf) playerPodiums++

    // Award rival points
    let rivalIdx = 0
    for (const entry of allEntries) {
      if (!entry.isPlayer) {
        const r = rivals.find(r => r.name === entry.name)
        if (r) {
          r.points += POINTS[allEntries.indexOf(entry)] || 0
          if (allEntries.indexOf(entry) === 0) r.wins++
          if (allEntries.indexOf(entry) < 3) r.podiums++
        }
      }
      rivalIdx++
    }

    races.push({
      circuit: circuit.name,
      country: circuit.country,
      emoji: circuit.emoji,
      type: circuit.type,
      playerPos,
      racePoints,
      isWet,
      safetyCar,
      dnf,
      isPole,
      playerPoints: playerPoints,
    })
  }

  const standingsRivals = rivals.map(r => ({
    name: r.name,
    color: r.color,
    points: Math.round(r.points),
    wins: r.wins,
    podiums: r.podiums,
    isPlayer: false,
  }))

  const allStandings = [
    {
      name: 'Your Team',
      color: '#e10600',
      points: Math.round(playerPoints),
      wins: playerWins,
      podiums: playerPodiums,
      isPlayer: true,
    },
    ...standingsRivals,
  ].sort((a, b) => b.points - a.points)

  const finalPosition = allStandings.findIndex(s => s.isPlayer) + 1

  return {
    races,
    standings: allStandings,
    finalPosition,
    playerStats: {
      points: Math.round(playerPoints),
      wins: playerWins,
      podiums: playerPodiums,
      poles: playerPoles,
      dnfs: playerDNFs,
      bestResult: Math.min(...races.map(r => r.playerPos)),
    },
  }
}

export function getVerdict(finalPosition, playerStats, team) {
  const { wins, points, dnfs } = playerStats
  if (finalPosition === 1) {
    if (wins >= 15) return '🏆 DOMINACIÓN TOTAL. Eres el equipo de la era.'
    if (wins >= 10) return '🏆 ¡CAMPEONES! Una temporada brillante.'
    return '🏆 ¡CAMPEONES! Victoria en el último suspiro.'
  }
  if (finalPosition === 2) return '🥈 Subcampeones. Estuvisteis tan cerca...'
  if (finalPosition === 3) return '🥉 Tercer puesto. Un año sólido, pero algo faltó.'
  if (finalPosition <= 5) return `${finalPosition}° lugar. Potencial desaprovechado.`
  if (dnfs > 4) return `${finalPosition}° lugar. La fiabilidad os hundió.`
  return `${finalPosition}° lugar. Hay margen de mejora en la selección.`
}
