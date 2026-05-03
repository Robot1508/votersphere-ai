# VoterSphere 1.0

**Civic education platform for the Maharashtra 2026 bye-elections.**

VoterSphere makes the Indian democratic process tangible — a cinematic 3D voter journey, a tactile EVM simulator, a constitutional AI assistant, and a live leaderboard, all in a single progressive web app.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language | TypeScript 5 |
| 3D Engine | [Three.js](https://threejs.org) via [React Three Fiber 9](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei 10](https://github.com/pmndrs/drei) |
| Animation | [Framer Motion 12](https://www.framer.com/motion/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Database | [PostgreSQL](https://www.postgresql.org) via [pg 8](https://node-postgres.com) |
| AI | Google Gemini API (Neta-GPT constitutional assistant) |
| Testing | [Vitest](https://vitest.dev) + [fast-check](https://fast-check.io) (property-based testing) |
| Deployment | [Vercel](https://vercel.com) |

---

## Design Philosophy — Japanese Minimalism in Civic Tech

VoterSphere draws from the Japanese aesthetic of *ma* (間) — the deliberate use of negative space to give meaning to what is present.

### Colour

A single accent colour, **Voter Red `#E63946`**, carries all interactive weight. It is the colour of the EVM button, the lit path segment, the active milestone, the live ticker badge. Everything else recedes into near-black `#0a0a0c` and white at low opacity. The result is a UI that never competes with the civic content it frames.

### Hanko Seals

Badge icons are styled as *hanko* (判子) — the Japanese personal seal used to authenticate documents. Each badge is a circular stamp with a double-ring border, a bold central glyph, and a parchment-red ink colour. The seal motif reinforces the idea that earning a civic badge is an act of authentication: the user has verified their knowledge.

### Typography

Body text uses Inter for its neutral legibility. The Constitution Reader modal switches to **Crimson Text / Georgia** — a high-contrast serif that evokes official legal documents and slows the reader down, signalling that the text deserves careful attention.

### 3D Space

The Journey scene uses a near-black void (`#050505`) with a 5 500-star field and fog that fades distant milestones. The camera glides along a `CatmullRomCurve3` spline — never teleporting, always lerping. The effect is contemplative rather than gamified: the user is moving through a space, not clicking through a checklist.

---

## Project Structure

```
src/
├── app/
│   ├── api/credits/route.ts   — PostgreSQL-backed civic credits API
│   ├── dashboard/page.tsx     — Live leaderboard + election stats
│   ├── evm/page.tsx           — M3 EVM simulator (spring-physics buttons)
│   ├── journey/page.tsx       — Cinematic 3D voter journey
│   ├── badges/page.tsx        — Hanko-style badge collection
│   └── layout.tsx             — Root layout + PWA metadata
├── components/
│   ├── JourneyScene.tsx       — R3F canvas: CatmullRomCurve3, NeonPath, Stars
│   ├── EVMScene.tsx           — R3F canvas: brushed-metal BallotUnit, VVPAT
│   └── NetaGPT.tsx            — Constitutional AI chat + LiveTicker + ConstitutionReader
├── lib/
│   ├── db.ts                  — pg Pool singleton (globalThis-guarded)
│   ├── credits-core.ts        — Testable credit logic (no pg/Next.js dependency)
│   ├── rate-limit.ts          — Sliding-window rate limiter for /api/credits
│   └── env-check.ts           — Build-time environment variable validation
└── __tests__/
    ├── journey-scroll.test.ts — Properties 1–4 (scrollT, lerp, milestones, material)
    ├── evm-buttons.test.ts    — Properties 5–6 + haptic vibration
    ├── evm-scene.test.ts      — Material constraint assertions
    ├── credits-api.test.ts    — Properties 7, 8, 11 (round-trip, 503, SQL injection)
    └── live-ticker.test.ts    — Property 10 + ART_324/326 fullText
```

---

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (local or hosted — [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app) all work)
- A Google Gemini API key (for Neta-GPT)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

```env
# .env.local

# PostgreSQL connection string (required)
DATABASE_URL=postgresql://user:password@localhost:5432/votersphere

# Google Gemini API key (required for Neta-GPT)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Initialise the database

Run the following SQL against your PostgreSQL instance to create the `civic_credits` table:

```sql
CREATE TABLE IF NOT EXISTS civic_credits (
  id          BIGSERIAL    PRIMARY KEY,
  user_id     TEXT         NOT NULL,
  delta       INTEGER      NOT NULL CHECK (delta > 0 AND delta <= 1000),
  badge       TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_civic_credits_user_id
  ON civic_credits (user_id);
```

You can run this directly via `psql`:

```bash
psql $DATABASE_URL -f schema.sql
```

Or paste it into your database provider's SQL editor.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Run tests

```bash
npm run test
```

48 tests across 5 files — property-based tests (fast-check) + unit tests (Vitest).

### 6. Production build

```bash
npm run build
npm run start
```

The build validates `DATABASE_URL` is set before compiling. A missing variable causes a fatal build error rather than a silent broken deployment.

---

## Key Features

### Cinematic 3D Voter Journey (`/journey`)

- Camera glides along a `CatmullRomCurve3` spline driven by scroll position
- Progressive path lighting: traversed segments glow in Voter Red `#E63946`
- Six frosted-glass milestone orbs (`MeshPhysicalMaterial`, `transmission=0.9`, `ior=1.5`) each housing a floating 3D icon
- 5 500-star field background with atmospheric fog

### Tactile EVM Simulator (`/evm`)

- Spring-physics ballot buttons (`useMotionValue + useSpring`, `stiffness=320`, `damping=14`)
- Haptic feedback via `navigator.vibrate(50)` synchronised with the AudioContext beep
- VVPAT paper slip animation (spring entry, 7-second display, gravity exit)
- Civic Credits awarded per vote, persisted to PostgreSQL under `userId: "robot1508"`

### Neta-GPT Constitutional AI

- Clickable citation cards for Articles 324, 325, 326, 327 and more
- **Constitution Reader modal** — full official text on parchment `#fdfcf7` in Crimson Text serif
- **Live Election Feed ticker** — 6 Maharashtra 2026 bye-election headlines scrolling at 30s/cycle
- Escape key, backdrop click, and close button all dismiss the modal

### Live Leaderboard (`/dashboard`)

- Fetches `robot1508`'s credit total from `/api/credits` on mount — no hardcoded values
- Rate-limited API: max 10 POST requests per userId per minute (sliding window)

---

## API Reference

### `POST /api/credits`

Award civic credits to a user.

**Request body:**
```json
{ "userId": "robot1508", "delta": 10, "badge": null }
```

**Response (200):**
```json
{
  "userId": "robot1508",
  "previousCredits": 20,
  "currentCredits": 30,
  "delta": 10,
  "badgesEarned": []
}
```

**Error responses:**
- `400` — `delta` is not a positive integer ≤ 1000
- `429` — Rate limit exceeded (10 req/min per userId)
- `503` — PostgreSQL unavailable

### `GET /api/credits?userId=robot1508`

Retrieve the current credit total for a user.

**Response (200):**
```json
{ "userId": "robot1508", "credits": 30 }
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the repository in [Vercel](https://vercel.com/new)
3. Add environment variables: `DATABASE_URL`, `GEMINI_API_KEY`
4. Deploy — the build will fail loudly if either required variable is missing

---

## Correctness Properties

The test suite validates 11 formal correctness properties using property-based testing:

| # | Property | Requirement |
|---|---|---|
| 1 | `scrollT` is always in `[0, 1]` | Req 1.2 |
| 2 | Milestone activation threshold is monotonically correct | Req 2.1–2.4 |
| 3 | Frosted-glass material satisfies physical constraints | Req 3.1–3.3 |
| 4 | Camera lerp strictly converges toward target | Req 1.3 |
| 5 | Button spring returns to rest after release | Req 6.2 |
| 6 | Buttons are fully disabled after a vote is cast | Req 6.4 |
| 7 | POST then GET returns accumulated total | Req 12.1–12.3 |
| 8 | Credits API returns 503 on PostgreSQL failure | Req 12.4 |
| 9 | Citation modal lifecycle — open and close | Req 10.1–10.4 |
| 10 | Live Ticker headlines are distinct and sufficient | Req 11.2 |
| 11 | Credits API uses parameterised queries (SQL injection safety) | Req 12.5 |

---

## Licence

MIT — built for civic education. Use freely, attribute kindly.

---

*"Democracy is not a spectator sport."*
