# 🏛️ The Minotaur's Gates — Minotaur Logic Simulator v2.0.0

> **An Odyssey-themed logic circuit simulator** — breach 3 digital security gates guarding the core of the Minotaur's Labyrinth.

---

## 🎮 Game Overview

**The Minotaur's Gates** is an interactive logic puzzle game where players configure **6 binary inputs** (A–F) to satisfy **7-gate combinational circuits** across **3 progressively challenging levels**. Each level is a mathematically precise 6-bit Boolean lock with exactly **one valid solution** out of 64 possible combinations.

### Core Objectives
- Toggle **6 binary inputs** ($A, B, C, D, E, F$) between `0` and `1`
- Satisfy **7 logic gates** ($G_1$ through $G_7$) arranged in 3 hierarchical layers
- Adhere to **compulsory fixed input locks** (e.g., $A=1, D=0$) — violations prevent solution
- Observe real-time **6-bit binary → decimal ASCII telemetry**
- Collect **3 cipher words** across stages to reveal the **Final Master Verification Phrase**

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **3 Hardcore Levels** | Each a unique 6-bit Boolean lock with exactly one solution |
| **Real-time Circuit Visualization** | Dynamic SVG schematic showing live wire states (high/low) |
| **ASCII Telemetry HUD** | 6-bit binary → decimal → ASCII character conversion in real-time |
| **Compulsory Node Locks** | Visual lock indicators on inputs that must remain fixed per level |
| **Stage Progression Tracker** | Visual progress through 3 stages with solve status |
| **Dual Timer System** | Per-level timer + total campaign timer |
| **Victory Overlay** | Grand completion screen with Final Verification Phrase |
| **Copy Verification Phrase** | One-click clipboard copy of the master phrase |

---

## 🏗️ Technical Architecture

### Stack
- **React 18** + **Vite** (build tooling)
- **Tailwind CSS** (styling)
- **Vitest** (unit testing)
- **Orbitron** + **JetBrains Mono** (typography)

### Core Components

| Component | Path | Responsibility |
|-----------|------|----------------|
| **`App.jsx`** | `src/App.jsx` | Root state manager, level timer, stage progression, victory modal |
| **`GameHeader.jsx`** | `src/components/GameHeader.jsx` | Header bar, active level timer, total timer, level indicator |
| **`ControlPanel.jsx`** | `src/components/ControlPanel.jsx` | Stage progress tracker, reset/randomize input controls |
| **`InputMatrix.jsx`** | `src/components/InputMatrix.jsx` | 6 interactive toggle buttons (A–F), compulsory lock tags, ASCII telemetry HUD |
| **`CircuitDisplay.jsx`** | `src/components/CircuitDisplay.jsx` | Container for SVG schematic viewer |
| **`CircuitSVG.jsx`** | `src/CircuitSVG.jsx` | Dynamic SVG renderer: gates $G_1$–$G_7$, signal wire states, node labels |
| **`ResultTerminal.jsx`** | `src/components/ResultTerminal.jsx` | Real-time output feedback, breach notifications, Final Verification Phrase banner |

---

## ⚙️ Logic Engine (`src/engine.js`)

### Circuit Topology
```
Inputs: A, B, C, D, E, F ∈ {0, 1}

Layer 1 (Input Gates):
  G₁ = f(A, B)      G₂ = f(B, C)      G₃ = f(D, E)      G₄ = f(E, F)

Layer 2 (Intermediate Gates):
  G₅ = f(G₁, G₂)    G₆ = f(G₃, G₄)

Layer 3 (Final Output Gate):
  G₇ = f(G₅, G₆)  →  Target Output
```

### Supported Gate Types
`AND`, `OR`, `XOR`, `NAND`, `NOR`, `XNOR`, `NOT`

### ASCII Telemetry
The 6 binary inputs form a 6-bit integer:
$$\text{Code} = (A \cdot 32) + (B \cdot 16) + (C \cdot 8) + (D \cdot 4) + (E \cdot 2) + (F \cdot 1)$$
- Printable ASCII ($32 \le \text{Code} \le 126$) → displays character
- Non-printable → displays placeholder `•`

---

## 🔐 The 3 Hardcore Levels

