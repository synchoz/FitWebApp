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
- `npm test` — runs the Jest suite (`services/`, `middleware/`, `utils/`, `dto/`, plus a Supertest integration suite in `routes/`); models/DB calls are mocked, no live MySQL needed
- `npm run lint` — ESLint over the backend (`.eslintrc.json`); wrapped in `cross-env ESLINT_USE_FLAT_CONFIG=false` to force legacy config resolution, since ESLint 8.57+ auto-detects any `eslint.config.js` on the filesystem ancestor chain and would otherwise ignore this file's config
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

JWT secret is env-driven (`JWT_SECRET`, read in `backend/config/auth.config.js`); the app throws at startup if it's unset. `config/auth.config.js` also holds `ACCESS_TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_TTL_DAYS`, `PASSWORD_RESET_TOKEN_TTL_MINUTES`, and `FRONTEND_URL` (used to build password-reset links), each with a sane default.

## Backend architecture

Layering is `routes → controller → models`, all mounted under a single router:
- `app.js` wires everything: creates the Express app, calls `sequelizeDB.authenticate()` at startup, mounts `routes/users.js` at `/api/users`.
- `routes/users.js` is the **only** route file — despite the name it defines every endpoint in the app (auth, weight logs, user food, image upload). New endpoints get added here regardless of resource.
- `controller/` has one file per resource: `usersController.js` (auth/register/profile/image upload), `logsController.js` (weight logs), `foodsController.js` (food catalog + per-user food log).
- `models/` are plain Sequelize `define()` calls per file (no `models/index.js` aggregator despite `middleware/authJwt.js` importing from `../models` as if one existed — that import is currently broken/dead code). Import models directly, e.g. `require('../models/user')`.
- Relations: `UserFood belongsTo Food` (`models/userfood.js`), keyed on the `userfood` column referencing `Food.food` (a string primary key, not an id).
- Auth: `middleware/authJwt.js` (`verifyToken`) is wired into every non-public endpoint in `routes/users.js` (weight/food logs, profile, image upload, logout) via `x-access-token`; it sets `req.userId`/`req.username` from the JWT. `authLimiter`/`apiLimiter` (`middleware/rateLimiters.js`) add IP-keyed rate limiting on top, and `userService.login` adds a separate per-account lockout (5 failed attempts locks the account for 15 minutes, tracked on `User.failedLoginAttempts`/`lockedUntil`).
- Refresh tokens: `services/refreshTokenService.js` issues/rotates opaque tokens (hashed at rest in the `refreshtokens` table). `rotate()` detects reuse of an already-revoked token (a compromise signal) and revokes every session for that user. Expired rows (both refresh tokens and password-reset tokens) are purged on an hourly interval started in `app.js`.
- Image upload: `multer` with `memoryStorage()` streams the buffer straight to Cloudinary via `streamifier` (`utils/cloudinary.js: uploadImageBuffer`); the disk-storage path (`Xstorage`/`XuploadImage`) is legacy/unused, kept for reference. Beyond multer's client-supplied-MIME `fileFilter`, `userService.updateProfileImage` re-validates the actual file bytes (`utils/imageSignature.js`) before trusting the upload.

## Frontend architecture

- Single-page app bootstrapped by CRA, routed with `react-router-dom` v6 in `App.js`. Auth state is a plain `useState` holding whatever `authService.getCurrentUser()` reads from `localStorage` (key `"user"`, JSON blob including `accessToken`) — not context, not Redux.
- `ProtectedRoute` in `App.js` is a layout route (`<Outlet/>`) gating `/Home`, `/Calendar`, `/Profile` behind a truthy `user`; unauthenticated users only ever see `/` (`Pages/Home/Main.js` → `PublicPage.js`).
- Global UI state that *is* shared via context: `components/UserData/UserData.js` exposes `UserContextProvider`/`useUserContext`, a `useReducer` store currently holding only `imageLink` (the user's profile picture), consumed by `UserNavbar.js` (nav avatar) and `Profile.js` (dispatches `SET_IMAGE` after upload/on load). Anything else about the user (username, email, etc.) is fetched ad hoc per-page via `dashboard.service.js`, not stored in context.
- `src/API/Services/` is the only HTTP layer — `auth.service.js` (login/register/logout/forgot-/reset-password/localStorage session) and `dashboard.service.js` (weight logs, food logs, profile fetch/upload). Both call through the shared `src/API/axiosInstance.js`, which attaches `x-access-token` from the stored session on every request and, on a 401, transparently refreshes the access token (via the stored refresh token) and retries once before clearing the session and redirecting to `/`. `src/API/getErrorMessage.js` extracts a display message from an axios error (`error.response.data.message` → `error.message` → `error.toString()`) and is used by every form that surfaces API errors.
- Page structure under `Pages/`: `Home/` (public landing + register), `Dashboard/Home/` (weight/calorie charts — `LineChart.js`, `WeightLineChart.js`, `CaloriesPieChart.js`), `Dashboard/Logs/` (calendar-based weight/food logging), `Dashboard/Profile/` (profile view/edit + avatar upload). Each page keeps its own `components/` subfolder for page-local pieces.
- Navbar is split by auth state: `components/SharedNavbar/Navbar.js` always renders `GuestNavbar`, and additionally renders `DashboardNavbar/UserNavbar.js` when `user` is truthy — both are mounted simultaneously and use CSS (`classNames`/`hidden`) to switch visibility based on current route, rather than being separate routed layouts.
- Styling mixes Tailwind utility classes (`tailwind.config.js` scans `src/**/*.{js,jsx,ts,tsx}`) with per-component `style.css` files and MUI/Bootstrap components — no single design system, match whatever the file you're editing already uses.
