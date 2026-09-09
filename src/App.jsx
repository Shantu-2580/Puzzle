import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import GameHeader from './components/GameHeader';
import ControlPanel from './components/ControlPanel';
import InputMatrix from './components/InputMatrix';
import CircuitDisplay from './components/CircuitDisplay';
import ResultTerminal from './components/ResultTerminal';
import { evaluate, findSolution, matchesAnswerKey, SETS, GATE_LABELS, formatTime, DEFAULT_INPUTS, INPUT_LABELS } from './engine';

export default function App() {
  // Set selection state
  const [selectedSet, setSelectedSet] = useState(null); // 'A', 'B', or 'C'
  const [showSetSelection, setShowSetSelection] = useState(true);

  // Level progression state (within selected set)
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0); // 0-indexed within set
  const [completedLevels, setCompletedLevels] = useState([]);  // list of cleared level indices within set
  const [levelCleared, setLevelCleared] = useState(false);      // level solved?
  const [allCleared, setAllCleared] = useState(false);          // all levels in set beaten?

  // Input and layout state
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [layoutMode, setLayoutMode] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return 'flow';
    }
    return 'tree';
  });

  // ⏱ Timer State (Timer starts ONLY when contestant makes first input action)
  const [isTimerStarted, setIsTimerStarted] = useState(false);
  const [levelStartTime, setLevelStartTime] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);                // active level time
  const [levelTimes, setLevelTimes] = useState([]);             // array of recorded level times [ms, ms...]
  const [levelInputs, setLevelInputs] = useState([]);           // array of input configs used to clear each level
  const clearTimerRef = useRef(null);

  // Get current set and level data
  const currentSet = selectedSet ? SETS[selectedSet] : null;
  const TOTAL_LEVELS_IN_SET = currentSet ? currentSet.levels.length : 0;
  const currentLevel = currentSet && currentSet.levels[currentLevelIndex] ? currentSet.levels[currentLevelIndex] : null;
  const gateTypes = currentLevel ? currentLevel.gates : [];

  // Helper to start the level timer on first input action
  const startTimerIfNeeded = useCallback(() => {
    if (!isTimerStarted && !levelCleared) {
      setIsTimerStarted(true);
      setLevelStartTime(Date.now());
    }
  }, [isTimerStarted, levelCleared]);

  // Compulsory layout enforcer: Larger screens (>=768px) use 'flow', Mobile (<768px) uses 'tree'
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth >= 768) {
          setLayoutMode('flow');
        } else {
          setLayoutMode('tree');
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Real-time level timer tick (Only ticks after contestant starts inputting)
  useEffect(() => {
    if (!isTimerStarted || levelCleared || allCleared || !levelStartTime) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - levelStartTime);
    }, 100);
    return () => clearInterval(interval);
  }, [isTimerStarted, levelStartTime, levelCleared, allCleared]);

  // Initialize level when set or level changes
  const initLevel = useCallback((setKey, levelIdx) => {
    if (!setKey || !SETS[setKey]) return;

    const levelData = SETS[setKey].levels[levelIdx];
    if (!levelData) return;

    setInputs(levelData.initialInputs || DEFAULT_INPUTS);
    setLevelCleared(false);
    setIsTimerStarted(false);
    setLevelStartTime(null);
    setElapsedMs(0);
  }, []);

  // Initialize first level when set is selected
  useEffect(() => {
    if (selectedSet) {
      initLevel(selectedSet, 0);
    }
  }, [selectedSet, initLevel]);

  // Circuit evaluation
  const gateOutputs = useMemo(
    () => evaluate(inputs, gateTypes, currentLevel?.circuit),
    [inputs, gateTypes, currentLevel?.circuit]
  );

  const finalOutput = gateOutputs[7];

  // Win conditions: Final output matches target + Fixed input requirements match
  const isTargetOutputMet = currentLevel ? finalOutput === currentLevel.target : false;
  const isAnswerKeyMet = currentLevel ? matchesAnswerKey(inputs, currentLevel.answer) : false;
  const answerKeyMismatch = currentLevel && !isAnswerKeyMet;
  const failedFixedInput = useMemo(() => {
    if (!currentLevel || !currentLevel.fixedInputs) return null;
    return Object.entries(currentLevel.fixedInputs).find(
      ([inputKey, reqVal]) => inputs[inputKey] !== reqVal
    );
  }, [currentLevel?.fixedInputs, inputs]);

  const failedFixedNode = useMemo(() => {
    if (!currentLevel || !currentLevel.fixedNodes) return null;
    return Object.entries(currentLevel.fixedNodes).find(([nodeLabel, reqVal]) => {
      const nodeIdx = currentLevel.circuit.find(n => n.label === nodeLabel)?.id;
      return nodeIdx !== undefined && gateOutputs[nodeIdx] !== reqVal;
    });
  }, [currentLevel?.fixedNodes, gateOutputs]);

  const success = currentLevel && isTargetOutputMet && isAnswerKeyMet && !failedFixedInput && !failedFixedNode;

  // Total time = pure sum of time spent in each cleared level
  const totalMs = useMemo(() => {
    return levelTimes.reduce((acc, t) => acc + t, 0);
  }, [levelTimes]);

  // Detect level breach
  useEffect(() => {
    if (success && !levelCleared) {
      const finalLvlTime = levelStartTime ? (Date.now() - levelStartTime) : 100;
      clearTimerRef.current = setTimeout(() => {
        setLevelCleared(true);
        setElapsedMs(finalLvlTime);
        setLevelTimes(prev => {
          const next = [...prev];
          next[currentLevelIndex] = finalLvlTime;
          return next;
        });
        setLevelInputs(prev => {
          const next = [...prev];
          next[currentLevelIndex] = inputs;
          return next;
        });
        setCompletedLevels(prev => {
          const next = prev.includes(currentLevelIndex) ? prev : [...prev, currentLevelIndex];
          if (next.length === TOTAL_LEVELS_IN_SET) setAllCleared(true);
          return next;
        });
      }, 600);
    }
    return () => clearTimeout(clearTimerRef.current);
  }, [success, levelCleared, currentLevelIndex, levelStartTime, inputs, TOTAL_LEVELS_IN_SET]);

  const toggleInput = useCallback((label) => {
    if (levelCleared) return;
    startTimerIfNeeded();
    setInputs(prev => ({ ...prev, [label]: prev[label] ^ 1 }));
  }, [levelCleared, startTimerIfNeeded]);

  const resetInputs = useCallback(() => {
    if (levelCleared) return;
    startTimerIfNeeded();
    if (currentSet && currentSet.levels[currentLevelIndex]) {
      setInputs(currentSet.levels[currentLevelIndex].initialInputs || DEFAULT_INPUTS);
    }
  }, [levelCleared, startTimerIfNeeded, currentSet, currentLevelIndex]);

  const randomizeInputs = useCallback(() => {
    if (levelCleared) return;
    startTimerIfNeeded();
    setInputs(Object.fromEntries(
      INPUT_LABELS.map(l => [l, Math.random() > 0.5 ? 1 : 0])
    ));
  }, [levelCleared, startTimerIfNeeded]);

  // ⚡ Admin Skip Level Action
  const handleAdminSkipLevel = useCallback(() => {
    if (levelCleared) return;
    startTimerIfNeeded();
    if (currentLevel) {
      const sol = findSolution(currentLevel);
      if (sol) {
        setInputs(sol);
      } else {
        setLevelCleared(true);
      }
    }
  }, [currentLevel, levelCleared, startTimerIfNeeded]);

  const goToNextLevel = useCallback(() => {
    if (currentLevelIndex < TOTAL_LEVELS_IN_SET - 1) {
      const nextIdx = currentLevelIndex + 1;
      setCurrentLevelIndex(nextIdx);
      initLevel(selectedSet, nextIdx);
    }
  }, [currentLevelIndex, TOTAL_LEVELS_IN_SET, selectedSet, initLevel]);

  const selectLevel = useCallback((levelIndex) => {
    if (levelIndex === currentLevelIndex || levelIndex < 0 || levelIndex >= TOTAL_LEVELS_IN_SET) return;
    setCurrentLevelIndex(levelIndex);
    initLevel(selectedSet, levelIndex);
  }, [currentLevelIndex, TOTAL_LEVELS_IN_SET, selectedSet, initLevel]);

  const restartSet = useCallback(() => {
    setCurrentLevelIndex(0);
    setCompletedLevels([]);
    setLevelCleared(false);
    setAllCleared(false);
    setLevelTimes([]);
    setLevelInputs([]);
    if (selectedSet) {
      initLevel(selectedSet, 0);
    }
  }, [selectedSet, initLevel]);

  const isLastLevel = currentLevelIndex === TOTAL_LEVELS_IN_SET - 1;
  const levelNum = currentLevelIndex + 1;

  // Render set selection screen if no set is selected
  if (showSetSelection && !selectedSet) {
    return (
      <div className="h-[100dvh] min-h-0 bg-void flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <p className="text-center text-lg font-bold uppercase tracking-[0.15em] text-[#F4C95D]"
             style={{ fontFamily: "'Orbitron', sans-serif" }}>
            Select Your Set
          </p>
          {['A', 'B', 'C'].map(setKey => (
                  <button
                    key={setKey}
                    onClick={() => {
                      setSelectedSet(setKey);
                      setShowSetSelection(false);
                    }}
                    className="w-full px-6 py-5 rounded-xl border-2 font-bold text-xl uppercase tracking-[0.15em]
                              transition-all duration-300 hover:brightness-125"
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      background: setKey === 'A' ? 'rgba(244,201,93,0.1)' :
                                 setKey === 'B' ? 'rgba(232,155,74,0.1)' :
                                                  'rgba(61,214,208,0.1)',
                      color: setKey === 'A' ? '#F4C95D' :
                             setKey === 'B' ? '#E89B4A' :
                                                '#3DD6D0',
                      borderColor: setKey === 'A' ? '#F4C95D' :
                                   setKey === 'B' ? '#E89B4A' :
                                                    '#3DD6D0'
                    }}
                  >
                    Set {setKey}
                  </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] min-h-0 bg-void flex flex-col relative w-full overflow-hidden">
      <GameHeader
        currentLevel={levelNum}
        TOTAL_LEVELS={TOTAL_LEVELS_IN_SET}
        levelCleared={levelCleared}
        isTimerStarted={isTimerStarted}
        elapsedMs={elapsedMs}
        totalMs={totalMs}
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
        selectedSet={selectedSet}
        SETS={SETS}
      />

      {/* ── MAIN CONTENT ───────────────────────── */}
      <main className="min-h-0 flex-1 flex flex-col p-2.5 sm:p-3 md:p-4 gap-2.5 sm:gap-3 overflow-hidden">
        <ControlPanel
          currentLevel={levelNum}
          TOTAL_LEVELS={TOTAL_LEVELS_IN_SET}
          completedLevels={completedLevels}
          onSelectLevel={selectLevel}
          SETS={SETS}
          selectedSet={selectedSet}
          inputs={inputs}
          setInputs={setInputs}
          levelCleared={levelCleared}
          puzzle={currentLevel}
          gateOutputs={gateOutputs}
          fixedInputs={currentLevel?.fixedInputs}
          GATE_LABELS={GATE_LABELS}
          resetInputs={resetInputs}
          randomizeInputs={randomizeInputs}
        />

        <InputMatrix
          inputs={inputs}
          fixedInputs={currentLevel?.fixedInputs}
          levelCleared={levelCleared}
          toggleInput={toggleInput}
          isTimerStarted={isTimerStarted}
          startTimerIfNeeded={startTimerIfNeeded}
        />

        <CircuitDisplay
          inputs={inputs}
          gateOutputs={gateOutputs}
          gateTypes={gateTypes}
          fixedInputs={currentLevel?.fixedInputs}
          fixedNodes={currentLevel?.fixedNodes}
          circuit={currentLevel?.circuit}
          layoutMode={layoutMode}
          setLayoutMode={setLayoutMode}
        />

        <ResultTerminal
          success={success}
          failedFixedInput={failedFixedInput}
          failedFixedNode={failedFixedNode}
          answerKeyMismatch={answerKeyMismatch}
          gateOutputs={gateOutputs}
          GATE_LABELS={GATE_LABELS}
          puzzle={currentLevel}
          levelNum={levelNum}
          elapsedMs={elapsedMs}
          totalMs={totalMs}
          levelCleared={levelCleared}
          isLastLevel={isLastLevel}
          goToNextLevel={goToNextLevel}
          restartSet={restartSet}
          selectedSet={selectedSet}
          SETS={SETS}
        />
      </main>

      {/* ── FOOTER ─────────────────────────────── */}
      <footer className="border-t border-[#1E344D] px-3 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between flex-shrink-0 bg-[#07111F]">
        <span
          className="text-[8px] sm:text-[9px] tracking-[0.2em] uppercase font-semibold"
          style={{ fontFamily: "'Orbitron', sans-serif", color: '#AAB7C4' }}
        >
          Minotaur Logic Systems v2.0
        </span>
        <span
          className="text-[8px] sm:text-[9px] tracking-wider"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: '#AAB7C4' }}
        >
          {selectedSet ? `Set ${selectedSet}: ${SETS[selectedSet].word}` : 'Select a Set'} ·
          {completedLevels.length}/${TOTAL_LEVELS_IN_SET} cleared ·
          Total: {formatTime(totalMs)}
        </span>
      </footer>

      {/* ── SET COMPLETION & GRAND VICTORY DASHBOARD OVERLAY ─────────────── */}
      {levelCleared && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          style={{
            background: 'rgba(7, 17, 31, 0.94)',
            backdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          {/* Main Modal Window */}
          <div
            className="w-full relative my-auto rounded-2xl border-2 overflow-hidden flex flex-col shadow-2xl"
            style={{
              maxWidth: allCleared ? '1020px' : '560px',
              borderColor: allCleared ? '#F4C95D' : currentSet?.name.includes('Set A') ? '#F4C95D' :
                           currentSet?.name.includes('Set B') ? '#E89B4A' : '#3DD6D0',
              background: 'linear-gradient(180deg, #0D1B2A 0%, #07111F 100%)',
              boxShadow: '0 0 60px rgba(244,201,93,0.25), inset 0 0 40px rgba(244,201,93,0.03)',
              animation: 'scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Top Glowing Decorative Bar */}
            <div
              className="h-1.5 w-full"
              style={{
                background: 'linear-gradient(90deg, #3DD6D0 0%, #F4C95D 50%, #3DD6D0 100%)',
                boxShadow: '0 0 15px #F4C95D',
              }}
            />

            <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6">

              {/* Header Section */}
              <div className="text-center space-y-1.5 sm:space-y-2">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-xl transition-transform duration-500 hover:scale-110"
                  style={{
                    background: 'radial-gradient(circle, rgba(244,201,93,0.2) 0%, rgba(244,201,93,0.05) 70%)',
                    border: '2px solid #F4C95D',
                    boxShadow: '0 0 30px rgba(244,201,93,0.4), inset 0 0 15px rgba(244,201,93,0.2)',
                  }}
                >
                  {allCleared ? '🏆' : '🥳'}
                </div>

                <h2
                  className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-[0.2em] uppercase"
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    color: allCleared ? '#F4C95D' :
                           currentSet?.name.includes('Set A') ? '#F4C95D' :
                           currentSet?.name.includes('Set B') ? '#E89B4A' : '#3DD6D0',
                    textShadow: '0 0 20px rgba(244,201,93,0.7), 0 0 40px rgba(244,201,93,0.3)',
                  }}
                >
                  {allCleared ? `SET ${selectedSet} COMPLETE` : `LEVEL ${levelNum} CLEARED`}
                </h2>

                <p
                  className="text-[10px] sm:text-[11px] tracking-widest text-[#AAB7C4]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {allCleared
                    ? `SET ${selectedSet}: ${currentSet?.word} MASTERED`
                    : currentLevel?.name}
                </p>
              </div>

              {/* Campaign time is the only completion metric. */}
              <div className="bg-[#152538] border border-[#E89B4A]/50 p-4 sm:p-5 rounded-xl text-center">
                <span className="text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-[#AAB7C4] font-bold block mb-1"
                      style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  ⏱ Set Time
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#E89B4A]"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatTime(totalMs)}
                </span>
              </div>

              {/* ── DETAILED LEVEL TELEMETRY TABLE (ON SET VICTORY) ── */}
              {allCleared && (
                <div className="space-y-2 bg-[#07111F] border border-[#1E344D] rounded-xl p-3 sm:p-4 md:p-5">
                  {/* Scrollable Table Area */}
                  <div className="space-y-1.5 sm:space-y-2 max-h-[360px] sm:max-h-[420px] overflow-y-auto pr-1.5 custom-scrollbar">
                    {currentSet?.levels.map((level, idx) => {
                      const usedInputs = levelInputs[idx] || {};

                      return (
                        <div
                          key={idx}
                          className="flex flex-col gap-2 p-2.5 sm:p-3 rounded-lg border text-xs sm:gap-4 transition-colors"
                          style={{
                            background: 'rgba(13,27,42,0.6)',
                            borderColor: '#1E344D',
                          }}
                        >
                          {/* Level Header Row */}
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            {/* Level Name & Badge */}
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              <span
                                className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-[9px] sm:text-[10px] font-bold flex-shrink-0"
                                style={{
                                  fontFamily: "'Orbitron', sans-serif",
                                  background: 'rgba(61,214,208,0.1)',
                                  color: '#3DD6D0',
                                  border: '1px solid #3DD6D0',
                                }}
                              >
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <div
                                  className="font-semibold text-[11px] sm:text-xs text-[#F5F1E8] truncate"
                                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                >
                                  {level.name}
                                </div>
                                <div className="text-[9px] text-[#3DD6D0] font-mono font-bold">
                                  Target Output: {level.target}
                                </div>
                              </div>
                            </div>

                          </div>

                          {/* Inputs Used Row */}
                          <div className="flex flex-wrap items-center gap-2 pl-2 sm:pl-8 border-t border-[#1E344D] pt-2 mt-1">
                            <span className="text-[8px] sm:text-[9px] text-[#AAB7C4] uppercase tracking-wider font-bold min-w-[70px]"
                                  style={{ fontFamily: "'Orbitron', sans-serif" }}>
                              Inputs:
                            </span>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {INPUT_LABELS.map(label => (
                                <span
                                  key={label}
                                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-md flex items-center justify-center text-sm sm:text-base font-bold border-2 transition-colors"
                                  style={{
                                    fontFamily: "'Orbitron', sans-serif",
                                    background: usedInputs[label] === 1 ? 'rgba(244,201,93,0.2)' : 'rgba(61,214,208,0.1)',
                                    color: usedInputs[label] === 1 ? '#F4C95D' : '#3DD6D0',
                                    borderColor: usedInputs[label] === 1 ? '#F4C95D' : '#3DD6D0',
                                  }}
                                >
                                  {label}={usedInputs[label] ?? 0}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-1 sm:pt-2">
                <button
                  onClick={allCleared ? () => {
                    // Reset to set selection
                    setSelectedSet(null);
                    setShowSetSelection(true);
                  } : goToNextLevel}
                  className="w-full py-3.5 sm:py-4 rounded-xl border text-sm sm:text-base md:text-lg uppercase tracking-[0.2em] cursor-pointer font-bold transition-all duration-300 transform"
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    borderColor: allCleared ? '#F4C95D' : currentSet?.name.includes('Set A') ? '#F4C95D' :
                                             currentSet?.name.includes('Set B') ? '#E89B4A' : '#3DD6D0',
                    color: '#07111F',
                    background: allCleared ? 'linear-gradient(180deg, #F4C95D 0%, #E89B4A 100%)' :
                                 currentSet?.name.includes('Set A') ? 'linear-gradient(180deg, #F4C95D 0%, #E89B4A 100%)' :
                                 currentSet?.name.includes('Set B') ? 'linear-gradient(180deg, #E89B4A 0%, #E76F51 100%)' :
                                                                    'linear-gradient(180deg, #3DD6D0 0%, #48C78E 100%)',
                    boxShadow: '0 0 30px rgba(244,201,93,0.4), 0 0 60px rgba(244,201,93,0.15)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = allCleared ? '0 0 45px rgba(244,201,93,0.7), 0 0 90px rgba(244,201,93,0.3)' :
                                 e.currentTarget.style.boxShadow.includes('45px') ? e.currentTarget.style.boxShadow :
                                 '0 0 45px rgba(244,201,93,0.7), 0 0 90px rgba(244,201,93,0.3)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = allCleared ? '0 0 30px rgba(244,201,93,0.4), 0 0 60px rgba(244,201,93,0.15)' :
                                 e.currentTarget.style.boxShadow.includes('30px') ? e.currentTarget.style.boxShadow :
                                 '0 0 30px rgba(244,201,93,0.4), 0 0 60px rgba(244,201,93,0.15)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {allCleared ? 'Finish' : 'Next Level →'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
