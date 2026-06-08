import { motion } from 'framer-motion'
import { buildShareUrl } from '../../utils/shareEncoder'
import { useGameStore } from '../../stores/gameStore'

const POSITION_MEDALS = { 1: '🏆', 2: '🥈', 3: '🥉' }

export default function ChampionshipCard({ results }) {
  const team = useGameStore(s => s.team)
  const era = useGameStore(s => s.era)
  const mode = useGameStore(s => s.mode)
  const resetGame = useGameStore(s => s.resetGame)

  if (!results) return null
  const { standings, finalPosition, playerStats } = results

  function handleShare() {
    const url = buildShareUrl(team, { era, mode })
    navigator.clipboard?.writeText(url).then(() => {
      alert('URL copiada al portapapeles 🏁')
    })
  }

  return (
    <div className="space-y-4">
      {/* Position banner */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="text-center py-6 rounded-xl bg-[#1a1a28] border border-[#2a2a3a]"
      >
        <div className="text-4xl mb-1">{POSITION_MEDALS[finalPosition] || '🏎️'}</div>
        <div className="text-xs text-[#8888aa] uppercase tracking-widest mb-1">Posición Final</div>
        <div className="text-5xl font-black text-[#e10600]">P{finalPosition}</div>
        <div className="text-sm text-[#8888aa] mt-1">Campeonato de Constructores</div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Puntos', value: playerStats.points },
          { label: 'Victorias', value: playerStats.wins },
          { label: 'Podios', value: playerStats.podiums },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-3 text-center">
            <div className="text-xl font-black text-white">{value}</div>
            <div className="text-[10px] text-[#555577] uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Poles', value: playerStats.poles },
          { label: 'DNFs', value: playerStats.dnfs },
          { label: 'Mejor', value: `P${playerStats.bestResult}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-3 text-center">
            <div className="text-xl font-black text-white">{value}</div>
            <div className="text-[10px] text-[#555577] uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </div>

      {/* Standings */}
      <div className="rounded-xl border border-[#2a2a3a] overflow-hidden">
        <div className="px-4 py-2 bg-[#1a1a28] border-b border-[#2a2a3a]">
          <span className="text-xs text-[#8888aa] uppercase tracking-wider">Clasificación Final</span>
        </div>
        <div className="divide-y divide-[#1a1a28]">
          {standings.map((s, i) => (
            <div
              key={s.name}
              className={`flex items-center justify-between px-4 py-2 ${s.isPlayer ? 'bg-[#1a0808]' : 'bg-[#0e0e14]'}`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-sm font-black w-5 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-[#555577]'}`}>
                  {i + 1}
                </span>
                {s.color && (
                  <div className="w-2 h-4 rounded-sm" style={{ backgroundColor: s.color }} />
                )}
                <span className={`text-xs font-semibold ${s.isPlayer ? 'text-[#e10600]' : 'text-[#aaaacc]'}`}>
                  {s.isPlayer ? 'YOUR TEAM' : s.name}
                </span>
              </div>
              <span className="text-xs font-bold text-white">{s.points} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleShare}
          className="flex-1 py-3 rounded-xl border border-[#2a2a3a] text-xs font-bold text-[#8888aa] hover:border-[#e10600] hover:text-white transition-all"
        >
          📤 COMPARTIR
        </button>
        <button
          onClick={resetGame}
          className="flex-1 py-3 rounded-xl bg-[#e10600] text-white text-xs font-bold uppercase tracking-wider hover:bg-red-500 transition-colors"
        >
          🏎️ NUEVA PARTIDA
        </button>
      </div>
    </div>
  )
}
