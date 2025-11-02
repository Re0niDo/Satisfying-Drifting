# Story 1.2.4: GameScene Foundation & Scene Cycle Completion

**Epic:** Epic 1.2: Scene Management Foundation  
**Story ID:** 1.2.4  
**Priority:** High  
**Points:** 5  
**Status:** Complete

---

## Description

Implement the GameScene with a minimal placeholder game loop that receives and displays track and mode data from MenuScene. This story completes the full scene management cycle (Boot → Preload → Menu → Game → Menu), establishing the foundation for Phase 2 gameplay implementation. The GameScene will handle instant restart (R key) and return to menu (ESC key), demonstrating proper scene data flow and lifecycle management.

**GDD Reference:** Scene Management System (Architecture Document Section: Scene Management System, Implementation Roadmap Phase 1)

**Dependencies:**
- Story 1.2.1 (BootScene) - COMPLETE
- Story 1.2.2 (PreloadScene) - COMPLETE
- Story 1.2.3 (MenuScene) - COMPLETE

---

## Acceptance Criteria

### Functional Requirements

- [x] GameScene receives mode and track data from MenuScene
- [x] Displays track name and game mode on screen
- [x] Shows placeholder text indicating GameScene status
- [x] R key triggers instant restart (same track/mode)
- [x] ESC key returns to MenuScene
- [x] Scene runs at 60 FPS with empty game loop
- [x] Proper scene lifecycle (init → create → update → shutdown)

### Technical Requirements

- [x] Code follows TypeScript strict mode standards
- [x] Maintains 60 FPS during gameplay loop
- [x] Uses scene data interface (GameSceneData) for type safety
- [x] Implements proper `shutdown()` method for cleanup
- [x] No memory leaks during scene lifecycle
- [x] Proper keyboard event handling
- [x] Smooth transitions to/from MenuScene

### Game Design Requirements

- [x] Clear visual indication of current track and mode
- [x] Instant restart feels responsive (< 100ms)
- [x] ESC to menu is intuitive and immediate
- [x] Placeholder clearly indicates "not yet implemented"
- [x] No confusion about scene state or controls

---

## Technical Specifications

### Files to Create/Modify

**New Files:**
- `src/scenes/GameScene.ts` - Main game scene implementation

**Files to Modify:**
- `src/types/SceneData.ts` - Add/verify GameSceneData interface
- `src/config/GameConfig.ts` - Register GameScene

**Files to Reference:**
- `src/config/AssetConfig.ts` - Asset keys (if needed)
- `docs/Satisfying-Drifting-game-architecture.md` - Scene management patterns

**No Placeholder File Exists** - Creating from scratch

---

### TypeScript Interfaces

```typescript
// src/types/SceneData.ts - Verify/add GameSceneData interface

export interface GameSceneData {
  mode: 'practice' | 'score';
  trackId: string;
  trackName: string;
}
```

---

### Scene Implementation: GameScene

**File:** `src/scenes/GameScene.ts`

**Key Responsibilities:**
1. Receive mode and track data from MenuScene
2. Display current track and mode information
3. Run empty game loop (placeholder for Phase 2)
4. Handle R key for instant restart
5. Handle ESC key for return to menu
6. Implement proper cleanup in shutdown()

**Phaser Lifecycle Methods:**

```typescript
init(data: GameSceneData): void
```
- Store track and mode data from MenuScene
- Validate received data
- Log initialization (dev mode)
- Track scene start time

```typescript
create(): void
```
- Display track name and mode
- Show placeholder game content
- Display control instructions (R to restart, ESC to menu)
- Register keyboard input listeners (R, ESC)
- Log scene creation (dev mode)

```typescript
update(time: number, delta: number): void
```
- Empty game loop placeholder
- Future: Will contain physics updates, input polling, etc.
- Can log FPS in dev mode for verification

