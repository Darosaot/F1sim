export const SLOT_LABELS = {
  driver1:             { label: 'Piloto 1',           emoji: '🪖', weight: 0.22 },
  driver2:             { label: 'Piloto 2',           emoji: '🏎️', weight: 0.10 },
  team_principal:      { label: 'Jefe de Equipo',     emoji: '🎯', weight: 0.05 },
  technical_director:  { label: 'Director Técnico',   emoji: '🔧', weight: 0.08 },
  chassis:             { label: 'Chasis',              emoji: '⚙️', weight: 0.15 },
  engine:              { label: 'Motor',               emoji: '🔋', weight: 0.14 },
  strategist:          { label: 'Estratega',           emoji: '📡', weight: 0.08 },
  tires:               { label: 'Neumáticos',          emoji: '🔵', weight: 0.06 },
  aero:                { label: 'Aerodinámica',        emoji: '💨', weight: 0.05 },
  budget:              { label: 'Financiación',        emoji: '💰', weight: 0.04 },
  reliability:         { label: 'Fiabilidad',          emoji: '🛡️', weight: 0.03 },
}

export function calculateTeamRating(team) {
  let score = 0
  let filledCount = 0

  if (team.driver1) {
    const d = team.driver1.attributes
    const driverScore = (d.pace * 0.45 + d.racecraft * 0.25 + d.consistency * 0.20 + d.qualifying * 0.10) / 100
    score += driverScore * 100 * SLOT_LABELS.driver1.weight
    filledCount++
  }
  if (team.driver2) {
    const d = team.driver2.attributes
    const driverScore = (d.pace * 0.45 + d.racecraft * 0.25 + d.consistency * 0.20 + d.qualifying * 0.10) / 100
    score += driverScore * 100 * SLOT_LABELS.driver2.weight
    filledCount++
  }
  if (team.team_principal) {
    const tp = team.team_principal.attributes
    const tpScore = (tp.team_management * 0.40 + tp.driver_management * 0.25 + tp.political_skill * 0.20 + tp.crisis_management * 0.15) / 100
    score += tpScore * 100 * SLOT_LABELS.team_principal.weight
    filledCount++
  }
  if (team.technical_director) {
    const td = team.technical_director.attributes
    const tdScore = (td.design_genius * 0.35 + td.innovation * 0.30 + td.aerodynamic_vision * 0.20 + td.development_speed * 0.15) / 100
    score += tdScore * 100 * SLOT_LABELS.technical_director.weight
    filledCount++
  }
  if (team.chassis) {
    const ch = team.chassis.attributes
    const chassisScore = (ch.downforce * 0.35 + ch.mechanical_grip * 0.30 + ch.drag_efficiency * 0.25 + ch.weight_distribution * 0.10) / 100
    score += chassisScore * 100 * SLOT_LABELS.chassis.weight
    filledCount++
  }
  if (team.engine) {
    const en = team.engine.attributes
    const engineScore = (en.power * 0.40 + en.driveability * 0.25 + en.fuel_efficiency * 0.20 + en.reliability * 0.15) / 100
    score += engineScore * 100 * SLOT_LABELS.engine.weight
    filledCount++
  }
  if (team.strategist) {
    const st = team.strategist.attributes
    const stratScore = (st.race_management * 0.30 + st.pit_timing * 0.25 + st.undercut_instinct * 0.25 + st.safety_car_read * 0.20) / 100
    score += stratScore * 100 * SLOT_LABELS.strategist.weight
    filledCount++
  }
  if (team.tires) {
    const ti = team.tires.attributes
    const tiresScore = (ti.peak_grip * 0.35 + ti.durability * 0.25 + ti.thermal_window * 0.20 + ti.wet_performance * 0.20) / 100
    score += tiresScore * 100 * SLOT_LABELS.tires.weight
    filledCount++
  }
  if (team.aero !== undefined && team.aero !== null) {
    score += team.aero * SLOT_LABELS.aero.weight
    filledCount++
  }
  if (team.budget !== undefined && team.budget !== null) {
    score += team.budget * SLOT_LABELS.budget.weight
    filledCount++
  }
  if (team.reliability !== undefined && team.reliability !== null) {
    score += team.reliability * SLOT_LABELS.reliability.weight
    filledCount++
  }

  if (filledCount === 0) return 0
  // Scale proportionally by filled slots
  const totalWeight = Object.values(SLOT_LABELS)
    .filter((_, i) => {
      const keys = Object.keys(SLOT_LABELS)
      const key = keys[i]
      return team[key] !== null && team[key] !== undefined
    })
    .reduce((sum, s) => sum + s.weight, 0)

  return totalWeight > 0 ? Math.round(score / totalWeight * 10) / 10 : 0
}

export function getElementValue(element, slotKey) {
  if (!element) return 0
  if (slotKey === 'aero' || slotKey === 'budget' || slotKey === 'reliability') {
    return typeof element === 'number' ? element : 0
  }
  const attrs = element.attributes
  if (!attrs) return 0
  const values = Object.values(attrs)
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

export function getBenchmark(rating) {
  if (rating >= 96) return { name: 'McLaren-Honda MP4/4 1988', rating: 97 }
  if (rating >= 93) return { name: 'Ferrari F2004', rating: 95 }
  if (rating >= 90) return { name: 'Red Bull RB19 2023', rating: 92 }
  if (rating >= 87) return { name: 'Mercedes W11 2020', rating: 90 }
  if (rating >= 84) return { name: 'Williams FW14B 1992', rating: 87 }
  if (rating >= 80) return { name: 'Ferrari F2002', rating: 85 }
  if (rating >= 75) return { name: 'Red Bull RB6 2010', rating: 82 }
  if (rating >= 70) return { name: 'McLaren MP4/13 1998', rating: 78 }
  return { name: 'Equipo de Mitad de Parrilla', rating: 65 }
}
