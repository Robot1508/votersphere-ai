# Implementation Plan: VoterSphere 1.0 — Final Polish & Spatial UX

## Overview

Four sequential phases: (1) cinematic 3D journey overhaul in `JourneyScene.tsx`, (2) tactile EVM physicality in `evm/page.tsx` and `EVMScene.tsx`, (3) logic & RAG persistence across `NetaGPT.tsx`, `/api/credits`, `db.ts`, and `dashboard/page.tsx`, and (4) build verification. Each phase wires its changes into the running app before moving on. Testing uses **vitest** + **fast-check**; the test framework must be installed before any test sub-tasks are attempted.

---

## Tasks

- [x] 1. Install test dependencies and configure vitest
  - Run `npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths fast-check`
  - Create `vitest.config.mts` at the workspace root with `@vitejs/plugin-react`, `vite-tsconfig-paths`, and `environment: 'jsdom'`
  - Add `"test": "vitest --run"` to the `scripts` block in `package.json` (use `--run` for single-pass execution, not watch mode)
  - Create `src/__tests__/` directory by adding a `.gitkeep` placeholder
  - _Requirements: all — prerequisite for all test sub-tasks_

---

## Phase 1 — 3D Scene Overhaul

- [x] 2. Refine `JourneyScene.tsx` — CatmullRomCurve3 camera path
  - [x] 2.1 Harden `ScrollCamera` with defensive clamp and correct curve tension
    - Ensure `cameraPathCurve` uses entry/exit padding points and `tension = 0.5` as specified in the design
    - Ensure `lookAtCurve` uses raw milestone positions only (6 control points)
    - In `useFrame`, clamp `scrollT` with `Math.max(0, Math.min(1, scrollT))` before calling `getPointAt`
    - Confirm lerp smoothing factor is exactly `0.08`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 2.2 Write property test — scrollT normalisation (Property 1)
    - Create `src/__tests__/journey-scroll.test.ts`
    - Extract `computeScrollT` as a pure function and import it (or inline it in the test)
    - **Property 1: scrollT is always normalised to [0, 1]**
    - **Validates: Requirement 1.2**
    - Use `fc.integer` for `scrollTop`, `clientHeight`, and `extra` scroll room; assert `t >= 0 && t <= 1` for 100 runs

  - [ ] 2.3 Write property test — camera lerp convergence (Property 4)
    - Add to `src/__tests__/journey-scroll.test.ts`
    - **Property 4: Camera lerp strictly converges toward target**
    - **Validates: Requirement 1.3**
    - Use `fc.tuple(fc.float(...), ...)` for position and target vectors; assert `distAfter < distBefore` when `distBefore > 1e-6`

- [x] 3. Refine `JourneyScene.tsx` — Progressive Path Lighting (`NeonPath`)
  - [x] 3.1 Implement `NeonPath` with 120-point resolution and point-light bloom substitute
    - Ensure `allPoints = pathCurve.getPoints(120)` (not 100)
    - Slice `activePoints = allPoints.slice(0, activeCount + 1)` where `activeCount = Math.floor(scrollT * allPoints.length)`
    - Render dim base line (`color="#1a1a2e"`, `opacity=0.35`, `transparent`) always
    - Render active red line (`color="#E63946"`) only when `activeCount > 0`
    - Place `pointLight` nodes every 20 points along `activePoints` (`intensity=0.6`, `distance=1.5`, `decay=2`)
    - When `scrollT = 0`, no red segment and no point lights are rendered
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 3.2 Write property test — milestone activation threshold (Property 2)
    - Add to `src/__tests__/journey-scroll.test.ts`
    - **Property 2: Milestone activation threshold is monotonically correct**
    - **Validates: Requirements 2.1, 2.2, 2.4**
    - Use `fc.integer({ min: 0, max: 5 })` and `fc.float({ min: 0, max: 1, noNaN: true })`; assert `isActive === (scrollT >= index / 5)`

