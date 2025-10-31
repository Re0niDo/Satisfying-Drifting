# Scene Flow Diagram - Story 1.2.1

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
│                      🚧 PRELOADSCENE                             │
│                  (Story 1.2.2 - Placeholder)                     │
├─────────────────────────────────────────────────────────────────┤
│  Current: Displays "PreloadScene (Placeholder)" text             │
│  Future: Full asset loading with progress bar                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ (Future: scene.start('MenuScene'))
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ⏳ MENUSCENE                              │
│                        (Not implemented)                         │
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
│  init(data)      │  ← PreloadSceneData
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
Time:  0ms              344ms                500ms (target)
       │                │                     │
       ├────────────────┤                     │
       │   BOOTSCENE    │                     │
       │   ✅ COMPLETE  │                     │
       ├────────────────┤                     │
                        │                     │
                        ▼                     │
                   PreloadScene               │
                   starts                     │
                                              │
                   Well under target! ✅      │
```

## File Structure

```
src/
├── main.ts                    # Entry point, creates Phaser.Game
├── config/
│   └── GameConfig.ts          # Game config with scene array
├── scenes/
│   ├── README.md              # Scene documentation
│   ├── BootScene.ts           # ✅ Story 1.2.1
│   └── PreloadScene.ts        # 🚧 Placeholder
└── types/
    └── SceneData.ts           # Scene data interfaces

docs/stories/epic-1.2-scene-management/
├── story-1.2.1-bootscene.md              # Story definition
├── story-1.2.1-test-results.md           # Test results
└── story-1.2.1-IMPLEMENTATION-SUMMARY.md # This summary

tests/scenes/
└── BootScene.test.ts          # 20 unit tests
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

## Next Story Preview: 1.2.2 PreloadScene

```
┌─────────────────────────────────────────────────────────────┐
│  PRELOADSCENE (Story 1.2.2)                                  │
├─────────────────────────────────────────────────────────────┤
│  Will implement:                                             │
│    • Progress bar display                                    │
│    • Load all game assets (images, audio, fonts)             │
│    • Asset validation                                        │
│    • Transition to MenuScene                                 │
│    • Loading screen UI                                       │
│                                                              │
│  Performance target: 2-5 seconds                             │
└─────────────────────────────────────────────────────────────┘
```

---

**Legend:**
- ✅ Complete and tested
- 🚧 Placeholder/partial implementation
- ⏳ Not yet started
