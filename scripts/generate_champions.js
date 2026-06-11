#!/usr/bin/env node
/**
 * Generates src/data/real_champions.json from f1db:
 * per year → real drivers' champion (name, team, points) and
 * constructors' champion (team, points; from 1958 onwards).
 *
 * Usage: node scripts/generate_champions.js
 */

const fs = require('fs')
const path = require('path')

const F1DB = path.join(__dirname, 'f1db')
const read = f => JSON.parse(fs.readFileSync(path.join(F1DB, f), 'utf8'))

const driverStandings      = read('f1db-seasons-driver-standings.json')
const constructorStandings = read('f1db-seasons-constructor-standings.json')
const drivers              = read('f1db-drivers.json')
const constructors         = read('f1db-constructors.json')
const entrantDrivers       = read('f1db-seasons-entrants-drivers.json')

const driverName      = Object.fromEntries(drivers.map(d => [d.id, d.name]))
const constructorName = Object.fromEntries(constructors.map(c => [c.id, c.name]))

// year+driverId → constructorId (first entrant of the season)
const driverTeam = {}
for (const e of entrantDrivers) {
  const key = `${e.year}_${e.driverId}`
  if (!driverTeam[key]) driverTeam[key] = e.constructorId
}

const champions = {}

for (const s of driverStandings) {
  if (s.positionNumber !== 1) continue
  const team = driverTeam[`${s.year}_${s.driverId}`]
  champions[s.year] = {
    driver: driverName[s.driverId] || s.driverId,
    driverTeam: constructorName[team] || null,
    driverPoints: s.points,
  }
}

for (const s of constructorStandings) {
  if (s.positionNumber !== 1) continue
  if (!champions[s.year]) champions[s.year] = {}
  champions[s.year].constructor = constructorName[s.constructorId] || s.constructorId
  champions[s.year].constructorPoints = s.points
}

const outPath = path.join(__dirname, '../src/data/real_champions.json')
fs.writeFileSync(outPath, JSON.stringify(champions, null, 2))
console.log(`Wrote ${Object.keys(champions).length} years to src/data/real_champions.json`)
console.log('1988:', JSON.stringify(champions[1988]))
console.log('2025:', JSON.stringify(champions[2025]))
