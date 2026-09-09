import {
  DEFAULT_INPUTS,
  GATES,
  INPUT_LABELS,
  SETS,
  evaluate,
  findSolutions,
  matchesAnswerKey,
} from '../engine';

const levels = Object.values(SETS).flatMap(set => set.levels);

function inputsFor(bits) {
  return Object.fromEntries(INPUT_LABELS.map((label, index) => [label, Number(bits[index])]));
}

function topologyIsAcyclic(circuit) {
  return circuit.every(node => node.inputs.every(input => {
    if (typeof input === 'string') return INPUT_LABELS.includes(input);
    const source = circuit.find(candidate => candidate.id === input);
    return source && source.layer < node.layer;
  }));
}

describe('Logic gates', () => {
  test('evaluate supplied circuits and preserves the default circuit API', () => {
    expect(GATES.AND(1, 1)).toBe(1);
    expect(GATES.NOR(0, 0)).toBe(1);
    expect(evaluate({ ...DEFAULT_INPUTS, A: 1, B: 1 }, ['AND'])[0]).toBe(1);
  });
});

describe('The Minotaur\'s Gates level circuits', () => {
  test.each(levels)('$name has a valid, bounded circuit topology', level => {
    const { circuit, fixedInputs, fixedNodes } = level;

    expect(circuit).toHaveLength(8);
    expect(Object.keys(fixedInputs)).toHaveLength(1);
    expect(Object.keys(fixedNodes)).toHaveLength(2);
    expect(circuit.find(node => node.id === 7)).toMatchObject({ label: 'G8', layer: 4 });
    expect(circuit.filter(node => node.id !== 7).every(node => node.layer >= 1 && node.layer <= 3)).toBe(true);
    expect(topologyIsAcyclic(circuit)).toBe(true);
    expect(new Set(circuit.map(node => node.id)).size).toBe(8);
    expect(circuit.map(node => node.id).sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(Object.keys(fixedNodes).every(label => circuit.some(node => node.label === label))).toBe(true);
  });

  test.each(levels)('$name has its answer as the only valid input combination', level => {
    expect(level.answer).toMatch(/^[01]{8}$/);

    const answerInputs = inputsFor(level.answer);
    const answerOutputs = evaluate(answerInputs, level.gates, level.circuit);
    expect(answerOutputs[7]).toBe(level.target);
    expect(matchesAnswerKey(answerInputs, level.answer)).toBe(true);
    expect(Object.entries(level.fixedInputs).every(([input, value]) => answerInputs[input] === value)).toBe(true);
    expect(Object.entries(level.fixedNodes).every(([label, value]) => {
      const node = level.circuit.find(candidate => candidate.label === label);
      return answerOutputs[node.id] === value;
    })).toBe(true);

    const solutions = findSolutions(level);
    expect(solutions).toHaveLength(1);
    expect(INPUT_LABELS.map(label => solutions[0][label]).join('')).toBe(level.answer);
  });
});
