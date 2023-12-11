import { createHandler } from '../index.js'
import http from 'node:http'
import { once } from 'node:events'
import assert from 'node:assert'

const logger = {
  info () {},
  error: console.error,
  request () {}
}

describe('Unit tests', () => {
  let server
  let port

  before(async () => {
    server = http.createServer()
    server.listen()
    await once(server, 'listening')
    ;({ port } = server.address())
  })
  after(() => server.close())

  it('allows wallets', async () => {
    const fetchCalls = []
    server.once('request', createHandler({
      async fetch (url, opts) {
        fetchCalls.push({ url, opts })
        return {
          ok: true,
          status: 200,
          json: async () => ({ identifications: [] })
        }
      },
      logger
    }))

    const { status } = await fetch(`http://127.0.0.1:${port}/0xADDRESS`)
    assert.strictEqual(status, 200)

    assert.deepStrictEqual(fetchCalls, [{
      url: 'https://public.chainalysis.com/api/v1/address/0xADDRESS',
      opts: {
        headers: {
          'X-API-Key': undefined,
          accept: 'application/json'
        }
      }
    }])
  })

  it('disallows wallets', async () => {
    const fetchCalls = []
    server.once('request', createHandler({
      async fetch (url, opts) {
        fetchCalls.push({ url, opts })
        return {
          ok: true,
          status: 200,
          json: async () => ({ identifications: [{}] })
        }
      },
      logger
    }))

    const { status } = await fetch(`http://127.0.0.1:${port}/0xADDRESS`)
    assert.strictEqual(status, 403)

    assert.deepStrictEqual(fetchCalls, [{
      url: 'https://public.chainalysis.com/api/v1/address/0xADDRESS',
      opts: {
        headers: {
          'X-API-Key': undefined,
          accept: 'application/json'
        }
      }
    }])
  })

  it('handles API failures', async () => {
    const fetchCalls = []
    server.once('request', createHandler({
      async fetch (url, opts) {
        fetchCalls.push({ url, opts })
        return {
          ok: false,
          status: 500
        }
      },
      logger: {
        ...logger,
        error () {}
      }
    }))

    const { status } = await fetch(`http://127.0.0.1:${port}/0xADDRESS`)
    assert.strictEqual(status, 500)

    assert.deepStrictEqual(fetchCalls, [{
      url: 'https://public.chainalysis.com/api/v1/address/0xADDRESS',
      opts: {
        headers: {
          'X-API-Key': undefined,
          accept: 'application/json'
        }
      }
    }])
  })
})
