# Story 1.3.1: Core Asset Loading Infrastructure

**Epic:** 1.3 - Asset Loading System  
**Story ID:** 1.3.1  
**Story Points:** 5  
**Priority:** High  
**Status:** ✅ COMPLETE  
**Assigned To:** Game Developer Agent  
**Created:** November 2, 2025  
**Completed:** November 2, 2025

---

## Story Description

Implement the foundational asset loading infrastructure that provides centralized asset management with error handling and development placeholders. This story creates the core `AssetConfig` and `AssetManager` that will be used throughout the game for all asset loading operations.

This infrastructure must support progressive loading strategies, provide clear asset key constants to avoid string literals, implement graceful error handling for missing assets, and create placeholder assets for development when real assets are unavailable.

**Player Value:** Enables rapid development without blocking on asset creation, ensures consistent asset management across all scenes, and provides robust error handling for production deployments.

---

## Acceptance Criteria

### Functional Requirements

- [x] **AssetConfig Created**: `src/config/AssetConfig.ts` exists with typed asset key constants for all asset categories
- [x] **Asset Categories Defined**: Images, audio (music + SFX), tracks, UI elements all have their keys defined
- [x] **AssetManager Implemented**: `src/systems/AssetManager.ts` singleton class handles all loading logic
- [x] **Error Handling Works**: Missing assets trigger console warnings and fallback to placeholders without crashing
- [x] **Placeholder Assets Created**: Colored rectangles/shapes replace missing sprites, silent audio for missing sounds
- [x] **Path Resolution**: Assets paths correctly resolve from both dev server and production builds
- [x] **Type Safety**: All asset keys are typed with TypeScript enums or const assertions
- [x] **Documentation Complete**: JSDoc comments explain usage patterns and asset naming conventions

### Technical Requirements

- [x] **Phaser Best Practices**: Uses `this.load.*` methods correctly in PreloadScene context
- [x] **Asset Key Constants**: No string literals for asset keys anywhere in codebase
- [x] **Error Boundary**: Try-catch blocks prevent asset loading failures from crashing game
- [x] **Fallback System**: Each asset type has a corresponding placeholder creation method
- [x] **Console Logging**: Clear, actionable error messages when assets fail to load
- [x] **Production Ready**: Error handling suitable for production (no crashes, graceful degradation)

### Game Design Requirements

- [x] **Development Speed**: Developers can work without waiting for final assets
- [x] **Visual Feedback**: Placeholder assets are clearly identifiable as temporary (distinct colors)
- [x] **Audio Silence**: Missing audio doesn't produce errors or placeholder sounds (silent by default)
- [x] **Consistency**: All asset references use the same centralized system

---

## Technical Specifications

### File Structure

```
src/
├── config/
│   └── AssetConfig.ts          # Asset key constants and paths
├── systems/
│   └── AssetManager.ts         # Centralized asset loading logic
└── types/
    └── AssetTypes.ts           # TypeScript interfaces for asset configs
```

### AssetConfig Implementation

**File:** `src/config/AssetConfig.ts`

**Purpose:** Centralized asset key constants and path definitions with TypeScript type safety.

**Key Requirements:**
- Export const objects with `as const` assertion for type inference
- Organize by asset category (images, audio, tracks, UI)
- Include both key and path for each asset
- Document expected file formats and sizes

**Type Safety Pattern:**
```typescript
export const ImageAssets = {
    CAR_SPRITE: { key: 'car-sprite', path: 'assets/images/sprites/car.png' },
    PARTICLE_SMOKE: { key: 'particle-smoke', path: 'assets/images/sprites/smoke.png' }
} as const;

export type ImageAssetKey = typeof ImageAssets[keyof typeof ImageAssets]['key'];
```

**Asset Categories to Define:**
1. **Images**
   - Car sprite (placeholder: 32x32 red rectangle)
   - Particle textures (smoke, sparkle - placeholder: 8x8 white circle)
   - UI elements (buttons, meters - placeholder: colored rectangles)

2. **Audio**
   - SFX: Tire screech, engine, UI clicks, drift pop
   - Music: Background music track
   - Placeholder: Silent audio buffers (no sound)

3. **Tracks**
   - 5 track images (Tutorial, Serpentine, Hairpin, Gauntlet, Sandbox)
   - Placeholder: 1280x720 gray rectangle with track name text

4. **UI Assets**
   - Fonts (web fonts or bitmap fonts)
   - Button sprites
   - Quality meter components
   - Placeholder: Phaser.GameObjects.Text with default font

