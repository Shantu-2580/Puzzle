import React from 'react';
import { formatTime } from '../engine';

const GameHeader = ({
  currentLevel,
  TOTAL_LEVELS,
  levelCleared,
  isTimerStarted,
  elapsedMs,
  totalMs,
  selectedSet,
}) => {
  const statusColor = levelCleared ? '#5fbf9a' : isTimerStarted ? '#6ec8c4' : '#e08a3c';

  return (
    <header className="relative z-30 flex items-center justify-between gap-4 px-4 sm:px-8 py-3 sm:py-4 flex-shrink-0 select-none">
      <div className="flex items-baseline gap-4 min-w-0">
        <span
          className="hidden sm:inline-block w-1.5 h-1.5 rounded-full self-center"
          style={{ background: statusColor, boxShadow: `0 0 10px ${statusColor}` }}
        />
        <h1 className="hidden sm:block text-[1.35rem] font-semibold tracking-[0.18em] text-[#d4b483] font-display">
          The Minotaur's Gates
        </h1>
        <span className="text-[13px] text-[#9aa6b4] font-ui font-medium truncate">
          {selectedSet ? (
            <>
              Set {selectedSet}
              <span className="text-[#ede6d6]/50 font-data text-[12px] ml-2">
                {currentLevel}/{TOTAL_LEVELS}
              </span>
            </>
          ) : (
            'Choose a gate'
          )}
        </span>
      </div>

      <div className="flex items-baseline gap-6 flex-shrink-0 font-data">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] text-[#9aa6b4] font-ui tracking-wide">Level</span>
          <span className={`text-sm tabular-nums ${isTimerStarted ? 'text-[#6ec8c4]' : 'text-[#e08a3c]'}`}>
            {formatTime(elapsedMs)}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] text-[#9aa6b4] font-ui tracking-wide">Total</span>
          <span className="text-sm tabular-nums text-[#d4b483]">{formatTime(totalMs)}</span>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
