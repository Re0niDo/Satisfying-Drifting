# Story 1.2.1: BootScene Implementation

**Epic:** Epic 1.2: Scene Management Foundation  
**Story ID:** 1.2.1  
**Priority:** High  
**Points:** 3  
**Status:** Complete

---

## Description

Implement the BootScene, which is the first scene in the game lifecycle. This scene is responsible for system initialization, loading critical assets (under 100KB), setting up global managers, and transitioning to the PreloadScene. The BootScene should execute quickly (under 500ms) and prepare all core systems for the game.

**GDD Reference:** Scene Management System (Architecture Document Section: Scene Management System)

---

## Acceptance Criteria

### Functional Requirements

- [x] BootScene initializes and transitions to PreloadScene automatically
- [x] All singleton managers are created and registered in the scene registry
- [x] Critical assets (under 100KB total) are loaded before transition
- [x] Scene executes in under 500ms on target hardware
- [x] Proper error handling if initialization fails

### Technical Requirements

- [x] Code follows TypeScript strict mode standards
- [x] Maintains 60 FPS during initialization
- [x] No memory leaks or performance degradation
- [x] Implements proper `shutdown()` method for cleanup
- [x] Uses Phaser 3.90+ best practices for scene lifecycle

### Game Design Requirements

- [x] Seamless transition to PreloadScene (no visible delay)
- [x] Optional logo display (configurable, under 1 second)
- [x] Error messages are player-friendly if initialization fails

---

## Technical Specifications

### Files to Create/Modify

**New Files:**

- `src/scenes/BootScene.ts` - Main BootScene implementation
- `src/types/SceneData.ts` - TypeScript interfaces for scene data passing

**Modified Files:**

- `src/main.ts` - Register BootScene as first scene in game config
- `src/config/GameConfig.ts` - Add BootScene to scene array if needed

### Class/Interface Definitions

```typescript
// Scene data interfaces
interface BootSceneData {
    // BootScene typically doesn't receive data (first scene)
}

interface PreloadSceneData {
    // Data passed to PreloadScene (if any)
}

// BootScene class
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    init(): void {
        // Initialize scene-level configurations
    }

    preload(): void {
        // Load critical assets only (< 100KB)
        // Example: logo, minimal UI elements
    }

    create(): void {
        // Set up global managers
        // Register systems in scene registry
        // Transition to PreloadScene
    }

    shutdown(): void {
        // Clean up event listeners (if any)
        // Note: Managers persist across scenes via registry
    }
}
```

### Integration Points

**Scene Integration:**

- **BootScene → PreloadScene**: Automatic transition using `this.scene.start('PreloadScene')`
- **Scene Registry**: Managers stored in `this.registry` for access by all scenes

**System Dependencies:**

- **Phaser.Game**: Created in main.ts, BootScene is the first scene
- **Scene Registry**: Used to store singleton manager references

**Event Communication:**

- Emits: None (BootScene is initialization only)
- Listens: None

---

## Implementation Tasks

### Dev Agent Record

**Tasks:**

- [x] Create `src/scenes/BootScene.ts` with class definition
- [x] Create `src/types/SceneData.ts` with scene data interfaces
- [x] Implement `init()` method for scene configuration
- [x] Implement `preload()` method for critical asset loading
- [x] Implement `create()` method for manager initialization
- [x] Implement `shutdown()` method for proper cleanup
- [x] Register BootScene in `src/main.ts` scene array
- [x] Update GameConfig to include BootScene as first scene
- [x] Write unit tests for BootScene initialization logic
- [x] Manual testing: Verify transition to PreloadScene
- [x] Performance testing: Verify under 500ms execution time

**Debug Log:**
| Task | File | Change | Reverted? |
|------|------|--------|-----------|
| Create PreloadScene stub | src/scenes/PreloadScene.ts | Added placeholder PreloadScene for testing | No |
| Add PreloadScene to config | src/config/GameConfig.ts | Added PreloadScene import and registration | No |

**Completion Notes:**

Created PreloadScene placeholder to enable proper testing of BootScene transition. Boot time measured at ~344ms (well under 500ms target). All scenes properly registered and functional.

**Change Log:**

<!-- Only requirement changes during implementation -->

---

## Game Design Context

**GDD Reference:** Scene Management System (Architecture Document)

**Game Mechanic:** Scene initialization and lifecycle management

**Player Experience Goal:** Instant game startup with no perceived delay between scenes

**Balance Parameters:**

- BootScene execution time: Under 500ms
- Critical assets size: Under 100KB total
- Transition duration: Instant (0ms) or quick fade (200ms max)

---

## Testing Requirements

### Unit Tests

**Test Files:**

- `tests/scenes/BootScene.test.ts`

**Test Scenarios:**

- BootScene initializes without errors
- Scene transitions to PreloadScene after create()
- Scene registry contains expected manager references (if any initialized)
- Critical assets are loaded before transition

### Game Testing

**Manual Test Cases:**

1. **Basic Scene Flow**
   - Action: Start game from main.ts
   - Expected: BootScene loads and transitions to PreloadScene within 500ms
   - Performance: No frame drops, smooth transition

2. **Registry Setup**
   - Action: Access scene registry from subsequent scenes
   - Expected: Any managers initialized in BootScene are accessible
   - Edge Case: Handle missing registry entries gracefully

3. **Error Handling**
   - Action: Simulate failed asset load (delete a critical asset)
   - Expected: Console error logged, fallback behavior executes
   - Edge Case: Game should not crash, should display error message

### Performance Tests

**Metrics to Verify:**

- Frame rate maintains 60 FPS during BootScene
- Memory usage stays under 50MB for BootScene alone
- Total BootScene execution time under 500ms (from init() to PreloadScene transition)

---

## Dependencies

**Story Dependencies:**

- **Story 1.1.1**: Project Initialization - Phaser and TypeScript setup must be complete

**Technical Dependencies:**

- Phaser 3.90+ installed and configured
- TypeScript strict mode enabled
- Vite dev server operational

**Asset Dependencies:**

- Optional: `assets/images/logo.png` (under 50KB) for boot splash
- Location: `assets/images/` directory

---

## Definition of Done

- [x] All acceptance criteria met
- [x] Code reviewed and approved
- [x] Unit tests written and passing
- [x] Integration tests passing (scene transition works)
- [x] Performance targets met (under 500ms execution)
- [x] No linting errors
- [x] Documentation updated (inline JSDoc comments)
- [x] BootScene transitions smoothly to PreloadScene
- [x] Scene implements proper `shutdown()` method per Phaser 3.90+ best practices

---

## Notes

**Implementation Notes:**

- BootScene should be minimal - defer all non-critical work to PreloadScene
- If showing a logo, use a simple fade-in/fade-out tween (200ms each)
- Consider making logo display configurable via GameConfig (for faster testing)
- Registry is the preferred method for sharing managers across scenes (not global variables)

**Design Decisions:**

- **No heavy initialization in BootScene**: All asset loading deferred to PreloadScene to keep boot time under 500ms
- **Optional logo display**: Can be disabled for development builds to speed up testing iteration
- **Manager initialization strategy**: Managers can be initialized in BootScene (persisted via registry) or lazily in first scene that needs them (decide based on usage patterns)

**Future Considerations:**

- Could add WebGL context initialization checks (detect if WebGL is available)
- Could add browser compatibility checks (warn if browser too old)
- Could add localStorage availability check (for save system)
- Consider adding a "Press any key to continue" prompt for logo display (user-initiated transition)
