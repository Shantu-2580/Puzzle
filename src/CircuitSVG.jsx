import React, { useMemo } from 'react';
import { CIRCUIT } from './engine';

/* ── 1. PORTRAIT TREE LAYOUT (Bottom → Top Flow, 6 Inputs, 3 Layers, 7 Gates) ────
   viewBox = 0 0 540 560
   Inputs A-F at bottom (y=480), Gate 7 (G7) & Output at top (y=35)
*/
const TREE_INPUT_POS = {
  A: { x: 50,  y: 480 },
  B: { x: 130, y: 480 },
  C: { x: 210, y: 480 },
  D: { x: 290, y: 480 },
  E: { x: 370, y: 480 },
  F: { x: 450, y: 480 },
};

const TREE_GATE_POS = {
  0: { x: 40,  y: 360 }, // G1 (A, B)
  1: { x: 160, y: 360 }, // G2 (B, C)
  2: { x: 280, y: 360 }, // G3 (D, E)
  3: { x: 400, y: 360 }, // G4 (E, F)
  4: { x: 100, y: 220 }, // G5 (G1, G2)
  5: { x: 340, y: 220 }, // G6 (G3, G4)
  6: { x: 220, y: 90  }, // G7 (G5, G6) -> Final Output
};

const TREE_GATE_W = 80;
const TREE_GATE_H = 42;

/* ── 2. LANDSCAPE FLOW LAYOUT (Left → Right Flow) ──────────────────────
   viewBox = 0 0 960 480
*/
const FLOW_INPUT_POS = {
  A: { x: 40, y: 50  },
  B: { x: 40, y: 120 },
  C: { x: 40, y: 190 },
  D: { x: 40, y: 260 },
  E: { x: 40, y: 330 },
  F: { x: 40, y: 400 },
};

const FLOW_GATE_POS = {
  0: { x: 220, y: 60  },
  1: { x: 220, y: 160 },
  2: { x: 220, y: 270 },
  3: { x: 220, y: 370 },
  4: { x: 480, y: 110 },
  5: { x: 480, y: 320 },
  6: { x: 740, y: 215 },
};

const FLOW_GATE_W = 104;
const FLOW_GATE_H = 46;

/* ── Wire Component for Tree Layout (Vertical Curves) ────────────────── */
function WireTree({ x1, y1, x2, y2, powered }) {
  const midY = (y1 + y2) / 2;
  const d = `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`;
  return (
    <path
      d={d}
      fill="none"
      stroke={powered ? '#F4C95D' : '#1E344D'}
      strokeWidth={powered ? 3.5 : 2.2}
      strokeLinecap="round"
      style={{
        transition: 'stroke 0.3s ease, filter 0.3s ease',
        filter: powered
          ? 'drop-shadow(0 0 6px #F4C95D) drop-shadow(0 0 12px rgba(244,201,93,0.4))'
          : 'none',
      }}
    />
  );
}

/* ── Wire Component for Flow Layout (Horizontal Curves) ──────────────── */
function WireFlow({ x1, y1, x2, y2, powered }) {
  const midX = (x1 + x2) / 2;
  const d = `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`;
  return (
    <path
      d={d}
      fill="none"
      stroke={powered ? '#F4C95D' : '#1E344D'}
      strokeWidth={powered ? 3.5 : 2.2}
      strokeLinecap="round"
      style={{
        transition: 'stroke 0.3s ease, filter 0.3s ease',
        filter: powered
          ? 'drop-shadow(0 0 6px #F4C95D) drop-shadow(0 0 12px rgba(244,201,93,0.4))'
          : 'none',
      }}
    />
  );
}

