import { STATUS_CODES } from 'node:http'
import assert from 'node:assert'
import Sentry from '@sentry/node'

const handler = async (req, res, apiKey, fetch) => {
  // The origin is the electron app, which always has this address.
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  const address = req.url.split('/')[1].trim()
  const fetchRes = await fetch(
    `https://public.chainalysis.com/api/v1/address/${address}`,
    {
      headers: {
        'X-API-Key': apiKey,
        accept: 'application/json'
      }
    }
  )
  assert(fetchRes.ok, `Chainalysis API status ${fetchRes.status}`)
  const body = await fetchRes.json()
  res.statusCode = body.identifications.length > 0 ? 403 : 200
  res.end(STATUS_CODES[res.statusCode])
}

export const createHandler = ({
  apiKey,
  fetch = globalThis.fetch,
  log = console.log
}) => (req, res) => {
  const start = new Date()
  log(`${req.method} ${req.url} ...`)
  handler(req, res, apiKey, fetch)
    .catch(err => {
      log(err)
      Sentry.captureException(err)
      res.statusCode = 500
      res.end('Internal Server Error')
    })
    .then(() => {
      log(`${req.method} ${req.url} ${res.statusCode} (${new Date() - start}ms)`)
    })
}
