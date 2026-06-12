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
