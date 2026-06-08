import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'
import { getTeamColors } from '../../utils/teamColors'
import ElementItem from './ElementItem'

const CARD_SLOTS = [
  { key: 'driver1',            label: 'Piloto 1' },
  { key: 'driver2',            label: 'Piloto 2' },
  { key: 'team_principal',     label: 'Jefe de Equipo' },
  { key: 'technical_director', label: 'Director Técnico' },
  { key: 'chassis',            label: 'Chasis' },
  { key: 'engine',             label: 'Motor' },
  { key: 'strategist',         label: 'Estratega' },
  { key: 'tires',              label: 'Neumáticos' },
  { key: 'aero',               label: 'Aerodinámica' },
  { key: 'budget',             label: 'Financiación' },
  { key: 'reliability',        label: 'Fiabilidad' },
]

export default function SeasonCard() {
  const currentCard = useGameStore(s => s.currentCard)
  const mode = useGameStore(s => s.mode)
  const showStats = mode === 'vip'

  if (!currentCard) return null

  const { season, driver1, driver2, chassis, engine, team_principal,
          technical_director, strategist, tires, aero, budget, reliability } = currentCard

  const colors = getTeamColors(season.team)

  const elements = {
    driver1, driver2, team_principal, technical_director,
    chassis, engine, strategist, tires, aero, budget, reliability,
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={season.id}
        initial={{ opacity: 0, rotateY: 90, scale: 0.9 }}
        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
        exit={{ opacity: 0, rotateY: -90, scale: 0.9 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative rounded-xl overflow-hidden border border-[#2a2a3a]"
        style={{ '--team-primary': colors.primary }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 relative"
          style={{ background: `linear-gradient(135deg, ${colors.primary}22 0%, #12121a 100%)` }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: colors.primary }}
          />
          <div className="flex items-center justify-between">
            <div>
              <div
                className="text-lg font-black uppercase tracking-tight"
                style={{ color: colors.primary }}
              >
                {season.team}
              </div>
              <div className="text-2xl font-black text-white tabular-nums">
                {season.year}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[#8888aa] uppercase tracking-wider">Era</div>
              <div className="text-sm font-bold text-[#8888aa]">
                {season.era.replace('_', ' ').toUpperCase()}
              </div>
              {mode === 'parce_ferme' && (
                <div className="mt-1 text-[9px] bg-[#e10600] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Parc Fermé
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Elements */}
        <div className="bg-[#0e0e16] px-3 py-2 max-h-[60vh] overflow-y-auto space-y-1.5">
          <div className="text-[10px] text-[#555577] uppercase tracking-wider mb-2">
            Elige un elemento
          </div>
          {CARD_SLOTS.map(({ key }) => {
            const element = elements[key]
            if (element === null || element === undefined) return null
            return (
              <ElementItem
                key={key}
                slotKey={key}
                element={element}
                showStats={showStats}
              />
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
