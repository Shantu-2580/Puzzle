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
      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
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
      <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm font-bold text-[#F5F1E8]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            {puzzle.name}
          </span>

          <div className="flex items-center gap-1.5 bg-[#07111F] border border-[#1E344D] px-2.5 py-1 rounded">
            <span className="text-[9px] uppercase tracking-wider text-[#AAB7C4]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Target:
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#3DD6D0]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {puzzle.target}
            </span>
          </div>
        </div>

        {/* Compulsory Node Locks (1 per layer) */}
        {puzzle.fixedNodes && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.entries(puzzle.fixedNodes).map(([nodeLabel, reqVal]) => {
              const nodeIdx = CIRCUIT.find(n => n.label === nodeLabel)?.id;
              const curVal = gateOutputs && nodeIdx !== undefined ? gateOutputs[nodeIdx] : undefined;
              const ok = curVal === reqVal;
              return (
                <div
                  key={nodeLabel}
                  className="flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-bold"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    borderColor: ok ? '#3DD6D0' : '#E89B4A',
                    background: ok ? 'rgba(61,214,208,0.15)' : 'rgba(232,155,74,0.15)',
                    color: ok ? '#3DD6D0' : '#E89B4A',
                  }}
                >
                  <span>LOCK {nodeLabel}:{reqVal}</span>
                  <span>{ok ? '✓' : `(${curVal})`}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Fixed Input Constraints */}
        {puzzle.fixedInputs && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.entries(puzzle.fixedInputs).map(([inputKey, reqVal]) => {
              const curVal = inputs ? inputs[inputKey] : undefined;
              const ok = curVal === reqVal;
              return (
                <div
                  key={inputKey}
                  className="flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-bold"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    borderColor: ok ? '#48C78E' : '#E89B4A',
                    background: ok ? 'rgba(72,199,142,0.15)' : 'rgba(232,155,74,0.15)',
                    color: ok ? '#48C78E' : '#E89B4A',
                  }}
                >
                  <span>REQ {inputKey}:{reqVal}</span>
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