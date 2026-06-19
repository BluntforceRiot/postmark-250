# Postmark 250

**A Declaration of American Memory** is a tiny retro-styled interactive stamp sheet for America at 250. The collector sheet is the artifact; the webpage is the clickable proof wrapper.

## Demo

Demo URL placeholder:

```text
https://<github-user-or-org>.github.io/postmark-250/
```

Repo URL placeholder:

```text
https://github.com/<github-user-or-org>/postmark-250
```

![Postmark 250 home screenshot](output/postmark-250-home.png)

## Run Locally

```sh
npm install
npm run dev
```

## Build

```sh
npm run typecheck
npm run build
npm run preview
```

## What It Is

Postmark 250 is a static browser artifact for Summer into AI Theme 1: 8-Bit America. It presents one commemorative collector sheet and twelve clickable stamp memory cards. No backend, login, database, user submissions, or online leaderboard are included.

## Theme Connection

America at 250 is interpreted through a cartridge-era archive object: a postal collector sheet booted like a small museum kiosk. The stamps point at places, rituals, ruptures, inventions, screens, ballparks, lakes, migrations, homes, and unfinished arguments.

## Tools Used

- Vite
- TypeScript
- HTML/CSS
- GitHub Pages workflow
- Provided Postmark 250 asset pack

## AI Usage Note

The visual asset pack is AI-assisted and human-curated. Codex was used for implementation, integration, verification, screenshot capture, and review packaging. No replacement poster or new AI art was generated for this build.

## Proof / Scoring Note

The full collector sheet is the hero artifact. The interaction layer proves the sheet can function as a small public, clickable, retro-styled tool for the competition theme.

## GitHub Pages

This repo includes `.github/workflows/deploy.yml`. In GitHub repository settings, set Pages to deploy from GitHub Actions, then push to `main` or run the workflow manually.

The workflow runs:

```sh
npm ci
npm run typecheck
npm run build
```

It deploys `dist`. Vite uses `base: './'` for GitHub Pages project-route compatibility.
