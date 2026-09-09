import React, { useMemo } from 'react';

const INPUT_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const TREE = { width: 540, height: 680, gateWidth: 80, gateHeight: 42 };
const FLOW = { width: 1080, height: 520, gateWidth: 104, gateHeight: 46 };

function distribute(count, start, end) {
  if (count === 1) return [(start + end) / 2];
  return Array.from({ length: count }, (_, index) => start + ((end - start) * index) / (count - 1));
}

function buildPositions(circuit, mode) {
  const layout = mode === 'tree' ? TREE : FLOW;
  const inputPositions = Object.fromEntries(INPUT_LABELS.map((label, index) => [
    label,
    mode === 'tree' ? { x: 30 + index * 70, y: 600 } : { x: 40, y: 40 + index * 60 },
  ]));
  const positions = {};
  const layers = [...new Set(circuit.map(node => node.layer))].sort((a, b) => a - b);

  layers.forEach(layer => {
    const nodes = circuit.filter(node => node.layer === layer);
    const axis = mode === 'tree'
      ? distribute(nodes.length, 30, layout.width - layout.gateWidth - 30)
      : distribute(nodes.length, 48, layout.height - layout.gateHeight - 26);
    const fixedAxis = mode === 'tree'
      ? (layer === 4 ? 65 : 600 - layer * 145)
      : (layer === 4 ? 900 : 120 + layer * 180);

    nodes.forEach((node, index) => {
      positions[node.id] = mode === 'tree'
        ? { x: axis[index], y: fixedAxis }
        : { x: fixedAxis, y: axis[index] };
    });
  });

  return { positions, inputPositions, layers };
}

function Wire({ mode, x1, y1, x2, y2, powered }) {
  const middle = mode === 'tree' ? (y1 + y2) / 2 : (x1 + x2) / 2;
  const d = mode === 'tree'
    ? `M${x1},${y1} C${x1},${middle} ${x2},${middle} ${x2},${y2}`
    : `M${x1},${y1} C${middle},${y1} ${middle},${y2} ${x2},${y2}`;
  return <path d={d} fill="none" stroke={powered ? '#F4C95D' : '#1E344D'} strokeWidth={powered ? 3.5 : 2.2} strokeLinecap="round" style={{ transition: 'stroke 0.3s ease, filter 0.3s ease', filter: powered ? 'drop-shadow(0 0 6px #F4C95D)' : 'none' }} />;
}

function InputNode({ label, position, value, fixedValue, mode }) {
  const on = value === 1;
  const locked = fixedValue !== undefined;
  const lockMet = locked && value === fixedValue;
  const offsetX = mode === 'tree' ? -18 : -26;
  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      <rect x={offsetX} y={-14} width={mode === 'tree' ? 36 : 40} height={28} rx={6} fill={on ? 'rgba(244,201,93,0.25)' : '#0D1B2A'} stroke={on ? '#F4C95D' : locked ? (lockMet ? '#48C78E' : '#E89B4A') : '#1E344D'} strokeWidth={on || locked ? 2.5 : 1.5} />
      <text x={mode === 'tree' ? 0 : -6} y={4} fill={on ? '#F4C95D' : locked ? (lockMet ? '#48C78E' : '#E89B4A') : '#AAB7C4'} fontSize="14" fontFamily="'Orbitron', sans-serif" fontWeight="900" textAnchor="middle">{label}</text>
    </g>
  );
}

