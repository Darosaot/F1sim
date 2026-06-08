import { useGameStore } from '../../stores/gameStore'

export default function ModeToggle() {
  const mode = useGameStore(s => s.mode)
  const setMode = useGameStore(s => s.setMode)

  return (
    <div className="space-y-2">
      <div className="text-xs text-[#8888aa] uppercase tracking-wider">Dificultad</div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setMode('vip')}
          className={`
            px-3 py-3 rounded-lg border transition-all text-left
            ${mode === 'vip'
              ? 'border-[#e10600] bg-[#1a0a0a]'
              : 'border-[#2a2a3a] bg-[#12121a] hover:border-[#444466]'
            }
          `}
        >
          <div className="text-xs font-bold text-white">🏁 Paddock VIP</div>
          <div className="text-[10px] text-[#555577] mt-0.5">Stats visibles</div>
        </button>
        <button
          onClick={() => setMode('parce_ferme')}
          className={`
            px-3 py-3 rounded-lg border transition-all text-left
            ${mode === 'parce_ferme'
              ? 'border-[#e10600] bg-[#1a0a0a]'
              : 'border-[#2a2a3a] bg-[#12121a] hover:border-[#444466]'
            }
          `}
        >
          <div className="text-xs font-bold text-white">🔒 Parc Fermé</div>
          <div className="text-[10px] text-[#555577] mt-0.5">Stats ocultos</div>
        </button>
      </div>
    </div>
  )
}
