# Satisfying Drifting - Prototype Design Document

**Version:** 1.1  
**Date:** October 28, 2025  
**Project Type:** Web Game Prototype  
**Engine:** Phaser 3.90+ + TypeScript  
**Platform:** Web (GitHub Pages)

---

## Executive Summary

### Core Concept

Satisfying Drifting is a top-down 2D drift mastery game built with Phaser 3.90+ and TypeScript. Players control a single car through keyboard inputs, learning to execute controlled drifts on progressively challenging tracks. The game prioritizes physics feel and player feedback over content volume, creating a meditative, flow-state experience focused purely on the satisfaction of perfect vehicle control.

### Target Audience

**Primary:** 16-35 years old, mastery-seeking players who value gameplay feel, comfortable with keyboard controls, enjoy games like N++, Trackmania, Absolute Drift  
**Secondary:** Speedrunners and score chasers who will optimize drift chains and compete for best times

### Platform & Technical Requirements

**Primary Platform:** Web (Desktop browsers - Chrome, Firefox, Safari)  
**Engine:** Phaser 3.90+ + TypeScript  
**Performance Target:** 60 FPS on mid-range desktop (2015+ hardware)  
**Screen Support:** 1280x720 minimum, scales to 1920x1080  
**Deployment:** GitHub Pages (static site)

### Unique Selling Points

1. **Pure Drift Focus** - No racing, no missions - just the art of controlled drifting
2. **Physics-First Design** - Car behavior tuned for satisfaction over realism
3. **Instant Restart** - Zero friction between attempts, optimized for flow state
4. **Minimalist Aesthetic** - Clean visuals that emphasize feedback and clarity
5. **Mastery Curve** - Deep physics system that rewards hundreds of hours of practice

---

## Core Gameplay

### Game Pillars

1. **Responsive Physics** - Car responds immediately to input with clear cause-and-effect. Players can feel momentum, friction, and weight transfer through the controls.

2. **Readable Feedback** - Every aspect of drift quality is communicated through visual (particles, trails), audio (tire screech pitch/volume), and scoring (real-time drift quality meter).

3. **Progressive Mastery** - Tutorial teaches basics in 2 minutes, but mastering perfect control takes hours. Clear skill ceiling with visible improvement.

4. **Flow-Optimized Experience** - Instant restart (R key), no loading between attempts, minimal UI, no interruptions to the driving experience.

### Core Gameplay Loop

**Primary Loop (15-45 seconds per track attempt):**

1. **Accelerate & Approach** (3-5s) - Build speed and line up for the first curve
2. **Initiate Drift** (0.5s) - Brake and steer to break traction, enter drift state
3. **Maintain Control** (2-8s) - Modulate throttle and steering to hold drift through curve
4. **Exit & Continue** (1-2s) - Straighten out, regain full traction, prepare for next curve
5. **Feedback & Restart** (1-2s) - See drift score/quality, press R to instantly retry

**Meta Loop (5-15 minutes per session):**
- Attempt track → Fail/succeed → Identify what went wrong → Adjust approach → Retry
- Players iterate rapidly, learning car behavior through repeated practice

### Win/Loss Conditions

**Game Modes:**

- **Practice Mode** - Pure learning environment with no penalties or scoring
- **Score Mode** - Performance tracking with failure states and drift quality scoring

**Success Conditions:**

**Practice Mode:**
- No formal win condition - explore, experiment, and learn car behavior
- Free to go off-road and recover without penalty
- Focus purely on understanding the physics

**Score Mode:**
- **Track Completion** - Navigate from start to finish without going off-road
- **Drift Quality** - Achieve minimum drift score based on angle, speed, and smoothness
- **Personal Best** - Beat your own best time or highest drift combo chain

**Failure States:**

**Practice Mode:**
- **No Failures** - Truly penalty-free exploration and skill development
- **Optional Reset** - Press R anytime to restart from beginning

**Score Mode:**
- **Off-Road** - Leaving track boundary ends attempt, shows results screen
- **Too Slow** - Coming to complete stop for >2 seconds triggers failure
- **Drift Quality Threshold** - Must maintain minimum drift quality to complete track

**Note on Practice Mode Feedback:** Practice mode still shows drift quality feedback (visual/audio) even without scoring - this helps players learn what "good drifting" feels like without the pressure of numbers.

---

## Game Mechanics

### Mechanic: Car Physics & Movement

**Description:**  
Top-down 2D car with arcade-style physics tuned for drift satisfaction. The car is a rigid body with velocity, angular velocity, and friction properties. Physics simulate momentum and weight transfer in a way that feels predictable yet challenging to master.

**Player Input:**
- **Accelerate:** W / Up Arrow (continuous input)
- **Brake/Reverse:** S / Down Arrow (continuous input)
- **Handbrake:** Space (continuous input) - **Drift initiation tool**
- **Steer Left:** A / Left Arrow (continuous input)
- **Steer Right:** D / Right Arrow (continuous input)
- **Instant Restart:** R key (single press)

