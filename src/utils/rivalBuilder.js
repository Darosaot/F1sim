import driversData from '../data/drivers.json'
import seasonsData from '../data/seasons.json'

const TEAM_COLORS = {
  'McLaren': '#ff8000',
  'Ferrari': '#dc0000',
  'Mercedes': '#27f4d2',
  'Red Bull': '#3671c6',
  'Williams': '#00a3e0',
  'Alpine': '#0090d0',
  'Renault': '#ffd700',
  'Aston Martin': '#006f62',
  'Haas': '#e8002d',
  'RB': '#2b4562',
  'AlphaTauri': '#2b4562',
  'Toro Rosso': '#2b4562',
  'Kick Sauber': '#52e252',
  'Alfa Romeo': '#b12420',
  'Alfa Romeo Racing': '#b12420',
  'Sauber': '#9b0000',
  'BMW Sauber': '#0067ff',
  'Jordan': '#f5c518',
  'Benetton': '#009944',
  'Lotus': '#1e3a1e',
  'Team Lotus': '#1e3a1e',
  'Lotus F1': '#1e3a1e',
  'Brabham': '#1a1a1a',
  'Tyrrell': '#002f6c',
  'March': '#e63c14',
  'Minardi': '#555555',
  'Arrows': '#ff6600',
  'Force India': '#f596c8',
  'Racing Point': '#f596c8',
  'Jaguar': '#006600',
  'BAR': '#dddddd',
  'Toyota': '#cc0000',
  'Super Aguri': '#cc0000',
  'HRT': '#444444',
  'Caterham': '#006600',
  'Marussia': '#6e0000',
  'Manor': '#6e0000',
  'Spyker': '#ff6600',
  'Stewart': '#006747',
  'Prost': '#002366',
  'Ligier': '#0000cc',
  'Maserati': '#0a4f8e',
  'Cooper': '#003087',
  'BRM': '#006400',
  'Vanwall': '#006b3c',
  'Matra': '#1560bd',
}

function teamColor(name) {
  if (TEAM_COLORS[name]) return TEAM_COLORS[name]
  for (const [key, color] of Object.entries(TEAM_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return color
  }
  // deterministic fallback from team name
  let h = 5381
  for (const c of name) h = ((h << 5) + h) ^ c.charCodeAt(0)
  return '#' + ((h >>> 0) & 0xffffff).toString(16).padStart(6, '0')
}

// Blend driver skill with team quality (chassis/budget)
function driverRating(driver, budgetIndex) {
  const teamScore = 60 + (budgetIndex ?? 50) * 0.4
  if (!driver?.attributes) return Math.round(teamScore)
  const a = driver.attributes
  const skill = a.pace * 0.45 + a.racecraft * 0.30 + a.qualifying * 0.25
  return Math.round(skill * 0.65 + teamScore * 0.35)
}

export function buildRivalsForYear(year) {
  const seen = new Set()
  const yearSeasons = seasonsData
    .filter(s => s.year === year)
    .sort((a, b) => (b.budget_index ?? 0) - (a.budget_index ?? 0))
    .filter(s => { if (seen.has(s.team)) return false; seen.add(s.team); return true })
    .slice(0, 10)

  return yearSeasons.map(season => {
    const d1 = driversData.find(d => d.id === season.driver1) ?? null
    const d2 = season.driver2 ? (driversData.find(d => d.id === season.driver2) ?? null) : null
    const budget = season.budget_index ?? 50

    return {
      name: season.team,
      color: teamColor(season.team),
      d1: d1?.name ?? 'Piloto 1',
      d2: d2?.name ?? 'Piloto 2',
      d1Rating: driverRating(d1, budget),
      d2Rating: d2 ? driverRating(d2, budget) : Math.round(55 + budget * 0.38),
      d1Points: 0, d1Wins: 0, d1Podiums: 0,
      d2Points: 0, d2Wins: 0, d2Podiums: 0,
      points: 0,
    }
  })
}

export function getAvailableRivalYears() {
  return [...new Set(seasonsData.map(s => s.year))].sort((a, b) => b - a)
}