- [x] 4. Refine `JourneyScene.tsx` — Frosted-glass milestone nodes
  - [x] 4.1 Verify and tighten `FrostedMilestone` material and `Float` wrapper
    - Confirm `MeshPhysicalMaterial` props: `transmission={0.9}`, `roughness={0.1}`, `clearcoat={1}`, `ior={1.5}`
    - Confirm `color` switches to `"#E63946"` when `isActive` and `"#ffffff"` when inactive
    - Confirm each milestone is wrapped in `<Float speed={2} rotationIntensity={0.4} floatIntensity={0.5}>` from `@react-three/drei`
    - Remove the duplicate manual `useFrame` float animation that conflicts with `<Float>` (the `meshRef.current.position.y = ...` line inside `FrostedMilestone`)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 4.2 Write unit test — frosted-glass material constraints (Property 3)
    - Add to `src/__tests__/journey-scroll.test.ts`
    - **Property 3: Active milestone material satisfies all physical constraints**
    - **Validates: Requirements 3.1, 3.2, 3.3**
    - Assert the static material config object: `transmission >= 0.85`, `clearcoat === 1`, `roughness <= 0.15`, `ior === 1.5`
    - Assert `color` is `"#E63946"` when `isActive = true` and `"#ffffff"` when `isActive = false`

- [x] 5. Refine `JourneyScene.tsx` — Floating 3D icons and starfield
  - [x] 5.1 Complete `MilestoneIcon` for all six milestones
    - `"pen"` (Form 6): `CylinderGeometry` body + `ConeGeometry` tip — already implemented; verify positioning at `[0, 0, 0]`
    - `"search"` (NVSP Verify): `TorusGeometry` ring + `CylinderGeometry` handle
    - `"card"` (EPIC Card): `BoxGeometry` flat rect + `PlaneGeometry` stripe
    - `"booth"` (Polling Booth): `TorusGeometry` half-arc + `BoxGeometry` pillars
    - `"finger"` (Cast Vote): `CapsuleGeometry` + `BoxGeometry` ink mark — already implemented; verify
    - `"receipt"` (VVPAT Receipt): `PlaneGeometry` + `LineSegments` dashes
    - All icons use `meshStandardMaterial` with `color="gold"` or `color="#fcd34d"` and are positioned at `[0, 0, 0]` inside their milestone group
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 5.2 Verify starfield and fog configuration
    - Confirm `<Stars radius={120} depth={60} count={5500} factor={4} saturation={0} fade speed={0.8} />` (radius ≥ 100, count ≥ 5000, fade enabled)
    - Confirm `<color attach="background" args={["#050505"]} />`
    - Confirm `<fog attach="fog" args={["#050505", 8, 22]} />` (near=8, far=22)
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 6. Checkpoint — Phase 1 complete
  - Ensure all tests pass, ask the user if questions arise.

---

## Phase 2 — Tactile Physicality

- [x] 7. Update `evm/page.tsx` — spring-physics ballot buttons
  - [x] 7.1 Refactor ballot buttons to use `useMotionValue` + `useSpring`
    - Extract a `BallotButton` component (or inline per-button logic) that owns a `useMotionValue(0)` for `y` and a `useSpring(y, { stiffness: 320, damping: 14 })`
    - On `onPointerDown`: if `voted !== null` return early; otherwise call `y.set(5)` (4–6 px depression)
    - On `onPointerUp` and `onPointerLeave`: call `y.set(0)`
    - Apply `style={{ y: springY }}` to the `<motion.button>` element
    - Set `disabled={voted !== null}` on the button element
    - Remove the existing `whileTap` spring animation from the button (replaced by `useMotionValue` approach)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 7.2 Write unit test — button spring config and disabled state (Property 5 & 6)
    - Create `src/__tests__/evm-buttons.test.ts`
    - **Property 5: Button spring returns to rest after release**
    - **Validates: Requirement 6.2**
    - Assert that after `onPointerUp` the target `y` motion value is `0`
    - **Property 6: Buttons are fully disabled after a vote is cast**
    - **Validates: Requirement 6.4**
    - Assert `disabled = true` when `voted !== null`; assert `handlePointerDown` guard prevents `y.set` when `voted !== null`

