import { useGameStore } from '../../stores/gameStore'
import { SLOT_LABELS, calculateTeamRating, getBenchmark } from '../../utils/ratingEngine'
import SlotCard from './SlotCard'

const SLOT_KEYS = Object.keys(SLOT_LABELS)

export default function TeamBuilder({ activeSlot }) {
  const team = useGameStore(s => s.team)
  const filledCount = useGameStore(s => s.getFilledCount())
  const rating = calculateTeamRating(team)
  const benchmark = getBenchmark(rating)

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#8888aa]">
          Tu Equipo
        </h2>
        <span className="text-xs text-[#555577]">{filledCount}/11</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#1a1a2a] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#e10600] rounded-full transition-all duration-500"
          style={{ width: `${(filledCount / 11) * 100}%` }}
        />
      </div>

      {/* Slots */}
      <div className="grid grid-cols-1 gap-1.5">
        {SLOT_KEYS.map(key => (
          <SlotCard
            key={key}
            slotKey={key}
            element={team[key]}
            isActive={activeSlot === key}
          />
        ))}
      </div>

      {/* Rating */}
      {filledCount > 0 && (
        <div className="mt-1 rounded-lg bg-[#1a1a28] border border-[#2a2a3a] p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#8888aa] uppercase tracking-wider">Rating</span>
            <span className="text-xl font-black text-[#e10600]">{rating.toFixed(1)}</span>
          </div>
          <div className="text-[10px] text-[#555577] truncate">
            ≈ {benchmark.name}
          </div>
        </div>
      )}
    </div>
  )
}
