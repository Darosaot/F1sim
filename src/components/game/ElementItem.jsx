import { motion } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'
import { SLOT_LABELS, getElementValue } from '../../utils/ratingEngine'

const ATTR_ES = {
  pace:                'Ritmo',
  racecraft:           'Carrera',
  consistency:         'Const.',
  wet_performance:     'Lluvia',
  qualifying:          'Clasif.',
  experience:          'Experi.',
  tire_management:     'Neumát.',
  downforce:           'Carga',
  mechanical_grip:     'Grip',
  drag_efficiency:     'Drag',
  reliability:         'Fiab.',
  weight_distribution: 'Peso',
  power:               'Potencia',
  driveability:        'Control',
  fuel_efficiency:     'Comb.',
  deployment_mode:     'Desp.',
  team_management:     'Gestión',
  driver_management:   'Pilotos',
  political_skill:     'Política',
  budget_generation:   'Presup.',
  crisis_management:   'Crisis',
  design_genius:       'Diseño',
  innovation:          'Innova.',
  development_speed:   'Desa.',
  detail_obsession:    'Detalle',
  aerodynamic_vision:  'Aero.',
  race_management:     'Táctica',
  pit_timing:          'Parada',
  undercut_instinct:   'Undercut',
  safety_car_read:     'SC',
  pressure_decisions:  'Presión',
  peak_grip:           'Grip',
  durability:          'Durab.',
  thermal_window:      'Térm.',
  compound_versatility:'Versát.',
}

const SLOT_SHORT = {
  driver1:            'DRV 1',
  driver2:            'DRV 2',
  team_principal:     'TP',
  technical_director: 'TD',
  chassis:            'CAR',
  engine:             'ENG',
  tires:              'TYRES',
  aero:               'AERO',
  budget:             'BDGT',
  reliability:        'REL',
}

function getTopAttrs(element, slotKey) {
  if (!element || typeof element === 'number') return []
  const attrs = element.attributes
  if (!attrs) return []
  return Object.entries(attrs).sort((a, b) => b[1] - a[1])
}

export default function ElementItem({ slotKey, element, showStats }) {
  const pickElement   = useGameStore(s => s.pickElement)
  const team          = useGameStore(s => s.team)
  // Drivers share a pool of 2 slots — only disabled when both are taken
  const alreadyFilled = (slotKey === 'driver1' || slotKey === 'driver2')
    ? (team.driver1 !== null && team.driver1 !== undefined &&
       team.driver2 !== null && team.driver2 !== undefined)
    : (team[slotKey] !== null && team[slotKey] !== undefined)

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
        w-full text-left px-4 py-2.5
        transition-colors duration-100
        ${alreadyFilled ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Slot tag */}
          <span className="text-[9px] font-bold uppercase tracking-wider text-ink-md w-10 shrink-0">
            {SLOT_SHORT[slotKey]}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-ink truncate">{displayName}</span>
              {subLabel && (
                <span className="text-[10px] text-ink-lt shrink-0">{subLabel}</span>
              )}
            </div>

            {/* Compact inline attribute chips */}
            {topAttrs.length > 0 && (
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {topAttrs.map(([key, val]) => (
                  <div key={key} className="flex items-center gap-1">
                    <span className="text-[9px] text-ink-lt uppercase tracking-wide shrink-0">
                      {ATTR_ES[key] || key.slice(0, 5)}
                    </span>
                    <div className="w-10 h-[3px] bg-borderc rounded-full overflow-hidden">
                      <div className="h-full bg-rust rounded-full" style={{ width: `${val}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-ink-md">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showStats && rating > 0 && (
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
