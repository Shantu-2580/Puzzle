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

// ── Circuit topology (fixed wiring: 8 inputs, 4 layers, 8 gates) ────────────────────
// Layer 1: 4 gates (G1..G4) - each takes 2 inputs from A-H
// Layer 2: 2 gates (G5..G6) - each takes 2 outputs from Layer 1
// Layer 3: 1 gate  (G7)     - takes 2 outputs from Layer 2
// Layer 4: 1 gate  (G8)     - Output Stage: takes G7 and G6
export const CIRCUIT = [
  { id: 0, label: 'G1', layer: 1, inputs: ['A','B'] },
  { id: 1, label: 'G2', layer: 1, inputs: ['C','D'] },
  { id: 2, label: 'G3', layer: 1, inputs: ['E','F'] },
  { id: 3, label: 'G4', layer: 1, inputs: ['G','H'] },
  { id: 4, label: 'G5', layer: 2, inputs: [0, 1]   },
  { id: 5, label: 'G6', layer: 2, inputs: [2, 3]   },
  { id: 6, label: 'G7', layer: 3, inputs: [4, 5]   },
  { id: 7, label: 'G8', layer: 4, inputs: [6, 5]   }, // Output Stage
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

// ── Evaluate the full circuit ──────────────────────────
export function evaluate(inputMap, gateTypes) {
  const out = new Array(8).fill(0);
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

function matchesAnswerKey(inputMap, answer) {
  if (typeof answer !== 'string' || answer.length !== INPUT_LABELS.length) return false;
  return INPUT_LABELS.every((label, index) => inputMap[label] === Number(answer[index]));
}

export function findSolutions(puzzle) {
  const solutions = [];
  for (let mask = 0; mask < 256; mask++) {
    const inputMap = Object.fromEntries(
      INPUT_LABELS.map((label, index) => [label, (mask >> (7 - index)) & 1])
    );
    const out = evaluate(inputMap, puzzle.gates);
    const targetMet = out[7] === puzzle.target; // G8 is final output (index 7)
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
    if (targetMet && fixedMet && nodeMet && matchesAnswerKey(inputMap, puzzle.answer)) {
      solutions.push(inputMap);
    }
  }
  return solutions;
}

export function findSolution(puzzle) {
  const solutions = findSolutions(puzzle);
  return solutions.length === 1 ? solutions[0] : null;
}

// Default starting input states (8 inputs, all zeros)
export const DEFAULT_INPUTS = { A:0, B:0, C:0, D:0, E:0, F:0, G:0, H:0 };

// Input label identifiers (8 inputs: A–H)
export const INPUT_LABELS = ['A','B','C','D','E','F','G','H'];

// ── SETS STRUCTURE ──────────────────────────────────────────────────────
// Each set contains 3 levels that spell a word when solved
export const SETS = {
  A: {
    name: 'Set A: END',
    description: 'Spell "END" by solving all three levels',
    word: 'END',
    levels: [
      {
        // Level 1: E (01000101)
        name: 'A1 · The Echo Chamber',
        // Placeholder gates - user can modify these easily
        gates: ['XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR'],
        target: 1, // E = 01000101 -> last bit is 1
        answer: '01000101',
        fixedNodes: { G1: 1, G2: 0, G3: 1 },
        initialInputs: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0 },
      },
      {
        // Level 2: N (01001110)
        name: 'A2 · The Nexus Gate',
        // Placeholder gates - user can modify these easily
        gates: ['XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR'],
        target: 1, // XOR circuit output for N = 01001110
        answer: '01001110',
        fixedNodes: { G1: 1, G2: 0, G3: 0 },
        initialInputs: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0 },
      },
      {
        // Level 3: D (01000100)
        name: 'A3 · The Delta Lock',
        // Placeholder gates - user can modify these easily
        gates: ['XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR'],
        target: 1, // XOR circuit output for D = 01000100
        answer: '01000100',
        fixedNodes: { G1: 1, G2: 0, G3: 1 },
        initialInputs: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0 },
      }
    ]
  },
  B: {
    name: 'Set B: SAD',
    description: 'Spell "SAD" by solving all three levels',
    word: 'SAD',
    levels: [
      {
        // Level 1: S (01010011)
        name: 'B1 · The Signal Gate',
        // Placeholder gates - user can modify these easily
        gates: ['XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR'],
        target: 0, // XOR circuit output for S = 01010011
        answer: '01010011',
        fixedNodes: { G1: 1, G2: 1, G3: 0 },
        initialInputs: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 1 },
      },
      {
        // Level 2: A (01000001)
        name: 'B2 · The Alpha Cipher',
        // Placeholder gates - user can modify these easily
        gates: ['XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR'],
        target: 1, // A = 01000001 -> last bit is 1
        answer: '01000001',
        fixedNodes: { G1: 1, G2: 0, G3: 0 },
        initialInputs: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0 },
      },
      {
        // Level 3: D (01000100)
        name: 'B3 · The Delta Vault',
        // Placeholder gates - user can modify these easily
        gates: ['XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR'],
        target: 1, // XOR circuit output for D = 01000100
        answer: '01000100',
        fixedNodes: { G1: 1, G2: 0, G3: 1 },
        initialInputs: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0 },
      }
    ]
  },
  C: {
    name: 'Set C: WET',
    description: 'Spell "WET" by solving all three levels',
    word: 'WET',
    levels: [
      { 
        // Level 1: W (01010111)
        name: 'C1 · The Waveform Gate',
        // Placeholder gates - user can modify these easily
        gates: ['XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR'],
        target: 0, // XOR circuit output for W = 01010111
        answer: '01010111',
        fixedNodes: { G1: 1, G2: 1, G3: 1 },
        initialInputs: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0 },
      },
      {
        // Level 2: E (01000101)
        name: 'C2 · The Echo Vault',
        // Placeholder gates - user can modify these easily
        gates: ['XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR'],
        target: 1, // E = 01000101 -> last bit is 1
        answer: '01000101',
        fixedNodes: { G1: 1, G2: 0, G3: 1 },
        initialInputs: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 1 },
      },
      {
        // Level 3: T (01010100)
        name: 'C3 · The Terminal Node',
        // Placeholder gates - user can modify these easily
        gates: ['XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR', 'XOR'],
        target: 0, // T = 01010100 -> last bit is 0
        answer: '01010100',
        fixedNodes: { G1: 1, G2: 1, G3: 1 },
        initialInputs: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0 },
      }
    ]
  }
};

// Helper to format time in mm:ss.s
export function formatTime(ms) {
  const totalSec = ms / 1000;
  const mins = Math.floor(totalSec / 60);
  const secs = (totalSec % 60).toFixed(1);
  const paddedMins = String(mins).padStart(2, '0');
  const paddedSecs = secs < 10 ? `0${secs}` : secs;
  return `${paddedMins}:${paddedSecs}`;
}