import { useGameStore } from '../../stores/gameStore'
import { SLOT_LABELS, getElementValue } from '../../utils/ratingEngine'
import { getTeamColors } from '../../utils/teamColors'

const LAYOUT = [
  ['driver1', 'driver2'],
  ['team_principal', 'technical_director'],
  ['chassis', 'engine'],
  ['tires', 'aero'],
  ['budget', 'reliability'],
]

const SHORT = {
  driver1:            'P1',
  driver2:            'P2',
  team_principal:     'TP',
  technical_director: 'TD',
  chassis:            'CAR',
  engine:             'ENG',
  tires:              'TYRES',
  aero:               'AERO',
  budget:             'BDGT',
  reliability:        'REL',
}

function SlotCircle({ slotKey, element }) {
  const isEmpty = element === null || element === undefined
  const rating  = isEmpty ? null : getElementValue(element, slotKey)

  // Get team color for filled slot ring
  const teamName = element?.team || ''
  const colors   = getTeamColors(teamName)
  const ringColor = isEmpty ? '#3a3a3a' : colors.primary

  const shortName = isEmpty
    ? SHORT[slotKey]
    : typeof element === 'number'
      ? `${element}`
      : (element?.name?.split(' ').slice(-1)[0] || SHORT[slotKey]).substring(0, 7)

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all duration-300 ${
          isEmpty ? 'border-2 border-dashed' : 'border-2 border-solid'
        }`}
        style={{
          borderColor: ringColor,
          backgroundColor: isEmpty ? 'transparent' : '#ffffff',
        }}
      >
        {isEmpty ? (
          <span className="font-display font-bold text-[10px] text-[#555] tracking-tight">
            {SHORT[slotKey]}
          </span>
        ) : (
          <span className="font-display font-black text-base text-ink leading-none">
            {rating}
          </span>
        )}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wide text-center leading-tight"
        style={{ color: isEmpty ? '#555' : '#ccc', maxWidth: 64 }}>
        {shortName}
      </span>
    </div>
  )
}

export default function TeamVisualization() {
  const team = useGameStore(s => s.team)

  return (
    <div className="h-full bg-garage flex flex-col items-center justify-center py-8 px-4 gap-0 select-none">
      {/* Track line decoration */}
      <div className="w-20 h-0.5 bg-[#3a3a3a] rounded-full mb-6" />

      {LAYOUT.map((row, ri) => (
        <div key={ri} className="flex items-center justify-center gap-6 mb-5 last:mb-0">
          {row.map(key => (
            <SlotCircle key={key} slotKey={key} element={team[key]} />
          ))}
        </div>
      ))}

      <div className="w-20 h-0.5 bg-[#3a3a3a] rounded-full mt-6" />

      {/* Bottom label */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#444] mt-4">
        TEAM GARAGE
      </p>
    </div>
  )
}
