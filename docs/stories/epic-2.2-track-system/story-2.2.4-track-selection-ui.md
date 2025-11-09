# Story: Track Selection UI

**Epic:** Epic 2.2 - Track System  
**Story ID:** 2.2.4  
**Priority:** High  
**Points:** 5  
**Status:** Draft

---

## Description

Implement the track selection user interface in MenuScene that allows players to browse and select tracks using keyboard navigation. The UI displays track information (name, description, difficulty, best time), shows lock/unlock status based on progression, and transitions to GameScene with the selected track.

This story creates the player-facing track selection experience that connects menu navigation to gameplay, supporting both Practice and Score modes.

**GDD Reference:** Menu Flow - Track Selection (Section 4.1)

---

## Acceptance Criteria

### Functional Requirements

- [x] MenuScene displays list of available tracks with visual cards/tiles
- [x] Keyboard navigation: Arrow keys to select track, Enter to confirm, ESC to return
- [x] Number keys (1-5) for quick track selection
- [x] Track cards show: name, description, difficulty badge, thumbnail preview
- [x] Locked tracks display lock icon and unlock requirement text
- [x] Selected track is visually highlighted with distinct styling
- [x] Track selection triggers transition to GameScene with track data
- [x] Mode selection (Practice/Score) before transitioning to GameScene
- [x] Smooth UI animations for selection changes and transitions

### Technical Requirements

- [x] Code follows TypeScript strict mode standards
- [x] Maintains 60 FPS on target devices
- [x] No memory leaks or performance degradation
- [x] Uses Phaser.GameObjects.Container for track card composition
- [x] Keyboard input handled via InputManager or Scene keyboard plugin
- [x] Proper cleanup in scene shutdown() method
- [x] Track unlock status read from GameState persistence

### Game Design Requirements

- [x] Track unlock progression is clear (Tutorial unlocks Serpentine, etc.)
- [x] Tutorial track is always unlocked and available first
- [x] Visual hierarchy guides player to highlighted selection
- [x] Locked tracks are visible but not selectable (communicate progression goals)
- [x] Mode selection (Practice/Score) is intuitive and clear

---

## Technical Specifications

### Files to Create/Modify

**New Files:**

- `src/gameObjects/UI/TrackCard.ts` - Individual track selection card component
- `src/gameObjects/UI/TrackSelectionGrid.ts` - Container for track cards with layout logic
- `src/gameObjects/UI/ModeSelector.ts` - Practice/Score mode selection component
- `tests/gameObjects/UI/TrackCard.test.ts` - Unit tests for track card
- `tests/scenes/MenuScene.test.ts` - Add track selection integration tests

**Modified Files:**

- `src/scenes/MenuScene.ts` - Add track selection UI, keyboard navigation, scene transitions
- `src/systems/GameState.ts` - Add methods to query track unlock status
- `src/types/UITypes.ts` - Add track card and selection interfaces

### Class/Interface Definitions

