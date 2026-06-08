export function encodeTeam(team, config) {
  const payload = {
    d1: team.driver1?.id,
    d2: team.driver2?.id,
    tp: team.team_principal?.id,
    td: team.technical_director?.id,
    ch: team.chassis?.id,
    en: team.engine?.id,
    ti: team.tires?.id,
    ae: team.aero,
    bu: team.budget,
    re: team.reliability,
    era: config?.era || 'all',
    mode: config?.mode || 'vip',
  }
  return btoa(JSON.stringify(payload))
}

export function decodeTeam(hash) {
  try {
    return JSON.parse(atob(hash))
  } catch {
    return null
  }
}

export function buildShareUrl(team, config) {
  const hash = encodeTeam(team, config)
  return `${window.location.origin}${window.location.pathname}#share=${hash}`
}
