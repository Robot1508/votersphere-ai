# Requirements Document

## Introduction

VoterSphere 1.0: Final Polish & Spatial UX is a high-performance refinement pass on an existing Next.js 16 civic-education application built for the Maharashtra 2026 bye-elections. The application already contains a functional 3D voter journey (`JourneyScene.tsx`), an EVM simulator (`EVMScene.tsx` + `evm/page.tsx`), a constitutional AI assistant (`NetaGPT.tsx`), and a credits API (`/api/credits`). This feature overhaul targets four areas: cinematic 3D journey quality, tactile EVM physicality, advanced RAG UI for Neta-GPT, and data integrity with performance optimisation.

## Glossary

- **JourneyScene**: The React Three Fiber component in `src/components/JourneyScene.tsx` that renders the 3D voter journey.
- **EVMScene**: The React Three Fiber component in `src/components/EVMScene.tsx` that renders the 3D EVM model.
- **EVM_Page**: The Next.js client page at `src/app/evm/page.tsx` that hosts the interactive EVM simulator.
- **NetaGPT**: The constitutional AI chat component in `src/components/NetaGPT.tsx`.
- **Credits_API**: The Next.js route handler at `src/app/api/credits/route.ts`.
- **CatmullRomCurve3**: A Three.js smooth spline curve used for camera path interpolation.
- **MeshPhysicalMaterial**: A Three.js physically-based material supporting transmission, clearcoat, and IOR for frosted-glass effects.
- **Stars**: The `@react-three/drei` component that renders a starfield particle system.
- **Framer_Motion**: The animation library (`framer-motion`) already installed in the project.
- **Dynamic_Import**: `next/dynamic` with `ssr: false`, used to defer client-only Three.js bundles from the server render.
- **Haptic_Vibration**: A short pulse triggered via `navigator.vibrate()` on supported mobile browsers.
- **Constitution_Reader**: A modal overlay component that displays full official constitutional article text.
- **Live_Ticker**: A horizontally-scrolling news headline strip inside the NetaGPT panel.
- **Civic_Credits**: Integer points awarded to a user for completing civic actions, persisted via the Credits_API.
- **Leaderboard**: The civic credits display on the dashboard page (`src/app/dashboard/page.tsx`).
- **robot1508**: The canonical test user ID used to verify database persistence end-to-end.
- **PostgreSQL**: The relational database targeted for persistent Civic_Credits storage, accessed via the `pg` package already listed in `package.json`.

---

## Requirements

### Requirement 1: Cinematic Camera Path in JourneyScene

**User Story:** As a visitor, I want the 3D camera to glide smoothly along a curved path as I scroll, so that the journey feels cinematic rather than mechanical.

#### Acceptance Criteria

1. THE JourneyScene SHALL derive the camera flight path using a `CatmullRomCurve3` constructed from the six milestone positions plus entry and exit padding points.
2. WHEN the user scrolls the `journey-scroll-container` element, THE JourneyScene SHALL update a normalised scroll value `scrollT` in the range [0, 1] and pass it to the camera controller on every frame.
3. WHILE `scrollT` is between 0 and 1, THE JourneyScene SHALL lerp the camera position toward the curve point at `scrollT` with a smoothing factor of 0.08 per frame so that motion is never instantaneous.
4. THE JourneyScene SHALL maintain a separate `CatmullRomCurve3` for look-at targets derived from the milestone world positions, so the camera always faces the active milestone.

---

### Requirement 2: Progressive Path Lighting

**User Story:** As a visitor, I want the 3D path to light up in Voter Red only as I scroll past each milestone, so that my progress through the journey is visually reinforced.

#### Acceptance Criteria

1. WHEN `scrollT` advances past the normalised threshold for milestone `i` (defined as `i / (totalMilestones - 1)`), THE JourneyScene SHALL render the path segment up to that milestone in colour `#E63946`.
2. WHILE a path segment has not yet been reached by `scrollT`, THE JourneyScene SHALL render that segment in a dim base colour (`#1a1a2e`) at reduced opacity.
3. THE JourneyScene SHALL place `pointLight` nodes at regular intervals along the active (lit) portion of the path to simulate a bloom-like glow effect without requiring a post-processing pass.
4. IF the `scrollT` value is 0, THEN THE JourneyScene SHALL render the entire path in the dim base colour with no red segments lit.

---

### Requirement 3: Frosted Glass Milestone Nodes

**User Story:** As a visitor, I want each milestone node to look like a premium frosted-glass orb, so that the journey has a high-fidelity spatial feel.

#### Acceptance Criteria

