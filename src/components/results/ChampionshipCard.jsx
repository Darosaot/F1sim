import { useGameStore } from '../../stores/gameStore'
import { buildShareUrl } from '../../utils/shareEncoder'
import { SLOT_LABELS, getElementValue } from '../../utils/ratingEngine'

const FLAG_MAP = { ITA: '🇮🇹', GBR: '🇬🇧', DEU: '🇩🇪', FRA: '🇫🇷', BRA: '🇧🇷', AUS: '🇦🇺', ESP: '🇪🇸', FIN: '🇫🇮', AUT: '🇦🇹', NLD: '🇳🇱', USA: '🇺🇸', MCO: '🇲🇨', CAN: '🇨🇦', ARG: '🇦🇷', RSA: '🇿🇦', ZAF: '🇿🇦' }
const SLOT_KEYS = Object.keys(SLOT_LABELS)

function StandingsTable({ title, rows, showTeam }) {
  return (
    <div className="bg-white border border-borderc">
      <div className="px-4 py-2 border-b border-borderc">
        <span className="text-[10px] font-bold uppercase tracking-widest text-ink-md">{title}</span>
      </div>
      <div className="divide-y divide-borderc">
        {rows.map((s, i) => (
          <div
            key={`${s.name}-${i}`}
            className={`flex items-center justify-between px-4 py-2 ${s.isPlayer ? 'bg-sand-lt' : ''}`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className={`font-display font-black text-base w-5 shrink-0 ${
                i === 0 ? 'text-[#c9a030]' : i <= 2 ? 'text-ink' : 'text-ink-lt'
              }`}>
                {i + 1}
              </span>
              {s.color && (
                <div className="w-1 h-4 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
              )}
              <div className="min-w-0 flex-1">
                <span className={`text-sm block ${s.isPlayer ? 'font-black text-rust' : 'font-semibold text-ink'}`}>
                  {s.name}
                </span>
                {showTeam && s.team && (
                  <span className="text-[9px] text-ink-lt block">{s.team}</span>
                )}
              </div>
            </div>
            <span className="font-bold text-sm text-ink shrink-0 ml-2">{s.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ChampionshipCard({ results }) {
  const team      = useGameStore(s => s.team)
  const era       = useGameStore(s => s.era)
  const mode      = useGameStore(s => s.mode)
  const resetGame = useGameStore(s => s.resetGame)

  if (!results) return null
  const { driverStandings, constructorStandings, d1FinalPos, d2FinalPos, constructorPos, d1Name, d2Name, playerStats } = results

  function handleShareLink() {
    const url = buildShareUrl(team, { era, mode })
    navigator.clipboard?.writeText(url).then(() => alert('Enlace copiado 🏁'))
  }

  return (
    <div className="space-y-5">

      {/* Share card */}
      <div className="bg-white border border-borderc">
        <div className="flex items-center justify-between px-4 py-3 border-b border-borderc">
          <div>
            <div className="font-display font-black text-base text-ink leading-none">F1 LEGENDS</div>
            <div className="text-[9px] text-ink-md uppercase tracking-widest">PIT LANE DRAFT</div>
          </div>
          <div className="text-[10px] text-ink-md font-bold uppercase tracking-wide">
            P{d1FinalPos} · CONSTRUCTORES P{constructorPos}
          </div>
        </div>

        {/* Summary positions */}
        <div className="grid grid-cols-3 border-b border-borderc divide-x divide-borderc">
          {[
            { label: d1Name,         value: `P${d1FinalPos}`,      sub: 'Piloto 1' },
            { label: d2Name,         value: `P${d2FinalPos}`,      sub: 'Piloto 2' },
            { label: 'CONSTRUCTORES', value: `P${constructorPos}`, sub: `${playerStats.points} pts` },
          ].map(({ label, value, sub }) => (
            <div key={label} className="px-3 py-4 text-center">
              <div className="font-display font-black text-3xl text-ink leading-none">{value}</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-ink-md mt-1 truncate">{label}</div>
              <div className="text-[9px] text-ink-lt">{sub}</div>
            </div>
          ))}
        </div>

        {/* Team composition */}
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
                  {rating > 0 && (
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

      {/* Drivers' standings */}
      <StandingsTable
        title="Clasificación Final — Pilotos"
        rows={driverStandings ?? []}
        showTeam={true}
      />

      {/* Constructors' standings */}
      <StandingsTable
        title="Clasificación Final — Constructores"
        rows={constructorStandings ?? []}
        showTeam={false}
      />

      {/* Actions */}
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
