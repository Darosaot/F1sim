import { motion } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'

export default function DiceButton() {
  const rollCard    = useGameStore(s => s.rollCard)
  const currentCards = useGameStore(s => s.currentCards)
  const rollCount    = useGameStore(s => s.rollCount)

  if (currentCards.length > 0) return null

  return (
    <motion.button
      whileHover={{ opacity: 0.9 }}
      whileTap={{ scale: 0.97 }}
      onClick={rollCard}
      className="w-full py-4 bg-rust text-white font-display font-black text-xl uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
    >
      TIRAR 🎲
    </motion.button>
  )
}
