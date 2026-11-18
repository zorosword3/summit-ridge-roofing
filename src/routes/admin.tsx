
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { createDraftInvoice } from '../server/invoices'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [planKey, setPlanKey] = useState<'inspection' | 'deposit' | 'flatRate'>('inspection')
  const [memo, setMemo] = useState('')
  const [message, setMessage] = useState('')
  const [invoiceId, setInvoiceId] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setInvoiceId('')

    try {
      const result = await createDraftInvoice({
        data: {
          adminPassword: password,
          customerEmail: email,
          planKey,
          memo,
        },
      })

      setMessage(`Draft invoice created. Status: ${result.status}`)
      setInvoiceId(result.invoiceId)
      setPassword('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Invoice creation failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#111827',
      color: '#f9fafb',
      padding: '48px 20px',
      fontFamily: 'Arial, sans-serif',
    }}>
      <section style={{
        maxWidth: 520,
        margin: '0 auto',
        background: '#1f2937',
        border: '1px solid #374151',
        borderRadius: 14,
        padding: 28,
      }}>
        <p style={{ color: '#F2B705', fontWeight: 700, letterSpacing: 2 }}>
          SUMMIT RIDGE ROOFING
        </p>

        <h1>Admin — Draft Invoice</h1>

        <p style={{ color: '#d1d5db', lineHeight: 1.6 }}>
          Create a draft invoice for a customer. This page does not issue,
          email, or charge an invoice.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Admin password</label>
          <input
            style={inputStyle}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <label style={labelStyle}>Customer email</label>
          <input
            style={inputStyle}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label style={labelStyle}>Service</label>
          <select
            style={inputStyle}
            value={planKey}
            onChange={(e) => setPlanKey(e.target.value as typeof planKey)}
          >
            <option value="inspection">Roof inspection — $149</option>
            <option value="deposit">Project deposit — $500</option>
            <option value="flatRate">Gutter cleaning — $189</option>
          </select>

          <label style={labelStyle}>Invoice note (optional)</label>
          <textarea
            style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            maxLength={500}
            placeholder="Add a short description..."
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 14,
              marginTop: 12,
              background: '#F2B705',
              color: '#111827',
              border: 0,
              borderRadius: 8,
              fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? 'Creating draft...' : 'Create draft invoice'}
          </button>
        </form>

        {message && (
          <div role="status" style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 8,
            background: '#111827',
            overflowWrap: 'anywhere',
          }}>
            {message}
            {invoiceId && <p>Invoice ID: {invoiceId}</p>}
          </div>
        )}

        <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 22 }}>
          Draft only. No payment method is attached and no customer charge is made.
        </p>
      </section>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginTop: 18,
  marginBottom: 7,
  fontWeight: 600,
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  padding: 12,
  borderRadius: 7,
  border: '1px solid #4b5563',
  background: '#111827',
  color: '#f9fafb',
  fontSize: 15,
}
