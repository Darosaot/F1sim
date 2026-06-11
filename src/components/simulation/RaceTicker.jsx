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
  const isPole = qualyPos === 1
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-ink w-24 shrink-0 truncate font-medium">{name}</span>
      <span className={`text-[8px] font-bold shrink-0 ${isPole ? 'text-[#c9a030]' : 'text-ink-lt'}`}>
        {isPole ? 'POLE' : `C${qualyPos}`}
      </span>
      <span className="text-ink-lt text-[8px]">→</span>
      {dnf ? (
        <span className="font-bold text-rust text-[9px]">DNF</span>
      ) : (
        <>
          <span className={`font-display font-black text-sm ${posColor}`}>P{racePos}</span>
          <span className="text-rust font-bold text-[9px] w-7 text-right shrink-0">
            {points > 0 ? `+${points}` : '—'}
          </span>
        </>
      )}
    </div>
  )
}

export default function RaceTicker({ races, d1Name, d2Name }) {
  const [visible, setVisible] = useState([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    setVisible([])
    setDone(false)
    if (!races?.length) { setDone(true); return }
    let i = 0
    let cancelled = false
    const iv = setInterval(() => {
      if (cancelled) { clearInterval(iv); return }
      if (i >= races.length) { clearInterval(iv); setDone(true); return }
      const race = races[i]
      if (!race?.circuit) { i++; return }
      setVisible(prev => [...prev, { ...race, raceNumber: i + 1 }])
      i++
    }, 400)
    return () => { cancelled = true; clearInterval(iv) }
  }, [races])

  const isRunning = !done

  return (
    <div className="space-y-px">
      <AnimatePresence initial={false}>
        {visible.filter(Boolean).map((race, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-white border border-borderc px-3 py-2"
          >
            {/* Circuit header */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold text-ink-lt w-8 shrink-0">
                  R{race.raceNumber}/{races?.length ?? 22}
                </span>
                <span className="text-xs">{race.emoji}</span>
                <span className="text-xs font-bold text-ink">{race.circuit}</span>
                {race.isWet && <span className="text-[10px]">🌧</span>}
                {race.safetyCar && <span className="text-[8px] text-ink-md font-bold">SC</span>}
              </div>
              <span className="text-[8px] text-ink-lt uppercase tracking-wide">
                {TYPE_ES[race.type] || race.type}
              </span>
            </div>

            {/* Driver results */}
            <div className="space-y-0.5">
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
              <span className="text-[9px] text-ink-md">
                <span className="font-bold text-ink">{race.racePoints} pts</span>
                <span className="ml-1.5 text-ink-lt">({race.playerPoints} total)</span>
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
