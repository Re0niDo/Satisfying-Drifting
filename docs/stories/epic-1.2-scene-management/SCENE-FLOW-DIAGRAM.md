# Scene Flow Diagram - Epic 1.2 Scene Management

**Last Updated:** November 2, 2025  
**Status:** Stories 1.2.1-1.2.4 COMPLETE

## Current Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│                         GAME STARTUP                             │
│                     (main.ts initializes)                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ✅ BOOTSCENE                              │
│                     (Story 1.2.1 - COMPLETE)                     │
├─────────────────────────────────────────────────────────────────┤
│  init():                                                         │
│    • Track boot start time                                       │
│    • Log initialization (dev mode)                               │
│                                                                  │
│  preload():                                                      │
│    • Load critical assets (< 100KB)                              │
│    • Optional: logo.png                                          │
│    • Log progress (dev mode)                                     │
│                                                                  │
│  create():                                                       │
│    • Initialize global managers → registry                       │
│    • Optional: Display logo (200ms fade)                         │
│    • Transition to PreloadScene                                  │
│                                                                  │
│  shutdown():                                                     │
│    • Clean up tweens and timers                                  │
│    • Log shutdown (dev mode)                                     │
│                                                                  │
│  Performance: ~344ms (Target: < 500ms) ✅                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ scene.start('PreloadScene')
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ✅ PRELOADSCENE                             │
│                     (Story 1.2.2 - COMPLETE)                     │
├─────────────────────────────────────────────────────────────────┤
│  init():                                                         │
│    • Store scene data (fastLoad flag)                            │
│    • Log initialization (dev mode)                               │
│                                                                  │
│  preload():                                                      │
│    • Create progress bar UI (400x30px)                           │
│    • Load all game assets (images, audio)                        │
│    • Update progress display (0-100%)                            │
│    • Handle load errors gracefully                               │
│                                                                  │
│  create():                                                       │
│    • Enforce minimum 500ms display time                          │
│    • Fade out progress screen (300ms)                            │
│    • Transition to MenuScene                                     │
│                                                                  │
│  shutdown():                                                     │
│    • Clean up progress UI elements                               │
│    • Remove event listeners                                      │
│    • Log shutdown (dev mode)                                     │
│                                                                  │
│  Performance: < 3s load time, 60 FPS maintained ✅               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ scene.start('MenuScene', { assetsLoaded: true })
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ✅ MENUSCENE                              │
│                     (Story 1.2.3 - COMPLETE)                     │
├─────────────────────────────────────────────────────────────────┤
│  init():                                                         │
│    • Store scene data (assetsLoaded flag)                        │
│    • Initialize menu state                                       │
│                                                                  │
│  create():                                                       │
│    • Display game title                                          │
│    • Create mode selection (Practice/Score)                      │
│    • Setup keyboard navigation                                   │
│    • Start menu music (if available)                             │
│    • Create selection indicator with tweens                      │
│                                                                  │
│  Mode Selection:                                                 │
│    • Navigate: ↑↓ Arrow Keys, W/S, 1/2                          │
│    • Confirm: Enter/Space                                        │
│                                                                  │
│  Track Selection:                                                │
│    • Display 5 tracks with details                               │
│    • Navigate: ↑↓ Arrow Keys, 1-5 shortcuts                     │
│    • Back: ESC                                                   │
│    • Confirm: Enter → Transition to GameScene                    │
│                                                                  │
│  shutdown():                                                     │
│    • Stop menu music                                             │
│    • Remove keyboard listeners                                   │
│    • Clean up selection state                                    │
│    • Kill tweens and timers                                      │
│                                                                  │
│  Performance: 60 FPS, < 50ms input latency ✅                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ scene.start('GameScene', GameSceneData)
                            │ { mode, trackId, trackName }
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ✅ GAMESCENE                              │
│                 (Story 1.2.4 - COMPLETE - Phase 1)               │
├─────────────────────────────────────────────────────────────────┤
│  init(data):                                                     │
│    • Store mode (practice/score)                                 │
│    • Store track info (id, name)                                 │
│    • Validate scene data                                         │
│                                                                  │
│  create():                                                       │
│    • Display track name (top center)                             │
│    • Display game mode (uppercase)                               │
│    • Show placeholder message                                    │
│    • Show control instructions                                   │
│    • FPS counter (dev mode, top right)                           │
│    • Setup keyboard handlers                                     │
│                                                                  │
│  Controls:                                                       │
│    • [R] - Instant restart (150ms fade)                          │
│    • [ESC] - Return to menu (300ms fade)                         │
│                                                                  │
│  update():                                                       │
│    • Update FPS display (dev mode)                               │
│    • Placeholder for gameplay (Phase 2)                          │
│                                                                  │
│  shutdown():                                                     │
│    • Remove keyboard listeners                                   │
│    • Clean up tweens and timers                                  │
│    • Clear scene data                                            │
│                                                                  │
│  Performance: 60 FPS maintained ✅                               │
│                                                                  │
│  Phase 2 (Future):                                               │
│    • Player car controls                                         │
│    • Track rendering                                             │
│    • Physics and collision                                       │
│    • Scoring system                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Scene Data Flow

