# Satisfying Drifting Game Architecture Document

**Version:** 1.1  
**Date:** October 28, 2025  
**Project:** Satisfying Drifting  
**Engine:** Phaser 3.90+ + TypeScript

---

## Introduction

This document outlines the complete technical architecture for **Satisfying Drifting**, a 2D game built with Phaser 3 and TypeScript. It serves as the technical foundation for AI-driven game development, ensuring consistency and scalability across all game systems.

This architecture is designed to support the gameplay mechanics defined in the Game Design Document while maintaining 60 FPS performance and cross-platform compatibility.

### Change Log

| Date | Version | Description | Author |
| :--- | :------ | :---------- | :----- |
| October 28, 2025 | 1.0 | Initial architecture document | Maya (Game Developer) |
| October 28, 2025 | 1.1 | Updated to Phaser 3.90+ best practices; added memory leak prevention patterns, `preDestroy()` lifecycle methods, scene `shutdown()` guidelines, and modern cleanup patterns | Maya (Game Developer) |

---

## Technical Overview

### Architecture Summary

**Satisfying Drifting** uses a modular, component-based architecture built on Phaser 3.90+ with TypeScript in strict mode. The architecture prioritizes:

- **Physics-First Design**: Custom drift physics layer on top of Phaser's Arcade Physics, with real-time quality evaluation systems
- **Performance-Critical Systems**: Object pooling for particles, optimized collision detection, and 60 FPS targeting on 2015+ desktop hardware
- **Minimal Scene Complexity**: 5 core scenes (Boot, Preload, Menu, Game, Results) with efficient state management
- **Modular Systems Architecture**: Independent managers for Input, Audio, Physics, State, and UI that communicate via Phaser's event system
- **Data-Driven Track Design**: JSON-based track configurations enabling rapid iteration without code changes

The architecture supports the GDD's focus on "feel" and responsiveness through tightly-coupled input-physics-feedback loops that execute within a single frame.

### Platform Targets

**Primary Platform:** Web (Desktop browsers - Chrome, Firefox, Safari)  
**Secondary Platforms:** None for MVP (architecture designed for future mobile adaptation)  
**Minimum Requirements:** 2015+ desktop hardware, 1280x720 resolution  
**Target Performance:** 60 FPS sustained on mid-range desktop (Intel i5-4590 or equivalent)

### Technology Stack

**Core Engine:** Phaser 3.90+ (latest stable)  
**Language:** TypeScript 5.0+ (Strict Mode)  
**Build Tool:** Vite (fast HMR, optimized production builds)  
**Package Manager:** npm  
**Testing:** Jest + @testing-library (unit tests for game logic)  
**Deployment:** GitHub Pages (static hosting)

---

## Project Structure

### Repository Organization

```
Satisfying-Drifting/
├── src/
│   ├── scenes/              # Game scenes (Boot, Preload, Menu, Game, Results)
│   ├── gameObjects/         # Custom game objects (Car, TrackBoundary)
│   ├── systems/             # Core game systems (managers)
│   │   ├── DriftPhysics.ts
│   │   ├── DriftQuality.ts
│   │   ├── InputManager.ts
│   │   ├── AudioManager.ts
│   │   └── GameState.ts
│   ├── utils/               # Utility functions (math helpers, pooling)
│   ├── types/               # TypeScript interfaces and types
│   ├── config/              # Game configuration and constants
│   │   ├── GameConfig.ts    # Phaser configuration
│   │   ├── PhysicsConfig.ts # Drift physics parameters
│   │   └── TrackData.ts     # Track definitions
│   └── main.ts              # Entry point
├── assets/
│   ├── images/              # Sprites (car, track textures, UI)
│   ├── audio/               # Sound effects and music
│   │   ├── sfx/             # Tire screech, engine, UI sounds
│   │   └── music/           # Background music
│   └── data/                # JSON track data (if not hardcoded)
├── public/                  # Static web assets (index.html, favicon)
├── tests/                   # Test files mirroring src/ structure
│   ├── systems/             # System unit tests
│   └── utils/               # Utility function tests
├── docs/                    # Documentation
│   ├── stories/             # Development stories
│   └── architecture/        # Technical docs (this file)
└── dist/                    # Built game files (gitignored)
```

### Module Organization

**Scene Structure:**
- Each scene in separate file under `src/scenes/`
- Scenes follow Phaser lifecycle: `init()` → `preload()` → `create()` → `update()`
- Scene data passed via `this.scene.start('NextScene', { data })` for transitions
- Scenes are lightweight orchestrators; logic lives in systems
- **Proper cleanup** in `shutdown()` method: remove event listeners, destroy tweens, clear timers (see Scene Management Best Practices below)

**Game Object Pattern:**
- **Component-Based Design**: `Car` extends `Phaser.GameObjects.Sprite` with drift physics component
- Reusable classes in `src/gameObjects/` (e.g., `Car.ts`, `DriftTrail.ts`, `QualityMeter.ts`)
- Type-safe properties using TypeScript interfaces from `src/types/`
- Objects register with relevant systems (e.g., Car registers with DriftPhysics)
- **Lifecycle Methods**: Implement `preDestroy()` for cleanup, optional `addedToScene()` / `removedFromScene()` callbacks (Phaser 3.50+)
- **Memory Management**: Always call `removeAllListeners()` in cleanup to prevent memory leaks

**System Architecture:**
- **Singleton Managers**: Systems instantiated once in BootScene, passed via registry
- **Event-Driven Communication**: Systems emit/listen via Phaser's event emitter (`this.events`)
- **Clear Separation**: Physics, Input, Audio, Quality, State each handle distinct responsibilities
- **No Circular Dependencies**: Systems reference interfaces, not concrete implementations

---

## Core Game Systems

### Scene Management System

**Purpose:** Handle game flow, scene transitions, and lifecycle management

**Key Components:**
- Scene loading with smooth transitions (fade in/out)
- Data passing between scenes for track selection and results
- Proper cleanup to prevent memory leaks
- Restart mechanism (instant scene reload on R key)

