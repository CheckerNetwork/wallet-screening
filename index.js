import { STATUS_CODES } from 'node:http'
import assert from 'node:assert'
import Sentry from '@sentry/node'

/**
 *
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {string} apiKey
 * @param {typeof fetch} fetch
 */
const handler = async (req, res, apiKey, fetch) => {
  // The origin is the electron app. The origin depends on how we run the app.
  //   - via `npm start` -> origin is http://localhost:3000
  //   - packaged -> origin is app://-
  // Unfortunately, Access-Control-Allow-Origin supports only a single value (single origin)
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
  // > Only a single origin can be specified. If the server supports clients from multiple origins,
  // > it must return the origin for the specific client making the request.
  console.log('origin:', req.headers.origin)
  if (req.headers.origin === 'http://localhost:3000') {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'app://-')
  }

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
