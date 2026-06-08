import { useState, useEffect } from 'react'
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

  const { races, d1FinalPos, d2FinalPos, constructorPos, d1Stats, d2Stats, d1Name, d2Name } = simulationResults
  const verdict = getVerdict(d1FinalPos, d2FinalPos, constructorPos)

  useEffect(() => {
    const delay = (races?.length ?? 22) * 400 + 900
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
        <span className="text-[10px] font-bold uppercase tracking-widest text-ink-md">
          CÓDIGO #{Math.random().toString(36).slice(2, 8).toUpperCase()}
        </span>
      </header>

      <hr className="divider" />

      <div className="max-w-2xl mx-auto w-full px-6 py-8 space-y-6">

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
          <RaceTicker races={races} d1Name={d1Name} d2Name={d2Name} />
        </div>

        {/* Season chart */}
        {tickerDone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-md mb-2">
              EVOLUCIÓN DE PUNTOS (CONSTRUCTORES)
            </p>
            <div className="bg-white border border-borderc p-4">
              <SeasonChart races={races} />
            </div>
          </motion.div>
        )}

        {/* Dual championship banners */}
        {tickerDone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Drivers' championship */}
            <div className="bg-ink text-white p-5">
              <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-2">
                CAMPEONATO DE PILOTOS
              </div>
              <div className="space-y-3">
                {[
                  { label: d1Name, pos: d1FinalPos, stats: d1Stats },
                  { label: d2Name, pos: d2FinalPos, stats: d2Stats },
                ].map(({ label, pos, stats }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="font-display font-black text-4xl w-16 shrink-0" style={{ color: pos <= 3 ? 'var(--gold)' : '#ffffff' }}>
                      P{pos}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white truncate">{label}</div>
                      <div className="text-[10px] text-white/60">
                        {stats?.points} pts · {stats?.wins}V · {stats?.podiums} podios
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Constructors' championship */}
            <div className="bg-ink text-white p-5">
              <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-2">
                CAMPEONATO DE CONSTRUCTORES
              </div>
              <div className="flex items-center gap-3">
                <div className="font-display font-black leading-none" style={{ fontSize: 64, color: constructorPos <= 3 ? 'var(--gold)' : '#ffffff' }}>
                  P{constructorPos}
                </div>
                <div className="border-l border-white/20 pl-4 space-y-1">
                  <div className="font-display font-black text-xl uppercase text-white">TU EQUIPO</div>
                  <div className="text-[10px] text-white/60">
                    {(d1Stats?.points ?? 0) + (d2Stats?.points ?? 0)} pts totales
                  </div>
                  <div className="text-[10px] text-white/60">
                    {(d1Stats?.wins ?? 0) + (d2Stats?.wins ?? 0)} victorias · {(d1Stats?.poles ?? 0) + (d2Stats?.poles ?? 0)} poles
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Championship card + standings */}
        {tickerDone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ChampionshipCard results={simulationResults} />
          </motion.div>
        )}
      </div>

      <footer className="mt-auto border-t border-borderc px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-md text-center">
        F1 LEGENDS · PIT LANE DRAFT · <button onClick={resetGame} className="hover:underline">VOLVER AL INICIO</button>
      </footer>
    </div>
  )
}
