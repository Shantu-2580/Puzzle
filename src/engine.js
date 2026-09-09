// ── Logic Gate Functions ────────────────────────────────
export const GATES = {
  AND: (a, b) => a & b,
  OR: (a, b) => a | b,
  XOR: (a, b) => a ^ b,
  NAND: (a, b) => (a & b) ^ 1,
  NOR: (a, b) => (a | b) ^ 1,
  XNOR: (a, b) => (a ^ b) ^ 1,
  NOT: a => a ^ 1,
};

export const GATE_TYPES = Object.keys(GATES);
export const INPUT_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const DEFAULT_INPUTS = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0 };

export const SECRET_JUMP_PHRASE = 'OPEN SEAS';
export const JUMP_DISTANCE = 5;
export const CIPHER_WORDS = ['MASTER', 'THE', 'LOGIC'];
export const FULL_CIPHER_SENTENCE = CIPHER_WORDS.join(' ');

export function normalizePhrase(phrase) {
  if (!phrase || typeof phrase !== 'string') return '';
  return phrase.trim().toUpperCase().replace(/\s+/g, ' ');
}

// Kept as a safe fallback for callers that do not supply a level circuit.
export const CIRCUIT = [
  { id: 0, label: 'G1', layer: 1, inputs: ['A', 'B'] },
  { id: 1, label: 'G2', layer: 1, inputs: ['C', 'D'] },
  { id: 2, label: 'G3', layer: 1, inputs: ['E', 'F'] },
  { id: 3, label: 'G4', layer: 1, inputs: ['G', 'H'] },
  { id: 4, label: 'G5', layer: 2, inputs: [0, 1] },
  { id: 5, label: 'G6', layer: 2, inputs: [2, 3] },
  { id: 6, label: 'G7', layer: 3, inputs: [4, 5] },
  { id: 7, label: 'G8', layer: 4, inputs: [6, 5] },
];

export const GATE_LABELS = CIRCUIT.reduce((labels, gate) => ({ ...labels, [gate.id]: gate.label }), {});

