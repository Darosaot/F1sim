import { useGameStore } from '../../stores/gameStore'

export default function WildcardBar() {
  const wildcards = useGameStore(s => s.wildcards)
  const useWildcard = useGameStore(s => s.useWildcard)
  const currentCard = useGameStore(s => s.currentCard)

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#8888aa] uppercase tracking-wider">Comodines</span>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
              i < wildcards
                ? 'bg-[#e10600] border-[#e10600]'
                : 'bg-transparent border-[#2a2a3a]'
            }`}
          />
        ))}
      </div>
      {wildcards > 0 && currentCard && (
        <button
          onClick={useWildcard}
          className="ml-1 text-xs text-[#e10600] hover:text-red-400 underline transition-colors"
        >
          Descartar
        </button>
      )}
    </div>
  )
}