**Expected Interface:**
```typescript
export interface AssetDefinition {
    key: string;
    path: string;
    format?: string;  // e.g., 'png', 'ogg', 'mp3'
    fallback?: string; // Alternative format path
}

export interface AssetConfig {
    images: Record<string, AssetDefinition>;
    audio: {
        music: Record<string, AssetDefinition>;
        sfx: Record<string, AssetDefinition>;
    };
    tracks: Record<string, AssetDefinition>;
    ui: Record<string, AssetDefinition>;
}
```

---

### AssetManager Implementation

**File:** `src/systems/AssetManager.ts`

**Purpose:** Singleton manager that handles asset loading, error handling, and placeholder creation.

**Key Requirements:**
- Singleton pattern (one instance per game)
- Integrates with Phaser's LoaderPlugin
- Creates placeholders when assets fail to load
- Emits events for loading progress and errors
- Tracks loaded vs failed assets for debugging

**Core Methods:**

```typescript
class AssetManager {
    private static instance: AssetManager;
    private loadedAssets: Set<string> = new Set();
    private failedAssets: Map<string, Error> = new Map();
    private placeholders: Map<string, Phaser.GameObjects.GameObject> = new Map();

    /**
     * Get singleton instance
     */
    public static getInstance(): AssetManager;

    /**
     * Queue asset for loading via Phaser's loader
     * @param scene - Scene containing loader instance
     * @param assetDef - Asset definition from AssetConfig
     */
    public queueAsset(scene: Phaser.Scene, assetDef: AssetDefinition): void;

    /**
     * Batch queue multiple assets
     * @param scene - Scene containing loader instance  
     * @param assets - Array of asset definitions
     */
    public queueAssets(scene: Phaser.Scene, assets: AssetDefinition[]): void;

    /**
     * Create placeholder for failed/missing asset
     * @param scene - Scene to create placeholder in
     * @param assetKey - Key of failed asset
     * @param assetType - Type ('image', 'audio', 'track')
     */
    private createPlaceholder(
        scene: Phaser.Scene, 
        assetKey: string, 
        assetType: string
    ): void;

    /**
     * Check if asset loaded successfully
     * @param assetKey - Key to check
     */
    public isLoaded(assetKey: string): boolean;

    /**
     * Get list of failed assets for debugging
     */
    public getFailedAssets(): Map<string, Error>;

    /**
     * Clear all tracking data (for scene transitions)
     */
    public reset(): void;
}
```

**Error Handling Pattern:**
```typescript
// In queueAsset method
scene.load.on('loaderror', (fileObj: Phaser.Loader.File) => {
    console.warn(`[AssetManager] Failed to load: ${fileObj.key}`);
    console.warn(`[AssetManager] Attempted path: ${fileObj.url}`);
    
    this.failedAssets.set(fileObj.key, new Error(`Asset not found: ${fileObj.url}`));
    
    // Create placeholder
    this.createPlaceholder(scene, fileObj.key, fileObj.type);
});
```

**Placeholder Creation Examples:**

```typescript
// Image placeholder: Colored rectangle with text
private createImagePlaceholder(scene: Phaser.Scene, key: string): void {
    const width = 64;
    const height = 64;
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    graphics.fillStyle(0xFF00FF, 1.0); // Magenta for visibility
    graphics.fillRect(0, 0, width, height);
    
    graphics.lineStyle(2, 0x000000, 1.0);
    graphics.strokeRect(0, 0, width, height);
    
    graphics.generateTexture(key, width, height);
    graphics.destroy();
    
    console.log(`[AssetManager] Created placeholder texture: ${key}`);
}

// Audio placeholder: Silent audio buffer
private createAudioPlaceholder(scene: Phaser.Scene, key: string): void {
    // Phaser handles missing audio gracefully, just log it
    console.log(`[AssetManager] Audio placeholder for: ${key} (will be silent)`);
}

// Track placeholder: Large rectangle with track name
private createTrackPlaceholder(scene: Phaser.Scene, key: string): void {
    const width = 1280;
    const height = 720;
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    graphics.fillStyle(0x333333, 1.0);
    graphics.fillRect(0, 0, width, height);
    
    graphics.generateTexture(key, width, height);
    graphics.destroy();
    
    console.log(`[AssetManager] Created track placeholder: ${key}`);
}
```

**Phaser 3.90+ Best Practices Applied:**
- Use `scene.load.on()` for event listeners (removed in scene shutdown)
- Use `scene.make.graphics()` for texture generation (no display list addition)
- Use `graphics.generateTexture()` for efficient placeholder creation
- Call `graphics.destroy()` immediately after texture generation to prevent memory leaks

