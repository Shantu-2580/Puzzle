import React, { useMemo } from 'react';

const INPUT_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const TREE = { width: 540, height: 680, gateWidth: 86, gateHeight: 46 };
const FLOW = { width: 1080, height: 520, gateWidth: 112, gateHeight: 50 };
const FONT_UI = "'Outfit', sans-serif";
const FONT_DATA = "'IBM Plex Mono', monospace";

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
  return (
    <path
      d={d}
      fill="none"
      stroke={powered ? 'url(#wireOn)' : '#243044'}
      strokeWidth={powered ? 3.2 : 1.6}
      strokeLinecap="round"
      style={{
        transition: 'stroke 0.35s ease, stroke-width 0.35s ease, filter 0.35s ease',
        filter: powered ? 'drop-shadow(0 0 5px rgba(212,180,131,0.7))' : 'none',
      }}
    />
  );
}

function InputNode({ label, position, value, fixedValue, mode }) {
  const on = value === 1;
  const locked = fixedValue !== undefined;
  const lockMet = locked && value === fixedValue;
  const offsetX = mode === 'tree' ? -18 : -26;
  const stroke = on ? '#d4b483' : locked ? (lockMet ? '#5fbf9a' : '#e08a3c') : '#2a3648';
  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      <rect
        x={offsetX}
        y={-14}
        width={mode === 'tree' ? 36 : 42}
        height={28}
        rx={4}
        fill={on ? 'rgba(212,180,131,0.18)' : '#10151f'}
        stroke={stroke}
        strokeWidth={on || locked ? 1.8 : 1.2}
      />
      <text
        x={mode === 'tree' ? 0 : -5}
        y={5}
        fill={on ? '#d4b483' : locked ? (lockMet ? '#5fbf9a' : '#e08a3c') : '#9aa6b4'}
        fontSize="13"
        fontFamily={FONT_UI}
        fontWeight="600"
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
}

function GateNode({ node, position, type, output, fixedValue, mode }) {
  const { gateWidth, gateHeight } = mode === 'tree' ? TREE : FLOW;
  const active = output === 1;
  const locked = fixedValue !== undefined;
  const lockMet = locked && output === fixedValue;
  const stroke = locked ? (lockMet ? '#6ec8c4' : '#e08a3c') : active ? '#d4b483' : '#2a3648';
  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      <rect
        width={gateWidth}
        height={gateHeight}
        rx={8}
        fill={active ? 'rgba(212,180,131,0.12)' : '#10151f'}
        stroke={stroke}
        strokeWidth={locked || active ? 1.8 : 1.2}
        style={{
          transition: 'fill 0.3s ease, stroke 0.3s ease, filter 0.3s ease',
          filter: active ? 'drop-shadow(0 0 10px rgba(212,180,131,0.28))' : 'none',
        }}
      />
      <text x={10} y={16} fill="#9aa6b4" fontSize="11" fontFamily={FONT_UI} fontWeight="500">
        {node.label}
      </text>
      {locked && (
        <g transform={`translate(${gateWidth - 28}, 6)`}>
          <rect width={20} height={12} rx={6} fill={lockMet ? 'rgba(110,200,196,0.2)' : 'rgba(224,138,60,0.2)'} stroke={lockMet ? '#6ec8c4' : '#e08a3c'} />
          <text x={10} y={10} fill={lockMet ? '#6ec8c4' : '#e08a3c'} fontSize="8" fontFamily={FONT_DATA} fontWeight="600" textAnchor="middle">
            {fixedValue}
          </text>
        </g>
      )}
      <text
        x={gateWidth / 2}
        y={mode === 'tree' ? 32 : 34}
        fill={active ? '#d4b483' : '#6ec8c4'}
        fontSize={mode === 'tree' ? 13 : 14}
        fontFamily={FONT_UI}
        fontWeight="600"
        textAnchor="middle"
      >
        {type}
      </text>
      <circle
        cx={mode === 'tree' ? gateWidth / 2 : gateWidth - 10}
        cy={mode === 'tree' ? 5 : gateHeight / 2}
        r={4.5}
        fill={active ? '#d4b483' : '#243044'}
        stroke={active ? '#d4b483' : '#2a3648'}
      />
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
      <defs>
        <linearGradient id="wireOn" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e8d3a8" />
          <stop offset="100%" stopColor="#d4b483" />
        </linearGradient>
      </defs>
      {mode === 'tree' ? (
        <>
          <text x={15} y={625} fill="#3a4658" fontSize="10" fontFamily={FONT_UI} fontWeight="500">Inputs</text>
          {layers.map(layer => (
            <text key={layer} x={15} y={(layer === 4 ? 65 : 600 - layer * 145) - 12} fill="#3a4658" fontSize="10" fontFamily={FONT_UI} fontWeight="500">
              {layer === 4 ? 'Output' : `Layer ${layer}`}
            </text>
          ))}
        </>
      ) : layers.map(layer => (
        <text key={layer} x={layer === 4 ? 900 : 120 + layer * 180} y={24} fill="#3a4658" fontSize="11" fontFamily={FONT_UI} fontWeight="500">
          {layer === 4 ? 'Output' : `Layer ${layer}`}
        </text>
      ))}
      {wires.map(({ key, ...wire }) => <Wire key={key} mode={mode} {...wire} />)}
      {outputWire && <Wire mode={mode} {...outputWire} powered={gateOutputs[7] === 1} />}
      {INPUT_LABELS.map(label => <InputNode key={label} label={label} position={inputPositions[label]} value={inputs[label]} fixedValue={fixedInputs?.[label]} mode={mode} />)}
      {circuit.map(node => <GateNode key={node.id} node={node} position={positions[node.id]} type={gateTypes[node.id]} output={gateOutputs[node.id]} fixedValue={fixedNodes?.[node.label]} mode={mode} />)}
      {outputCenter && (
        <g>
          <circle
            cx={outputCenter.x}
            cy={outputCenter.y}
            r={22}
            fill={gateOutputs[7] === 1 ? 'rgba(95,191,154,0.16)' : 'rgba(217,106,85,0.12)'}
            stroke={gateOutputs[7] === 1 ? '#5fbf9a' : '#d96a55'}
            strokeWidth={1.8}
          />
          <text
            x={outputCenter.x}
            y={outputCenter.y + 1}
            fill={gateOutputs[7] === 1 ? '#5fbf9a' : '#d96a55'}
            fontSize="16"
            fontFamily={FONT_DATA}
            fontWeight="600"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {gateOutputs[7]}
          </text>
          <text x={outputCenter.x} y={outputCenter.y + 38} fill="#9aa6b4" fontSize="10" fontFamily={FONT_UI} fontWeight="500" textAnchor="middle">
            Output
          </text>
        </g>
      )}
    </svg>
  );
}
