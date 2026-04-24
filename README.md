# TAPCLAP Blast Puzzle

Blast-style puzzle prototype built with React + Pixi + bitecs ECS.

Live demo: https://ecsmos.github.io/TAPCLAP-Blast/

## Stack

- React 19
- PixiJS 8
- bitecs 0.4
- Zustand 5
- Vite 8
- TypeScript 6
- Biome 2

## Run locally

```bash
bun install
bun run dev
bun run build
bun run preview
bun run typecheck
bun run lint
```

Notes:
- `build` builds only frontend bundle (`dist/`).
- `typecheck` runs `tsc --noEmit`.

## Gameplay

- Grid: 9x9, 5 tile variants.
- Tap/click connected group of same color (orthogonal).
- Win: reach target score before moves run out.
- Lose: no moves left or shuffle limit reached.

Boosters:
- Shuffle
- Bomb
- Teleport

Super tiles are spawned and processed by ECS systems (`Match`, `SuperTile`, etc.).

All gameplay numbers are configurable in `src/game/config.ts`.

## Architecture

Project is split into 3 layers:

- `src/game` — pure game logic (ECS world, systems, services, event bus).
- `src/render` — Pixi renderer + adapters (`PixiAdapter`, `GridRenderer`, `UIRenderer`).
- `src/ui` — React shell (`PixiStage`, modal UI, context/store wiring).

Main loop pipeline is defined in `src/game/index.ts`.

## Current structure

```text
src/
  game/
    bootstrap.ts
    config.ts
    index.ts
    components/
    core/
    factories/
    services/
    systems/
  render/
    GridRenderer.ts
    PixiAdapter.ts
    TileGraphics.ts
    UIRenderer.ts
  ui/
    EndModal.tsx
    GameContext.tsx
    PixiStage.tsx
    gameStore.ts
```

## Assets

UI and tile art is loaded from `public/assets`.

## Deployment (GitHub Pages)

- Vite base is set to `/TAPCLAP-Blast/` in `vite.config.ts`.
- Workflow: `.github/workflows/deploy.yml`.
- On push to `main`/`master`, CI builds and deploys `dist/` to GH Pages using `peaceiris/actions-gh-pages`.

## License

MIT
