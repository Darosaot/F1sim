import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TYPE_ES = {
  street:         'Urbano',
  power:          'Potencia',
  balanced:       'Equilibrado',
  high_speed:     'Alta velocidad',
  high_downforce: 'Alta carga',
}

function DriverResult({ qualyPos, racePos, points, dnf, name }) {
  const posColor = racePos === 1 ? 'text-[#c9a030]' : racePos <= 3 ? 'text-ink' : 'text-ink-md'
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-ink-lt w-20 truncate shrink-0">{name}</span>
      <span className="text-[9px] text-ink-lt">C{qualyPos}</span>
      <span className="text-ink-lt text-[9px]">→</span>
      {dnf ? (
        <span className="font-bold text-rust text-[10px]">ABANDONO</span>
      ) : (
        <>
          <span className={`font-display font-black text-sm ${posColor}`}>P{racePos}</span>
          <span className="text-rust font-bold text-[10px] w-8 text-right">
            {points > 0 ? `+${points}` : '—'}
          </span>
        </>
      )}
    </div>
  )
}

export default function RaceTicker({ races, d1Name, d2Name }) {
  const [visible, setVisible] = useState([])

  useEffect(() => {
    setVisible([])
    if (!races?.length) return
    let i = 0
    const iv = setInterval(() => {
      if (i >= races.length) { clearInterval(iv); return }
      setVisible(prev => [...prev, races[i]])
      i++
    }, 200)
    return () => clearInterval(iv)
  }, [races])

  const isRunning = visible.length < (races?.length ?? 0)

  return (
    <div className="space-y-px">
      <AnimatePresence initial={false}>
        {visible.filter(Boolean).map((race, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-white border border-borderc px-4 py-3"
          >
            {/* Circuit header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">{race.emoji}</span>
                <span className="text-sm font-bold text-ink">{race.circuit}</span>
                {race.isWet && <span className="text-xs">🌧</span>}
                {race.safetyCar && <span className="text-[9px] text-ink-md">SC</span>}
              </div>
              <span className="text-[9px] text-ink-lt uppercase tracking-wide">
                {TYPE_ES[race.type] || race.type}
              </span>
            </div>

            {/* Driver results */}
            <div className="space-y-1 border-t border-borderc pt-2">
              <DriverResult
                qualyPos={race.d1QualyPos}
                racePos={race.d1RacePos}
                points={race.d1Points}
                dnf={race.d1Dnf}
                name={d1Name ?? 'Piloto 1'}
              />
              <DriverResult
                qualyPos={race.d2QualyPos}
                racePos={race.d2RacePos}
                points={race.d2Points}
                dnf={race.d2Dnf}
                name={d2Name ?? 'Piloto 2'}
              />
            </div>

            {/* Race total */}
            <div className="flex justify-end mt-1 pt-1 border-t border-borderc">
              <span className="text-[10px] text-ink-md">
                Equipo: <span className="font-bold text-ink">{race.racePoints} pts</span>
                <span className="ml-2 text-ink-lt">({race.playerPoints} total)</span>
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {isRunning && (
        <div className="text-center py-3 text-xs text-ink-md font-bold uppercase tracking-widest animate-pulse">
          Simulando temporada...
        </div>
      )}
    </div>
  )
}
