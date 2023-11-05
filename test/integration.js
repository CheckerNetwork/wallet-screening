import { createHandler } from '../index.js'
import http from 'node:http'
import { once } from 'node:events'
import assert from 'node:assert'

const { CHAINALYSIS_API_KEY } = process.env
assert(CHAINALYSIS_API_KEY)

describe('Integration', () => {
  let server
  let port

  before(async () => {
    server = http.createServer(createHandler({
      apiKey: CHAINALYSIS_API_KEY
    }))
    server.listen()
    await once(server, 'listening')
    ;({ port } = server.address())
  })
  after(() => server.close())

  it('allows wallets', async () => {
    const { status } = await fetch(
      `http://127.0.0.1:${port}/0x000000000000000000000000000000000000dEaD`
    )
    assert.strictEqual(status, 200)
  })

  it('disallows wallets', async () => {
    const { status } = await fetch(
      `http://127.0.0.1:${port}/0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a`
    )
    assert.strictEqual(status, 403)
  })
})
