import React from 'react';
import { formatTime } from '../engine';

const GameHeader = ({
  currentLevel,
  TOTAL_LEVELS,
  levelCleared,
  isTimerStarted,
  elapsedMs,
  totalMs,
}) => {
  return (
    <header className="border-b border-[#1E344D] px-3 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 flex-shrink-0 select-none bg-[#07111F]/90 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-2.5">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{
              background: levelCleared ? '#48C78E' : isTimerStarted ? '#3DD6D0' : '#E89B4A',
              boxShadow: levelCleared
                ? '0 0 8px #48C78E, 0 0 20px rgba(72,199,142,0.4)'
                : isTimerStarted
                  ? '0 0 8px #3DD6D0, 0 0 20px rgba(61,214,208,0.3)'
                  : '0 0 8px #E89B4A, 0 0 15px rgba(232,155,74,0.3)',
              animation: 'pulse-neon 2s ease-in-out infinite',
            }}
          />
          <h1
            className="text-sm sm:text-lg md:text-xl font-bold tracking-[0.15em] uppercase"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: '#F4C95D',
              textShadow: '0 0 10px rgba(244,201,93,0.5), 0 0 30px rgba(244,201,93,0.2)',
            }}
          >
            The Minotaur's Gates
          </h1>
        </div>
      </div>

      {/* Timers & Status Header */}
      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#1E344D] pt-2 sm:pt-0">
        {/* Level Timer (Starts on first input) */}
        <div className="flex items-center gap-1.5 bg-[#0D1B2A] border border-[#1E344D] px-2.5 py-1 rounded relative">
          <span className="text-[9px] tracking-wider uppercase text-[#AAB7C4]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            ⏱ LVL:
          </span>
          <span
            className={`text-xs sm:text-sm font-bold ${
              isTimerStarted ? 'text-[#3DD6D0]' : 'text-[#E89B4A]'
            }`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {formatTime(elapsedMs)}
          </span>
          {!isTimerStarted && !levelCleared && (
            <span className="text-[8px] font-bold uppercase text-[#E89B4A] tracking-wider px-1 rounded bg-[#E89B4A]/10 border border-[#E89B4A]/30 animate-pulse ml-1">
              TAP TO START
            </span>
          )}
        </div>

        {/* Total Timer */}
        <div className="flex items-center gap-1.5 bg-[#0D1B2A] border border-[#1E344D] px-2.5 py-1 rounded">
          <span className="text-[9px] tracking-wider uppercase text-[#AAB7C4]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            TOTAL:
          </span>
          <span className="text-xs sm:text-sm font-bold text-[#E89B4A]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {formatTime(totalMs)}
          </span>
        </div>

        {/* Level indicator */}
        <span
          className="text-[10px] sm:text-[11px] tracking-[0.15em] uppercase font-bold"
          style={{ fontFamily: "'Orbitron', sans-serif", color: '#F4C95D' }}
        >
          LVL {currentLevel + 1}
          <span style={{ color: '#AAB7C4' }}>/{TOTAL_LEVELS}</span>
        </span>
      </div>
    </header>
  );
};

export default GameHeader;