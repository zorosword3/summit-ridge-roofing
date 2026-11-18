# Summit Ridge Roofing - Whop roofing website template

A roofing company website template built with TanStack Start + Vite and deployed with the Whop CLI.

Live demo: https://summitridge-roofing-4821.whop.site

## What it has

- Sections: services, service area, financing callout, reviews/trust, contact
- Checkout popup using Whop Payments Elements (Google Pay, Apple Pay, card form)
- Estimate form that creates a Whop member (see Limitations)
- whop.track events: estimate_requested, service_viewed, deposit_started
- Draft-invoice demo (admin page)

## Edit the template

All business content lives in `src/config.ts`: company name, phone, email, headline, badges, accent color, services, service area, financing text and reviews. Styling is in `src/site.css`.

## Use it for another business

1. Create your own business and three plans on Whop (an inspection, a deposit, a flat-rate service).
2. Open `src/config.ts` and replace `accountId`, the three IDs under `plans`, and `setupCheckout` with your own IDs.
3. Replace the SAMPLE service area and SAMPLE reviews with real ones.

## Secrets

Secrets are set on the deployed app, never in the code. Use `whop apps secrets set` (run `whop apps secrets set --help` for the exact syntax).

- `WHOP_MEMBERS_KEY`: an Account API key with only the "Manage members" permission. Used by the estimate form.
- The invoice demo reads its own secrets; see `src/server/invoices.ts` for the names.

Never commit key values or `.env` files.

## Deploy

```
whop apps deploy
```

## Sample content

The three reviews, the Denver-metro service area, the phone number and the email are SAMPLE content and must be replaced before real use.

## Limitations (honest list)

- The estimate form creates a Whop **member** (POST /members). The Leads endpoint (POST /leads) returns 410 (retired), so the literal Leads API is not used.
- The CLI gives a `whop.site` address, not `whop.app`.
- A completed test checkout was NOT achieved. A test card attempt on the live checkout was declined by Whop's fraud check and no money was taken. There is no sandbox for hosted apps.
- BrandingElement is not mounted separately. CheckoutElement shows "Powered by Whop".
- Card-on-file: a setup checkout exists, but completing it was never tested.
- Final invoice: only a DRAFT invoice exists. There is no "total minus deposit" logic. Sending or charging was never tested.
- Mobile was checked only in Chrome's phone view. Apple Pay and Google Pay were not tested on a real phone.