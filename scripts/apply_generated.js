#!/usr/bin/env node
/**
 * Merges generated data into src/data/.
 *
 * Usage:
 *   node scripts/apply_generated.js            # add new entries only
 *   node scripts/apply_generated.js --dry-run  # preview without writing
 *   node scripts/apply_generated.js --overwrite # also update existing entries
 */

const fs = require('fs')
const path = require('path')

const DATA_DIR  = path.join(__dirname, '../src/data')
const GEN_DIR   = path.join(__dirname, 'generated')
const DRY_RUN   = process.argv.includes('--dry-run')
const OVERWRITE = process.argv.includes('--overwrite')

// Original hand-crafted entries — never overwritten even in --overwrite mode
const protectedPath = path.join(__dirname, 'protected_ids.json')
const PROTECTED = fs.existsSync(protectedPath)
  ? JSON.parse(fs.readFileSync(protectedPath, 'utf8'))
  : { drivers: [], chassis: [], engines: [], seasons: [] }

const PROTECTED_BY_FILE = {
  'drivers.json': new Set(PROTECTED.drivers),
  'chassis.json': new Set(PROTECTED.chassis),
  'engines.json': new Set(PROTECTED.engines),
  'seasons.json': new Set(PROTECTED.seasons),
}

if (DRY_RUN)   console.log('DRY RUN — no files will be written\n')
if (OVERWRITE) console.log('OVERWRITE mode — existing entries will be updated\n')

function mergeFile(dataFile, genFile, label) {
  const dataPath = path.join(DATA_DIR, dataFile)
  const genPath  = path.join(GEN_DIR, genFile)

  if (!fs.existsSync(genPath)) {
    console.log(`  ${label}: generated file not found, skipping`)
    return { added: 0, updated: 0, skipped: 0 }
  }

  const existing  = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  const generated = JSON.parse(fs.readFileSync(genPath, 'utf8'))
  const genMap    = new Map(generated.map(e => [e.id, e]))
  const protectedIds = PROTECTED_BY_FILE[dataFile] || new Set()

  let added = 0, updated = 0, skipped = 0

  // Update existing entries if --overwrite (never touch hand-crafted originals)
  const merged = existing.map(e => {
    if (OVERWRITE && genMap.has(e.id) && !protectedIds.has(e.id)) { updated++; return genMap.get(e.id) }
    return e
  })

  // Append new entries
  const existingIds = new Set(existing.map(e => e.id))
  for (const item of generated) {
    if (existingIds.has(item.id)) {
      if (!OVERWRITE) skipped++
    } else {
      merged.push(item)
      added++
    }
  }

  if (!DRY_RUN && (added > 0 || updated > 0)) {
    fs.writeFileSync(dataPath, JSON.stringify(merged, null, 2))
  }

  return { added, updated, skipped }
}

console.log('Applying generated data to src/data/...\n')

const files = [
  ['engines.json', 'new_engines.json', 'Engines'],
  ['drivers.json', 'new_drivers.json', 'Drivers'],
  ['chassis.json', 'new_chassis.json', 'Chassis'],
  ['seasons.json', 'new_seasons.json', 'Seasons'],
]

let totalAdded = 0, totalUpdated = 0
for (const [dataFile, genFile, label] of files) {
  const { added, updated, skipped } = mergeFile(dataFile, genFile, label)
  const parts = [`+${added} added`]
  if (OVERWRITE) parts.push(`~${updated} updated`)
  parts.push(`${skipped} already existed`)
  console.log(`  ${label}: ${parts.join(', ')}`)
  totalAdded   += added
  totalUpdated += updated
}

console.log(`\nTotal: +${totalAdded} added, ~${totalUpdated} updated`)
if (!DRY_RUN && (totalAdded > 0 || totalUpdated > 0)) {
  console.log('Done. Run: npm run build (or npx vite build) to verify.')
}
