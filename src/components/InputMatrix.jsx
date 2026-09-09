import React from 'react';
import { INPUT_LABELS } from '../engine';

const InputMatrix = ({
  inputs,
  fixedInputs,
  levelCleared,
  toggleInput,
  isTimerStarted,
  startTimerIfNeeded,
}) => {
  return (
    <section className="px-1 sm:px-2 flex-shrink-0">
      {!isTimerStarted && !levelCleared && (
        <p className="hidden sm:block mb-2 text-[12px] text-[#e08a3c]/90 font-ui">
          Touch a key to begin the clock
        </p>
      )}

      <div className="grid grid-cols-8 gap-1.5 sm:gap-3">
        {INPUT_LABELS.map(label => {
          const on = inputs[label] === 1;
          const reqVal = fixedInputs ? fixedInputs[label] : undefined;
          const isFixed = reqVal !== undefined;
          const fixedMet = isFixed && inputs[label] === reqVal;
          const border = on
            ? 'rgba(212,180,131,0.85)'
            : isFixed
              ? (fixedMet ? 'rgba(95,191,154,0.65)' : 'rgba(224,138,60,0.7)')
              : 'rgba(42,54,72,0.9)';

          return (
            <button
              key={label}
              onClick={() => {
                startTimerIfNeeded();
                toggleInput(label);
              }}
              disabled={levelCleared}
              className="input-key relative flex h-12 min-w-0 flex-col items-center justify-center rounded-md cursor-pointer select-none disabled:cursor-not-allowed touch-manipulation sm:h-[4.75rem]"
              style={{
                border: `1px solid ${border}`,
                background: on
                  ? 'linear-gradient(180deg, rgba(212,180,131,0.2) 0%, rgba(212,180,131,0.05) 100%)'
                  : 'linear-gradient(180deg, rgba(23,30,43,0.9) 0%, rgba(8,11,18,0.9) 100%)',
                boxShadow: on
                  ? '0 0 28px rgba(212,180,131,0.22), inset 0 1px 0 rgba(237,230,214,0.12)'
                  : 'inset 0 1px 0 rgba(237,230,214,0.04)',
                opacity: levelCleared ? 0.45 : 1,
              }}
            >
              {isFixed && (
                <span
                  className="absolute top-1 right-1 text-[9px] font-data px-1 rounded-sm"
                  style={{ color: fixedMet ? '#5fbf9a' : '#e08a3c' }}
                >
                  {reqVal}
                </span>
              )}
              <span
                className="text-[11px] sm:text-xs font-ui font-medium"
                style={{ color: on ? '#d4b483' : '#9aa6b4' }}
              >
                {label}
              </span>
              <span
                className="text-xl sm:text-[1.85rem] font-data font-semibold leading-none"
                style={{
                  color: on ? '#d4b483' : '#7ea0c8',
                  textShadow: on ? '0 0 18px rgba(212,180,131,0.55)' : 'none',
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