```typescript
shutdown(): void
```
- Remove all keyboard event listeners
- Clear any timers or tweens
- Clean up any placeholder objects
- Log shutdown (dev mode)

---

### Scene Layout Design

**GameScene Placeholder Display:**

```typescript
// Track and Mode Display (top center)
const trackText = `Track: ${trackName}`;
const modeText = `Mode: ${mode.toUpperCase()}`;
const trackY = 50;
const modeY = 90;
const textColor = '#ffffff';
const textSize = '24px';

// Placeholder Message (center)
const placeholderText = 'GameScene\n(Placeholder - Gameplay Coming in Phase 2)';
const placeholderY = gameHeight / 2;
const placeholderSize = '32px';
const placeholderColor = '#ffffff';

// Control Instructions (bottom)
const instructionText = '[R] Restart  |  [ESC] Back to Menu';
const instructionY = gameHeight - 50;
const instructionSize = '18px';
const instructionColor = '#aaaaaa';

// Optional: FPS Display (top right, dev mode only)
const fpsText = 'FPS: 60';
const fpsX = gameWidth - 100;
const fpsY = 20;
```

**Visual Layout:**

```
┌──────────────────────────────────────────────┐
│  Track: Tutorial Circuit                     │
│  Mode: PRACTICE                              │
│                                              │
│                                              │
│         GameScene                            │
│    (Placeholder - Gameplay                   │
│      Coming in Phase 2)                      │
│                                              │
│                                              │
│                                              │
│  [R] Restart  |  [ESC] Back to Menu         │
└──────────────────────────────────────────────┘
```

---

### Keyboard Input Handling

**Input Registration:**

```typescript
create(): void {
  // Register R key for restart
  this.input.keyboard?.on('keydown-R', () => this.handleRestart());
  
  // Register ESC key for menu return
  this.input.keyboard?.on('keydown-ESC', () => this.handleReturnToMenu());
}
```

**Restart Handler:**

```typescript
private handleRestart(): void {
  if (import.meta.env.DEV) {
    console.log('[GameScene] Restart requested');
  }
  
  // Quick fade out (150ms) for visual feedback
  this.cameras.main.fadeOut(150, 0, 0, 0);
  
  this.cameras.main.once('camerafadeoutcomplete', () => {
    // Restart scene with same game data
    this.scene.restart({
      mode: this.currentMode,
      trackId: this.currentTrackId,
      trackName: this.currentTrackName,
    });
    
    // Quick fade in (150ms) after restart
    this.cameras.main.fadeIn(150, 0, 0, 0);
  });
}
```

**Return to Menu Handler:**

```typescript
private handleReturnToMenu(): void {
  if (import.meta.env.DEV) {
    console.log('[GameScene] Returning to MenuScene');
  }
  
  // Fade out transition
  this.cameras.main.fadeOut(300, 0, 0, 0);
  
  this.cameras.main.once('camerafadeoutcomplete', () => {
    this.scene.start('MenuScene', {
      assetsLoaded: true
    });
  });
}
```

---

### Scene Data Flow

**From MenuScene to GameScene:**

```typescript
// MenuScene transitions to GameScene
this.scene.start('GameScene', {
  mode: 'practice', // or 'score'
  trackId: 'tutorial',
  trackName: 'Tutorial Circuit'
});
```

**GameScene Restart (same data):**

```typescript
// GameScene restarts itself with same data
this.scene.restart({
  mode: this.currentMode,
  trackId: this.currentTrackId,
  trackName: this.currentTrackName
});
```

**GameScene to MenuScene:**

```typescript
// GameScene returns to MenuScene
this.scene.start('MenuScene', {
  assetsLoaded: true
});
```

**Complete Scene Flow:**

```
BootScene
    ↓
PreloadScene (loads all assets)
    ↓
MenuScene (mode & track selection)
    ↓
GameScene (gameplay with data)
    ↓ (ESC)
MenuScene (return to menu)
    ↓ (new selection)
GameScene (new track/mode)

GameScene (R key) → GameScene (instant restart, same data)
```

