# Pirate Battle — React, PixiJS & TypeScript

A 2D top-down naval shooter game built with **React**, **PixiJS v8**, and **TypeScript (Strict Mode)** for the Jungle Gaming Frontend Game Developer technical challenge.

Navigate through islands, fire frontal cannons and broadsides, engage enemy Chasers and Shooters, and climb the fleet rankings in a fully simulated naval battle.

---

## 1. Tech Stack

| Responsibility | Technology |
| --- | --- |
| UI & Menus | React 18 / 19 |
| Language | TypeScript (Strict Mode) |
| Game Rendering & Physics | PixiJS v8 (WebGL2 / WebGPU) |
| Remote State & Caching | TanStack Query v5 |
| HTTP Client | Axios |
| Network Mocking & Faults | Mock Service Worker (MSW v2) |
| E2E & Visual Testing | Playwright |
| Styling | Tailwind CSS |

---

## 2. Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) LTS (v20+ or v24+ recommended)
- `npm` (v10+ or v11+)

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd Test-Game-Developer-Jungle-Gaming

# Install dependencies
npm install

# (Optional) Install Playwright browser binaries
npx playwright install chromium
```

---

## 3. Available Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Starts Vite development server at `http://localhost:3000` with MSW enabled |
| `npm run build` | Typechecks with `tsc` and bundles production assets to `dist/` |
| `npm run preview` | Serves the production build locally at `http://localhost:3000` |
| `npm run typecheck` | Validates TypeScript in strict mode without emitting files |
| `npm run test:e2e` | Runs Playwright E2E and visual regression test suite |
| `npm run test:e2e:ui` | Opens the interactive Playwright UI Test Runner |

---

## 4. Game Controls

### Desktop Keyboard Controls
- **Move Forward:** `W` or `Arrow Up`
- **Turn Left:** `A` or `Arrow Left`
- **Turn Right:** `D` or `Arrow Right`
- **Frontal Cannon:** `Space` or `J`
- **Port Broadside (Left):** `Q` or `K`
- **Starboard Broadside (Right):** `E` or `L`
- **Pause / Resume:** `Escape`
- **Network Chaos Simulator:** `Ctrl + Shift + D`

### Mobile & Tablet Touch Controls
- **Left D-Pad:** Dedicated on-screen circular buttons for `Turn Left (↶)`, `Forward (↑)`, and `Turn Right (↷)`.
- **Right D-Pad:** Dedicated on-screen cannon buttons for `Port Broadside (3 balls)`, `Bow Cannon (1 ball)`, and `Starboard Broadside (3 balls)`.
- Controls support simultaneous movement and firing.

---

## 5. Gameplay Mechanics & Rules

- **Player Ship:** Manages velocity with hydrodynamic drag, angular steering, and dual weaponry (frontal bow cannon and port/starboard triple broadsides). Features a dynamic 4-stage visual deterioration pipeline reflecting hull damage.
- **Enemies:**
  - **Chaser:** Swiftly seeks the player ship and self-destructs upon contact, dealing 30 damage. Kamikaze impact awards **0 points** to the player.
  - **Shooter:** Approaches to combat range (380px–480px), matches heading, and fires ranged cannonballs on cooldown.
  - Both enemies respect island collision boundaries and award **1 point** when destroyed by player attacks.
- **Islands & Collisions:** Fixed island outposts block ships and cannonballs. Cannonballs generate water splashes on obstacle impact or wood splinters on ship hit.
- **Session Duration & Spawn Interval:** Fully configurable in the **Options** screen:
  - Game session time: **60s to 180s** (default: 120s)
  - Enemy spawn interval: **1s to 10s** (default: 3s)
  - Options are saved in `localStorage` and applied as a snapshot upon starting a new match.

---

## 6. Remote State, Offline Queue & Network Chaos Simulator

Ranking and match history are simulated via **MSW v2** running seamlessly in both local development and the production build.

### Idempotency & Offline Outbox
- Every completed match receives a unique UUID `matchId` acting as an **Idempotency Key**.
- If a match is submitted multiple times or the user refreshes during network lag, MSW detects the existing ID and returns `200 OK` without creating duplicates.
- If network connection drops or times out, the match is safely stored in the **Offline Outbox Queue** (`localStorage`). The player can retry syncing at any time without blocking further gameplay.

### Network Chaos Simulator Panel
Press `Ctrl + Shift + D` or click the **Network Simulator** button in the top right to simulate and verify real-world network conditions:
1. `Normal (Success)`: Fast standard latency (~120ms).
2. `Empty Lists`: Simulates empty tables for ranking and match history.
3. `Sluggish / High Latency`: Simulates slow connections with configurable latency (500ms to 5000ms).
4. `Out of Order`: Tests race conditions by alternating response times.
5. `HTTP 500 Internal Error`: Injects server errors to test UI retry states.
6. `Request Timeout`: Induces client timeouts (>8000ms) to verify outbox queueing.
7. `Disconnected`: Simulates offline mode.
8. `Reset Database`: Restores initial fixtures.

---

## 7. Automated Testing (Playwright)

The project includes an end-to-end test suite in `tests/` covering:
- **Options Navigation & Persistence:** Validating boundary clamping and `localStorage` persistence across reloads.
- **Combat & Weapons:** Movement, simultaneous steering/firing, cooldowns, and point attribution.
- **Pause & Resume:** Manual pausing, window blur / visibility change auto-pause, and clean simulation resumption.
- **Ranking & Match History:** Pagination, tie-breaking criteria, tab switching, and instant cache invalidation.
- **Network Fault Injection:** Verifying empty states, HTTP 500 recovery, and offline outbox queuing.
- **Visual Regression:** Pixel-perfect snapshot comparison for Main Menu, Options, and Captain's Log on both Desktop and Mobile viewports.

Run the test suite with:
```bash
npm run test:e2e
```

---

## 8. Deployment

This project is configured for deployment on modern static hosting platforms with client-side routing and Service Worker support:
- **Vercel:** `npm run build`, output directory: `dist`.
- **Cloudflare Pages / Netlify:** Same configuration.

The MSW service worker (`/mockServiceWorker.js`) and all game assets in `/assets/` are included in the build output, ensuring full offline functionality and simulated API behavior in production.
