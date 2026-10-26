import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGameStore } from '../stores/gameStore'
import { SLOT_KEYS } from '../utils/ratingEngine'

const S = () => useGameStore.getState()

// Pick the first element on the card that fills an open slot
function pickFirst() {
  const card = S().currentCards[0]
  const { team } = S()
  const driverOpen = team.driver1 === undefined || team.driver2 === undefined
  const key = SLOT_KEYS.find(k => card[k] != null && (
    k.startsWith('driver') ? driverOpen : team[k] === undefined
  ))
  S().pickElement(key, card[key])
  vi.runAllTimers()
}

describe('draft', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    S().resetGame()
    S().startGame()
  })

  it('deals exactly one team-season per roll', () => {
    expect(S().currentCards).toHaveLength(1)
    pickFirst()
    expect(S().currentCards).toHaveLength(1)
  })

  it('fills all slots and completes', () => {
    for (let i = 0; i < 40 && S().phase === 'drafting'; i++) pickFirst()
    expect(S().phase).toBe('complete')
    expect(SLOT_KEYS.every(k => S().team[k] !== undefined)).toBe(true)
  })

  it('every dealt card offers something for an open slot', () => {
    for (let i = 0; i < 40 && S().phase === 'drafting'; i++) {
      const card = S().currentCards[0]
      const { team } = S()
      const driverOpen = team.driver1 === undefined || team.driver2 === undefined
      const pickable = SLOT_KEYS.some(k => card[k] != null && (k.startsWith('driver') ? driverOpen : team[k] === undefined))
      expect(pickable).toBe(true)
      pickFirst()
    }
  })

  it('"otra temporada" rerolls one season of the same team and spends a wildcard', () => {
    // Find a card whose team has other seasons available
    for (let i = 0; i < 20; i++) {
      const team = S().currentCards[0].season.team
      const before = S().currentCards[0].season.id
      S().useWildcardSameTeam()
      vi.runAllTimers()
      expect(S().wildcards).toBe(2)
      expect(S().currentCards).toHaveLength(1)
      const now = S().currentCards[0].season
      if (now.team === team) {
        expect(now.id).not.toBe(before)
        return
      }
      // fell back to another team (no other seasons) — try again
      S().resetGame(); S().startGame()
    }
  })
})

describe('daily challenge', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    S().resetGame()
  })

  // Play greedily-first: deterministic given the same rolls
  function playDaily(date) {
    S().startDailyChallenge(date)
    const seen = []
    for (let i = 0; i < 40 && S().phase === 'drafting'; i++) {
      seen.push(S().currentCards[0].season.id)
      pickFirst()
    }
    return seen
  }

  it('deals the same rolls to everyone on the same day', () => {
    const a = playDaily('2026-10-26')
    S().resetGame()
    const b = playDaily('2026-10-26')
    expect(a).toEqual(b)
    expect(S().daily).toBe('2026-10-26')
  })

  it('uses a fixed config per day', () => {
    S().startDailyChallenge('2026-10-26')
    const { era, draftDifficulty, rivalYear } = S()
    S().resetGame()
    S().startDailyChallenge('2026-10-26')
    expect(S()).toMatchObject({ era, draftDifficulty, rivalYear })
  })

  it('a different day deals different rolls', () => {
    const a = playDaily('2026-10-26')
    S().resetGame()
    const b = playDaily('2026-10-27')
    expect(a).not.toEqual(b)
  })

  it('a free game after a daily is not seeded', () => {
    S().startDailyChallenge('2026-10-26')
    S().startGame()
    expect(S().daily).toBe(null)
  })
})

describe('daily challenge settings', () => {
  it('restores the player\'s own settings afterwards', () => {
    vi.useFakeTimers()
    S().resetGame()
    S().setEra('v8'); S().setDraftDifficulty('easy'); S().setRivalYear(1999)
    S().startDailyChallenge('2026-10-26')
    expect(S().era).toBe('all')
    S().resetGame()
    expect(S()).toMatchObject({ era: 'v8', draftDifficulty: 'easy', rivalYear: 1999 })
  })
})