**Implementation Requirements:**
- **BootScene**: Initialize systems, load critical assets (< 100KB)
- **PreloadScene**: Load all game assets with progress bar
- **MenuScene**: Track selection and mode choice (Practice/Score)
- **GameScene**: Core gameplay loop with physics updates
- **ResultsScene**: Post-game stats and retry options (Score mode only)
- **Scene Cleanup**: Each scene must implement `shutdown()` method for proper resource cleanup (see best practices section below)

**Files to Create:**
- `src/scenes/BootScene.ts`
- `src/scenes/PreloadScene.ts`
- `src/scenes/MenuScene.ts`
- `src/scenes/GameScene.ts`
- `src/scenes/ResultsScene.ts`
- `src/systems/SceneManager.ts` (optional helper for complex transitions)

---

### Scene Management Best Practices (Phaser 3.90+)

**Proper Scene Cleanup Pattern:**

All scenes must implement the `shutdown()` method to prevent memory leaks. This method is called automatically when a scene stops.

```typescript
class GameScene extends Phaser.Scene {
    private updateListener?: () => void;
    private pointerListener?: () => void;
    
    create(): void {
        // Set up listeners
        this.updateListener = () => this.handleUpdate();
        this.pointerListener = () => this.handlePointer();
        
        this.events.on('update', this.updateListener);
        this.input.on('pointerdown', this.pointerListener);
        
        // Systems register themselves with scene events
    }
    
    shutdown(): void {
        // CRITICAL: Clean up all event listeners to prevent memory leaks
        
        // Remove scene-specific event listeners
        if (this.updateListener) {
            this.events.off('update', this.updateListener);
            this.updateListener = undefined;
        }
        
        if (this.pointerListener) {
            this.input.off('pointerdown', this.pointerListener);
            this.pointerListener = undefined;
        }
        
        // Clean up custom managers/systems
        // Note: Don't destroy Game Objects manually - Phaser handles this automatically
        // Only clean up listeners and references
        
        // If you have custom managers with event listeners:
        // this.driftQuality?.removeAllListeners();
        // this.audioManager?.removeAllListeners();
    }
}
```

**Important Notes:**
- **DO NOT** manually destroy Game Objects in `shutdown()` - Phaser handles this automatically
- **DO** remove all custom event listeners you've added
- **DO** clean up references to prevent memory leaks
- **DO** call `removeAllListeners()` on any custom event emitters

---

### Game State Management

**Purpose:** Track player progress, settings, and session data

**State Categories:**
- **Settings**: Audio volumes (music, SFX), control preferences - persisted to localStorage
- **Session Data**: Current track, mode (Practice/Score), active run stats - volatile
- **Progress Data**: Best times per track, high scores - persisted to localStorage
- **Debug State**: Physics visualization toggles, performance metrics - dev only

**Implementation Requirements:**
- Save/load system with localStorage (JSON serialization)
- State validation and migration for version updates
- Default state initialization on first launch
- Settings accessible from pause menu (ESC key)

**Files to Create:**
- `src/systems/GameState.ts`
- `src/systems/SaveManager.ts`
- `src/types/GameData.ts`

---

### Asset Management System

**Purpose:** Efficient loading and management of game assets

**Asset Categories:**
- **Sprite Sheets**: Car sprite (4 rotations), particle textures
- **Audio Files**: Tire screech loop, engine sound, UI clicks, background music
- **Track Images**: 5 track layouts (PNGs, ~500KB each)
- **UI Assets**: Buttons, quality meter, fonts

**Implementation Requirements:**
- Progressive loading in PreloadScene with visual progress bar
- Asset key constants in config file (avoid string literals)
- Error handling for failed loads (fallback to colored rectangles)
- Texture atlas for UI elements (single file, multiple frames)

**Files to Create:**
- `src/systems/AssetManager.ts`
- `src/config/AssetConfig.ts` (asset keys and paths)
- `src/utils/AssetLoader.ts`

---

### Input Management System

**Purpose:** Handle all player input with responsive, frame-perfect detection

**Input Types:**
- **Keyboard Controls**: WASD/Arrows for driving, Space for handbrake, R for restart, ESC for pause
- **Menu Navigation**: Arrow keys + Enter for menu selection, number keys for quick select
- **Future**: Touch controls (virtual joystick + buttons) for mobile port

**Implementation Requirements:**
- Input polling every frame in GameScene.update()
- Key state tracking (pressed this frame, held, released)
- Input buffering for R key restart (prevent accidental double-restart)
- Configurable key mapping stored in GameState

**Files to Create:**
- `src/systems/InputManager.ts`
- `src/types/InputTypes.ts`

---

### Drift Physics System

**Purpose:** Core drift mechanics with responsive, tunable physics

**Core Functionality:**
- Calculate lateral velocity from car direction vs movement vector
- Detect drift state when lateral velocity exceeds threshold (100 px/s)
- Apply friction coefficients based on state (grip: 0.95, drift: 0.7, handbrake: 0.5)
- Smooth transitions between grip and drift states (0.2s lerp)
- Expose drift angle, speed, and state to other systems

**Dependencies:** Phaser.Physics.Arcade, InputManager

**Performance Considerations:**
- Physics updates run at 60 FPS (no substepping needed for arcade game)
- Vector math optimized using Phaser.Math utilities
- Avoid object allocation in update loop (reuse Phaser.Math.Vector2 instances)

**Files to Create:**
- `src/systems/DriftPhysics.ts`
- `src/gameObjects/Car.ts` (uses DriftPhysics component)
- `src/types/PhysicsTypes.ts`
- `src/config/PhysicsConfig.ts` (tuning parameters)

---

### Drift Quality Evaluation System

**Purpose:** Real-time evaluation and feedback on drift performance

**Core Functionality:**
- Calculate quality score (0-100) from drift angle, speed, proximity, smoothness
- Track drift sessions (start time, end time, average quality)
- Emit events for quality thresholds ('poorDrift', 'goodDrift', 'perfectDrift')
- Maintain rolling average over last 60 frames (1 second)
- Combo counter for consecutive good drifts

**Dependencies:** DriftPhysics (provides drift data), TrackBoundary (for proximity)