- [x] 8. Update `evm/page.tsx` — haptic vibration synchronised with beep
  - [x] 8.1 Move `navigator.vibrate(50)` into `handleVote` synchronously with `playBeep()`
    - In `handleVote`, call `playBeep()` first, then immediately call `navigator.vibrate(50)` in the same synchronous frame
    - Guard with `typeof navigator !== "undefined" && "vibrate" in navigator` to handle SSR and unsupported browsers
    - Ensure `navigator.vibrate` is called at most once per vote (the existing `if (voted) return` guard at the top of `handleVote` prevents re-entry)
    - The current code already has this pattern; verify it matches the design spec exactly
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 8.2 Write unit test — vibrate call count and guard
    - Add to `src/__tests__/evm-buttons.test.ts`
    - Mock `navigator.vibrate` with `vi.fn()`
    - Assert it is called exactly once when a vote is cast
    - Assert it is not called when `voted !== null` (double-vote prevention)
    - Assert no exception is thrown when `navigator.vibrate` is absent

- [x] 9. Update `EVMScene.tsx` — brushed-metal and VVPAT materials
  - [x] 9.1 Apply brushed-metal material to `BallotUnit` body
    - On the `RoundedBox` inside `BallotUnit`, set `meshStandardMaterial` props: `color="#d1d5db"`, `metalness={0.88}`, `roughness={0.38}`
    - The current code has `metalness={0.9}` and `roughness={0.2}`; update to match design spec values (metalness ≥ 0.85 ✓, roughness 0.3–0.5 ✓)
    - _Requirements: 8.1, 8.2_

  - [x] 9.2 Apply scratched-plastic material to VVPAT window
    - On the `planeGeometry` mesh inside `VVPATUnit`, set `meshPhysicalMaterial` props: `roughness={0.6}`, `transmission={0.45}`, `clearcoat={0.1}`
    - The current code already has `roughness={0.6}` and `clearcoat={0.1}`; verify `transmission={0.45}` (≤ 0.5 ✓) and `opacity={0.85}`
    - _Requirements: 9.1, 9.2_

  - [ ] 9.3 Write unit test — EVMScene material property assertions
    - Create `src/__tests__/evm-scene.test.ts`
    - Import the static material config constants (or extract them) and assert:
      - BallotUnit: `metalness >= 0.85`, `roughness` in `[0.3, 0.5]`, `color === "#d1d5db"`
      - VVPAT window: `roughness >= 0.55`, `transmission <= 0.5`, `clearcoat <= 0.15`
    - _Requirements: 8.1, 9.1, 9.2_

- [x] 10. Checkpoint — Phase 2 complete
  - Ensure all tests pass, ask the user if questions arise.

---

## Phase 3 — Logic & RAG Persistence

- [x] 11. Create `src/lib/db.ts` — pg Pool singleton
  - Create `src/lib/db.ts` with a `globalThis`-guarded `Pool` singleton
  - Pool config: `connectionString: process.env.DATABASE_URL`, `max: 10`, `idleTimeoutMillis: 30_000`, `connectionTimeoutMillis: 5_000`
  - Export `pool` as a named export
  - In development (`NODE_ENV !== "production"`), attach the pool to `globalForPg.pgPool` to survive hot-reloads without exhausting connections
  - _Requirements: 12.1, 12.2, 12.5_