export default function CircuitSVG({ inputs, gateOutputs, gateTypes, fixedInputs, fixedNodes, layoutMode = 'tree' }) {

  /* ── 1. PORTRAIT TREE CALCULATIONS ──────────────────────────────────── */
  const treeWires = useMemo(() => {
    const result = [];
    // Inputs → Layer 1
    for (const node of CIRCUIT) {
      if (node.layer !== 1) continue;
      const gp = TREE_GATE_POS[node.id];
      node.inputs.forEach((ref, i) => {
        const ip = TREE_INPUT_POS[ref];
        const xOff = node.inputs.length === 1 ? 0 : (i === 0 ? -12 : 12);
        result.push({
          key: `tree-in-${ref}-${node.id}-${i}`,
          x1: ip.x,
          y1: ip.y - 14,
          x2: gp.x + TREE_GATE_W / 2 + xOff,
          y2: gp.y + TREE_GATE_H,
          powered: inputs[ref] === 1,
        });
      });
    }
    // Gates → Gates
    for (const node of CIRCUIT) {
      if (node.layer === 1) continue;
      const gp = TREE_GATE_POS[node.id];
      node.inputs.forEach((ref, i) => {
        const srcPos = TREE_GATE_POS[ref];
        const xOff = node.inputs.length === 1 ? 0 : (i === 0 ? -10 : 10);
        result.push({
          key: `tree-g-${ref}-${node.id}-${i}`,
          x1: srcPos.x + TREE_GATE_W / 2,
          y1: srcPos.y,
          x2: gp.x + TREE_GATE_W / 2 + xOff,
          y2: gp.y + TREE_GATE_H,
          powered: gateOutputs[ref] === 1,
        });
      });
    }
    // Final output wire from G7 (id 6)
    const g7 = TREE_GATE_POS[6];
    result.push({
      key: 'tree-out-wire',
      x1: g7.x + TREE_GATE_W / 2,
      y1: g7.y,
      x2: g7.x + TREE_GATE_W / 2,
      y2: g7.y - 30,
      powered: gateOutputs[6] === 1,
    });
    return result;
  }, [inputs, gateOutputs]);

  /* ── 2. LANDSCAPE FLOW CALCULATIONS ─────────────────────────────────── */
  const flowWires = useMemo(() => {
    const result = [];
    for (const node of CIRCUIT) {
      if (node.layer !== 1) continue;
      const gp = FLOW_GATE_POS[node.id];
      node.inputs.forEach((ref, i) => {
        const ip = FLOW_INPUT_POS[ref];
        const yOff = i === 0 ? -8 : 8;
        result.push({
          key: `flow-in-${ref}-${node.id}-${i}`,
          x1: ip.x + 14,
          y1: ip.y,
          x2: gp.x,
          y2: gp.y + FLOW_GATE_H / 2 + yOff,
          powered: inputs[ref] === 1,
        });
      });
    }
    for (const node of CIRCUIT) {
      if (node.layer === 1) continue;
      const gp = FLOW_GATE_POS[node.id];
      node.inputs.forEach((ref, i) => {
        const srcPos = FLOW_GATE_POS[ref];
        const yOff = node.inputs.length === 1 ? 0 : (i === 0 ? -6 : 6);
        result.push({
          key: `flow-g-${ref}-${node.id}-${i}`,
          x1: srcPos.x + FLOW_GATE_W,
          y1: srcPos.y + FLOW_GATE_H / 2,
          x2: gp.x,
          y2: gp.y + FLOW_GATE_H / 2 + yOff,
          powered: gateOutputs[ref] === 1,
        });
      });
    }
    const g7 = FLOW_GATE_POS[6];
    result.push({
      key: 'flow-out-wire',
      x1: g7.x + FLOW_GATE_W,
      y1: g7.y + FLOW_GATE_H / 2,
      x2: g7.x + FLOW_GATE_W + 60,
      y2: g7.y + FLOW_GATE_H / 2,
      powered: gateOutputs[6] === 1,
    });
    return result;
  }, [inputs, gateOutputs]);

  // ── RENDER PORTRAIT TREE MODE ─────────────────────────────────────────
  if (layoutMode === 'tree') {
    return (
      <svg
        viewBox="0 0 540 560"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto max-w-[540px] mx-auto max-h-[560px]"
      >
        <defs>
          <filter id="neon-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid background */}
        <pattern id="grid-tree" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="0.5" fill="#1E344D" opacity="0.5" />
        </pattern>
        <rect width="540" height="560" fill="url(#grid-tree)" />

        {/* Layer Guide Lines */}
        {[
          { y: 505, label: 'INPUTS (A-F)' },
          { y: 340, label: 'LAYER 1 GATES' },
          { y: 200, label: 'LAYER 2 GATES' },
          { y: 70,  label: 'LAYER 3 OUTPUT' },
        ].map((lh, i) => (
          <text
            key={i}
            x={15}
            y={lh.y}
            fill="#1E344D"
            fontSize="9"
            fontFamily="'Orbitron', sans-serif"
            fontWeight="800"
            letterSpacing="2"
          >
            {lh.label}
          </text>
        ))}

        {/* Wires */}
        {treeWires.map(w => (
          <WireTree key={w.key} {...w} />
        ))}

        {/* Bottom Inputs (A–F) */}
        {Object.entries(TREE_INPUT_POS).map(([label, pos]) => {
          const on = inputs[label] === 1;
          const reqVal = fixedInputs ? fixedInputs[label] : undefined;
          const isFixed = reqVal !== undefined;
          const fixedMet = isFixed && inputs[label] === reqVal;

          return (
            <g key={label} transform={`translate(${pos.x}, ${pos.y})`}>
              <rect
                x={-18}
                y={-14}
                width={36}
                height={28}
                rx={6}
                fill={on ? 'rgba(244,201,93,0.25)' : '#0D1B2A'}
                stroke={on ? '#F4C95D' : isFixed ? (fixedMet ? '#48C78E' : '#E89B4A') : '#1E344D'}
                strokeWidth={on || isFixed ? 2.5 : 1.5}
                style={{ transition: 'all 0.25s ease' }}
              />
              <text
                x={0}
                y={4}
                fill={on ? '#F4C95D' : isFixed ? (fixedMet ? '#48C78E' : '#E89B4A') : '#AAB7C4'}
                fontSize="14"
                fontFamily="'Orbitron', sans-serif"
                fontWeight="900"
                textAnchor="middle"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Gate Boxes (G1-G7) */}
        {CIRCUIT.map((node) => {
          const pos = TREE_GATE_POS[node.id];
          const type = gateTypes[node.id];
          const output = gateOutputs[node.id];
          const isActive = output === 1;
          const reqNodeVal = fixedNodes ? fixedNodes[node.label] : undefined;
          const isNodeFixed = reqNodeVal !== undefined;
          const nodeLockMet = isNodeFixed && output === reqNodeVal;

          return (
            <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
              {/* Main Gate Box */}
              <rect
                width={TREE_GATE_W}
                height={TREE_GATE_H}
                rx={6}
                fill={isActive ? 'rgba(244,201,93,0.14)' : '#0D1B2A'}
                stroke={isNodeFixed ? (nodeLockMet ? '#3DD6D0' : '#E89B4A') : isActive ? '#F4C95D' : '#1E344D'}
                strokeWidth={isNodeFixed || isActive ? 2.5 : 1.5}
                style={{
                  transition: 'all 0.3s ease',
                  filter: isActive
                    ? 'drop-shadow(0 0 10px rgba(244,201,93,0.4))'
                    : isNodeFixed && nodeLockMet
                      ? 'drop-shadow(0 0 8px rgba(61,214,208,0.4))'
                      : 'none',
                }}
              />

              {/* Gate Label (G1, G2...) */}
              <text
                x={6}
                y={14}
                fill="#AAB7C4"
                fontSize="9"
                fontFamily="'Orbitron', sans-serif"
                fontWeight="700"
              >
                {node.label}
              </text>

              {/* Lock Badge if compulsory node */}
              {isNodeFixed && (
                <g transform={`translate(${TREE_GATE_W - 24}, 3)`}>
                  <rect
                    x={0} y={0} width={20} height={12} rx={3}
                    fill={nodeLockMet ? 'rgba(61,214,208,0.25)' : 'rgba(232,155,74,0.25)'}
                    stroke={nodeLockMet ? '#3DD6D0' : '#E89B4A'}
                    strokeWidth={1}
                  />
                  <text
                    x={10} y={9}
                    fill={nodeLockMet ? '#3DD6D0' : '#E89B4A'}
                    fontSize="7.5"
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    🔒{reqNodeVal}
                  </text>
                </g>
              )}

              {/* Gate Type (AND, OR, XOR...) */}
              <text
                x={TREE_GATE_W / 2}
                y={28}
                fill={isActive ? '#F4C95D' : '#3DD6D0'}
                fontSize="12.5"
                fontFamily="'Orbitron', sans-serif"
                fontWeight="900"
                textAnchor="middle"
                style={{
                  textShadow: isActive ? '0 0 8px rgba(244,201,93,0.6)' : 'none',
                  transition: 'color 0.3s ease',
                }}
              >
                {type}
              </text>

              {/* Top Output LED */}
              <circle
                cx={TREE_GATE_W / 2}
                cy={4}
                r={4.5}
                fill={isActive ? '#F4C95D' : '#1B2B3E'}
                stroke={isActive ? '#F4C95D' : '#1E344D'}
                strokeWidth={1.5}
                style={{
                  transition: 'all 0.3s ease',
                  filter: isActive ? 'drop-shadow(0 0 8px #F4C95D)' : 'none',
                }}
              />
            </g>
          );
        })}

        {/* Top Crown Output Node (G7 Output) */}
        {(() => {
          const g7 = TREE_GATE_POS[6];
          const ox = g7.x + TREE_GATE_W / 2;
          const oy = g7.y - 45;
          const on = gateOutputs[6] === 1;
          return (
            <g>
              <circle
                cx={ox} cy={oy} r={24}
                fill={on ? 'rgba(72,199,142,0.22)' : 'rgba(231,111,81,0.14)'}
                stroke={on ? '#48C78E' : '#E76F51'}
                strokeWidth={2.5}
                style={{
                  transition: 'all 0.4s ease',
                  filter: on
                    ? 'drop-shadow(0 0 15px rgba(72,199,142,0.6))'
                    : 'drop-shadow(0 0 8px rgba(231,111,81,0.4))',
                }}
              />
              <text
                x={ox} y={oy + 1}
                fill={on ? '#48C78E' : '#E76F51'}
                fontSize="18"
                fontFamily="'Orbitron', sans-serif"
                fontWeight="900"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {gateOutputs[6]}
              </text>
              <text
                x={ox} y={oy + 40}
                fill="#AAB7C4"
                fontSize="9"
                fontFamily="'Orbitron', sans-serif"
                fontWeight="800"
                textAnchor="middle"
                letterSpacing="2"
              >
                SYSTEM OUTPUT
              </text>
            </g>
          );
        })()}
      </svg>
    );
  }

  // ── RENDER LANDSCAPE FLOW MODE ────────────────────────────────────────
  return (
    <svg
      viewBox="0 0 960 480"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-auto min-w-[760px] lg:min-w-full max-h-[500px]"
    >
      <defs>
        <filter id="neon-glow-flow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <pattern id="grid-flow" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="15" cy="15" r="0.5" fill="#1E344D" opacity="0.5" />
      </pattern>
      <rect width="960" height="480" fill="url(#grid-flow)" />

      {[
        { x: 250, label: 'LAYER 1' },
        { x: 510, label: 'LAYER 2' },
        { x: 770, label: 'LAYER 3 (FINAL)' },
      ].map((lh, i) => (
        <text
          key={i}
          x={lh.x}
          y={25}
          fill="#1E344D"
          fontSize="10"
          fontFamily="'Orbitron', sans-serif"
          fontWeight="800"
          letterSpacing="2"
        >
          {lh.label}
        </text>
      ))}

      {flowWires.map(w => (
        <WireFlow key={w.key} {...w} />
      ))}

      {Object.entries(FLOW_INPUT_POS).map(([label, pos]) => {
        const on = inputs[label] === 1;
        const reqVal = fixedInputs ? fixedInputs[label] : undefined;
        const isFixed = reqVal !== undefined;
        const fixedMet = isFixed && inputs[label] === reqVal;

        return (
          <g key={label} transform={`translate(${pos.x}, ${pos.y})`}>
            <rect
              x={-26} y={-15} width={40} height={30} rx={6}
              fill={on ? 'rgba(244,201,93,0.22)' : '#0D1B2A'}
              stroke={on ? '#F4C95D' : isFixed ? (fixedMet ? '#48C78E' : '#E89B4A') : '#1E344D'}
              strokeWidth={on || isFixed ? 2.5 : 1.2}
              style={{ transition: 'all 0.3s ease' }}
            />
            <text
              x={-6} y={4} fill={on ? '#F4C95D' : isFixed ? (fixedMet ? '#48C78E' : '#E89B4A') : '#AAB7C4'}
              fontSize="14" fontFamily="'Orbitron', sans-serif" fontWeight="800" textAnchor="middle"
            >
              {label}
            </text>
          </g>
        );
      })}

      {CIRCUIT.map((node) => {
        const pos = FLOW_GATE_POS[node.id];
        const type = gateTypes[node.id];
        const output = gateOutputs[node.id];
        const isActive = output === 1;
        const reqNodeVal = fixedNodes ? fixedNodes[node.label] : undefined;
        const isNodeFixed = reqNodeVal !== undefined;
        const nodeLockMet = isNodeFixed && output === reqNodeVal;

        return (
          <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
            <rect
              width={FLOW_GATE_W} height={FLOW_GATE_H} rx={7}
              fill={isActive ? 'rgba(244,201,93,0.14)' : '#0D1B2A'}
              stroke={isNodeFixed ? (nodeLockMet ? '#3DD6D0' : '#E89B4A') : isActive ? '#F4C95D' : '#1E344D'}
              strokeWidth={isNodeFixed || isActive ? 2.5 : 1.5}
              style={{
                transition: 'all 0.3s ease',
                filter: isActive
                  ? 'drop-shadow(0 0 10px rgba(244,201,93,0.4))'
                  : isNodeFixed && nodeLockMet
                    ? 'drop-shadow(0 0 8px rgba(61,214,208,0.4))'
                    : 'none',
              }}
            />
            <text x={8} y={16} fill="#AAB7C4" fontSize="10" fontFamily="'Orbitron', sans-serif" fontWeight="700">
              {node.label}
            </text>
            {isNodeFixed && (
              <g transform={`translate(${FLOW_GATE_W - 32}, 4)`}>
                <rect
                  x={0} y={0} width={22} height={13} rx={3}
                  fill={nodeLockMet ? 'rgba(61,214,208,0.25)' : 'rgba(232,155,74,0.25)'}
                  stroke={nodeLockMet ? '#3DD6D0' : '#E89B4A'}
                  strokeWidth={1}
                />
                <text
                  x={11} y={9}
                  fill={nodeLockMet ? '#3DD6D0' : '#E89B4A'}
                  fontSize="8"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  🔒{reqNodeVal}
                </text>
              </g>
            )}
            <text x={FLOW_GATE_W / 2} y={30} fill={isActive ? '#F4C95D' : '#3DD6D0'} fontSize="14" fontFamily="'Orbitron', sans-serif" fontWeight="800" textAnchor="middle">
              {type}
            </text>
            <circle cx={FLOW_GATE_W - 10} cy={FLOW_GATE_H / 2} r={5.5} fill={isActive ? '#F4C95D' : '#1B2B3E'} stroke={isActive ? '#F4C95D' : '#1E344D'} strokeWidth={1.5} />
          </g>
        );
      })}

      {(() => {
        const g7 = FLOW_GATE_POS[6];
        const ox = g7.x + FLOW_GATE_W + 60;
        const oy = g7.y + FLOW_GATE_H / 2;
        const on = gateOutputs[6] === 1;
        return (
          <g>
            <circle cx={ox} cy={oy} r={24} fill={on ? 'rgba(72,199,142,0.22)' : 'rgba(231,111,81,0.14)'} stroke={on ? '#48C78E' : '#E76F51'} strokeWidth={2.5} />
            <text x={ox} y={oy + 1} fill={on ? '#48C78E' : '#E76F51'} fontSize="18" fontFamily="'Orbitron', sans-serif" fontWeight="900" textAnchor="middle" dominantBaseline="middle">
              {gateOutputs[6]}
            </text>
            <text x={ox} y={oy + 40} fill="#AAB7C4" fontSize="9" fontFamily="'Orbitron', sans-serif" fontWeight="700" textAnchor="middle" letterSpacing="2">
              OUTPUT
            </text>
          </g>
        );
      })()}
    </svg>
  );
}
