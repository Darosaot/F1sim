import { motion } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'
import EraSelector from '../components/ui/EraSelector'
import ModeToggle from '../components/ui/ModeToggle'

export default function Home() {
  const startGame = useGameStore(s => s.startGame)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Logo / Title */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-4xl">
            🏎️
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">
            F1 <span className="text-[#e10600]">Legends</span>
          </h1>
          <p className="text-sm text-[#8888aa]">Pit Lane Draft</p>
          <div
            className="mx-auto w-16 h-0.5 rounded-full mt-1"
            style={{ background: '#e10600' }}
          />
        </div>

        {/* Description */}
        <div className="text-center text-sm text-[#8888aa] leading-relaxed px-2">
          Construye el equipo de F1 de tus sueños mezclando pilotos, coches y
          mentes brillantes de toda la historia. Luego simula una temporada y
          compite por el Campeonato de Constructores.
        </div>

        {/* Config */}
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-5 space-y-5">
          <EraSelector />
          <div className="border-t border-[#2a2a3a] pt-4">
            <ModeToggle />
          </div>
        </div>

        {/* How to play */}
        <div className="bg-[#0e0e16] border border-[#1a1a2a] rounded-xl p-4 space-y-2">
          <div className="text-xs text-[#8888aa] uppercase tracking-wider mb-2">Cómo jugar</div>
          {[
            ['🎲', 'Tira y aparece un equipo + temporada aleatorio'],
            ['✅', 'Elige un elemento para llenar uno de tus 11 slots'],
            ['🃏', '3 comodines para descartar tiradas'],
            ['🏁', 'Con el equipo completo, simula la temporada'],
          ].map(([emoji, text]) => (
            <div key={text} className="flex items-start gap-2">
              <span className="text-sm shrink-0">{emoji}</span>
              <span className="text-xs text-[#555577]">{text}</span>
            </div>
          ))}
        </div>

        {/* Start button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={startGame}
          className="w-full py-4 rounded-2xl bg-[#e10600] text-white font-black text-lg uppercase tracking-widest shadow-[0_0_30px_rgba(225,6,0,0.35)] hover:bg-red-500 transition-all"
        >
          🚦 ARRANCAR
        </motion.button>

        <p className="text-center text-[10px] text-[#333344]">
          Sin registro. Sin descargas. 100% F1 historia.
        </p>
      </motion.div>
    </div>
  )
}
