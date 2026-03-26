# 📚 Study Hub — Your Sanctuary

A premium focus & productivity app built with React + Vite.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 🏗️ Tech Stack

- **React 19** + **Vite 8**
- **Tailwind CSS v4** — utility-first styling
- **Framer Motion** — page transitions & micro-animations
- **React Router DOM** — client-side routing
- **Zustand** + `persist` — global state with localStorage persistence
- **Supabase** — auth & database (stubs ready)

## 📁 Structure

```
src/
├── components/
│   ├── ui/          # Button, Card, Modal, TimerCircle, Avatar, ProgressBar
│   ├── layout/      # TopBar, Navbar, PageWrapper
│   └── pages/       # Dashboard, Focus, Kesari, Analytics, Scheduler, Leaderboard, Settings
├── hooks/
│   └── useTimer.js  # Timer logic: start/pause/resume/reset, Pomodoro & Deep Focus
├── store/
│   └── useAppStore.js  # Zustand global store
├── lib/
│   ├── constants.js # App-wide constants, mock data
│   ├── supabase.js  # Supabase client
│   └── api.js       # Service layer (auth, sessions, leaderboard)
└── utils/
    └── formatters.js
```

## 🌐 Routes

| Route | Page |
|---|---|
| `/` | Dashboard |
| `/focus` | Focus Timer |
| `/kesari` | Kesari AI Coach |
| `/analytics` | Analytics Dashboard |
| `/scheduler` | Scheduler |
| `/leaderboard` | Leaderboard + Focus Room |
| `/settings` | Settings |

## 🔐 Supabase Setup (Optional)

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` → `.env`
3. Fill in your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## 🎨 Design System

- **Primary**: `#4ae176` (emerald green)
- **Background**: `#000000` pure black
- **Surface layers**: `surface-container-low` → `surface-container-highest`
- **Fonts**: Manrope (headlines) · Inter (body) · JetBrains Mono (data/timer)
