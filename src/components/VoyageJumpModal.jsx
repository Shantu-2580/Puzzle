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
      <div
        className="relative w-full max-w-lg p-6 sm:p-8 rounded-2xl border-2 text-center shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0D1B2A 0%, #07111F 100%)',
          borderColor: '#F4C95D',
          boxShadow: '0 0 35px rgba(244, 201, 93, 0.4), inset 0 0 20px rgba(61, 214, 208, 0.15)',
        }}
      >
        {/* Decorative Ancient Compass Accent */}
        <div className="absolute -top-10 -right-10 opacity-10 text-9xl pointer-events-none text-[#F4C95D]">
          ⚓
        </div>

        {/* Header Icon */}
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl sm:text-4xl border-2 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(244,201,93,0.2) 0%, rgba(61,214,208,0.2) 100%)',
            borderColor: '#F4C95D',
            boxShadow: '0 0 20px rgba(244,201,93,0.5)',
          }}
        >
          ⚓
        </div>

        {/* Title */}
        <h2
          className="text-lg sm:text-2xl font-black uppercase tracking-[0.2em] mb-2"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            color: '#F4C95D',
            textShadow: '0 0 15px rgba(244,201,93,0.6)',
          }}
        >
          THE SEAS HAVE OPENED
        </h2>

        {/* Thematic Message */}
        <p
          className="text-xs sm:text-sm font-semibold tracking-wider text-[#AAB7C4] mb-6 max-w-md mx-auto"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          The path ahead is clear. A hidden passage has carried your voyage beyond {levelsJumped > 0 ? `${levelsJumped} trials` : 'all trials'}.
        </p>

        {/* Voyage Stage Advancement Badge */}
        <div
          className="py-3 px-4 rounded-xl border mb-6 inline-block w-full"
          style={{
            background: 'rgba(61, 214, 208, 0.08)',
            borderColor: '#3DD6D0',
            boxShadow: '0 0 15px rgba(61, 214, 208, 0.2)',
          }}
        >
          <span
            className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-[#3DD6D0] font-bold block mb-1"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            ✦ VOYAGE ADVANCED ✦
          </span>
          <div className="flex items-center justify-center gap-3 text-sm sm:text-lg font-black text-[#F5F1E8]">
            <span style={{ fontFamily: "'Orbitron', sans-serif", color: '#AAB7C4' }}>
              STAGE {fromLevel}
            </span>
            <span className="text-[#3DD6D0]">➔</span>
            <span style={{ fontFamily: "'Orbitron', sans-serif", color: '#F4C95D' }}>
              {isFinalState ? 'FINAL HORIZON' : `STAGE ${toLevel}`}
            </span>
          </div>
          {levelsJumped > 0 && (
            <span className="text-[9px] text-[#48C78E] font-mono block mt-1">
              +{levelsJumped} STAGES BYPASSED BY SECRET PHRASE
            </span>
          )}
        </div>

        {/* Continue Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-6 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-[0.15em] cursor-pointer transition-all duration-300 transform active:scale-95 shadow-xl"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            background: 'linear-gradient(180deg, #F4C95D 0%, #E89B4A 100%)',
            color: '#07111F',
            boxShadow: '0 0 20px rgba(244, 201, 93, 0.5)',
          }}
        >
          CONTINUE VOYAGE →
        </button>
      </div>
    </div>
  );
};

export default VoyageJumpModal;
