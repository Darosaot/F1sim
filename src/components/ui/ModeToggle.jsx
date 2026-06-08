import { useGameStore } from '../../stores/gameStore'

const MODES = [
  { id: 'vip',         label: 'Clásico' },
  { id: 'parce_ferme', label: 'De memoria' },
]

export default function ModeToggle({ locked }) {
  const mode    = useGameStore(s => s.mode)
  const setMode = useGameStore(s => s.setMode)
  const active  = MODES.find(m => m.id === mode)

  if (locked) {
    return (
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-lt mb-2">
          MODO · DIFICULTAD
        </p>
        <div className="flex items-center gap-2">
          <span className="px-3 py-2 bg-ink text-white border border-ink text-xs font-bold uppercase tracking-wide">
            {active?.label}
          </span>
          <span className="text-[9px] text-ink-lt uppercase tracking-wide">bloqueado</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-md mb-2">
        MODO · DIFICULTAD
      </p>
      <div className="flex gap-1.5">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-3 py-2 border text-xs font-bold uppercase tracking-wide transition-colors ${
              mode === m.id
                ? 'bg-ink text-white border-ink'
                : 'bg-white text-ink border-borderc hover:border-ink'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}
