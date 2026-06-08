import { motion } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'

export default function DiceButton() {
  const rollCard = useGameStore(s => s.rollCard)
  const currentCard = useGameStore(s => s.currentCard)
  const rollCount = useGameStore(s => s.rollCount)

  if (currentCard) return null

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      onClick={rollCard}
      className="w-full py-4 rounded-xl bg-[#e10600] text-white font-black text-base uppercase tracking-widest shadow-[0_0_20px_rgba(225,6,0,0.4)] hover:bg-red-500 transition-colors"
    >
      <span className="flex items-center justify-center gap-2">
        <span className="text-xl">🎲</span>
        {rollCount === 0 ? 'TIRAR' : 'TIRAR DE NUEVO'}
      </span>
    </motion.button>
  )
}
