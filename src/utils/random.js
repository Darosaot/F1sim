// Small seedable PRNG helpers. Everything random in the game takes an
// `rng` function (() => float in [0, 1)) so runs can be made reproducible
// (daily challenge, tests). Defaults to Math.random.

// mulberry32: fast 32-bit PRNG, good enough for game randomness
export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// djb2 string hash → unsigned 32-bit int
export function hashString(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0
  return h
}

export function seededRng(...parts) {
  return mulberry32(hashString(parts.join('|')))
}

export function between(rng, min, max) {
  return min + rng() * (max - min)
}

// Fisher–Yates: unbiased, unlike sort(() => Math.random() - 0.5)
export function shuffle(items, rng = Math.random) {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
