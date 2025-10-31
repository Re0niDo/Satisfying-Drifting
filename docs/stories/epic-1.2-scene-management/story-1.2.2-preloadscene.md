# Story 1.2.2: PreloadScene Implementation

**Epic:** Epic 1.2: Scene Management Foundation  
**Story ID:** 1.2.2  
**Priority:** High  
**Points:** 5  
**Status:** Complete

---

## Description

Implement the PreloadScene, which loads all game assets (images, audio, data) with a visual progress indicator. This scene executes after BootScene and prepares all resources needed for gameplay. The PreloadScene must provide clear feedback to the player during loading, handle load failures gracefully, and transition smoothly to MenuScene when complete.

**GDD Reference:** Scene Management System (Architecture Document Section: Scene Management System)

**Dependencies:**
- Story 1.2.1 (BootScene) - COMPLETE

---

## Acceptance Criteria

### Functional Requirements

- [ ] PreloadScene loads all game assets defined in AssetConfig
- [ ] Visual progress bar displays loading percentage (0-100%)
- [ ] Loading status text shows current asset being loaded
- [ ] Automatic transition to MenuScene when loading completes
- [ ] Graceful error handling if assets fail to load
- [ ] Minimum display time of 500ms (even if loading is faster)

### Technical Requirements

- [ ] Code follows TypeScript strict mode standards
- [ ] Maintains 60 FPS during asset loading
- [ ] Uses AssetConfig constants for all asset references
- [ ] Implements proper `shutdown()` method for cleanup
- [ ] No memory leaks during scene lifecycle
- [ ] Progress bar updates on each asset load event
- [ ] Proper error logging in development mode

### Game Design Requirements

- [ ] Progress bar is visually clear and centered
- [ ] Loading feedback feels responsive (updates frequently)
- [ ] Transition to MenuScene is smooth (fade effect)
- [ ] No jarring visual jumps or flickers
- [ ] Player understands what's happening during load

---

## Technical Specifications

### Files to Create/Modify

**Files to Modify:**
- `src/scenes/PreloadScene.ts` - Replace placeholder with full implementation

**Files to Reference:**
- `src/config/AssetConfig.ts` - Asset keys and paths
- `src/types/SceneData.ts` - Scene data interfaces
- `docs/ASSET_GUIDELINES.md` - Asset specifications

**No New Files Created**

---

### TypeScript Interfaces

```typescript
// src/types/SceneData.ts (already exists, verify/update if needed)

export interface PreloadSceneData {
  // Optional data passed from BootScene
  fastLoad?: boolean; // Skip minimum display time if true
}

export interface MenuSceneData {
  // Data passed to MenuScene after preload
  assetsLoaded: boolean;
}
```

---

### Scene Implementation: PreloadScene

**File:** `src/scenes/PreloadScene.ts`

**Key Responsibilities:**
1. Load all game assets using AssetConfig constants
2. Display progress bar with percentage
3. Show loading status text
4. Handle load events (progress, complete, error)
5. Transition to MenuScene when ready
6. Implement proper cleanup in shutdown()

**Phaser Lifecycle Methods:**

```typescript
init(data: PreloadSceneData): void
```
- Store scene data
- Initialize loading state variables
- Track load start time
- Log initialization (dev mode)

```typescript
preload(): void
```
- Create progress bar graphics
- Create loading text elements
- Register load event listeners (progress, complete, filecomplete, loaderror)
- Load all assets from AssetConfig
- Update progress bar on each asset load

```typescript
create(): void
```
- Wait for minimum display time (500ms) if needed
- Add fade-out transition effect
- Start MenuScene with loaded data
- Log completion time (dev mode)

```typescript
shutdown(): void
```
- Remove all load event listeners
- Clean up graphics and text objects
- Clear any timers or tweens
- Log shutdown (dev mode)

---

### Asset Loading Strategy

**Asset Categories to Load:**

1. **Images - Sprites** (AssetKeys.CAR, AssetKeys.PARTICLE)
2. **Images - Tracks** (All TRACK_* keys)
3. **Images - UI** (AssetKeys.BUTTON, AssetKeys.METER_BAR)
4. **Audio - SFX** (All SFX_* keys)
5. **Audio - Music** (All MUSIC_* keys)

**Loading Order:**
- Load all images first (faster, needed for menu)
- Load audio second (larger files, can play after menu displays)
- Update progress incrementally for smooth progress bar

**Error Handling:**
- Log failed asset loads in dev mode
- Display generic "Loading..." text if asset name unavailable
- Continue loading even if some assets fail
- Track failed assets for debugging

---

### Progress Bar Design

**Visual Specifications:**

