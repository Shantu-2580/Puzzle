import React, { useEffect } from 'react';

const VoyageJumpModal = ({ isOpen, jumpInfo, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    // Auto-advance after 3.5 seconds if user doesn't click
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen || !jumpInfo) return null;

  const { fromLevel, toLevel, levelsJumped, isFinalState } = jumpInfo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
        <div className="relative w-full max-w-lg p-8 rounded-2xl hairline text-center overflow-hidden">
        <h2 className="text-2xl font-display text-[#d4b483] tracking-[0.08em] mb-2">
          The seas have opened
        </h2>
        <p className="text-sm text-[#9aa6b4] mb-6 font-ui">
          A hidden passage has carried your voyage beyond {levelsJumped > 0 ? `${levelsJumped} trials` : 'all trials'}.
        </p>
        <div className="py-3 px-4 rounded-xl mb-6" style={{ border: '1px solid rgba(110,200,196,0.35)' }}>
          <span className="text-[12px] text-[#6ec8c4] font-ui block mb-1">Voyage advanced</span>
          <div className="flex items-center justify-center gap-3 text-lg font-ui text-[#ede6d6]">
            <span className="text-[#9aa6b4]">Stage {fromLevel}</span>
            <span className="text-[#6ec8c4]">→</span>
            <span className="text-[#d4b483]">{isFinalState ? 'Final horizon' : `Stage ${toLevel}`}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 px-6 rounded-md font-ui font-medium cursor-pointer"
          style={{ background: 'linear-gradient(180deg, #e8d3a8 0%, #d4b483 100%)', color: '#080b12' }}
        >
          Continue
        </button>
        </div>
    </div>
  );
};

export default VoyageJumpModal;
