import React from 'react';

const ControlPanel = ({
  currentLevel,
  completedLevels,
  jumpedLevels = [],
  onSelectLevel,
  SETS,
  selectedSet,
  inputs,
  levelCleared,
  puzzle,
  gateOutputs,
  resetInputs,
  randomizeInputs,
}) => {
  const currentSet = selectedSet && SETS[selectedSet] ? SETS[selectedSet] : null;
  const SET_LEVELS = currentSet ? currentSet.levels : [];

  return (
    <section className="flex flex-col gap-3 px-1 sm:px-2 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="min-w-0 flex-1 truncate text-[15px] sm:text-lg font-medium text-[#ede6d6] font-display"
          title={puzzle?.name}
        >
          {puzzle?.name}
        </span>

        <div className="flex items-baseline gap-2 px-3 py-1">
          <span className="text-[10px] text-[#9aa6b4] font-ui">Target</span>
          <span className="text-2xl sm:text-3xl font-semibold text-[#6ec8c4] font-data leading-none">
            {puzzle?.target}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1">
          {SET_LEVELS.map((level, idx) => (
            <LevelTab
              key={idx}
              idx={idx}
              currentLevel={currentLevel}
              completedLevels={completedLevels}
              jumpedLevels={jumpedLevels}
              onSelectLevel={onSelectLevel}
              title={level.name}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          {SET_LEVELS.map((level, idx) => (
            <LevelTab
              key={idx}
              idx={idx}
              currentLevel={currentLevel}
              completedLevels={completedLevels}
              jumpedLevels={jumpedLevels}
              onSelectLevel={onSelectLevel}
              title={level.name}
              className="sm:hidden"
            />
          ))}

          {puzzle?.fixedNodes && Object.entries(puzzle.fixedNodes).map(([nodeLabel, reqVal]) => {
            const nodeIdx = puzzle?.circuit?.find(n => n.label === nodeLabel)?.id;
            const curVal = gateOutputs && nodeIdx !== undefined ? gateOutputs[nodeIdx] : undefined;
            const ok = curVal === reqVal;
            return (
              <div
                key={nodeLabel}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap font-data"
                style={{
                  border: `1px solid ${ok ? 'rgba(110,200,196,0.45)' : 'rgba(224,138,60,0.45)'}`,
                  background: ok ? 'rgba(110,200,196,0.1)' : 'rgba(224,138,60,0.1)',
                  color: ok ? '#6ec8c4' : '#e08a3c',
                }}
              >
                {nodeLabel} {reqVal}{ok ? '' : ` · ${curVal}`}
              </div>
            );
          })}

          {puzzle?.fixedInputs && Object.entries(puzzle.fixedInputs).map(([inputKey, reqVal]) => {
            const curVal = inputs ? inputs[inputKey] : undefined;
            const ok = curVal === reqVal;
            return (
              <div
                key={inputKey}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap font-data"
                style={{
                  border: `1px solid ${ok ? 'rgba(95,191,154,0.45)' : 'rgba(224,138,60,0.45)'}`,
                  background: ok ? 'rgba(95,191,154,0.1)' : 'rgba(224,138,60,0.1)',
                  color: ok ? '#5fbf9a' : '#e08a3c',
                }}
              >
                {inputKey}={reqVal}{ok ? '' : ` · ${curVal}`}
              </div>
            );
          })}
        </div>

        <button
          onClick={resetInputs}
          disabled={levelCleared}
          className="px-3 py-1.5 text-[12px] font-medium text-[#9aa6b4] hover:text-[#ede6d6] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-ui"
        >
          Reset
        </button>
        <button
          onClick={randomizeInputs}
          disabled={levelCleared}
          className="px-3 py-1.5 text-[12px] font-medium text-[#9aa6b4] hover:text-[#ede6d6] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-ui"
        >
          <span className="sm:hidden">Rand</span>
          <span className="hidden sm:inline">Random</span>
        </button>
      </div>
    </section>
  );
};

function LevelTab({ idx, currentLevel, completedLevels, jumpedLevels, onSelectLevel, title, className = '' }) {
  const isCurrent = idx === currentLevel - 1;
  const isCleared = completedLevels.includes(idx);
  const isJumped = jumpedLevels.includes(idx);

  let color = '#9aa6b4';
  let border = 'transparent';
  let bg = 'transparent';
  let label = `L${idx + 1}`;

  if (isCleared) {
    color = '#5fbf9a';
    label = `L${idx + 1}`;
  } else if (isJumped) {
    color = '#e08a3c';
  } else if (isCurrent) {
    color = '#d4b483';
    border = 'rgba(212,180,131,0.45)';
    bg = 'rgba(212,180,131,0.1)';
  }

  return (
    <button
      type="button"
      onClick={() => onSelectLevel?.(idx)}
      className={`px-3 py-1 rounded-full text-[12px] font-medium flex-shrink-0 font-ui ${className}`}
      style={{ color, background: bg, border: `1px solid ${border}` }}
      title={title}
    >
      {label}
    </button>
  );
}

export default ControlPanel;
