// Synergy combos: reward thematically coherent teams with real race-pace
// bonuses. Detected live during the draft and applied in the simulator.

function sameTeam(a, b) {
  if (!a || !b) return false
  return a.toLowerCase() === b.toLowerCase()
}

const SYNERGIES = [
  {
    id: 'legendary_pair',
    label: 'Pareja legendaria',
    emoji: '🤝',
    desc: 'Tus dos pilotos corrieron juntos en el mismo equipo y año',
    bonus: 2.5,
    check: t =>
      t.driver1?.team && t.driver2?.team &&
      sameTeam(t.driver1.team, t.driver2.team) &&
      t.driver1.year === t.driver2.year,
  },
  {
    id: 'works_package',
    label: 'Paquete de fábrica',
    emoji: '🏭',
    desc: 'Chasis y motor del mismo fabricante',
    bonus: 2,
    check: t =>
      t.chassis?.team && t.engine?.supplier &&
      (sameTeam(t.chassis.team, t.engine.supplier) ||
       t.chassis.team.toLowerCase().includes(t.engine.supplier.toLowerCase()) ||
       t.engine.supplier.toLowerCase().includes(t.chassis.team.toLowerCase())),
  },
  {
    id: 'home_driver',
    label: 'Piloto en casa',
    emoji: '🏠',
    desc: 'Un piloto corre con el chasis de su propio equipo',
    bonus: 1.5,
    check: t =>
      t.chassis?.team &&
      ((t.driver1?.team && sameTeam(t.driver1.team, t.chassis.team)) ||
       (t.driver2?.team && sameTeam(t.driver2.team, t.chassis.team))),
  },
  {
    id: 'loyal_boss',
    label: 'Jefe de toda la vida',
    emoji: '👔',
    desc: 'El jefe de equipo dirigió el equipo de tu chasis',
    bonus: 1,
    check: t =>
      t.chassis?.team && Array.isArray(t.team_principal?.teams) &&
      t.team_principal.teams.some(x => sameTeam(x, t.chassis.team)),
  },
  {
    id: 'era_coherence',
    label: 'Garaje coherente',
    emoji: '🗓️',
    desc: 'Al menos 5 elementos de la misma era',
    bonus: 1.5,
    check: t => {
      const eras = ['driver1', 'driver2', 'team_principal', 'technical_director', 'chassis', 'engine', 'tires']
        .map(k => t[k]?.era)
        .filter(Boolean)
      const counts = {}
      for (const e of eras) counts[e] = (counts[e] || 0) + 1
      return Object.values(counts).some(n => n >= 5)
    },
  },
]

export function getActiveSynergies(team) {
  if (!team) return []
  return SYNERGIES.filter(s => {
    try { return s.check(team) } catch { return false }
  })
}

export function getSynergyBonus(team) {
  return getActiveSynergies(team).reduce((sum, s) => sum + s.bonus, 0)
}
