#!/usr/bin/env node
/**
 * F1 Data Pipeline — fetches from Jolpica API, generates game JSON
 *
 * Usage:
 *   node scripts/fetch_f1_data.js                   # all years 1950-2024
 *   node scripts/fetch_f1_data.js --from 2010 --to 2024
 *   node scripts/fetch_f1_data.js --year 2023
 *   node scripts/fetch_f1_data.js --clear-cache     # delete cached API responses
 *
 * Output: scripts/generated/{seasons,drivers,chassis,engines}.json
 * Then run: node scripts/apply_generated.js
 */

const fs = require('fs')
const path = require('path')
const { getConstructorStandings, getDriverStandings, getRaceResults } = require('./lib/api')
const { processYear } = require('./lib/transform')

const DATA_DIR = path.join(__dirname, '../src/data')
const GEN_DIR = path.join(__dirname, 'generated')
const CACHE_DIR = path.join(__dirname, '.cache')

fs.mkdirSync(GEN_DIR, { recursive: true })

// Parse CLI args
const args = process.argv.slice(2)
if (args.includes('--clear-cache')) {
  fs.rmSync(CACHE_DIR, { recursive: true, force: true })
  console.log('Cache cleared.')
  if (args.length === 1) process.exit(0)
}

let fromYear = 1950, toYear = 2024
const yearIdx = args.indexOf('--year')
if (yearIdx !== -1) { fromYear = toYear = parseInt(args[yearIdx + 1]) }
const fromIdx = args.indexOf('--from')
if (fromIdx !== -1) fromYear = parseInt(args[fromIdx + 1])
const toIdx = args.indexOf('--to')
if (toIdx !== -1) toYear = parseInt(args[toIdx + 1])

console.log(`Fetching F1 data for years ${fromYear}–${toYear}...`)

// Load existing IDs for deduplication
function loadIds(file) {
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'))
  return new Set(data.map(d => d.id))
}

const existingIds = {
  seasons:  loadIds('seasons.json'),
  drivers:  loadIds('drivers.json'),
  chassis:  loadIds('chassis.json'),
  engines:  loadIds('engines.json'),
}

async function main() {
  const result = { seasons: [], drivers: [], chassis: [], engines: [] }
  const years = []
  for (let y = fromYear; y <= toYear; y++) years.push(y)

  let processed = 0, skipped = 0, errors = 0

  for (const year of years) {
    process.stdout.write(`  ${year}... `)
    try {
      // Sequential requests to respect API rate limit
      const standings = await getConstructorStandings(year)
      const driverStandings = await getDriverStandings(year)
      const races = await getRaceResults(year)

      if (!standings.length) {
        console.log('no data')
        skipped++
        continue
      }

      const yearResult = processYear(year, standings, driverStandings, races, existingIds)

      result.seasons.push(...yearResult.seasons)
      result.drivers.push(...yearResult.drivers)
      result.chassis.push(...yearResult.chassis)
      result.engines.push(...yearResult.engines)

      const newCount = yearResult.seasons.length
      const skippedCount = standings.length - newCount
      console.log(`${newCount} new seasons (${skippedCount} existing)`)
      processed++
    } catch (err) {
      console.log(`ERROR: ${err.message}`)
      errors++
    }
  }

  // Write output files
  for (const [key, data] of Object.entries(result)) {
    const file = path.join(GEN_DIR, `new_${key}.json`)
    fs.writeFileSync(file, JSON.stringify(data, null, 2))
  }

  // Summary
  console.log('\n=== Generated ===')
  console.log(`  Seasons:  ${result.seasons.length}`)
  console.log(`  Drivers:  ${result.drivers.length}`)
  console.log(`  Chassis:  ${result.chassis.length}`)
  console.log(`  Engines:  ${result.engines.length}`)
  console.log(`  Years processed: ${processed} / ${years.length} (${errors} errors)`)
  console.log('\nRun: node scripts/apply_generated.js')
}

main().catch(err => { console.error(err); process.exit(1) })
