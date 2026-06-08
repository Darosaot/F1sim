import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'
import TeamBuilder from '../components/game/TeamBuilder'
import SeasonCard from '../components/game/SeasonCard'
import DiceButton from '../components/ui/DiceButton'
import WildcardBar from '../components/game/WildcardBar'
import { simulateSeason, getVerdict } from '../utils/simulator'
import { calculateTeamRating } from '../utils/ratingEngine'

export default function Game() {
  const phase = useGameStore(s => s.phase)
  const team = useGameStore(s => s.team)
  const rollCount = useGameStore(s => s.rollCount)
  const setSimulationResults = useGameStore(s => s.setSimulationResults)
  const resetGame = useGameStore(s => s.resetGame)

  function handleSimulate() {
    const results = simulateSeason(team)
    setSimulationResults(results)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a2a] bg-[#0a0a0f] sticky top-0 z-10">
        <button
          onClick={resetGame}
          className="text-xs text-[#555577] hover:text-white transition-colors"
        >
          ← Inicio
        </button>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#555577]">TIRADA</span>
          <span className="text-sm font-black text-[#e10600]">#{rollCount}</span>
        </div>
        <WildcardBar />
      </div>

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-5xl mx-auto w-full">

        {/* Left: Team Builder */}
        <div className="lg:w-64 xl:w-72 shrink-0">
          <TeamBuilder />
        </div>

        {/* Right: Draft area */}
        <div className="flex-1 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {phase === 'complete' ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-[#1a1a28] border border-[#e10600] p-6 text-center space-y-4"
              >
                <div className="text-4xl">🏁</div>
                <h2 className="text-xl font-black text-white">¡Equipo Completo!</h2>
                <p className="text-sm text-[#8888aa]">
                  Rating:{' '}
                  <span className="text-[#e10600] font-black text-lg">
                    {calculateTeamRating(team).toFixed(1)}
                  </span>
                </p>
                <p className="text-xs text-[#555577]">
                  Pulsa para simular las 22 carreras de la temporada.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSimulate}
                  className="w-full py-4 rounded-xl bg-[#e10600] text-white font-black text-base uppercase tracking-widest shadow-[0_0_20px_rgba(225,6,0,0.4)] hover:bg-red-500 transition-colors"
                >
                  🚀 SIMULAR TEMPORADA
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="drafting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <SeasonCard />
                <DiceButton />

                {rollCount === 0 && !useGameStore.getState().currentCard && (
                  <div className="text-center text-xs text-[#444466] py-4">
                    Pulsa TIRAR para obtener tu primera carta de equipo
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
