import React from 'react';
import CircuitSVG from '../CircuitSVG';

const CircuitDisplay = ({
  inputs,
  gateOutputs,
  gateTypes,
  fixedInputs,
  fixedNodes,
  circuit,
  layoutMode,
  setLayoutMode,
}) => {
  return (
    <section className="min-h-0 flex-1 overflow-hidden relative px-1 sm:px-2 flex flex-col">
      <div className="hidden md:flex items-center justify-between mb-2 flex-shrink-0">
        <p className="text-[12px] text-[#9aa6b4] font-ui">Schematic</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLayoutMode('tree')}
            className={`px-3 py-1 rounded-full text-[12px] font-ui ${
              layoutMode === 'tree' ? 'text-[#d4b483] bg-[#d4b483]/10' : 'text-[#9aa6b4] hover:text-[#ede6d6]'
            }`}
          >
            Tree
          </button>
          <button
            onClick={() => setLayoutMode('flow')}
            className={`px-3 py-1 rounded-full text-[12px] font-ui ${
              layoutMode === 'flow' ? 'text-[#6ec8c4] bg-[#6ec8c4]/10' : 'text-[#9aa6b4] hover:text-[#ede6d6]'
            }`}
          >
            Flow
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 rounded-xl hairline overflow-hidden">
        <CircuitSVG
          inputs={inputs}
          gateOutputs={gateOutputs}
          gateTypes={gateTypes}
          fixedInputs={fixedInputs}
          fixedNodes={fixedNodes}
          circuit={circuit}
          layoutMode={layoutMode}
        />
      </div>
    </section>
  );
};

export default CircuitDisplay;