function GateNode({ node, position, type, output, fixedValue, mode }) {
  const { gateWidth, gateHeight } = mode === 'tree' ? TREE : FLOW;
  const active = output === 1;
  const locked = fixedValue !== undefined;
  const lockMet = locked && output === fixedValue;
  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      <rect width={gateWidth} height={gateHeight} rx={mode === 'tree' ? 6 : 7} fill={active ? 'rgba(244,201,93,0.14)' : '#0D1B2A'} stroke={locked ? (lockMet ? '#3DD6D0' : '#E89B4A') : active ? '#F4C95D' : '#1E344D'} strokeWidth={locked || active ? 2.5 : 1.5} style={{ transition: 'all 0.3s ease', filter: active ? 'drop-shadow(0 0 10px rgba(244,201,93,0.4))' : 'none' }} />
      <text x={mode === 'tree' ? 6 : 8} y={mode === 'tree' ? 14 : 16} fill="#AAB7C4" fontSize={mode === 'tree' ? 9 : 10} fontFamily="'Orbitron', sans-serif" fontWeight="700">{node.label}</text>
      {locked && <g transform={`translate(${gateWidth - (mode === 'tree' ? 24 : 32)}, 3)`}>
        <rect width={mode === 'tree' ? 20 : 22} height={mode === 'tree' ? 12 : 13} rx={3} fill={lockMet ? 'rgba(61,214,208,0.25)' : 'rgba(232,155,74,0.25)'} stroke={lockMet ? '#3DD6D0' : '#E89B4A'} />
        <text x={mode === 'tree' ? 10 : 11} y={9} fill={lockMet ? '#3DD6D0' : '#E89B4A'} fontSize={mode === 'tree' ? 7.5 : 8} fontFamily="'JetBrains Mono', monospace" fontWeight="800" textAnchor="middle">🔒{fixedValue}</text>
      </g>}
      <text x={gateWidth / 2} y={mode === 'tree' ? 28 : 30} fill={active ? '#F4C95D' : '#3DD6D0'} fontSize={mode === 'tree' ? 12.5 : 14} fontFamily="'Orbitron', sans-serif" fontWeight="900" textAnchor="middle">{type}</text>
      <circle cx={mode === 'tree' ? gateWidth / 2 : gateWidth - 10} cy={mode === 'tree' ? 4 : gateHeight / 2} r={mode === 'tree' ? 4.5 : 5.5} fill={active ? '#F4C95D' : '#1B2B3E'} stroke={active ? '#F4C95D' : '#1E344D'} strokeWidth={1.5} />
    </g>
  );
}

