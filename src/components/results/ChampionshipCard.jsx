import { motion } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'
import { buildShareUrl } from '../../utils/shareEncoder'
import { SLOT_LABELS, getElementValue } from '../../utils/ratingEngine'

const FLAG_MAP = { ITA: '🇮🇹', GBR: '🇬🇧', DEU: '🇩🇪', FRA: '🇫🇷', BRA: '🇧🇷', AUS: '🇦🇺', ESP: '🇪🇸', FIN: '🇫🇮', AUT: '🇦🇹', NLD: '🇳🇱', USA: '🇺🇸', MCO: '🇲🇨', CAN: '🇨🇦', ARG: '🇦🇷', RSA: '🇿🇦', ZAF: '🇿🇦' }
const SLOT_KEYS = Object.keys(SLOT_LABELS)

export default function ChampionshipCard({ results }) {
  const team      = useGameStore(s => s.team)
  const era       = useGameStore(s => s.era)
  const mode      = useGameStore(s => s.mode)
  const resetGame = useGameStore(s => s.resetGame)

  if (!results) return null
  const { standings, finalPosition, playerStats } = results

  const isWinner = finalPosition === 1

  function handleShareLink() {
    const url = buildShareUrl(team, { era, mode })
    navigator.clipboard?.writeText(url).then(() => alert('Enlace copiado 🏁'))
  }

  return (
    <div className="space-y-5">

      {/* Share card — white with border, matches 7a0 style */}
      <div className="bg-white border border-borderc">
        {/* Card header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-borderc">
          <div>
            <div className="font-display font-black text-base text-ink leading-none">F1 LEGENDS</div>
            <div className="text-[9px] text-ink-md uppercase tracking-widest">PIT LANE DRAFT</div>
          </div>
          <div className="text-[10px] text-ink-md font-bold uppercase tracking-wide">
            {finalPosition === 1 ? 'CAMPEÓN' : `P${finalPosition}`}
          </div>
        </div>

        {/* Big result */}
        <div className="px-6 pt-5 pb-4 text-center border-b border-borderc">
          <div className="font-display font-black text-xl uppercase tracking-wide text-ink-md mb-1">
            {isWinner ? 'CAMPEÓN DEL MUNDO' : `ELIMINADO`}
          </div>
          <div
            className="font-display font-black leading-none"
            style={{ fontSize: 80, color: isWinner ? 'var(--gold)' : 'var(--ink)' }}
          >
            P{finalPosition}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 border-b border-borderc">
          {[
            { label: 'PUNTOS',   value: playerStats.points },
            { label: 'VICTORIAS', value: playerStats.wins },
            { label: 'OVERALL',  value: playerStats.points },
            { label: 'PODIOS',   value: playerStats.podiums },
          ].map(({ label, value }) => (
            <div key={label} className="px-3 py-3 text-center border-r border-borderc last:border-r-0">
              <div className="font-display font-black text-2xl text-ink">{value}</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-ink-md">{label}</div>
            </div>
          ))}
        </div>

        {/* Team list */}
        <div className="divide-y divide-borderc">
          {SLOT_KEYS.map(key => {
            const el = team[key]
            if (!el) return null
            const rating = getElementValue(el, key)
            const isTopRated = typeof rating === 'number' && rating >= 90
            const name = typeof el === 'number' ? `${el}/100` : el?.name
            const nat  = el?.nationality
            const year = el?.year

            return (
              <div
                key={key}
                className={`flex items-center justify-between px-4 py-2.5 ${isTopRated ? 'bg-sand-lt' : ''}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-display font-black text-base text-ink-lt w-6 shrink-0 text-center">
                    {SLOT_LABELS[key].emoji}
                  </span>
                  <span className={`text-sm font-bold text-ink truncate ${isTopRated ? 'text-rust' : ''}`}>
                    {name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {nat && <span className="text-xs">{FLAG_MAP[nat] || ''}</span>}
                  {year && <span className="text-[10px] font-bold text-ink-md">{year}</span>}
                  {rating && (
                    <span className={`font-display font-black text-base ${isTopRated ? 'text-rust' : 'text-ink-md'}`}>
                      {rating}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center py-3 text-[10px] text-ink-md">
          f1legends.netlify.app · construye el tuyo
        </div>
      </div>

      {/* Championship standings */}
      <div className="bg-white border border-borderc">
        <div className="px-4 py-2 border-b border-borderc">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-md">
            Clasificación Final — Constructores
          </span>
        </div>
        <div className="divide-y divide-borderc">
          {standings.map((s, i) => (
            <div
              key={s.name}
              className={`flex items-center justify-between px-4 py-2.5 ${s.isPlayer ? 'bg-sand-lt' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className={`font-display font-black text-lg w-6 shrink-0 ${
                  i === 0 ? 'text-[#c9a030]' : i <= 2 ? 'text-ink' : 'text-ink-lt'
                }`}>
                  {i + 1}
                </span>
                {s.color && (
                  <div className="w-1.5 h-5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                )}
                <span className={`text-sm ${s.isPlayer ? 'font-black text-rust' : 'font-semibold text-ink'}`}>
                  {s.isPlayer ? 'TU EQUIPO' : s.name}
                </span>
              </div>
              <span className="font-bold text-sm text-ink">{s.points} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons — matching 7a0 style */}
      <div className="flex gap-2">
        <button
          onClick={handleShareLink}
          className="flex-1 py-3 bg-rust text-white font-display font-black text-sm uppercase tracking-widest hover:opacity-90 transition-opacity text-center"
        >
          COMPARTIR ENLACE
        </button>
        <button
          onClick={resetGame}
          className="flex-1 py-3 border border-ink text-ink font-display font-black text-sm uppercase tracking-widest hover:bg-ink hover:text-white transition-colors text-center"
        >
          JUGAR DE NUEVO
        </button>
      </div>
    </div>
  )
}