1. THE JourneyScene SHALL render each of the six milestone nodes using a `MeshPhysicalMaterial` with `transmission ≥ 0.85`, `clearcoat = 1`, `roughness ≤ 0.15`, and `ior = 1.5`.
2. WHEN a milestone becomes active (its threshold is reached by `scrollT`), THE JourneyScene SHALL change the `MeshPhysicalMaterial` `color` property of that node to `#E63946`.
3. WHILE a milestone is inactive, THE JourneyScene SHALL render its `MeshPhysicalMaterial` `color` as `#ffffff`.
4. THE JourneyScene SHALL wrap each milestone node in a `Float` component from `@react-three/drei` to produce a continuous gentle levitation animation.

---

### Requirement 4: Floating 3D Icons Inside Milestones

**User Story:** As a visitor, I want each milestone orb to contain a recognisable 3D icon (pen, finger, etc.), so that I can immediately understand what each step represents.

#### Acceptance Criteria

1. THE JourneyScene SHALL render a 3D pen icon (cylinder body + cone tip) inside the Form 6 milestone node.
2. THE JourneyScene SHALL render a 3D finger icon (capsule geometry with ink-mark detail) inside the Cast Vote milestone node.
3. THE JourneyScene SHALL render a distinct 3D icon (using primitive Three.js geometries) for each of the remaining four milestones: NVSP Verify, EPIC Card, Polling Booth, and VVPAT Receipt.
4. WHEN a milestone icon is rendered, THE JourneyScene SHALL position the icon at the centre of its parent milestone group so it appears to float inside the frosted-glass orb.

---

### Requirement 5: Starfield Background in JourneyScene

**User Story:** As a visitor, I want a subtle starfield behind the 3D journey, so that the scene feels like a "journey through democracy" in a premium spatial environment.

#### Acceptance Criteria

1. THE JourneyScene SHALL include the `Stars` component from `@react-three/drei` with `radius ≥ 100`, `count ≥ 5000`, and `fade` enabled.
2. THE JourneyScene SHALL set the Canvas background colour to `#050505` so the starfield is visible against a near-black void.
3. THE JourneyScene SHALL apply a `fog` attachment with near and far distances tuned so distant milestones fade naturally into the background.

---

### Requirement 6: Spring-Physics EVM Button Depression

**User Story:** As a user, I want the EVM ballot buttons to physically depress and bounce back when clicked, so that the interaction feels like pressing a real hardware button.

#### Acceptance Criteria

1. WHEN a ballot button is pressed (`onPointerDown`), THE EVM_Page SHALL animate the button element downward using a Framer_Motion spring with `stiffness ≥ 300` and `damping ≤ 15` to produce a realistic bounce.
2. WHEN the pointer is released (`onPointerUp` or `onPointerOut`), THE EVM_Page SHALL animate the button back to its resting position using the same spring configuration.
3. THE EVM_Page SHALL implement the button depression as a CSS `y` transform (vertical translation of 4–6 px) so the button appears to physically sink into the panel.
4. WHILE a vote has already been cast (`voted !== null`), THE EVM_Page SHALL disable all button press animations and pointer interactions to prevent double-voting.

---

### Requirement 7: Haptic Vibration Synchronised with Beep

**User Story:** As a mobile user, I want to feel a short vibration at the exact moment the EVM beep plays, so that I receive physical confirmation that my vote was registered.

#### Acceptance Criteria

1. WHEN a vote is cast and the beep oscillator starts, THE EVM_Page SHALL call `navigator.vibrate(50)` within the same synchronous execution frame as the `AudioContext` oscillator start.
2. IF `navigator.vibrate` is not available in the current browser, THEN THE EVM_Page SHALL silently skip the vibration call without throwing an error or displaying a warning.
3. THE EVM_Page SHALL not call `navigator.vibrate` more than once per vote action to avoid repeated pulses.

---

### Requirement 8: Brushed-Metal Ballot Unit Material

**User Story:** As a user, I want the Ballot Unit body to look like brushed metal, so that the 3D model resembles real EVM hardware.

#### Acceptance Criteria

1. THE EVMScene SHALL apply a `meshStandardMaterial` to the Ballot Unit body with `metalness ≥ 0.85` and `roughness` anisotropically varied (e.g., via a roughness map or a roughness value of 0.3–0.5) to simulate a brushed finish.
2. THE EVMScene SHALL set the Ballot Unit body colour to a light grey (`#d1d5db` or equivalent) consistent with real EVM hardware colouring.

---

### Requirement 9: Grain/Scratch Texture on VVPAT Window

**User Story:** As a user, I want the VVPAT viewing window to look scratched and worn, so that the 3D model conveys the tactile realism of physical hardware.

#### Acceptance Criteria

1. THE EVMScene SHALL apply a `meshPhysicalMaterial` to the VVPAT window with `roughness ≥ 0.55` and `transmission ≤ 0.5` to simulate aged, scratched plastic.
2. THE EVMScene SHALL set `clearcoat` to a low value (≤ 0.15) on the VVPAT window material to reduce specular highlights and reinforce the worn appearance.