**Performance Considerations:**
- Quality calculation every frame, minimal allocations
- Circular buffer for rolling average (fixed-size array)
- Event emission throttled (only on state changes, not every frame)

**Files to Create:**
- `src/systems/DriftQuality.ts`
- `src/types/QualityTypes.ts`

---

### Physics & Collision System

**Physics Engine:** Phaser.Physics.Arcade (lightweight, sufficient for top-down)

**Collision Categories:**
- **Car vs Track Boundary**: Triggers off-road state (failure in Score mode)
- **Car vs Checkpoints**: Invisible triggers for lap counting (future feature)

**Implementation Requirements:**
- Track boundaries as Phaser.Physics.Arcade.StaticGroup (polygon colliders from track data)
- Collision callbacks with separation disable (car doesn't bounce, just triggers event)
- Physics debug mode (visualize colliders) toggled by key in dev builds

**Files to Create:**
- `src/systems/PhysicsManager.ts`
- `src/gameObjects/TrackBoundary.ts`
- `src/utils/CollisionGroups.ts`

---

### Audio System

**Purpose:** Dynamic audio with drift-responsive sound design

**Audio Requirements:**
- **Background Music**: Looping track, volume controlled by settings
- **Tire Screech**: Looped SFX with dynamic volume (0-100% based on drift angle) and pitch (based on speed)
- **Engine Sound**: Looped SFX with RPM variation during throttle
- **UI Sounds**: Click, select, whoosh for menus
- **Perfect Drift "Pop"**: One-shot sound when entering perfect drift state

**Implementation Features:**
- Web Audio API for dynamic pitch/volume control
- Audio sprite for UI sounds (single file, multiple markers)
- Volume settings (master, music, SFX) stored in GameState
- Mobile audio unlock on first user interaction

**Files to Create:**
- `src/systems/AudioManager.ts`
- `src/config/AudioConfig.ts` (sound keys, volumes, pitch ranges)

---

### UI System

**Purpose:** Minimal, non-distracting HUD and menu interfaces

**UI Components:**
- **HUD**: Speed display, drift quality meter, track name, restart prompt
- **Menus**: Main menu, track select, settings, controls screen
- **Results Screen**: Final score, stats breakdown, retry/menu options (Score mode)
- **Pause Overlay**: Semi-transparent overlay with continue/settings/quit options

**Implementation Requirements:**
- DOM-based UI (HTML/CSS) overlaid on Phaser canvas for crisp text
- Phaser scene UI for in-game HUD (bitmap fonts or Phaser.GameObjects.Text)
- Keyboard navigation with visual focus indicators
- Responsive layout (scales with canvas size)

**Files to Create:**
- `src/systems/UIManager.ts`
- `src/gameObjects/UI/QualityMeter.ts`
- `src/gameObjects/UI/HUD.ts`
- `src/types/UITypes.ts`

---

## Performance Architecture

### Performance Targets

**Frame Rate:** 60 FPS sustained, 30 FPS minimum acceptable  
**Memory Usage:** <200MB total (heap + textures)  
**Load Times:** <3s initial load, <1s per track switch  
**Battery Optimization:** Pause game loop when tab not visible (Page Visibility API)

### Optimization Strategies

**Object Pooling:**
- **Particle Systems**: Tire smoke particles (pool of 200 sprites, reuse on emit)
  - **Modern Pattern (Phaser 3.60+)**: Use `ParticleEmitter.preDestroy()` for proper cleanup
  - Ensures all particles, internal arrays, and framebuffers are properly cleaned up
- **Drift Trail Sprites**: Skid mark segments (pool of 100, fade out and reuse)
- **UI Text Objects**: Score popups (pool of 10, prevent allocation during gameplay)

**Particle Emitter Best Practice (Phaser 3.60+):**

```typescript
export class ParticlePool {
    private emitters: Phaser.GameObjects.Particles.ParticleEmitter[];
    private scene: Phaser.Scene;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.emitters = [];
    }
    
    createEmitter(config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig): Phaser.GameObjects.Particles.ParticleEmitter {
        const emitter = this.scene.add.particles(0, 0, 'particle', config);
        this.emitters.push(emitter);
        return emitter;
    }
    
    // Phaser 3.60+ cleanup method
    destroy(): void {
        // Modern cleanup for particle emitters
        this.emitters.forEach(emitter => {
            if (emitter) {
                // preDestroy cleans up all resources, particles, internal arrays
                emitter.preDestroy();
            }
        });
        this.emitters = [];
        this.scene = null as any;
    }
}
```

**Asset Optimization:**
- **Texture Atlases**: Single atlas for UI elements (buttons, icons, quality meter)
- **Audio Compression**: OGG format for music (~100KB), MP3 for SFX (~10KB each)
- **Lazy Loading**: Track images loaded on demand (not all in Preload)
- **Progressive Enhancement**: Higher quality particles on desktop, reduced on lower-end devices

**Rendering Optimization:**
- **Sprite Batching**: Phaser automatically batches, ensure same texture for similar objects
- **Culling**: Off-screen particles destroyed immediately (not just invisible)
- **Reduced Particle Counts**: 50 particles max on screen (configurable, reduces to 25 on low FPS)
- **Static Layers**: Track background and boundaries as single static group (no per-sprite updates)

**Files to Create:**
- `src/utils/ObjectPool.ts`
- `src/utils/PerformanceMonitor.ts` (FPS counter, memory tracking)
- `src/config/OptimizationConfig.ts` (thresholds and limits)

---

## Game Configuration

### Phaser Configuration

```typescript
// src/config/GameConfig.ts
import Phaser from 'phaser';

export const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#1a1a1a',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 800,
            height: 600
        },
        max: {
            width: 1920,
            height: 1080
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },  // Top-down game, no gravity
            debug: false,        // Toggle in dev builds
            fps: 60
        }
    },
    render: {
        pixelArt: false,         // Smooth rendering for particles
        antialias: true,
        antialiasGL: true,
        roundPixels: false       // Smoother motion
    },
    fps: {
        target: 60,
        forceSetTimeOut: false   // Use requestAnimationFrame
    },
    // Phaser 3.60+ - Better depth sorting (auto-detect for best performance)
    stableSort: -1,
    
    // Phaser 3.70+ - Disable FX pipelines if not using them (performance optimization)
    // Set to true if you're NOT using Pre/Post FX effects
    disablePreFX: false,  // We're not using Pre FX effects
    disablePostFX: false, // We're not using Post FX effects
    
    scene: [] // Scenes registered in main.ts
};
```

### Physics Configuration

```typescript
// src/config/PhysicsConfig.ts

export const PhysicsConfig = {
    car: {
        // Movement
        maxSpeed: 400,              // pixels/second
        acceleration: 300,          // pixels/second²
        brakeForce: 400,            // pixels/second²
        reverseSpeed: 150,          // pixels/second
        
        // Steering
        turnRateHigh: 180,          // degrees/second at max speed
        turnRateLow: 360,           // degrees/second at low speed
        speedThresholdTight: 100,   // speed below which tight turns enabled
        
        // Drift Physics
        driftThreshold: 100,        // lateral velocity (px/s) to enter drift
        gripFriction: 0.95,         // friction coefficient in normal driving
        driftFriction: 0.7,         // friction coefficient during drift
        handBrakeFriction: 0.5,     // friction coefficient during handbrake
        transitionTime: 0.2,        // seconds to lerp between grip/drift states
        
        // Speed Loss During Drift
        driftSpeedRetention: 0.95,      // 5% speed loss per second in drift
        handbrakeSpeedRetention: 0.98,  // 2% speed loss per second in handbrake
        
        // Physical Properties
        mass: 100,                  // for collision calculations
        drag: 0.99,                 // air resistance multiplier per frame
        angularDrag: 0.95           // rotation dampening
    },
    
    quality: {
        // Drift Angle Scoring (40% weight)
        perfectAngleMin: 15,        // degrees
        perfectAngleMax: 45,        // degrees
        extremeAngle: 60,           // degrees - beyond this, no points
        
        // Speed Scoring (30% weight)
        highSpeedThreshold: 300,    // px/s - maximum multiplier
        mediumSpeedThreshold: 200,  // px/s - good multiplier
        lowSpeedThreshold: 100,     // px/s - reduced multiplier
        
        // Proximity Scoring (20% weight)
        veryCloseDistance: 50,      // pixels from edge - 2x bonus
        closeDistance: 100,         // pixels from edge - 1.5x bonus
        safeDistance: 200,          // pixels from edge - 1x normal
        
        // Smoothness (10% weight)
        smoothnessWindowFrames: 60, // frames to average steering input variance
        
        // Combo System
        comboDecayTime: 1.0,        // seconds before combo starts decaying
        minimumQualityForCombo: 31, // "Good" tier minimum
        
        // Quality Tiers
        poorMax: 30,
        goodMax: 70,
        perfectMin: 71
    }
};
```

### Track Data Configuration

```typescript
// src/config/TrackData.ts

export interface TrackConfig {
    id: string;
    name: string;
    description: string;
    imageKey: string;
    width: number;                    // Track width in pixels
    collisionBoundary: Vector2[];     // Polygon points for physics
    spawnPoint: {
        x: number;
        y: number;
        angle: number;                // Degrees
    };
    checkpoints?: Vector2[];          // For lap detection (future)
    optimalTime: number;              // Target completion time (seconds)
    minimumQuality: number;           // Required avg quality (Score mode)
    unlockRequirement?: string;       // Track ID that must be completed first
}

interface Vector2 {
    x: number;
    y: number;
}

export const Tracks: TrackConfig[] = [
    {
        id: 'tutorial',
        name: 'Tutorial Circuit',
        description: 'Learn the basics of drift control',
        imageKey: 'track_tutorial',
        width: 150,
        collisionBoundary: [
            // Polygon points defining track edges
            // Generated from track image or level editor
        ],
        spawnPoint: { x: 640, y: 360, angle: 0 },
        optimalTime: 30,
        minimumQuality: 0  // No quality requirement for tutorial
    },
    {
        id: 'serpentine',
        name: 'Serpentine Run',
        description: 'Master drift transitions',
        imageKey: 'track_serpentine',
        width: 120,
        collisionBoundary: [],  // Defined per track
        spawnPoint: { x: 640, y: 360, angle: 0 },
        optimalTime: 35,
        minimumQuality: 40,
        unlockRequirement: 'tutorial'
    },
    // Additional tracks...
];
```

---

## Development Guidelines

### TypeScript Standards

**Type Safety:**
- Use **strict mode** enabled in `tsconfig.json`
- Define interfaces for all data structures (`ICarState`, `ITrackConfig`, `IDriftData`)
- **Avoid `any` type** - use `unknown` with type guards if necessary
- Use enums for game states: `enum GameMode { Practice, Score }`, `enum DriftState { Grip, Drift, Handbrake }`
- Leverage union types for actions: `type InputAction = 'accelerate' | 'brake' | 'steer' | 'handbrake'`

**Code Organization:**
- **One class per file**, named identically to class (`DriftPhysics.ts` exports `DriftPhysics`)
- Use **clear naming conventions**:
  - Classes: PascalCase (`AudioManager`)
  - Methods/functions: camelCase (`calculateDriftAngle`)
  - Constants: UPPER_SNAKE_CASE (`MAX_DRIFT_ANGLE`)
  - Interfaces: IPascalCase (`IPhysicsConfig`)
- **Proper error handling**: Use try-catch for localStorage, asset loading, audio playback
- **JSDoc comments** for public APIs, inline comments for complex physics calculations

**Example:**
```typescript
/**
 * Calculates drift quality score based on angle, speed, proximity, and smoothness.
 * @param driftAngle - Angle between car direction and velocity (degrees)
 * @param speed - Current car speed (pixels/second)
 * @param edgeDistance - Distance to nearest track edge (pixels)
 * @param steeringVariance - Variance in steering input over last second
 * @returns Quality score from 0-100
 */
public calculateQuality(
    driftAngle: number, 
    speed: number, 
    edgeDistance: number, 
    steeringVariance: number
): number {
    // Implementation...
}
```

---

### Phaser 3 Best Practices

**Scene Management:**
- **Clean up resources** in `shutdown()` method: remove event listeners, destroy tweens, clear timers
- **Use scene data** for communication: `this.scene.start('GameScene', { trackId: 'tutorial', mode: GameMode.Practice })`
- **Implement proper event handling**: Always use `this.events.once()` for one-time listeners to prevent memory leaks
- **Avoid memory leaks**: Destroy game objects explicitly when no longer needed
- **Never manually destroy Game Objects in shutdown()**: Phaser handles this automatically - only clean up custom event listeners and managers

**Game Object Design:**
- **Extend Phaser classes appropriately**: 
  - `Car extends Phaser.GameObjects.Sprite` with physics body
  - `QualityMeter extends Phaser.GameObjects.Container` for grouped UI elements
- **Use component-based architecture**: Composition over inheritance where possible
  - Car has `DriftPhysics` component rather than inheriting physics logic
- **Implement object pooling** where needed: Particles, projectiles, UI feedback elements
- **Follow consistent update patterns**: 
  - `preUpdate()` for Phaser objects that need automatic updates
  - Manual `update()` calls from scene for manager systems

**Game Object Lifecycle (Phaser 3.50+):**

Modern Phaser provides automatic scene lifecycle callbacks:

```typescript
export class Car extends Phaser.GameObjects.Sprite {
    private driftPhysics?: DriftPhysics;
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'car');
        this.driftPhysics = new DriftPhysics(this);
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }
    
    // Called automatically when added to a Scene
    addedToScene(): void {
        console.log('Car added to scene');
        // Initialize scene-specific resources if needed
    }
    
    // Called automatically when removed from a Scene
    removedFromScene(): void {
        console.log('Car removed from scene');
        // Clean up scene-specific resources if needed
    }
    
    public update(time: number, delta: number): void {
        if (this.driftPhysics) {
            this.driftPhysics.update(delta);
        }
    }
    
    // Phaser 3.50+: Use preDestroy for cleanup
    preDestroy(): void {
        // Clean up before parent destroy is called
        if (this.driftPhysics) {
            this.driftPhysics.destroy();
            this.driftPhysics = undefined;
        }
        
        // CRITICAL: Remove all event listeners to prevent memory leaks
        this.removeAllListeners();
    }
    
    // Modern destroy accepts optional fromScene parameter (managed by Phaser)
    public destroy(fromScene?: boolean): void {
        super.destroy(fromScene);
    }
}
```

**Memory Leak Prevention Checklist:**

Critical cleanup items for all custom Game Objects and Systems:

- [ ] All custom Game Objects implement `preDestroy()` for cleanup
- [ ] Event listeners removed with `removeAllListeners()` or specific `off()` calls
- [ ] Scene `shutdown()` method cleans up custom managers (but NOT Game Objects)
- [ ] Physics bodies are properly destroyed (automatic with Game Object destruction)
- [ ] Particle emitters use `preDestroy()` method (Phaser 3.60+)
- [ ] Texture Manager textures removed when no longer needed
- [ ] Audio Manager listeners cleaned up (Game BLUR, FOCUS, PRE_STEP events)
- [ ] Scale Manager RESIZE listeners removed in destroy methods
- [ ] Tween callbacks and animations properly cleared

**Example Custom Manager with Proper Cleanup:**

```typescript
export class DriftQuality extends Phaser.Events.EventEmitter {
    private scene: Phaser.Scene;
    private scaleResizeHandler?: () => void;
    
    constructor(scene: Phaser.Scene) {
        super();
        this.scene = scene;
        
        // Store handler reference for proper cleanup
        this.scaleResizeHandler = () => this.handleResize();
        this.scene.scale.on('resize', this.scaleResizeHandler);
    }
    
    private handleResize(): void {
        // Handle resize logic
    }
    
    destroy(): void {
        // CRITICAL: Remove specific listener reference
        if (this.scaleResizeHandler) {
            this.scene.scale.off('resize', this.scaleResizeHandler);
            this.scaleResizeHandler = undefined;
        }
        
        // Remove all custom event listeners
        this.removeAllListeners();
        
        // Null out references
        this.scene = null as any;
    }
}
```

**Display and Update List Management (Performance):**

For objects that don't need updates or rendering every frame:

```typescript
// For static decorations that never change
const staticDecoration = this.add.image(100, 100, 'decoration');
staticDecoration.removeFromUpdateList(); // Saves CPU cycles

// For data processors that don't need rendering
const dataProcessor = this.make.sprite({ key: 'invisible' }, false);
dataProcessor.removeFromDisplayList(); // Still updates, but not rendered
dataProcessor.addToUpdateList(); // Ensure it's in update list if needed
```

---

### Testing Strategy

**Unit Testing:**
- **Test game logic separately from Phaser**: Extract pure functions for drift calculations, quality scoring
- **Mock Phaser dependencies**: Use Jest mocks for `Phaser.Math.Vector2`, scene references
- **Test utility functions**: Math helpers, vector operations, collision detection algorithms
- **Validate game balance calculations**: Ensure quality scoring matches design specifications

**Integration Testing:**
- **Scene loading and transitions**: Verify data passes correctly between scenes
- **Save/load functionality**: Test localStorage operations with mocked storage
- **Input handling**: Verify keyboard events trigger correct game responses
- **Performance benchmarks**: Track FPS in CI builds, fail if below 50 FPS average

**Test Files to Create:**
- `tests/systems/DriftPhysics.test.ts` - Physics calculations
- `tests/systems/DriftQuality.test.ts` - Quality scoring algorithms
- `tests/systems/SaveManager.test.ts` - Data persistence
- `tests/utils/MathHelpers.test.ts` - Vector math utilities
- `tests/performance/FrameRate.test.ts` - Performance regression tests

**Testing Philosophy:**
- **Test business logic, not Phaser rendering**: Focus on drift calculations, not sprite positions
- **Mock heavy dependencies**: Don't load actual Phaser scenes in unit tests
- **Aim for 80%+ coverage** on systems and utils (not targeting 100% on Phaser wrappers)

---

## Deployment Architecture

### Build Process

**Development Build:**
- Fast compilation with Vite (< 1s hot reload)
- Source maps enabled for debugging physics calculations
- Debug logging active (`console.log` for drift state changes)
- Hot reload support for config changes (PhysicsConfig, TrackData)
- Physics debug rendering enabled (collision boundaries visible)

**Production Build:**
- Minified and tree-shaken bundle (~300KB gzipped with Phaser)
- Asset compression: PNGs optimized with `vite-plugin-imagemin`
- Code splitting: Lazy load track images on demand
- Performance monitoring: Inject FPS counter (togglable with F1 key)
- Error tracking: Console errors logged to browser localStorage for bug reports
- **Vite base path**: Configured in `vite.config.ts` for GitHub Pages

**Vite Configuration:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Satisfying-Drifting/',  // GitHub Pages subdirectory
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']  // Separate Phaser into its own chunk
        }
      }
    }
  },
  server: {
    port: 3000
  }
});
```

**Build Commands:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write 'src/**/*.{ts,tsx}'"
  }
}
```

