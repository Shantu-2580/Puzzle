import React, { useState } from 'react';
import { formatTime, FULL_CIPHER_SENTENCE } from '../engine';

const ResultTerminal = ({
  success,
  failedFixedInput,
  failedFixedNode,
  answerKeyMismatch,
  gateOutputs,
  GATE_LABELS: _GATE_LABELS,
  puzzle,
  elapsedMs,
  _totalMs,
  levelCleared,
  isLastLevel,
  goToNextLevel,
  restartSet,
}) => {
  const [copied, setCopied] = useState(false);
  const finalOutput = gateOutputs[7];
  const hasConstraintFailure = failedFixedInput || failedFixedNode || answerKeyMismatch;
  const tone = success ? '#5fbf9a' : hasConstraintFailure ? '#e08a3c' : '#d96a55';

  const handleCopyVerification = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(FULL_CIPHER_SENTENCE);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isQuietFail = !success && !hasConstraintFailure;

  return (
    <section
      className={`flex-col items-stretch justify-between flex-shrink-0 z-20 ${
        isQuietFail || success
          ? 'hidden md:flex px-2 py-3 gap-2'
          : 'flex px-2 py-2 sm:py-3 gap-2'
      }`}
    >
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full rounded-xl px-4 py-3"
        style={{
          border: `1px solid ${tone}44`,
          background: `${tone}14`,
          animation: success ? 'success-pulse 2.8s ease-in-out infinite' : 'none',
        }}
      >
        <div className="min-w-0">
          <p className="text-[15px] sm:text-base font-medium font-ui" style={{ color: tone }}>
            {success
              ? 'Level cleared'
              : failedFixedNode
                ? `Lock ${failedFixedNode[0]} needs ${failedFixedNode[1]}`
                : failedFixedInput
                  ? `Set ${failedFixedInput[0]} to ${failedFixedInput[1]}`
                  : answerKeyMismatch
                    ? 'Not the valid input pattern'
                    : 'Output does not match the target'}
          </p>
          <p className="hidden sm:block text-[12px] mt-1 text-[#9aa6b4] font-ui leading-snug">
            {success
              ? `Cleared in ${formatTime(elapsedMs)}.`
              : failedFixedNode
                ? `${failedFixedNode[0]} must output ${failedFixedNode[1]}.`
                : failedFixedInput
                  ? `Target is met, but ${failedFixedInput[0]} must be ${failedFixedInput[1]}.`
                  : answerKeyMismatch
                    ? 'Locks may pass, but this is not the valid solution.'
                    : `Output ${finalOutput} ≠ target ${puzzle?.target}.`}
          </p>
        </div>

        {levelCleared && (
          <button
            onClick={isLastLevel ? restartSet : goToNextLevel}
            className="px-5 py-2.5 rounded-md text-sm font-medium w-full sm:w-auto text-center font-ui cursor-pointer"
            style={{
              color: '#080b12',
              background: 'linear-gradient(180deg, #e8d3a8 0%, #d4b483 100%)',
            }}
          >
            {isLastLevel ? 'Restart set' : 'Next level'}
          </button>
        )}
      </div>

      {success && isLastLevel && (
        <div className="w-full rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ border: '1px solid rgba(212,180,131,0.35)' }}
        >
          <p className="text-sm font-medium text-[#d4b483] font-data">
            {FULL_CIPHER_SENTENCE}
          </p>
          <button
            onClick={handleCopyVerification}
            className="px-3 py-2 rounded-md text-[12px] font-ui text-[#d4b483] cursor-pointer hover:bg-[#d4b483]/10"
          >
            {copied ? 'Copied' : 'Copy phrase'}
          </button>
        </div>
      )}
    </section>
  );
};

export default ResultTerminal;
