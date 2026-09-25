# BECE Notes website

A React + Vite site that browses the notes stored in this repository (`Semester_*`, `Electives`, ...).

```bash
cd Website
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```

## How the notes get in

There is no hand-maintained file list. `plugins/notes.ts` scans the note folders in the repository root at dev/build time and exposes them as `virtual:notes-manifest`:

- **Dev:** files (including uncommitted ones) are served locally from `/notes/<repo path>`, and the page reloads when notes are added or removed.
- **Build:** only committed files are listed, and they are linked from GitHub (`raw.githubusercontent.com`, or `media.githubusercontent.com` for Git LFS files), so the notes are not copied into `dist/`. Push new notes before deploying.

Subject names, codes and credits come from `src/content/notes.ts`, where each course is matched to its folder name. Folders that aren't in the curriculum (e.g. `Question Collection`, `_Syllabus`) are still shown as resource collections.

## Configuration (optional, via environment or `Website/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `NOTES_REPO` | `adhikari-arpan/BECE_Notes` | GitHub repo used for production file links |
| `NOTES_BRANCH` | `main` | Branch used for production file links |
| `NOTES_FILE_BASE_URL` | GitHub raw/LFS URLs | Serve files from somewhere else instead |
| `BASE_PATH` | `/` | Set to `/BECE_Notes/` for GitHub Pages project sites |

"Last updated" dates come from `git log`, so CI builds should check out full history (e.g. `fetch-depth: 0` in `actions/checkout`).

## Visit counter

The lifetime visit count (home page, stats section, footer) is stored in a Firebase Realtime Database, which never expires on the free plan. The database rules only allow the counter to go **up by exactly 1**, so it can't be lowered or reset from the browser.

Counters live at `counters/<site>/<counter>` (this site uses `counters/bece-notes/visits`), so the same database can hold counters for other projects too — e.g. `counters/portfolio/visits`. The rules accept any lowercase site/counter name, and every counter can only ever go up by 1.

A visit is counted on a browser's first visit and then once per 30 minutes of use or return (logic in `src/content/visits.ts`). Local `npm run dev` counts into a separate `visits-dev` counter.

One-time setup:

1. Go to https://console.firebase.google.com → **Add project** (Google Analytics not needed).
2. **Build → Realtime Database → Create database** → any location → *Start in locked mode*.
3. Open the **Rules** tab, paste the contents of `database.rules.json`, and **Publish**.
4. Copy the database URL shown at the top of the **Data** tab (e.g. `https://your-project-default-rtdb.firebaseio.com`).
5. Put it in `Website/.env` (see `.env.example`) as `VITE_FIREBASE_DB_URL=...`. For deployed builds, set the same variable in your host / CI environment.

Without the variable the counter is simply hidden.