---

### Deployment Strategy

**Web Deployment (GitHub Pages via Actions):**
- **Automated build & deploy**: GitHub Actions handles entire workflow on push to main
- **No manual dist management**: Build happens in CI, never committed to repo
- **CDN for assets**: GitHub CDN handles asset delivery globally
- **Progressive loading**: Initial bundle < 500KB, tracks loaded on selection
- **Browser compatibility**: Target Chrome 90+, Firefox 88+, Safari 14+
- **HTTPS enforced**: Required for Web Audio API and gamepad support

**Deployment Workflow:**
```yaml
# .github/workflows/deploy.yml
name: Build and Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build game
        run: npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
  
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**GitHub Pages Configuration:**
- **Repository Settings**: Enable GitHub Pages, set source to "GitHub Actions"
- **Custom Domain**: Optional, can add CNAME file to public/ folder
- **No gh-pages branch needed**: Actions deploys directly via artifact upload

**Mobile Packaging (Future):**
- **Cordova/Capacitor wrapper**: Package web game for iOS/Android app stores
- **Platform-specific optimization**: Reduce particle count on mobile (25 vs 50)
- **Touch controls**: Virtual joystick + button overlays
- **App store requirements**: Privacy policy, age rating (PEGI 3 / ESRB E)

---

## Implementation Roadmap

The implementation is broken down into three phases aligned with the GDD development strategy, progressing from foundation to polish.

### Phase 1: Foundation (Weeks 1-2)

**Core Systems:**
- Project setup: Vite + TypeScript + Phaser 3 scaffolding
- Basic scene management (Boot, Preload, Menu, Game)
- Asset loading pipeline with progress bar
- Input handling framework (keyboard polling)
- Game configuration structure (PhysicsConfig, GameConfig)

**Story Epics:**
- **Epic 1.1: Project Setup & Configuration**
  - Initialize Vite project with TypeScript
  - Install and configure Phaser 3.90+ (latest stable)
  - Set up ESLint, Prettier, Jest
  - Create GitHub Actions workflow for CI/CD
  - Configure GitHub Pages deployment

- **Epic 1.2: Scene Management Foundation**
  - Implement BootScene (system initialization)
  - Implement PreloadScene (asset loading with progress)
  - Implement MenuScene (basic navigation)
  - Implement GameScene (empty game loop)
  - Scene transition system with data passing

- **Epic 1.3: Asset Loading System**
  - Create AssetManager for centralized loading
  - Define AssetConfig with all asset keys
  - Implement progressive loading strategy
  - Add error handling for missing assets
  - Create placeholder assets for development

**Deliverables:**
- Playable skeleton: Menu → Track selection → Empty game scene → Restart
- All scenes transition cleanly without memory leaks
- Asset loading works with progress indicator
- GitHub Actions successfully deploys to Pages

**Success Criteria:**
- Can navigate between all scenes
- R key restarts GameScene instantly
- 60 FPS in empty game scene
- Build deploys successfully to GitHub Pages

---

### Phase 2: Core Gameplay (Weeks 3-5)

**Gameplay Systems:**
- Car physics with drift mechanics (custom layer on Arcade Physics)
- Track rendering and collision detection
- Drift quality evaluation system
- Visual feedback (particles, trails, effects)
- Audio system with dynamic sound

**Story Epics:**
- **Epic 2.1: Car Physics & Movement**
  - Implement Car game object with sprite and physics body
  - Create DriftPhysics system with acceleration/braking
  - Implement steering with velocity-dependent turn rate
  - Add drift state detection (lateral velocity threshold)
  - Implement friction transitions (grip/drift/handbrake)

- **Epic 2.2: Track System**
  - Create TrackData configuration structure
  - Implement Tutorial track (visual + collision)
  - Create TrackBoundary collision system
  - Add spawn point and reset functionality
  - Implement off-road detection

- **Epic 2.3: Drift Quality System**
  - Implement quality calculation algorithm (angle/speed/proximity/smoothness)
  - Create rolling average system (60 frame window)
  - Add quality tier detection (Poor/Good/Perfect)
  - Implement event emission for quality changes
  - Create debug visualization for quality factors

- **Epic 2.4: Visual Feedback**
  - Implement tire smoke particle system with pooling
  - Create drift trail/skid mark system
  - Add speed lines effect for perfect drifts
  - Implement screen effects (subtle blur, shake)
  - Create QualityMeter UI component

- **Epic 2.5: Audio System**
  - Implement AudioManager singleton
  - Add tire screech with dynamic volume/pitch
  - Add engine sound with RPM variation
  - Implement perfect drift "pop" sound
  - Add background music with volume control

**Deliverables:**
- Fully playable Tutorial track in Practice mode
- Car responds to all inputs with satisfying physics
- Visual and audio feedback clearly communicate drift quality
- Quality evaluation matches GDD specifications

**Success Criteria:**
- Car drifts feel responsive and predictable
- Players can complete Tutorial track
- Drift quality meter accurately reflects performance
- Audio dynamically responds to drift state
- Maintains 60 FPS with particles active

---

### Phase 3: Content & Polish (Weeks 6-8)

**Content Systems:**
- Remaining 4 tracks (Serpentine, Hairpin, Gauntlet, Sandbox)
- Score mode implementation
- Results screen with stats
- Settings menu (audio controls)
- Performance optimization and testing

**Story Epics:**
- **Epic 3.1: Additional Tracks**
  - Create Serpentine Run track (drift transitions)
  - Create Hairpin Challenge track (tight control)
  - Create The Gauntlet track (speed & risk)
  - Create Sandbox Arena (free practice)
  - Implement track selection UI

- **Epic 3.2: Score Mode**
  - Implement GameState system with mode tracking
  - Add score calculation and combo system
  - Create failure states (off-road, too slow)
  - Implement minimum quality threshold checks
  - Add best time/score persistence (localStorage)

- **Epic 3.3: Results & Progression**
  - Create ResultsScene with stats display
  - Show drift quality breakdown
  - Display best time comparison
  - Add retry/menu navigation
  - Implement track unlock system

- **Epic 3.4: Settings & Polish**
  - Create SettingsScene with volume controls
  - Implement SaveManager for persistent data
  - Add keyboard remapping (optional)
  - Create controls reference screen
  - Add pause menu (ESC key)

- **Epic 3.5: Performance Optimization**
  - Implement ObjectPool for particles
  - Add PerformanceMonitor with FPS tracking
  - Optimize collision detection
  - Add dynamic quality reduction on low FPS
  - Profile and optimize hot paths

**Deliverables:**
- Complete game with 5 tracks and 2 modes
- Persistent settings and progression
- Polished UI/UX with smooth transitions
- Optimized performance on target hardware

**Success Criteria:**
- All 5 tracks playable in both modes
- Score mode correctly enforces failure states
- Settings persist across sessions
- Maintains 60 FPS on target hardware
- Zero critical bugs in core systems

---

### Post-Launch (Optional)

**Future Enhancements:**
- Leaderboards (integrate with backend service)
- Ghost racing (replay best runs)
- Track editor/community tracks
- Mobile touch controls
- Additional visual themes

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
| :--- | :---------- | :----- | :------------------ |
| **Drift physics don't "feel" right** | High | Critical | Iterate early in Phase 2; expose all physics params in config for rapid tuning; playtest weekly; budget extra time for physics refinement |
| **Performance issues on target hardware** | Medium | High | Implement PerformanceMonitor early; profile in Phase 2; object pooling for particles; dynamic quality reduction; test on 2015 hardware |
| **Memory leaks from improper cleanup** | Medium | Medium | Follow Phaser 3.90+ cleanup patterns; implement `preDestroy()` on all custom objects; use `removeAllListeners()`; test with Chrome DevTools memory profiler; ensure `shutdown()` methods don't manually destroy Game Objects |
| **Audio playback issues across browsers** | Medium | Medium | Use well-supported formats (OGG + MP3 fallbacks); implement Web Audio API unlock on first interaction; test Safari/Firefox/Chrome early; properly clean up audio event listeners |
| **Track collision detection inaccurate** | Low | Medium | Use simple polygon colliders (not pixel-perfect); validate collision boundaries visually with debug mode; test edge cases |
| **Vite build issues with Phaser** | Low | Medium | Follow official Phaser 3 + Vite template; manual chunk Phaser library; test production build in Phase 1 |
| **Scope creep (too many features)** | Medium | High | Strict adherence to 3-phase roadmap; defer leaderboards/mobile to post-launch; focus on 5 tracks + 2 modes only |
| **GitHub Pages deployment fails** | Low | High | Test deployment workflow in Phase 1; verify base path configuration early; use GitHub Actions artifact method |
| **localStorage data corruption** | Low | Low | Implement save data versioning; validate on load with try-catch; graceful fallback to defaults |
| **TypeScript strict mode adoption difficulty** | Low | Low | Use strict mode from Day 1; define interfaces upfront; avoid `any` with linting rules |

---

### Critical Risk: Drift Physics Feel

This is the highest probability/impact risk because the entire game depends on satisfying drift mechanics. If physics don't feel good after Phase 2, the project fails.

**Additional Mitigation:**
- Create physics playground scene (separate from main game) for isolated tuning
- Capture video of desired drift behavior from reference games (Absolute Drift, art of rally)
- Define "feel" success criteria: "Can complete Tutorial track within 5 attempts feeling in control"
- Budget 1 full week in Phase 2 for pure physics iteration

---

## Common Pitfalls and Solutions

This section highlights common mistakes when working with Phaser 3.90+ and how to avoid them, based on the latest best practices.

### Memory Leak Pitfalls

**❌ Pitfall 1: Not removing event listeners**
```typescript
// BAD - Memory leak
class MyScene extends Phaser.Scene {
    create() {
        this.events.on('update', () => this.handleUpdate());
    }
    // No cleanup - listener persists even after scene stops
}
```

**✅ Solution: Always remove listeners in shutdown()**
```typescript
// GOOD - Proper cleanup
class MyScene extends Phaser.Scene {
    private updateHandler?: () => void;
    