// Every circuit has three logic layers and G8 as its layer-four output stage.
export const LEVEL_CIRCUITS = {
  A1: [
    { id: 0, label: 'G1', layer: 1, inputs: ['D', 'C'] }, { id: 1, label: 'G2', layer: 1, inputs: ['E', 'B'] },
    { id: 2, label: 'G3', layer: 1, inputs: ['H', 'F'] }, { id: 3, label: 'G4', layer: 1, inputs: ['G', 'A'] },
    { id: 4, label: 'G5', layer: 2, inputs: [0, 2] }, { id: 5, label: 'G6', layer: 2, inputs: [1, 0] },
    { id: 6, label: 'G7', layer: 3, inputs: [4, 5] }, { id: 7, label: 'G8', layer: 4, inputs: [4, 5] },
  ],
  A2: [
    { id: 0, label: 'G1', layer: 1, inputs: ['C', 'D'] }, { id: 1, label: 'G2', layer: 1, inputs: ['G', 'F'] },
    { id: 2, label: 'G3', layer: 1, inputs: ['B', 'E'] }, { id: 3, label: 'G4', layer: 1, inputs: ['H', 'A'] },
    { id: 4, label: 'G5', layer: 2, inputs: [1, 3] }, { id: 5, label: 'G6', layer: 2, inputs: [2, 0] },
    { id: 6, label: 'G7', layer: 3, inputs: [5, 4] }, { id: 7, label: 'G8', layer: 4, inputs: [4, 5] },
  ],
  A3: [
    { id: 0, label: 'G1', layer: 1, inputs: ['B', 'F'] }, { id: 1, label: 'G2', layer: 1, inputs: ['D', 'G'] },
    { id: 2, label: 'G3', layer: 1, inputs: ['A', 'H'] }, { id: 3, label: 'G4', layer: 1, inputs: ['E', 'C'] },
    { id: 4, label: 'G5', layer: 2, inputs: [3, 1] }, { id: 5, label: 'G6', layer: 2, inputs: [1, 0] },
    { id: 6, label: 'G7', layer: 3, inputs: [5, 4] }, { id: 7, label: 'G8', layer: 4, inputs: [6, 4] },
  ],
  B1: [
    { id: 0, label: 'G1', layer: 1, inputs: ['C', 'A'] }, { id: 1, label: 'G2', layer: 1, inputs: ['G', 'H'] },
    { id: 2, label: 'G3', layer: 1, inputs: ['D', 'B'] }, { id: 3, label: 'G4', layer: 1, inputs: ['F', 'E'] },
    { id: 4, label: 'G5', layer: 2, inputs: [3, 2] }, { id: 5, label: 'G6', layer: 2, inputs: [3, 0] },
    { id: 6, label: 'G7', layer: 3, inputs: [4, 5] }, { id: 7, label: 'G8', layer: 4, inputs: [5, 6] },
  ],
  B2: [
    { id: 0, label: 'G1', layer: 1, inputs: ['D', 'E'] }, { id: 1, label: 'G2', layer: 1, inputs: ['F', 'G'] },
    { id: 2, label: 'G3', layer: 1, inputs: ['A', 'C'] }, { id: 3, label: 'G4', layer: 1, inputs: ['B', 'B'] },
    { id: 4, label: 'G5', layer: 2, inputs: [0, 1] }, { id: 5, label: 'G6', layer: 2, inputs: ['H', 'H'] },
    { id: 6, label: 'G7', layer: 3, inputs: [4, 5] }, { id: 7, label: 'G8', layer: 4, inputs: [6, 5] },
  ],
  B3: [
    { id: 0, label: 'G1', layer: 1, inputs: ['E', 'G'] }, { id: 1, label: 'G2', layer: 1, inputs: ['B', 'F'] },
    { id: 2, label: 'G3', layer: 1, inputs: ['A', 'A'] }, { id: 3, label: 'G4', layer: 1, inputs: ['H', 'H'] },
    { id: 4, label: 'G5', layer: 2, inputs: ['H', 'H'] }, { id: 5, label: 'G6', layer: 2, inputs: ['C', 'D'] },
    { id: 6, label: 'G7', layer: 3, inputs: [4, 5] }, { id: 7, label: 'G8', layer: 4, inputs: [0, 4] },
  ],
  C1: [
    { id: 0, label: 'G1', layer: 1, inputs: ['H', 'G'] }, { id: 1, label: 'G2', layer: 1, inputs: ['E', 'C'] },
    { id: 2, label: 'G3', layer: 1, inputs: ['B', 'D'] }, { id: 3, label: 'G4', layer: 1, inputs: ['F', 'A'] },
    { id: 4, label: 'G5', layer: 2, inputs: [2, 3] }, { id: 5, label: 'G6', layer: 2, inputs: [2, 1] },
    { id: 6, label: 'G7', layer: 3, inputs: [5, 4] }, { id: 7, label: 'G8', layer: 4, inputs: [4, 5] },
  ],
  C2: [
    { id: 0, label: 'G1', layer: 1, inputs: ['C', 'D'] }, { id: 1, label: 'G2', layer: 1, inputs: ['B', 'B'] },
    { id: 2, label: 'G3', layer: 1, inputs: ['F', 'F'] }, { id: 3, label: 'G4', layer: 1, inputs: ['H', 'H'] },
    { id: 4, label: 'G5', layer: 2, inputs: [1, 2] }, { id: 5, label: 'G6', layer: 2, inputs: ['E', 'G'] },
    { id: 6, label: 'G7', layer: 3, inputs: [4, 3] }, { id: 7, label: 'G8', layer: 4, inputs: [6, 6] },
  ],
  C3: [
    { id: 0, label: 'G1', layer: 1, inputs: ['F', 'G'] }, { id: 1, label: 'G2', layer: 1, inputs: ['C', 'E'] },
    { id: 2, label: 'G3', layer: 1, inputs: ['A', 'C'] }, { id: 3, label: 'G4', layer: 1, inputs: ['H', 'H'] },
    { id: 4, label: 'G5', layer: 2, inputs: ['B', 'D'] }, { id: 5, label: 'G6', layer: 2, inputs: ['E', 'G'] },
    { id: 6, label: 'G7', layer: 3, inputs: [4, 5] }, { id: 7, label: 'G8', layer: 4, inputs: [6, 3] },
  ],
};

const level = (name, circuit, gates, target, answer, fixedInputs, fixedNodes, initialInputs = DEFAULT_INPUTS) => ({
  name, circuit, gates, target, answer, fixedInputs, fixedNodes, initialInputs,
});