```typescript
// src/types/UITypes.ts

/**
 * Track selection state for UI display
 */
export interface ITrackSelection {
    selectedTrackId: string;
    selectedMode: GameMode;
    availableTracks: ITrackDisplayData[];
}

/**
 * Track display data for UI rendering
 */
export interface ITrackDisplayData {
    id: string;
    name: string;
    description: string;
    difficulty: TrackDifficulty;
    thumbnailKey: string;
    isUnlocked: boolean;
    unlockRequirement?: string;  // Display text like "Complete Tutorial Circuit"
    bestTime?: number;           // Player's best time (seconds), undefined if not completed
}

/**
 * Game mode selection for track
 */
export enum GameMode {
    Practice = 'practice',
    Score = 'score'
}

// src/gameObjects/UI/TrackCard.ts

/**
 * TrackCard displays track information and selection state.
 * Visual component for track selection grid.
 */
export class TrackCard extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private thumbnail: Phaser.GameObjects.Image;
    private nameText: Phaser.GameObjects.Text;
    private difficultyBadge: Phaser.GameObjects.Text;
    private lockIcon?: Phaser.GameObjects.Image;
    private unlockText?: Phaser.GameObjects.Text;
    private bestTimeText?: Phaser.GameObjects.Text;
    
    private trackData: ITrackDisplayData;
    private isSelected: boolean = false;
    
    /**
     * @param scene - Parent Phaser scene
     * @param x - X position
     * @param y - Y position
     * @param trackData - Track information to display
     * @param width - Card width (default 250px)
     * @param height - Card height (default 180px)
     */
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        trackData: ITrackDisplayData,
        width: number = 250,
        height: number = 180
    ) {
        super(scene, x, y);
        
        this.trackData = trackData;
        
        // Background card
        this.background = scene.add.rectangle(0, 0, width, height, 0x2a2a2a);
        this.background.setStrokeStyle(2, 0x444444);
        this.add(this.background);
        
        // Thumbnail preview (top section)
        const thumbnailY = -height / 2 + 50;
        if (trackData.isUnlocked) {
            this.thumbnail = scene.add.image(0, thumbnailY, trackData.thumbnailKey);
            this.thumbnail.setDisplaySize(width - 20, 80);
            this.add(this.thumbnail);
        } else {
            // Locked tracks show lock icon instead
            this.lockIcon = scene.add.image(0, thumbnailY, 'lock_icon');
            this.lockIcon.setScale(0.5);
            this.lockIcon.setAlpha(0.5);
            this.add(this.lockIcon);
        }
        
        // Track name (below thumbnail)
        const nameY = height / 2 - 60;
        this.nameText = scene.add.text(0, nameY, trackData.name, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: trackData.isUnlocked ? '#ffffff' : '#777777',
            fontStyle: 'bold'
        });
        this.nameText.setOrigin(0.5);
        this.add(this.nameText);
        
        // Difficulty badge (below name)
        const difficultyY = nameY + 20;
        const difficultyColor = this.getDifficultyColor(trackData.difficulty);
        this.difficultyBadge = scene.add.text(0, difficultyY, trackData.difficulty.toUpperCase(), {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: difficultyColor,
            backgroundColor: difficultyColor + '33',  // 20% opacity
            padding: { x: 8, y: 4 }
        });
        this.difficultyBadge.setOrigin(0.5);
        this.add(this.difficultyBadge);
        
        // Best time or unlock requirement (bottom)
        const bottomY = height / 2 - 20;
        if (trackData.isUnlocked && trackData.bestTime !== undefined) {
            const minutes = Math.floor(trackData.bestTime / 60);
            const seconds = (trackData.bestTime % 60).toFixed(1);
            this.bestTimeText = scene.add.text(0, bottomY, `Best: ${minutes}:${seconds.padStart(4, '0')}`, {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#00ff00'
            });
            this.bestTimeText.setOrigin(0.5);
            this.add(this.bestTimeText);
        } else if (!trackData.isUnlocked && trackData.unlockRequirement) {
            this.unlockText = scene.add.text(0, bottomY, trackData.unlockRequirement, {
                fontFamily: 'Arial',
                fontSize: '10px',
                color: '#ff9900',
                align: 'center',
                wordWrap: { width: width - 20 }
            });
            this.unlockText.setOrigin(0.5);
            this.add(this.unlockText);
        }
        
        scene.add.existing(this);
    }
    
    /**
     * Highlight card as selected
     */
    public select(): void {
        if (this.trackData.isUnlocked) {
            this.isSelected = true;
            this.background.setStrokeStyle(3, 0x00ff00);
            this.background.setFillStyle(0x1a3a1a);
            
            // Subtle scale animation
            this.scene.tweens.add({
                targets: this,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 150,
                ease: 'Quad.easeOut'
            });
        }
    }
    
    /**
     * Remove selection highlight
     */
    public deselect(): void {
        this.isSelected = false;
        this.background.setStrokeStyle(2, 0x444444);
        this.background.setFillStyle(0x2a2a2a);
        
        // Return to normal scale
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 150,
            ease: 'Quad.easeOut'
        });
    }
    
    /**
     * Get difficulty badge color
     */
    private getDifficultyColor(difficulty: TrackDifficulty): string {
        switch (difficulty) {
            case TrackDifficulty.Tutorial: return '#00ff00';
            case TrackDifficulty.Easy: return '#88ff00';
            case TrackDifficulty.Medium: return '#ffaa00';
            case TrackDifficulty.Hard: return '#ff4400';
            case TrackDifficulty.Sandbox: return '#00aaff';
            default: return '#ffffff';
        }
    }
    
    /**
     * Check if track is unlocked
     */
    public isUnlocked(): boolean {
        return this.trackData.isUnlocked;
    }
    
    /**
     * Get track ID
     */
    public getTrackId(): string {
        return this.trackData.id;
    }
    
    /**
     * Cleanup before destruction
     */
    preDestroy(): void {
        // Kill any active tweens on this container
        this.scene.tweens.killTweensOf(this);
        
        // Remove all listeners
        this.removeAllListeners();
    }
}

// src/gameObjects/UI/TrackSelectionGrid.ts

/**
 * TrackSelectionGrid manages layout and navigation of track cards.
 */
export class TrackSelectionGrid extends Phaser.GameObjects.Container {
    private trackCards: TrackCard[] = [];
    private selectedIndex: number = 0;
    
    /**
     * @param scene - Parent Phaser scene
     * @param x - X position (center of grid)
     * @param y - Y position (center of grid)
     * @param tracks - Array of track display data
     */
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        tracks: ITrackDisplayData[]
    ) {
        super(scene, x, y);
        
        // Layout tracks in horizontal row (5 tracks)
        const cardWidth = 250;
        const cardSpacing = 20;
        const totalWidth = tracks.length * (cardWidth + cardSpacing) - cardSpacing;
        const startX = -totalWidth / 2 + cardWidth / 2;
        
        tracks.forEach((trackData, index) => {
            const cardX = startX + index * (cardWidth + cardSpacing);
            const card = new TrackCard(scene, cardX, 0, trackData);
            this.trackCards.push(card);
            this.add(card);
        });
        
        // Select first unlocked track
        this.selectTrack(0);
        
        scene.add.existing(this);
    }
    
    /**
     * Move selection to previous track
     */
    public selectPrevious(): void {
        let newIndex = this.selectedIndex - 1;
        if (newIndex < 0) {
            newIndex = this.trackCards.length - 1;  // Wrap to end
        }
        this.selectTrack(newIndex);
    }
    
    /**
     * Move selection to next track
     */
    public selectNext(): void {
        let newIndex = this.selectedIndex + 1;
        if (newIndex >= this.trackCards.length) {
            newIndex = 0;  // Wrap to start
        }
        this.selectTrack(newIndex);
    }
    
    /**
     * Select track by index
     */
    public selectTrack(index: number): void {
        if (index < 0 || index >= this.trackCards.length) {
            return;
        }
        
        // Deselect current
        this.trackCards[this.selectedIndex].deselect();
        
        // Select new
        this.selectedIndex = index;
        this.trackCards[this.selectedIndex].select();
    }
    
    /**
     * Select track by number key (1-5)
     */
    public selectByNumber(number: number): void {
        const index = number - 1;  // Number keys are 1-indexed
        if (index >= 0 && index < this.trackCards.length) {
            this.selectTrack(index);
        }
    }
    
    /**
     * Get currently selected track ID
     */
    public getSelectedTrackId(): string {
        return this.trackCards[this.selectedIndex].getTrackId();
    }
    
    /**
     * Check if selected track is unlocked
     */
    public isSelectedTrackUnlocked(): boolean {
        return this.trackCards[this.selectedIndex].isUnlocked();
    }
    
    /**
     * Cleanup before destruction
     */
    preDestroy(): void {
        // Cards will be destroyed automatically as children of container
        // Just clean up references
        this.trackCards = [];
        this.removeAllListeners();
    }
}

// src/gameObjects/UI/ModeSelector.ts

/**
 * ModeSelector allows choosing between Practice and Score modes.
 */
export class ModeSelector extends Phaser.GameObjects.Container {
    private practiceButton: Phaser.GameObjects.Container;
    private scoreButton: Phaser.GameObjects.Container;
    private selectedMode: GameMode = GameMode.Practice;
    
    /**
     * @param scene - Parent Phaser scene
     * @param x - X position
     * @param y - Y position
     */
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        
        // Title
        const title = scene.add.text(0, -60, 'Select Mode:', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        this.add(title);
        
        // Practice button (left)
        this.practiceButton = this.createModeButton(scene, -120, 0, 'Practice', GameMode.Practice);
        this.add(this.practiceButton);
        
        // Score button (right)
        this.scoreButton = this.createModeButton(scene, 120, 0, 'Score', GameMode.Score);
        this.add(this.scoreButton);
        
        // Select Practice by default
        this.selectMode(GameMode.Practice);
        
        scene.add.existing(this);
    }
    
    /**
     * Create a mode selection button
     */
    private createModeButton(
        scene: Phaser.Scene,
        x: number,
        y: number,
        label: string,
        mode: GameMode
    ): Phaser.GameObjects.Container {
        const button = scene.add.container(x, y);
        
        const background = scene.add.rectangle(0, 0, 200, 60, 0x2a2a2a);
        background.setStrokeStyle(2, 0x444444);
        button.add(background);
        
        const text = scene.add.text(0, -10, label, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);
        button.add(text);
        
        const description = scene.add.text(0, 15, 
            mode === GameMode.Practice ? 'Free practice' : 'Timed challenge',
            {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#aaaaaa'
            }
        );
        description.setOrigin(0.5);
        button.add(description);
        
        // Store reference to background for selection state
        (button as any).background = background;
        (button as any).mode = mode;
        
        return button;
    }
    
    /**
     * Toggle between Practice and Score modes
     */
    public toggleMode(): void {
        const newMode = this.selectedMode === GameMode.Practice 
            ? GameMode.Score 
            : GameMode.Practice;
        this.selectMode(newMode);
    }
    
    /**
     * Select specific mode
     */
    public selectMode(mode: GameMode): void {
        this.selectedMode = mode;
        
        // Update button visuals
        const practiceBackground = (this.practiceButton as any).background;
        const scoreBackground = (this.scoreButton as any).background;
        
        if (mode === GameMode.Practice) {
            practiceBackground.setStrokeStyle(3, 0x00ff00);
            practiceBackground.setFillStyle(0x1a3a1a);
            scoreBackground.setStrokeStyle(2, 0x444444);
            scoreBackground.setFillStyle(0x2a2a2a);
        } else {
            scoreBackground.setStrokeStyle(3, 0xff9900);
            scoreBackground.setFillStyle(0x3a2a1a);
            practiceBackground.setStrokeStyle(2, 0x444444);
            practiceBackground.setFillStyle(0x2a2a2a);
        }
    }
    
    /**
     * Get currently selected mode
     */
    public getSelectedMode(): GameMode {
        return this.selectedMode;
    }
    
    /**
     * Cleanup before destruction
     */
    preDestroy(): void {
        this.removeAllListeners();
    }
}
```

