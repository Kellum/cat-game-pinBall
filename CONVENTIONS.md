# Project Conventions & Reference

This document explains the **why** behind our technical decisions. If you're new to the project or wondering why something is done a certain way, start here.

---

## Table of Contents
- [Tech Stack](#tech-stack)
- [Canvas & Dimensions](#canvas--dimensions)
- [Image Formats](#image-formats)
- [Asset Sizing](#asset-sizing)
- [File Organization](#file-organization)
- [Code Conventions](#code-conventions)

---

## Tech Stack

### Why Phaser 3?
- **Mature & stable** - Large community, extensive documentation
- **Built-in physics** - Matter.js integration handles pinball physics (bouncing, flippers, collision)
- **WebGL + Canvas fallback** - Fast rendering with broad browser support
- **Mobile-friendly** - Touch input, scaling, and viewport handling built-in

### Why TypeScript?
- **Catch errors early** - Type checking prevents runtime bugs
- **Better IDE support** - Autocomplete, refactoring, go-to-definition
- **Self-documenting** - Types serve as inline documentation

### Why Vite?
- **Fast dev server** - Hot module replacement for quick iteration
- **Simple config** - Less boilerplate than Webpack
- **Modern defaults** - ES modules, tree shaking out of the box

---

## Canvas & Dimensions

### Why 720x1280?
- **9:16 aspect ratio** - Standard mobile portrait ratio (fits most phones)
- **720px width** - Wide enough for detail, small enough for performance
- **1280px height** - Gives vertical space for pinball table layout

### Why not 1080x1920 (full HD)?
- Larger canvases = more pixels to render = worse performance on low-end devices
- 720x1280 looks sharp on mobile and scales well
- You can always design assets at 2x (1440x2560) and downscale for retina displays

---

## Image Formats

### Why PNG for sprites?
- **Lossless compression** - No artifacts or quality loss
- **Alpha channel** - Supports full transparency (crucial for game sprites)
- **Wide support** - Works everywhere, no compatibility issues

### Why not WebP?
- Older browsers/devices may not support it
- PNG is sufficient for our use case
- Not worth the compatibility risk for marginal file size gains

### Why not SVG?
- Phaser renders to Canvas/WebGL, not DOM
- SVG would need to be rasterized anyway
- Adds complexity without benefit for our sprite-based game

### Why JPG for backgrounds only?
- **Smaller file size** - Good for large images without transparency
- **Lossy is acceptable** - Background detail loss is less noticeable
- **No alpha channel** - Fine for solid backgrounds, not for sprites

### Why not GIF?
- Limited to 256 colors
- Poor transparency support (1-bit alpha, no semi-transparency)
- Outdated format for game assets

---

## Asset Sizing

### Why "Power of 2" doesn't matter here

**Historical context:** Older GPUs required textures to be power-of-2 dimensions (16, 32, 64, 128, 256, 512, 1024, 2048 px). Non-compliant textures would either fail or get padded internally, wasting memory.

**Modern reality:** WebGL (which Phaser uses) handles **NPOT** (non-power-of-two) textures without issue. You can use any dimensions.

**When power-of-2 still matters:**
- Texture tiling/wrapping (repeating patterns won't tile correctly with NPOT in WebGL)
- Very old mobile devices (increasingly rare)
- Some 3D engines that use mipmapping

**Our approach:** Use whatever dimensions make sense for the art. A 120x40 flipper is fine. Don't artificially pad to 128x64.

### Why design at 2x and downscale?
- **Retina/HiDPI displays** - Many screens have 2x or 3x pixel density
- **Future-proofing** - Easy to export larger sizes later if needed
- **Flexibility** - Downscaling looks better than upscaling

### Why these specific sizes?

| Asset | Size | Reasoning |
|-------|------|-----------|
| Cat (128x128) | 2x the rendered size (~64px) for crisp scaling |
| Board BG (720x1280) | Exact canvas size, no scaling needed |
| Enemies (64x64) | Small enough to have several on screen, big enough for detail |
| Flipper (120x40) | Matches typical pinball flipper proportions |
| UI icons (48x48) | Standard touch-friendly size, visible but not intrusive |

---

## File Organization

```
/public/assets/
  /sprites/      <- Game objects (player, enemies, pinball elements)
  /backgrounds/  <- Level backgrounds, board art
  /ui/           <- HUD elements, menus, buttons
  /audio/        <- Sound effects, music (future)
```

### Why this structure?
- **Logical grouping** - Easy to find assets by type
- **Scalable** - Can add subcategories as project grows
- **Build-friendly** - Vite copies `/public` to `/dist` as-is

---

## Code Conventions

### Scene structure
- `BootScene` - Asset loading, texture generation
- `MenuScene` - Title screen, settings
- `GameScene` - Main gameplay logic
- `UIScene` - HUD overlay (runs parallel to GameScene)

### Why separate UIScene?
- UI stays fixed while game camera moves
- Cleaner separation of concerns
- Easier to manage UI state independently

### Entity pattern
Each game object (Cat, Enemy, Platform) is its own class extending Phaser objects. This keeps logic encapsulated and reusable.

### Physics bodies
- **Dynamic** - Things that move (cat/ball)
- **Static** - Things that don't move (walls, flippers at rest)
- **Sensors** - Detect collision but don't physically block (triggers, scoring zones)

---

## Questions?

If something isn't covered here or doesn't make sense, add it! This is a living document.
