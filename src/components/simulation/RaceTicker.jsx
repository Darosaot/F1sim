import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STAGE_LABELS = {
  1: 'GRUPOS', 2: 'GRUPOS', 3: 'GRUPOS', 4: 'GRUPOS',
  5: 'GRUPOS', 6: 'GRUPOS', 7: 'GRUPOS', 8: 'GRUPOS',
  9: 'RONDA 16', 10: 'RONDA 16', 11: 'CUARTOS', 12: 'CUARTOS',
  13: 'SEMIS', 14: 'SEMIS', 15: 'FINAL', 16: 'EXTRA',
}

export default function RaceTicker({ races, onComplete }) {
  const [visible, setVisible] = useState([])
  const [done,    setDone]    = useState(false)

  useEffect(() => {
    let i = 0
    const iv = setInterval(() => {
      if (i >= races.length) {
        clearInterval(iv)
        setDone(true)
        setTimeout(onComplete, 600)
        return
      }
      setVisible(prev => [...prev, races[i]])
      i++
    }, 160)
    return () => clearInterval(iv)
  }, [races, onComplete])

  return (
    <div className="space-y-px">
      <AnimatePresence initial={false}>
        {visible.map((race, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-between bg-white border border-borderc px-4 py-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink-md w-14 shrink-0">
                {race.isWet ? '🌧️ ' : ''}CARRERA
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{race.emoji}</span>
                  <span className="text-sm font-bold text-ink truncate">{race.circuit}</span>
                </div>
                <div className="text-[10px] text-ink-md">
                  {race.safetyCar ? '🚗 Safety Car · ' : ''}
                  {race.isWet ? 'Lluvia' : race.type}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {race.dnf ? (
                <span className="font-display font-black text-lg text-rust">DNF</span>
              ) : (
                <>
                  <span className={`font-display font-black text-xl ${
                    race.playerPos === 1 ? 'text-[#c9a030]' :
                    race.playerPos <= 3  ? 'text-ink' : 'text-ink-md'
                  }`}>
                    P{race.playerPos}
                  </span>
                  <span className="font-bold text-sm text-rust w-10 text-right">
                    {race.racePoints > 0 ? `+${race.racePoints}` : '—'}
                  </span>
                  <span className="text-xs text-ink-md w-14 text-right">
                    {race.playerPoints} pts
                  </span>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {!done && (
        <div className="text-center py-3 text-xs text-ink-md font-bold uppercase tracking-widest animate-pulse">
          Simulando temporada...
        </div>
      )}
    </div>
  )
}
