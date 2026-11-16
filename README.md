# Sonder

A guided self-reflection web app. Visitors answer 72 research-backed questions plus a
few questions about their life right now. Sonder writes three free insights, then a full
nine-section report for $1. A printed 90-day journal is coming next.

## Where things live

| What | File |
| --- | --- |
| The 72 assessment statements and answer labels | `lib/questions.ts` |
| Basecamp (life context) questions | `lib/intake.ts` |
| Chapter names and the end-of-chapter "trail markers" | `lib/chapters.ts` |
| AI instructions for the preview and full report | `lib/prompts.ts` |
| Report price | `lib/pricing.ts` |
| AI model | `lib/server/config.ts` (or set `SONDER_MODEL`) |
| Design tokens (colors, type, buttons, glass) | `app/globals.css` |

## Environment variables (set in Vercel)

- `ANTHROPIC_API_KEY`: writes the insights and reports
- `STRIPE_SECRET_KEY`: checkout, payment checks, and the journal waitlist
- `NEXT_PUBLIC_APP_URL` (optional): fallback site address; normally taken from the request
- `SONDER_MODEL` (optional): override the AI model (default `claude-sonnet-5-5`)

## How payment is protected

Every request for a full report is checked on the server against Stripe: the checkout
must be complete, paid, tagged as a Sonder report, under 30 days old, and used fewer than
3 times (the count is stored on the Stripe payment, so no database is needed).

**Free reports for testers:** create a 100%-off promotion code in Stripe
(Products → Coupons). Checkout accepts promo codes.

**Journal waitlist:** sign-ups are saved as Stripe customers with the metadata
`waitlist = journal`. Find them in Stripe → Customers.

## Run it locally

```bash
npm install
SONDER_MOCK=1 npm run dev
```

`SONDER_MOCK=1` swaps the AI and Stripe for sample data so you can click through the
whole flow for free. It only works in development; production ignores it. In development
there's also a "Dev: fill and finish" button on the assessment page.

## The 90-day journal (in progress)

The full design lives in the Sonder project as `journal/journal-blueprint.md`.

- `lib/journal/plan.ts`: the shape of each person's ninety days (twelve kinds of day: practice, question, mirror, dream, four honest days, letter, wild card, strength, savor, best possible self, retake, rest), personalized by their profile; also picks the ten retake statements
- `lib/prompts.ts`: Ember's journal instructions (`JOURNAL_LETTERS_PROMPT`, `JOURNAL_PHASE_PROMPT`), including the gentler book for anyone who may be going through something heavy
- `lib/server/journal/generate.ts`: Ember writes it in four parallel calls (letters + three 30-day stretches), checked against the plan and retried
- `lib/server/journal/pdf.tsx`: print-ready PDFs for Lulu: 236-page 6x9 black-and-white interior (bleed, mirrored margins, embedded fonts from `assets/fonts`, a layout per kind of day, wild cards on black, upside-down notes) and a full-colour wraparound cover
- `lib/server/lulu.ts`: Lulu Print API client (cover size, cost, print job). Not wired in yet. Needs `LULU_CLIENT_KEY`, `LULU_CLIENT_SECRET`, `LULU_ENV`
- Testers can build the real journal from their own climb: a "Build my journal" box appears at the bottom of the report in tester mode (`/api/journal/preview`, about $1–2 of AI per book)
- In development, `/api/dev/journal-sample?part=interior` (or `part=cover`) renders the sample journal
- The sources page at the back of the book (`SOURCES` in `pdf.tsx`) must be re-checked before launch

## Protection against runaway costs

- `lib/server/rateLimit.ts` limits each visitor on the routes that cost money (preview: 20/hour and 40/day per connection, so a family on one wifi is fine) and refuses calls from other websites
- Set a monthly spend limit in the Anthropic console as the hard ceiling