---

### TypeScript Types

**File:** `src/types/AssetTypes.ts`

```typescript
/**
 * Base asset definition structure
 */
export interface AssetDefinition {
    /** Unique key for referencing this asset */
    key: string;
    /** Path relative to assets directory */
    path: string;
    /** Optional format specifier (e.g., 'png', 'ogg') */
    format?: string;
    /** Optional fallback path for alternative format */
    fallback?: string;
}

/**
 * Audio-specific asset definition
 */
export interface AudioAssetDefinition extends AssetDefinition {
    /** Array of format URLs (OGG, MP3, M4A) for browser compatibility */
    urls?: string[];
    /** Audio sprite configuration if applicable */
    config?: any;
}

/**
 * Image asset definition with optional normal map
 */
export interface ImageAssetDefinition extends AssetDefinition {
    /** Optional normal map texture path */
    normalMap?: string;
}

/**
 * Asset loading status for debugging
 */
export interface AssetLoadStatus {
    key: string;
    loaded: boolean;
    error?: Error;
    timestamp: number;
}
```

---

## Implementation Tasks

**Task Execution Order:** Sequential - each task builds on previous

### Task 1: Create AssetConfig with Type-Safe Keys
**Estimated Time:** 45 minutes

**Steps:**
1. Create `src/types/AssetTypes.ts` with interface definitions
2. Create `src/config/AssetConfig.ts` file
3. Define `ImageAssets` const object with all image keys and paths
4. Define `AudioAssets` const object split into `music` and `sfx` subcategories
5. Define `TrackAssets` const object for 5 track images
6. Define `UIAssets` const object for UI elements
7. Export type helpers: `ImageAssetKey`, `AudioAssetKey`, etc.
8. Add JSDoc comments documenting asset expectations (format, size, etc.)
9. Verify TypeScript compilation with strict mode

**Acceptance:**
- [x] File exists at `src/config/AssetConfig.ts`
- [x] All asset keys defined with `as const` assertion
- [x] Type helpers export correct literal union types
- [x] JSDoc comments explain usage and conventions
- [x] No TypeScript errors in strict mode

**Dependencies:** None

**Testing:**
```typescript
// Manual test in any scene
import { ImageAssets } from '@/config/AssetConfig';

// Should autocomplete and type-check
const carKey: ImageAssetKey = ImageAssets.CAR_SPRITE.key; // ✓
const invalidKey: ImageAssetKey = 'random-string'; // ✗ TypeScript error
```

---

### Task 2: Implement AssetManager Singleton
**Estimated Time:** 1.5 hours

**Steps:**
1. Create `src/systems/AssetManager.ts` file
2. Implement singleton pattern with private constructor
3. Add `getInstance()` static method
4. Implement `queueAsset()` method using Phaser loader
5. Implement `queueAssets()` batch method
6. Add internal tracking: `loadedAssets`, `failedAssets` sets/maps
7. Implement `isLoaded()` and `getFailedAssets()` query methods
8. Add `reset()` method for scene transitions
9. Add JSDoc comments for all public methods

**Acceptance:**
- [x] Singleton pattern correctly implemented
- [x] `queueAsset()` adds assets to Phaser loader
- [x] Batch loading works via `queueAssets()`
- [x] Asset tracking accurately reflects load state
- [x] No memory leaks (reset clears references)

**Dependencies:** Task 1 (needs AssetConfig)

**Testing:**
```typescript
// In PreloadScene preload()
const assetManager = AssetManager.getInstance();
assetManager.queueAsset(this, ImageAssets.CAR_SPRITE);

// After load complete
console.log(assetManager.isLoaded(ImageAssets.CAR_SPRITE.key)); // true
```

---

### Task 3: Implement Error Handling and Logging
**Estimated Time:** 1 hour

**Steps:**
1. Add `loaderror` event listener in `queueAsset()` method
2. Log detailed error messages with file path and key
3. Store error details in `failedAssets` map
4. Implement different error messages for dev vs production (check `isDevEnvironment()`)
5. Add warning about missing assets in development mode
6. Ensure errors don't crash game (wrapped in try-catch where needed)
7. Test with intentionally invalid asset paths

**Acceptance:**
- [x] Failed asset loads trigger console warnings (not errors)
- [x] Error messages include asset key and attempted path
- [x] Failed assets tracked in `failedAssets` map
- [x] Game continues running after asset load failure
- [x] Development mode shows more verbose logging

**Dependencies:** Task 2 (AssetManager exists)

