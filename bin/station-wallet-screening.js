import http from 'node:http'
import { once } from 'node:events'
import { createHandler } from '../index.js'
import assert from 'node:assert'
import Sentry from '@sentry/node'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const {
  PORT = 3000,
  CHAINALYSIS_API_KEY,
  SENTRY_ENVIRONMENT = 'development'
} = process.env

const pkg = JSON.parse(
  await fs.readFile(
    fileURLToPath(new URL('../package.json', import.meta.url)),
    'utf8'
  )
)

Sentry.init({
  dsn: 'https://a12a79e133de58d233f796c6ce0a5072@o1408530.ingest.sentry.io/4506173874307072',
  release: pkg.version,
  environment: SENTRY_ENVIRONMENT,
  tracesSampleRate: 0.1
})

assert(CHAINALYSIS_API_KEY, 'CHAINALYSIS_API_KEY must be set via env vars')

const server = http.createServer(createHandler({
  apiKey: CHAINALYSIS_API_KEY
}))
server.listen(PORT)
await once(server, 'listening')
console.log(`http://127.0.0.1:${PORT}`)