| Level | Name | Gate Topology ($G_1 \dots G_7$) | Target | Fixed Locks | Solution ($A \dots F$) | Telemetry |
|-------|------|----------------------------------|--------|-------------|------------------------|-----------|
| **01** | The Gorgon's Labyrinth | `OR, NOR, OR, NOR, AND, NOR, AND` | `1` | `A=1, D=0` | `100001` | **33 (`!`)** |
| **02** | Titan's Parity Trap | `AND, NAND, OR, NOR, OR, OR, OR` | `0` | `B=1, E=0` | `011001` | **25 (`•`)** |
| **03** | Recursive Singularity | `AND, AND, OR, OR, AND, NOR, AND` | `1` | `C=1, F=0` | `111000` | **56 (`8`)** |

> **Mathematical Guarantee**: Each level has exactly **1 valid solution** out of 64 combinations. All other inputs produce the wrong output.

---

## 🏆 Final Master Verification Phrase

Upon completing **Level 3**, all cipher words assemble into:

> **“MASTER THE LOGIC”**

- Displayed in `ResultTerminal.jsx` on Level 3 clearance
- Includes **📋 COPY VERIFICATION PHRASE** button (copies to clipboard)
- Featured on the Grand Victory Overlay

---

## 🎨 Design System

| Token | Hex | Usage |
|-------|-----|-------|
| **Background Void** | `#07111F` | Deep space navy background |
| **Container Panel** | `#0D1B2A` / `#152538` | Card/panel backgrounds |
| **Border / Divider** | `#1E344D` | Subtle borders |
| **Odyssey Gold** | `#F4C95D` | Primary accent — titles, level indicators, victory highlights |
| **Aegean Cyan** | `#3DD6D0` | Interactive signals — active states, live wires |
| **Success Green** | `#48C78E` | Level breached, target met |
| **Styx Coral** | `#E76F51` | Error accent — access denied, lock violation |
| **Typography** | `'Orbitron'`, `'JetBrains Mono'` | Display & mono fonts |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Available at `http://localhost:5173`

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 🧪 Testing & Linting

```bash
# Run Vitest unit tests once
npm test -- --run

# Run tests in watch mode
npm test

# Lint with Oxlint
npm run lint
```

---

## 🎯 Game Mechanics

### Solving Levels
1. **Toggle inputs** — Click A–F buttons to flip between 0/1
2. **Watch the circuit** — SVG visualizer shows live gate/wire states (gold = high, dim = low)
3. **Read telemetry** — ASCII HUD shows real-time decimal/character value
4. **Respect locks** — Locked inputs (🔒) cannot be toggled; they're fixed per level
5. **Achieve target** — When $G_7$ matches the level's target output, the stage breaches
6. **Progress** — Auto-advances to next stage/level after brief delay

### Level Structure
Each level = 1 stage. Complete all 3 to unlock the Final Verification Phrase.

---

## 📁 Project Structure

```
src/
├── App.jsx              # Main application controller
├── engine.js            # Logic engine, puzzles, gate evaluators
├── CircuitSVG.jsx       # SVG circuit renderer
├── components/
│   ├── GameHeader.jsx
│   ├── ControlPanel.jsx
│   ├── InputMatrix.jsx
│   ├── CircuitDisplay.jsx
│   └── ResultTerminal.jsx
├── index.css            # Tailwind + custom styles
└── main.jsx             # Entry point
```

---

## 🤝 Contributing

### Code Style
- Follow existing formatting conventions
- Use meaningful variable/function names
- Comment complex logic (especially gate evaluations)
- Keep components focused and modular

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make changes with appropriate tests
4. Ensure `npm test -- --run` and `npm run lint` pass
5. Submit PR

---

## 📜 Acknowledgements

- Built with **React 18**, **Vite**, **Tailwind CSS**
- Logic gate implementation based on digital electronics principles
- Theme inspired by **Homer's Odyssey** & deep-space cybernetic aesthetics

---

## 🔗 Technical Documentation

See **[`brain.md`](brain.md)** for comprehensive technical specifications including:
- Complete mathematical validation tables
- Exhaustive 64-combination boolean proofs
- Detailed component architecture diagrams
- Development command reference

---

**Enjoy breaching the Minotaur's Gates!** 🏛️⚡