---

### Memory Management

**Cleanup Requirements:**

```typescript
shutdown(): void {
  // Remove all keyboard event listeners
  this.input.keyboard?.removeAllListeners();
  
  // Clear any active tweens
  this.tweens.killAll();
  
  // Clear any timers
  this.time.removeAllEvents();
  
  // Clear stored scene data
  this.sceneData = undefined;
  
  // Text objects destroyed automatically by Phaser
  // Graphics objects destroyed automatically by Phaser
  
  if (import.meta.env.DEV) {
    console.log('[GameScene] Shutdown complete');
  }
}
```

**Important Notes:**
- Don't manually destroy Game Objects (text, graphics) - Phaser handles this
- Do remove all keyboard listeners
- Do clear scene data references
- Do kill active tweens and timers

---

### Integration Points

**From MenuScene:**
```typescript
// MenuScene passes game configuration
const gameData: GameSceneData = {
  mode: this.selectedMode,
  trackId: this.selectedTrack.id,
  trackName: this.selectedTrack.name
};
this.scene.start('GameScene', gameData);
```

**To MenuScene:**
```typescript
// GameScene returns to menu with asset status
this.scene.start('MenuScene', {
  assetsLoaded: true
});
```

**Scene Registration:**
```typescript
// src/config/GameConfig.ts - Ensure GameScene is registered
import { GameScene } from '../scenes/GameScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  // ... other config
  scene: [BootScene, PreloadScene, MenuScene, GameScene]
};
```

---

### Performance Targets

**GameScene Performance:**
- **Target FPS:** 60 FPS sustained
- **Update Loop:** < 1ms per frame (empty loop)
- **Memory Usage:** < 30 MB for placeholder
- **Restart Time:** 300ms (150ms fade out + 150ms fade in)
- **Transition Time:** 300ms fade to menu

**Performance Validation:**
- Verify 60 FPS in dev tools
- Test rapid R key presses (no lag)
- Confirm ESC transition is smooth
- Check memory stable across restarts

---

## Implementation Tasks

Implement these tasks in order:

### Task 1: Setup GameScene Structure
- [x] Create GameScene class extending Phaser.Scene
- [x] Implement init() method with GameSceneData parameter
- [x] Store track and mode data in class properties
- [x] Add basic logging for dev mode
- [x] Verify scene constructor and key

### Task 2: Implement Scene Display
- [x] Display track name at top center
- [x] Display game mode below track name
- [x] Create placeholder message at screen center
- [x] Add control instructions at bottom
- [x] Style text for clarity and readability
- [x] Verify layout matches design spec

### Task 3: Add Keyboard Input Handling
- [x] Register R key listener for restart
- [x] Register ESC key listener for menu return
- [x] Implement handleRestart() method
- [x] Implement handleReturnToMenu() method
- [x] Test keyboard input responsiveness

### Task 4: Implement Scene Restart
- [x] Call scene.restart() with current data
- [x] Verify data persists across restart
- [x] Test rapid restart presses
- [x] Log restart in dev mode
- [x] Confirm no memory leaks on restart

### Task 5: Implement Return to Menu
- [x] Add camera fade-out effect (300ms)
- [x] Transition to MenuScene in fade callback
- [x] Pass assetsLoaded flag to MenuScene
- [x] Test smooth transition without flicker
- [x] Verify MenuScene receives correct state

### Task 6: Add Empty Game Loop
- [x] Implement update() method
- [x] Add placeholder comment for Phase 2 work
- [x] Optional: Log FPS in dev mode
- [x] Verify 60 FPS sustained
- [x] Test scene runs without errors

### Task 7: Implement Scene Cleanup
- [x] Add shutdown() method
- [x] Remove all keyboard event listeners
- [x] Clear timers and tweens
- [x] Clear scene data references
- [x] Log shutdown in dev mode
- [x] Test no memory leaks with repeated visits

