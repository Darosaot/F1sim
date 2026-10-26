import { useState } from 'react'
import { buildShareUrl } from '../../utils/shareEncoder'
import { dailyShareText } from '../../utils/daily'

export default function DailyCard({ results, team, best, isNewBest }) {
  const [copied, setCopied] = useState(false)
  const { daily, rivalYear, constructorPos, d1FinalPos, d2FinalPos, playerStats } = results

  function handleCopy() {
    const url = buildShareUrl(team, { era: 'all', mode: 'vip', rivalYear, daily })
    const text = dailyShareText({ date: daily, rivalYear, constructorPos, points: playerStats.points, d1FinalPos, d2FinalPos, url })
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="border-2 border-rust bg-white px-4 py-3">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-rust">RETO DIARIO · {daily}</span>
        {best && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-md">
            Intento {best.attempts}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-3">
        <span className="font-display font-black text-4xl text-ink">{playerStats.points}</span>
        <span className="text-xs font-bold uppercase tracking-wide text-ink-md">pts · P{constructorPos} constructores</span>
      </div>
      {best && (
        <p className="text-[11px] text-ink-md mt-1">
          {isNewBest
            ? '⭐ Tu mejor resultado de hoy.'
            : <>Tu mejor resultado de hoy: <span className="font-bold text-ink">{best.points} pts (P{best.constructorPos})</span></>}
        </p>
      )}
      <button
        onClick={handleCopy}
        className="mt-3 w-full py-2.5 bg-rust text-white font-display font-black text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
      >
        {copied ? '¡COPIADO!' : 'COPIAR RESULTADO'}
      </button>
      <p className="text-[10px] text-ink-lt mt-1.5">
        Todos juegan las mismas tiradas y la misma temporada: el enlace reproduce tu resultado exacto.
      </p>
    </div>
  )
}
