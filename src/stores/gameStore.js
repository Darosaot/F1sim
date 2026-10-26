import { create } from 'zustand'
import { getRandomSeason, getFilteredSeasons, resolveSeasonElements, resolveSharedTeam } from '../utils/dataQueries'
import { todayKey, dailyConfig, dailyRollRng } from '../utils/daily'

// undefined = not yet picked; null = slot unavailable for this team (auto-skipped)
const EMPTY_TEAM = {
  driver1: undefined,
  driver2: undefined,
  team_principal: undefined,
  technical_director: undefined,
  strategist: undefined,
  chassis: undefined,
  engine: undefined,
  tires: undefined,
  aero: undefined,
  budget: undefined,
  reliability: undefined,
}

const SLOT_KEYS = Object.keys(EMPTY_TEAM)

const DRIVER_KEYS = ['driver1', 'driver2']
const has = v => v !== null && v !== undefined

// True if the resolved season offers at least one element for an open slot.
// Drivers are a shared pool: any card driver can fill any open driver seat.
function hasPickable(resolved, team) {
  const driverOpen = DRIVER_KEYS.some(k => team[k] === undefined)
  if (driverOpen && DRIVER_KEYS.some(k => has(resolved[k]))) return true
  return SLOT_KEYS.some(k => !DRIVER_KEYS.includes(k) && team[k] === undefined && has(resolved[k]))
}

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
  currentCards: [],
  usedSeasonIds: [],
  rollCount: 0,

  // Team
  team: { ...EMPTY_TEAM },

  // Results
  simulationResults: null,

  // Daily challenge date ('YYYY-MM-DD') or null for a free game
  daily: null,
  // Team loaded from someone else's share link (not your own attempt)
  shared: false,
  // The player's own settings, restored when leaving a daily challenge
  savedConfig: null,

  // ---- Config actions ----
  setEra: (era) => set({ era }),
  setMode: (mode) => set({ mode }),
  setDraftDifficulty: (draftDifficulty) => set({ draftDifficulty }),
  setRivalYear: (rivalYear) => set({ rivalYear }),

  // ---- Game flow ----
  startGame: () => {
    set({
      ...(get().savedConfig ?? {}),
      savedConfig: null,
      daily: null,
      shared: false,
      phase: 'drafting',
      wildcards: 3,
      currentCards: [],
      usedSeasonIds: [],
      rollCount: 0,
      team: { ...EMPTY_TEAM },
      simulationResults: null,
    })
    get().rollCard()
  },

  startDailyChallenge: (date = todayKey()) => {
    const { era, mode, draftDifficulty, rivalYear, savedConfig } = get()
    set({
      savedConfig: savedConfig ?? { era, mode, draftDifficulty, rivalYear },
      ...dailyConfig(date),
      daily: date,
      shared: false,
      phase: 'drafting',
      wildcards: 3,
      currentCards: [],
      usedSeasonIds: [],
      rollCount: 0,
      team: { ...EMPTY_TEAM },
      simulationResults: null,
    })
    get().rollCard()
  },

  // Random source for the next roll: seeded by roll number in the daily
  // challenge, so everyone's roll N comes from the same sequence
  rollRng: () => {
    const { daily, rollCount } = get()
    return daily ? dailyRollRng(daily, rollCount + 1) : Math.random
  },

  rollCard: () => {
    const { era, usedSeasonIds, draftDifficulty, team } = get()
    const rng = get().rollRng()

    // Slots still needing a value (undefined = not yet picked)
    const unfilledSlots = SLOT_KEYS.filter(k => team[k] === undefined)
    if (unfilledSlots.length === 0) { set({ phase: 'complete' }); return }

    const newUsedIds = [...usedSeasonIds]
    const cards = []

    // Draw a single team-season that offers ≥1 pickable slot
    for (let attempt = 0; attempt < 15; attempt++) {
      const candidate = getRandomSeason(era, newUsedIds, draftDifficulty, rng)
      if (!candidate) break
      const r = resolveSeasonElements(candidate)
      newUsedIds.push(candidate.id)
      if (hasPickable(r, team)) { cards.push(r); break }
    }

    if (cards.length === 0) {
      // Truly stuck — auto-skip all remaining null slots and complete
      const newTeam = { ...team }
      unfilledSlots.forEach(k => { newTeam[k] = null })
      set({ team: newTeam, phase: 'complete', currentCards: [], usedSeasonIds: newUsedIds })
      return
    }

    set({
      currentCards: cards,
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
      currentCards: [],
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
    set({ wildcards: wildcards - 1, currentCards: [] })
    setTimeout(() => get().rollCard(), 300)
  },

  // Re-roll keeping the same team, just a different season year
  useWildcardSameTeam: () => {
    const { wildcards, era, usedSeasonIds, currentCards, team } = get()
    if (wildcards <= 0 || !currentCards.length) return
    const teamName = currentCards[0].season.team
    const all = getFilteredSeasons(era)
      .filter(s => s.team === teamName && !usedSeasonIds.includes(s.id))
      .map(resolveSeasonElements)
      .filter(r => hasPickable(r, team))
    if (all.length === 0) {
      // Fallback: roll any team
      set({ wildcards: wildcards - 1, currentCards: [] })
      setTimeout(() => get().rollCard(), 300)
      return
    }
    // Draw one other season of the same team
    const card = all[Math.floor(get().rollRng()() * all.length)]
    const cards = [card]
    const newUsedIds = [...usedSeasonIds, card.season.id]
    set({
      wildcards: wildcards - 1,
      currentCards: cards,
      usedSeasonIds: newUsedIds,
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
      daily: payload.dy || null,
      shared: true,
      phase: 'complete',
      currentCards: [],
      wildcards: 0,
      simulationResults: null,
    })
    return true
  },

  resetGame: () => {
    set({
      ...(get().savedConfig ?? {}),
      savedConfig: null,
      daily: null,
      shared: false,
      phase: 'setup',
      wildcards: 3,
      currentCards: [],
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
