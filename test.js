import { handler } from './index.js'
import http from 'node:http'
import { once } from 'node:events'
import assert from 'node:assert'

const server = http.createServer(handler)
server.listen()
await once(server, 'listening')
const { port } = server.address()

{
  const { status } = await fetch(`http://127.0.0.1:${port}/0xALLOWED`)
  assert.strictEqual(status, 200)
}

{
  const { status } = await fetch(`http://127.0.0.1:${port}/0xFORBIDDEN`)
  assert.strictEqual(status, 403)
}

server.close()
console.log('OK')