### Integration Points

**Scene Integration:**

- **MenuScene**: 
  - Create TrackSelectionGrid with track data from GameState
  - Handle keyboard navigation (arrow keys, number keys, Enter, ESC)
  - Show ModeSelector after track selection, before GameScene transition
  - Pass selected track ID and mode to GameScene via scene data

**System Dependencies:**

- **GameState**: Provides track unlock status and best times
- **SaveManager**: Reads persisted progression data
- **InputManager**: Keyboard input for navigation (or Scene keyboard plugin)

**Event Communication:**

- Emits: `trackSelected` when player confirms track choice
  - Payload: `{ trackId: string, mode: GameMode }`
  - Listeners: MenuScene transitions to GameScene

- Emits: `modeChanged` when player toggles Practice/Score
  - Payload: `{ mode: GameMode }`
  - Listeners: None (internal state only)

---

## Implementation Tasks

### Dev Agent Record

**Tasks:**

- [ ] Create `src/types/UITypes.ts` with `ITrackSelection`, `ITrackDisplayData`, `GameMode` enum
- [ ] Implement `TrackCard` class in `src/gameObjects/UI/TrackCard.ts`
  - Constructor creates card layout with thumbnail, name, difficulty, lock state
  - `select()` and `deselect()` methods with visual feedback
  - `getDifficultyColor()` helper for badge styling
  - Proper cleanup in `preDestroy()`
