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
    <section className="flex flex-col gap-1.5 sm:gap-3 p-1.5 sm:p-3 rounded-lg border border-[#1E344D] bg-[#0D1B2A] flex-shrink-0">
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className="min-w-0 flex-1 truncate text-[11px] sm:text-base font-bold text-[#F5F1E8]"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
          title={puzzle?.name}
        >
          {puzzle?.name}
        </span>

        <div className="flex items-center gap-1.5 rounded border border-[#3DD6D0]/60 bg-[#07111F] px-2 py-0.5 sm:px-4 sm:py-2">
          <span className="text-[8px] sm:text-xs uppercase tracking-wider text-[#AAB7C4] font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            TGT
          </span>
          <span className="text-base sm:text-3xl font-black text-[#3DD6D0]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            {puzzle?.target}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
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

      <div className="flex items-center gap-1.5 min-w-0">
        <div className="flex flex-1 items-center gap-1 overflow-x-auto">
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
                className="flex items-center gap-1 px-1.5 py-0.5 sm:px-3 sm:py-2 rounded border text-[9px] sm:text-sm font-bold whitespace-nowrap"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  borderColor: ok ? '#3DD6D0' : '#E89B4A',
                  background: ok ? 'rgba(61,214,208,0.15)' : 'rgba(232,155,74,0.15)',
                  color: ok ? '#3DD6D0' : '#E89B4A',
                }}
              >
                {nodeLabel}:{reqVal}{ok ? ' ✓' : ` (${curVal})`}
              </div>
            );
          })}

          {puzzle?.fixedInputs && Object.entries(puzzle.fixedInputs).map(([inputKey, reqVal]) => {
            const curVal = inputs ? inputs[inputKey] : undefined;
            const ok = curVal === reqVal;
            return (
              <div
                key={inputKey}
                className="flex items-center gap-1 px-1.5 py-0.5 sm:px-3 sm:py-2 rounded border text-[9px] sm:text-sm font-bold whitespace-nowrap"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  borderColor: ok ? '#48C78E' : '#E89B4A',
                  background: ok ? 'rgba(72,199,142,0.15)' : 'rgba(232,155,74,0.15)',
                  color: ok ? '#48C78E' : '#E89B4A',
                }}
              >
                {inputKey}={reqVal}{ok ? ' ✓' : ` (${curVal})`}
              </div>
            );
          })}
        </div>

        <button
          onClick={resetInputs}
          disabled={levelCleared}
          className="px-2 py-1 sm:px-3.5 sm:py-2 rounded border text-[10px] sm:text-xs font-bold uppercase tracking-wide cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#F5F1E8] hover:border-[#5B8DEF] active:bg-[#1E344D]/40 transition-colors"
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
          className="px-2 py-1 sm:px-3.5 sm:py-2 rounded border text-[10px] sm:text-xs font-bold uppercase tracking-wide cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#F5F1E8] hover:border-[#5B8DEF] active:bg-[#1E344D]/40 transition-colors"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            borderColor: '#1E344D',
            color: '#AAB7C4',
            background: 'transparent',
          }}
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

  let badgeBg = '#152538';
  let badgeBorder = '#1E344D';
  let badgeColor = '#AAB7C4';
  let statusLabel = `L${idx + 1}`;

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
    <button
      type="button"
      onClick={() => onSelectLevel?.(idx)}
      className={`px-2 py-0.5 sm:px-3 sm:py-1.5 rounded text-[10px] sm:text-[11px] font-bold tracking-wide uppercase border flex-shrink-0 transition-all ${className}`}
      style={{
        fontFamily: "'Orbitron', sans-serif",
        background: badgeBg,
        borderColor: badgeBorder,
        color: badgeColor,
        boxShadow: isCurrent ? '0 0 10px rgba(244,201,93,0.3)' : 'none',
      }}
      title={title}
    >
      {statusLabel}
    </button>
  );
}

export default ControlPanel;
