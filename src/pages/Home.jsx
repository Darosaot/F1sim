import { motion } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'
import { getAvailableRivalYears } from '../utils/rivalBuilder'

const STEPS = [
  { n: '01', icon: '🎲', title: 'TIRA',      desc: 'Obtén un equipo y temporada aleatorio' },
  { n: '02', icon: '⚙️', title: 'CONSTRUYE', desc: 'Elige un elemento para tu equipo' },
  { n: '03', icon: '🏁', title: 'SIMULA',    desc: 'Compite por el campeonato' },
]

const ERAS = [
  { id: 'all',       label: 'Toda la historia', years: '1950–2025' },
  { id: 'early',     label: 'Era Clásica',       years: '1950–65' },
  { id: 'pre_turbo', label: 'Pre-Turbo',          years: '1966–82' },
  { id: 'turbo',     label: 'Era Turbo',          years: '1983–88' },
  { id: 'v10',       label: 'V10 / V12',          years: '1989–05' },
  { id: 'v8',        label: 'Era V8',             years: '2006–13' },
  { id: 'hybrid',    label: 'Era Híbrida',        years: '2014–21' },
  { id: 'current',   label: 'Era Actual',         years: '2022+' },
]

const ERA_GROUPS = [
  { label: 'Actual (2022+)',      range: [2022, 2099] },
  { label: 'Híbrida (2014–21)',   range: [2014, 2021] },
  { label: 'V8 (2006–13)',        range: [2006, 2013] },
  { label: 'V10 / V12 (1989–05)', range: [1989, 2005] },
  { label: 'Turbo (1983–88)',     range: [1983, 1988] },
  { label: 'Pre-Turbo (1966–82)', range: [1966, 1982] },
  { label: 'Clásica (1950–65)',   range: [1950, 1965] },
]

const ALL_RIVAL_YEARS = getAvailableRivalYears()

