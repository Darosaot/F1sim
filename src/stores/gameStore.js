import { create } from 'zustand'
import { getRandomSeason, getFilteredSeasons, resolveSeasonElements } from '../utils/dataQueries'

const EMPTY_TEAM = {
  driver1: null,
  driver2: null,
  team_principal: null,
  technical_director: null,
  chassis: null,
  engine: null,
  strategist: null,
  tires: null,
  aero: null,
  budget: null,
  reliability: null,
}

const SLOT_KEYS = Object.keys(EMPTY_TEAM)

export const useGameStore = create((set, get) => ({
  // Config
  era: 'all',
  mode: 'vip',

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
    const { era, usedSeasonIds } = get()
    const season = getRandomSeason(era, usedSeasonIds)
    if (!season) return
    const resolved = resolveSeasonElements(season)
    set({
      currentCard: resolved,
      usedSeasonIds: [...usedSeasonIds, season.id],
      rollCount: get().rollCount + 1,
    })
  },

  pickElement: (slotKey, element) => {
    const team = { ...get().team }
    team[slotKey] = element
    const allFilled = SLOT_KEYS.every(k => team[k] !== null && team[k] !== undefined)
    set({
      team,
      currentCard: null,
      phase: allFilled ? 'complete' : 'drafting',
    })
    if (!allFilled) {
      // auto-roll next card
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
    return SLOT_KEYS.filter(k => team[k] === null || team[k] === undefined)
  },

  getFilledCount: () => {
    const team = get().team
    return SLOT_KEYS.filter(k => team[k] !== null && team[k] !== undefined).length
  },
}))
