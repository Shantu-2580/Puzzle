import React from 'react';
import { INPUT_LABELS } from '../engine';

const InputMatrix = ({
  inputs,
  fixedInputs,
  levelCleared,
  toggleInput,
  isTimerStarted,
  startTimerIfNeeded,
  asciiData,
}) => {
  return (
    <section className="p-3 sm:p-4 rounded-lg border border-[#1E344D] bg-[#0D1B2A]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2 border-b border-[#1E344D] pb-2">
        <div className="flex items-center gap-2">
          <h2
            className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-bold text-[#3DD6D0]"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            Input Matrix (Tap A – F)
          </h2>
          {!isTimerStarted && !levelCleared && (
            <span className="text-[8px] text-[#E89B4A] uppercase font-mono font-bold animate-pulse">
              ⚡ Tap input to start timer
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between">
          {/* 🔤 Live Binary-to-ASCII HUD Decoder */}
          <div className="flex items-center gap-2 bg-[#07111F] border border-[#1E344D] px-3 py-1 rounded-lg text-xs font-mono">
            <span className="text-[9px] uppercase text-[#AAB7C4] font-bold tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              ASCII Telemetry:
            </span>
            <span className="text-[#3DD6D0] font-bold tracking-widest">{asciiData.binaryStr}</span>
            <span className="text-[#5B8DEF]">→</span>
            <span className="text-[#E89B4A] font-bold">DEC:{asciiData.code}</span>
            <span className="text-[#5B8DEF]">→</span>
            <span className="text-[#F4C95D] font-extrabold text-sm px-1.5 py-0.2 rounded bg-[#F4C95D]/10 border border-[#F4C95D]/40">
              '{asciiData.char}'
            </span>
          </div>


        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {INPUT_LABELS.map(label => {
          const on = inputs[label] === 1;
          const reqVal = fixedInputs ? fixedInputs[label] : undefined;
          const isFixed = reqVal !== undefined;
          const fixedMet = isFixed && inputs[label] === reqVal;

          return (
            <button
              key={label}
              onClick={() => {
                startTimerIfNeeded();
                toggleInput(label);
              }}
              disabled={levelCleared}
              className="relative flex flex-col items-center justify-center w-full h-18 sm:h-22 rounded-xl border-2 cursor-pointer select-none disabled:cursor-not-allowed active:scale-95 touch-manipulation transition-all duration-200"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                borderColor: on ? '#F4C95D' : isFixed ? (fixedMet ? '#48C78E' : '#E89B4A') : '#1E344D',
                background: on
                  ? 'linear-gradient(180deg, rgba(244,201,93,0.22) 0%, rgba(244,201,93,0.06) 100%)'
                  : '#07111F',
                boxShadow: on
                  ? '0 0 18px rgba(244,201,93,0.35), inset 0 0 15px rgba(244,201,93,0.1)'
                  : 'none',
                opacity: levelCleared ? 0.5 : 1,
              }}
            >
              {isFixed && (
                <span
                  className="absolute top-1 right-1 text-[7px] sm:text-[8px] font-bold px-1 rounded border"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    borderColor: fixedMet ? '#48C78E' : '#E89B4A',
                    color: fixedMet ? '#48C78E' : '#E89B4A',
                    background: fixedMet ? 'rgba(72,199,142,0.15)' : 'rgba(232,155,74,0.15)',
                  }}
                >
                  REQ:{reqVal}
                </span>
              )}
              <span
                className="text-xs font-bold mb-0.5"
                style={{ color: on ? '#F4C95D' : '#AAB7C4', transition: 'color 0.15s' }}
              >
                {label}
              </span>
              <span
                className="text-2xl sm:text-3xl font-black"
                style={{
                  color: on ? '#F4C95D' : '#5B8DEF',
                  textShadow: on ? '0 0 10px rgba(244,201,93,0.8)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {on ? '1' : '0'}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default InputMatrix;