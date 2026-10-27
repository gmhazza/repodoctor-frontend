# Repo Doctor

A Vue single-page application for reviewing public GitHub repositories. Submit a repository URL, inspect findings by severity, and read suggested fixes in a minimal interface with dark and light themes.

This repository contains the **frontend only**. Repository analysis and feedback delivery require a separately running backend that follows `backend.api.md`.

## Contents

1. Overview and features
2. Tech stack
3. Requirements
4. Getting started
5. Environment configuration
6. Available commands
7. File structure
8. Routes and navigation
9. Component responsibilities and data flow
10. Backend API integration
11. Themes and persistence
12. Verification and deployment

## 1. Overview and features

- Welcome page with a **Start analyzing** button leading to the analyzer.
- Public GitHub repository URL input with validation and loading/error feedback.
- Scan summary showing files scanned, issues found, and high-priority findings.
- Severity filters: all, critical, high, medium, and low.
- Issue inspector with file location, description, and suggested fix.
- Skipped-file preview and analysis metadata.
- Feedback form connected to the backend mail endpoint.
- Responsive layouts and an animated dark/light theme switcher.

The analyzer starts empty. There is no sample scan or preloaded repository; results come from the backend. Scan results are held in memory and reset when the analyzer view is recreated or the page is reloaded.

## 2. Tech stack

| Technology            | Role                                                                           |
| --------------------- | ------------------------------------------------------------------------------ |
| Vue 3                 | Single-file components using the Composition API and `<script setup>`          |
| Vue Router 5          | Lazy-loaded page routes with HTML5 history                                     |
| Tailwind CSS 4        | Utility styling, integrated through `@tailwindcss/vite`                        |
| Vite 8                | Development server and production builds                                       |
| JavaScript ES modules | Application code; this project does not use TypeScript                         |
| Pinia 4               | Registered in `src/main.js`; the current analyzer uses local Vue state instead |
| Browser Fetch API     | JSON requests to the backend                                                   |
| Oxfmt                 | Source-code formatting                                                         |
| npm                   | Dependency management with `package-lock.json`                                 |

See `package.json` for dependency ranges and `package-lock.json` for resolved versions. `vite-plugin-vue-devtools` is installed but is not currently enabled in `vite.config.js`.

## 3. Requirements

- Node.js matching the project engine requirement: `^22.18.0 || >=24.12.0`.
- npm.
- A backend for live analysis and feedback.

The welcome page and empty analyzer can be viewed without a backend, but analysis and feedback submissions will not succeed until one is configured.

## 4. Getting started

Run commands from the repository root.

### Install dependencies

```sh
npm ci
```

### Configure the backend

Create a local `.env` file using `.env.example` as the template. If `.env` already exists, update it instead of overwriting it.

For a separate local backend, set its actual origin. The following port is an example, not a required backend port:

```dotenv
VITE_API_BASE_URL=http://localhost:3000
```

### Start the frontend

```sh
npm run dev
```

Open the local address printed by Vite, usually `http://localhost:5173/`. Click **Start analyzing**, enter a public GitHub repository URL, and submit it with **Analyze repo**.

## 5. Environment configuration

| Variable            | Default      | Purpose                                      |
| ------------------- | ------------ | -------------------------------------------- |
| `VITE_API_BASE_URL` | Empty string | Backend origin used by `src/services/api.js` |
| `VITE_SITE_URL` | Current browser origin | Canonical site origin used for route metadata and structured data |

- Leave the value empty only when `/api/analyze` and `/mail` are served or proxied on the frontend's origin.
- For a separate backend, use its origin without an `/api` suffix: the service appends `/api/analyze` and `/mail` itself.
- `vite.config.js` currently has **no API proxy**. A blank value does not automatically connect to a backend running on another port.
- A backend on a different origin must allow the frontend origin through CORS, including JSON POST requests.
- Restart the development server after changing environment configuration. Production environment values must be supplied before building; rebuild to change the API origin in an existing bundle.
- `VITE_*` values are client-visible configuration. Never put credentials, private API keys, or other secrets in them. `.env` is ignored by Git.

For production SEO, set `VITE_SITE_URL` to the public HTTPS origin, for example `https://repodoctor.example.com`. If it is empty, the app falls back to the current browser origin at runtime.

## 6. Available commands

| Command                     | Purpose                                            |
| --------------------------- | -------------------------------------------------- |
| `npm ci`                    | Install dependencies from the lockfile             |
| `npm run dev`               | Start the Vite development server                  |
| `npm run build`             | Build the production frontend into `dist/`         |
| `npm run preview`           | Preview an existing production build locally       |
| `npm run format`            | Format files under `src/` with Oxfmt               |
| `npm run format -- --check` | Check source formatting without changing files     |
| `npm audit`                 | Check dependencies against npm's advisory database |

There are currently no automated test, lint, or type-check scripts configured in `package.json`.

## 7. File structure

