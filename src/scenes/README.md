# Game Scenes

This directory contains all Phaser 3 scene implementations for Satisfying Drifting.

## Scene Lifecycle

Scenes follow the standard Phaser 3 lifecycle:

1. **init(data)** - Initialize scene-level configurations
2. **preload()** - Load assets required for this scene
3. **create()** - Set up game objects, systems, and logic
4. **update(time, delta)** - Called every frame (60 FPS target)
5. **shutdown()** - Clean up when scene ends

## Scene Architecture

### Scene Flow

```
BootScene → PreloadScene → MenuScene → GameScene
```

### Scene Responsibilities

#### BootScene (Story 1.2.1) ✅
- **Purpose:** System initialization and critical asset loading
- **Duration:** < 500ms
- **Transitions to:** PreloadScene
- **Key Features:**
  - Initializes global managers
  - Loads critical assets (< 100KB)
  - Sets up registry for cross-scene data
  - Optional logo display

#### PreloadScene (Story 1.2.2)
- **Purpose:** Load all game assets
- **Transitions to:** MenuScene
- **Key Features:**
  - Progress bar display
  - Asset loading with feedback
  - Audio setup
  - Font preloading

#### MenuScene (Future)
- **Purpose:** Main menu and navigation
- **Transitions to:** GameScene, SettingsScene
- **Key Features:**
  - Menu UI
  - Settings access
  - Track selection
  - Car selection

#### GameScene (Future)
- **Purpose:** Main gameplay
- **Transitions to:** MenuScene, PauseScene
- **Key Features:**
  - Physics simulation
  - Player controls
  - Camera system
  - HUD display

## Scene Data Passing

Scenes can pass data to each other using typed interfaces defined in `src/types/SceneData.ts`:

```typescript
// Example: Transitioning with data
this.scene.start('PreloadScene', preloadData);

// In PreloadScene:
init(data: PreloadSceneData): void {
  // Access passed data
}
```

## Registry Usage

The scene registry is used for persistent data across scenes:

```typescript
// Store in one scene
this.registry.set('audioManager', audioManager);

// Access in another scene
const audioManager = this.registry.get('audioManager');
```

## Scene Management Best Practices

1. **Keep init() minimal** - Just configuration
2. **Use preload() only for assets** - Don't do heavy logic
3. **Put setup in create()** - Initialize game objects here
4. **Clean up in shutdown()** - Remove listeners, tweens, timers
5. **Use registry for managers** - Not global variables
6. **Type scene data** - Use TypeScript interfaces
7. **Target 60 FPS** - Optimize update() methods
8. **Handle errors gracefully** - Don't crash the game

## Performance Targets

| Scene | Boot Time | Memory | FPS |
|-------|-----------|--------|-----|
| BootScene | < 500ms | < 50MB | 60 |
| PreloadScene | 2-5s | < 200MB | 60 |
| GameScene | < 100ms | < 300MB | 60 |

## Development

### Adding a New Scene

1. Create scene class extending `Phaser.Scene`
2. Add scene data interface to `src/types/SceneData.ts`
3. Register scene in `src/config/GameConfig.ts`
4. Implement lifecycle methods
5. Add unit tests in `tests/scenes/`
6. Document in this README

### Testing Scenes

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Manual testing
npm run dev
```

## Current Implementation Status

- ✅ **BootScene** - Complete (Story 1.2.1)
- 🚧 **PreloadScene** - Placeholder (Story 1.2.2)
- ⏳ **MenuScene** - Not started
- ⏳ **GameScene** - Not started

## References

- [Phaser 3 Scene Documentation](https://docs.phaser.io/api-documentation/class/scene)
- [Game Architecture Document](../docs/Satisfying-Drifting-game-architecture.md)
- [Scene Management System](../docs/Satisfying-Drifting-game-architecture.md#scene-management-system)