```typescript
// Progress Bar Container (outline)
const barWidth = 400;
const barHeight = 30;
const barX = (gameWidth - barWidth) / 2;
const barY = (gameHeight / 2) + 50;
const barColor = 0x222222; // Dark gray background
const barBorderColor = 0xffffff; // White border
const barBorderThickness = 2;

// Progress Bar Fill
const fillColor = 0x00ff00; // Green fill
const fillPadding = 4; // Inner padding from border

// Loading Text
const textY = barY - 50;
const textColor = '#ffffff';
const textSize = '24px';
const textFont = 'Arial';

// Percentage Text
const percentTextY = barY + 50;
const percentColor = '#ffffff';
const percentSize = '18px';
```

**Progress Calculation:**
```typescript
const progress = (loadedAssets / totalAssets) * 100;
progressBar.width = (barWidth - fillPadding * 2) * (progress / 100);
percentageText.setText(`${Math.round(progress)}%`);
```

---

### Integration Points

**From BootScene:**
```typescript
// BootScene transitions to PreloadScene
this.scene.start('PreloadScene', {
  fastLoad: false // Optional: skip minimum display time
});
```

**To MenuScene:**
```typescript
// PreloadScene transitions to MenuScene after loading
this.scene.start('MenuScene', {
  assetsLoaded: true
});
```

**Scene Data Flow:**
- BootScene → PreloadScene: Optional fastLoad flag
- PreloadScene → MenuScene: Asset load confirmation

---

### Memory Management

**Cleanup Requirements:**

```typescript
shutdown(): void {
  // Remove load event listeners
  this.load.off('progress');
  this.load.off('complete');
  this.load.off('filecomplete');
  this.load.off('loaderror');
  
  // Graphics objects destroyed automatically by Phaser
  // Text objects destroyed automatically by Phaser
  // Just remove references and listeners
  
  // Clear any pending timers
  this.time.removeAllEvents();
  
  // Clear any active tweens
  this.tweens.killAll();
  
  if (import.meta.env.DEV) {
    console.log('[PreloadScene] Shutdown complete');
  }
}
```

---

### Performance Targets

**Loading Performance:**
- **Target Load Time:** < 3 seconds on broadband (10 Mbps)
- **Target FPS During Load:** 60 FPS sustained
- **Progress Update Frequency:** Every asset load (smooth updates)
- **Minimum Display Time:** 500ms (avoid flash if load is instant)

**Asset Size Budget:**
- **Total Images:** < 2 MB
- **Total Audio:** < 3 MB
- **Total Assets:** < 5 MB (target for MVP)

**Performance Validation:**
- Test on throttled connection (Fast 3G simulation)
- Verify FPS remains 60 during load
- Confirm progress bar updates smoothly
- Check for memory spikes during load

---

## Implementation Tasks

Implement these tasks in order:

### Task 1: Setup Progress Bar Graphics
- [ ] Create progress bar container (rectangle outline)
- [ ] Create progress bar fill (inner rectangle)
- [ ] Position bar at screen center
- [ ] Create loading status text above bar
- [ ] Create percentage text below bar
- [ ] Verify visual appearance matches design specs

### Task 2: Implement Asset Loading
- [ ] Import AssetConfig (AssetKeys, AssetPaths)
- [ ] Load all image assets (sprites, tracks, UI)
- [ ] Load all audio assets (SFX, music)
- [ ] Use asset key constants (no hardcoded strings)
- [ ] Verify all assets load without errors
- [ ] Log each asset load in dev mode

### Task 3: Wire Up Progress Events
- [ ] Register 'progress' event listener (update bar fill)
- [ ] Register 'filecomplete' event listener (update status text)
- [ ] Register 'complete' event listener (handle completion)
- [ ] Register 'loaderror' event listener (log errors)
- [ ] Update percentage text on progress
- [ ] Verify progress bar animates smoothly

### Task 4: Implement Scene Transition
- [ ] Wait for minimum display time (500ms)
- [ ] Create fade-out tween effect
- [ ] Transition to MenuScene with data
- [ ] Log total load time in dev mode
- [ ] Verify smooth transition without flicker

### Task 5: Add Error Handling
- [ ] Handle individual asset load failures
- [ ] Log failed assets in dev mode
- [ ] Continue loading if non-critical asset fails
- [ ] Display generic text if asset name unavailable
- [ ] Test with missing asset files

### Task 6: Implement Cleanup
- [ ] Add shutdown() method
- [ ] Remove all load event listeners
- [ ] Clear timers and tweens
- [ ] Log shutdown in dev mode
- [ ] Verify no memory leaks with repeated loads

---

## Testing Requirements

### Unit Tests

**File:** `tests/scenes/PreloadScene.test.ts`

**Test Cases:**

1. **Scene Initialization**
   - [ ] Scene initializes with correct key
   - [ ] init() method stores scene data correctly
   - [ ] Handles empty scene data gracefully

2. **Asset Loading**
   - [ ] All AssetConfig assets are loaded
   - [ ] Uses asset key constants correctly
   - [ ] Handles missing assets gracefully
   - [ ] Loads assets in correct order (images then audio)

3. **Progress Tracking**
   - [ ] Progress bar updates on load events
   - [ ] Percentage text displays correct values
   - [ ] Status text updates with asset names
   - [ ] Progress reaches 100% when complete

