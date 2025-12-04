# Art Asset Guide - Cat Pinball Roguelike

## Tech Specs
- **Canvas Size**: 720 x 1280 px (9:16 portrait)
- **Engine**: Phaser 3 with Matter.js physics

---

## Image Formats

| Use Case | Format | Why |
|----------|--------|-----|
| Sprites with transparency | **PNG-24** | Lossless, alpha channel support |
| Sprite sheets/animations | **PNG-24** | Best for texture atlases |
| Large backgrounds | **JPG** (quality 80-90) | Smaller file size |
| Pixel art | **PNG-8 or PNG-24** | Preserves hard edges |

**Avoid**: GIF, WebP, SVG

---

## Minimum Asset List & Sizes

### Player Character (Cat)
| Asset | Size | Notes |
|-------|------|-------|
| Idle sprite | **128x128 px** | 2x for crisp scaling |
| Animation frames | **128x128 px each** | 4-8 frames optional |

### Pinball Board / Level Background
| Asset | Size | Notes |
|-------|------|-------|
| Full board BG | **720x1280 px** | Exact canvas size |
| Tileable section | **720x640 px** | Half-height for variety |

*Tip*: Design at **1440x2560 px** (2x) for retina quality.

### Enemies (1-2 types)
| Asset | Size | Notes |
|-------|------|-------|
| Small enemy | **64x64 px** | Bumpers, small obstacles |
| Large enemy | **96x96 px** | Boss-style targets |
| Hit/death frame | Same size | Flash or explosion state |

### Pinball Elements
| Asset | Size | Notes |
|-------|------|-------|
| Flipper | **120x40 px** | Wide paddle shape |
| Bumper | **64x64 px** | Round bouncy obstacles |
| Launcher/plunger | **48x160 px** | Tall, narrow |
| Rails/guides | **16px wide** | Variable length, tileable |

### UI Elements
| Asset | Size | Notes |
|-------|------|-------|
| Heart/life icon | **48x48 px** | Health display |
| Upgrade icons | **64x64 px** | Roguelike powerups |
| Score display BG | **200x60 px** | Panel behind numbers |

### Roguelike Upgrade Cards
| Asset | Size | Notes |
|-------|------|-------|
| Card background | **180x240 px** | Standard card ratio |
| Card icon | **80x80 px** | Centered on card |

---

## Quick Start: Bare Minimum Test Kit

Provide these **6 assets** for initial testing:

1. `cat_idle.png` - 128x128 px (player)
2. `board_bg.png` - 720x1280 px (level background)
3. `enemy_small.png` - 64x64 px (bumper enemy)
4. `flipper.png` - 120x40 px (pinball flipper)
5. `bumper.png` - 64x64 px (bouncy obstacle)
6. `heart.png` - 48x48 px (life icon)

---

## File Organization

```
/public/assets/
  /sprites/
    cat_idle.png
    enemy_small.png
    enemy_large.png
    flipper.png
    bumper.png
  /backgrounds/
    board_bg.png
  /ui/
    heart.png
    heart_empty.png
    upgrade_icons.png
```

---

## Tips

1. **Transparency** - Use PNG with alpha for all sprites
2. **Consistent style** - Match line weights and color palette
3. **Test at actual size** - Preview at 720x1280 before finalizing
4. **Sprite sheets later** - Start with individual PNGs, optimize later
