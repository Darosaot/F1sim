#!/usr/bin/env node
/**
 * Validates src/data against itself (missing references, tyres from the
 * wrong era, approximate engines/chassis/drivers).
 *
 * Usage:
 *   node scripts/validate_data.mjs             # errors + warning summary
 *   node scripts/validate_data.mjs --warnings  # list every warning
 *
 * Exits 1 when there are errors.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { validateData } from '../src/utils/dataValidation.js'

const DATA = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/data')
const load = f => JSON.parse(readFileSync(path.join(DATA, f), 'utf8'))

const { errors, warnings } = validateData({
  seasons:            load('seasons.json'),
  drivers:            load('drivers.json'),
  chassis:            load('chassis.json'),
  engines:            load('engines.json'),
  tires:              load('tires.json'),
  teamPrincipals:     load('team_principals.json'),
  technicalDirectors: load('technical_directors.json'),
})

const byKind = list => list.reduce((acc, x) => ({ ...acc, [x.kind]: (acc[x.kind] || 0) + 1 }), {})

for (const e of errors) console.log(`ERROR  ${e.season}: ${e.msg}`)
if (process.argv.includes('--warnings')) {
  for (const w of warnings) console.log(`warn   ${w.season}: ${w.msg}`)
}
console.log(`\n${errors.length} errors ${JSON.stringify(byKind(errors))}`)
console.log(`${warnings.length} warnings ${JSON.stringify(byKind(warnings))}`)
process.exit(errors.length ? 1 : 0)
