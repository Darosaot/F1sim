// Jolpica F1 API client — sequential requests, disk cache, retry with backoff
const https = require('https')
const fs = require('fs')
const path = require('path')

const BASE = 'https://api.jolpi.ca/ergast/f1'
const CACHE_DIR = path.join(__dirname, '../.cache')
const MIN_INTERVAL_MS = 400  // global rate limit: max ~2.5 req/s (API allows 4/s)

fs.mkdirSync(CACHE_DIR, { recursive: true })

let lastRequest = 0

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function cacheFile(url) {
  return path.join(CACHE_DIR, Buffer.from(url).toString('base64').replace(/\//g, '_') + '.json')
}

async function rateLimitWait() {
  const elapsed = Date.now() - lastRequest
  if (elapsed < MIN_INTERVAL_MS) await sleep(MIN_INTERVAL_MS - elapsed)
  lastRequest = Date.now()
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let raw = ''
      res.on('data', c => raw += c)
      res.on('end', () => {
        if (!raw.startsWith('{') && !raw.startsWith('[')) {
          reject(new Error(`Non-JSON response (HTTP ${res.statusCode})`))
          return
        }
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }) }
        catch (e) { reject(new Error(`JSON parse error: ${e.message}`)) }
      })
    }).on('error', reject)
  })
}

async function get(url) {
  const file = cacheFile(url)

  // Use cache if valid
  if (fs.existsSync(file)) {
    const cached = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (cached && typeof cached === 'object') return cached
    fs.unlinkSync(file) // delete bad cache
  }

  // Fetch with retry
  for (let attempt = 1; attempt <= 4; attempt++) {
    await rateLimitWait()
    try {
      const { status, body } = await httpGet(url)
      if (status === 429) {
        const wait = attempt * 2000
        process.stdout.write(`[rate limited, waiting ${wait/1000}s] `)
        await sleep(wait)
        continue
      }
      fs.writeFileSync(file, JSON.stringify(body))
      return body
    } catch (err) {
      if (attempt === 4) throw err
      await sleep(attempt * 1000)
    }
  }
}

// Sequential helpers — never concurrent
async function getConstructorStandings(year) {
  const d = await get(`${BASE}/${year}/constructorstandings.json?limit=100`)
  const lists = d?.MRData?.StandingsTable?.StandingsLists
  return lists?.length ? lists[0].ConstructorStandings || [] : []
}

async function getDriverStandings(year) {
  const d = await get(`${BASE}/${year}/driverstandings.json?limit=100`)
  const lists = d?.MRData?.StandingsTable?.StandingsLists
  return lists?.length ? lists[0].DriverStandings || [] : []
}

async function getRaceResults(year) {
  const d = await get(`${BASE}/${year}/results.json?limit=500`)
  return d?.MRData?.RaceTable?.Races || []
}

module.exports = { getConstructorStandings, getDriverStandings, getRaceResults }
