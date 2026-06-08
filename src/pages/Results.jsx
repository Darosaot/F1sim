import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'
import RaceTicker from '../components/simulation/RaceTicker'
import SeasonChart from '../components/simulation/SeasonChart'
import ChampionshipCard from '../components/results/ChampionshipCard'
import { getVerdict } from '../utils/simulator'

export default function Results() {
  const simulationResults = useGameStore(s => s.simulationResults)
  const [tickerDone, setTickerDone] = useState(false)

  if (!simulationResults) return null

  const { races, finalPosition, playerStats } = simulationResults
  const verdict = getVerdict(finalPosition, playerStats)

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-[#1a1a2a] bg-[#0a0a0f]">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <span className="text-sm font-black text-white uppercase tracking-wider">Resultados</span>
          <span className="text-xs text-[#e10600] font-bold">
            P{finalPosition} · {playerStats.points}pts
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Verdict */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a28] border border-[#2a2a3a] rounded-xl px-4 py-3 text-center"
        >
          <p className="text-sm font-semibold text-white">{verdict}</p>
        </motion.div>

        {/* Race ticker */}
        <div className="space-y-2">
          <div className="text-xs text-[#8888aa] uppercase tracking-wider">Resultados de Carrera</div>
          <RaceTicker races={races} onComplete={() => setTickerDone(true)} />
        </div>

        {/* Season chart */}
        {tickerDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="text-xs text-[#8888aa] uppercase tracking-wider">Evolución de Puntos</div>
            <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4">
              <SeasonChart races={races} />
            </div>
          </motion.div>
        )}

        {/* Championship card */}
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
    </div>
  )
}