    create() {
        this.updateHandler = () => this.handleUpdate();
        this.events.on('update', this.updateHandler);
    }
    
    shutdown() {
        if (this.updateHandler) {
            this.events.off('update', this.updateHandler);
            this.updateHandler = undefined;
        }
    }
}
```

**❌ Pitfall 2: Manually destroying Game Objects in shutdown()**
```typescript
// BAD - Causes double-destroy errors
class MyScene extends Phaser.Scene {
    private car?: Car;
    
    shutdown() {
        this.car?.destroy(); // Phaser already does this!
    }
}
```

**✅ Solution: Let Phaser handle Game Object destruction**
```typescript
// GOOD - Only clean up custom systems
class MyScene extends Phaser.Scene {
    private car?: Car;
    private customManager?: CustomManager;
    
    shutdown() {
        // Only clean up custom managers, not Game Objects
        this.customManager?.destroy();
        this.customManager = undefined;
        // car will be destroyed automatically by Phaser
    }
}
```

**❌ Pitfall 3: Missing preDestroy() in custom Game Objects**
```typescript
// BAD - No cleanup before destruction
export class Car extends Phaser.GameObjects.Sprite {
    private listeners: (() => void)[] = [];
    
    destroy() {
        super.destroy();
        // Too late! References already cleaned by parent
    }
}
```

**✅ Solution: Use preDestroy() for cleanup**
```typescript
// GOOD - Cleanup before parent destroy
export class Car extends Phaser.GameObjects.Sprite {
    private listeners: (() => void)[] = [];
    