- [x] 12. Update `src/app/api/credits/route.ts` — PostgreSQL persistence
  - [x] 12.1 Replace in-memory `Map` with PostgreSQL via `pool` from `src/lib/db.ts`
    - Remove the `memoryStore: Map<string, number>` declaration entirely
    - Import `pool` from `@/lib/db`
    - In `POST`: acquire `client = await pool.connect()`, run parameterised `INSERT INTO civic_credits (user_id, delta, badge, created_at) VALUES ($1, $2, $3, NOW())`, then `SELECT COALESCE(SUM(delta), 0)::text AS total FROM civic_credits WHERE user_id = $1` for badge threshold logic; release client in `finally`
    - In `GET`: acquire client, run `SELECT COALESCE(SUM(delta), 0)::text AS total FROM civic_credits WHERE user_id = $1`, release in `finally`
    - On any `pool.connect()` or `client.query()` error, return `NextResponse.json({ error: "Database unavailable" }, { status: 503 })`
    - Validate `delta`: reject with `400` if not a number, `<= 0`, or `> 1000` (note: the existing code allows `delta = 0`; tighten to `delta <= 0` per design)
    - No string interpolation of user-supplied values — all user values go through `$1`, `$2`, `$3` placeholders
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ] 12.2 Write property test — credits API round-trip with pg mock (Property 7)
    - Create `src/__tests__/credits-api.test.ts`
    - Extract `postCreditsWithPool` and `getCreditsWithPool` as testable functions that accept a pool argument
    - **Property 7: POST then GET returns accumulated total**
    - **Validates: Requirements 12.1, 12.2, 12.3**
    - Use `fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 1, maxLength: 20 })` for delta sequences; mock `pool.connect()` with an in-memory accumulator; assert `total === deltas.reduce((a, b) => a + b, 0)`

  - [ ] 12.3 Write property test — SQL injection safety (Property 11)
    - Add to `src/__tests__/credits-api.test.ts`
    - **Property 11: Credits API uses parameterised queries — no SQL injection**
    - **Validates: Requirement 12.5**
    - Use `fc.string({ minLength: 1 })` for arbitrary `userId` values including injection payloads
    - Capture all SQL strings passed to `client.query`; assert none contain the raw `userId` value

  - [ ] 12.4 Write unit tests — 400/503 error responses
    - Add to `src/__tests__/credits-api.test.ts`
    - Assert `POST` with `delta = -1` returns `400`
    - Assert `POST` with `delta = 1001` returns `400`
    - Assert `POST` with `delta = 0` returns `400`
    - Assert `POST` when `pool.connect()` throws returns `503`
    - Assert `GET` when `pool.connect()` throws returns `503`
    - _Requirements: 12.4_

- [x] 13. Update `NetaGPT.tsx` — Live Election News Ticker
  - [x] 13.1 Expand `mockHeadlines` to six distinct entries and verify `LiveTicker` animation config
    - Ensure `mockHeadlines` has at least 6 entries (currently 5; add the sixth: `"Model Code of Conduct lifted in 12 districts after Phase 2 completion."`)
    - Verify `LiveTicker` uses `motion.div` with `animate={{ x: ["100%", "-100%"] }}` and `transition={{ duration: 30, repeat: Infinity, ease: "linear" }}` (duration ≥ 25 s ✓)
    - Verify the "Live Feed" badge renders with a pulsing red dot and distinct accent colour
    - Verify `<LiveTicker />` is placed between the panel header and the Legal Citations bar
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ] 13.2 Write unit test — ticker headlines count and uniqueness (Property 10)
    - Create `src/__tests__/live-ticker.test.tsx`
    - **Property 10: Live Ticker headlines are distinct and sufficient**
    - **Validates: Requirement 11.2**
    - Assert `mockHeadlines.length >= 5`
    - Assert all entries are unique strings (`new Set(mockHeadlines).size === mockHeadlines.length`)
    - Assert `LiveTicker` animation `duration >= 25`

