// ── Logic Gate Functions ────────────────────────────────
export const GATES = {
  AND:  (a, b) => a & b,
  OR:   (a, b) => a | b,
  XOR:  (a, b) => a ^ b,
  NAND: (a, b) => (a & b) ^ 1,
  NOR:  (a, b) => (a | b) ^ 1,
  XNOR: (a, b) => (a ^ b) ^ 1,
  NOT:  (a)    => a ^ 1,
};

export const GATE_TYPES = Object.keys(GATES);

// ── Secret Shortcut Configuration ─────────────────────────────────────
export const SECRET_JUMP_PHRASE = 'OPEN SEAS';
export const JUMP_DISTANCE = 5;

/**
 * Normalizes input string for case-insensitive, whitespace-tolerant exact comparison.
 */
export function normalizePhrase(phrase) {
  if (!phrase || typeof phrase !== 'string') return '';
  return phrase.trim().toUpperCase().replace(/\s+/g, ' ');
}

// ── Circuit topology (fixed wiring: 6 inputs, 3 layers, 7 gates) ────────────────────
// Layer 1: 4 gates (G1..G4)
// Layer 2: 2 gates (G5..G6)
// Layer 3: 1 gate  (G7) → Final Output (id 6)
export const CIRCUIT = [
  { id: 0, label: 'G1', layer: 1, inputs: ['A','B'] },
  { id: 1, label: 'G2', layer: 1, inputs: ['B','C'] },
  { id: 2, label: 'G3', layer: 1, inputs: ['D','E'] },
  { id: 3, label: 'G4', layer: 1, inputs: ['E','F'] },
  { id: 4, label: 'G5', layer: 2, inputs: [0, 1]   },
  { id: 5, label: 'G6', layer: 2, inputs: [2, 3]   },
  { id: 6, label: 'G7', layer: 3, inputs: [4, 5]   },
];

// Map node indices to readable names
export const GATE_LABELS = CIRCUIT.reduce((acc, g) => {
  acc[g.id] = g.label;
  return acc;
}, {});

// ── Master 10-Word Cipher Sentence for Candidate Shortcut ────────────────
export const CIPHER_WORDS = [
  'MASTER',
  'THE',
  'LOGIC',
];

export const FULL_CIPHER_SENTENCE = CIPHER_WORDS.join(' '); // "MASTER THE LOGIC"

// ── Binary to ASCII Converter Helper (6-bit binary) ────────────────────────
export function inputsToAscii(inputs) {
  const binaryStr = `${inputs.A ?? 0}${inputs.B ?? 0}${inputs.C ?? 0}${inputs.D ?? 0}${inputs.E ?? 0}${inputs.F ?? 0}`;
  const code = parseInt(binaryStr, 2);
  const char = code >= 32 && code <= 126 ? String.fromCharCode(code) : '•';
  return { binaryStr, code, char };
}

// ── Evaluate the full circuit ──────────────────────────
export function evaluate(inputMap, gateTypes) {
  const out = new Array(7).fill(0);
  for (const node of CIRCUIT) {
    const gt = gateTypes[node.id];
    const fn = GATES[gt];
    if (!fn) { out[node.id] = 0; continue; }

    const vals = node.inputs.map(ref =>
      typeof ref === 'string' ? inputMap[ref] : out[ref]
    );
    out[node.id] = node.unary ? fn(vals[0]) : fn(vals[0], vals[1]);
  }
  return out;
}

// ── Find a valid solution map for Admin Auto-Solve/Skip ─────
export function findSolution(puzzle) {
  for (let mask = 0; mask < 64; mask++) {
    const inputMap = {
      A: (mask >> 5) & 1,
      B: (mask >> 4) & 1,
      C: (mask >> 3) & 1,
      D: (mask >> 2) & 1,
      E: (mask >> 1) & 1,
      F: mask & 1,
    };
    const out = evaluate(inputMap, puzzle.gates);
    const targetMet = out[6] === puzzle.target;
    let fixedMet = true;
    if (puzzle.fixedInputs) {
      for (const [inputKey, reqVal] of Object.entries(puzzle.fixedInputs)) {
        if (inputMap[inputKey] !== reqVal) fixedMet = false;
      }
    }
    let nodeMet = true;
    if (puzzle.fixedNodes) {
      for (const [nodeLabel, reqVal] of Object.entries(puzzle.fixedNodes)) {
        const nodeIdx = CIRCUIT.find(n => n.label === nodeLabel)?.id;
        if (nodeIdx !== undefined && out[nodeIdx] !== reqVal) nodeMet = false;
      }
    }
    if (targetMet && fixedMet && nodeMet) return inputMap;
  }
  return null;
}

// Default starting input states (6 inputs, all zeros)
export const DEFAULT_INPUTS = { A:0, B:0, C:0, D:0, E:0, F:0 };

// Input label identifiers (6 inputs: A–F)
export const INPUT_LABELS = ['A','B','C','D','E','F'];

// ── 3 Hardcore Puzzles with Fixed Node (Layer 1,2,3) & Input Constraints ──
export const PUZZLES = [
  {
    name: '01 · The Gorgon’s Labyrinth',
    gates: ['OR', 'NOR', 'OR', 'NOR', 'AND', 'NOR', 'AND'],
    target: 1,
    fixedNodes: { G1: 1, G5: 1 }, // Layer 1: G1=1, Layer 2: G5=1, Layer 3: G7=1 (target)
    fixedInputs: { A: 1 },
    initialInputs: { A: 1, B: 0, C: 0, D: 0, E: 0, F: 0 },
  },
  {
    name: '02 · Titan’s Parity Trap',
    gates: ['AND', 'NAND', 'OR', 'NOR', 'OR', 'OR', 'AND'],
    target: 0,
    fixedNodes: { G4: 0, G6: 1 }, // Layer 1: G4=0, Layer 2: G6=1, Layer 3: G7=0 (target)
    fixedInputs: { B: 1 },
    initialInputs: { A: 0, B: 1, C: 0, D: 0, E: 0, F: 0 },
  },
  {
    name: '03 · Recursive Singularity',
    gates: ['AND', 'AND', 'OR', 'NOR', 'AND', 'NAND', 'NOR'],
    target: 1,
    fixedNodes: { G2: 1, G6: 0 }, // Layer 1: G2=1, Layer 2: G6=0, Layer 3: G7=1 (target)
    fixedInputs: { C: 1 },
    initialInputs: { A: 0, B: 0, C: 1, D: 0, E: 0, F: 0 },
  },
];

// Helper to format time in mm:ss.s
export function formatTime(ms) {
  const totalSec = ms / 1000;
  const mins = Math.floor(totalSec / 60);
  const secs = (totalSec % 60).toFixed(1);
  const paddedMins = String(mins).padStart(2, '0');
  const paddedSecs = secs < 10 ? `0${secs}` : secs;
  return `${paddedMins}:${paddedSecs}`;
}