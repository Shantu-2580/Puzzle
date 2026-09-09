import React from 'react';
import { CIRCUIT } from '../engine';

const ControlPanel = ({
  currentLevel,
  completedLevels,
  jumpedLevels = [],
  PUZZLES,
  inputs,
  _setInputs,
  levelCleared,
  puzzle,
  gateOutputs,
  fixedInputs,
  GATE_LABELS,
  resetInputs,
  randomizeInputs,
}) => {
  return (
    <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg border border-[#1E344D] bg-[#0D1B2A]">
      {/* Level Progress Tracker */}
      <div className="order-2 flex items-center gap-1.5 overflow-x-auto py-1 lg:order-none">
        {PUZZLES.map((p, idx) => {
          const isCurrent = idx === currentLevel;
          const isCleared = completedLevels.includes(idx);
          const isJumped = jumpedLevels.includes(idx);

          let badgeBg = '#152538';
          let badgeBorder = '#1E344D';
          let badgeColor = '#AAB7C4';
          let statusLabel = `LVL ${idx + 1}`;

          if (isCleared) {
            badgeBg = 'rgba(72,199,142,0.2)';
            badgeBorder = '#48C78E';
            badgeColor = '#48C78E';
            statusLabel = `✓ L${idx + 1}`;
          } else if (isJumped) {
            badgeBg = 'rgba(232,155,74,0.2)';
            badgeBorder = '#E89B4A';
            badgeColor = '#E89B4A';
            statusLabel = `⚡ L${idx + 1}`;
          } else if (isCurrent) {
            badgeBg = 'rgba(244,201,93,0.2)';
            badgeBorder = '#F4C95D';
            badgeColor = '#F4C95D';
            statusLabel = `▶ L${idx + 1}`;
          }

          return (
            <div
              key={idx}
              className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase border flex-shrink-0 transition-all"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                background: badgeBg,
                borderColor: badgeBorder,
                color: badgeColor,
                boxShadow: isCurrent ? '0 0 10px rgba(244,201,93,0.3)' : 'none',
              }}
              title={p.name}
            >
              {statusLabel}
            </div>
          );
        })}
      </div>

      {/* Level Info & Target Output */}
      <div className="order-1 flex w-full flex-wrap items-center justify-between gap-3 lg:order-none lg:w-auto lg:justify-end">
        <div className="flex w-full min-w-0 flex-col items-stretch gap-2">
          <div className="flex items-center justify-between gap-3 rounded-lg border-2 border-[#3DD6D0]/60 bg-[#07111F] px-3 py-2 sm:px-4 sm:py-2.5">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-[#AAB7C4] font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Target Output
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#3DD6D0]" style={{ fontFamily: "'Orbitron', sans-serif", textShadow: '0 0 12px rgba(61,214,208,0.5)' }}>
              {puzzle.target}
            </span>
          </div>

          <span className="text-sm sm:text-base font-bold text-[#F5F1E8]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            {puzzle.name}
          </span>
        </div>

        {/* Compulsory Node Locks (1 per layer) */}
        {puzzle.fixedNodes && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {Object.entries(puzzle.fixedNodes).map(([nodeLabel, reqVal]) => {
              const nodeIdx = CIRCUIT.find(n => n.label === nodeLabel)?.id;
              const curVal = gateOutputs && nodeIdx !== undefined ? gateOutputs[nodeIdx] : undefined;
              const ok = curVal === reqVal;
              return (
                <div
                  key={nodeLabel}
                  className="flex items-center gap-1.5 px-3 py-2 rounded border-2 text-xs sm:text-sm font-bold"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    borderColor: ok ? '#3DD6D0' : '#E89B4A',
                    background: ok ? 'rgba(61,214,208,0.15)' : 'rgba(232,155,74,0.15)',
                    color: ok ? '#3DD6D0' : '#E89B4A',
                  }}
                >
                  <span>LOCK {nodeLabel}: {reqVal}</span>
                  <span>{ok ? '✓' : `(${curVal})`}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Fixed Input Constraints */}
        {puzzle.fixedInputs && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {Object.entries(puzzle.fixedInputs).map(([inputKey, reqVal]) => {
              const curVal = inputs ? inputs[inputKey] : undefined;
              const ok = curVal === reqVal;
              return (
                <div
                  key={inputKey}
                  className="flex items-center gap-1.5 px-3 py-2 rounded border-2 text-xs sm:text-sm font-bold"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    borderColor: ok ? '#48C78E' : '#E89B4A',
                    background: ok ? 'rgba(72,199,142,0.15)' : 'rgba(232,155,74,0.15)',
                    color: ok ? '#48C78E' : '#E89B4A',
                  }}
                >
                  <span>REQ {inputKey}: {reqVal}</span>
                  <span>{ok ? '✓' : `(${curVal})`}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Control Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={resetInputs}
            disabled={levelCleared}
            className="px-3.5 py-1.5 sm:py-2 rounded border text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#F5F1E8] hover:border-[#5B8DEF] active:bg-[#1E344D]/40 transition-colors"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              borderColor: '#1E344D',
              color: '#AAB7C4',
              background: 'transparent',
            }}
          >
            Reset
          </button>
          <button
            onClick={randomizeInputs}
            disabled={levelCleared}
            className="px-3.5 py-1.5 sm:py-2 rounded border text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#F5F1E8] hover:border-[#5B8DEF] active:bg-[#1E344D]/40 transition-colors"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              borderColor: '#1E344D',
              color: '#AAB7C4',
              background: 'transparent',
            }}
          >
            Random
          </button>
        </div>
      </div>
    </section>
  );
};

export default ControlPanel;