---

### Requirement 10: Clickable Constitutional Citations in NetaGPT

**User Story:** As a user, I want to click on a cited article reference (e.g., "Art. 324") in the Neta-GPT panel and read the full official text, so that I can deepen my constitutional knowledge without leaving the app.

#### Acceptance Criteria

1. WHEN the NetaGPT assistant response includes an article reference, THE NetaGPT SHALL render that reference as a clickable card in the "Legal Citations" sidebar panel.
2. WHEN a citation card is clicked, THE NetaGPT SHALL open the Constitution_Reader modal displaying the full `fullText` of the selected article.
3. THE Constitution_Reader SHALL render the article text in a high-contrast serif typeface (e.g., Crimson Text or Georgia) on a parchment-coloured (`#fdfcf7`) background.
4. WHEN the Constitution_Reader modal is open and the user clicks the backdrop or the close button, THE NetaGPT SHALL close the modal and return focus to the chat panel.
5. THE NetaGPT SHALL provide `fullText` content for at minimum Article 324 and Article 326 in its constitutional knowledge base.

---

### Requirement 11: Live Election News Ticker in NetaGPT

**User Story:** As a user, I want to see a scrolling live feed of Maharashtra 2026 bye-election headlines inside the Neta-GPT panel, so that the app feels contextually current.

#### Acceptance Criteria

1. THE NetaGPT SHALL render a `Live_Ticker` strip between the panel header and the citations bar that continuously scrolls mock headlines from right to left.
2. THE Live_Ticker SHALL display at least five distinct mock headlines relevant to the Maharashtra 2026 bye-elections.
3. THE Live_Ticker SHALL animate using a Framer_Motion `x` translation from `"100%"` to `"-100%"` on an infinite loop with a duration of ≥ 25 seconds so headlines are readable.
4. THE Live_Ticker SHALL include a labelled "Live Feed" badge with a distinct accent colour to distinguish it from the chat content.

---

### Requirement 12: PostgreSQL Persistence for Civic Credits

**User Story:** As the platform operator, I want civic credit increments to be written to a PostgreSQL database, so that user progress is durable across server restarts and accurately reflected on the leaderboard.

#### Acceptance Criteria

1. WHEN the Credits_API receives a valid POST request, THE Credits_API SHALL write the `userId`, `delta`, and timestamp to a PostgreSQL `civic_credits` table using a parameterised query.
2. WHEN the Credits_API receives a GET request for a `userId`, THE Credits_API SHALL read the aggregate credit total for that user from PostgreSQL and return it in the response.
3. WHEN a POST request is made with `userId = "robot1508"`, THE Credits_API SHALL persist the increment to PostgreSQL and the subsequent GET for `robot1508` SHALL return the updated total.
4. IF the PostgreSQL connection fails, THEN THE Credits_API SHALL return an HTTP 503 response with a descriptive error message rather than silently falling back to in-memory state.
5. THE Credits_API SHALL use parameterised queries (no string interpolation of user-supplied values) to prevent SQL injection.

---

### Requirement 13: Dynamic Import of Three.js Components

**User Story:** As a developer, I want all Three.js canvas components to be loaded with `next/dynamic` and `ssr: false`, so that the app achieves a high Lighthouse performance score by excluding heavy WebGL bundles from the server-rendered HTML.

#### Acceptance Criteria

1. THE JourneyScene SHALL be imported in `src/app/journey/page.tsx` using `next/dynamic` with `ssr: false` so it is excluded from the server render.
2. THE EVMScene SHALL be imported in any page that uses it using `next/dynamic` with `ssr: false`.
3. WHEN a Three.js component is loading, THE page SHALL display a spinner or skeleton placeholder so the layout does not shift unexpectedly.
4. WHERE `ssr: false` is required, THE dynamic import call SHALL be placed inside a Client Component (marked `"use client"`) in accordance with the Next.js 16 constraint that `ssr: false` is not supported in Server Components.

---

### Requirement 14: Leaderboard Reflects Live Credits for robot1508

**User Story:** As a user logged in as robot1508, I want my civic credits to appear instantly on the leaderboard after each action, so that I can see my progress in real time.

#### Acceptance Criteria

1. WHEN the EVM_Page awards Civic_Credits to `robot1508`, THE Leaderboard SHALL reflect the updated total within one page navigation or data refresh cycle.
2. THE Credits_API GET endpoint SHALL return the current PostgreSQL-persisted total for `robot1508` so the Leaderboard always reads from the source of truth.
3. WHEN the Leaderboard component mounts, THE Leaderboard SHALL fetch the current credit total from the Credits_API GET endpoint rather than relying on a hardcoded static value.