**System Response:**

**Acceleration Behavior:**
- Forward acceleration: 300 pixels/s² (tunable)
- Max forward speed: 400 pixels/s (tunable)
- Brake deceleration: 400 pixels/s² (stronger than acceleration)
- Reverse speed: 150 pixels/s (half of forward)

**Steering Behavior:**
- Turn rate at speed: 180°/s at max speed (tunable)
- Turn rate when slow: 360°/s at low speed (tighter turns when slow)
- Steering is velocity-dependent: faster = wider turns

**Drift Physics (The Critical Part):**
- **Drift Threshold:** When lateral velocity exceeds 100 pixels/s, car enters "drift state"
- **Traction Loss:** While drifting, forward grip reduced to 70% (car slides sideways)
- **Angular Control:** Player can still steer during drift but with reduced authority
- **Drift Recovery:** Releasing brake and counter-steering gradually restores traction
- **Momentum Preservation:** Speed bleeds slowly during drift (95% retention per second)

**Handbrake Behavior:**
- **Purpose:** Quickly break rear traction to initiate drifts without losing much speed
- **Effect:** Instantly reduces rear friction to 0.5 (vs regular brake which reduces to 0.7)
- **Speed Impact:** Minimal speed loss (98% retention vs 95% for regular brake)
- **Best Practice:** Tap Space + Steer to initiate drift, then modulate throttle to maintain
- **Skill Differentiation:** Beginners can brake to drift, advanced players use handbrake for tighter entries

**Friction Model:**
- **Normal Mode:** High friction coefficient (0.95) - responsive, tight control
- **Drift Mode:** Lower friction coefficient (0.7) - slides more, wider arcs
- **Transition:** Smooth lerp between modes over 0.2 seconds

**Implementation Notes:**
- Use Phaser's Arcade Physics for basic movement
- Implement custom drift physics on top of Arcade Physics velocity
- Track "drift angle" (angle between velocity vector and car facing)
- Drift quality = function of drift angle, speed, and consistency
- Particle emitter configuration uses `Phaser.Types.Animations.PlayAnimationConfig` for granular control (Phaser 3.70+)
- Audio pitch/volume control via Web Audio API with proper context management (suspended vs closed)
- Proper cleanup: Implement `preDestroy()` method for Car entity to prevent memory leaks

**Dependencies:**
- Input system (keyboard polling)
- Physics update loop (60 FPS)
- Particle system for visual feedback
- Audio system for tire screech

**Tuning Parameters (Initial Values - WILL NEED ITERATION):**

| Parameter | Initial Value | Min | Max | Description |
|-----------|---------------|-----|-----|-------------|
| Max Speed | 400 px/s | 300 | 600 | Top speed of car |
| Acceleration | 300 px/s² | 200 | 500 | How quickly car speeds up |
| Brake Force | 400 px/s² | 300 | 600 | Deceleration strength |
| Turn Rate (Fast) | 180°/s | 120 | 240 | Steering sensitivity at speed |
| Turn Rate (Slow) | 360°/s | 240 | 480 | Steering sensitivity when slow |
| Drift Threshold | 100 px/s | 50 | 200 | Lateral velocity to enter drift |
| Drift Friction | 0.7 | 0.5 | 0.9 | Traction during drift |
| Normal Friction | 0.95 | 0.9 | 1.0 | Traction in normal driving |
| Handbrake Friction | 0.5 | 0.3 | 0.7 | Traction during handbrake (lower = more slide) |
| Handbrake Speed Loss | 2% | 0% | 5% | Speed reduction per second while holding handbrake |

---

### Mechanic: Drift Quality & Feedback System

**Description:**  
Real-time system that continuously evaluates drift performance based on multiple factors. Communicates quality through visual, audio, and UI feedback to teach players what "good drifting" looks and feels like.

**Drift Quality Factors:**

1. **Drift Angle (40% weight)** - Optimal range: 15°-45° between car facing and velocity
   - Too small (<15°): Not really drifting, low score
   - Sweet spot (15°-45°): Maximum points, "perfect drift" state
   - Too large (>45°): Losing control, reduced score
   - Extreme (>60°): Out of control, no points

2. **Speed Maintenance (30% weight)** - Keeping momentum through the drift
   - High speed (>300 px/s): Maximum multiplier
   - Medium speed (200-300 px/s): Good multiplier
   - Low speed (<200 px/s): Reduced multiplier
   - Crawling (<100 px/s): No multiplier

3. **Proximity to Edges (20% weight)** - Risk/reward for close calls
   - Very close (<50px from edge): 2x bonus multiplier
   - Close (50-100px): 1.5x bonus
   - Safe (100-200px): 1x normal
   - Far (>200px): 1x normal (no penalty for being safe)

