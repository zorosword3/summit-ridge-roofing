import { createServerFn } from '@tanstack/react-start'
import { CONFIG } from '../config'

type InvoiceInput = {
  adminPassword: string
  customerEmail: string
  planKey: 'inspection' | 'deposit' | 'flatRate'
  memo?: string
}

export const createDraftInvoice = createServerFn({ method: 'POST' })
  .validator((data: InvoiceInput) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid invoice request.')
    }

    if (
      !['inspection', 'deposit', 'flatRate'].includes(data.planKey)
    ) {
      throw new Error('Invalid service plan.')
    }

    const email = String(data.customerEmail || '').trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Enter a valid customer email.')
    }

    return {
      adminPassword: String(data.adminPassword || ''),
      customerEmail: email.slice(0, 200),
      planKey: data.planKey,
      memo: String(data.memo || '').slice(0, 500),
    }
  })
  .handler(async ({ data }) => {
    const savedPassword = process.env.INVOICE_ADMIN_PASSWORD

    if (!savedPassword) {
      throw new Error('Invoice administration is not configured.')
    }

    if (data.adminPassword !== savedPassword) {
      throw new Error('Incorrect admin password.')
    }

    const planId = CONFIG.whop.plans[data.planKey]
    const origin = process.env.WHOP_API_ORIGIN || 'https://api.whop.com'

    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'Api-Version-Date': '2026-11-12',
      'idempotency-key': crypto.randomUUID(),
    }
    const invoicesKey = process.env.WHOP_INVOICES_KEY
    if (invoicesKey) {
      headers.authorization = `Bearer ${invoicesKey}`
      headers['x-whop-inject-key'] = 'none'
    } else if (process.env.WHOP_API_KEY) {
      headers.authorization = `Bearer ${process.env.WHOP_API_KEY}`
    }

     const response = await fetch(`${origin}/api/v1/invoices`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        account_id: CONFIG.whop.accountId,
        email_address: data.customerEmail,
        items: [{ variant_id: planId, quantity: 1 }],
        ...(data.memo ? { memo: data.memo } : {}),
      }),
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error('Draft invoice creation failed:', response.status)
      throw new Error(`Whop invoice request failed (${response.status}).`)
    }

    let invoice: any = {}

    try {
      invoice = JSON.parse(responseText)
    } catch {
      throw new Error('Whop returned an unreadable invoice response.')
    }

    return {
      ok: true,
      invoiceId: invoice.id || '',
      status: invoice.status || 'draft',
    }
  })