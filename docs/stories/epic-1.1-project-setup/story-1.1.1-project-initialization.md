# Story: Project Initialization and Build System Setup

**Epic:** Epic 1.1: Project Setup & Configuration  
**Story ID:** 1.1.1  
**Priority:** High  
**Points:** 5  
**Status:** Ready for Development

---

## Description

Initialize the Satisfying Drifting project with a complete TypeScript + Phaser 3.90+ development environment using Vite as the build tool. This story establishes the foundational project structure, development tooling, and build pipeline that all subsequent development will depend upon.

This includes setting up the project repository structure, installing and configuring Phaser 3 (latest stable 3.90+), TypeScript with strict mode, development tooling (ESLint, Prettier, Jest), and creating the basic Vite configuration for both development and production builds.

**GDD Reference:** Development Strategy - Phase 1: Foundation  
**Architecture Reference:** Project Structure, Deployment Architecture, Build Process

---

## Acceptance Criteria

### Functional Requirements

- [x] Project repository initialized with proper directory structure matching architecture document
- [x] Vite development server runs successfully on port 5173 (changed from 3000)
- [x] Production build generates optimized bundle in `dist/` folder
- [x] TypeScript compilation succeeds with zero errors in strict mode
- [x] ESLint and Prettier configurations work without conflicts
- [x] Jest test framework executes sample test successfully
- [x] HTML entry point loads Phaser canvas correctly

### Technical Requirements

- [x] Code follows TypeScript strict mode standards
- [x] Phaser 3.90+ (latest stable) installed and configured
- [x] Build output is under 500KB (gzipped) for initial bundle
- [x] No console errors or warnings in development mode
- [x] Source maps generated for debugging in development
- [x] Hot Module Replacement (HMR) works correctly with Vite

### Game Design Requirements

- [x] Base canvas resolution set to 1280x720 as specified in architecture
- [x] Canvas scales appropriately using Phaser.Scale.FIT mode
- [x] Placeholder game successfully renders to verify Phaser integration

---

## Technical Specifications

### Files to Create/Modify

**New Files:**

- `package.json` - Project dependencies and npm scripts
- `tsconfig.json` - TypeScript configuration with strict mode enabled
- `vite.config.ts` - Vite build configuration for dev and production
- `.eslintrc.json` - ESLint configuration for TypeScript
- `.prettierrc.json` - Code formatting rules
- `jest.config.js` - Jest testing framework configuration
- `.gitignore` - Git ignore patterns for node_modules, dist, etc.
- `public/index.html` - HTML entry point with game canvas container
- `src/main.ts` - Application entry point that initializes Phaser
- `src/config/GameConfig.ts` - Phaser game configuration object
- `README.md` - Project documentation with setup instructions

**Modified Files:**

- None (initial setup)

### Project Structure

```
Satisfying-Drifting/
├── .github/                 # GitHub workflows (created in story 1.1.5)
├── src/
│   ├── config/
│   │   └── GameConfig.ts    # Phaser configuration
│   └── main.ts              # Entry point
├── public/
│   └── index.html           # HTML template
├── tests/                   # Test files (structure matches src/)
├── docs/
│   ├── stories/             # Story documentation
│   └── *.md                 # Existing design docs
├── assets/                  # Game assets (created in later stories)
├── dist/                    # Build output (gitignored)
├── node_modules/            # Dependencies (gitignored)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── jest.config.js
├── .eslintrc.json
├── .prettierrc.json
├── .gitignore
└── README.md
```

### Package Dependencies

```json
{
  "dependencies": {
    "phaser": "^3.90.0"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.45.0",
    "eslint-config-prettier": "^9.0.0",
    "jest": "^29.6.0",
    "prettier": "^3.0.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

### TypeScript Configuration

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": false,
    "strict": true,                          // Enable all strict type checks
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/Satisfying-Drifting/',  // GitHub Pages subdirectory
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,  // Disable in production
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']  // Separate Phaser into its own chunk
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
```

### Phaser Game Configuration

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
            debug: false,
            fps: 60
        }
    },
    render: {
        pixelArt: false,
        antialias: true,
        antialiasGL: true,
        roundPixels: false
    },
    fps: {
        target: 60,
        forceSetTimeOut: false
    },
    stableSort: -1,  // Auto-detect for best performance
    disablePreFX: false,
    disablePostFX: false,
    scene: []  // Scenes will be added in story 1.2
};
```

### Main Entry Point

```typescript
// src/main.ts
import Phaser from 'phaser';
import { gameConfig } from './config/GameConfig';

