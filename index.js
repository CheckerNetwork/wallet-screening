import { STATUS_CODES } from 'node:http'

const forbiddenAddresses = new Set([
  '0xFORBIDDEN'
])

export const handler = (req, res) => {
  const address = req.url.split('/')[1].trim()
  res.statusCode = forbiddenAddresses.has(address) ? 403 : 200
  res.end(STATUS_CODES[res.statusCode])
}
