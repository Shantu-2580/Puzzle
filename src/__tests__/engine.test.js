/**
 * Unit tests for the engine logic (8 inputs A-H, 4 layers, 8 gates)
 */

import { evaluate, findSolution, GATES, DEFAULT_INPUTS, PUZZLES, CIRCUIT } from '../engine';

describe('Engine Logic', () => {
  describe('Logic Gates', () => {
    test('AND gate', () => {
      expect(GATES.AND(0, 0)).toBe(0);
      expect(GATES.AND(0, 1)).toBe(0);
      expect(GATES.AND(1, 0)).toBe(0);
      expect(GATES.AND(1, 1)).toBe(1);
    });

    test('OR gate', () => {
      expect(GATES.OR(0, 0)).toBe(0);
      expect(GATES.OR(0, 1)).toBe(1);
      expect(GATES.OR(1, 0)).toBe(1);
      expect(GATES.OR(1, 1)).toBe(1);
    });

    test('XOR gate', () => {
      expect(GATES.XOR(0, 0)).toBe(0);
      expect(GATES.XOR(0, 1)).toBe(1);
      expect(GATES.XOR(1, 0)).toBe(1);
      expect(GATES.XOR(1, 1)).toBe(0);
    });

    test('NOT gate', () => {
      expect(GATES.NOT(0)).toBe(1);
      expect(GATES.NOT(1)).toBe(0);
    });
  });

  describe('Circuit Evaluation', () => {
    test('evaluates simple circuit correctly', () => {
      // Simple test: G1 (A AND B) should be 1 only when A and B are 1
      const gateTypes = { 0: 'AND' }; // G1 is AND
      const inputs = { A: 1, B: 1, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0 };
      const outputs = evaluate(inputs, gateTypes);
      expect(outputs[0]).toBe(1); // G1 output should be 1
    });

    test('finds solution for simple 8-gate puzzle with fixed inputs', () => {
      const puzzle = {
        gates: ['AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR', 'AND', 'OR'],
        target: 1,
        fixedInputs: { A: 1 }
      };

      const solution = findSolution(puzzle);
      expect(solution).not.toBeNull();

      if (solution) {
        const outputs = evaluate(solution, puzzle.gates);
        expect(outputs[7]).toBe(puzzle.target); // Final output (G8) matches target
        expect(solution.A).toBe(1); // Fixed input A matched
      }
    });
  });

  describe('Default Inputs', () => {
    test('DEFAULT_INPUTS has 8 zero inputs (A-H)', () => {
      expect(Object.keys(DEFAULT_INPUTS)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
      Object.values(DEFAULT_INPUTS).forEach(value => {
        expect(value).toBe(0);
      });
    });
  });

  describe('8-Bit Boolean Lock Validation with Compulsory Nodes', () => {
    PUZZLES.forEach((puzzle, idx) => {
      test(`Puzzle ${idx + 1} (${puzzle.name}) has exactly one valid input combination out of all 256`, () => {
        let validCount = 0;
        let solution = null;

        for (let mask = 0; mask < 256; mask++) {
          const inputMap = Object.fromEntries(
            Object.keys(DEFAULT_INPUTS).map((label, inputIndex) => [label, (mask >> (7 - inputIndex)) & 1])
          );

          if (puzzle.fixedInputs) {
            let inputsMatch = true;
            for (const [key, val] of Object.entries(puzzle.fixedInputs)) {
              if (inputMap[key] !== val) inputsMatch = false;
            }
            if (!inputsMatch) continue;
          }

          const outputs = evaluate(inputMap, puzzle.gates);
          let targetMet = outputs[7] === puzzle.target;
          let nodesMet = true;

          if (puzzle.fixedNodes) {
            for (const [nodeLabel, reqVal] of Object.entries(puzzle.fixedNodes)) {
              const nodeIdx = CIRCUIT.find(n => n.label === nodeLabel)?.id;
              if (nodeIdx !== undefined && outputs[nodeIdx] !== reqVal) nodesMet = false;
            }
          }

          if (targetMet && nodesMet) {
            validCount++;
            solution = mask.toString(2).padStart(8, '0');
          }
        }

        expect(validCount).toBe(1);
        expect(solution).not.toBeNull();
      });

      test(`Puzzle ${idx + 1} uses the requested 8-bit answer`, () => {
        expect(puzzle.answer).toMatch(/^[01]{8}$/);
        const solutionMap = findSolution(puzzle);
        expect(solutionMap).not.toBeNull();
        const solutionBits = Object.keys(DEFAULT_INPUTS)
          .map(input => solutionMap[input])
          .join('');
        expect(solutionBits).toBe(puzzle.answer);
      });
    });
  });
});