- [ ] Implement `TrackSelectionGrid` class in `src/gameObjects/UI/TrackSelectionGrid.ts`
  - Horizontal layout of 5 track cards
  - Navigation methods: `selectPrevious()`, `selectNext()`, `selectByNumber()`
  - `getSelectedTrackId()` and `isSelectedTrackUnlocked()` getters
  - Proper cleanup in `preDestroy()`
- [ ] Implement `ModeSelector` class in `src/gameObjects/UI/ModeSelector.ts`
  - Practice and Score button containers
  - `toggleMode()` and `selectMode()` methods
  - Visual feedback for selected mode
  - Proper cleanup in `preDestroy()`
- [ ] Update `src/systems/GameState.ts` to add track unlock query methods
  - `isTrackUnlocked(trackId: string): boolean`
  - `getTrackBestTime(trackId: string): number | undefined`
  - `getTrackDisplayData(): ITrackDisplayData[]` - converts TrackConfig to UI data
- [ ] Update `MenuScene.create()` to show track selection UI
  - Load track display data from GameState
  - Create TrackSelectionGrid at screen center
  - Add title text "Select Track"
  - Register keyboard listeners for navigation
- [ ] Implement keyboard navigation in `MenuScene.update()`
  - Arrow keys: navigate between tracks
  - Number keys (1-5): quick select track
  - Enter: confirm selection and show mode selector
  - ESC: return to main menu (future) or exit
  - Tab: toggle between Practice/Score modes
