# Satisfying Drifting

A top-down drifting racing game built with Phaser 3 and TypeScript. 

## Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
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

   The game will automatically open in your browser at `http://localhost:3000`

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

## Game Design Documents

For detailed information about game design, architecture, and development strategy, see:

- [Game Design Document](docs/Satisfying-Drifting-design-doc.md)
- [Game Architecture](docs/Satisfying-Drifting-game-architecture.md)

## Contributing

This is a personal project, but suggestions and feedback are welcome! Please open an issue to discuss proposed changes.
