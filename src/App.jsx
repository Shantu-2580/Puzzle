import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import GameHeader from './components/GameHeader';
import ControlPanel from './components/ControlPanel';
import InputMatrix from './components/InputMatrix';
import CircuitDisplay from './components/CircuitDisplay';
import ResultTerminal from './components/ResultTerminal';
import { evaluate, findSolution, PUZZLES, GATE_LABELS, formatTime, DEFAULT_INPUTS, inputsToAscii, INPUT_LABELS, CIRCUIT } from './engine';

const TOTAL_LEVELS = PUZZLES.length;
const VALID_ADMIN_PASSWORDS = ['MINOTAUR', 'ADMIN', 'GATEKEEPER', '1234'];

export default function App() {
  const [currentLevel, setCurrentLevel] = useState(0);         // 0-indexed
  const [completedLevels, setCompletedLevels] = useState([]);  // list of cleared level indices
  const [levelCleared, setLevelCleared] = useState(false);      // level solved?
  const [allCleared, setAllCleared] = useState(false);          // all levels beaten?
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

  const puzzle = PUZZLES[currentLevel];
  const gateTypes = puzzle.gates;

  // Real-time ASCII HUD evaluation
  const asciiData = useMemo(() => inputsToAscii(inputs), [inputs]);

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
      if (window.innerWidth >= 768) {
        setLayoutMode('flow');
      } else {
        setLayoutMode('tree');
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

  
  // Reset level inputs & timer when level changes
  const initLevel = useCallback((lvlIdx) => {
    const p = PUZZLES[lvlIdx];
    setInputs(p.initialInputs || DEFAULT_INPUTS);
    setLevelCleared(false);
    setIsTimerStarted(false);
    setLevelStartTime(null);
    setElapsedMs(0);
  }, []);

  
  // Circuit evaluation
  const gateOutputs = useMemo(
    () => evaluate(inputs, gateTypes),
    [inputs, gateTypes]
  );

  const finalOutput = gateOutputs[6];

  // Win conditions: Final output matches target + Fixed input requirements match
  const isTargetOutputMet = finalOutput === puzzle.target;
  const failedFixedInput = useMemo(() => {
    if (!puzzle.fixedInputs) return null;
    return Object.entries(puzzle.fixedInputs).find(
      ([inputKey, reqVal]) => inputs[inputKey] !== reqVal
    );
  }, [puzzle.fixedInputs, inputs]);

  const failedFixedNode = useMemo(() => {
    if (!puzzle.fixedNodes) return null;
    return Object.entries(puzzle.fixedNodes).find(([nodeLabel, reqVal]) => {
      const nodeIdx = CIRCUIT.find(n => n.label === nodeLabel)?.id;
      return nodeIdx !== undefined && gateOutputs[nodeIdx] !== reqVal;
    });
  }, [puzzle.fixedNodes, gateOutputs]);

  const success = isTargetOutputMet && !failedFixedInput && !failedFixedNode;

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
          next[currentLevel] = finalLvlTime;
          return next;
        });
        setLevelInputs(prev => {
          const next = [...prev];
          next[currentLevel] = inputs;
          return next;
        });
        setCompletedLevels(prev => {
          const next = prev.includes(currentLevel) ? prev : [...prev, currentLevel];
          if (next.length === TOTAL_LEVELS) setAllCleared(true);
          return next;
        });
      }, 600);
    }
    return () => clearTimeout(clearTimerRef.current);
  }, [success, levelCleared, currentLevel, levelStartTime, inputs]);

  const toggleInput = useCallback((label) => {
    if (levelCleared) return;
    startTimerIfNeeded();
    setInputs(prev => ({ ...prev, [label]: prev[label] ^ 1 }));
  }, [levelCleared, startTimerIfNeeded]);

  const resetInputs = useCallback(() => {
    if (levelCleared) return;
    startTimerIfNeeded();
    setInputs(puzzle.initialInputs || DEFAULT_INPUTS);
  }, [levelCleared, puzzle, startTimerIfNeeded]);

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
    const sol = findSolution(puzzle);
    if (sol) {
      setInputs(sol);
    } else {
      setLevelCleared(true);
    }
  }, [puzzle, levelCleared, startTimerIfNeeded]);

  // Password Verification for Admin Auth
  const handleAdminAuthSubmit = (e) => {
    e.preventDefault();
    const cleanInput = adminPasswordInput.trim().toUpperCase();
    if (VALID_ADMIN_PASSWORDS.includes(cleanInput)) {
      setIsAdmin(true);
      setShowAdminAuthModal(false);
      setAdminPasswordInput('');
      setAdminAuthError(false);
    } else {
      setAdminAuthError(true);
    }
  };


  const goToNextLevel = useCallback(() => {
    if (currentLevel < TOTAL_LEVELS - 1) {
      const nextIdx = currentLevel + 1;
      setCurrentLevel(nextIdx);
      initLevel(nextIdx);
    }
  }, [currentLevel, initLevel]);

  const restartAll = useCallback(() => {
    setCurrentLevel(0);
    setCompletedLevels([]);
    setLevelCleared(false);
    setAllCleared(false);
    setLevelTimes([]);
    initLevel(0);
  }, [initLevel]);

  const isLastLevel = currentLevel === TOTAL_LEVELS - 1;
  const levelNum = currentLevel + 1;

  // Best level time & average level time
  const bestLevelTimeMs = useMemo(() => {
    if (levelTimes.length === 0) return null;
    const validTimes = levelTimes.filter(Boolean);
    return validTimes.length > 0 ? Math.min(...validTimes) : null;
  }, [levelTimes]);

  const bestLevelIndex = useMemo(() => {
    if (!bestLevelTimeMs) return null;
    return levelTimes.findIndex(t => t === bestLevelTimeMs);
  }, [levelTimes, bestLevelTimeMs]);

  const avgLevelTimeMs = useMemo(() => {
    const validTimes = levelTimes.filter(Boolean);
    if (validTimes.length === 0) return 0;
    return Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length);
  }, [levelTimes]);

  const maxLevelTimeMs = useMemo(() => {
    const validTimes = levelTimes.filter(Boolean);
    return validTimes.length > 0 ? Math.max(...validTimes) : 1000;
  }, [levelTimes]);

  return (
    <div className="min-h-screen bg-void flex flex-col relative w-full overflow-x-hidden pb-16 sm:pb-0">
      <GameHeader
        currentLevel={currentLevel}
        TOTAL_LEVELS={TOTAL_LEVELS}
        completedLevels={completedLevels}
        levelCleared={levelCleared}
        isTimerStarted={isTimerStarted}
        elapsedMs={elapsedMs}
        totalMs={totalMs}
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
      />

      {/* ── MAIN CONTENT ───────────────────────── */}
      <main className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 gap-3 sm:gap-4 overflow-x-hidden">
        <ControlPanel
          currentLevel={currentLevel}
          completedLevels={completedLevels}
          PUZZLES={PUZZLES}
          inputs={inputs}
          setInputs={setInputs}
          levelCleared={levelCleared}
          puzzle={puzzle}
          gateOutputs={gateOutputs}
          fixedInputs={puzzle.fixedInputs}
          GATE_LABELS={GATE_LABELS}
          resetInputs={resetInputs}
          randomizeInputs={randomizeInputs}
        />

        <InputMatrix
          inputs={inputs}
          fixedInputs={puzzle.fixedInputs}
          levelCleared={levelCleared}
          toggleInput={toggleInput}
          isTimerStarted={isTimerStarted}
          startTimerIfNeeded={startTimerIfNeeded}
          asciiData={asciiData}
        />

        <CircuitDisplay
          inputs={inputs}
          gateOutputs={gateOutputs}
          gateTypes={gateTypes}
          fixedInputs={puzzle.fixedInputs}
          fixedNodes={puzzle.fixedNodes}
          layoutMode={layoutMode}
          setLayoutMode={setLayoutMode}
        />

        <ResultTerminal
          success={success}
          failedFixedInput={failedFixedInput}
          failedFixedNode={failedFixedNode}
          gateOutputs={gateOutputs}
          GATE_LABELS={GATE_LABELS}
          puzzle={puzzle}
          levelNum={levelNum}
          elapsedMs={elapsedMs}
          totalMs={totalMs}
          levelCleared={levelCleared}
          isLastLevel={isLastLevel}
          goToNextLevel={goToNextLevel}
          restartAll={restartAll}
        />
      </main>

      {/* ── FOOTER ─────────────────────────────── */}
      <footer className="border-t border-[#1E344D] px-4 sm:px-6 py-2.5 flex items-center justify-between flex-shrink-0 bg-[#07111F]">
        <span
          className="text-[8px] sm:text-[9px] tracking-[0.2em] uppercase font-semibold"
          style={{ fontFamily: "'Orbitron', sans-serif", color: '#AAB7C4' }}
        >
          Minotaur Logic Systems v1.0
        </span>
        <span
          className="text-[8px] sm:text-[9px] tracking-wider"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: '#AAB7C4' }}
        >
          {completedLevels.length}/{TOTAL_LEVELS} cleared · Total: {formatTime(totalMs)}
        </span>
      </footer>

      {/* ── HIGH-TECH GRAND VICTORY & LEVEL COMPLETE DASHBOARD OVERLAY ─────────────── */}
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
              borderColor: '#F4C95D',
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
                    color: '#F4C95D',
                    textShadow: '0 0 20px rgba(244,201,93,0.7), 0 0 40px rgba(244,201,93,0.3)',
                  }}
                >
                  {allCleared ? 'SYSTEM FULLY BREACHED' : `LEVEL ${levelNum} CLEARED`}
                </h2>

                <p
                  className="text-[10px] sm:text-xs md:text-sm tracking-widest text-[#AAB7C4]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {allCleared
                    ? 'ALL 3 LOGIC GATES OVERRIDDEN · SYSTEM BREACHED'
                    : puzzle.name}
                </p>
              </div>

              {/* ── KPI STATISTICS GRID ── */}
              {allCleared ? (
                /* 4-Card Grid for Full Campaign Victory */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
                    {/* Total Time Card */}
                    <div className="bg-[#152538] border border-[#1E344D] p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center text-center">
                      <span className="text-[8px] sm:text-[10px] tracking-[0.15em] uppercase text-[#AAB7C4] font-bold mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                        ⏱ Campaign Time
                      </span>
                      <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#E89B4A]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatTime(totalMs)}
                      </span>
                    </div>

                    {/* Fastest Sprint Card */}
                    <div className="bg-[#152538] border border-[#F4C95D]/40 p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <div className="absolute top-1 right-1.5 text-[7px] sm:text-[8px] font-bold text-[#F4C95D] uppercase px-1 py-0.5 rounded bg-[#F4C95D]/10 border border-[#F4C95D]/30">
                        BEST
                      </div>
                      <span className="text-[8px] sm:text-[10px] tracking-[0.15em] uppercase text-[#AAB7C4] font-bold mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                        ⚡ Fastest Sprint
                      </span>
                      <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#F4C95D]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {bestLevelTimeMs ? formatTime(bestLevelTimeMs) : '--:--'}
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-[#F4C95D]/80 mt-0.5 truncate max-w-full font-mono">
                        {bestLevelIndex !== null ? PUZZLES[bestLevelIndex]?.name : ''}
                      </span>
                    </div>

                    {/* Average Level Time Card */}
                    <div className="bg-[#152538] border border-[#1E344D] p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center text-center">
                      <span className="text-[8px] sm:text-[10px] tracking-[0.15em] uppercase text-[#AAB7C4] font-bold mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                        📊 Avg Gate Time
                      </span>
                      <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#3DD6D0]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatTime(avgLevelTimeMs)}
                      </span>
                    </div>

                    {/* Security Clearance Card */}
                    <div className="bg-[#152538] border border-[#1E344D] p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center text-center">
                      <span className="text-[8px] sm:text-[10px] tracking-[0.15em] uppercase text-[#AAB7C4] font-bold mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                        🛡 Security Level
                      </span>
                      <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#48C78E]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                        10 / 10
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-[#48C78E] mt-0.5 font-mono">100% Breached</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* 2-Card Grid for Single Level Clear */
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-[#152538] border border-[#3DD6D0]/40 p-3 sm:p-4 rounded-xl text-center">
                    <span className="text-[8px] sm:text-[10px] tracking-[0.15em] uppercase text-[#AAB7C4] font-bold block mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                      Level Clear Time
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-[#3DD6D0]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {formatTime(elapsedMs)}
                    </span>
                  </div>

                  <div className="bg-[#152538] border border-[#E89B4A]/40 p-3 sm:p-4 rounded-xl text-center">
                    <span className="text-[8px] sm:text-[10px] tracking-[0.15em] uppercase text-[#AAB7C4] font-bold block mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                      Total Elapsed Time
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-[#E89B4A]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {formatTime(totalMs)}
                    </span>
                  </div>
                </div>
              )}

              {/* ── DETAILED LEVEL TELEMETRY TABLE (ON CAMPAIGN VICTORY) ── */}
              {allCleared && (
                <div className="space-y-2 bg-[#07111F] border border-[#1E344D] rounded-xl p-3 sm:p-4 md:p-5">
                  <div className="flex items-center justify-between border-b border-[#1E344D] pb-2 sm:pb-3 mb-1.5 sm:mb-2">
                    <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#3DD6D0] flex items-center gap-1.5 sm:gap-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                      <span>📡</span> Full Level Telemetry Log
                    </h3>
                    <span className="text-[8px] sm:text-[10px] text-[#AAB7C4] uppercase tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                      3 Levels Cleared
                    </span>
                  </div>

                  {/* Scrollable Table Area */}
                  <div className="space-y-1.5 sm:space-y-2 max-h-[220px] sm:max-h-[260px] overflow-y-auto pr-1.5 custom-scrollbar">
                    {PUZZLES.map((p, idx) => {
                      const t = levelTimes[idx] || 0;
                      const isBest = t === bestLevelTimeMs && t > 0;
                      const pct = Math.min(100, Math.max(12, Math.round((t / maxLevelTimeMs) * 100)));
                      const usedInputs = levelInputs[idx] || {};

                      return (
                        <div
                          key={idx}
                          className="flex flex-col gap-2 p-2.5 sm:p-3 rounded-lg border text-xs gap-2 sm:gap-4 transition-colors"
                          style={{
                            background: isBest ? 'rgba(244,201,93,0.08)' : 'rgba(13,27,42,0.6)',
                            borderColor: isBest ? 'rgba(244,201,93,0.4)' : '#1E344D',
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
                                  background: isBest ? 'rgba(244,201,93,0.2)' : 'rgba(61,214,208,0.1)',
                                  color: isBest ? '#F4C95D' : '#3DD6D0',
                                  border: `1px solid ${isBest ? '#F4C95D' : '#3DD6D0'}`,
                                }}
                              >
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <div
                                  className="font-semibold text-[11px] sm:text-xs text-[#F5F1E8] truncate"
                                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                >
                                  {p.name}
                                </div>
                                <div className="text-[9px] text-[#3DD6D0] font-mono font-bold">
                                  Target Output: {p.target}
                                </div>
                              </div>
                            </div>

                            {/* Relative Time Bar Visualizer */}
                            <div className="hidden md:flex flex-1 items-center gap-2 max-w-[160px]">
                              <div className="w-full bg-[#07111F] h-2 rounded-full overflow-hidden border border-[#1E344D]">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${pct}%`,
                                    background: isBest ? '#F4C95D' : '#3DD6D0',
                                    boxShadow: isBest ? '0 0 8px #F4C95D' : '0 0 6px #3DD6D0',
                                  }}
                                />
                              </div>
                            </div>

                            {/* Split Time & Rank */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                              {isBest && (
                                <span
                                  className="hidden sm:inline-block text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider"
                                  style={{
                                    fontFamily: "'Orbitron', sans-serif",
                                    background: 'rgba(244,201,93,0.2)',
                                    color: '#F4C95D',
                                    border: '1px solid #F4C95D',
                                  }}
                                >
                                  ⚡ BEST
                                </span>
                              )}
                              <span
                                className="font-bold text-xs sm:text-sm"
                                style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                  color: isBest ? '#F4C95D' : '#F5F1E8',
                                }}
                              >
                                {formatTime(t)}
                              </span>
                            </div>
                          </div>

                          {/* Inputs Used Row */}
                          <div className="flex flex-wrap items-center gap-2 pl-2 sm:pl-8 border-t border-[#1E344D] pt-2 mt-1">
                            <span className="text-[8px] sm:text-[9px] text-[#AAB7C4] uppercase tracking-wider font-bold min-w-[70px]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                              Inputs:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {INPUT_LABELS.map(label => (
                                <span
                                  key={label}
                                  className="w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center text-xs sm:text-sm font-bold border transition-colors"
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
                            {usedInputs.A !== undefined && (
                              <span className="text-[8px] sm:text-[9px] text-[#AAB7C4] font-mono ml-2">
                                → {formatTime(t)}
                              </span>
                            )}
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
                  onClick={isLastLevel && allCleared ? restartAll : goToNextLevel}
                  className="w-full py-3.5 sm:py-4 rounded-xl border text-sm sm:text-base md:text-lg uppercase tracking-[0.2em] cursor-pointer font-bold transition-all duration-300 transform"
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    borderColor: '#F4C95D',
                    color: '#07111F',
                    background: 'linear-gradient(180deg, #F4C95D 0%, #E89B4A 100%)',
                    boxShadow: '0 0 30px rgba(244,201,93,0.4), 0 0 60px rgba(244,201,93,0.15)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 0 45px rgba(244,201,93,0.7), 0 0 90px rgba(244,201,93,0.3)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(244,201,93,0.4), 0 0 60px rgba(244,201,93,0.15)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {allCleared ? '↺ RESTART MISSION' : 'NEXT LEVEL →'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}