export default function Home() {
  const startGame         = useGameStore(s => s.startGame)
  const era               = useGameStore(s => s.era)
  const mode              = useGameStore(s => s.mode)
  const draftDifficulty   = useGameStore(s => s.draftDifficulty)
  const rivalYear         = useGameStore(s => s.rivalYear)
  const setEra            = useGameStore(s => s.setEra)
  const setMode           = useGameStore(s => s.setMode)
  const setDraftDifficulty = useGameStore(s => s.setDraftDifficulty)
  const setRivalYear      = useGameStore(s => s.setRivalYear)

  return (
    <div className="min-h-screen bg-sand font-body">

      {/* Nav */}
      <nav className="flex items-center justify-end gap-2 px-6 py-4">
        <button
          onClick={() => setMode(mode === 'vip' ? 'parce_ferme' : 'vip')}
          className="px-4 py-1.5 rounded-full border border-ink text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-sand transition-colors"
        >
          {mode === 'vip' ? 'CLASSIC' : 'MEMORY'}
        </button>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left — headline */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-ink-md mb-3">
              PIT LANE DRAFT · 1950 — 2025
            </p>

            <div className="flex items-end gap-2 mb-1 leading-none">
              <span className="font-display font-black text-[96px] leading-none text-ink">F1</span>
              <span
                className="font-display font-black text-[96px] leading-none"
                style={{ color: 'var(--gold)' }}
              >
                —
              </span>
              <span className="font-display font-black text-[96px] leading-none text-ink">P1</span>
            </div>

            <h2 className="font-display font-black text-3xl uppercase leading-tight text-ink mt-4 mb-4">
              Tira el dado.<br />
              Construye tu equipo<br />
              F1 de ensueño
            </h2>

            <p className="text-sm text-ink-md leading-relaxed mb-6 max-w-sm">
              Tira el dado: te toca un equipo y temporada. Elige uno de sus elementos,
              completa los 11 slots y simula — ¿puede tu equipo ganar el campeonato?
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={startGame}
              className="inline-flex items-center gap-2 px-6 py-4 bg-rust text-white font-display font-black text-xl uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              JUGAR AHORA →
            </motion.button>
          </div>

          {/* Right — config + preview */}
          <div className="space-y-5">
            {/* Era selector */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-ink-md mb-2">ERA</p>
              <div className="flex flex-wrap gap-1.5">
                {ERAS.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setEra(e.id)}
                    className={`px-3 py-1.5 border text-xs font-bold uppercase tracking-wide transition-colors ${
                      era === e.id
                        ? 'bg-ink text-white border-ink'
                        : 'bg-white text-ink border-borderc hover:border-ink'
                    }`}
                  >
                    {e.years}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode selector */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-ink-md mb-2">
                MODO · DIFICULTAD
              </p>
              <div className="flex gap-2">
                {[
                  { id: 'vip',         label: 'Clásico',    desc: 'Stats visibles' },
                  { id: 'parce_ferme', label: 'De memoria', desc: 'Stats ocultos' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`px-4 py-2.5 border text-left transition-colors ${
                      mode === m.id
                        ? 'bg-ink text-white border-ink'
                        : 'bg-white text-ink border-borderc hover:border-ink'
                    }`}
                  >
                    <div className="text-sm font-bold">{m.label}</div>
                    <div className="text-[10px] opacity-60">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Draft difficulty selector */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-ink-md mb-2">
                SORTEO · DIFICULTAD
              </p>
              <div className="flex gap-2">
                {[
                  { id: 'hard',   label: 'Realista',    desc: 'Todos los equipos al azar' },
                  { id: 'medium', label: 'Equilibrado', desc: 'Equipos mejores más frecuentes' },
                  { id: 'easy',   label: 'Fácil',       desc: 'Solo equipos de alto nivel' },
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDraftDifficulty(d.id)}
                    className={`flex-1 px-3 py-2.5 border text-left transition-colors ${
                      draftDifficulty === d.id
                        ? 'bg-ink text-white border-ink'
                        : 'bg-white text-ink border-borderc hover:border-ink'
                    }`}
                  >
                    <div className="text-sm font-bold">{d.label}</div>
                    <div className="text-[10px] opacity-60">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Rival year selector */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-ink-md mb-2">
                RIVALES · TEMPORADA
              </p>
              <div className="relative">
                <select
                  value={rivalYear}
                  onChange={e => setRivalYear(Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-borderc bg-white text-sm font-bold text-ink appearance-none cursor-pointer hover:border-ink transition-colors focus:outline-none focus:border-ink"
                >
                  {ERA_GROUPS.map(group => {
                    const years = ALL_RIVAL_YEARS.filter(y => y >= group.range[0] && y <= group.range[1])
                    if (years.length === 0) return null
                    return (
                      <optgroup key={group.label} label={group.label}>
                        {years.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </optgroup>
                    )
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-lt text-xs">▼</div>
              </div>
              <p className="text-[10px] text-ink-lt mt-1">
                Compite contra los equipos y pilotos reales de esa temporada
              </p>
            </div>

            {/* Stats bar */}
            <div className="text-xs text-ink-md pt-2">
              <span className="font-bold text-ink">1900+</span> pilotos ·{' '}
              <span className="font-bold text-ink">1000+</span> temporadas ·{' '}
              <span className="font-bold text-ink">11</span> slots ·{' '}
              <span className="font-bold text-ink">22</span> circuitos
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="divider my-10" />

        {/* Steps */}
        <div className="grid grid-cols-3 gap-px bg-borderc border border-borderc">
          {STEPS.map(s => (
            <div key={s.n} className="bg-sand px-5 py-4">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-display font-black text-2xl text-rust">{s.n}</span>
                <span className="text-xl">{s.icon}</span>
                <span className="font-display font-black text-lg uppercase text-ink">{s.title}</span>
              </div>
              <p className="text-xs text-ink-md">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-[11px] text-ink-md tracking-widest uppercase">
        F1 LEGENDS · PIT LANE DRAFT · BUILD · SIMULATE · P1
      </footer>
    </div>
  )
}
