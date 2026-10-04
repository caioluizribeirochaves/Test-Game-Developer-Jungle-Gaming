# 🏴‍☠️ Pirate Battle — React, PixiJS & TypeScript

[![Vercel Live Demo](https://img.shields.io/badge/Vercel-Live%20Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://test-game-developer-jungle-gaming.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PixiJS](https://img.shields.io/badge/PixiJS-v8%20WebGL2%2FWebGPU-E72264?style=for-the-badge&logo=pixijs&logoColor=white)](https://pixijs.com/)
[![Playwright Tests](https://img.shields.io/badge/Playwright-18%20Passed-green?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![Development Time](https://img.shields.io/badge/Development%20Time-2%20Days%20(~48h)-orange?style=for-the-badge&logo=clockify&logoColor=white)](#-development-overview--timeline)

A high-performance 2D top-down naval shooter game built with **React**, **PixiJS v8**, and **TypeScript (Strict Mode)** for the **Jungle Gaming Frontend Game Developer** technical evaluation.

---

## ⏱️ Development Overview & Timeline

> ### ⚡ **Total Development Time: 2 Days (~48 hours)**
> The entire project—including game engine architecture, PixiJS v8 rendering, custom physics & collision systems, responsive pirate UI, full mobile touch controls with dynamic joystick, offline resilience with MSW v2, sound effects, automated E2E/visual test suite, and cloud deployment—was **designed, developed, polished, and shipped in 2 days**.

---

## 🚀 Live Demo / Play Online

The game is deployed and instantly playable across all desktop and mobile browsers via Vercel:

> ### 🌐 **Live Demo URL:**  
> ### 👉 **[https://test-game-developer-jungle-gaming.vercel.app](https://test-game-developer-jungle-gaming.vercel.app)**
> 
> *📱 **Full Cross-Platform Compatibility:** Runs with 60 FPS performance on Desktops, Laptops, Tablets, and Smartphones (iOS & Android). Features intelligent device-aware responsive scaling for both **Portrait** and **Landscape** orientations.*

---

## 📸 Visual Showcase & Screenshots

Below are key screenshots highlighting core screens and gameplay features:

### 1. Main Menu
Authentic 9-slice wooden pirate panel framing, ambient ocean audio with instant mute toggle, responsive navigation, and direct access to Game Modes, Options, Captain's Log, and the Network Chaos Lab.
<p align="center">
  <img src="Documents/screenshots/Main_menu.png" alt="Main Menu - Pirate Battle" width="850px" style="border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);" />
</p>

---

### 2. Desktop Naval Combat Arena (Web Gameplay)
High-seas battle arena featuring 4 organic islands surrounded by shallow shoals, a stone fortress on the northwestern island, two distinct enemy types (Kamikaze Chasers and Tactical Distance Shooters), and dynamic 4-stage hull damage visuals.
<p align="center">
  <img src="Documents/screenshots/gameplay_on_web.png" alt="Desktop Web Gameplay - Naval Battle Arena" width="850px" style="border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);" />
</p>

---

### 3. Mobile Touch Controls (Mobile Gameplay)
Adaptive mobile HUD with an ergonomic **Dynamic Virtual Joystick** on the left (smooth 360° steering with progressive throttle) and a tactile **triangular cannon cluster** on the right (Port Broadside, Bow Cannon, and Starboard Broadside).
<p align="center">
  <img src="Documents/screenshots/gameplay_on_mobile.jpg" alt="Mobile Gameplay - Virtual Joystick and Cannon Cluster" width="450px" style="border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);" />
</p>

---

### 4. Captain's Log & Fleet Leaderboard
Comprehensive ranking leaderboard and match history log powered by TanStack Query and Mock Service Worker (MSW v2). Includes battle duration and spawn interval filters, responsive pagination, and persistent localStorage sync.
<p align="center">
  <img src="Documents/screenshots/Captains_logs.png" alt="Captain's Log - Leaderboard & Match History" width="850px" style="border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);" />
</p>

---

## 🛠️ Technology Stack

| Layer / Responsibility | Technology | Description |
| --- | --- | --- |
| **UI Framework** | React 18 | Declarative UI for menus, HUD, modals, and leaderboards |
| **Language & Typing** | TypeScript 5 (Strict Mode) | Zero `any` policy, complete type safety across engine and UI |
| **Rendering Engine** | PixiJS v8 | WebGL2 / WebGPU high-performance 2D hardware-accelerated rendering |
| **Styling & Theming** | Tailwind CSS | Custom pirate theme with responsive utility classes and 9-slice sprites |
| **Server State & Caching** | TanStack Query v5 | Leaderboard caching, background polling, and optimistic updates |
| **HTTP Client** | Axios | Configured with request timeouts and custom interceptors |
| **API Mocking & Chaos** | MSW v2 (Mock Service Worker) | In-browser network interception simulating real backend latency & faults |
| **Automated Testing** | Playwright | 18 automated E2E tests and pixel-perfect visual regression suites |
| **Hosting & CI/CD** | Vercel | Automatic deployments on `git push` to `main` |

---

## 🎮 Game Controls

### 🖥️ Desktop (Keyboard)
- **Sail Forward:** `W` or `Up Arrow`
- **Steer Port (Left):** `A` or `Left Arrow`
- **Steer Starboard (Right):** `D` or `Right Arrow`
- **Fire Bow Cannon (Forward):** `Space` or `J`
- **Fire Port Broadside (Left 3-Cannon Volley):** `Q` or `K`
- **Fire Starboard Broadside (Right 3-Cannon Volley):** `E` or `L`
- **Pause / Resume Game:** `Esc` or the pause button in the top-right corner
- **Network Chaos Simulator:** `Ctrl + Shift + D` or via the Main Menu button

### 📱 Mobile (Touchscreen)
- **Left Thumb — Dynamic Virtual Joystick:** Touch anywhere on the left half of the screen and drag to steer and propel the ship in any direction.
- **Right Thumb — Triangular Cannon Cluster:**
  - **Left Button:** Fire Port Broadside volley.
  - **Center / Top Button:** Fire Bow Cannon straight ahead.
  - **Right Button:** Fire Starboard Broadside volley.
- Supports multi-touch gestures (seamlessly sail and steer while firing simultaneous broadsides).
- Automatically adapts between **Portrait** and **Landscape** orientations with dedicated layouts.

---

## ⚙️ Core Mechanics & Gameplay Rules

- **Player Ship Physics:** Realistic naval physics with hydro-drag, progressive acceleration, inertia drift, and angular momentum. Features a **4-stage visual damage system** that visually degrades the ship sprite as hull health decreases (100 HP).
- **Enemy AI Behaviors:**
  - **Chaser (Red Ship):** Aggressive ramming ship that navigates directly toward the player to trigger an explosive kamikaze collision (-30 HP). Does not grant score points if it dies by ramming.
  - **Shooter (Blue Ship):** Stays at optimal combat distance (380px–480px), aligns broadside/bow angles, and fires timed cannonball volleys.
  - Both enemy types avoid island obstacles through ray-based boundary reflection. Destroying any enemy with player cannonballs rewards **1 Point**.
- **Environmental Obstacles:** 4 procedurally positioned islands with shallow sandbanks, lush jungle greenery, and a fortified stone castle. Cannonballs impact shorelines with splash particles and damage ships with splinter effects.
- **Match Configurations (Options Menu):**
  - Session duration: **60s to 180s** (default: 120s)
  - Enemy spawn interval: **1s to 10s** (default: 3s)
  - Player name customization: Saved to `localStorage`
  - Audio mute toggle: Remembers user preference

---

## 🌐 Network Resilience & Chaos Simulator (MSW v2)

The leaderboard and match submission pipeline are backed by **Mock Service Worker v2**, active in both development and production on Vercel:

- **Idempotency with Unique Match Keys:** Every completed match generates a unique UUID v4 `matchId`. If network latency causes retries or page refreshes, the API ensures scores are never duplicated.
- **Offline Outbox Queue:** When a network drop or timeout occurs upon match completion, the match record is safely queued in `localStorage` outbox and automatically synced once connectivity is restored.
- **Chaos Simulator Panel (`Ctrl + Shift + D`):** Test 7 real-world scenarios live in the browser:
  1. `Normal (Success)`: Fast standard latency (~120ms).
  2. `Empty Lists`: Simulates clean database state.
  3. `Sluggish / High Latency`: Simulates 2G/3G connections with slider control (500ms to 5000ms).
  4. `Out of Order`: Tests asynchronous race conditions with alternating request delays.
  5. `HTTP 500 Internal Error`: Tests error UI boundaries and "Retry Query" recovery.
  6. `Request Timeout`: Triggers client timeout (>8000ms) to verify offline queuing.
  7. `Network Disconnected`: Simulates complete connection loss and verifies outbox persistence.

---

## 🧪 Automated Testing (Playwright)

The project includes an automated test suite comprising 18 end-to-end and cross-platform visual regression tests:

```bash
# Run all E2E and visual tests headlessly
npm run test:e2e

# Run tests in interactive UI mode
npm run test:e2e:ui
```

All 18 tests cover:
- Main Menu rendering and audio interactions
- Match startup, HUD timer, score counters, and pause workflows
- Options persistence and restoration
- Captain's Log leaderboard pagination and tab switching
- Mobile touch controls (joystick & cannon cluster)
- Visual snapshot parity across Desktop and Mobile viewports

---

## 📦 Local Development Setup

To run the project locally on your machine:

```bash
# 1. Clone the repository
git clone https://github.com/caioluizribeirochaves/Test-Game-Developer-Jungle-Gaming.git
cd Test-Game-Developer-Jungle-Gaming

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
```

---

## 🚢 Vercel Deployment

The application is fully configured for deployment on Vercel via [`vercel.json`](file:///vercel.json):
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **SPA Rewrites:** Automatic routing rules ensuring client-side navigation and Service Worker registration succeed without 404 errors.
- Any commit pushed to the `main` branch automatically triggers Vercel's CI/CD pipeline and deploys the latest version within seconds.
