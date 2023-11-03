import http from 'node:http'
import { once } from 'node:events'
import { handler } from '../index.js'

const { PORT = 3000 } = process.env

const server = http.createServer(handler)
server.listen(PORT)
await once(server, 'listening')
console.log(`http://127.0.0.1:${PORT}`)