4. **Smoothness (10% weight)** - Consistent control without jerky corrections
   - Measured by steering input variance
   - Smooth inputs: Full points
   - Jerky corrections: Reduced points

**Drift Quality Score:**
- Range: 0-100 per frame
- Running average over last 60 frames (1 second)
- Displayed as quality meter: Poor (0-30) | Good (31-70) | Perfect (71-100)

**System Response:**

**Visual Feedback:**
- **Tire Smoke Particles:**
  - Intensity: Scales with drift quality (0-100 particles/s)
  - Color: Poor = gray, Good = white, Perfect = white with subtle color tint
  - Trail length: Longer trails at higher quality
  - **Modern Config (Phaser 3.70+)**: Use `Phaser.Types.Animations.PlayAnimationConfig` for particle animations with random start frames and repeat control
  
- **Skid Marks:**
  - Persistent marks on track surface
  - Darkness increases with drift quality
  - Width varies with drift angle

- **Screen Effects:**
  - Subtle motion blur during high-quality drifts
  - Screen shake (very subtle) at perfect drift moments
  - Possible: Color grading shift during extended perfect drifts

- **Speed Lines/Aura:**
  - Appear during sustained perfect drifts (>2 seconds)
  - Intensity pulses with drift quality

**Audio Feedback:**
- **Tire Screech:**
  - Volume: 0-100% based on drift angle (louder = more angle)
  - Pitch: Varies with speed (higher pitch = faster)
  - Filter: Perfect drifts have cleaner tone, poor drifts sound rough
  - **Implementation**: Web Audio API with proper context suspension (not closure) for hot-reload environments
  
- **Engine Sound:**
  - RPM increases during throttle in drift
  - Slight doppler-style pitch bend when transitioning to/from drift

- **Perfect Drift "Pop":**
  - Satisfying audio cue when entering perfect drift state
  - Another "pop" when exiting if maintained for >1 second

**UI Feedback (Score Mode Only):**
- **Drift Combo Meter:**
  - Counts consecutive seconds of "Good" or better drifting
  - Resets if drift quality drops to "Poor" or exits drift
  - Displays: "x2.5 Combo!" etc.

- **Current Drift Score:**
  - Live updating number showing points earned this drift
  - Color-coded by quality tier

- **Total Track Score:**
  - Cumulative score for entire run
  - Only visible in Score mode

**Practice Mode Feedback:**
- All visual feedback active (particles, marks, effects)
- All audio feedback active (screech, engine, pops)
- NO score numbers or combo counters
- Optional: Simple quality indicator (colored bar or icon)

**Implementation Notes:**
- Drift quality calculated every frame in physics update
- Particle systems use dynamic emission rates with `Phaser.Types.Animations.PlayAnimationConfig` for granular animation control
- Audio system needs real-time pitch/volume control (Web Audio API with context suspension, not closure)
- Score multipliers stack multiplicatively
- Data structure to track drift "sessions" (start/end times)
- Debug mode shows all quality factors numerically
- **Memory Management**: Particle emitters must implement proper cleanup with `preDestroy()` method (Phaser 3.60+)

**Dependencies:**
- Physics system (provides drift angle, speed, position data)
- Particle system (Phaser particle emitters)
- Audio system (Web Audio API for dynamic sound)
- Collision detection (for proximity to edges)
- UI system (for score display in Score mode)

**Tuning Parameters:**

| Parameter | Initial Value | Description |
|-----------|---------------|-------------|
| Perfect Angle Min | 15° | Start of optimal drift angle range |
| Perfect Angle Max | 45° | End of optimal drift angle range |
| High Speed Threshold | 300 px/s | Speed for maximum multiplier |
| Edge Proximity Near | 50 px | Distance for 2x risk bonus |
| Edge Proximity Close | 100 px | Distance for 1.5x risk bonus |
| Combo Decay Time | 1.0s | Time before combo starts decaying |
| Quality Update Rate | 60 Hz | How often quality is recalculated |

---

## Track Design Framework

### MVP Track Lineup

For the prototype, we need tracks that teach and challenge drift mastery progressively:

**Track 1: Tutorial Circuit (The Basics)**
- **Purpose:** Teach controls and basic drift initiation
- **Length:** 30 seconds optimal time
- **Layout:** Simple oval with 4 wide, gentle curves (90° turns)
- **Width:** 150 pixels (generous, forgiving)
- **Challenges:** None - pure learning environment
- **Success Criteria:** Complete one full lap demonstrating basic drift in each corner

**Track 2: Serpentine Run (Drift Transitions)**
- **Purpose:** Practice linking drifts and transitioning left/right
- **Length:** 35 seconds optimal time
- **Layout:** S-curve pattern with 6 alternating turns (45° angles)
- **Width:** 120 pixels (moderate)
- **Challenges:** Quick weight transfer between opposite drifts
- **Success Criteria:** Maintain drift combo through at least 3 consecutive turns