4. **Scene Transition**
   - [ ] Transitions to MenuScene when complete
   - [ ] Passes correct data to MenuScene
   - [ ] Respects minimum display time
   - [ ] Applies fade-out effect before transition

5. **Error Handling**
   - [ ] Logs failed asset loads in dev mode
   - [ ] Continues loading if asset fails
   - [ ] Displays error-safe text
   - [ ] Completes transition even with failures

6. **Cleanup**
   - [ ] shutdown() removes all listeners
   - [ ] Clears timers and tweens
   - [ ] No memory leaks after shutdown
   - [ ] Can restart scene without issues

### Integration Tests

1. **BootScene → PreloadScene Transition**
   - [ ] PreloadScene receives data from BootScene
   - [ ] Transition is smooth and seamless
   - [ ] Scene initializes immediately after transition

2. **PreloadScene → MenuScene Transition**
   - [ ] MenuScene receives asset loaded confirmation
   - [ ] All assets are accessible in MenuScene
   - [ ] Transition includes fade effect
   - [ ] No errors during transition

3. **Full Scene Lifecycle**
   - [ ] init → preload → create → shutdown works correctly
   - [ ] Repeated scene starts don't cause errors
   - [ ] Memory usage stable across restarts

### Manual Testing Checklist

- [ ] Progress bar fills smoothly from 0% to 100%
- [ ] Loading text displays asset names (or generic text)
- [ ] Percentage text updates frequently
- [ ] Minimum 500ms display time respected (test fast load)
- [ ] Transition to MenuScene is smooth (no flicker)
- [ ] Works on throttled connection (Fast 3G)
- [ ] Handles missing asset files gracefully
- [ ] FPS remains 60 during loading
- [ ] Restart scene works without memory leaks

---

## Definition of Done

- [ ] All acceptance criteria met (functional, technical, game design)
- [ ] All implementation tasks completed and verified
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Manual testing checklist completed
- [ ] Code follows TypeScript strict mode
- [ ] No ESLint errors or warnings
- [ ] Performance targets met (60 FPS, <3s load time)
- [ ] Memory profiling shows no leaks
- [ ] Scene transitions work smoothly
- [ ] Error handling tested with missing assets
- [ ] Dev mode logging works correctly
- [ ] Code reviewed and approved
- [ ] Documentation updated (SCENE-FLOW-DIAGRAM.md)
- [ ] Story marked as COMPLETE

---

## Notes for Developer

**Asset Configuration:**
- All asset keys and paths are defined in `src/config/AssetConfig.ts`
- Use `AssetKeys.CAR` instead of `'car'` for type safety
- Use `AssetPaths[AssetKeys.CAR]` to get the file path

**Progress Events:**
- `progress` event fires with overall progress (0.0 to 1.0)
- `filecomplete` event fires per asset with key and file object
- `complete` event fires when all assets loaded
- `loaderror` event fires if asset fails to load

**Minimum Display Time:**
- Even if assets load instantly, show progress for 500ms
- Prevents jarring flash of loading screen
- Use `this.time.delayedCall(500, callback)` to ensure timing

**Scene Transition:**
- Use `this.cameras.main.fadeOut(500)` for smooth exit
- Start MenuScene in fade complete callback
- Pass data via second parameter of scene.start()

**Testing Tips:**
- Test with browser dev tools network throttling
- Verify FPS with `this.game.loop.actualFps` logging
- Test missing assets by temporarily removing files
- Use Chrome DevTools Memory profiler to check for leaks

**Common Pitfalls:**
- Forgetting to remove event listeners in shutdown()
- Not handling load errors (breaks game if asset missing)
- Progress bar math errors (divide by zero if no assets)
- Skipping minimum display time (causes flash)
- Hardcoding asset paths (breaks when assets change)

---

## Related Documentation

- **Architecture Document:** Scene Management System section
- **Asset Guidelines:** Asset loading specifications
- **Story 1.2.1:** BootScene implementation (reference for pattern)
- **AssetConfig:** Asset keys and paths reference

---

## Story Dependencies

**Blocks:**
- Story 1.2.3: MenuScene Implementation (needs loaded assets)

**Depends On:**
- Story 1.2.1: BootScene Implementation ✅ (COMPLETE)

---

## Estimated Effort

**Points:** 5  
**Estimated Time:** 3-4 hours

**Breakdown:**
- Task 1 (Progress Bar Graphics): 30 min
- Task 2 (Asset Loading): 45 min
- Task 3 (Progress Events): 45 min
- Task 4 (Scene Transition): 30 min
- Task 5 (Error Handling): 30 min
- Task 6 (Cleanup): 20 min
- Unit Testing: 45 min
- Integration Testing: 20 min
- Manual Testing & Refinement: 30 min

---

**Story Created By:** Jordan (Game Scrum Master)  
**Date:** October 31, 2025