```text
repodoctor-frontend/
├── .env.example                 # Example frontend environment configuration
├── .gitignore                   # Ignored local files, including .env and dist/
├── backend.api.md               # Backend endpoint contract and response shapes
├── index.html                   # HTML entry point and theme flash-prevention script
├── jsconfig.json                # JavaScript path alias configuration
├── package.json                 # Scripts, dependencies, and Node.js engine range
├── package-lock.json            # Locked dependency versions
├── vite.config.js               # Vue, Tailwind, and alias configuration
├── public/
│   ├── favicon.ico              # Legacy favicon asset
│   ├── favicon.svg              # Active SVG favicon
│   └── robots.txt               # Crawler directives
└── src/
    ├── App.vue                  # Root shell rendering RouterView
    ├── main.js                  # Vue, Pinia, router, and stylesheet bootstrap
    ├── assets/
    │   ├── app.css              # Shared layout, component, and theme styles
    │   └── main.css             # Tailwind and app.css imports
    ├── components/
    │   ├── AnalyzerHeader.vue   # Analyzer top bar and actions
    │   ├── AnalyzerSidebar.vue  # Analyzer navigation and feedback entry point
    │   ├── BrandMark.vue         # Reusable Repo Doctor logo mark
    │   ├── FeedbackModal.vue     # Feedback form and mail submission UI
    │   ├── FindingsPanel.vue     # Filterable findings and issue inspector
    │   ├── RepositoryHero.vue    # Repository URL input and analyze action
    │   ├── ScanDetails.vue       # Skipped files and metadata
    │   ├── ScanOverview.vue      # Scan status and summary cards
    │   └── ThemeToggle.vue       # Dark/light mode switcher
    ├── composables/
    │   └── useTheme.js           # Shared theme state and localStorage persistence
    ├── router/
    │   └── index.js              # Application routes and fallback redirect
    ├── services/
    │   └── api.js                # Backend analyze and feedback requests
    ├── utils/
    │   └── seo.js                # Route-aware document metadata and JSON-LD
    ├── stores/
    │   └── counter.js            # Starter Pinia example; not used by the analyzer
    └── views/
        ├── AnalyzerView.vue     # Repository analysis page state and composition
        ├── NotFoundView.vue     # Themed 404 page for unmatched routes
        └── WelcomeView.vue      # First page shown to users
```

## 8. Routes and navigation

Routes are defined in `src/router/index.js` using `createWebHistory`.

| Path               | Route name | View               | Purpose                                          |
| ------------------ | ---------- | ------------------ | ------------------------------------------------ |
| `/`                | `welcome`  | `WelcomeView.vue`  | Entry page and product introduction              |
| `/analyze`         | `analyze`  | `AnalyzerView.vue` | Repository URL submission and findings dashboard |
| Any unmatched path | `not-found` | `NotFoundView.vue` | Shows the themed 404 page with links to `/` and `/analyze` |

The welcome page navigates to `/analyze` with Vue Router. The analyzer sidebar and mobile header link back to `/` using `RouterLink`. Any unmatched path renders the 404 page instead of silently redirecting.

## 9. Component responsibilities and data flow

### Application shell

`App.vue` applies the active theme class and renders `<RouterView />`. Route-level views are lazy-loaded by the router.

### Welcome view

`WelcomeView.vue` provides the first-run experience and uses:

- `BrandMark.vue` for branding.
- `ThemeToggle.vue` for the theme switcher.
- `useRouter()` to navigate to the analyzer route.

### Analyzer view

`AnalyzerView.vue` owns analyzer state:

- Repository input value.
- Current API response.
- Selected finding.
- Active severity filter.
- Loading and error state.
- Feedback modal visibility.

It composes the analyzer UI from smaller components and calls `src/services/api.js` for backend requests.

### API services

`src/services/api.js` keeps HTTP calls outside the view layer:

- `analyzeRepository(repository)` sends a JSON `POST` to `/api/analyze`.
- `sendFeedback(payload)` sends a JSON `POST` to `/mail`.

## 10. Backend API integration

The frontend expects the following endpoints. Full request and response examples are in `backend.api.md`.

### Analyze repository

```http
POST /api/analyze
Content-Type: application/json
```

Request body:

```json
{
  "repository": "https://github.com/owner/repository"
}
```

The frontend expects an object containing:

- `repository.owner`
- `repository.name`
- `summary`
- `problems[]`
- `skippedFiles[]`
- `failedFiles[]`

### Send feedback

```http
POST /mail
Content-Type: application/json
```

Request body:

```json
{
  "name": "Jane Doe",
  "subject": "Feedback",
  "body": "Your message"
}
```

The frontend treats any non-2xx response as a failed submission and displays an error in the modal.

### Health endpoint

The backend contract documents `GET /health`, but the current frontend does not call or display health status.

## 11. Themes and persistence

- Dark mode is the default.
- Light mode is available from the welcome page and analyzer header.
- `src/composables/useTheme.js` stores the preference in `localStorage` under `repo-doctor-theme`.
- `index.html` applies the stored theme before Vue mounts to reduce the initial theme flash.
- Theme styles are defined in `src/assets/app.css` under `.theme-light` overrides.

## 12. SEO

- `index.html` provides baseline title, description, author, robots, Open Graph, and Twitter metadata.
- `src/utils/seo.js` updates title, description, robots, canonical URL, Open Graph, Twitter, and JSON-LD metadata after route changes.
- The welcome route is indexable; the interactive analyzer route uses `noindex, follow`; unmatched routes use `noindex, nofollow`.
- `public/robots.txt` allows the welcome page and disallows the analyzer utility route.
- Set `VITE_SITE_URL` to a stable public origin for correct canonical URLs and structured-data URLs.
- Because this is a client-rendered SPA, full social-preview and search rendering can depend on crawler JavaScript support. SSR or prerendering is recommended if search visibility becomes a primary requirement.

## 13. Verification and deployment

### Local verification

Run the formatter check and production build before opening a pull request:

```sh
npm run format -- --check
npm run build
```

For a local production preview:

```sh
npm run preview
```

### Deployment notes

- Deploy the generated `dist/` directory to a static web host or serve it through a web server.
- Configure the production `VITE_API_BASE_URL` before running `npm run build`.
- Configure the server/CDN to serve `index.html` as the fallback for `/` and `/analyze`; Vue Router uses HTML5 history.
- Configure CORS on the backend when the frontend and API use different origins.
- Add production security headers at the hosting layer, including a suitable Content Security Policy, HSTS, `X-Content-Type-Options`, and `Referrer-Policy`.
- Do not expose backend credentials or private keys in frontend environment variables or committed files.
