import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const POS_COLORS = {
  1: 'text-yellow-400',
  2: 'text-gray-300',
  3: 'text-amber-600',
}

const CIRCUIT_TYPE_EMOJI = {
  street: '🏙️',
  power: '⚡',
  balanced: '🏁',
  high_speed: '💨',
  high_downforce: '🔄',
}

export default function RaceTicker({ races, onComplete }) {
  const [visibleRaces, setVisibleRaces] = useState([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i >= races.length) {
        clearInterval(interval)
        setDone(true)
        setTimeout(onComplete, 800)
        return
      }
      setVisibleRaces(prev => [...prev, races[i]])
      i++
    }, 180)
    return () => clearInterval(interval)
  }, [races, onComplete])

  return (
    <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
      <AnimatePresence initial={false}>
        {visibleRaces.map((race, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className={`
              flex items-center justify-between px-3 py-2 rounded-lg
              ${race.dnf
                ? 'bg-[#1a0a0a] border border-red-900'
                : race.playerPos === 1
                  ? 'bg-[#1a1400] border border-yellow-900'
                  : 'bg-[#0e0e16] border border-[#1a1a2a]'
              }
            `}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs">{race.emoji}</span>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{race.circuit}</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-[#555577]">
                    {CIRCUIT_TYPE_EMOJI[race.type]} {race.type}
                  </span>
                  {race.isWet && <span className="text-[9px] text-blue-400">🌧️ lluvia</span>}
                  {race.safetyCar && <span className="text-[9px] text-yellow-500">🚗 SC</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {race.dnf ? (
                <span className="text-xs font-bold text-red-500">DNF</span>
              ) : (
                <>
                  <span className={`text-sm font-black ${POS_COLORS[race.playerPos] || 'text-[#f0f0f0]'}`}>
                    P{race.playerPos}
                  </span>
                  <span className="text-xs font-bold text-[#e10600] w-8 text-right">
                    {race.racePoints > 0 ? `+${race.racePoints}` : '—'}
                  </span>
                  <span className="text-xs text-[#555577] w-10 text-right">
                    {race.playerPoints}pts
                  </span>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {!done && (
        <div className="text-center py-2 text-[#555577] text-xs animate-pulse">
          Simulando temporada...
        </div>
      )}
    </div>
  )
}