window.addEventListener('load', () => {
    const game = new Phaser.Game(gameConfig);

    // Development helper - expose game instance for debugging
    if (import.meta.env.DEV) {
        (window as any).game = game;
    }
});
```

### HTML Entry Point

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Satisfying Drifting</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: Arial, sans-serif;
        }
        #game-container {
            max-width: 100%;
            max-height: 100vh;
        }
    </style>
</head>
<body>
    <div id="game-container"></div>
    <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

### Integration Points

**Build System Integration:**
- Vite handles TypeScript compilation automatically
- ESLint and Prettier integrate with VS Code for real-time feedback
- Jest configured to work with TypeScript using ts-jest

**Development Workflow:**
- `npm run dev` starts Vite dev server with HMR
- `npm run build` creates production bundle
- `npm run preview` serves production build locally
- `npm test` runs Jest test suite
- `npm run lint` checks code quality
- `npm run format` applies Prettier formatting

**Future Integration:**
- Scene files will import gameConfig and register themselves
- Asset loading will use Vite's asset handling (`/assets/...`)
- GitHub Actions will use `npm run build` for deployment

---

## Implementation Tasks

### Dev Agent Record

**Tasks:**

- [x] Initialize npm project with `npm init`
- [x] Install Phaser 3.90+ and core dependencies
- [x] Install development dependencies (TypeScript, Vite, ESLint, Prettier, Jest)
- [x] Create and configure `tsconfig.json` with strict mode
- [x] Create and configure `vite.config.ts` with GitHub Pages base path
- [x] Create ESLint configuration (`.eslintrc.json`)
- [x] Create Prettier configuration (`.prettierrc.json`)
- [x] Configure Jest for TypeScript testing
- [x] Create `.gitignore` file with appropriate patterns
- [x] Create project directory structure (src, public, tests, docs/stories)
- [x] Implement `src/config/GameConfig.ts` with Phaser configuration
- [x] Implement `src/main.ts` entry point
- [x] Create `public/index.html` with game container
- [x] Add npm scripts to `package.json` (dev, build, test, lint, format)
- [x] Create `README.md` with setup and development instructions
- [x] Verify development server runs (`npm run dev`)
- [x] Verify production build succeeds (`npm run build`)
- [x] Verify build output is under 500KB (gzipped)
- [x] Create sample Jest test to verify testing framework
- [x] Run ESLint and fix any issues (`npm run lint`)
- [x] Run Prettier to format all files (`npm run format`)
- [x] Test that Phaser canvas renders correctly in browser
- [x] Commit initial project setup to git

**Debug Log:**
| Task | File | Change | Reverted? |
|------|------|--------|-----------|
| Configure Jest | jest.config.js | Renamed to jest.config.cjs for CommonJS compatibility | No |
| Fix Vite build | index.html | Moved from public/ to root directory per Vite convention | No |
| Install terser | package.json | Added terser as dev dependency for minification | No |
| Fix port issue | vite.config.ts | Changed port from 3000 to 5173 due to permission issues | No |
| Add type definitions | src/vite-env.d.ts | Created to define Vite's ImportMeta types | No |
| Mock Phaser in tests | GameConfig.test.ts | Added Phaser mock to avoid canvas issues in Jest | No |

**Completion Notes:**

Port 3000 had permission issues on Windows, changed to 5173 (Vite's default). Phaser requires mocking in Jest due to canvas dependencies. All acceptance criteria met.

**Change Log:**

- Changed dev server port from 3000 to 5173 due to Windows permission issues with port 3000

---

## Game Design Context

**GDD Reference:** Development Strategy - Phase 1: Foundation (Weeks 1-2)

**Game Mechanic:** None (foundational infrastructure)

**Player Experience Goal:** Not applicable - this is technical infrastructure that enables all future game development

**Architecture Alignment:**
This story implements the foundational requirements from the Architecture Document:
- Technology Stack (Phaser 3.90+, TypeScript 5.0+, Vite)
- Project Structure (directory organization)
- Build Process (development and production builds)
- TypeScript Standards (strict mode configuration)

---

## Testing Requirements

### Unit Tests

**Test Files:**
- `tests/config/GameConfig.test.ts` - Verify Phaser configuration object structure

**Test Scenarios:**
- GameConfig exports valid Phaser configuration object
- Configuration specifies correct canvas dimensions (1280x720)
- Physics configuration disables gravity (y: 0)
- Scale mode set to FIT with proper min/max constraints
- Target FPS is 60

### Integration Tests

**Manual Test Cases:**

1. **Development Server Startup**
   - Run `npm run dev`
   - Expected: Server starts on port 3000, browser opens automatically
   - Performance: Server ready in < 5 seconds

2. **Production Build Generation**
   - Run `npm run build`
   - Expected: Dist folder created with optimized bundle
   - Performance: Build completes in < 30 seconds
   - Size: Initial bundle < 500KB gzipped

3. **Phaser Canvas Rendering**
   - Open development server in browser
   - Expected: Black canvas (1280x720) centered on page, no console errors
   - Performance: Page loads in < 2 seconds

4. **Hot Module Replacement**
   - Modify `GameConfig.ts` background color
   - Expected: Browser updates without full reload, new color displays
   - Performance: Update reflects in < 1 second

5. **TypeScript Strict Mode Validation**
   - Introduce intentional type error in main.ts
   - Expected: TypeScript compiler catches error, build fails
   - Verification: Run `npm run build` and confirm error reported

### Performance Tests

**Metrics to Verify:**
- Development server starts in < 5 seconds
- Production build completes in < 30 seconds
- Initial bundle size < 500KB gzipped
- Hot reload updates in < 1 second
- Page load time < 2 seconds

---

## Dependencies

**Story Dependencies:**
- None (this is the first story in the epic)

**Technical Dependencies:**
- Node.js 18+ installed on development machine
- npm package manager
- Git for version control

**Asset Dependencies:**
- None (no game assets required for this story)

---

## Definition of Done

- [x] All acceptance criteria met
- [ ] Code reviewed and approved
- [x] Unit tests written and passing (GameConfig validation test)
- [x] Integration tests passing (all 5 manual test cases completed)
- [x] Development server runs without errors
- [x] Production build succeeds and generates optimized bundle
- [x] No TypeScript errors in strict mode
- [x] No linting errors (`npm run lint` passes)
- [x] Code formatted with Prettier (`npm run format` applied)
- [x] README.md contains clear setup instructions
- [x] All project structure directories created
- [x] Phaser canvas renders successfully in browser
- [x] Bundle size under 500KB gzipped

---

## Notes

### Implementation Notes

- Use `npm` (not yarn or pnpm) for consistency across development team and CI/CD
- Vite's base path (`/Satisfying-Drifting/`) must match GitHub repository name for Pages deployment
- Development build includes source maps; production build disables them for smaller bundle size
- Phaser 3.90+ includes latest performance improvements and bug fixes over 3.60
- ESLint and Prettier configurations designed to work together without conflicts

### Design Decisions

- **Vite over Webpack**: Faster development builds, superior HMR, simpler configuration
- **TypeScript Strict Mode**: Enforces type safety from Day 1, prevents common runtime errors
- **Jest for Testing**: Industry standard, excellent TypeScript support with ts-jest
- **Separate Phaser chunk**: Improves caching, Phaser rarely changes once installed
- **Manual chunks over auto-splitting**: Explicit control over bundle structure for optimal loading

### Future Considerations

- Consider adding `vite-plugin-imagemin` for asset optimization in later stories (Phase 2+)
- May need additional ESLint plugins for Phaser-specific patterns as codebase grows
- GitHub Actions workflow will use these npm scripts for automated deployment (Story 1.1.5)
- Path aliases (`@/`) configured for cleaner imports once project structure expands

### Common Pitfalls to Avoid

- **DO NOT** commit `node_modules/` or `dist/` folders to git
- **DO NOT** disable TypeScript strict mode - it's a core architecture requirement
- **VERIFY** Vite base path matches repository name exactly (case-sensitive)
- **ENSURE** Phaser is imported as ES module (`import Phaser from 'phaser'`), not UMD
- **TEST** production build locally with `npm run preview` before considering story complete

---

**Story Created:** October 29, 2025  
**Created By:** Jordan (Game Scrum Master)  
**Next Story:** 1.1.2 - ESLint and Prettier Configuration Deep Dive