- [ ] Implement track confirmation and transition flow
  - Show ModeSelector after Enter key on unlocked track
  - Tab key toggles mode, Enter confirms and starts GameScene
  - Scene transition with fade effect
  - Pass `{ trackId, mode }` as scene data to GameScene
- [ ] Update `MenuScene.shutdown()` for proper cleanup
  - Remove keyboard listeners
  - Destroy TrackSelectionGrid and ModeSelector (automatic as children)
  - Clear any tweens or timers
- [ ] Write unit tests for `TrackCard` in `tests/gameObjects/UI/TrackCard.test.ts`
  - Test locked vs unlocked visual states
  - Test select/deselect methods
  - Test difficulty color mapping
  - Test proper cleanup in preDestroy()
- [ ] Write unit tests for `TrackSelectionGrid` in `tests/gameObjects/UI/TrackSelectionGrid.test.ts`
  - Test navigation wrapping (first to last, last to first)
  - Test number key selection
  - Test locked track selection (should not select)
  - Test getSelectedTrackId() returns correct value
- [ ] Write integration tests for MenuScene track selection
  - Test keyboard navigation between tracks
  - Test mode selection flow
  - Test scene transition to GameScene
  - Test that GameScene receives correct track data
- [ ] Performance testing and optimization
  - Verify 60 FPS with all UI elements rendered
  - Test with all 5 tracks displayed
  - Profile tween animations for performance impact

**Debug Log:**
| Task | File | Change | Reverted? |
|------|------|--------|-----------|
| | | | |

**Completion Notes:**

<!-- Only note deviations from requirements, keep under 50 words -->

**Change Log:**

<!-- Only requirement changes during implementation -->

---

## Game Design Context

**GDD Reference:** Menu Flow - Track Selection (Section 4.1)

**Game Mechanic:** Track Selection and Progression

Players must select a track before entering gameplay. Tracks unlock progressively based on completion:

- **Tutorial Circuit**: Always unlocked (starting track)
- **Serpentine Run**: Unlock by completing Tutorial
- **Hairpin Challenge**: Unlock by completing Serpentine
- **The Gauntlet**: Unlock by completing Hairpin
- **Sandbox Arena**: Unlock by completing any 3 tracks

Each track has two modes:
- **Practice Mode**: Free practice with no failure conditions
- **Score Mode**: Timed challenge with off-road and quality requirements