**Track 3: Hairpin Challenge (Tight Control)**
- **Purpose:** Master slow-speed tight drifts
- **Length:** 40 seconds optimal time
- **Layout:** 3 wide sections connected by 3 hairpin turns (180° turns)
- **Width:** 90 pixels on hairpins, 150 pixels on straights
- **Challenges:** Speed management, precise drift angles in tight spaces
- **Success Criteria:** Complete without off-road, maintain good drift quality through hairpins

**Track 4: The Gauntlet (Speed & Risk)**
- **Purpose:** Test mastery with speed and proximity bonuses
- **Length:** 45 seconds optimal time
- **Layout:** High-speed course with 8 flowing curves (varied angles 30°-120°)
- **Width:** 100 pixels (narrow throughout)
- **Challenges:** Maintaining high speed, risk management near edges
- **Success Criteria:** Complete with average speed >250 px/s and 70+ drift quality average

**Track 5: Sandbox Arena (Free Practice)**
- **Purpose:** Open practice area for experimentation
- **Layout:** Large circular arena with optional obstacle cones/markers
- **Width:** 400+ pixels (massive open space)
- **Challenges:** Player-created - practice specific techniques
- **No completion criteria:** Just experiment and have fun

### Track Design Principles

**Visual Design:**
- **Clear Boundaries:** High contrast between track surface and off-road
- **Visual Flow:** Subtle arrows or racing line suggestions (optional)
- **Grid/Tile Pattern:** Helps players judge speed and distance
- **Lighting:** Subtle gradient from center to edges for depth perception

**Technical Requirements:**
- All tracks are Phaser TileSprites or static images
- Collision boundaries defined by Phaser Physics bodies (polygon or rectangle)
- Track width verified at all points (no accidental narrow spots)
- Checkpoint system for lap tracking (invisible triggers)

**Difficulty Progression:**
- **Width:** Starts generous (150px), gradually narrows to challenging (90px)
- **Curve Complexity:** Simple 90° → varied angles → tight hairpins → flowing combinations
- **Speed Requirements:** Slow and controlled → moderate → high-speed precision
- **Length:** Short (30s) → gradually longer (45s) to maintain engagement

**Performance Considerations:**
- Each track should be single sprite or tiled background (not complex scene graph)
- Maximum 2000x2000 pixels per track for memory efficiency
- Collision uses simple polygon boundaries (not pixel-perfect)
- Background can be solid color with simple pattern for visual interest

### Track Creation Workflow

**For Development:**
1. **Sketch on paper/tablet:** Define racing line and turn angles
2. **Create in image editor:** Simple shapes, high contrast
3. **Define collision boundaries:** Array of points for polygon collider
4. **Set spawn point and direction:** Player starting position
5. **Place checkpoints:** For lap detection (if circular track)
6. **Playtest and iterate:** Adjust width, angles based on feel

**Track Data Structure:**
```typescript
interface TrackConfig {
  id: string;
  name: string;
  imageKey: string;  // Phaser asset key
  width: number;     // Track width in pixels
  collisionBoundary: { x: number, y: number }[];  // Polygon points
  spawnPoint: { x: number, y: number, angle: number };
  checkpoints?: { x: number, y: number, radius: number }[];
  optimalTime: number;  // Target completion time in seconds
  minimumQuality: number;  // Required avg drift quality (Score mode)
}
```

### Visual Track Elements

**Required:**
- Track surface (solid or tiled texture)
- Clear boundary markers (walls, barriers, or color contrast)
- Start/finish line (visual indicator)

**Optional (Polish Phase):**
- Skid mark overlay layer
- Racing line hints (faint arrows or dashed lines)
- Decorative elements outside track (trees, barriers, spectators)
- Track name/number display at start
- Minimap (corner of screen showing track layout)

---

## UI/UX Design

### Core UX Principles

1. **Minimal Friction** - Players should be driving within 5 seconds of page load
2. **Instant Restart** - R key instantly resets, no confirmation dialogs
3. **Unobtrusive UI** - HUD elements don't distract from the driving experience
4. **Clear Feedback** - All information is scannable at a glance while driving
5. **Responsive Design** - Scales cleanly from 1280x720 to 1920x1080+

### Screen Layouts

**Main Menu (Entry Point)**
```
┌─────────────────────────────────────────┐
│                                         │
│        SATISFYING DRIFTING             │
│                                         │
│         [Practice Mode]                 │
│         [Score Mode]                    │
│         [Settings]                      │
│         [Controls]                      │
│                                         │
│     Press any key to continue...       │
│                                         │
└─────────────────────────────────────────┘
```
- Clean, centered layout
- Large, readable buttons
- Keyboard navigation (1/2/3/4 or arrow keys + Enter)
- Can skip directly to sections with number keys