export const SETS = {
  A: { name: 'Set A', description: 'Spell "END" by solving all three levels', word: 'END', levels: [
    level('A1 · The Echo Chamber', LEVEL_CIRCUITS.A1, ['OR', 'NAND', 'NAND', 'NOR', 'NOR', 'XOR', 'OR', 'XNOR'], 1, '01000101', { B: 1 }, { G4: 1, G7: 1 }, { ...DEFAULT_INPUTS, F: 1 }),
    level('A2 · The Nexus Gate', LEVEL_CIRCUITS.A2, ['NOR', 'NAND', 'XNOR', 'OR', 'OR', 'XNOR', 'XNOR', 'OR'], 1, '01001110', { B: 1 }, { G3: 1, G5: 0 }),
    level('A3 · The Delta Lock', LEVEL_CIRCUITS.A3, ['NAND', 'XOR', 'OR', 'OR', 'OR', 'XNOR', 'AND', 'NAND'], 1, '01000100', { G: 0 }, { G3: 0, G6: 1 }),
  ] },
  B: { name: 'Set B', description: 'Spell "SAD" by solving all three levels', word: 'SAD', levels: [
    level('B1 · The Signal Gate', LEVEL_CIRCUITS.B1, ['NOR', 'NAND', 'NAND', 'OR', 'NOR', 'XNOR', 'AND', 'OR'], 0, '01010011', { G: 1 }, { G2: 0, G5: 1 }, { ...DEFAULT_INPUTS, H: 1 }),
    level('B2 · The Alpha Cipher', LEVEL_CIRCUITS.B2, ['NOR', 'NOR', 'OR', 'XOR', 'AND', 'AND', 'AND', 'AND'], 1, '01000001', { B: 1 }, { G3: 0, G5: 1 }),
    level('B3 · The Delta Vault', LEVEL_CIRCUITS.B3, ['NOR', 'AND', 'XOR', 'OR', 'NOR', 'OR', 'NAND', 'AND'], 1, '01000100', { A: 0 }, { G2: 1, G6: 0 }),
  ] },
  C: { name: 'Set C', description: 'Spell "WET" by solving all three levels', word: 'WET', levels: [
    level('C1 · The Waveform Gate', LEVEL_CIRCUITS.C1, ['AND', 'NOR', 'NAND', 'AND', 'OR', 'OR', 'AND', 'NOR'], 0, '01010111', { F: 1 }, { G1: 1, G5: 0 }),
    level('C2 · The Echo Vault', LEVEL_CIRCUITS.C2, ['OR', 'AND', 'AND', 'AND', 'AND', 'OR', 'AND', 'AND'], 1, '01000101', { A: 0 }, { G1: 0, G6: 0 }, { ...DEFAULT_INPUTS, H: 1 }),
    level('C3 · The Terminal Node', LEVEL_CIRCUITS.C3, ['AND', 'OR', 'OR', 'NOR', 'AND', 'NOR', 'AND', 'NAND'], 0, '01010100', { F: 1 }, { G3: 0, G7: 1 }),
  ] },
};

export const PUZZLES = Object.values(SETS).flatMap(set => set.levels);

export function evaluate(inputMap, gateTypes, circuit = CIRCUIT) {
  const outputs = new Array(8).fill(0);
  const nodes = [...circuit].sort((a, b) => a.layer - b.layer || a.id - b.id);
  for (const node of nodes) {
    const gate = GATES[gateTypes[node.id]];
    if (!gate) continue;
    const values = node.inputs.map(input => (typeof input === 'string' ? inputMap[input] : outputs[input]));
    outputs[node.id] = node.unary ? gate(values[0]) : gate(values[0], values[1]);
  }
  return outputs;
}

export function matchesAnswerKey(inputMap, answer) {
  return typeof answer === 'string'
    && /^[01]{8}$/.test(answer)
    && INPUT_LABELS.every((label, index) => inputMap[label] === Number(answer[index]));
}

export function findSolutions(puzzle) {
  const circuit = puzzle.circuit || CIRCUIT;
  return Array.from({ length: 256 }, (_, mask) => Object.fromEntries(
    INPUT_LABELS.map((label, index) => [label, (mask >> (7 - index)) & 1])
  )).filter(inputMap => {
    const outputs = evaluate(inputMap, puzzle.gates, circuit);
    const inputsMatch = Object.entries(puzzle.fixedInputs || {}).every(([input, value]) => inputMap[input] === value);
    const nodesMatch = Object.entries(puzzle.fixedNodes || {}).every(([label, value]) => {
      const node = circuit.find(candidate => candidate.label === label);
      return node && outputs[node.id] === value;
    });
    return outputs[7] === puzzle.target && inputsMatch && nodesMatch;
  });
}

export function findSolution(puzzle) {
  const solutions = findSolutions(puzzle);
  return solutions.length === 1 ? solutions[0] : null;
}

export function formatTime(ms) {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(1);
  return `${String(minutes).padStart(2, '0')}:${seconds < 10 ? '0' : ''}${seconds}`;
}