```
┌──────────────┐
│  BootScene   │
│              │
│  init(data)  │  ← BootSceneData (empty, first scene)
└──────┬───────┘
       │
       │ Stores managers in registry:
       │   • this.registry.set('audioManager', ...)
       │   • this.registry.set('inputManager', ...)
       │   • etc.
       │
       │ Transitions with data:
       ▼
┌──────────────────┐
│  PreloadScene    │
│                  │
│  init(data)      │  ← PreloadSceneData { fastLoad?: boolean }
└──────┬───────────┘
       │
       │ Loads all game assets
       │ Transitions with data:
       ▼
┌──────────────────┐
│   MenuScene      │
│                  │
│  init(data)      │  ← MenuSceneData { assetsLoaded: boolean }
└──────┬───────────┘
       │
       │ User selects mode and track
       │ Transitions with data:
       ▼
┌──────────────────┐
│   GameScene      │
│                  │
│  init(data)      │  ← GameSceneData { mode, trackId, trackName }
└──────┬───────────┘
       │
       │ User presses ESC to return
       │ Transitions back with data:
       ▼
┌──────────────────┐
│   MenuScene      │
│  (returns)       │  ← MenuSceneData { assetsLoaded: true }
└──────────────────┘
```

## Registry Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    SCENE REGISTRY                            │
│              (Persists across all scenes)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  • audioManager      ← Initialized in BootScene             │
│  • inputManager      ← Initialized in BootScene             │
│  • gameState         ← Initialized as needed                │
│  • playerData        ← Loaded in PreloadScene               │
│                                                              │
│  Access from any scene:                                      │
│    const manager = this.registry.get('audioManager')         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Performance Timeline

```
Time:  0ms      344ms         3s                5s (target)
       │        │             │                 │
       ├────────┤             │                 │
       │ BOOT   │             │                 │
       │  ✅    │             │                 │
       ├────────┴─────────────┤                 │
       │                      │                 │
       │    PRELOADSCENE      │                 │
       │         ✅           │                 │
       ├──────────────────────┴─────────────────┤
                              │
                              ▼
                         MENUSCENE ✅
                         (Instant response)
                              │
                              ▼
                         GAMESCENE ✅
                         (60 FPS maintained)
                              
All targets met! ✅
```

## File Structure

