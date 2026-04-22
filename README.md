# TAPCLAP Blast Puzzle

Prototype of a Blast-mechanic puzzle game. Built with **React 19**, **PixiJS 8**, **bitecs 0.4** and
**Vite 8**, written in strict-mode TypeScript with a hard separation between game logic (ECS),
rendering (Pixi) and UI (React).

Live demo: **https://ecsmos.github.io/TAPCLAP-Blast/**

![screenshot-placeholder](public/favicon.svg)

## Running locally

```bash
npm install
npm run dev       # dev server on http://localhost:3100/TAPCLAP-Blast/
npm run build     # type-check + production build into dist/
npm run preview   # preview the production bundle
npm run lint      # biome check
```

Requirements: **Node.js >= 20.19** (Vite 8 requirement; Node 22 is used in CI).

## Game rules

- Field: **9 × 9** grid, **5 colors**.
- Click a tile: burns every orthogonally connected same-color tile (group size >= 2).
- Scoring formula: `10 * n + 5 * max(0, n - 2)²`.
- **Win**: reach **500 points** within **30 moves**.
- **Lose**: moves run out, or no moves are possible after 3 automatic shuffles.

### Bonus mechanics (all implemented)

| Feature | Description |
| ------- | ----------- |
| Auto-shuffle | If no valid move exists the field is reshuffled automatically. After 3 shuffles with no solvable layout — defeat. |
| Shuffle booster | Manual shuffle. 5 charges. |
| Bomb booster | Arm, then click a cell. Burns a 3×3 radius. 3 charges. |
| Teleport booster | Arm, click two tiles to swap them. 3 charges. |
| Super-tiles | Groups of 5+ spawn a super-tile instead of burning the click cell. Clicking it burns an area: `Striped` → row, `Wrapped` → column, `Radial` → R=2 circle, `SuperBomb` → whole field. |

All numbers are tuneable in [`src/game/config.ts`](src/game/config.ts) without touching logic.

## Architecture

Three independently testable layers:

```
┌──────────────────┐      intents       ┌───────────────────┐
│   React UI       │ ─────────────────▶ │   Game engine      │
│  (src/ui)        │ ◀───── events ──── │   (src/game, ECS)  │
│  zustand store   │                    │   bitecs World     │
└──────────────────┘                    └────────┬──────────┘
                                                 │ sync()
                                                 ▼
                                        ┌───────────────────┐
                                        │  Pixi renderer     │
                                        │  (src/render)      │
                                        └───────────────────┘
```

### Hard boundaries

- `src/game/**` — **pure TypeScript**. Imports no React, no Pixi. Owns the
  bitecs world, components, services and systems. Can be compiled and run
  in Node (headless) without any DOM.
- `src/render/**` — **Pixi only**. Reads from the ECS world and draws.
  Implements [`RenderAdapter`](src/game/renderAdapter.ts).
- `src/ui/**` — **React only**. Subscribes to the engine's `EventBus` via a
  Zustand store; dispatches typed intents back through the `Game` facade.

### How to swap PixiJS for Phaser

1. Implement a new adapter class that satisfies
   [`RenderAdapter`](src/game/renderAdapter.ts).
2. Instantiate it in [`src/ui/PixiStage.tsx`](src/ui/PixiStage.tsx) (rename
   to `StageContainer` if you like) in place of `PixiAdapter`.
3. Nothing in `src/game/**` needs to change.

### ECS organisation (PlayCanvas-style scheduler)

Per-frame pipeline is a fixed sequence of small, single-responsibility
systems (see [`src/game/index.ts`](src/game/index.ts)):

```
Input → BoosterArm → Booster → Match → SuperTile
      → Destroy → Score → Turn → Cascade → Refill
      → Animation → Shuffle → WinLose
```

Each system is a plain function `(world, dt) => void`. Components are
bitecs Structure-of-Arrays (SoA): `GridPos {row, col}`, `ScreenPos`,
`Tile {color, kind}`, `Falling`, `Dying`, plus tag components
`Matched / Selected / Spawning`.