    preDestroy() {
        // Clean up BEFORE parent destroy
        this.listeners.forEach(fn => this.off('event', fn));
        this.listeners = [];
        this.removeAllListeners();
    }
    
    destroy(fromScene?: boolean) {
        super.destroy(fromScene);
    }
}
```

### Physics Pitfalls

**❌ Pitfall 4: Not checking for Transform component before enabling physics**
```typescript
// BAD - Can throw errors on Container objects
const container = this.add.container(100, 100);
this.physics.world.enable(container); // Error! No Transform component
```

**✅ Solution: Phaser 3.60+ checks automatically, or verify manually**
```typescript
// GOOD - Modern Phaser checks automatically (3.60+)
const sprite = this.add.sprite(100, 100, 'texture');
this.physics.world.enable(sprite); // Safe

// Or check manually for edge cases
if ('x' in gameObject && 'y' in gameObject) {
    this.physics.world.enable(gameObject);
}
```

### Performance Pitfalls

**❌ Pitfall 5: Not using object pooling for particles**
```typescript
// BAD - Creates new particle emitter every frame
update() {
    const particles = this.add.particles(x, y, 'smoke');
    particles.explode(10);
    // Memory leak - emitters never cleaned up!
}
```

**✅ Solution: Use particle emitter pooling with proper cleanup**
```typescript
// GOOD - Reuse particle emitters
class ParticleManager {
    private emitters: ParticleEmitter[] = [];
    
