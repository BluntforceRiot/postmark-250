# Postmark 250 Archive

One static GitHub Pages archive containing two distinct Summer into AI Theme 1 submissions. One shared archive. Two distinct Theme 1 artifacts.

## Public Demo

- Archive hub: [https://bluntforceriot.github.io/postmark-250/](https://bluntforceriot.github.io/postmark-250/)
- Postmark 250 direct route: [https://bluntforceriot.github.io/postmark-250/#/postmark-250/](https://bluntforceriot.github.io/postmark-250/#/postmark-250/)
- The Republic Room direct route: [https://bluntforceriot.github.io/postmark-250/#/republic-room/](https://bluntforceriot.github.io/postmark-250/#/republic-room/)
- GitHub repo: [https://github.com/BluntforceRiot/postmark-250](https://github.com/BluntforceRiot/postmark-250)

Hash routes are used for GitHub Pages project-route safety.

## Artifacts

### Postmark 250: A Declaration of American Memory

A clickable commemorative stamp sheet of American memory. The collector sheet is the memory artifact; the webpage is the proof wrapper with hotspots, a stamp grid, and memory-card modals.

### The Republic Room: A Postmark 250 Puzzle Kiosk

A tiny retro point-and-click archive puzzle. Each run selects three Postmark 250 stamps. Players inspect visible relics and decoys, match the correct relics to the active stamps, and unlock the memory cabinet.

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

## Theme Connection

Both artifacts are built for Summer into AI Theme 1: 8-Bit America. Postmark 250 treats America at 250 as a cartridge-era postal collector sheet. The Republic Room turns the same memory fragments into a tiny old-screen museum puzzle.

## Tools Used

- Vite
- TypeScript
- HTML/CSS
- GitHub Pages workflow
- Provided Postmark 250 asset pack

## AI Usage Note

The visual asset pack is AI-assisted and human-curated. Codex was used for implementation, integration, verification, screenshot capture, and review packaging. No new generated art was added for this archive pass.

## Proof / Scoring Note

The repo contains two related but separate submissions. Postmark 250 is the memory artifact. The Republic Room is the puzzle artifact. They share data and visual language intentionally, but each has its own direct proof URL, docs, screenshots, scoring notes, and planned Substack post.

## GitHub Pages

This repo includes `.github/workflows/deploy.yml`. In GitHub repository settings, set Pages to deploy from GitHub Actions, then push to `main` or run the workflow manually.

The workflow runs:

```sh
npm ci
npm run typecheck
npm run build
```

It deploys `dist`. Vite uses `base: './'` and the app uses hash routes for GitHub Pages compatibility.
