/**
 * Unit tests for the refactored engine logic (6 inputs A-F, 3 layers 7 gates, fixedInputs)
 */

import { evaluate, findSolution, inputsToAscii, GATES, DEFAULT_INPUTS, PUZZLES, CIRCUIT } from '../engine';

describe('Engine Logic', () => {
  describe('inputsToAscii', () => {
    test('converts 6-bit binary input to ASCII telemetry correctly', () => {
      const inputs = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 }; // 000000 = 0
      expect(inputsToAscii(inputs)).toEqual({
        binaryStr: '000000',
        code: 0,
        char: '•' // Non-printable character
      });
    });

    test('converts printable 6-bit ASCII correctly', () => {
      const inputs = { A: 1, B: 0, C: 0, D: 0, E: 0, F: 1 }; // 100001 = 33 = '!'
      expect(inputsToAscii(inputs)).toEqual({
        binaryStr: '100001',
        code: 33,
        char: '!'
      });
    });
  });

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
    test('evaluates simple 3-layer circuit correctly', () => {
      // Simple test: G1 (A AND B) should be 1 only when A and B are 1
      const gateTypes = { 0: 'AND' }; // G1 is AND
      const inputs = { A: 1, B: 1, C: 0, D: 0, E: 0, F: 0 };
      const outputs = evaluate(inputs, gateTypes);
      expect(outputs[0]).toBe(1); // G1 output should be 1
    });

    test('finds solution for simple 7-gate puzzle with fixed inputs', () => {
      const puzzle = {
        gates: ['AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR', 'AND'],
        target: 1,
        fixedInputs: { A: 1 }
      };

      const solution = findSolution(puzzle);
      expect(solution).not.toBeNull();

      if (solution) {
        const outputs = evaluate(solution, puzzle.gates);
        expect(outputs[6]).toBe(puzzle.target); // Final output (G7) matches target
        expect(solution.A).toBe(1); // Fixed input A matched
      }
    });
  });

  describe('Default Inputs', () => {
    test('DEFAULT_INPUTS has 6 zero inputs (A-F)', () => {
      expect(Object.keys(DEFAULT_INPUTS)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
      Object.values(DEFAULT_INPUTS).forEach(value => {
        expect(value).toBe(0);
      });
    });
  });

  describe('6-Bit Boolean Lock Validation with Compulsory Nodes', () => {
    PUZZLES.forEach((puzzle, idx) => {
      test(`Puzzle ${idx + 1} (${puzzle.name}) has EXACTLY 1 valid input combination out of all 64`, () => {
        let validCount = 0;
        let solution = null;

        for (let mask = 0; mask < 64; mask++) {
          const inputMap = {
            A: (mask >> 5) & 1,
            B: (mask >> 4) & 1,
            C: (mask >> 3) & 1,
            D: (mask >> 2) & 1,
            E: (mask >> 1) & 1,
            F: mask & 1,
          };

          if (puzzle.fixedInputs) {
            let inputsMatch = true;
            for (const [key, val] of Object.entries(puzzle.fixedInputs)) {
              if (inputMap[key] !== val) inputsMatch = false;
            }
            if (!inputsMatch) continue;
          }

          const outputs = evaluate(inputMap, puzzle.gates);
          let targetMet = outputs[6] === puzzle.target;
          let nodesMet = true;

          if (puzzle.fixedNodes) {
            for (const [nodeLabel, reqVal] of Object.entries(puzzle.fixedNodes)) {
              const nodeIdx = CIRCUIT.find(n => n.label === nodeLabel)?.id;
              if (nodeIdx !== undefined && outputs[nodeIdx] !== reqVal) nodesMet = false;
            }
          }

          if (targetMet && nodesMet) {
            validCount++;
            solution = mask.toString(2).padStart(6, '0');
          }
        }

        expect(validCount).toBe(1);
        expect(solution).not.toBeNull();
      });
    });
  });
});