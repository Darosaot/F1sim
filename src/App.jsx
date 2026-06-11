import { useEffect } from 'react'
import { useGameStore } from './stores/gameStore'
import { getSharedTeamFromUrl } from './utils/shareEncoder'
import Home from './pages/Home'
import Game from './pages/Game'
import Results from './pages/Results'

export default function App() {
  const phase          = useGameStore(s => s.phase)
  const loadSharedTeam = useGameStore(s => s.loadSharedTeam)

  useEffect(() => {
    const shared = getSharedTeamFromUrl()
    if (shared && loadSharedTeam(shared)) {
      // Clear the hash so refresh/reset doesn't re-import
      history.replaceState(null, '', window.location.pathname)
    }
  }, [loadSharedTeam])

  if (phase === 'setup') return <Home />
  if (phase === 'results') return <Results />
  return <Game />
}
