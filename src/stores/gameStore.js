import { create } from 'zustand'
import { getRandomSeason, resolveSeasonElements } from '../utils/dataQueries'

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

  useWildcard: () => {
    const { wildcards } = get()
    if (wildcards <= 0) return
    set({ wildcards: wildcards - 1, currentCard: null })
    setTimeout(() => get().rollCard(), 300)
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
