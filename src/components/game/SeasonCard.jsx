import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'
import { getTeamColors } from '../../utils/teamColors'
import ElementItem from './ElementItem'

const CARD_SLOTS = [
  'driver1', 'driver2', 'team_principal', 'technical_director',
  'chassis', 'engine', 'tires', 'aero', 'budget', 'reliability',
]

export default function SeasonCard() {
  const currentCard = useGameStore(s => s.currentCard)
  const mode        = useGameStore(s => s.mode)
  const showStats   = mode === 'vip'

  if (!currentCard) return null

  const { season, driver1, driver2, chassis, engine, team_principal,
          technical_director, tires, aero, budget, reliability } = currentCard

  const colors   = getTeamColors(season.team)
  const elements = { driver1, driver2, team_principal, technical_director, chassis, engine, tires, aero, budget, reliability }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={season.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white border border-borderc"
      >
        {/* Team header */}
        <div
          className="px-4 py-3 border-b border-borderc"
          style={{ borderLeftWidth: 4, borderLeftColor: colors.primary, borderLeftStyle: 'solid' }}
        >
          <div className="flex items-baseline justify-between">
            <div>
              <div
                className="font-display font-black text-2xl uppercase leading-none"
                style={{ color: colors.primary }}
              >
                {season.team}
              </div>
              <div className="font-display font-black text-4xl leading-none text-ink mt-0.5">
                {season.year}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink-md">
                {season.era.replace('_', ' ').toUpperCase()}
              </div>
              {mode === 'parce_ferme' && (
                <div className="mt-1 text-[9px] bg-ink text-white px-2 py-0.5 font-bold uppercase tracking-wider inline-block">
                  DE MEMORIA
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Elements */}
        <div className="divide-y divide-borderc max-h-[52vh] overflow-y-auto">
          <div className="px-4 py-2 bg-sand-lt">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-md">
              Elige un elemento →
            </span>
          </div>
          {CARD_SLOTS.map(key => {
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
