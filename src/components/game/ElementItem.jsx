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

  return (
    <motion.button
      whileHover={{ backgroundColor: alreadyFilled ? undefined : '#faf7f2' }}
      disabled={alreadyFilled}
      onClick={() => !alreadyFilled && pickElement(slotKey, element)}
      className={`
        w-full text-left flex items-center justify-between px-4 py-3
        transition-colors duration-100
        ${alreadyFilled ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Slot tag */}
        <span className="text-[9px] font-bold uppercase tracking-wider text-ink-md w-10 shrink-0">
          {SLOT_SHORT[slotKey]}
        </span>

        <div className="min-w-0">
          <div className="text-sm font-bold text-ink truncate">{displayName}</div>
          {subLabel && (
            <div className="text-[10px] text-ink-md mt-0.5">{subLabel}</div>
          )}
          {element?.bio && !isNumeric && (
            <div className="text-[10px] text-ink-lt mt-0.5 italic line-clamp-1">{element.bio}</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        {showStats && !isNumeric && (
          <span className="font-display font-black text-xl text-rust">{rating}</span>
        )}
        {alreadyFilled ? (
          <span className="text-[10px] text-ink-lt font-bold">✓</span>
        ) : (
          <span className="text-ink-lt">›</span>
        )}
      </div>
    </motion.button>
  )
}
