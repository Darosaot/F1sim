#!/usr/bin/env node
/**
 * Merges generated data into src/data/ — no overwrites, only additions.
 *
 * Usage: node scripts/apply_generated.js [--dry-run]
 */

const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '../src/data')
const GEN_DIR = path.join(__dirname, 'generated')
const DRY_RUN = process.argv.includes('--dry-run')

if (DRY_RUN) console.log('DRY RUN — no files will be written\n')

function mergeFile(dataFile, genFile, label) {
  const dataPath = path.join(DATA_DIR, dataFile)
  const genPath = path.join(GEN_DIR, genFile)

  if (!fs.existsSync(genPath)) {
    console.log(`  ${label}: generated file not found, skipping`)
    return { added: 0, skipped: 0 }
  }

  const existing = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  const generated = JSON.parse(fs.readFileSync(genPath, 'utf8'))

  const existingIds = new Set(existing.map(e => e.id))

  let added = 0, skipped = 0
  const toAdd = []
  for (const item of generated) {
    if (existingIds.has(item.id)) { skipped++; continue }
    toAdd.push(item)
    added++
  }

  if (!DRY_RUN && toAdd.length > 0) {
    const merged = [...existing, ...toAdd]
    fs.writeFileSync(dataPath, JSON.stringify(merged, null, 2))
  }

  return { added, skipped }
}

console.log('Applying generated data to src/data/...\n')

const files = [
  ['engines.json',         'new_engines.json',  'Engines'],
  ['drivers.json',         'new_drivers.json',  'Drivers'],
  ['chassis.json',         'new_chassis.json',  'Chassis'],
  ['seasons.json',         'new_seasons.json',  'Seasons'],
]

let totalAdded = 0
for (const [dataFile, genFile, label] of files) {
  const { added, skipped } = mergeFile(dataFile, genFile, label)
  console.log(`  ${label}: +${added} added, ${skipped} already existed`)
  totalAdded += added
}

console.log(`\nTotal entries added: ${totalAdded}`)
if (!DRY_RUN && totalAdded > 0) {
  console.log('Done. Run: npm run build (or npx vite build) to verify.')
}
