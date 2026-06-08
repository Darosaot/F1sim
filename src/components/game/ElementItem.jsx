import { motion } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'
import { SLOT_LABELS, getElementValue } from '../../utils/ratingEngine'

const ATTR_COLORS = {
  'pace':             '#e10600',
  'racecraft':        '#ff8000',
  'consistency':      '#00a3e0',
  'qualifying':       '#27f4d2',
  'wet_performance':  '#3671c6',
  'power':            '#e10600',
  'downforce':        '#ff8000',
  'reliability':      '#27f4d2',
  'race_management':  '#e10600',
  'design_genius':    '#e10600',
  'team_management':  '#00a3e0',
  'peak_grip':        '#e10600',
}

export default function ElementItem({ slotKey, element, showStats }) {
  const pickElement = useGameStore(s => s.pickElement)
  const team = useGameStore(s => s.team)
  const alreadyFilled = team[slotKey] !== null && team[slotKey] !== undefined

  const slotInfo = SLOT_LABELS[slotKey]
  const avgRating = getElementValue(element, slotKey)

  const isNumeric = typeof element === 'number'
  const displayName = isNumeric
    ? `${slotInfo.label}: ${element}/100`
    : element?.name || '—'

  const subLabel = isNumeric
    ? null
    : element?.year
      ? `${element.year}${element.team ? ' · ' + element.team : ''}`
      : element?.teams?.[0] || null

  const attrs = !isNumeric ? element?.attributes : null
  const topAttrs = attrs
    ? Object.entries(attrs)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
    : []

  return (
    <motion.button
      whileHover={{ scale: alreadyFilled ? 1 : 1.02, x: alreadyFilled ? 0 : 2 }}
      whileTap={{ scale: alreadyFilled ? 1 : 0.98 }}
      disabled={alreadyFilled}
      onClick={() => !alreadyFilled && pickElement(slotKey, element)}
      className={`
        w-full text-left rounded-lg border px-3 py-2.5 transition-all duration-150
        ${alreadyFilled
          ? 'border-[#1a1a2a] bg-[#0e0e14] opacity-40 cursor-not-allowed'
          : 'border-[#2a2a3a] bg-[#1a1a26] hover:border-[#e10600] hover:bg-[#1e1e30] cursor-pointer'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm shrink-0">{slotInfo.emoji}</span>
            <span className="text-[10px] text-[#8888aa] uppercase tracking-wider">{slotInfo.label}</span>
          </div>
          <div className="text-sm font-semibold text-[#f0f0f0] truncate">{displayName}</div>
          {subLabel && (
            <div className="text-[10px] text-[#555577] mt-0.5">{subLabel}</div>
          )}
          {showStats && topAttrs.length > 0 && (
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {topAttrs.map(([key, val]) => (
                <div key={key} className="flex items-center gap-1">
                  <span className="text-[9px] text-[#555577] capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <div className="w-12 h-1 bg-[#1a1a2a] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${val}%`,
                        backgroundColor: ATTR_COLORS[key] || '#8888aa',
                      }}
                    />
                  </div>
                  <span
                    className="text-[9px] font-bold"
                    style={{ color: ATTR_COLORS[key] || '#8888aa' }}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
          )}
          {element?.bio && (
            <div className="text-[10px] text-[#444466] mt-1 italic line-clamp-1">{element.bio}</div>
          )}
        </div>
        {showStats && (
          <div className="shrink-0 text-right">
            <div className="text-xl font-black text-[#e10600]">{avgRating}</div>
            <div className="text-[9px] text-[#555577]">rating</div>
          </div>
        )}
        {!showStats && !alreadyFilled && (
          <div className="text-[#e10600] text-sm">+</div>
        )}
        {alreadyFilled && (
          <div className="text-[10px] text-[#555577]">✓</div>
        )}
      </div>
    </motion.button>
  )
}
