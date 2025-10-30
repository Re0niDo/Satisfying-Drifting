# Satisfying Drifting

[![Build and Deploy to GitHub Pages](https://github.com/Re0niDo/Satisfying-Drifting/actions/workflows/deploy.yml/badge.svg)](https://github.com/Re0niDo/Satisfying-Drifting/actions/workflows/deploy.yml)

A top-down drifting racing game built with Phaser 3 and TypeScript. 

## Getting Started

### Prerequisites

- **Node.js** 20.19+ (22.x recommended for CI compatibility)
- **npm** (comes with Node.js)
- **Git** for version control

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Re0niDo/Satisfying-Drifting.git
   cd Satisfying-Drifting
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The game will automatically open in your browser at `http://localhost:5173`

## Development

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm test` | Run Jest test suite |
| `npm test:watch` | Run tests in watch mode |
| `npm run lint` | Check code quality with ESLint |
| `npm run lint:fix` | Fix auto-fixable linting issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

### Development Workflow

1. Make changes to source files in `src/`
2. Development server automatically reloads (HMR)
3. Write tests in `tests/` matching the structure of `src/`
4. Run `npm test` to verify tests pass
5. Run `npm run lint` to check code quality
6. Run `npm run format` to ensure consistent formatting
7. Commit changes with meaningful commit messages

## Testing

This project uses Jest with ts-jest for testing. Tests are located in the `tests/` directory and mirror the structure of `src/`.

**Run tests:**
```bash
npm test
```

**Run tests in watch mode:**
```bash
npm test:watch
```

## Building for Production

**Create optimized production build:**
```bash
npm run build
```

The build output will be in the `dist/` folder.

**Preview production build locally:**
```bash
npm run preview
```

## Deployment

The `deploy.yml` GitHub Actions workflow builds and deploys the game to GitHub Pages on every push to the `main` branch or when manually dispatched from the Actions tab.

1. **Enable GitHub Pages:** Once per repository, navigate to **Settings → Pages → Build and deployment** and set the source to **GitHub Actions**.
2. **Automatic deployments:** Commits to `main` run `npm ci`, `npx tsc --noEmit`, and `npm run build` on Ubuntu runners using Node.js 22, then publish the generated artifact using the latest Pages actions.
3. **Manual redeploy:** In **[Actions](https://github.com/Re0niDo/Satisfying-Drifting/actions) → [Build and Deploy to GitHub Pages](https://github.com/Re0niDo/Satisfying-Drifting/actions/workflows/deploy.yml)**, choose **Run workflow** to redeploy the current `main` contents.
4. **Live site:** The published game is available at [https://re0nido.github.io/Satisfying-Drifting/](https://re0nido.github.io/Satisfying-Drifting/).

## Game Design Documents

For detailed information about game design, architecture, and development strategy, see:

- [Game Design Document](docs/Satisfying-Drifting-design-doc.md)
- [Game Architecture](docs/Satisfying-Drifting-game-architecture.md)

## Contributing

This is a personal project, but suggestions and feedback are welcome! Please open an issue to discuss proposed changes.
