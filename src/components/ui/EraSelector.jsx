import { useGameStore } from '../../stores/gameStore'

const ERAS = [
  { id: 'all',       label: 'Todo',    years: '1950–2025' },
  { id: 'early',     label: 'Clásica', years: '1950–65' },
  { id: 'pre_turbo', label: 'Pre-T.',  years: '1966–82' },
  { id: 'turbo',     label: 'Turbo',   years: '1983–88' },
  { id: 'v10',       label: 'V10',     years: '1989–05' },
  { id: 'v8',        label: 'V8',      years: '2006–13' },
  { id: 'hybrid',    label: 'Híbrida', years: '2014–21' },
  { id: 'current',   label: 'Actual',  years: '2022+' },
]

export default function EraSelector({ locked }) {
  const era    = useGameStore(s => s.era)
  const setEra = useGameStore(s => s.setEra)
  const active = ERAS.find(e => e.id === era)

  if (locked) {
    return (
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-lt mb-2">ERA</p>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1.5 bg-ink text-white border border-ink text-[10px] font-bold uppercase tracking-wide">
            {active?.label}
          </span>
          <span className="text-[9px] text-ink-lt uppercase tracking-wide">bloqueada</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-md mb-2">ERA</p>
      <div className="flex flex-wrap gap-1">
        {ERAS.map(e => (
          <button
            key={e.id}
            onClick={() => setEra(e.id)}
            className={`px-2.5 py-1.5 border text-[10px] font-bold uppercase tracking-wide transition-colors ${
              era === e.id
                ? 'bg-ink text-white border-ink'
                : 'bg-white text-ink border-borderc hover:border-ink'
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>
    </div>
  )
}