**Testing:**
```typescript
// Queue non-existent asset
assetManager.queueAsset(this, { key: 'fake-asset', path: 'nonexistent.png' });

// Check console for warning (not error)
// Check failedAssets map
console.log(assetManager.getFailedAssets().size); // Should be > 0
```

---

### Task 4: Create Placeholder Asset Generation
**Estimated Time:** 1.5 hours

**Steps:**
1. Implement `createImagePlaceholder()` method using `scene.make.graphics()`
2. Generate magenta (0xFF00FF) rectangle with black border
3. Use `graphics.generateTexture()` to create texture from graphics
4. Implement `createAudioPlaceholder()` (just logging, Phaser handles missing audio)
5. Implement `createTrackPlaceholder()` for large track images
6. Add text labels to placeholders indicating asset key (optional but helpful)
7. Call placeholder creation automatically on `loaderror` event
8. Test placeholders appear when assets missing

**Acceptance:**
- [x] Missing images replaced with magenta rectangles
- [x] Missing audio logged but doesn't crash
- [x] Missing tracks replaced with gray placeholders
- [x] Placeholders created dynamically without blocking
- [x] `graphics.destroy()` called after texture generation (no memory leak)

**Dependencies:** Task 3 (error handling triggers placeholder creation)

**Testing:**
```typescript
// Queue missing asset
assetManager.queueAsset(this, { key: 'missing-image', path: 'fake.png' });

// In create(), try to use it
this.add.image(100, 100, 'missing-image'); // Should show magenta rectangle
```

---

### Task 5: Integration Testing and Documentation
**Estimated Time:** 45 minutes

**Steps:**
1. Create test scene (`TestAssetLoadingScene`) that exercises all AssetManager methods
2. Test loading valid assets (create minimal test assets if needed)
3. Test loading invalid assets and verify placeholders appear
4. Test batch loading with `queueAssets()`
5. Verify `reset()` clears all tracking data
6. Test that repeated singleton calls return same instance
7. Update README with asset management usage examples
8. Document placeholder asset expectations in `docs/ASSET-GUIDELINES.md`

**Acceptance:**
- [x] Test scene successfully loads and displays assets
- [x] Placeholders appear for missing assets
- [x] All AssetManager methods tested
- [x] Documentation complete in README and ASSET-GUIDELINES
- [x] No console errors during testing

**Dependencies:** Tasks 1-4 (all prior tasks complete)

**Testing:**
```typescript
class TestAssetLoadingScene extends Phaser.Scene {
    preload() {
        const assetManager = AssetManager.getInstance();
        
        // Test valid asset
        assetManager.queueAsset(this, ImageAssets.CAR_SPRITE);
        
        // Test invalid asset
        assetManager.queueAsset(this, { key: 'fake', path: 'fake.png' });
    }
    
    create() {
        // Both should work (one real, one placeholder)
        this.add.image(100, 100, ImageAssets.CAR_SPRITE.key);
        this.add.image(200, 100, 'fake'); // Magenta placeholder
    }
}
```

---

## Dependencies

### Upstream Dependencies (Required Before Starting)
- Epic 1.1 complete (project setup with TypeScript + Phaser)
- Epic 1.2 Story 1.2.2 complete (PreloadScene exists)

### Downstream Dependencies (Blocks These)
- Story 1.3.2 (PreloadScene integration needs this infrastructure)
- Epic 2.x stories (all gameplay features need asset loading)

### External Dependencies
- Phaser 3.90+ (already installed)
- TypeScript 5.0+ (already configured)

---

## Testing Requirements

### Unit Tests
**File:** `tests/systems/AssetManager.test.ts`

**Test Cases:**
1. **Singleton Pattern**
   - `getInstance()` returns same instance on multiple calls
   - Constructor is private (TypeScript compilation test)

2. **Asset Queuing**
   - `queueAsset()` adds asset to Phaser loader queue
   - `queueAssets()` batch adds multiple assets
   - Asset tracking updates on successful load

3. **Error Handling**
   - Failed assets added to `failedAssets` map
   - Error contains asset key and path
   - Game doesn't crash on load error

4. **Placeholder Creation**
   - `createImagePlaceholder()` generates valid texture
   - Generated texture exists in Texture Manager
   - Placeholder texture has expected dimensions

5. **State Management**
   - `reset()` clears all tracking maps
   - `isLoaded()` correctly reports asset status

**Mock Requirements:**
- Mock Phaser.Scene with loader
- Mock Phaser.Loader.LoaderPlugin
- Mock Phaser.Textures.TextureManager