    getEmitter(): ParticleEmitter {
        return this.emitters.find(e => !e.on) || this.createEmitter();
    }
    
    destroy() {
        this.emitters.forEach(emitter => emitter.preDestroy());
        this.emitters = [];
    }
}
```

**❌ Pitfall 6: Updating objects that don't need updates**
```typescript
// BAD - Background image in update list
const background = this.add.image(0, 0, 'background');
// Background never changes, wastes CPU cycles
```

**✅ Solution: Remove static objects from update list**
```typescript
// GOOD - Remove from update list
const background = this.add.image(0, 0, 'background');
background.removeFromUpdateList(); // Saves CPU cycles
```

### Scene Management Pitfalls

**❌ Pitfall 7: Not using scene data for communication**
```typescript
// BAD - Global variables for scene communication
let globalTrackId = 'tutorial';

class GameScene extends Phaser.Scene {
    create() {
        const trackId = globalTrackId; // Fragile, hard to track
    }
}
```

**✅ Solution: Use scene data parameter**
```typescript
// GOOD - Type-safe scene data
interface GameSceneData {
    trackId: string;
    mode: GameMode;
}

class GameScene extends Phaser.Scene {
    create(data: GameSceneData) {
        const { trackId, mode } = data;
    }
}

// Starting the scene
this.scene.start('GameScene', { 
    trackId: 'tutorial', 
    mode: GameMode.Practice 
});
```

### TypeScript Pitfalls

**❌ Pitfall 8: Using `any` type to bypass strict mode**
```typescript
// BAD - Defeats purpose of TypeScript
private myData: any;
```

**✅ Solution: Use proper types or unknown with type guards**
```typescript
// GOOD - Proper typing
interface DriftData {
    angle: number;
    speed: number;
}
private myData: DriftData;

