import { useGameStore } from '../../stores/gameStore'

export default function WildcardBar() {
  const wildcards   = useGameStore(s => s.wildcards)
  const useWildcard = useGameStore(s => s.useWildcard)
  const currentCard = useGameStore(s => s.currentCard)

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="font-bold uppercase tracking-widest text-ink-md">Comodines</span>
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full border transition-all ${
              i < wildcards
                ? 'bg-ink border-ink'
                : 'bg-transparent border-borderc'
            }`}
          />
        ))}
      </div>
      {wildcards > 0 && currentCard && (
        <button
          onClick={useWildcard}
          className="text-rust font-bold hover:underline ml-1"
        >
          Descartar
        </button>
      )}
    </div>
  )
}