### Integration Tests
**File:** `tests/integration/AssetLoading.test.ts`

**Test Cases:**
1. **Full Load Cycle**
   - Queue assets in preload
   - Verify load complete event fires
   - Check all assets accessible in create

2. **Error Recovery**
   - Queue missing assets
   - Verify placeholders created
   - Confirm game continues running

3. **Scene Transition**
   - Load assets in Scene A
   - Transition to Scene B
   - Verify assets still accessible (cached)

### Manual Testing Checklist
- [x] Load game in development mode
- [x] Verify placeholder assets appear for missing files
- [x] Check console for clear error messages
- [x] Modify AssetConfig to add new asset
- [x] Verify TypeScript autocomplete works for asset keys
- [x] Test in production build (minified)
- [x] Verify error handling doesn't expose stack traces in production

---

## Performance Considerations

### Target Metrics
- Asset config file size: < 5KB
- AssetManager memory overhead: < 100KB
- Placeholder generation time: < 10ms per asset
- No impact on 60 FPS target

### Optimization Notes
- Use `as const` for zero-runtime overhead on type checking
- Placeholder textures generated once and cached
- Singleton pattern prevents duplicate manager instances
- Error handling uses lightweight console methods

---

## Edge Cases and Error Scenarios

### Handled Scenarios
1. **Missing Asset File**: Placeholder created, warning logged
2. **Invalid Path**: Loader error caught, fallback triggered
3. **Network Timeout**: Phaser loader timeout handling (default 0 = no timeout)
4. **Duplicate Key**: Phaser warns, AssetManager tracks both attempts
5. **Scene Destroyed During Load**: Loader events cleaned up in scene shutdown

### Unhandled Scenarios (Future Work)
1. **Partial File Corruption**: Phaser loader doesn't validate file contents
2. **Race Conditions**: Multiple scenes loading same asset (Phaser handles via cache)
3. **Memory Limits**: No tracking of total asset memory usage
4. **Progressive Loading Priority**: All assets treated equally (addressed in Story 1.3.2)

---

## Definition of Done

- [x] All acceptance criteria met
- [x] All implementation tasks completed and checked off
- [x] Unit tests written and passing (>80% coverage)
- [x] Integration tests passing
- [x] Manual testing checklist completed
- [x] Code follows TypeScript strict mode standards
- [x] JSDoc comments on all public APIs
- [x] No ESLint warnings or errors
- [x] Phaser 3.90+ best practices followed (memory leak prevention)
- [x] Documentation updated (README, ASSET-GUIDELINES)
- [x] Code reviewed by another developer (or AI review passed)
- [x] Performance targets met (verified with DevTools)
- [x] Works in both development and production builds

---

## Notes and Considerations

### Design Decisions

**Why Singleton Pattern?**
- Only one AssetManager instance needed per game
- Simplifies access from any scene without DI
- Prevents accidental duplicate tracking state

**Why Magenta Placeholders?**
- Highly visible color that doesn't occur naturally in game
- Developers immediately know asset is missing
- Distinguishable from actual game graphics

**Why Silent Audio Placeholders?**
- Placeholder sounds could be distracting during development
- Phaser already handles missing audio gracefully
- Logging is sufficient for debugging

**Why Separate AssetConfig File?**
- Centralizes all asset definitions
- Makes it easy to update paths without touching logic
- Supports code generation tools (future)

### Known Limitations

- No asset versioning/cache busting (browser cache may serve stale assets)
- No validation of asset file formats (trust developer to use correct formats)
- No automatic retry on failed loads (developer must refresh page)
- No progress events during individual file loads (only overall loader progress)

### Future Enhancements (Out of Scope for This Story)

- Asset preloading priority system (critical vs optional)
- Asset bundle/pack support (group related assets)
- Dynamic asset unloading (free memory for unused assets)
- Asset validation (check file headers before loading)
- Retry mechanism for failed loads
- CDN fallback URLs
- Asset encryption/obfuscation

---

## Related Documents

- [Game Architecture Document](../Satisfying-Drifting-game-architecture.md) - Asset Management System section
- [Asset Guidelines](../ASSET-GUIDELINES.md) - Asset creation standards (create if doesn't exist)
- [Story 1.3.2](./story-1.3.2-preload-integration.md) - Next story in this epic

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| November 2, 2025 | 1.0 | Initial story creation | Game Scrum Master (Jordan) |
| November 2, 2025 | 2.0 | Story completed - all tasks done | Game Developer (Maya) |

---

**Story Status:** ✅ COMPLETE  
**Last Updated:** November 2, 2025
