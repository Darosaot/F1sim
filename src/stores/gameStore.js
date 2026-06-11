import { create } from 'zustand'
import { getRandomSeason, getFilteredSeasons, resolveSeasonElements, resolveSharedTeam } from '../utils/dataQueries'

// undefined = not yet picked; null = slot unavailable for this team (auto-skipped)
const EMPTY_TEAM = {
  driver1: undefined,
  driver2: undefined,
  team_principal: undefined,
  technical_director: undefined,
  chassis: undefined,
  engine: undefined,
  tires: undefined,
  aero: undefined,
  budget: undefined,
  reliability: undefined,
}

const SLOT_KEYS = Object.keys(EMPTY_TEAM)

export const useGameStore = create((set, get) => ({
  // Config
  era: 'all',
  mode: 'vip',
  draftDifficulty: 'hard',
  rivalYear: 2024,

  // Phase: 'setup' | 'drafting' | 'complete' | 'results'
  phase: 'setup',

  // Draft state
  wildcards: 3,
  currentCard: null,
  usedSeasonIds: [],
  rollCount: 0,

  // Team
  team: { ...EMPTY_TEAM },

  // Results
  simulationResults: null,

  // ---- Config actions ----
  setEra: (era) => set({ era }),
  setMode: (mode) => set({ mode }),
  setDraftDifficulty: (draftDifficulty) => set({ draftDifficulty }),
  setRivalYear: (rivalYear) => set({ rivalYear }),

  // ---- Game flow ----
  startGame: () => {
    set({
      phase: 'drafting',
      wildcards: 3,
      currentCard: null,
      usedSeasonIds: [],
      rollCount: 0,
      team: { ...EMPTY_TEAM },
      simulationResults: null,
    })
    get().rollCard()
  },

  rollCard: () => {
    const { era, usedSeasonIds, draftDifficulty, team } = get()

    // Slots still needing a value (undefined = not yet picked)
    const unfilledSlots = SLOT_KEYS.filter(k => team[k] === undefined)
    if (unfilledSlots.length === 0) { set({ phase: 'complete' }); return }

    // Map slot key → resolved card field name
    const SLOT_FIELD = {
      driver1: 'driver1', driver2: 'driver2',
      team_principal: 'team_principal', technical_director: 'technical_director',
      chassis: 'chassis', engine: 'engine', tires: 'tires',
      aero: 'aero', budget: 'budget', reliability: 'reliability',
    }

    // Try up to 15 draws to find a card with at least one pickable slot.
    // Cards that have nothing to offer are still consumed (added to usedIds).
    const newUsedIds = [...usedSeasonIds]
    let season = null, resolved = null

    for (let attempt = 0; attempt < 15; attempt++) {
      const candidate = getRandomSeason(era, newUsedIds, draftDifficulty)
      if (!candidate) break
      const r = resolveSeasonElements(candidate)
      newUsedIds.push(candidate.id)

      const hasPickable = unfilledSlots.some(slot => {
        const val = r[SLOT_FIELD[slot]]
        return val !== null && val !== undefined
      })

      if (hasPickable) { season = candidate; resolved = r; break }
    }

    if (!season) {
      // Truly stuck — auto-skip all remaining null slots and complete
      const newTeam = { ...team }
      unfilledSlots.forEach(k => { newTeam[k] = null })
      set({ team: newTeam, phase: 'complete', currentCard: null, usedSeasonIds: newUsedIds })
      return
    }

    set({
      currentCard: resolved,
      usedSeasonIds: newUsedIds,
      rollCount: get().rollCount + 1,
    })
  },

  pickElement: (slotKey, element) => {
    const team = { ...get().team }

    // Drivers are a shared pool — fill whichever slot is open
    let actualSlot = slotKey
    if (slotKey === 'driver1' || slotKey === 'driver2') {
      if (team.driver1 === undefined) actualSlot = 'driver1'
      else if (team.driver2 === undefined) actualSlot = 'driver2'
      else return // both full, nothing to do
    }

    team[actualSlot] = element
    // null = auto-skipped (unavailable); undefined = still needs picking
    const allFilled = SLOT_KEYS.every(k => team[k] !== undefined)
    set({
      team,
      currentCard: null,
      phase: allFilled ? 'complete' : 'drafting',
    })
    if (!allFilled) {
      setTimeout(() => get().rollCard(), 300)
    }
  },

  // Re-roll any team (original wildcard)
  useWildcard: () => {
    const { wildcards } = get()
    if (wildcards <= 0) return
    set({ wildcards: wildcards - 1, currentCard: null })
    setTimeout(() => get().rollCard(), 300)
  },

  // Re-roll keeping the same team, just a different season year
  useWildcardSameTeam: () => {
    const { wildcards, era, usedSeasonIds, currentCard } = get()
    if (wildcards <= 0 || !currentCard) return
    const teamName = currentCard.season.team
    const all = getFilteredSeasons(era).filter(
      s => s.team === teamName && !usedSeasonIds.includes(s.id)
    )
    if (all.length === 0) {
      // Fallback: roll any team
      set({ wildcards: wildcards - 1, currentCard: null })
      setTimeout(() => get().rollCard(), 300)
      return
    }
    const season = all[Math.floor(Math.random() * all.length)]
    const resolved = resolveSeasonElements(season)
    set({
      wildcards: wildcards - 1,
      currentCard: resolved,
      usedSeasonIds: [...usedSeasonIds, season.id],
      rollCount: get().rollCount + 1,
    })
  },

  setSimulationResults: (results) => {
    set({ simulationResults: results, phase: 'results' })
  },

  // Load a team from a shared URL — jumps straight to 'complete' so the
  // receiver can simulate the season with the shared lineup
  loadSharedTeam: (payload) => {
    const team = resolveSharedTeam(payload)
    if (!team) return false
    const hasAny = Object.values(team).some(v => v !== null)
    if (!hasAny) return false
    set({
      team,
      era: payload.era || 'all',
      mode: payload.mode || 'vip',
      rivalYear: payload.ry || 2024,
      phase: 'complete',
      currentCard: null,
      wildcards: 0,
      simulationResults: null,
    })
    return true
  },

  resetGame: () => {
    set({
      phase: 'setup',
      wildcards: 3,
      currentCard: null,
      usedSeasonIds: [],
      rollCount: 0,
      team: { ...EMPTY_TEAM },
      simulationResults: null,
    })
  },

  // ---- Helpers ----
  getEmptySlots: () => {
    const team = get().team
    return SLOT_KEYS.filter(k => team[k] === undefined)
  },

  getFilledCount: () => {
    const team = get().team
    return SLOT_KEYS.filter(k => team[k] !== undefined).length
  },
}))
