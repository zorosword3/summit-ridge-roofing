// ===== TEMPLATE CONFIG: edit this file to rebrand for another roofing company =====
export const CONFIG = {
  company: 'Summit Ridge Roofing',
  phone: '(555) 010-0148',
  email: 'hello@example.com',
  headline: 'Know your roof, book your crew, pay the balance when it is done.',
  tagline:
    'Licensed, insured crews. Book an inspection online, lock your start date with a deposit, and get one final invoice when the job is finished.',
  badges: ['Licensed and insured', '10-year workmanship warranty', 'Same-week inspections'],
  accent: '#F2B705',

  // Whop IDs (from the CLI). Swap these when you create plans for a new business.
  whop: {
    accountId: 'biz_dsHpyEs7z70VRq',
    environment: 'production' as 'production' | 'sandbox',
    plans: {
      inspection: 'plan_Vm8Cy6pPHPtS5', // $149
      deposit: 'plan_pSZM35XUub5Q4', // $500
      flatRate: 'plan_rAzmk0tlGSnrI', // $189
    },
    setupCheckout: 'ch_2s9la1sPvsrkYyv', // saves a card, charges nothing
  },

  // Display prices (the real price always comes from the Whop plan)
  services: [
    { id: 'inspection', name: 'Roof inspection', price: '$149', note: 'Written report with photos', plan: 'inspection', blurb: 'A licensed inspector checks shingles, flashing, gutters and decking.' },
    { id: 'repair', name: 'Leak and storm repair', price: 'Quote', note: 'Priced after inspection', plan: null, blurb: 'Fast diagnosis and a lasting fix. Book the inspection first.' },
    { id: 'replacement', name: 'Full roof replacement', price: '$500 deposit', note: 'Balance billed when finished', plan: 'deposit', blurb: 'Tear-off, underlayment and new shingles. A deposit reserves your crew.' },
    { id: 'gutters', name: 'Gutter cleaning and flush', price: '$189', note: 'Flat rate, standard home', plan: 'flatRate', blurb: 'Every gutter run cleared, downspouts flushed, leaks checked.' },
  ],

  // SAMPLE service area: replace with the real towns the company covers
  serviceArea: {
    title: 'Where we work',
    text: 'We serve the Denver metro area and nearby suburbs. Not sure if you are covered? Ask us.',
    places: ['Denver', 'Aurora', 'Lakewood', 'Arvada', 'Littleton', 'Westminster'],
  },

  financing: {
    title: 'Pay over time',
    text: 'Eligible orders may show monthly payment options such as Klarna, Afterpay or Splitit at checkout, depending on location and approval.',
  },

  // SAMPLE reviews: replace with real customer reviews before going live
  reviews: [
    { name: 'Sample customer, Aurora', text: 'They found the leak in one visit and sent photos of everything they fixed.' },
    { name: 'Sample customer, Lakewood', text: 'The deposit locked in our start date, and the final invoice matched the quote.' },
    { name: 'Sample customer, Arvada', text: 'The crew was on time and the yard was spotless when they left.' },
  ],
}