### Task 8: Complete Scene Registration
- [x] Import GameScene in GameConfig.ts
- [x] Add GameScene to scene array
- [x] Verify build compiles without errors
- [x] Test full scene flow: Boot → Preload → Menu → Game

---

## Testing Requirements

### Unit Tests

**File:** `tests/scenes/GameScene.test.ts`

**Test Cases:**

1. **Scene Initialization**
   - [x] Scene initializes with correct key
   - [x] init() method stores scene data correctly
   - [x] Handles missing scene data gracefully
   - [x] Validates track and mode data

2. **Scene Display**
   - [x] Displays track name correctly
   - [x] Displays game mode correctly
   - [x] Shows placeholder message
   - [x] Shows control instructions
   - [x] All text is properly positioned

3. **Keyboard Input**
   - [x] R key triggers restart
   - [x] ESC key triggers return to menu
   - [x] No other keys cause unintended behavior
   - [x] Rapid key presses handled correctly

4. **Scene Restart**
   - [x] Restart preserves track data
   - [x] Restart preserves mode data
   - [x] Scene reinitializes properly
   - [x] No memory leaks on restart
   - [x] Multiple restarts work correctly

5. **Return to Menu**
   - [x] ESC transitions to MenuScene
   - [x] Fade effect plays before transition
   - [x] MenuScene receives correct data
   - [x] Transition is smooth

6. **Game Loop**
   - [x] update() method executes every frame
   - [x] Scene maintains 60 FPS
   - [x] No errors in update loop
   - [x] Empty loop has minimal overhead

7. **Scene Cleanup**
   - [x] shutdown() removes all listeners
   - [x] Clears timers and tweens
   - [x] Clears scene data
   - [x] No memory leaks after shutdown
   - [x] Can revisit scene without issues

### Integration Tests

1. **MenuScene → GameScene Transition**
   - [x] GameScene receives data from MenuScene
   - [x] Data is correctly formatted (mode, trackId, trackName)
   - [x] Transition is smooth with fade effect
   - [x] Scene initializes immediately

2. **GameScene → MenuScene Transition**
   - [x] MenuScene receives assetsLoaded flag
   - [x] Menu state is preserved (can select again)
   - [x] Transition includes fade effect
   - [x] No errors during handoff

3. **GameScene Restart Flow**
   - [x] R key restarts without menu visit
   - [x] Same track and mode displayed
   - [x] Restart is instant (< 100ms)
   - [x] Multiple restarts work correctly

4. **Full Scene Cycle**
   - [x] Boot → Preload → Menu → Game → Menu works
   - [x] Menu → Game → Restart → Menu works
   - [x] Multiple game sessions work correctly
   - [x] Memory usage stable across cycles

### Manual Testing Checklist

- [x] Track name displays correctly for all 5 tracks
- [x] "PRACTICE" and "SCORE" modes display correctly
- [x] Placeholder message is clear and centered
- [x] Control instructions are visible and readable
- [x] R key restarts instantly with same data
- [x] ESC key returns to menu smoothly
- [x] Fade transition is smooth (no flicker)
- [x] FPS remains at 60 throughout session
- [x] No console errors in dev mode
- [x] Scene works after returning from menu
- [x] Multiple restarts don't cause issues
- [x] Memory usage stable (check DevTools)

---

## Definition of Done

- [x] All acceptance criteria met (functional, technical, game design)
- [x] All implementation tasks completed and verified
- [x] Unit tests written and passing (>80% coverage)
- [x] Integration tests passing
- [x] Manual testing checklist completed
- [x] Code follows TypeScript strict mode
- [x] No ESLint errors or warnings
- [x] Performance targets met (60 FPS sustained)
- [x] Memory profiling shows no leaks
- [x] Keyboard input works reliably
- [x] Scene transitions are smooth
- [x] R key restart feels instant
- [x] ESC return to menu works correctly
- [x] Code reviewed and approved
- [x] Documentation updated (SCENE-FLOW-DIAGRAM.md)
- [x] Story marked as COMPLETE

