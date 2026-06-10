# Faizan Khan — Portfolio

A personal portfolio website built with **React + Vite**, with a small **Express + MongoDB** backend for the contact form.

🔗 **Live:** https://portfolio-pied-eight-2csy0b9zua.vercel.app

## ✨ Features

- **Interactive terminal overlay** — a fake terminal ("Faizan Khan portfolio") with its own commands, including a Matrix rain easter egg
- **AI chat widget** — ask questions about me directly on the site
- **GitHub stats** — live stats pulled from my GitHub profile
- **Contact form** — messages are validated and saved to MongoDB (one message per email)
- **Smooth animations** — Framer Motion transitions, Lenis smooth scrolling, magnetic buttons, tilt cards, and a custom cursor
- **Multi-page layout** — Home, About, Skills, Projects, and Contact pages via React Router

## 🛠 Tech Stack

| Part     | Tech                                                    |
|----------|---------------------------------------------------------|
| Frontend | React 19, Vite 7, React Router 7, Framer Motion, Lenis  |
| Backend  | Node.js, Express, Mongoose (MongoDB)                    |
| Hosting  | Vercel (frontend) + separate backend deployment         |

## 🚀 Getting Started

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

| Script                 | What it does                          |
|------------------------|---------------------------------------|
| `npm run dev`          | Runs frontend **and** backend together |
| `npm run dev:frontend` | Vite dev server only                   |
| `npm run dev:backend`  | Express API only (nodemon)             |
| `npm run build`        | Production build of the frontend       |
| `npm run preview`      | Preview the production build           |
| `npm run lint`         | Run ESLint                             |

## 📁 Project Structure

```
portfolio/
├── src/
│   ├── components/   # Navbar, Hero, TerminalOverlay, AIChat, GitHubStats, ...
│   ├── pages/        # Home, About, Skills, Projects, Contact
│   ├── data/         # portfolioData.js (content lives here)
│   └── App.jsx
├── server/           # Express + MongoDB API (contact form)
│   ├── models/
│   └── index.js
└── index.html
```

## 📬 Contact

Built by **Faizan Khan**. Use the contact form on the site or open an issue here.

<!--
═══════════════════════════════════════════════════════════════
  OLD README (kept for reference — original Vite template text)
═══════════════════════════════════════════════════════════════

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [typescript-eslint](https://typescript-eslint.io) in your project.
-->
