# Weight n Waist

A responsive, mobile-friendly measurement journal built with plain HTML, CSS, and JavaScript.

- Log weight and waist with optional hip, chest, thigh, upper arm, and neck measurements.
- Follow progress charts, filter date ranges, and review or edit history.
- Switch between metric and imperial units.
- Export CSV backups.
- Explore a clearly labeled sample journal before creating real entries.
- Install as a standalone PWA and log measurements offline after the first successful online load.

## Install the app

Open the deployed HTTPS site and go to **Settings → Take your journal with you**. An **Install app** button appears when the browser offers installation. You can also use the browser's install menu. On iPhone/iPad, open in Safari and choose **Share → Add to Home Screen**.

Wait for **Ready for offline check-ins on this device** in Settings before going offline. The app shell is cached locally; measurements remain in browser storage. External fonts may use system fallbacks offline. Installation does not provide cloud backup or cross-device synchronization, and browser storage can still be cleared or evicted.

Updates download in the background. Save your check-in, close all app windows and browser tabs for this site, and reopen to activate a waiting update. This avoids reloading an unsaved entry. Developers must bump `CACHE` in `weight-n-waist-app/dist/sw.js` whenever changing any cached app asset. PNG app icons can be regenerated on Windows with `scripts/generate-icons.ps1`.

## Deploy to Vercel

Import **Johan-Melin/weight-n-waist** in Vercel and keep the **Root Directory** set to the repository root (`./`). Click **Deploy**.

The checked-in `vercel.json` sets:

| Setting | Value |
| --- | --- |
| Framework | Other |
| Build command | Empty — no build needed |
| Install command | Empty — no dependencies |
| Output directory | `weight-n-waist-app/dist` |

No database, environment variables, API keys, or server functions are required. Once linked, Vercel can deploy subsequent GitHub pushes automatically. Configuration follows [Vercel's static project configuration](https://vercel.com/docs/project-configuration/vercel-json).

## Run locally

With Node.js 20 or later installed:

```sh
npm run dev
```

Open `http://127.0.0.1:4173`. Dependency installation is unnecessary.

```sh
npm run check
npm test
```

## Storage and privacy

Measurements are stored in `localStorage` in the current browser, scoped to the site's origin. They do not sync across browsers or devices. Clearing browser data removes the journal. A new deployment hostname has separate storage. Export CSV regularly for backups; CSV import is not yet supported. Sample data is synthetic and is kept separate from actual entries.

The app has no account system or server-side measurement storage. Hosting providers serve the app assets; fonts load from Google Fonts, with system font fallbacks. Use the browser/device's own security for local data privacy.

## Source

The deployable app is in `weight-n-waist-app/dist/` (`index.html`, `style.css`, and `app.js`). Despite the directory name, these are the editable source files: no generated build step is involved. `scripts/serve.mjs` provides the local development server.
