import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useState } from 'react'
import { CONFIG } from '../config'
import type { CheckoutTarget } from '../components/CheckoutModal'
import { createLead } from '../server/whop'
import '../site.css'

const CheckoutModal = lazy(() => import('../components/CheckoutModal'))
export const Route = createFileRoute('/')({ component: Home })

function track(name: string, props: Record<string, unknown> = {}) {
  try {
    ;(window as any).whop?.track(name, props)
  } catch {}
}


function EstimateForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setState('sending')
    try {
      await createLead({ data: { name: String(f.get('name')), email: String(f.get('email')), phone: String(f.get('phone')), service: String(f.get('service')), details: String(f.get('details')) } })
      track('estimate_requested', { service: String(f.get('service')) })
      setState('done')
    } catch (err: any) {
      setMsg(String(err?.message || err))
      setState('error')
    }
  }
  if (state === 'done') return <p className="ok" role="status">Request received. We will contact you within one business day.</p>
  return (
    <form className="f" onSubmit={onSubmit}>
      <div><label htmlFor="name">Full name</label><input id="name" name="name" required autoComplete="name" /></div>
      <div className="row">
        <div><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
        <div><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" autoComplete="tel" /></div>
      </div>
      <div><label htmlFor="service">Service</label>
        <select id="service" name="service">{CONFIG.services.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
      <div><label htmlFor="details">About your roof</label><input id="details" name="details" placeholder="Address, roof age, what you are seeing" /></div>
      <button className="btn" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending...' : 'Request an estimate'}</button>
      {state === 'error' ? <p className="err" role="alert">Could not send: {msg}</p> : null}
    </form>
  )
}

function Home() {
  const [target, setTarget] = useState<CheckoutTarget | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const open = (t: CheckoutTarget) => {
    if (t.setup || t.title.toLowerCase().includes('deposit')) track('deposit_started', { plan: t.plan ?? 'setup' })
    setTarget(t)
  }
  const plans = CONFIG.whop.plans as Record<string, string>

  return (
    <div style={{ ['--accent' as any]: CONFIG.accent }}>
      <div className="wrap">
        <nav>
          <div className="logo">{CONFIG.company}</div>
          <a className="btn ghost" href="#contact">Contact</a>
        </nav>

        <header className="hero">
          <div>
            <h1>{CONFIG.headline}</h1>
            <p>{CONFIG.tagline}</p>
            <div className="badges">{CONFIG.badges.map((b) => <span key={b}>{b}</span>)}</div>
            <p style={{ marginTop: 26 }}>
              <button className="btn" onClick={() => open({ title: 'Book a roof inspection', plan: plans.inspection })}>Book an inspection</button>
            </p>
          </div>
          <figure className="bp">
            <svg viewBox="0 0 400 250" role="img" aria-label="Roof blueprint">
              <line x1="20" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="2" />
              <rect x="110" y="150" width="180" height="50" fill="none" stroke="currentColor" strokeWidth="2" />
              <polygon points="96,150 200,60 304,150" fill="var(--accent)" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
              <line x1="110" x2="290" y1="222" y2="222" stroke="currentColor" strokeDasharray="4 3" />
            </svg>
            <figcaption>{CONFIG.company}</figcaption>
          </figure>
        </header>

        <section id="services">
          <h2>Services and pricing</h2>
          <p className="sub">Clear prices. Book online in a minute.</p>
          <div className="quote">
            {CONFIG.services.map((s) => (
              <div className="qrow" key={s.id} onMouseEnter={() => track('service_viewed', { service: s.id })}>
                <div><h3>{s.name}</h3><p>{s.blurb}</p></div>
                <div className="price">{s.price}<small>{s.note}</small></div>
                {s.plan ? (
                  <button className="btn ghost" onClick={() => { track('service_viewed', { service: s.id }); open({ title: s.plan === 'deposit' ? 'Project deposit' : s.name, plan: plans[s.plan!] }) }}>
                    {s.plan === 'deposit' ? 'Pay deposit' : 'Book now'}
                  </button>
                ) : <a className="btn ghost" href="#contact">Ask us</a>}
              </div>
            ))}
          </div>
          <p className="mute" style={{ marginTop: 18 }}>
            Replacement jobs: pay the deposit, save a card, and we bill the final balance when the work is done.{' '}
            <button className="link" onClick={() => open({ title: 'Save card for final balance', setup: true })}>Save a card on file</button>
          </p>
        </section>

        <section>
          <h2>How it works</h2>
          <div className="grid steps">
            {[['Estimate', 'Book an inspection and get a written report.'], ['Deposit', 'Lock your crew and start date.'], ['Job', 'We complete the work on schedule.'], ['Final invoice', 'Pay only the remaining balance when done.']].map(([h, p]) => (
              <div className="card" key={h}><h3>{h}</h3><p className="mute">{p}</p></div>
            ))}
          </div>
        </section>

        <section id="area">
          <h2>{CONFIG.serviceArea.title}</h2>
          <p className="sub">{CONFIG.serviceArea.text}</p>
          <div className="badges">{CONFIG.serviceArea.places.map((p) => <span key={p}>{p}</span>)}</div>
        </section>

        <section id="financing">
          <div className="panel"><div><h2>{CONFIG.financing.title}</h2><p className="mute">{CONFIG.financing.text}</p></div></div>
        </section>

        <section id="reviews">
          <h2>What customers say</h2>
          <p className="sub">Sample reviews. Replace with real ones.</p>
          <div className="grid">
            {CONFIG.reviews.map((r) => (<div className="card" key={r.name}><p>{r.text}</p><p className="mute">{r.name}</p></div>))}
          </div>
        </section>

        <section id="estimate">
          <h2>Request an estimate</h2>
          <p className="sub">Tell us about your roof and we will reach out.</p>
          <div className="panel"><EstimateForm /></div>
        </section>

        <section id="contact">
          <h2>Contact</h2>
          <p className="sub">{CONFIG.phone} &middot; {CONFIG.email}</p>
        </section>
        <footer>&copy; {new Date().getFullYear()} {CONFIG.company}</footer>
      </div>

      {mounted && target ? (
        <Suspense fallback={null}><CheckoutModal target={target} onClose={() => setTarget(null)} /></Suspense>
      ) : null}
    </div>
  )
}
