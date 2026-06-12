import { createPortal } from 'react-dom'

const ATTR_ES = {
  pace: 'Ritmo', racecraft: 'Carrera', consistency: 'Const.',
  wet_performance: 'Lluvia', qualifying: 'Clasif.', experience: 'Experi.',
  tire_management: 'Neumát.', downforce: 'Carga', mechanical_grip: 'Grip',
  drag_efficiency: 'Drag', reliability: 'Fiab.', weight_distribution: 'Peso',
  power: 'Potencia', driveability: 'Control', fuel_efficiency: 'Comb.',
  deployment_mode: 'Desp.', team_management: 'Gestión', driver_management: 'Pilotos',
  political_skill: 'Política', budget_generation: 'Presup.', crisis_management: 'Crisis',
  design_genius: 'Diseño', innovation: 'Innova.', development_speed: 'Desa.',
  detail_obsession: 'Detalle', aerodynamic_vision: 'Aero.',
  race_management: 'Táctica', pit_timing: 'Parada', undercut_instinct: 'Undercut',
  safety_car_read: 'SC', pressure_decisions: 'Presión',
  peak_grip: 'Grip', durability: 'Durab.', thermal_window: 'Térm.',
  compound_versatility: 'Versát.',
}

const SLOT_LABEL = {
  driver1: 'PILOTO', driver2: 'PILOTO',
  team_principal: 'JEFE DE EQUIPO', technical_director: 'DIR. TÉCNICO',
  chassis: 'CHASIS', engine: 'MOTOR', tires: 'NEUMÁTICOS',
}

// Radar chart for driver/TD attrs
const DRIVER_RADAR_KEYS = ['pace', 'racecraft', 'qualifying', 'consistency', 'wet_performance', 'experience', 'tire_management']
const TD_RADAR_KEYS = ['design_genius', 'innovation', 'development_speed', 'aerodynamic_vision', 'detail_obsession']

function RadarChart({ attrs, keys, size = 160 }) {
  const relevant = keys.filter(k => attrs[k] !== undefined)
  const n = relevant.length
  if (n < 3) return null
  const cx = size / 2, cy = size / 2, r = size / 2 - 26

  const angle = (i) => (i / n) * 2 * Math.PI - Math.PI / 2
  const pts = relevant.map((key, i) => {
    const val = (attrs[key] || 0) / 100
    return {
      x: cx + Math.cos(angle(i)) * r * val,
      y: cy + Math.sin(angle(i)) * r * val,
      lx: cx + Math.cos(angle(i)) * (r + 20),
      ly: cy + Math.sin(angle(i)) * (r + 20),
      label: ATTR_ES[key] || key.slice(0, 4),
    }
  })
  const polygon = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map(level => (
        <circle key={level} cx={cx} cy={cy} r={r * level} fill="none" stroke="#e5e1d8" strokeWidth="0.5" />
      ))}
      {relevant.map((_, i) => (
        <line key={i} x1={cx} y1={cy}
          x2={cx + Math.cos(angle(i)) * r} y2={cy + Math.sin(angle(i)) * r}
          stroke="#e5e1d8" strokeWidth="0.5" />
      ))}
      <polygon points={polygon} fill="rgba(224,85,53,0.15)" stroke="#e05535" strokeWidth="1.5" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#e05535" />
      ))}
      {pts.map((p, i) => (
        <text key={i} x={p.lx} y={p.ly}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="7" fontWeight="bold" fill="#999"
          style={{ fontFamily: 'sans-serif', textTransform: 'uppercase' }}>
          {p.label}
        </text>
      ))}
    </svg>
  )
}

export default function DriverModal({ element, slotKey, onClose }) {
  if (!element || typeof element === 'number') return null
  const attrs = element.attributes ?? {}
  const isDriver = slotKey === 'driver1' || slotKey === 'driver2'
  const isTD = slotKey === 'technical_director'
  const radarKeys = isDriver ? DRIVER_RADAR_KEYS : isTD ? TD_RADAR_KEYS : null
  const sortedAttrs = Object.entries(attrs).sort((a, b) => b[1] - a[1])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm border border-borderc overflow-y-auto"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-borderc">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-ink-lt mb-0.5">
              {SLOT_LABEL[slotKey] || slotKey.toUpperCase()}
            </div>
            <h3 className="font-display font-black text-2xl text-ink leading-none">{element.name}</h3>
            {element.year && (
              <div className="text-xs text-ink-md mt-1">{element.year}{element.team ? ` · ${element.team}` : ''}</div>
            )}
            {element.era && (
              <div className="text-[10px] text-ink-lt uppercase tracking-wide mt-0.5">
                {element.era.replace(/_/g, ' ')}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-ink-lt hover:text-ink text-2xl font-light leading-none mt-0.5"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Radar chart */}
        {radarKeys && radarKeys.some(k => attrs[k] !== undefined) && (
          <div className="flex justify-center py-3 border-b border-borderc">
            <RadarChart attrs={attrs} keys={radarKeys} />
          </div>
        )}

        {/* Attributes */}
        {sortedAttrs.length > 0 && (
          <div className="px-5 py-4 space-y-2">
            <div className="text-[9px] font-bold uppercase tracking-widest text-ink-lt mb-3">ATRIBUTOS</div>
            {sortedAttrs.map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[9px] text-ink-lt uppercase tracking-wide w-16 shrink-0">
                  {ATTR_ES[key] || key.slice(0, 6)}
                </span>
                <div className="flex-1 h-[3px] bg-borderc rounded-full overflow-hidden">
                  <div className="h-full bg-rust rounded-full" style={{ width: `${val}%` }} />
                </div>
                <span className="text-[10px] font-bold text-ink w-5 text-right shrink-0">{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Close button */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2 border border-borderc text-xs font-bold uppercase tracking-widest text-ink hover:bg-ink hover:text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