**Settings Menu**
```
┌─────────────────────────────────────────┐
│  SETTINGS                       [X]     │
├─────────────────────────────────────────┤
│                                         │
│  Music Volume                           │
│  ◄ ████████░░ 8 ►                       │
│                                         │
│  Effects Volume                         │
│  ◄ ██████████ 10 ►                      │
│                                         │
│  ← → to adjust    Enter to confirm     │
│  [ESC] Back to menu                     │
│                                         │
└─────────────────────────────────────────┘
```
- Arrow keys to adjust (0-10)
- 0 = OFF (muted)
- Visual bar shows current level
- Enter to confirm and save to localStorage
- ESC to go back

**Track Selection**
```
┌─────────────────────────────────────────┐
│  SELECT TRACK                   [X]     │
├─────────────────────────────────────────┤
│  [1] Tutorial Circuit                   │
│  [2] Serpentine Run                     │
│  [3] Hairpin Challenge                  │
│  [4] The Gauntlet                       │
│  [5] Sandbox Arena                      │
│                                         │
│  Press number to select                 │
│  [ESC] Back to menu                     │
└─────────────────────────────────────────┘
```
- Number keys for instant selection
- ESC to return
- Shows track preview/thumbnail (optional polish)

**In-Game HUD - Practice Mode**
```
┌─────────────────────────────────────────┐
│ Tutorial Circuit        [R] Restart     │
│ Practice Mode                           │
│                                         │
│                [Game viewport]          │
│                                         │
│ Speed: 247 px/s                         │
│ Quality: ████████░░ GOOD                │
└─────────────────────────────────────────┘
```
- Minimalist top bar with track name and restart reminder
- Bottom left: Speed indicator (optional, can hide)
- Bottom left: Drift quality bar with tier label
- NO score display in Practice mode

**In-Game HUD - Score Mode**
```
┌─────────────────────────────────────────┐
│ The Gauntlet                 [R] Restart│
│ Score: 8,450        Combo: x3.2         │
│                                         │
│                [Game viewport]          │
│                                         │
│ Speed: 312 px/s    Current: +145        │
│ Quality: ████████████ PERFECT           │
└─────────────────────────────────────────┘
```
- **[R] Restart** in top right for consistency
- Score and combo on second line
- Bottom left: Speed and current drift points
- Bottom left: Drift quality bar
- All elements fade to 50% opacity after 2s without change (less distraction)

**Results Screen - Score Mode**
```
┌─────────────────────────────────────────┐
│                                         │
│          RUN COMPLETE!                  │
│                                         │
│     Final Score: 12,450                 │
│     Best Combo: x4.8                    │
│     Time: 38.2s                         │
│     Avg Quality: 75 (Good)              │
│                                         │
│     Personal Best: 15,200               │
│                                         │
│     [R] Retry    [ESC] Track Select     │
│                                         │
└─────────────────────────────────────────┘
```
- Shows performance stats
- Compares to personal best
- Instant retry with R key
- Can return to track select with ESC

**Results Screen - Practice Mode**
```
┌─────────────────────────────────────────┐
│                                         │
│         TRACK COMPLETE!                 │
│                                         │
│     Time: 35.8s                         │
│     Avg Speed: 265 px/s                 │
│     Avg Quality: 68 (Good)              │
│                                         │
│     You're getting better!              │
│                                         │
│     [R] Retry    [ESC] Track Select     │
│                                         │
└─────────────────────────────────────────┘
```
- Stats without scoring pressure
- Encouraging message
- Same navigation options

**Controls Screen**
```
┌─────────────────────────────────────────┐
│  CONTROLS                               │
├─────────────────────────────────────────┤
│  W / ↑        Accelerate                │
│  S / ↓        Brake / Reverse           │
│  A / ←        Steer Left                │
│  D / →        Steer Right               │
│  SPACE        Handbrake (Drift)         │
│  R            Restart Track             │
│  ESC          Pause / Menu              │
│                                         │
│  [ESC] Back                             │
└─────────────────────────────────────────┘
```
- Simple, scannable list
- Accessible from main menu

**BootScene (Loading)**
```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│        SATISFYING DRIFTING             │
│                                         │
│         Loading...                      │
│       ████████████░░░░░░░░ 67%         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```
- Simple centered loading bar
- Percentage indicator
- Minimal animation (smooth progress fill)
- Transitions to menu when complete

### UI Visual Style

**Typography:**
- **Font:** Clean sans-serif (e.g., Roboto, Inter, or system default)
- **Sizes:** Title: 48px, Headers: 32px, Body: 24px, HUD: 18px
- **Color:** High contrast white text on dark backgrounds
- **Readability:** All text legible while car is moving

