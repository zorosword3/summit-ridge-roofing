import { createServerFn } from '@tanstack/react-start'
import { CONFIG } from '../config'

// Mints a short-lived token for Whop Elements. The API key never reaches the browser:
// on Whop hosting the outbound proxy attaches it; locally `whop apps dev` provides it.
export const getElementsToken = createServerFn({ method: 'POST' }).handler(async () => {
  const origin = process.env.WHOP_API_ORIGIN || 'https://api.whop.com'
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (process.env.WHOP_API_KEY) headers.authorization = `Bearer ${process.env.WHOP_API_KEY}`
  const res = await fetch(`${origin}/api/v1/access_tokens`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ company_id: CONFIG.whop.accountId }),
  })
  if (!res.ok) throw new Error(`Token request failed: ${res.status}`)
  const data: any = await res.json()
  const token = data.token ?? data.access_token
  if (!token) throw new Error('Token missing in response')
  return { token: String(token) }
})

export type LeadInput = { name: string; email: string; phone: string; service: string; details: string }

// "Request an Estimate" handler. Whop retired POST /leads (410 Gone), so the person is added to the
// business as a Whop MEMBER with POST /members (email + name + metadata). It appears under Customers.
// POST /members needs the member:manage permission. Set an app secret named WHOP_MEMBERS_KEY holding an
// Account API key with only that permission; the header x-whop-inject-key: none stops Whop's outbound
// proxy from replacing it with the app's own key. Without the secret, the proxy's key is used.
export const createLead = createServerFn({ method: 'POST' })
  .validator((d: LeadInput) => d)
  .handler(async ({ data }) => {
    const origin = process.env.WHOP_API_ORIGIN || 'https://api.whop.com'
    const headers: Record<string, string> = { 'content-type': 'application/json' }
    const ownKey = process.env.WHOP_MEMBERS_KEY
    if (ownKey) {
      headers.authorization = `Bearer ${ownKey}`
      headers['x-whop-inject-key'] = 'none'
    }
    const post = (body: unknown) =>
      fetch(`${origin}/api/v1/members`, { method: 'POST', headers: { ...headers, 'Api-Version-Date': '2026-11-12' }, body: JSON.stringify(body) })
    const meta = {
      phone: String(data.phone).slice(0, 40),
      service: String(data.service).slice(0, 80),
      details: String(data.details).slice(0, 400),
      source: 'estimate_form',
    }
    const base = { account_id: CONFIG.whop.accountId, email: String(data.email).slice(0, 200), name: String(data.name).slice(0, 120) }
    let res = await post({ ...base, metadata: meta })
    if (res.status === 400 || res.status === 422) res = await post(base) // metadata not accepted: retry without it
    const text = await res.text()
    if (!res.ok) {
      // Log only the status server-side; show visitors a plain message.
      console.error(`createLead failed: status=${res.status}`)
      throw new Error('We could not send your request. Please call us or try again.')
    }
    let id = ''
    try { id = JSON.parse(text).id } catch {}
    return { ok: true, id }
  })