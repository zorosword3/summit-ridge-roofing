import { useEffect, useState } from 'react'
import { WhopElements, Checkout, CheckoutElement } from '@whop/elements-react'
import { loadWhop } from '@whop/elements'
import { CONFIG } from '../config'
import { getElementsToken } from '../server/whop'

export type CheckoutTarget = { title: string; plan?: string; setup?: boolean }

export function track(name: string, props: Record<string, unknown> = {}) {
  try {
    ;(window as any).whop?.track(name, props)
  } catch {}
}

export default function CheckoutModal({ target, onClose }: { target: CheckoutTarget; onClose: () => void }) {
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const [elements] = useState(() => (typeof window === 'undefined' ? null : loadWhop()))

  useEffect(() => {
    getElementsToken()
      .then((r) => setToken(r.token))
      .catch((e) => setError(String(e.message || e)))
  }, [])

  const common = {
    accessToken: token ?? undefined,
    returnUrl: typeof window === 'undefined' ? undefined : window.location.href,
    onComplete: (r: any) =>
      setDone(r.result === 'setup' ? 'Card saved. Nothing was charged.' : 'Payment complete. Thank you!'),
  }

  const planProps = target.setup
    ? { checkoutConfiguration: CONFIG.whop.setupCheckout }
    : { plan: target.plan }

  return (
    <div className="modal on" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{target.title}</h3>

        {done ? <p className="ok">{done}</p> : null}
        {error ? <p className="err">Checkout could not load: {error}</p> : null}
        {!token && !error ? <p className="mute">Loading secure checkout...</p> : null}

        {token && !done && elements ? (
          <WhopElements elements={elements}>
            <p className="mute">
              {target.setup ? 'Save a card for your final balance.' : 'Secure payment powered by Whop.'}
            </p>
            <Checkout {...planProps} {...common}>
              <CheckoutElement />
            </Checkout>
          </WhopElements>
        ) : null}

        <button className="btn ghost" style={{ width: '100%', marginTop: 12 }} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}