### File map

```
src/
├─ main.tsx                   # React 19 entry (createRoot)
├─ App.tsx                    # layout: HUD + PixiStage + modals
├─ styles.css                 # full visual theme
├─ vite-env.d.ts
├─ game/
│  ├─ index.ts                # Game facade + pipeline
│  ├─ config.ts               # balance & scoring formula
│  ├─ types.ts                # enums (TileKind, TileColor, GamePhase…)
│  ├─ world.ts                # createBlastWorld + GameState
│  ├─ scheduler.ts            # System type + Scheduler
│  ├─ eventBus.ts             # typed pub/sub
│  ├─ intents.ts              # typed command queue
│  ├─ renderAdapter.ts        # the seam between engine and renderer
│  ├─ seed.ts                 # initial field generation
│  ├─ components/             # bitecs SoA storage
│  │  ├─ Tile.ts, GridPos.ts, ScreenPos.ts
│  │  ├─ Falling.ts, Dying.ts, tags.ts
│  ├─ services/
│  │  ├─ FieldModel.ts        # dense 2D index
│  │  ├─ FloodFill.ts         # BFS group search
│  │  ├─ Solvability.ts       # "is there any move left?"
│  │  ├─ Scoring.ts           # re-exports config formula
│  │  └─ TileFactory.ts       # addEntity + component setup
│  └─ systems/
│     ├─ InputSystem.ts
│     ├─ BoosterArmSystem.ts
│     ├─ BoosterSystem.ts
│     ├─ MatchSystem.ts
│     ├─ SuperTileSystem.ts
│     ├─ DestroySystem.ts
│     ├─ ScoreSystem.ts
│     ├─ TurnSystem.ts
│     ├─ CascadeSystem.ts
│     ├─ RefillSystem.ts
│     ├─ AnimationSystem.ts
│     ├─ ShuffleSystem.ts
│     └─ WinLoseSystem.ts
├─ render/
│  ├─ PixiAdapter.ts          # RenderAdapter over Pixi Application
│  ├─ FieldRenderer.ts        # board + pointer capture
│  ├─ TileGraphics.ts         # Graphics-based placeholder sprites
│  └─ colors.ts               # per-color palette
└─ ui/
   ├─ PixiStage.tsx           # mount/unmount Pixi + bus→store wiring
   ├─ GameContext.tsx         # React context providing Game ref
   ├─ gameStore.ts            # zustand UI state
   ├─ ScorePanel.tsx          # "ОЧКИ 221/500" + moves circle
   ├─ BoosterBar.tsx          # booster buttons
   └─ EndModal.tsx            # Win / Lose modal
```

### Replacing placeholder art with PNGs

The renderer currently draws every tile from `PixiJS.Graphics`. To swap in
PNG assets:

1. Drop images into `public/assets/tiles/` using names like
   `blue.png`, `red.png`, …, `super_bomb.png`.
2. In [`src/render/TileGraphics.ts`](src/render/TileGraphics.ts), replace
   the `drawColorTile` / `drawStriped` / … calls with `Sprite` creation
   using `Assets.load('./assets/tiles/…').`.
3. No engine code changes.

## Tech stack (versions)

| Package | Version |
| ------- | ------- |
| react / react-dom | ^19.2.5 |
| pixi.js | ^8.18.1 |
| bitecs | ^0.4.0 |
| zustand | ^5.0.12 |
| typescript | ^5.9.3 |
| vite | ^8.0.9 |
| @biomejs/biome | ^2.0.0 |

## Deployment

Pushing to `main` triggers [`deploy.yml`](.github/workflows/deploy.yml) in
GitHub Actions, which builds the production bundle and publishes `dist/`
to GitHub Pages via the official Pages action. The base path is set to
`/TAPCLAP-Blast/` in `vite.config.ts`.

## License

MIT