// Or use unknown with type guards
private userData: unknown;
if (typeof userData === 'object' && userData !== null) {
    // Type guard ensures safety
}
```

---

## Success Criteria

### Technical Metrics

- **All systems implemented per specification**: 
  - 5 scenes (Boot, Preload, Menu, Game, Results) functional
  - 8 core systems operational (Physics, Quality, Input, Audio, State, Asset, Scene, UI)
  - 5 tracks playable in both Practice and Score modes
  
- **Performance targets met consistently**:
  - 60 FPS sustained on 2015+ desktop hardware
  - <200MB memory usage during gameplay
  - <3s initial load time, <1s track switching
  
- **Zero critical bugs in core systems**:
  - No physics calculation errors causing crashes
  - No audio playback failures blocking gameplay
  - No collision detection false positives/negatives
  - No save data corruption issues
  
- **Successful deployment across target platforms**:
  - Game accessible at GitHub Pages URL
  - Works in Chrome 90+, Firefox 88+, Safari 14+
  - No console errors in production build

### Code Quality

- **80%+ test coverage on game logic**:
  - DriftPhysics calculations (angle, friction, state transitions)
  - DriftQuality scoring algorithm (all 4 factors weighted correctly)
  - Math utilities (vector operations, lerp functions)
  - SaveManager (serialization, validation, migration)
  
- **Zero TypeScript errors in strict mode**:
  - All interfaces defined for data structures
  - No `any` type usage (linting enforced)
  - Proper error handling with try-catch blocks
  
- **Consistent adherence to coding standards**:
  - ESLint passes with zero warnings
  - Prettier formatting applied to all files
  - JSDoc comments on all public APIs
  
- **Comprehensive documentation coverage**:
  - README with setup instructions
  - Architecture document (this file) completed
  - Inline comments for complex physics calculations
  - All config parameters documented

### Gameplay Quality (Subjective but Testable)

- **Physics feel satisfying**: Playtesters can complete Tutorial track within 5 attempts feeling "in control"
- **Feedback is clear**: Players understand drift quality without reading instructions
- **Flow state achievable**: Advanced players can chain perfect drifts through entire tracks
- **Instant restart works**: R key resets with <100ms perceived delay

---

**End of Architecture Document**
