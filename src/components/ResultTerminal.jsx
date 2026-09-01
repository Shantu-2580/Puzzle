import React, { useState } from 'react';
import { formatTime, FULL_CIPHER_SENTENCE } from '../engine';

const ResultTerminal = ({
  success,
  failedFixedInput,
  failedFixedNode,
  gateOutputs,
  GATE_LABELS: _GATE_LABELS,
  puzzle,
  levelNum,
  elapsedMs,
  _totalMs,
  levelCleared,
  isLastLevel,
  goToNextLevel,
  restartAll,
}) => {
  const [copied, setCopied] = useState(false);
  const finalOutput = gateOutputs[6];
  const hasConstraintFailure = failedFixedInput || failedFixedNode;

  const handleCopyVerification = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(FULL_CIPHER_SENTENCE);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      className="p-3 sm:p-4 rounded-lg border flex flex-col items-stretch justify-between gap-2.5 flex-shrink-0 sticky sm:relative bottom-0 z-20 shadow-2xl"
      style={{
        borderColor: success ? '#48C78E' : hasConstraintFailure ? '#E89B4A' : '#E76F51',
        background: success
          ? 'linear-gradient(90deg, rgba(72,199,142,0.18) 0%, rgba(7,17,31,0.95) 100%)'
          : hasConstraintFailure
            ? 'linear-gradient(90deg, rgba(232,155,74,0.15) 0%, rgba(7,17,31,0.95) 100%)'
            : 'linear-gradient(90deg, rgba(231,111,81,0.15) 0%, rgba(7,17,31,0.95) 100%)',
        boxShadow: success
          ? '0 0 25px rgba(72,199,142,0.25)'
          : 'none',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.4s ease',
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 w-full">
        <div className="flex items-center gap-3">
          <div
            className="w-3.5 h-3.5 rounded-full flex-shrink-0"
            style={{
              background: success ? '#48C78E' : hasConstraintFailure ? '#E89B4A' : '#E76F51',
              boxShadow: success ? '0 0 12px #48C78E' : hasConstraintFailure ? '0 0 8px #E89B4A' : '0 0 8px #E76F51',
            }}
          />
          <div>
            <div
              className="text-xs sm:text-sm font-bold tracking-[0.15em] uppercase"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                color: success ? '#48C78E' : hasConstraintFailure ? '#E89B4A' : '#E76F51',
                textShadow: success
                  ? '0 0 12px rgba(72,199,142,0.7)'
                  : 'none',
              }}
            >
              {success
                ? `✦ LEVEL BREACHED · TARGET OUTPUT SATISFIED ✦`
                : failedFixedNode
                  ? '⚠️ NODE LOCK: COMPULSORY NODE CONSTRAINT FAILED'
                  : failedFixedInput
                    ? '⚠️ INPUT LOCK: REQUIRED INPUT CONSTRAINT FAILED'
                    : '✖ ACCESS DENIED'}
            </div>
            <div
              className="text-[10px] mt-0.5 tracking-wider font-semibold"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: success ? '#48C78E' : hasConstraintFailure ? '#E89B4A' : '#E76F51',
              }}
            >
              {success
                ? `Cleared in ${formatTime(elapsedMs)}! Circuit lock breached.`
                : failedFixedNode
                  ? `Required Node ${failedFixedNode[0]} must output ${failedFixedNode[1]} to satisfy compulsory layer lock.`
                  : failedFixedInput
                    ? `Target output met, but Input ${failedFixedInput[0]} must be set to ${failedFixedInput[1]}.`
                    : `Output: ${finalOutput} ≠ Target: ${puzzle.target}. Adjust A–F.`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-[#1E344D]">
          {/* Next Level / Complete button */}
          {levelCleared && (
            <button
              onClick={isLastLevel ? restartAll : goToNextLevel}
              className="px-5 py-2.5 rounded-lg border text-xs uppercase tracking-wider cursor-pointer font-bold w-full sm:w-auto text-center"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                borderColor: '#F4C95D',
                color: '#07111F',
                background: 'linear-gradient(180deg, #F4C95D 0%, #E89B4A 100%)',
                boxShadow: '0 0 20px rgba(244,201,93,0.5)',
                transition: 'all 0.3s',
                animation: 'pulse-neon 1.5s ease-in-out infinite',
              }}
            >
              {isLastLevel ? '↺ Victory Brief' : 'Next Level →'}
            </button>
          )}
          <div
            className="text-2xl sm:text-3xl font-black ml-auto sm:ml-0"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: success ? '#48C78E' : '#E76F51',
              textShadow: success ? '0 0 15px rgba(72,199,142,0.5)' : '0 0 8px rgba(231,111,81,0.3)',
            }}
          >
            {finalOutput}
          </div>
        </div>
      </div>

      {/* 🔑 LEVEL 10 / GRAND VERIFICATION PHRASE BANNER */}
      {success && isLastLevel && (
        <div className="w-full mt-2 bg-[#07111F]/90 border border-[#F4C95D] p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(244,201,93,0.3)] animate-fadeIn">
          <div className="text-left space-y-0.5">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#3DD6D0] font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              🔑 FINAL VERIFICATION PHRASE
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-[#F4C95D] tracking-wider font-mono">
              "{FULL_CIPHER_SENTENCE}"
            </div>
          </div>
          <button
            onClick={handleCopyVerification}
            className="px-4 py-2 rounded-lg border border-[#F4C95D] text-[10px] uppercase font-bold text-[#F4C95D] bg-[#F4C95D]/15 hover:bg-[#F4C95D]/30 cursor-pointer font-mono transition-all flex items-center gap-1.5 flex-shrink-0 shadow-[0_0_10px_rgba(244,201,93,0.2)]"
          >
            <span>{copied ? '✓' : '📋'}</span>
            <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY VERIFICATION PHRASE'}</span>
          </button>
        </div>
      )}
    </section>
  );
};

export default ResultTerminal;