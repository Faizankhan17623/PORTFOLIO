# Faizan Khan — Portfolio

A personal portfolio site built as a single-page React app with a boot-screen intro, a full retro-terminal/command-palette layer, and a gamified easter-egg system on top of the usual About/Skills/Projects/Contact sections. Backed by a small Express + MongoDB API for the contact form, visitor counter, and an optional Spotify "now playing" widget.

**Live:** https://portfolio-pied-eight-2csy0b9zua.vercel.app

## Features

**Core sections** (single scrolling page, anchor-linked): Hero, About, Skills, Projects, GitHub Stats, Contact, Footer.

- **Boot / maintenance screen** — a fake terminal boot sequence plays before the site content mounts
- **Terminal overlay** (`/` key or navbar) — a real fake shell with commands like `whoami`, `skills`, `projects`, `contact`, `hire-me`, `resume`, `joke`, `coffee`, `matrix`, `trophies`, `theme`, `lights off`, `play`, `sound`, `sudo`, history navigation with arrow keys
- **Command palette** (`Ctrl/Cmd+K`) — quick navigation, copy-email, theme switcher, and a "Classified" section that triggers the hidden easter eggs
- **Achievement/trophy system** — 12 unlockable achievements (e.g. opening the terminal, entering the Konami code, finding the arcade) persisted in `localStorage`, surfaced as toast popups and a trophy view in the command palette
- **Konami code easter egg** — the classic ↑↑↓↓←→←→BA sequence triggers a Matrix-style falling-code rain overlay
- **Hidden Snake game** (`SNAKE.EXE`) — a canvas-based Snake game with high-score persistence, launched from the terminal (`play`) or command palette
- **Blackout / "lights off" mode** — kills page lighting and hands the visitor a flashlight-style cursor mask
- **Theme switcher** — three color themes (Neon Noir, Blade Runner, Ghost) applied via a `data-theme` attribute, persisted in `localStorage`
- **AI chat widget** — a floating assistant with canned/fuzzy-matched Q&A about Faizan's stack, projects, and availability (client-side only, no external LLM call)
- **GitHub stats** — live stats and repos pulled from the GitHub public API, with animated counters
- **Visitor counter** — total-visit and "online now" counts backed by the Express API
- **Spotify "Now Playing"** — optional footer widget showing the currently playing track via the Spotify API (degrades to "offline" if not configured)
- **Second Brain link** — footer card linking out to an external Obsidian-based knowledge base
- **Contact form** — validated and saved to MongoDB, one message per email address
- **Sound effects** — UI sounds (open/close/keypress/theme-switch/power-down) with a mute toggle
- **Custom cursor, magnetic buttons, tilt/spotlight cards, scroll progress bar** — plus GSAP + ScrollTrigger scroll reveals and a Lenis-smoothed scroll

## Tech Stack

| Part | Tech |
|------|------|
| Frontend | React 19, Vite 7, Framer Motion, GSAP + ScrollTrigger, Lenis (smooth scroll) |
| Backend | Node.js, Express, Mongoose (MongoDB) |
| Hosting | Vercel (frontend) + separate Node backend deployment |

> Note: `react-router-dom` is listed as a dependency and a `src/pages/` directory exists, but neither is currently wired up — the live site is a single page with anchor-scrolled sections (`src/App.jsx` renders `src/components/*` directly).

## Getting Started

```bash
# 1. Install dependencies (frontend + backend)
npm install
npm install --prefix server

# 2. Set up environment variables
#    Copy .env.example to .env in BOTH the root and the server folder,
#    then fill in the values (VITE_API_URL, MONGO_URI, etc.)

# 3. Run frontend + backend together
npm run dev
```

The frontend runs on `http://localhost:5173` and the API on `http://localhost:5000`.

### Available Scripts

**Root (`package.json`):**

| Script | What it does |
|--------|---------------|
| `npm run dev` | Runs frontend **and** backend together (via `concurrently`) |
| `npm run dev:frontend` | Vite dev server only |
| `npm run dev:backend` | Express API only (via `npm run dev --prefix=server`) |
| `npm run build` | Production build of the frontend |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

**`server/package.json`:**

| Script | What it does |
|--------|---------------|
| `npm start` | Run the API with plain Node |
| `npm run dev` | Run the API with nodemon (auto-restart) |

### Environment Variables

**Root `.env`:**
- `VITE_API_URL` — URL of the backend API (`http://localhost:5000` locally)

**`server/.env`:**
- `MONGO_URI` — MongoDB connection string
- `PORT` — API port (default `5000`)
- `FRONTEND_URL` — allowed CORS origin for the deployed frontend
- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` — optional; leave blank to disable the "Now Playing" widget (it just reports offline)

## API Endpoints (`server/index.js`)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/` | Health check |
| POST | `/api/visit` | Increment total visit count, register visitor as online |
| POST | `/api/heartbeat` | Keep a visitor marked "online" without counting a new visit |
| GET | `/api/stats` | Read current total/online visitor stats |
| GET | `/api/now-playing` | Spotify currently-playing track (or `isPlaying: false` if unconfigured) |
| POST | `/api/contact` | Save a contact-form message (validated, one per email) |

## Project Structure

```
portfolio/
├── src/
│   ├── components/    # Navbar, Hero, About, Skills, Projects, Contact, Footer,
│   │                   # TerminalOverlay, CommandPalette, AIChat, GitHubStats,
│   │                   # KonamiEasterEgg, SnakeGame, Blackout, AchievementToasts,
│   │                   # NowPlaying, VisitorCounter, SecondBrain, CustomCursor, ...
│   ├── pages/          # Unused legacy page components (not routed)
│   ├── data/           # portfolioData.js — skills & projects content
│   ├── hooks/          # useGsapReveal, useGsapParallax, useGsapTitle, useScramble, useSpotlight
│   ├── lib/            # achievements.js, theme.js, sound.js
│   └── App.jsx
├── server/             # Express + MongoDB API
│   ├── models/         # Message.js, Counter.js
│   └── index.js
├── vercel.json         # Security headers for the deployed frontend
└── index.html
```

## Contact

Built by **Faizan Khan**. Use the contact form on the site or open an issue here.
