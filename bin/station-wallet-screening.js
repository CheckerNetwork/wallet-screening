import http from 'node:http'
import { once } from 'node:events'
import { createHandler } from '../index.js'
import assert from 'node:assert'

const {
  PORT = 3000,
  CHAINALYSIS_API_KEY
} = process.env
assert(CHAINALYSIS_API_KEY)

const server = http.createServer(createHandler({
  apiKey: CHAINALYSIS_API_KEY
}))
server.listen(PORT)
await once(server, 'listening')
console.log(`http://127.0.0.1:${PORT}`)