```
src/
├── main.ts                    # Entry point, creates Phaser.Game
├── config/
│   ├── GameConfig.ts          # Game config with scene array
│   └── AssetConfig.ts         # Asset paths and keys
├── scenes/
│   ├── README.md              # Scene documentation
│   ├── BootScene.ts           # ✅ Story 1.2.1
│   ├── PreloadScene.ts        # ✅ Story 1.2.2
│   ├── MenuScene.ts           # ✅ Story 1.2.3
│   └── GameScene.ts           # ✅ Story 1.2.4
├── types/
│   └── SceneData.ts           # Scene data interfaces
└── utils/
    └── env.ts                 # Environment utilities

docs/stories/epic-1.2-scene-management/
├── SCENE-FLOW-DIAGRAM.md                     # This file
├── story-1.2.1-bootscene.md                  # Story 1.2.1 definition
├── story-1.2.1-test-results.md               # Test results
├── story-1.2.1-IMPLEMENTATION-SUMMARY.md     # Implementation summary
├── story-1.2.2-preloadscene.md               # Story 1.2.2 definition
├── story-1.2.2-IMPLEMENTATION-SUMMARY.md     # Implementation summary
├── story-1.2.3-menuscene.md                  # Story 1.2.3 definition
├── story-1.2.3-IMPLEMENTATION-SUMMARY.md     # Implementation summary
├── story-1.2.4-gamescene-foundation.md       # Story 1.2.4 definition
├── story-1.2.4-test-results.md               # Test results
└── story-1.2.4-IMPLEMENTATION-SUMMARY.md     # Implementation summary

tests/scenes/
├── BootScene.test.ts          # 20 unit tests
├── PreloadScene.test.ts       # 45+ unit tests (90.1% coverage)
├── MenuScene.test.ts          # 40+ unit tests (75.8% coverage)
└── GameScene.test.ts          # 35+ unit tests (74.2% coverage)
```

## Lifecycle Events Flow

```
┌─────────────────────────────────────────────────────────────┐
│  PHASER SCENE LIFECYCLE (Phaser 3.90+)                      │
└─────────────────────────────────────────────────────────────┘

1. PENDING      → Scene registered but not started
                  │
                  ▼
2. INIT         → init() called
                  │
                  ▼
3. LOADING      → preload() called, assets load
                  │
                  ▼
4. CREATING     → create() called, scene setup
                  │
                  ▼
5. RUNNING      → update() called every frame (60 FPS)
                  │ (BootScene skips this, transitions immediately)
                  ▼
6. SHUTDOWN     → shutdown() called, cleanup
                  │
                  ▼
7. DESTROYED    → Scene removed from memory
```

## Error Handling

```
┌─────────────────────────────────────────────────────────────┐
│  ERROR SCENARIOS                                             │
└─────────────────────────────────────────────────────────────┘

Asset Load Failure:
  preload() → load.on('loaderror') → Log error → Continue
  
Performance Warning:
  create() → Check boot time → Warn if > 500ms (Dev mode)
  
Scene Transition Failure:
  create() → Try scene.start() → Catch error → Log and retry
  
Registry Access:
  Any scene → registry.get() → Check if exists → Fallback
```

## Epic 1.2 Scene Management - COMPLETE ✅

All four stories in Epic 1.2 have been successfully implemented and tested:

1. **Story 1.2.1: BootScene** ✅
   - Rapid boot sequence (< 500ms)
   - Manager initialization
   - Dev mode logging

2. **Story 1.2.2: PreloadScene** ✅
   - Visual progress feedback
   - Asset loading system
   - Error handling

3. **Story 1.2.3: MenuScene** ✅
   - Mode and track selection
   - Keyboard navigation
   - Menu music integration

4. **Story 1.2.4: GameScene Foundation** ✅
   - Display game info
   - Restart and menu controls
   - Placeholder for Phase 2 gameplay

## Next Steps

**Phase 2: Gameplay Implementation** (Future Epic)

The GameScene foundation is ready for Phase 2 enhancements:
- Player car implementation and controls
- Track rendering and collision detection
- Physics simulation (drifting mechanics)
- Scoring and time tracking
- Visual effects (particle systems, trails)
- Audio feedback (engine sounds, drift sounds)

The scene management infrastructure is solid and ready to support full gameplay implementation.

---

**Legend:**
- ✅ Complete and tested
- 🚧 Placeholder/partial implementation
- ⏳ Not yet started
