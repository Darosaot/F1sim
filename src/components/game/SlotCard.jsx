import { motion } from 'framer-motion'
import { SLOT_LABELS, getElementValue } from '../../utils/ratingEngine'

export default function SlotCard({ slotKey, element, isActive }) {
  const slotInfo = SLOT_LABELS[slotKey]
  const isEmpty = !element

  return (
    <motion.div
      layout
      className={`
        relative rounded-lg border px-3 py-2 transition-all duration-200
        ${isEmpty
          ? `border-[#2a2a3a] bg-[#0e0e16] slot-empty-pulse ${isActive ? 'border-red-600 shadow-[0_0_10px_rgba(225,6,0,0.4)]' : ''}`
          : 'border-[#3a3a5a] bg-[#1a1a28]'
        }
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-base shrink-0">{slotInfo.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] text-[#8888aa] uppercase tracking-wider truncate">
            {slotInfo.label}
          </div>
          {isEmpty ? (
            <div className="text-xs text-[#444466] italic">Vacío</div>
          ) : (
            <div className="text-xs font-semibold text-[#f0f0f0] truncate">
              {element?.name || (typeof element === 'number' ? `${element}/100` : '—')}
            </div>
          )}
        </div>
        {!isEmpty && (
          <div className="text-xs font-bold text-[#e10600] shrink-0">
            {typeof element === 'number'
              ? element
              : getElementValue(element, slotKey)}
          </div>
        )}
      </div>
      {!isEmpty && element?.year && (
        <div className="text-[9px] text-[#555577] mt-0.5 ml-7">{element.year}</div>
      )}
    </motion.div>
  )
}
