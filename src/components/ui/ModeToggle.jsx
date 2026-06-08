import { useGameStore } from '../../stores/gameStore'

export default function ModeToggle() {
  const mode    = useGameStore(s => s.mode)
  const setMode = useGameStore(s => s.setMode)

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-md mb-2">
        MODO · DIFICULTAD
      </p>
      <div className="flex gap-1.5">
        {[
          { id: 'vip',         label: 'Clásico' },
          { id: 'parce_ferme', label: 'De memoria' },
        ].map(m => (
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
