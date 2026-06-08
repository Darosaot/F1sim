import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'
import TeamBuilder from '../components/game/TeamBuilder'
import TeamVisualization from '../components/game/TeamVisualization'
import SeasonCard from '../components/game/SeasonCard'
import DiceButton from '../components/ui/DiceButton'
import WildcardBar from '../components/game/WildcardBar'
import EraSelector from '../components/ui/EraSelector'
import ModeToggle from '../components/ui/ModeToggle'
import { simulateSeason } from '../utils/simulator'
import { buildRivalsForYear } from '../utils/rivalBuilder'

export default function Game() {
  const phase               = useGameStore(s => s.phase)
  const team                = useGameStore(s => s.team)
  const rivalYear           = useGameStore(s => s.rivalYear)
  const era                 = useGameStore(s => s.era)
  const mode                = useGameStore(s => s.mode)
  const rollCount           = useGameStore(s => s.rollCount)
  const setSimulationResults  = useGameStore(s => s.setSimulationResults)
  const useWildcard           = useGameStore(s => s.useWildcard)
  const useWildcardSameTeam   = useGameStore(s => s.useWildcardSameTeam)
  const wildcards             = useGameStore(s => s.wildcards)
  const resetGame             = useGameStore(s => s.resetGame)
  const filledCount         = useGameStore(s => s.getFilledCount())
  const currentCard         = useGameStore(s => s.currentCard)

  const eraLabel = { all: 'TODA LA HISTORIA', early: '1950–65', pre_turbo: '1966–82', turbo: '1983–88', v10: 'V10 1989–05', v8: 'V8 2006–13', hybrid: 'HÍBRIDA 2014–21', current: 'ACTUAL 2022+' }[era]
  const modeLabel = mode === 'vip' ? 'CLÁSICO' : 'MEMORIA'

  function handleSimulate() {
    const rivals = buildRivalsForYear(rivalYear)
    setSimulationResults({ ...simulateSeason(team, rivals), rivalYear })
  }

  return (
    <div className="min-h-screen bg-sand font-body flex flex-col">

      {/* Header */}
      <header className="bg-sand px-4 md:px-6 py-3 flex items-center justify-between">
        <button onClick={resetGame} className="flex items-center gap-3 hover:opacity-70 transition-opacity">
          <div>
            <div className="flex items-baseline gap-1 leading-none">
              <span className="font-display font-black text-2xl text-ink">F1</span>
              <span className="font-display font-black text-2xl" style={{ color: 'var(--gold)' }}>—</span>
              <span className="font-display font-black text-2xl text-ink">P1</span>
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-ink-md">
              CONSTRUYE · SIMULA · P1
            </div>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-ink-md">
          <span>{eraLabel}</span>
          <span className="mx-1 text-ink-lt">·</span>
          <span>{modeLabel}</span>
          <span className="mx-1 text-ink-lt">·</span>
          <span className={filledCount === 10 ? 'text-rust' : ''}>{filledCount}/10</span>
        </div>

        {/* Mobile progress pill */}
        <div className="flex md:hidden items-center gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${filledCount === 10 ? 'text-rust' : 'text-ink-md'}`}>
            {filledCount}/10
          </span>
          <WildcardBar />
        </div>

        <div className="hidden md:block">
          <WildcardBar />
        </div>
      </header>

      <hr className="divider" />

      {/* Layout: single column on mobile, 3-column on desktop */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* LEFT — Config + Season card */}
        <div className="flex-1 min-w-0 md:border-r md:border-borderc flex flex-col overflow-y-auto">

          {/* Config strip — compact on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 px-4 pt-4 pb-3 border-b border-borderc">
            <EraSelector locked={rollCount > 0} />
            <ModeToggle  locked={rollCount > 0} />
          </div>

          {/* Season card / placeholder / complete */}
          <div className="flex-1 p-4 flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {currentCard ? (
                <SeasonCard key="card" />
              ) : phase === 'complete' ? (
                <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-2 border-ink p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-ink-md mb-1">EQUIPO COMPLETO</div>
                  <div className="font-display font-black text-3xl text-ink">10/10</div>
                </motion.div>
              ) : (
                <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border border-dashed border-borderc p-8 text-center flex-1 flex items-center justify-center">
                  <p className="text-sm text-ink-md leading-relaxed">
                    Tira para obtener un equipo y temporada
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Re-roll buttons */}
            {currentCard && wildcards > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-md mb-2">
                  ¿NO CONVENCE? NUEVO TIRO · {wildcards} RESTANTES
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={useWildcard}
                    className="flex-1 py-2.5 border border-ink text-ink font-display font-black text-xs uppercase tracking-widest hover:bg-ink hover:text-white transition-colors text-center"
                  >
                    ↺ OTRO EQUIPO
                  </button>
                  <button
                    onClick={useWildcardSameTeam}
                    className="flex-1 py-2.5 border border-ink text-ink font-display font-black text-xs uppercase tracking-widest hover:bg-ink hover:text-white transition-colors text-center"
                  >
                    ↺ OTRA TEMPORADA
                  </button>
                </div>
              </div>
            )}

            {/* Roll count */}
            {rollCount > 0 && phase !== 'complete' && !currentCard && (
              <div className="text-center text-[10px] text-ink-lt">Tirada #{rollCount}</div>
            )}
          </div>

          {/* Action button pinned at bottom */}
          {phase === 'complete' ? (
            <motion.button whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.97 }}
              onClick={handleSimulate}
              className="mx-4 mb-4 py-4 bg-rust text-white font-display font-black text-lg uppercase tracking-widest hover:opacity-90 transition-opacity text-center">
              SIMULAR EL CAMPEONATO →
            </motion.button>
          ) : (
            <div className="px-4 pb-4">
              <DiceButton />
            </div>
          )}
        </div>

        {/* CENTER — Team Garage (desktop only) */}
        <div className="w-64 shrink-0 bg-garage hidden lg:block">
          <TeamVisualization />
        </div>

        {/* RIGHT — Box Score (tablet+ only) */}
        <div className="w-56 shrink-0 border-l border-borderc hidden md:flex flex-col p-4 overflow-y-auto">
          <TeamBuilder />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-borderc px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-ink-md flex items-center justify-between">
        <span>F1 LEGENDS · PIT LANE DRAFT</span>
        <button onClick={resetGame} className="text-ink-lt hover:text-ink transition-colors">← Inicio</button>
      </footer>
    </div>
  )
}
