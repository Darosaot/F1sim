import { useGameStore } from './stores/gameStore'
import Home from './pages/Home'
import Game from './pages/Game'
import Results from './pages/Results'

export default function App() {
  const phase = useGameStore(s => s.phase)

  if (phase === 'setup') return <Home />
  if (phase === 'results') return <Results />
  return <Game />
}
