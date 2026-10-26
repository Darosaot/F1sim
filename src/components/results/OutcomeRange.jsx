import { useState, useEffect } from 'react'
import { simulateOutcomes } from '../../utils/simulator'
import { buildRivalsForYear } from '../../utils/rivalBuilder'

const pct = x => `${Math.round(x * 100)}%`

// "If you replayed this season 200 times": how much of the result was luck
export default function OutcomeRange({ team, rivalYear, constructorPos }) {
  const [outcomes, setOutcomes] = useState(null)

  useEffect(() => {
    // ~200 seasons take a few hundred ms: let the page paint first
    const t = setTimeout(() => {
      setOutcomes(simulateOutcomes(team, buildRivalsForYear(rivalYear), { year: rivalYear }))
    }, 50)
    return () => clearTimeout(t)
  }, [team, rivalYear])

  if (!outcomes) {
    return (
      <div className="bg-white border border-borderc px-4 py-3 text-xs text-ink-md animate-pulse">
        Repitiendo la temporada 200 veces…
      </div>
    )
  }

  const max = Math.max(...outcomes.histogram)

  return (
    <div className="bg-white border border-borderc px-4 py-3">
      <div className="text-[9px] font-bold uppercase tracking-widest text-ink-lt mb-2">
        ¿SUERTE O TALENTO? · {outcomes.runs} TEMPORADAS SIMULADAS
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        {[
          { label: 'Título constructores', value: pct(outcomes.constructorTitle) },
          { label: 'Título pilotos',       value: pct(outcomes.driverTitle) },
          { label: 'Podio constructores',  value: pct(outcomes.podium) },
        ].map(s => (
          <div key={s.label}>
            <div className="font-display font-black text-2xl text-ink leading-none">{s.value}</div>
            <div className="text-[9px] uppercase tracking-wide text-ink-md mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Distribution of constructor positions; your actual result highlighted */}
      <div className="flex items-end gap-0.5 h-12" aria-label="Distribución de posiciones finales">
        {outcomes.histogram.map((share, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full" title={`P${i + 1}: ${pct(share)}`}>
            <div
              className={i + 1 === constructorPos ? 'w-full bg-rust' : 'w-full bg-ink/70'}
              style={{ height: `${max ? (share / max) * 100 : 0}%`, minHeight: share > 0 ? 2 : 0 }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-0.5 mt-1">
        {outcomes.histogram.map((_, i) => (
          <div key={i} className={`flex-1 text-center text-[8px] ${i + 1 === constructorPos ? 'text-rust font-bold' : 'text-ink-lt'}`}>
            P{i + 1}
          </div>
        ))}
      </div>

      <p className="text-[10px] text-ink-md mt-2">
        Posición típica <span className="font-bold text-ink">P{outcomes.medianPosition}</span> ·
        puntos entre <span className="font-bold text-ink">{outcomes.points.p10}</span> y{' '}
        <span className="font-bold text-ink">{outcomes.points.p90}</span> en 8 de cada 10 temporadas
      </p>
    </div>
  )
}