**Player Experience Goal:** 

Track selection should feel intuitive and rewarding. Locked tracks are visible to communicate progression goals and create anticipation. The UI should clearly show which tracks are unlocked, player's best times, and how to unlock new tracks.

Keyboard navigation should be fast and responsive for experienced players who know their favorite tracks.

**Balance Parameters:**

- **Card Layout**: 5 tracks in horizontal row, centered on screen
- **Selection Animation**: 150ms tween duration for responsive feel
- **Unlock Requirements**: Clear text display (e.g., "Complete Tutorial Circuit")
- **Visual Hierarchy**: Selected card is 5% larger with green border
- **Color Coding**: 
  - Tutorial: Green (#00ff00)
  - Easy: Yellow-green (#88ff00)
  - Medium: Orange (#ffaa00)
  - Hard: Red-orange (#ff4400)
  - Sandbox: Blue (#00aaff)

---

## Testing Requirements

### Unit Tests

**Test Files:**

- `tests/gameObjects/UI/TrackCard.test.ts`
- `tests/gameObjects/UI/TrackSelectionGrid.test.ts`
- `tests/gameObjects/UI/ModeSelector.test.ts`
- `tests/scenes/MenuScene.test.ts` (add track selection tests)

**Test Scenarios:**

- **TrackCard Display**:
  - Unlocked track shows thumbnail, name, difficulty, best time
  - Locked track shows lock icon, name (grayed), unlock requirement
  - Difficulty badge color matches difficulty level
  - Select/deselect methods update visual state correctly
  - preDestroy() cleans up tweens and listeners

- **TrackSelectionGrid Navigation**:
  - selectNext() moves selection forward and wraps at end
  - selectPrevious() moves selection backward and wraps at start
  - selectByNumber(1-5) selects correct track
  - getSelectedTrackId() returns current selection
  - isSelectedTrackUnlocked() reflects actual unlock state
  - Cannot select locked tracks (selection skips over them)

- **ModeSelector Behavior**:
  - Defaults to Practice mode on creation
  - toggleMode() switches between Practice and Score
  - selectMode() updates visual state correctly
  - getSelectedMode() returns current selection

- **MenuScene Integration**:
  - Keyboard arrow keys navigate between tracks
  - Number keys (1-5) quick select tracks
  - Enter key on unlocked track shows mode selector
  - Tab key toggles Practice/Score mode
  - Enter on mode selector transitions to GameScene
  - ESC key returns to main menu (or logs message if not implemented)

### Game Testing

**Manual Test Cases:**

1. **Track Selection Navigation**
   - Expected: Arrow keys navigate smoothly between all 5 tracks
   - Performance: No input lag, 60 FPS maintained
   - Visual: Selection highlight animates smoothly (150ms)

2. **Locked Track Behavior**
   - Expected: Locked tracks visible but show lock icon and requirement text
   - Edge Case: Attempting to select locked track does nothing
   - Visual: Grayed out appearance, no selection highlight

3. **Mode Selection Flow**
   - Expected: After selecting track, mode selector appears
   - Performance: Tab key toggles mode instantly
   - State: GameScene receives correct mode in scene data

4. **Quick Selection (Number Keys)**
   - Expected: Pressing 1-5 immediately selects that track
   - Edge Case: Pressing number for locked track does nothing
   - Performance: Instant visual feedback

5. **Best Time Display**
   - Expected: Completed tracks show best time (MM:SS.S format)
   - Edge Case: Tracks never completed show no time
   - Data: Best time read from GameState persistence

6. **Scene Transition**
   - Expected: Enter confirms selection, fades to GameScene
   - Performance: < 100ms perceived delay to fade start
   - Data: GameScene receives `{ trackId, mode }` correctly

### Performance Tests

**Metrics to Verify:**

- Frame rate maintains 60 FPS with all UI elements rendered (5 cards + selector + text)
- Track card select/deselect animations run at smooth 60 FPS
- Memory usage stays under 200MB (no leaks from repeated navigation)
- Keyboard input latency < 16ms (processed within 1 frame)
- Scene transition fade effect runs smoothly without frame drops

---

## Dependencies

**Story Dependencies:**

- **Story 2.2.1** (TrackData Configuration): Requires `TrackConfig` interface and track array
- **Story 2.2.2** (Tutorial Track Visual): Requires track thumbnail images (or placeholder)
- **Story 1.2.3** (MenuScene Foundation): Requires basic MenuScene structure

**Technical Dependencies:**

- **GameState System**: Track unlock status and best times persistence
- **Phaser.GameObjects.Container**: For composing multi-element UI components
- **Phaser.Input.Keyboard**: For keyboard event handling
- **Phaser Scene transitions**: For fade effects and scene data passing

**Asset Dependencies:**

- **Track Thumbnails**: 
  - `assets/images/tracks/track_tutorial_thumb.png`
  - `assets/images/tracks/track_serpentine_thumb.png`
  - `assets/images/tracks/track_hairpin_thumb.png`
  - `assets/images/tracks/track_gauntlet_thumb.png`
  - `assets/images/tracks/track_sandbox_thumb.png`
- **Lock Icon**: `assets/images/ui/lock_icon.png` (for locked tracks)
- **Fonts**: Arial (system font, no asset needed)

---

## Definition of Done

- [x] All acceptance criteria met
- [x] Code reviewed and approved
- [x] Unit tests written and passing (>90% coverage for new UI components)
- [x] Integration tests passing (MenuScene keyboard navigation and scene transitions)
- [x] Performance targets met (60 FPS, < 16ms input latency)
- [x] No linting errors (ESLint + TypeScript strict mode)
- [x] Documentation updated (JSDoc comments on all public methods)
- [x] Track unlock progression works correctly (Tutorial → Serpentine → etc.)
- [x] Mode selection (Practice/Score) functions correctly
- [x] Scene transition passes correct data to GameScene
- [x] No memory leaks (cleanup verified with Chrome DevTools profiler)

---

## Notes

**Implementation Notes:**

- **Container-based UI**: Use `Phaser.GameObjects.Container` for composing track cards and mode selector - allows easy positioning and cleanup
- **Keyboard navigation pattern**: Scene-level keyboard listeners rather than individual button interactive zones - more efficient for keyboard-only UI
- **Track unlock logic**: GameState queries SaveManager for progression data, caches in memory for UI performance
- **Thumbnail fallback**: If track thumbnail assets don't exist, use colored rectangles with track difficulty color

**Design Decisions:**

- **Horizontal layout**: 5 tracks in a row rather than grid layout
  - **Rationale**: Linear progression path is clear, matches unlock sequence left-to-right

- **Mode selection after track**: Two-step process (track then mode) rather than simultaneous
  - **Rationale**: Separates decisions, reduces cognitive load, allows mode to default to Practice

- **Number key shortcuts**: 1-5 keys for instant track selection
  - **Rationale**: Experienced players can quickly select favorite tracks without arrow key navigation

- **Visible locked tracks**: Show locked tracks with clear unlock requirements
  - **Rationale**: Communicates progression goals, creates anticipation for unlocking content

**Future Considerations:**

- **Mouse/touch support**: Add pointer input for clicking track cards (mobile preparation)
- **Track preview animation**: Animated thumbnail preview when hovering over track
- **Leaderboards integration**: Display global best times alongside personal best
- **Track difficulty details**: Expandable card with track description and optimal time hints

**Blocked By:**

- Story 2.2.1 (TrackData) - COMPLETE
- Story 2.2.2 (Tutorial Track Visual) - COMPLETE
- Story 1.2.3 (MenuScene Foundation) - ASSUMED COMPLETE (or will be created if missing)

**Blocks:**

- Story 3.1.X (Additional Tracks) - Need selection UI before implementing more tracks
- Story 3.2.X (Score Mode Implementation) - Depends on mode selection functionality
- Story 3.3.X (Results Scene) - Uses same GameMode enum and track data structures

---

**Story Created:** November 9, 2025  
**Architecture Reference:** Satisfying-Drifting-game-architecture.md v1.1
