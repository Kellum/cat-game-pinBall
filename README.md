# Cat Game Pinball

A pinball roguelike hybrid game featuring cats. Built with Phaser 3.

## Game Concept

Launch your cat through a pinball table, defeat enemies, and collect upgrades between rounds. Combines satisfying pinball physics with roguelike progression.

## Tech Stack

- **Phaser 3** - Game framework with Matter.js physics
- **TypeScript** - Type-safe game code
- **Vite** - Fast dev server and builds

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── main.ts              # Game initialization
├── config/
│   └── gameConfig.ts    # Canvas size, physics settings
├── scenes/
│   ├── BootScene.ts     # Asset loading
│   ├── MenuScene.ts     # Character select
│   ├── GameScene.ts     # Main gameplay
│   └── UIScene.ts       # HUD overlay
└── entities/
    ├── Cat.ts           # Player character
    ├── Enemy.ts         # Obstacles to defeat
    └── Platform.ts      # Bouncy platforms
```

## Documentation

| Doc | Purpose |
|-----|---------|
| [ASSET_GUIDE.md](./ASSET_GUIDE.md) | Art asset sizes and formats |
| [CONVENTIONS.md](./CONVENTIONS.md) | Project conventions and rationale |
| [checkpoints/](./checkpoints/README.md) | Development session logs |

## Canvas

- **720 x 1280 px** (9:16 portrait, mobile-first)
- Scales to fit any screen while maintaining aspect ratio

## Contributing

See [CONVENTIONS.md](./CONVENTIONS.md) for code style and technical decisions.
See [ASSET_GUIDE.md](./ASSET_GUIDE.md) for art asset specifications.

## License

MIT