**Color Palette:**
- **Background:** Dark green (#1a3a1a) - represents grass/environment
- **Track Surface:** Dark asphalt gray (#2a2a2a)
- **Off-Road/Grass:** Slightly lighter green (#2a4a2a)
- **UI Accents:** Bright cyan (#00d9ff) for highlights
- **Quality Tiers:**
  - Poor: Red (#ff4444)
  - Good: Yellow (#ffcc00)
  - Perfect: Green (#00ff88)
- **Text:** White (#ffffff) primary, light gray (#cccccc) secondary

**Animations:**
- Fade in/out for screens (0.2s)
- Score counter animates with quick increment
- Quality bar smoothly lerps to target value (0.1s)
- Subtle pulse on "Perfect" quality state

### Accessibility Considerations

**Visual:**
- High contrast between all elements
- Text size readable from typical viewing distance
- Color-blind friendly (don't rely solely on color for info)
- Option to increase HUD size (stretch goal)

**Audio:**
- All important feedback has visual equivalent
- Sound effects enhance but aren't required
- Volume controls in options menu

**Input:**
- Keyboard only (no mouse required during gameplay)
- Alternative key bindings (WASD + Arrow keys both work)
- Clear input feedback (visual indication of key presses in tutorial)

### Technical Implementation

**Phaser Scenes:**
- `BootScene` - Asset loading with centered loading bar
- `MenuScene` - Main menu
- `SettingsScene` - Audio settings
- `TrackSelectScene` - Track selection
- `GameScene` - Main gameplay
- `ResultsScene` - End of run stats
- `ControlsScene` - Controls reference

**Scene Lifecycle Best Practices (Phaser 3.90+):**
- All scenes must implement `shutdown()` method for proper cleanup
- Remove event listeners in `shutdown()`, NOT in destroy
- Do NOT manually destroy Game Objects in `shutdown()` - Phaser handles this
- Use `this.events.off()` with specific handler references to prevent memory leaks
- Scene data passed via `this.scene.start('NextScene', { data })` for type-safe communication

**UI Components (Reusable):**
- `Button` - Interactive menu button
- `QualityBar` - Drift quality indicator
- `ScoreCounter` - Animated score display
- `InfoPanel` - Overlay information box

**Settings Persistence:**
```typescript
interface GameSettings {
  musicVolume: number;    // 0-10 (0 = muted)
  effectsVolume: number;  // 0-10 (0 = muted)
}
```
- Saved to `localStorage` on change with validation and error handling
- Loaded on game start with try-catch for corrupted data
- Applied to Phaser sound manager
- Conversion: settingValue / 10 = Phaser volume (0.0-1.0)
- Implement data versioning for future migrations

**Performance:**
- UI elements are static sprites/text, not recreated each frame
- HUD updates only when values change
- Minimal DOM manipulation (pure Canvas/WebGL rendering)

---

## Technical Architecture

### Technology Stack

**Core Framework:**
- **Phaser 3.90+** (latest stable) - Game framework
- **TypeScript** (v5.0+) - Type-safe development
- **Vite** - Build tool and dev server with fast HMR
- **Node.js** (v18+) - Development environment

**Asset Pipeline:**
- Image formats: PNG (sprites), JPG (backgrounds)
- Audio formats: OGG + MP3 (cross-browser compatibility, avoid M4A)
- Audio Sprites: Use `this.load.audioSprite()` with JSON-first pattern
- Asset loading: Phaser AssetLoader with progress tracking
- Support for Base64 data URIs in audio (Phaser 3.90+)

**Deployment:**
- GitHub Pages (static site hosting)
- Production build: Single-page HTML5 app
- CDN: GitHub's infrastructure

### Project Structure

```
satisfying-drifting/
├── src/
│   ├── scenes/
│   │   ├── BootScene.ts          # Loading screen
│   │   ├── MenuScene.ts          # Main menu
│   │   ├── SettingsScene.ts      # Audio settings
│   │   ├── TrackSelectScene.ts   # Track selection
│   │   ├── GameScene.ts          # Main gameplay
│   │   ├── ResultsScene.ts       # Post-run stats
│   │   └── ControlsScene.ts      # Controls guide
│   ├── entities/
│   │   └── Car.ts                # Player car class
│   ├── systems/
│   │   ├── PhysicsSystem.ts      # Custom drift physics
│   │   ├── DriftQualitySystem.ts # Quality evaluation
│   │   ├── FeedbackSystem.ts     # Visual/audio feedback
│   │   └── InputSystem.ts        # Keyboard handling
│   ├── config/
│   │   ├── GameConfig.ts         # Phaser configuration
│   │   ├── PhysicsConfig.ts      # Physics parameters
│   │   └── TrackConfig.ts        # Track definitions
│   ├── ui/
│   │   ├── Button.ts             # Reusable button
│   │   ├── QualityBar.ts         # Drift quality display
│   │   └── ScoreCounter.ts       # Animated score
│   ├── utils/
│   │   ├── MathUtils.ts          # Vector math helpers
│   │   └── StorageUtils.ts       # localStorage wrapper
│   └── main.ts                   # Entry point
├── assets/
│   ├── images/
│   │   ├── car.png
│   │   ├── track-*.png           # Track images
│   │   └── ui/                   # UI sprites
│   ├── audio/
│   │   ├── music/
│   │   │   └── ambient-loop.ogg
│   │   └── sfx/
│   │       ├── tire-screech.ogg
│   │       ├── engine.ogg
│   │       └── perfect-drift.ogg
│   └── particles/
│       └── smoke.png
├── public/
│   └── index.html
├── docs/                          # Design documents
│   ├── Satisfying-Drifting-game-brief.md
│   └── Satisfying-Drifting-design-doc.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Core Systems Architecture

**Car Entity:**
```typescript
class Car extends Phaser.GameObjects.Sprite {
  // Physics state
  velocity: Phaser.Math.Vector2;
  angularVelocity: number;
  
  // Drift state
  isDrifting: boolean;
  driftAngle: number;
  driftDuration: number;
  
  // Input state
  input: InputState;
  
  // Event listener references for cleanup
  private updateHandler?: () => void;
  
  // Methods
  update(delta: number): void;
  applyPhysics(delta: number): void;
  checkDriftState(): void;
  handleInput(): void;
  
  // Phaser 3.50+ lifecycle methods
  addedToScene(): void;      // Called when added to scene
  removedFromScene(): void;  // Called when removed from scene
  
  // Phaser 3.50+ cleanup pattern
  preDestroy(): void {
    // Clean up BEFORE parent destroy
    if (this.updateHandler) {
      this.off('update', this.updateHandler);
      this.updateHandler = undefined;
    }
    this.removeAllListeners();
  }
  
  destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
  }
}
```

**Physics System Flow:**
1. Read keyboard input state
2. Apply acceleration/braking forces
3. Apply steering (velocity-dependent)
4. Calculate lateral velocity (drift detection)
5. Apply appropriate friction (normal vs drift mode)
6. Update position and rotation
7. Check track boundaries

**Drift Quality System Flow:**
1. Calculate drift angle (velocity vs facing)
2. Measure speed
3. Check proximity to track edges
4. Measure input smoothness
5. Compute weighted quality score (0-100)
6. Update running average
7. Trigger feedback systems

**Feedback System Flow:**
1. Receive quality score from Drift Quality System
2. Update particle emission rate
3. Adjust audio pitch/volume
4. Update UI elements (quality bar, score)
5. Trigger special effects (perfect drift pop)

### Performance Optimization

**Target Performance:**
- 60 FPS constant on mid-range desktop (2015+ hardware)
- <50MB total memory usage
- <3s initial load time

**Optimization Strategies:**
- **Object Pooling:** Particle systems reuse objects (implement proper `preDestroy()` cleanup)
- **Texture Atlases:** Combine small sprites into single texture for better batching
- **Audio Sprites:** Combine sound effects using `this.load.audioSprite()` with JSON-first pattern
- **Lazy Loading:** Load tracks on-demand using `this.load.sceneFile()` for dynamic scene management
- **Delta Time:** All physics/animations use delta time for consistent behavior across frame rates
- **Render Optimization:** Static UI elements cached, only update on change
- **Display/Update List Management:** Remove static objects from update list with `removeFromUpdateList()`

**Profiling Points:**
- Physics update loop (should be <5ms per frame)
- Particle system emission (limit max particles to 200, implement proper cleanup)
- Audio system (Web Audio API with context suspension monitoring)
- Memory usage (Chrome DevTools heap snapshots to detect leaks)
- Event listener cleanup (verify all handlers are removed in scene shutdown)

### Data Flow Architecture

```
User Input (Keyboard)
    ↓
InputSystem (polling)
    ↓
Car Entity (apply forces)
    ↓
PhysicsSystem (calculate movement)
    ↓
DriftQualitySystem (evaluate performance)
    ↓
FeedbackSystem (visual/audio)
    ↓
UI Components (score, quality bar)
    ↓
Screen Render (60 FPS)
```

### Development Workflow

**Phase 1: Core Physics (Week 1-2)**
1. Set up Phaser 3.90+ + TypeScript + Vite project
2. Configure TypeScript with Phaser types properly
3. Implement basic car movement (acceleration, steering)
4. Add drift physics (friction modes, lateral velocity)
5. Implement proper cleanup patterns (`preDestroy()`, scene `shutdown()`)
6. Create single test track
7. Iterate on feel until satisfying

**Phase 2: Feedback Systems (Week 3)**
1. Implement particle system with modern config (Phaser 3.70+ animation support)
2. Add audio system with Web Audio API (context suspension, not closure)
3. Create drift quality evaluation
4. Build quality bar UI component
5. Implement proper particle emitter cleanup with `preDestroy()`
6. Tune feedback to match physics

**Phase 3: Content & Menus (Week 4)**
1. Design and create 5 MVP tracks
2. Build menu system (Boot, Menu, Settings, TrackSelect)
3. Implement Practice vs Score mode logic
4. Create results screens
5. Add settings persistence

**Phase 4: Polish & Deploy (Week 5-6)**
1. Visual polish (screen effects, animations)
2. Audio polish (mixing, transitions)
3. Performance optimization
4. Cross-browser testing
5. GitHub Pages deployment
6. Create itch.io page

---

## Next Steps & Implementation Plan

### Immediate Next Steps

1. **✅ Game Brief Complete** - Saved to `docs/Satisfying-Drifting-game-brief.md`
2. **✅ Design Document Complete** - Saved to `docs/Satisfying-Drifting-design-doc.md`
3. **🔲 Set Up Development Environment**
   - Initialize npm project with Vite + TypeScript
   - Configure Phaser 3
   - Set up project structure
   - Create initial Git commits

4. **🔲 Physics Prototype** (Week 1-2)
   - Implement Car entity with basic movement
   - Add drift physics system
   - Create minimal test track
   - **VALIDATION GATE:** Does it feel satisfying to drive?

5. **🔲 Feedback Systems** (Week 3)
   - Once physics feel good, add visual/audio feedback
   - Implement drift quality evaluation
   - **VALIDATION GATE:** Can you feel when you're drifting well?

6. **🔲 Content Creation** (Week 4)
   - Design 5 MVP tracks
   - Build menu system
   - Implement game modes

7. **🔲 Polish & Launch** (Week 5-6)
   - Performance optimization
   - Cross-browser testing
   - Deploy to GitHub Pages

### Success Metrics for Each Phase

**Physics Prototype Success:**
- Car feels responsive to input
- Drift initiation feels natural
- Maintaining drift requires skill but is achievable
- 60 FPS maintained during gameplay
- **Memory Management:** No leaks detected in Chrome DevTools heap snapshots
- **Scene Transitions:** Restart (R key) works cleanly without memory buildup
- **Developer gut check:** "This is fun to drive"

**Feedback Systems Success:**
- Can identify drift quality without looking at UI
- Audio feedback teaches proper technique
- Visual feedback is satisfying to watch
- **Memory Management:** Particle systems cleaned up properly with `preDestroy()`
- **Audio Management:** Web Audio context suspended properly, no context leaks
- **Playtester feedback:** "I can feel when I'm improving"

**Content & Menus Success:**
- Can navigate entire game flow with keyboard only
- Track progression teaches drift mastery
- Settings persist between sessions
- **Scene Management:** All scenes implement proper `shutdown()` cleanup
- **Event Listeners:** No memory leaks from unremoved listeners
- **Playtester feedback:** "I want to beat my best score"

**Polish & Launch Success:**
- 60 FPS on target browsers (Chrome, Firefox, Safari)
- <3s load time
- No critical bugs
- **Zero memory leaks:** Multiple play sessions show stable memory usage
- **Clean scene transitions:** No errors in console during scene switches
- Deployed and playable on GitHub Pages
- **Public feedback:** "This feels great to play"

### Risk Mitigation Strategy

**If physics don't feel satisfying after 2 weeks:**
- Research reference games more deeply
- Try alternative physics approaches (Box2D, Matter.js)
- Get feedback from experienced game developers
- Consider pivoting to simpler arcade physics

**If memory leaks are detected:**
- Use Chrome DevTools heap snapshots to identify leaking objects
- Verify all scenes implement `shutdown()` with proper cleanup
- Check that event listeners are removed with specific handler references
- Ensure Game Objects implement `preDestroy()` method
- Validate particle emitters use `preDestroy()` for cleanup
- Test scene transitions extensively (restart multiple times)

**If scope is too large:**
- Reduce to 3 tracks for MVP (Tutorial, Practice, Challenge)
- Skip Settings menu initially (hardcode volume)
- Launch minimal viable product, iterate based on feedback

**If performance issues arise:**
- Profile early and often
- Reduce particle counts
- Simplify visual effects
- Prioritize 60 FPS over visual polish

### Documentation Updates

**During Development:**
- Keep `DEVLOG.md` with daily progress notes
- Update physics parameters in design doc as you tune
- Document "what worked" and "what didn't" decisions

**Post-Launch:**
- Create `POSTMORTEM.md` with lessons learned
- Update README with play instructions
- Consider blog post about physics tuning process

---

## Appendices

### Change Log

| Date | Version | Description | Author |
| :--- | :------ | :---------- | :----- |
| 2025-10-27 | 1.0 | Initial prototype design document | Alex (Game Designer) |
| 2025-10-28 | 1.1 | Updated to Phaser 3.90+ best practices; added memory management patterns, scene lifecycle guidance, modern particle/audio configurations, and cleanup requirements | Alex (Game Designer) |

---

**Document Status:** Complete - Ready for Development Phase  
**Next Step:** Set up development environment and begin Physics Prototype (Phase 1)  
**Estimated Timeline:** 5-6 weeks part-time to MVP