export default function CircuitSVG({ inputs, gateOutputs, gateTypes, fixedInputs, fixedNodes, circuit = [], layoutMode = 'tree' }) {
  const mode = layoutMode === 'tree' ? 'tree' : 'flow';
  const layout = mode === 'tree' ? TREE : FLOW;
  const { positions, inputPositions, layers } = useMemo(() => buildPositions(circuit, mode), [circuit, mode]);
  const wires = useMemo(() => circuit.flatMap(node => node.inputs.map((source, index) => {
    const target = positions[node.id];
    const inputOffset = node.inputs.length === 1 ? 0 : (index === 0 ? -10 : 10);
    if (typeof source === 'string') {
      const input = inputPositions[source];
      return mode === 'tree'
        ? { key: `${source}-${node.id}-${index}`, x1: input.x, y1: input.y - 14, x2: target.x + layout.gateWidth / 2 + inputOffset, y2: target.y + layout.gateHeight, powered: inputs[source] === 1 }
        : { key: `${source}-${node.id}-${index}`, x1: input.x + 14, y1: input.y, x2: target.x, y2: target.y + layout.gateHeight / 2 + inputOffset, powered: inputs[source] === 1 };
    }
    const sourcePosition = positions[source];
    return mode === 'tree'
      ? { key: `G${source + 1}-${node.id}-${index}`, x1: sourcePosition.x + layout.gateWidth / 2, y1: sourcePosition.y, x2: target.x + layout.gateWidth / 2 + inputOffset, y2: target.y + layout.gateHeight, powered: gateOutputs[source] === 1 }
      : { key: `G${source + 1}-${node.id}-${index}`, x1: sourcePosition.x + layout.gateWidth, y1: sourcePosition.y + layout.gateHeight / 2, x2: target.x, y2: target.y + layout.gateHeight / 2 + inputOffset, powered: gateOutputs[source] === 1 };
  })), [circuit, positions, inputPositions, mode, layout, inputs, gateOutputs]);

  const g8 = circuit.find(node => node.id === 7);
  const outputPosition = g8 ? positions[g8.id] : null;
  const outputWire = outputPosition && (mode === 'tree'
    ? { x1: outputPosition.x + layout.gateWidth / 2, y1: outputPosition.y, x2: outputPosition.x + layout.gateWidth / 2, y2: outputPosition.y - 30 }
    : { x1: outputPosition.x + layout.gateWidth, y1: outputPosition.y + layout.gateHeight / 2, x2: outputPosition.x + layout.gateWidth + 60, y2: outputPosition.y + layout.gateHeight / 2 });
  const outputCenter = outputPosition && (mode === 'tree'
    ? { x: outputPosition.x + layout.gateWidth / 2, y: outputPosition.y - 45 }
    : { x: outputPosition.x + layout.gateWidth + 60, y: outputPosition.y + layout.gateHeight / 2 });

  return (
    <svg viewBox={`0 0 ${layout.width} ${layout.height}`} preserveAspectRatio="xMidYMid meet" className={mode === 'tree' ? 'w-full h-full max-w-[540px] mx-auto' : 'w-full h-full min-w-[760px] lg:min-w-full max-h-full'}>
      <pattern id={`grid-${mode}`} width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="0.5" fill="#1E344D" opacity="0.5" /></pattern>
      <rect width={layout.width} height={layout.height} fill={`url(#grid-${mode})`} />
      {mode === 'tree' ? <>
        <text x={15} y={625} fill="#1E344D" fontSize="9" fontFamily="'Orbitron', sans-serif" fontWeight="800" letterSpacing="2">INPUTS (A-H)</text>
        {layers.map(layer => <text key={layer} x={15} y={(layer === 4 ? 65 : 600 - layer * 145) - 12} fill="#1E344D" fontSize="9" fontFamily="'Orbitron', sans-serif" fontWeight="800" letterSpacing="2">{layer === 4 ? 'G8 OUTPUT STAGE' : `LAYER ${layer} GATES`}</text>)}
      </> : layers.map(layer => <text key={layer} x={layer === 4 ? 900 : 120 + layer * 180} y={25} fill="#1E344D" fontSize="10" fontFamily="'Orbitron', sans-serif" fontWeight="800" letterSpacing="2">{layer === 4 ? 'G8 OUTPUT STAGE' : `LAYER ${layer}`}</text>)}
      {wires.map(({ key, ...wire }) => <Wire key={key} mode={mode} {...wire} />)}
      {outputWire && <Wire mode={mode} {...outputWire} powered={gateOutputs[7] === 1} />}
      {INPUT_LABELS.map(label => <InputNode key={label} label={label} position={inputPositions[label]} value={inputs[label]} fixedValue={fixedInputs?.[label]} mode={mode} />)}
      {circuit.map(node => <GateNode key={node.id} node={node} position={positions[node.id]} type={gateTypes[node.id]} output={gateOutputs[node.id]} fixedValue={fixedNodes?.[node.label]} mode={mode} />)}
      {outputCenter && <g>
        <circle cx={outputCenter.x} cy={outputCenter.y} r={24} fill={gateOutputs[7] === 1 ? 'rgba(72,199,142,0.22)' : 'rgba(231,111,81,0.14)'} stroke={gateOutputs[7] === 1 ? '#48C78E' : '#E76F51'} strokeWidth={2.5} />
        <text x={outputCenter.x} y={outputCenter.y + 1} fill={gateOutputs[7] === 1 ? '#48C78E' : '#E76F51'} fontSize="18" fontFamily="'Orbitron', sans-serif" fontWeight="900" textAnchor="middle" dominantBaseline="middle">{gateOutputs[7]}</text>
        <text x={outputCenter.x} y={outputCenter.y + 40} fill="#AAB7C4" fontSize="9" fontFamily="'Orbitron', sans-serif" fontWeight="800" textAnchor="middle" letterSpacing="2">SYSTEM OUTPUT</text>
      </g>}
    </svg>
  );
}
