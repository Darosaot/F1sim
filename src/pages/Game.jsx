import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'
import TeamBuilder from '../components/game/TeamBuilder'
import TeamVisualization from '../components/game/TeamVisualization'
import SeasonCard from '../components/game/SeasonCard'
import DiceButton from '../components/ui/DiceButton'
import WildcardBar from '../components/game/WildcardBar'
import EraSelector from '../components/ui/EraSelector'
import ModeToggle from '../components/ui/ModeToggle'
import { simulateSeason } from '../utils/simulator'
import { calculateTeamRating } from '../utils/ratingEngine'

export default function Game() {
  const phase              = useGameStore(s => s.phase)
  const team               = useGameStore(s => s.team)
  const era                = useGameStore(s => s.era)
  const mode               = useGameStore(s => s.mode)
  const rollCount          = useGameStore(s => s.rollCount)
  const setSimulationResults = useGameStore(s => s.setSimulationResults)
  const resetGame          = useGameStore(s => s.resetGame)
  const filledCount        = useGameStore(s => s.getFilledCount())
  const currentCard        = useGameStore(s => s.currentCard)

  const eraLabel = era === 'all' ? 'TODA LA HISTORIA'
    : era === 'early' ? '1950–65'
    : era === 'pre_turbo' ? '1966–82'
    : era === 'turbo' ? '1983–88'
    : era === 'v10' ? 'V10 1989–05'
    : era === 'v8' ? 'V8 2006–13'
    : era === 'hybrid' ? 'HÍBRIDA 2014–21'
    : 'ACTUAL 2022+'

  const modeLabel = mode === 'vip' ? 'CLÁSICO' : 'MEMORIA'

  function handleSimulate() {
    const results = simulateSeason(team)
    setSimulationResults(results)
  }

  return (
    <div className="min-h-screen bg-sand font-body flex flex-col">

      {/* Header */}
      <header className="bg-sand px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={resetGame} className="flex items-center gap-3 hover:opacity-70 transition-opacity">
            <div>
              <div className="flex items-baseline gap-1 leading-none">
                <span className="font-display font-black text-2xl text-ink">F1</span>
                <span className="font-display font-black text-2xl" style={{ color: 'var(--gold)' }}>—</span>
                <span className="font-display font-black text-2xl text-ink">P1</span>
              </div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-ink-md">
                BUILD · SIMULATE · P1
              </div>
            </div>
          </button>
        </div>

        {/* Current config breadcrumb */}
        <div className="hidden md:flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-ink-md">
          <span>{eraLabel}</span>
          <span className="mx-1 text-ink-lt">·</span>
          <span>{modeLabel}</span>
          <span className="mx-1 text-ink-lt">·</span>
          <span className={filledCount === 11 ? 'text-rust' : ''}>{filledCount}/11</span>
        </div>

        <div className="flex items-center gap-2">
          <WildcardBar />
        </div>
      </header>

      <hr className="divider" />

      {/* 3-Column Layout */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT COLUMN — Config + Season card + Roll */}
        <div className="w-[260px] shrink-0 border-r border-borderc flex flex-col p-4 gap-4 overflow-y-auto">

          <EraSelector />
          <hr className="divider" />
          <ModeToggle />
          <hr className="divider" />

          {/* Season card or placeholder */}
          <AnimatePresence mode="wait">
            {currentCard ? (
              <SeasonCard key="card" />
            ) : phase === 'complete' ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-2 border-ink p-4"
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink-md mb-1">
                  LINEUP COMPLETO
                </div>
                <div className="font-display font-black text-3xl text-ink">11/11</div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border border-dashed border-borderc p-5 text-center"
              >
                <p className="text-xs text-ink-md leading-relaxed">
                  Tira para obtener un equipo y temporada
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action button */}
          {phase === 'complete' ? (
            <motion.button
              whileHover={{ opacity: 0.9 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSimulate}
              className="w-full py-4 bg-rust text-white font-display font-black text-lg uppercase tracking-widest hover:opacity-90 transition-opacity text-center"
            >
              SIMULAR EL CAMPEONATO →
            </motion.button>
          ) : (
            <DiceButton />
          )}

          {/* Roll counter */}
          {rollCount > 0 && phase !== 'complete' && (
            <div className="text-center text-[10px] text-ink-lt">
              Tirada #{rollCount}
            </div>
          )}
        </div>

        {/* CENTER COLUMN — Team visualization */}
        <div className="flex-1 min-w-0 bg-garage">
          <TeamVisualization />
        </div>

        {/* RIGHT COLUMN — Box Score */}
        <div className="w-[260px] shrink-0 border-l border-borderc flex flex-col p-4 overflow-y-auto">
          <TeamBuilder />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-borderc px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-md flex items-center justify-between">
        <span>F1 LEGENDS · PIT LANE DRAFT · BUILD · SIMULATE · P1</span>
        <button onClick={resetGame} className="text-ink-lt hover:text-ink transition-colors">
          ← Inicio
        </button>
      </footer>
    </div>
  )
}
