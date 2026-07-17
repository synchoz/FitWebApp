# Fitness Dashboard Application

## Description

A dynamic, user-friendly fitness web app. Users log their body weight and food/calorie intake and view their progress over time through interactive charts.

## Main Features

- **Dashboard** — at-a-glance view of fitness progress, including a dynamic weight-over-time graph.
- **Calorie Tracking** — daily calorie intake via a pie chart and detailed table.
- **Weight Log** — log weight entries, which populate the dashboard's weight graph.
- **Profile Page** — view/edit profile info and upload a profile picture (stored on Cloudinary).
- **Dynamic Navigation Bar** — updates based on authentication state.
- **Protected Routes** — `/Home`, `/Calendar`, and `/Profile` are only reachable when logged in (client-side route gating; see Known Limitations below).

## Project Structure

This repo holds two independent Node projects with no shared tooling — always `cd` into one before running commands:

```
backend/    Express + Sequelize (MySQL) REST API
frontend/   Create React App SPA (Tailwind + Bootstrap/MUI, Chart.js/ECharts)
```

## Technology Stack

### Frontend
- **React 18** + **React Router DOM v6**
- **Tailwind CSS**, **Bootstrap** / **React-Bootstrap**, **MUI** — mixed styling, no single design system
- **Chart.js** / **react-chartjs-2** and **ECharts** for charts
- **Axios** for API calls

### Backend
- **Node.js** (pinned `>=16.16.0 <17.0.0`, see `.node-version`/`.nvmrc`)
- **Express**
- **Sequelize** ORM over **MySQL**
- **Multer** + **Cloudinary** for profile image upload

## Getting Started

Prerequisites: Node.js matching the pinned version in `backend/.node-version`, npm, and a running local MySQL server.

### 1. Clone the repository

```bash
git clone https://github.com/synchoz/FitWebApp.git
cd FitWebApp
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env   # fill in your local MySQL credentials + Cloudinary keys
npm install
npm run setup           # creates the database and runs all migrations (first time only)
npm start                # runs on the PORT set in .env (default 3001)
```

`npm start` re-runs any pending migrations automatically before booting (see `prestart` in `backend/package.json`), so after pulling changes that add new migrations you only need `npm start` again — no separate migrate step.

Other useful backend scripts:

| Script | Purpose |
|---|---|
| `npm run db:create` | Create the MySQL database from `.env` config |
| `npm run migrate` | Apply pending migrations |
| `npm run migrate:undo` | Roll back the last migration |
| `npm run migrate:undo:all` | Roll back all migrations |

### 3. Frontend setup

```bash
cd frontend
npm install
npm start   # dev server on http://localhost:3000
```

`frontend/.env` (containing `REACT_APP_API_BASE_URL`, the backend's base URL) is committed since it holds no secrets — adjust it if your backend runs somewhere other than `http://localhost:3001`.

## Usage

Navigate to `http://localhost:3000`. Unauthenticated visitors see the public landing page with a login/register option. Once logged in, the dashboard, calendar, and profile pages become available.

## Schema Changes

Database schema changes go through `backend/migrations/` (`npx sequelize-cli migration:generate --name <name>` from `backend/`), not manual `ALTER TABLE` or model edits alone. There's no `models/index.js` autoloader tying models and migrations together, so keep `backend/models/*.js` and the corresponding migration in sync by hand.

## Known Limitations

- `middleware/authJwt.js` (`verifyToken`) exists but isn't wired into any backend route — all API endpoints are currently unauthenticated. Protected routes are enforced only client-side.
- The JWT secret in `backend/config/auth.config.js` is hardcoded rather than read from an environment variable.
- No backend test suite is configured yet.
