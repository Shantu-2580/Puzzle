import React from 'react';
import CircuitSVG from '../CircuitSVG';

const CircuitDisplay = ({
  inputs,
  gateOutputs,
  gateTypes,
  fixedInputs,
  fixedNodes,
  layoutMode,
  setLayoutMode,
}) => {
  return (
    <section className="flex-1 min-h-[320px] sm:min-h-[380px] p-3 sm:p-4 rounded-lg border border-[#1E344D] bg-[#07111F] overflow-auto custom-scrollbar relative">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2
            className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-bold text-[#AAB7C4]"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            Circuit Schematic
          </h2>
          <span className="text-[9px] px-2 py-0.5 rounded bg-[#F4C95D]/10 text-[#F4C95D] border border-[#F4C95D]/30 font-mono">
            {layoutMode === 'tree' ? '🌲 PORTRAIT TREE (Bottom → Top)' : '➡️ FLOW (Left → Right)'}
          </span>
        </div>

        {/* Layout Toggle Buttons */}
        <div className="flex items-center gap-1 bg-[#0D1B2A] p-1 rounded-lg border border-[#1E344D]">
          <button
            onClick={() => setLayoutMode('tree')}
            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
              layoutMode === 'tree'
                ? 'bg-[#F4C95D]/20 text-[#F4C95D] border border-[#F4C95D]'
                : 'text-[#AAB7C4] hover:text-[#F5F1E8]'
            }`}
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            🌲 Tree
          </button>
          <button
            onClick={() => setLayoutMode('flow')}
            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
              layoutMode === 'flow'
                ? 'bg-[#3DD6D0]/20 text-[#3DD6D0] border border-[#3DD6D0]'
                : 'text-[#AAB7C4] hover:text-[#F5F1E8]'
            }`}
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            ➡️ Flow
          </button>
        </div>
      </div>

      <CircuitSVG
        inputs={inputs}
        gateOutputs={gateOutputs}
        gateTypes={gateTypes}
        fixedInputs={fixedInputs}
        fixedNodes={fixedNodes}
        layoutMode={layoutMode}
      />
    </section>
  );
};

export default CircuitDisplay;