import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'
import RaceTicker from '../components/simulation/RaceTicker'
import SeasonChart from '../components/simulation/SeasonChart'
import ChampionshipCard from '../components/results/ChampionshipCard'
import { getVerdict } from '../utils/simulator'

export default function Results() {
  const simulationResults = useGameStore(s => s.simulationResults)
  const resetGame         = useGameStore(s => s.resetGame)
  const [tickerDone, setTickerDone] = useState(false)

  if (!simulationResults) return null

  const { races, finalPosition, playerStats } = simulationResults
  const verdict = getVerdict(finalPosition, playerStats)

  // Timer-based reveal: no dependency on callback chain from RaceTicker
  useEffect(() => {
    const delay = (races?.length ?? 22) * 160 + 900
    const t = setTimeout(() => setTickerDone(true), delay)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-sand font-body flex flex-col">

      {/* Header */}
      <header className="bg-sand px-6 py-3 flex items-center justify-between">
        <div className="flex items-baseline gap-1 leading-none">
          <span className="font-display font-black text-2xl text-ink">F1</span>
          <span className="font-display font-black text-2xl" style={{ color: 'var(--gold)' }}>—</span>
          <span className="font-display font-black text-2xl text-ink">P1</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-md">
            CÓDIGO #{Math.random().toString(36).slice(2, 8).toUpperCase()}
          </span>
        </div>
      </header>

      <hr className="divider" />

      {/* Main content */}
      <div className="max-w-2xl mx-auto w-full px-6 py-8 space-y-6">

        {/* Page title + verdict */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-ink-md mb-1">RESULTADOS</p>
          <h1 className="font-display font-black text-4xl uppercase text-ink">La Temporada</h1>
        </div>

        {/* Verdict */}
        <div className="bg-white border border-borderc px-4 py-3">
          <p className="text-sm font-semibold text-ink">{verdict}</p>
        </div>

        {/* Race ticker */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-md mb-2">
            RESULTADOS DE CARRERA
          </p>
          <RaceTicker races={races} />
        </div>

        {/* Season chart */}
        {tickerDone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-md mb-2">
              EVOLUCIÓN DE PUNTOS
            </p>
            <div className="bg-white border border-borderc p-4">
              <SeasonChart races={races} />
            </div>
          </motion.div>
        )}

        {/* Final dark banner */}
        {tickerDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-ink text-white p-6 flex items-start gap-8"
          >
            <div>
              <div className="font-display font-black leading-none" style={{ fontSize: 72, color: 'var(--gold)' }}>
                P{finalPosition}
              </div>
            </div>
            <div className="border-l border-white/20 pl-8">
              <div className="font-display font-black text-xl uppercase mb-3">
                {playerStats.wins > 0 ? `${playerStats.wins} VICTORIAS` : 'SIN VICTORIAS'}
              </div>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'PUNTOS',    value: playerStats.points },
                  { label: 'ABANDONS',  value: playerStats.dnfs },
                  { label: 'VICTORIAS', value: playerStats.wins },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="font-display font-black text-3xl" style={{ color: 'var(--gold)' }}>{value}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Championship card + actions */}
        {tickerDone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <ChampionshipCard results={simulationResults} />
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-borderc px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-md text-center">
        F1 LEGENDS · PIT LANE DRAFT · <button onClick={resetGame} className="hover:underline">VOLVER AL INICIO</button>
      </footer>
    </div>
  )
}
