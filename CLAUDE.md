# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A fitness-tracking web app: users log body weight and food/calorie intake and view progress via charts. Two independent Node projects live side by side with no shared tooling (no root scripts, no monorepo manager):

- `backend/` — Express + Sequelize (MySQL) REST API
- `frontend/` — Create React App (CRA) SPA, styled with Tailwind + Bootstrap/MUI components, charts via Chart.js/ECharts

There is no root-level build; always `cd` into `backend/` or `frontend/` before running commands.

## Commands

### Backend (`backend/`)
- `npm start` — runs `node app.js` (no nodemon script defined, though nodemon is a dependency)
- No test suite is configured (`npm test` is a stub that exits with an error)
- Node version pinned to `>=16.16.0 <17.0.0` (see `.node-version`/`.nvmrc`)

### Frontend (`frontend/`, CRA defaults)
- `npm start` — dev server on `http://localhost:3000`
- `npm test` — Jest/RTL in watch mode (single file: `npm test -- App.test.js`)
- `npm run build` — production build

## Fresh clone setup

1. Backend: `cd backend && cp .env.example .env` and fill in real values (local MySQL creds, Cloudinary keys). Then `npm install && npm run setup` — creates the `fitwebapp` database (`db:create`) and runs all migrations (`db:migrate`). After that, `npm start` alone re-applies any new migrations automatically (`prestart` hook) before booting the server.
2. Frontend: `cd frontend && npm install && npm start` — `frontend/.env` (`REACT_APP_API_BASE_URL`) is committed since it holds no secrets, just the local API base URL.
3. Schema changes go through `backend/migrations/` (via `npx sequelize-cli migration:generate --name <name>`), not manual `ALTER TABLE`/model edits alone — keep `models/*.js` and the migrations in sync by hand since there's no `models/index.js` autoloader tying them together.

## Environment configuration

Backend (`.env`, not committed) is read via `dotenv` in `app.js`/`utils/database.js`:
- `PORT` — server port
- `DBDATABASE`/`DBUSERNAME`/`DBPASSWORD`/`DBHOST` — MySQL connection (falls back to `DB_LOCAL_DATABASE`/`DB_LOCAL_USERNAME`/`DB_LOCAL_PASSWORD` for local dev, see `utils/database.js`)
- `CLOUDINARY_NAME`/`CLOUDINARY_APIKEY`/`CLOUDINARY_SECRET` — image upload target (`utils/cloudinary.js`)

Frontend (`.env`) needs `REACT_APP_API_BASE_URL` — the base URL the API services (`src/API/Services/*.js`) prepend to all requests (e.g. `${REACT_APP_API_BASE_URL}/api/users/...`). CRA only exposes env vars prefixed with `REACT_APP_`.

JWT secret is hardcoded in `backend/config/auth.config.js` (not env-driven) — treat as a known limitation, not something to silently "fix" without flagging it.

## Backend architecture

Layering is `routes → controller → models`, all mounted under a single router:
- `app.js` wires everything: creates the Express app, calls `sequelizeDB.authenticate()` at startup, mounts `routes/users.js` at `/api/users`.
- `routes/users.js` is the **only** route file — despite the name it defines every endpoint in the app (auth, weight logs, user food, image upload). New endpoints get added here regardless of resource.
- `controller/` has one file per resource: `usersController.js` (auth/register/profile/image upload), `logsController.js` (weight logs), `foodsController.js` (food catalog + per-user food log).
- `models/` are plain Sequelize `define()` calls per file (no `models/index.js` aggregator despite `middleware/authJwt.js` importing from `../models` as if one existed — that import is currently broken/dead code). Import models directly, e.g. `require('../models/user')`.
- Relations: `UserFood belongsTo Food` (`models/userfood.js`), keyed on the `userfood` column referencing `Food.food` (a string primary key, not an id).
- Auth: `middleware/authJwt.js` (`verifyToken`) exists but **is not currently wired into any route** — all endpoints in `routes/users.js` are unauthenticated. Don't assume `x-access-token` checks happen server-side; the frontend only gates access via a `ProtectedRoute` in React Router.
- Image upload: `multer` with `memoryStorage()` streams the buffer straight to Cloudinary via `streamifier` (`utils/cloudinary.js: uploadImageBuffer`); the disk-storage path (`Xstorage`/`XuploadImage`) is legacy/unused, kept for reference.
- `backend/BK/` is a leftover backup folder (old `node_modules`/lockfile) — not part of the running app; ignore it.

## Frontend architecture

- Single-page app bootstrapped by CRA, routed with `react-router-dom` v6 in `App.js`. Auth state is a plain `useState` holding whatever `authService.getCurrentUser()` reads from `localStorage` (key `"user"`, JSON blob including `accessToken`) — not context, not Redux.
- `ProtectedRoute` in `App.js` is a layout route (`<Outlet/>`) gating `/Home`, `/Calendar`, `/Profile` behind a truthy `user`; unauthenticated users only ever see `/` (`Pages/Home/Main.js` → `PublicPage.js`).
- Global UI state that *is* shared via context: `components/UserData/UserData.js` exposes `UserContextProvider`/`useUserContext`, a `useReducer` store currently holding only `imageLink` (the user's profile picture), consumed by `UserNavbar.js` (nav avatar) and `Profile.js` (dispatches `SET_IMAGE` after upload/on load). Anything else about the user (username, email, etc.) is fetched ad hoc per-page via `dashboard.service.js`, not stored in context.
- `src/API/Services/` is the only HTTP layer — `auth.service.js` (login/register/logout/localStorage session) and `dashboard.service.js` (weight logs, food logs, profile fetch/upload). Both build URLs from `REACT_APP_API_BASE_URL` and call `axios` directly; there's no shared axios instance/interceptor, so auth tokens are not attached to requests automatically.
- Page structure under `Pages/`: `Home/` (public landing + register), `Dashboard/Home/` (weight/calorie charts — `LineChart.js`, `WeightLineChart.js`, `CaloriesPieChart.js`), `Dashboard/Logs/` (calendar-based weight/food logging), `Dashboard/Profile/` (profile view/edit + avatar upload). Each page keeps its own `components/` subfolder for page-local pieces.
- Navbar is split by auth state: `components/SharedNavbar/Navbar.js` always renders `GuestNavbar`, and additionally renders `DashboardNavbar/UserNavbar.js` when `user` is truthy — both are mounted simultaneously and use CSS (`classNames`/`hidden`) to switch visibility based on current route, rather than being separate routed layouts.
- Styling mixes Tailwind utility classes (`tailwind.config.js` scans `src/**/*.{js,jsx,ts,tsx}`) with per-component `style.css` files and MUI/Bootstrap components — no single design system, match whatever the file you're editing already uses.
