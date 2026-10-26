const KEY = 'f1p1_history_v1'

export function saveGameResult(result) {
  const history = loadHistory()
  const entry = {
    date: new Date().toISOString(),
    d1Name: result.d1Name ?? '?',
    d2Name: result.d2Name ?? '?',
    d1FinalPos: result.d1FinalPos,
    d2FinalPos: result.d2FinalPos,
    constructorPos: result.constructorPos,
    points: result.playerStats?.points ?? 0,
    wins: result.playerStats?.wins ?? 0,
    rivalYear: result.rivalYear ?? '—',
  }
  const updated = [entry, ...history].slice(0, 5)
  try { localStorage.setItem(KEY, JSON.stringify(updated)) } catch {}
  return updated
}

export function loadHistory() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

const DAILY_KEY = 'f1p1_daily_v1'

// Best daily-challenge result per date (keeps the last 30 days)
export function saveDailyResult(date, result) {
  const all = loadDailyResults()
  const prev = all[date]
  const entry = {
    points: result.playerStats?.points ?? 0,
    constructorPos: result.constructorPos,
    d1FinalPos: result.d1FinalPos,
    d2FinalPos: result.d2FinalPos,
    rivalYear: result.rivalYear,
    attempts: (prev?.attempts ?? 0) + 1,
  }
  const better = !prev || entry.points > prev.points
  all[date] = better ? entry : { ...prev, attempts: entry.attempts }
  const trimmed = Object.fromEntries(Object.entries(all).sort(([a], [b]) => b.localeCompare(a)).slice(0, 30))
  try { localStorage.setItem(DAILY_KEY, JSON.stringify(trimmed)) } catch {}
  return { best: trimmed[date], isNewBest: better }
}

export function loadDailyResults() {
  try {
    const raw = localStorage.getItem(DAILY_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}
