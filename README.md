# React + Vite Puzzle Game

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Game Overview

The Minotaur's Gates is a logic puzzle game where players must configure binary inputs (A-H) to solve increasingly complex logic gate puzzles. Each level represents a digital circuit with specific constraints that must be satisfied to progress.

## Features

- 10 progressively challenging logic puzzle levels
- Real-time circuit visualization with SVG rendering
- Binary-to-ASCII conversion display
- Timer functionality for speedrunning
- Admin override system with secret access methods
- Master cipher sentence shortcut for advanced players
- Responsive design with tree/flow layout options
- Progress tracking and statistics

## Technical Architecture

### Core Components

- **App.jsx**: Main application state manager
- **GameHeader.jsx**: Header with level info, timers, and admin controls
- **ControlPanel.jsx**: Puzzle info, controls, and progress tracking
- **InputMatrix.jsx**: Binary input buttons and ASCII telemetry
- **CircuitDisplay.jsx**: Circuit schematic visualization with layout options
- **ResultTerminal.jsx**: Feedback display for level completion/status
- **CircuitSVG.jsx**: Low-level SVG rendering logic for circuit diagrams
- **engine.js**: Core game logic including:
  - Logic gate implementations (AND, OR, XOR, NAND, NOR, XNOR, NOT)
  - Circuit topology and evaluation engine
  - Puzzle definitions and solution finder
  - Utility functions (binary conversion, time formatting)

### State Management

The application uses React hooks for state management:
- `useState`: Component-level state (inputs, timers, levels, etc.)
- `useMemo`: Expensive calculations (circuit evaluation, ASCII conversion)
- `useCallback`: Memoized event handlers to prevent unnecessary re-renders
- `useEffect`: Side effects (resize listeners, timer intervals, level completion detection)

### Circuit Topology

The game uses a fixed 4-layer circuit design:
- Layer 1: 5 gates (G1-G5) processing inputs
- Layer 2: 3 gates (G6-G8) combining layer outputs
- Layer 3: 2 gates (G9-G10) further combining signals
- Layer 4: 1 gate (G11) producing final output

Each puzzle configures different gate types at each position to create unique logic challenges.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at http://localhost:5173

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Testing

```bash
# Run tests in watch mode
npm run test

# Run tests once and exit
npm run test:run
```

## Linting

```bash
npm run lint
```

## Game Mechanics

### Solving Levels

Each level presents a logic circuit puzzle:
1. Toggle binary inputs (A-H) using the buttons
2. Observe the circuit visualization to see gate activations
3. Check the ASCII telemetry for real-time feedback
4. Satisfy both the main target output and any sub-node constraints
5. When solved, the level will automatically register completion after a short delay

### Special Features

#### Admin Access
- **Keyboard Shortcut**: Ctrl+Shift+A
- **Secret Click**: Click the title 5 times rapidly
- **Passwords**: MINOTAUR, ADMIN, GATEKEEPER, 1234

Admin privileges allow skipping levels when stuck.

#### Master Cipher Bypass
As levels are completed, cipher words are revealed. Collect all 10 words to form the master sentence:
"MASTER THE LOGIC GATES TO UNLOCK THE MINOTAUR CYBER CORE"

Entering this sentence in the cipher bypass modal will instantly complete all levels.

## Configuration

### Vite Configuration

See `vite.config.js` for:
- React plugin configuration
- Tailwind CSS integration

### Oxlint Configuration

See `.oxlintrc.json` for linting rules.

## Contributing

### Code Style

- Follow existing code formatting conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components focused and modular

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure tests pass and linting is clean
5. Submit a pull request

### Development Guidelines

- New features should include appropriate tests
- Update documentation when changing functionality
- Consider performance implications of changes
- Maintain backward compatibility where possible

## Acknowledgements

- Built with React and Vite
- Styled with Tailwind CSS
- Logic gate implementation inspired by digital electronics principles

Enjoy hacking through The Minotaur's Gates!