---

## Notes for Developer

**Scene Data Pattern:**
- Use the same GameSceneData interface for both initial launch and restarts
- Store data in class properties for easy access
- Validate data in init() to catch issues early

**Restart vs. Scene.start():**
- `scene.restart(data)` is faster than `scene.stop()` + `scene.start()`
- Restart reuses existing scene instance
- Restart still calls init() and create() again
- Shutdown is still called before restart

**Keyboard Input Best Practices:**
- Use `keydown-KEY` events for single-press actions (R, ESC)
- Remove listeners in shutdown() to prevent memory leaks
- Consider debouncing if rapid presses cause issues

**Empty Game Loop:**
- update() method is called every frame (60 FPS)
- Keep it minimal for now - just verify it runs
- Phase 2 will add input polling, physics, rendering logic

**Scene Registration:**
- GameScene must be registered in GameConfig.ts scene array
- Scene key must match constructor: `super({ key: 'GameScene' })`
- Scene order matters for initial scene start

**Transition Timing:**
- Menu → Game: 500ms fade recommended (matches MenuScene)
- Game → Menu: 300ms fade (faster return)
- Restart: 150ms fade out + 150ms fade in (300ms total for visual feedback)

**Common Pitfalls:**
- Forgetting to remove keyboard listeners in shutdown()
- Not storing scene data in init() (lost on restart)
- Manually destroying text objects (Phaser does this)
- Using scene.start() instead of scene.restart() for R key
- Not handling missing scene data gracefully

**Phase 2 Preparation:**
- This placeholder makes it easy to add gameplay in Phase 2
- update() method ready for input polling
- Scene data structure ready for game state
- Restart mechanism ready for actual gameplay

---

## Related Documentation

- **Architecture Document:** Scene Management System section
- **Story 1.2.1:** BootScene implementation (scene pattern reference)
- **Story 1.2.2:** PreloadScene implementation (transition pattern)
- **Story 1.2.3:** MenuScene implementation (data passing pattern)

---

## Story Dependencies

**Blocks:**
- Epic 2.1: Car Physics & Movement (needs GameScene to run in)
- Epic 2.2: Track System (needs GameScene to display tracks)
- All Phase 2 gameplay stories

**Depends On:**
- Story 1.2.1: BootScene Implementation ✅ (COMPLETE)
- Story 1.2.2: PreloadScene Implementation ✅ (COMPLETE)
- Story 1.2.3: MenuScene Implementation ✅ (COMPLETE)

**Completes:**
- Epic 1.2: Scene Management Foundation ✅ (Full cycle established)

---

## Estimated Effort

**Points:** 5  
**Estimated Time:** 3-4 hours

**Breakdown:**
- Task 1 (GameScene Structure): 20 min
- Task 2 (Scene Display): 30 min
- Task 3 (Keyboard Input): 30 min
- Task 4 (Scene Restart): 20 min
- Task 5 (Return to Menu): 30 min
- Task 6 (Empty Game Loop): 15 min
- Task 7 (Scene Cleanup): 20 min
- Task 8 (Scene Registration): 15 min
- Unit Testing: 45 min
- Integration Testing: 20 min
- Manual Testing & Refinement: 30 min

---

## Epic Completion

**This story completes Epic 1.2: Scene Management Foundation!**

Upon completion, the full scene cycle will be operational:
- ✅ Boot → Preload → Menu → Game → Menu
- ✅ Scene data passing works correctly
- ✅ All scenes implement proper lifecycle
- ✅ Memory management is solid
- ✅ Foundation ready for Phase 2 gameplay

---

**Story Created By:** Jordan (Game Scrum Master)  
**Date:** November 2, 2025
