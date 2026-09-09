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
  const statusColor = levelCleared ? '#48C78E' : isTimerStarted ? '#3DD6D0' : '#E89B4A';

  return (
    <header className="border-b border-[#1E344D] px-2 sm:px-6 py-1.5 sm:py-3 flex items-center justify-between gap-2 flex-shrink-0 select-none bg-[#07111F]/90 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
          style={{
            background: statusColor,
            boxShadow: `0 0 8px ${statusColor}`,
            animation: 'pulse-neon 2s ease-in-out infinite',
          }}
        />
        <h1
          className="hidden sm:block text-lg md:text-xl font-bold tracking-[0.15em] uppercase"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            color: '#F4C95D',
            textShadow: '0 0 10px rgba(244,201,93,0.5), 0 0 30px rgba(244,201,93,0.2)',
          }}
        >
          The Minotaur's Gates
        </h1>
        <span
          className="text-[11px] sm:text-[11px] tracking-wide uppercase font-bold truncate"
          style={{ fontFamily: "'Orbitron', sans-serif", color: '#F4C95D' }}
        >
          {selectedSet ? `Set ${selectedSet}` : 'Select a Set'}
          {selectedSet ? (
            <span className="text-[#AAB7C4] font-semibold tracking-normal"> [{currentLevel}/{TOTAL_LEVELS}]</span>
          ) : null}
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-4 flex-shrink-0">
        <div className="flex items-center gap-1 sm:gap-1.5 bg-[#0D1B2A] border border-[#1E344D] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded">
          <span className="text-[9px] sm:text-[10px] tracking-wide uppercase text-[#AAB7C4]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            LVL
          </span>
          <span
            className={`text-[11px] sm:text-[10px] font-bold ${isTimerStarted ? 'text-[#3DD6D0]' : 'text-[#E89B4A]'}`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {formatTime(elapsedMs)}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 bg-[#0D1B2A] border border-[#1E344D] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded">
          <span className="text-[9px] sm:text-[10px] tracking-wide uppercase text-[#AAB7C4]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            TOTAL
          </span>
          <span className="text-[11px] sm:text-[10px] font-bold text-[#E89B4A]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {formatTime(totalMs)}
          </span>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
