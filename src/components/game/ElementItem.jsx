import { motion } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'
import { SLOT_LABELS, getElementValue } from '../../utils/ratingEngine'

const SLOT_SHORT = {
  driver1:            'DRV 1',
  driver2:            'DRV 2',
  team_principal:     'TP',
  technical_director: 'TD',
  chassis:            'CAR',
  engine:             'ENG',
  strategist:         'STRAT',
  tires:              'TYRES',
  aero:               'AERO',
  budget:             'BDGT',
  reliability:        'REL',
}

function getTopAttrs(element, slotKey) {
  if (!element || typeof element === 'number') return []
  const attrs = element.attributes
  if (!attrs) return []
  return Object.entries(attrs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
}

export default function ElementItem({ slotKey, element, showStats }) {
  const pickElement   = useGameStore(s => s.pickElement)
  const team          = useGameStore(s => s.team)
  const alreadyFilled = team[slotKey] !== null && team[slotKey] !== undefined

  const rating      = getElementValue(element, slotKey)
  const isNumeric   = typeof element === 'number'
  const displayName = isNumeric
    ? `${element}/100`
    : element?.name || '—'
  const subLabel    = isNumeric
    ? null
    : element?.year
      ? `${element.year}${element.team ? '  ·  ' + element.team : ''}`
      : element?.teams?.[0] || null

  const topAttrs = showStats ? getTopAttrs(element, slotKey) : []

  return (
    <motion.button
      whileHover={{ backgroundColor: alreadyFilled ? undefined : '#faf7f2' }}
      disabled={alreadyFilled}
      onClick={() => !alreadyFilled && pickElement(slotKey, element)}
      className={`
        w-full text-left px-4 py-3
        transition-colors duration-100
        ${alreadyFilled ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Slot tag */}
          <span className="text-[9px] font-bold uppercase tracking-wider text-ink-md w-10 shrink-0 pt-0.5">
            {SLOT_SHORT[slotKey]}
          </span>

          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-ink truncate">{displayName}</div>
            {subLabel && (
              <div className="text-[10px] text-ink-md mt-0.5">{subLabel}</div>
            )}
            {element?.bio && !isNumeric && (
              <div className="text-[10px] text-ink-lt mt-0.5 italic line-clamp-1">{element.bio}</div>
            )}

            {/* Attribute bars */}
            {topAttrs.length > 0 && (
              <div className="flex flex-col gap-1 mt-2">
                {topAttrs.map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-[9px] text-ink-lt uppercase tracking-wide w-20 shrink-0 truncate">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <div className="flex-1 h-1 bg-borderc rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rust rounded-full"
                        style={{ width: `${val}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-ink-md w-5 text-right shrink-0">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showStats && !isNumeric && (
            <span className="font-display font-black text-xl text-rust">{rating}</span>
          )}
          {alreadyFilled ? (
            <span className="text-[10px] text-ink-lt font-bold">✓</span>
          ) : (
            <span className="text-ink-lt">›</span>
          )}
        </div>
      </div>
    </motion.button>
  )
}
