import { useGameStore } from '../../stores/gameStore'
import { SLOT_LABELS, calculateTeamRating, getElementValue } from '../../utils/ratingEngine'

const SLOT_KEYS = Object.keys(SLOT_LABELS)

// Driver vs Car split for attack/defense equivalent
const DRIVER_KEYS  = ['driver1', 'driver2']
const CAR_KEYS     = ['chassis', 'engine', 'aero', 'tires', 'reliability']
const MGMT_KEYS    = ['team_principal', 'technical_director', 'budget']

function avg(team, keys) {
  const vals = keys.map(k => {
    const el = team[k]
    if (!el) return null
    return getElementValue(el, k)
  }).filter(v => v !== null)
  if (!vals.length) return null
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

export default function TeamBuilder() {
  const team        = useGameStore(s => s.team)
  const filledCount = useGameStore(s => s.getFilledCount())
  const rating      = calculateTeamRating(team)

  const driverAvg = avg(team, DRIVER_KEYS)
  const carAvg    = avg(team, CAR_KEYS)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-ink-md">
          PLANTILLA · {filledCount}/10
        </span>
        {filledCount === 11 && (
          <span className="font-display font-black text-3xl text-ink">{rating.toFixed(0)}</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-borderc mb-3">
        <div
          className="h-full bg-ink transition-all duration-500"
          style={{ width: `${(filledCount / 10) * 100}%` }}
        />
      </div>

      {/* Attack / Defense labels */}
      {(driverAvg || carAvg) && (
        <div className="flex gap-4 mb-3 text-xs font-bold uppercase tracking-wide">
          {driverAvg && (
            <div className="flex items-baseline gap-1">
              <span className="text-rust">{driverAvg}</span>
              <span className="text-ink-md">Pilotos</span>
            </div>
          )}
          {carAvg && (
            <div className="flex items-baseline gap-1">
              <span className="text-ink font-black">{carAvg}</span>
              <span className="text-ink-md">Coche</span>
            </div>
          )}
        </div>
      )}

      <hr className="divider mb-3" />

      {/* Slot rows */}
      <div className="flex-1 overflow-y-auto space-y-0 divide-y divide-borderc">
        {SLOT_KEYS.map(key => {
          const el      = team[key]
          const isEmpty = el === null || el === undefined
          const slotInfo = SLOT_LABELS[key]
          const rating   = isEmpty ? null : getElementValue(el, key)
          const name     = isEmpty
            ? null
            : typeof el === 'number'
              ? `${el}/100`
              : el?.name

          return (
            <div key={key} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold text-ink-lt w-10 uppercase shrink-0">
                  {key === 'driver1'            ? 'DRV 1'
                   : key === 'driver2'          ? 'DRV 2'
                   : key === 'team_principal'   ? 'TP'
                   : key === 'technical_director' ? 'TD'
                   : key === 'chassis'          ? 'CAR'
                   : key === 'engine'           ? 'ENG'
                   : key === 'tires'            ? 'TYRES'
                   : key === 'aero'             ? 'AERO'
                   : key === 'budget'           ? 'BDGT'
                   : 'REL'}
                </span>
                <span className={`text-xs truncate ${isEmpty ? 'text-ink-lt' : 'text-ink font-semibold'}`}>
                  {isEmpty ? '—' : name}
                </span>
              </div>
              {!isEmpty && (
                <span className="text-xs font-black text-rust shrink-0 ml-2">{rating}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
