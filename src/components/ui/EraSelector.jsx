import { useGameStore } from '../../stores/gameStore'

const ERAS = [
  { id: 'all',       label: 'Toda la Historia', years: '1950–2025' },
  { id: 'early',     label: 'Era Clásica',       years: '1950–65' },
  { id: 'pre_turbo', label: 'Pre-Turbo',          years: '1966–82' },
  { id: 'turbo',     label: 'Era Turbo',          years: '1983–88' },
  { id: 'v10',       label: 'Era V10',            years: '1989–05' },
  { id: 'v8',        label: 'Era V8',             years: '2006–13' },
  { id: 'hybrid',    label: 'Era Híbrida',        years: '2014–21' },
  { id: 'current',   label: 'Era Actual',         years: '2022+' },
]

export default function EraSelector() {
  const era = useGameStore(s => s.era)
  const setEra = useGameStore(s => s.setEra)

  return (
    <div className="space-y-2">
      <div className="text-xs text-[#8888aa] uppercase tracking-wider">Era</div>
      <div className="grid grid-cols-2 gap-2">
        {ERAS.map(e => (
          <button
            key={e.id}
            onClick={() => setEra(e.id)}
            className={`
              text-left px-3 py-2 rounded-lg border transition-all duration-150
              ${era === e.id
                ? 'border-[#e10600] bg-[#1a0a0a] text-white'
                : 'border-[#2a2a3a] bg-[#12121a] text-[#8888aa] hover:border-[#444466]'
              }
            `}
          >
            <div className="text-xs font-bold">{e.label}</div>
            <div className="text-[10px] text-[#555577]">{e.years}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
