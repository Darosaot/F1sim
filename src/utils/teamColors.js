export const TEAM_COLORS = {
  'Ferrari':     { primary: '#dc0000', secondary: '#fff200', text: '#fff' },
  'McLaren':     { primary: '#ff8000', secondary: '#fff',    text: '#000' },
  'Mercedes':    { primary: '#27f4d2', secondary: '#000',    text: '#000' },
  'Red Bull':    { primary: '#3671c6', secondary: '#cc1e4a', text: '#fff' },
  'Williams':    { primary: '#00a3e0', secondary: '#fff',    text: '#fff' },
  'Lotus':       { primary: '#000000', secondary: '#ffd700', text: '#ffd700' },
  'Renault':     { primary: '#f5c906', secondary: '#000',    text: '#000' },
  'Benetton':    { primary: '#01a3ab', secondary: '#fff',    text: '#fff' },
  'Tyrrell':     { primary: '#003594', secondary: '#fff',    text: '#fff' },
  'Brabham':     { primary: '#fff',    secondary: '#000',    text: '#000' },
  'Alfa Romeo':  { primary: '#960000', secondary: '#fff',    text: '#fff' },
  'Brawn GP':    { primary: '#c6ff00', secondary: '#fff',    text: '#000' },
  'Cooper':      { primary: '#008000', secondary: '#fff',    text: '#fff' },
  'Vanwall':     { primary: '#006400', secondary: '#fff',    text: '#fff' },
  'BRM':         { primary: '#16521e', secondary: '#c0c0c0', text: '#fff' },
  'Maserati':    { primary: '#c00000', secondary: '#fff',    text: '#fff' },
  'default':     { primary: '#e10600', secondary: '#fff',    text: '#fff' },
}

export function getTeamColors(teamName) {
  if (!teamName) return TEAM_COLORS.default
  const key = Object.keys(TEAM_COLORS).find(k =>
    teamName.toLowerCase().includes(k.toLowerCase())
  )
  return key ? TEAM_COLORS[key] : TEAM_COLORS.default
}
