import realChampions from '../../data/real_champions.json'

// Best single result, biggest comeback, etc. — computed from the race log
function computeHighlights(races, d1Name, d2Name) {
  let best = null            // { pos, circuit, driver }
  let comeback = null        // { gain, from, to, circuit, driver }
  let wetWin = null          // { circuit, driver }

  for (const r of races) {
    for (const [pos, qualy, dnf, name] of [
      [r.d1RacePos, r.d1QualyPos, r.d1Dnf, d1Name],
      [r.d2RacePos, r.d2QualyPos, r.d2Dnf, d2Name],
    ]) {
      if (dnf) continue
      if (!best || pos < best.pos) best = { pos, circuit: r.circuit, driver: name }
      const gain = qualy - pos
      if (gain > 0 && (!comeback || gain > comeback.gain)) {
        comeback = { gain, from: qualy, to: pos, circuit: r.circuit, driver: name }
      }
      if (r.isWet && pos === 1 && !wetWin) wetWin = { circuit: r.circuit, driver: name }
    }
  }
  return { best, comeback, wetWin }
}

export default function SeasonHighlights({ races, d1Name, d2Name, playerStats, constructorPos, rivalYear, synergies }) {
  const { best, comeback, wetWin } = computeHighlights(races ?? [], d1Name, d2Name)
  const real = realChampions[rivalYear]

  const beatRealChampion = real && constructorPos === 1

  return (
    <div className="space-y-3">

      {/* Highlights */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-md mb-2">
          MOMENTOS DE LA TEMPORADA
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-borderc border border-borderc">
          <div className="bg-white px-4 py-3">
            <div className="text-[9px] font-bold uppercase tracking-widest text-ink-lt mb-1">MEJOR RESULTADO</div>
            {best ? (
              <>
                <div className="font-display font-black text-2xl text-ink">P{best.pos}</div>
                <div className="text-[10px] text-ink-md">{best.driver} · {best.circuit}</div>
              </>
            ) : <div className="text-xs text-ink-lt">—</div>}
          </div>
          <div className="bg-white px-4 py-3">
            <div className="text-[9px] font-bold uppercase tracking-widest text-ink-lt mb-1">MEJOR REMONTADA</div>
            {comeback ? (
              <>
                <div className="font-display font-black text-2xl text-rust">+{comeback.gain}</div>
                <div className="text-[10px] text-ink-md">{comeback.driver} · C{comeback.from}→P{comeback.to} · {comeback.circuit}</div>
              </>
            ) : <div className="text-xs text-ink-lt">—</div>}
          </div>
          <div className="bg-white px-4 py-3">
            <div className="text-[9px] font-bold uppercase tracking-widest text-ink-lt mb-1">
              {wetWin ? 'MAESTRO DE LA LLUVIA' : 'FIABILIDAD'}
            </div>
            {wetWin ? (
              <>
                <div className="font-display font-black text-2xl text-ink">🌧 P1</div>
                <div className="text-[10px] text-ink-md">{wetWin.driver} · {wetWin.circuit}</div>
              </>
            ) : (
              <>
                <div className="font-display font-black text-2xl text-ink">{playerStats?.dnfs ?? 0} DNF</div>
                <div className="text-[10px] text-ink-md">en {races?.length ?? 22} carreras (2 coches)</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Active synergies recap */}
      {synergies?.length > 0 && (
        <div className="bg-white border border-borderc px-4 py-3">
          <div className="text-[9px] font-bold uppercase tracking-widest text-ink-lt mb-2">SINERGIAS ACTIVAS</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {synergies.map(s => (
              <span key={s.id} className="text-[11px] text-ink" title={s.desc}>
                {s.emoji} <span className="font-bold">{s.label}</span>
                <span className="text-rust font-black ml-1">+{s.bonus}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Real history comparison */}
      {real && (
        <div className="bg-ink text-white px-4 py-3">
          <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1.5">
            LA HISTORIA REAL · {rivalYear}
          </div>
          <p className="text-sm">
            El campeón real de {rivalYear} fue{' '}
            <span className="font-bold">{real.driver}</span>
            {real.driverTeam && <span className="text-white/60"> ({real.driverTeam})</span>}
            {typeof real.driverPoints === 'number' && (
              <span className="text-white/60"> con {real.driverPoints} pts</span>
            )}.
            {real.constructor && (
              <> Constructores: <span className="font-bold">{real.constructor}</span>.</>
            )}
          </p>
          <p className="text-xs mt-1.5" style={{ color: beatRealChampion ? 'var(--gold, #c9a030)' : 'rgba(255,255,255,0.6)' }}>
            {beatRealChampion
              ? '🏆 Cambiaste la historia: tu equipo destronó al campeón real.'
              : 'La historia no cambió… esta vez.'}
          </p>
        </div>
      )}
    </div>
  )
}