- [x] 14. Update `NetaGPT.tsx` — Constitution Reader modal
  - [x] 14.1 Harden `ConstitutionReader` with accessibility attributes and Escape key handler
    - Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby="constitution-reader-title"` to the outer `motion.div`
    - Add `id="constitution-reader-title"` to the `<h2>` element
    - Add `useEffect` Escape key handler: `document.addEventListener("keydown", e => { if (e.key === "Escape") onClose(); })`
    - Confirm backdrop `onClick={onClose}` and inner content `onClick={e => e.stopPropagation()}` are both present
    - Confirm `style={{ background: "#fdfcf7", fontFamily: "'Crimson Text', Georgia, serif" }}` on the inner panel
    - Confirm `article.fullText ?? article.excerpt` fallback rendering
    - _Requirements: 10.2, 10.3, 10.4_

  - [x] 14.2 Verify `ART_324` and `ART_326` have non-empty `fullText` in the knowledge base
    - Confirm `ART_324.fullText` is a non-empty string (already present in source)
    - Confirm `ART_326.fullText` is a non-empty string (already present in source)
    - _Requirements: 10.5_

  - [ ] 14.3 Write unit test — citation modal lifecycle (Property 9)
    - Create `src/__tests__/neta-gpt.test.tsx`
    - **Property 9: Citation modal lifecycle — open and close for any article**
    - **Validates: Requirements 10.1, 10.2, 10.4**
    - Render `NetaGPT` with `@testing-library/react`; click a citation card; assert `ConstitutionReader` is visible
    - Click the backdrop; assert `ConstitutionReader` is no longer rendered
    - Assert `ART_324.fullText` and `ART_326.fullText` are non-empty strings

- [x] 15. Update `src/app/dashboard/page.tsx` — live credits fetch on mount
  - Replace the hardcoded `240` credits value with a `useState<number | null>(null)` initialised to `null`
  - Add `useEffect` that calls `fetch("/api/credits?userId=robot1508")`, parses `data.credits`, and calls `setCredits(data.credits)`; on error, calls `setCredits(null)`
  - Display `credits ?? "—"` in the Civic Credits card so the UI shows a loading/error state instead of a stale number
  - Update the progress bar `width` calculation to use the live `credits` value (guard against `null` with `credits ?? 0`)
  - _Requirements: 14.1, 14.2, 14.3_

- [x] 16. Update `src/app/evm/page.tsx` — use `robot1508` as userId for credits
  - In `postCredits`, change `userId: "anonymous"` to `userId: "robot1508"` so credits are persisted under the canonical test user
  - This ensures the Dashboard leaderboard reflects EVM simulator activity for `robot1508`
  - _Requirements: 14.1, 14.3_

- [x] 17. Update `src/app/journey/page.tsx` and `src/app/evm/page.tsx` — dynamic imports with `ssr: false`
  - [x] 17.1 Verify `JourneyScene` dynamic import in `journey/page.tsx`
    - Confirm `next/dynamic` with `ssr: false` and a spinner `loading` component is already in place
    - Confirm the file has `"use client"` at the top (required by Next.js 16 — `ssr: false` is not supported in Server Components)
    - _Requirements: 13.1, 13.3, 13.4_

  - [x] 17.2 Add `EVMScene` dynamic import in `evm/page.tsx`
    - The current `evm/page.tsx` does not import `EVMScene` at all (the 3D scene is separate from the simulator UI); confirm whether `EVMScene` is used on this page or only on a dedicated 3D page
    - If `EVMScene` is referenced anywhere in the page tree, wrap it with `dynamic(() => import("@/components/EVMScene"), { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center"><div className="w-16 h-16 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" /></div> })`
    - Confirm `"use client"` is present at the top of `evm/page.tsx`
    - _Requirements: 13.2, 13.3, 13.4_

- [x] 18. Checkpoint — Phase 3 complete
  - Ensure all tests pass, ask the user if questions arise.

---

## Phase 4 — Verification

- [x] 19. Run `npm run build` and resolve any TypeScript or build errors
  - Run `npm run build` from the workspace root
  - Fix any TypeScript type errors introduced by the new `db.ts` pool types, `useMotionValue`/`useSpring` imports, or `useState<number | null>` changes
  - Fix any Next.js 16 build warnings (e.g. `ssr: false` in a Server Component, missing `"use client"` directives)
  - Confirm the build completes with zero errors
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 20. Run `npm run test` and confirm all property and unit tests pass
  - Run `npm run test` (which executes `vitest --run` for a single pass)
  - All property tests (Properties 1, 2, 3, 4, 5, 6, 7, 9, 10, 11) must pass
  - All unit tests (400/503 responses, vibrate call count, material assertions, fullText presence) must pass
  - Fix any test failures before marking this task complete
  - _Requirements: all_

- [x] 21. Final checkpoint — Leaderboard live data verification
  - Confirm `dashboard/page.tsx` fetches from `/api/credits?userId=robot1508` on mount (code inspection)
  - Confirm `evm/page.tsx` posts credits with `userId: "robot1508"` (code inspection)
  - Confirm `src/lib/db.ts` exports a `pool` singleton and `route.ts` imports it (code inspection)
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 14.1, 14.2, 14.3_

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints at tasks 6, 10, 18, and 21 ensure incremental validation
- Property tests validate universal correctness invariants; unit tests validate concrete examples and edge cases
- The `vitest --run` flag (task 1) prevents watch mode from blocking CI or automated execution
- `DATABASE_URL` must be set in the environment before Phase 3 tasks that touch PostgreSQL can be integration-tested end-to-end
- The `pg` package and `@types/pg` are already listed in `package.json` — no additional install needed for the database layer
