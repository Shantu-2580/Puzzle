import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import GameHeader from './components/GameHeader';
import ControlPanel from './components/ControlPanel';
import InputMatrix from './components/InputMatrix';
import CircuitDisplay from './components/CircuitDisplay';
import ResultTerminal from './components/ResultTerminal';
import {
  evaluate,
  findSolution,
  matchesAnswerKey,
  SETS,
  GATE_LABELS,
  formatTime,
  DEFAULT_INPUTS,
  INPUT_LABELS
} from './engine';

export default function App() {
  // ============================================================
  // SET SELECTION STATE
  // ============================================================
  const [selectedSet, setSelectedSet] = useState(null); // 'A', 'B', or 'C'
  const [showSetSelection, setShowSetSelection] = useState(true);

  // ============================================================
  // LEVEL PROGRESSION STATE
  // ============================================================
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [levelCleared, setLevelCleared] = useState(false);
  const [allCleared, setAllCleared] = useState(false);

  // ============================================================
  // INPUT AND LAYOUT STATE
  // ============================================================
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);

  const [layoutMode, setLayoutMode] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return 'flow';
    }

    return 'tree';
  });

  // ============================================================
  // TIMER STATE
  // Timer starts ONLY after the contestant makes an input action.
  // ============================================================
  const [isTimerStarted, setIsTimerStarted] = useState(false);
  const [levelStartTime, setLevelStartTime] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Recorded time for each level.
  const [levelTimes, setLevelTimes] = useState([]);

  // Input configuration used to solve each level.
  const [levelInputs, setLevelInputs] = useState([]);

  const clearTimerRef = useRef(null);

  // ============================================================
  // CURRENT SET / LEVEL
  // ============================================================
  const currentSet = selectedSet ? SETS[selectedSet] : null;

  const TOTAL_LEVELS_IN_SET = currentSet
    ? currentSet.levels.length
    : 0;

  const currentLevel =
    currentSet &&
    currentSet.levels[currentLevelIndex]
      ? currentSet.levels[currentLevelIndex]
      : null;

  const gateTypes = currentLevel
    ? currentLevel.gates
    : [];

  // ============================================================
  // COMPLETE RESET
  //
  // This is the important part.
  //
  // Whenever a set is finished, ALL runtime progress is cleared:
  // - selected set
  // - current level
  // - completed levels
  // - all-cleared flag
  // - level-cleared flag
  // - timer
  // - recorded times
  // - recorded input configurations
  // - inputs
  //
  // The player is then returned to the Set Selection screen.
  // ============================================================
  const resetEntireGame = useCallback(() => {
    // Cancel any pending level-clear timeout.
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }

    // Reset set/level progression.
    setSelectedSet(null);
    setShowSetSelection(true);

    setCurrentLevelIndex(0);
    setCompletedLevels([]);
    setLevelCleared(false);
    setAllCleared(false);

    // Reset inputs.
    setInputs(DEFAULT_INPUTS);

    // Reset timer.
    setIsTimerStarted(false);
    setLevelStartTime(null);
    setElapsedMs(0);

    // Reset recorded level telemetry.
    setLevelTimes([]);
    setLevelInputs([]);
  }, []);

  // ============================================================
  // SELECT A NEW SET
  //
  // Selecting a set always starts it completely fresh.
  // This prevents progress from a previous set from leaking into
  // the newly selected set.
  // ============================================================
  const handleSetSelection = useCallback((setKey) => {
    if (!SETS[setKey]) return;

    // Cancel any pending timer callback.
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }

    // Reset all runtime progress before starting the new set.
    setCurrentLevelIndex(0);
    setCompletedLevels([]);
    setLevelCleared(false);
    setAllCleared(false);

    setInputs(DEFAULT_INPUTS);

    setIsTimerStarted(false);
    setLevelStartTime(null);
    setElapsedMs(0);

    setLevelTimes([]);
    setLevelInputs([]);

    // Finally select the requested set.
    setSelectedSet(setKey);
    setShowSetSelection(false);
  }, []);

  // ============================================================
  // TIMER START
  // ============================================================
  const startTimerIfNeeded = useCallback(() => {
    if (!isTimerStarted && !levelCleared) {
      setIsTimerStarted(true);
      setLevelStartTime(Date.now());
    }
  }, [isTimerStarted, levelCleared]);

  // ============================================================
  // RESPONSIVE LAYOUT
  //
  // Desktop  -> Flow
  // Mobile   -> Tree
  // ============================================================
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

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // ============================================================
  // REAL-TIME LEVEL TIMER
  // ============================================================
  useEffect(() => {
    if (
      !isTimerStarted ||
      levelCleared ||
      allCleared ||
      !levelStartTime
    ) {
      return;
    }

    const interval = setInterval(() => {
      setElapsedMs(Date.now() - levelStartTime);
    }, 100);

    return () => clearInterval(interval);
  }, [
    isTimerStarted,
    levelStartTime,
    levelCleared,
    allCleared
  ]);

  // ============================================================
  // INITIALIZE LEVEL
  // ============================================================
  const initLevel = useCallback((setKey, levelIdx) => {
    if (!setKey || !SETS[setKey]) return;

    const levelData = SETS[setKey].levels[levelIdx];

    if (!levelData) return;

    setInputs(
      levelData.initialInputs || DEFAULT_INPUTS
    );

    setLevelCleared(false);

    setIsTimerStarted(false);
    setLevelStartTime(null);
    setElapsedMs(0);
  }, []);

  // ============================================================
  // INITIALIZE FIRST LEVEL WHEN A SET IS SELECTED
  // ============================================================
  useEffect(() => {
    if (selectedSet) {
      initLevel(selectedSet, 0);
    }
  }, [selectedSet, initLevel]);

  // ============================================================
  // CIRCUIT EVALUATION
  //
  // The level-specific circuit is passed into evaluate().
  // ============================================================
  const gateOutputs = useMemo(
    () =>
      evaluate(
        inputs,
        gateTypes,
        currentLevel?.circuit
      ),
    [
      inputs,
      gateTypes,
      currentLevel?.circuit
    ]
  );

  const finalOutput = gateOutputs[7];

  // ============================================================
  // WIN CONDITIONS
  //
  // A level is solved only when:
  //
  // 1. Final output matches target
  // 2. Answer key matches
  // 3. Fixed input constraint is satisfied
  // 4. Both fixed gate constraints are satisfied
  // ============================================================
  const isTargetOutputMet = currentLevel
    ? finalOutput === currentLevel.target
    : false;

  const isAnswerKeyMet = currentLevel
    ? matchesAnswerKey(
        inputs,
        currentLevel.answer
      )
    : false;

  const answerKeyMismatch =
    currentLevel && !isAnswerKeyMet;

  // ============================================================
  // FIXED INPUT VALIDATION
  // ============================================================
  const failedFixedInput = useMemo(() => {
    if (
      !currentLevel ||
      !currentLevel.fixedInputs
    ) {
      return null;
    }

    return Object.entries(
      currentLevel.fixedInputs
    ).find(
      ([inputKey, reqVal]) =>
        inputs[inputKey] !== reqVal
    );
  }, [
    currentLevel?.fixedInputs,
    inputs
  ]);

  // ============================================================
  // FIXED NODE VALIDATION
  // ============================================================
  const failedFixedNode = useMemo(() => {
    if (
      !currentLevel ||
      !currentLevel.fixedNodes
    ) {
      return null;
    }

    return Object.entries(
      currentLevel.fixedNodes
    ).find(([nodeLabel, reqVal]) => {
      const nodeIdx =
        currentLevel.circuit?.find(
          node => node.label === nodeLabel
        )?.id;

      return (
        nodeIdx !== undefined &&
        gateOutputs[nodeIdx] !== reqVal
      );
    });
  }, [
    currentLevel?.fixedNodes,
    currentLevel?.circuit,
    gateOutputs
  ]);

  // ============================================================
  // FINAL LEVEL SUCCESS
  // ============================================================
  const success =
    currentLevel &&
    isTargetOutputMet &&
    isAnswerKeyMet &&
    !failedFixedInput &&
    !failedFixedNode;

  // ============================================================
  // TOTAL SET TIME
  // ============================================================
  const totalMs = useMemo(() => {
    return levelTimes.reduce(
      (acc, t) => acc + t,
      0
    );
  }, [levelTimes]);

  // ============================================================
  // LEVEL COMPLETION DETECTION
  //
  // When a level is solved:
  //
  // 1. Mark it cleared
  // 2. Save its time
  // 3. Save the inputs used
  // 4. Add it to completedLevels
  // 5. If every level is completed, set allCleared=true
  // ============================================================
  useEffect(() => {
    if (success && !levelCleared) {
      const finalLvlTime = levelStartTime
        ? Date.now() - levelStartTime
        : 100;

      clearTimerRef.current = setTimeout(() => {
        clearTimerRef.current = null;

        setLevelCleared(true);
        setElapsedMs(finalLvlTime);

        // Save level time.
        setLevelTimes(prev => {
          const next = [...prev];
          next[currentLevelIndex] = finalLvlTime;
          return next;
        });

        // Save inputs used for this level.
        setLevelInputs(prev => {
          const next = [...prev];
          next[currentLevelIndex] = {
            ...inputs
          };
          return next;
        });

        // Mark level as completed.
        setCompletedLevels(prev => {
          const next = prev.includes(
            currentLevelIndex
          )
            ? prev
            : [...prev, currentLevelIndex];

          // Entire set has now been completed.
          if (
            next.length === TOTAL_LEVELS_IN_SET
          ) {
            setAllCleared(true);
          }

          return next;
        });
      }, 600);
    }

    return () => {
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }
    };
  }, [
    success,
    levelCleared,
    currentLevelIndex,
    levelStartTime,
    inputs,
    TOTAL_LEVELS_IN_SET
  ]);

  // ============================================================
  // INPUT TOGGLE
  // ============================================================
  const toggleInput = useCallback(
    (label) => {
      if (levelCleared) return;

      startTimerIfNeeded();

      setInputs(prev => ({
        ...prev,
        [label]: prev[label] ^ 1
      }));
    },
    [
      levelCleared,
      startTimerIfNeeded
    ]
  );

  // ============================================================
  // RESET INPUTS FOR CURRENT LEVEL
  // ============================================================
  const resetInputs = useCallback(() => {
    if (levelCleared) return;

    startTimerIfNeeded();

    if (
      currentSet &&
      currentSet.levels[currentLevelIndex]
    ) {
      setInputs(
        currentSet.levels[currentLevelIndex]
          .initialInputs ||
          DEFAULT_INPUTS
      );
    }
  }, [
    levelCleared,
    startTimerIfNeeded,
    currentSet,
    currentLevelIndex
  ]);

  // ============================================================
  // RANDOMIZE INPUTS
  // ============================================================
  const randomizeInputs = useCallback(() => {
    if (levelCleared) return;

    startTimerIfNeeded();

    setInputs(
      Object.fromEntries(
        INPUT_LABELS.map(label => [
          label,
          Math.random() > 0.5 ? 1 : 0
        ])
      )
    );
  }, [
    levelCleared,
    startTimerIfNeeded
  ]);

  // ============================================================
  // ADMIN SKIP LEVEL
  // ============================================================
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
  }, [
    currentLevel,
    levelCleared,
    startTimerIfNeeded
  ]);

  // ============================================================
  // GO TO NEXT LEVEL
  // ============================================================
  const goToNextLevel = useCallback(() => {
    if (
      currentLevelIndex <
      TOTAL_LEVELS_IN_SET - 1
    ) {
      const nextIdx =
        currentLevelIndex + 1;

      setCurrentLevelIndex(nextIdx);

      initLevel(
        selectedSet,
        nextIdx
      );
    }
  }, [
    currentLevelIndex,
    TOTAL_LEVELS_IN_SET,
    selectedSet,
    initLevel
  ]);

  // ============================================================
  // SELECT LEVEL
  // ============================================================
  const selectLevel = useCallback(
    (levelIndex) => {
      if (
        levelIndex === currentLevelIndex ||
        levelIndex < 0 ||
        levelIndex >= TOTAL_LEVELS_IN_SET
      ) {
        return;
      }

      setCurrentLevelIndex(levelIndex);

      initLevel(
        selectedSet,
        levelIndex
      );
    },
    [
      currentLevelIndex,
      TOTAL_LEVELS_IN_SET,
      selectedSet,
      initLevel
    ]
  );

  // ============================================================
  // RESTART CURRENT SET
  //
  // This is different from resetEntireGame().
  //
  // restartSet() keeps the player in the same set and
  // starts that set again from Level 1.
  // ============================================================
  const restartSet = useCallback(() => {
    if (!selectedSet) return;

    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }

    setCurrentLevelIndex(0);
    setCompletedLevels([]);
    setLevelCleared(false);
    setAllCleared(false);

    setLevelTimes([]);
    setLevelInputs([]);

    setInputs(DEFAULT_INPUTS);

    setIsTimerStarted(false);
    setLevelStartTime(null);
    setElapsedMs(0);

    initLevel(
      selectedSet,
      0
    );
  }, [
    selectedSet,
    initLevel
  ]);

  // ============================================================
  // LEVEL INFORMATION
  // ============================================================
  const isLastLevel =
    currentLevelIndex ===
    TOTAL_LEVELS_IN_SET - 1;

  const levelNum =
    currentLevelIndex + 1;

  // ============================================================
  // SET SELECTION SCREEN
  // ============================================================
  if (
    showSetSelection &&
    !selectedSet
  ) {
    const setMeta = {
      A: { accent: '#d4b483', note: 'The first gate' },
      B: { accent: '#e08a3c', note: 'The second gate' },
      C: { accent: '#6ec8c4', note: 'The third gate' },
    };

    return (
      <div className="h-[100dvh] min-h-0 bg-chamber flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-6xl text-center flex flex-col items-center" style={{ animation: 'gate-enter 0.7s ease' }}>
          <p className="text-[12px] text-[#9aa6b4] font-ui mb-3">A logic labyrinth</p>
          <h1 className="font-display text-4xl sm:text-6xl text-[#d4b483] tracking-[0.14em] mb-4">
            The Minotaur's Gates
          </h1>
          <div className="w-20 h-px bg-[#d4b483]/45 mb-4" aria-hidden="true" />
          <p className="text-[#9aa6b4] font-ui mb-10 sm:mb-12 max-w-lg mx-auto">
            Three chambers. Eight keys. One true path through the circuit.
          </p>

          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {['A', 'B', 'C'].map((setKey, index) => (
              <button
                key={setKey}
                onClick={() => handleSetSelection(setKey)}
                className="selection-card group min-h-56 px-8 py-9 rounded-2xl text-center cursor-pointer flex flex-col items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ede6d6] focus-visible:ring-offset-4 focus-visible:ring-offset-[#080b12]"
                style={{
                  '--set-accent': setMeta[setKey].accent,
                  animation: `gate-enter 0.7s ease ${0.08 * index}s both`,
                }}
              >
                <span className="block font-display text-5xl leading-none mb-5" style={{ color: setMeta[setKey].accent }}>
                  {setKey}
                </span>
                <span className="block text-lg font-ui text-[#ede6d6]">Set {setKey}</span>
                <span className="block text-sm text-[#9aa6b4] mt-1 font-ui">{setMeta[setKey].note}</span>
                <span className="selection-card__cue mt-5 text-[11px] font-ui tracking-[0.12em]" style={{ color: setMeta[setKey].accent }}>
                  Enter chamber <span aria-hidden="true">→</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN GAME UI
  // ============================================================
  return (
    <div className="h-[100dvh] min-h-0 bg-chamber flex flex-col relative w-full overflow-hidden">

      {/* ========================================================
          HEADER
      ======================================================== */}
      <GameHeader
        currentLevel={levelNum}
        TOTAL_LEVELS={
          TOTAL_LEVELS_IN_SET
        }
        levelCleared={levelCleared}
        isTimerStarted={
          isTimerStarted
        }
        elapsedMs={elapsedMs}
        totalMs={totalMs}
        layoutMode={layoutMode}
        setLayoutMode={
          setLayoutMode
        }
        selectedSet={
          selectedSet
        }
      />

      {/* ========================================================
          MAIN CONTENT
      ======================================================== */}
      <main className="min-h-0 flex-1 flex flex-col px-3 sm:px-6 md:px-8 pb-3 gap-3 sm:gap-4 overflow-hidden">

        {/* ======================================================
            CONTROL PANEL
        ====================================================== */}
        <ControlPanel
          currentLevel={levelNum}
          TOTAL_LEVELS={
            TOTAL_LEVELS_IN_SET
          }
          completedLevels={
            completedLevels
          }
          onSelectLevel={
            selectLevel
          }
          SETS={SETS}
          selectedSet={
            selectedSet
          }
          inputs={inputs}
          setInputs={
            setInputs
          }
          levelCleared={
            levelCleared
          }
          puzzle={
            currentLevel
          }
          gateOutputs={
            gateOutputs
          }
          fixedInputs={
            currentLevel?.fixedInputs
          }
          GATE_LABELS={
            GATE_LABELS
          }
          resetInputs={
            resetInputs
          }
          randomizeInputs={
            randomizeInputs
          }
        />

        {/* ======================================================
            INPUT MATRIX
        ====================================================== */}
        <InputMatrix
          inputs={inputs}
          fixedInputs={
            currentLevel?.fixedInputs
          }
          levelCleared={
            levelCleared
          }
          toggleInput={
            toggleInput
          }
          isTimerStarted={
            isTimerStarted
          }
          startTimerIfNeeded={
            startTimerIfNeeded
          }
        />

        {/* ======================================================
            CIRCUIT
        ====================================================== */}
        <CircuitDisplay
          inputs={inputs}
          gateOutputs={
            gateOutputs
          }
          gateTypes={
            gateTypes
          }
          fixedInputs={
            currentLevel?.fixedInputs
          }
          fixedNodes={
            currentLevel?.fixedNodes
          }
          circuit={
            currentLevel?.circuit
          }
          layoutMode={
            layoutMode
          }
          setLayoutMode={
            setLayoutMode
          }
        />

        {/* ======================================================
            RESULT TERMINAL
        ====================================================== */}
        <ResultTerminal
          success={success}
          failedFixedInput={
            failedFixedInput
          }
          failedFixedNode={
            failedFixedNode
          }
          answerKeyMismatch={
            answerKeyMismatch
          }
          gateOutputs={
            gateOutputs
          }
          GATE_LABELS={
            GATE_LABELS
          }
          puzzle={
            currentLevel
          }
          levelNum={
            levelNum
          }
          elapsedMs={
            elapsedMs
          }
          totalMs={
            totalMs
          }
          levelCleared={
            levelCleared
          }
          isLastLevel={
            isLastLevel
          }
          goToNextLevel={
            goToNextLevel
          }
          restartSet={
            restartSet
          }
          selectedSet={
            selectedSet
          }
          SETS={SETS}
        />

      </main>

      {/* ========================================================
          FOOTER
      ======================================================== */}
      <footer className="hidden sm:flex px-8 py-3 items-center justify-between flex-shrink-0">
        <span className="text-[11px] text-[#9aa6b4] font-ui">
          Minotaur Logic Systems
        </span>
        <span className="text-[11px] text-[#9aa6b4] font-data">
          {selectedSet ? `Set ${selectedSet}` : 'Choose a gate'}
          {' · '}
          {completedLevels.length}/{TOTAL_LEVELS_IN_SET} cleared
          {' · '}
          {formatTime(totalMs)}
        </span>
      </footer>

      {/* ========================================================
          LEVEL / SET COMPLETION OVERLAY
      ======================================================== */}
      {levelCleared && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          style={{
            background: 'rgba(8, 11, 18, 0.82)',
            backdropFilter: 'blur(16px)',
            animation: 'fadeIn 0.35s ease'
          }}
        >
          <div
            className="w-full relative my-auto rounded-2xl hairline overflow-hidden flex flex-col"
            style={{
              maxWidth: allCleared ? '1020px' : '520px',
              animation: 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div className="p-6 sm:p-8 flex flex-col gap-5 sm:gap-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-display text-[#d4b483] tracking-[0.08em]">
                  {allCleared
                    ? `Set ${selectedSet} complete`
                    : `Level ${levelNum} cleared`}
                </h2>
                <p className="text-sm text-[#9aa6b4] font-ui">
                  {allCleared
                    ? `${currentSet?.word} mastered`
                    : currentLevel?.name}
                </p>
              </div>

              <div className="text-center py-3">
                <span className="text-[12px] text-[#9aa6b4] font-ui block mb-1">
                  Set time
                </span>
                <span className="text-3xl font-data text-[#d4b483]">
                  {formatTime(totalMs)}
                </span>
              </div>

              {/* =================================================
                  LEVEL TELEMETRY
              ================================================= */}
              {allCleared && (
                <div className="space-y-2 hairline rounded-xl p-3 sm:p-4 md:p-5">

                  <div className="space-y-1.5 sm:space-y-2 max-h-[360px] sm:max-h-[420px] overflow-y-auto pr-1.5 custom-scrollbar">

                    {currentSet?.levels.map(
                      (level, idx) => {
                        const usedInputs =
                          levelInputs[idx] ||
                          {};

                        return (
                          <div
                            key={idx}
                            className="flex flex-col gap-2 p-2.5 sm:p-3 rounded-lg border text-xs sm:gap-4 transition-colors"
                            style={{
                              background:
                                'rgba(13,27,42,0.6)',
                              borderColor:
                                '#1E344D'
                            }}
                          >

                            {/* LEVEL HEADER */}
                            <div className="flex items-center justify-between flex-wrap gap-2">

                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">

                                <span
                                  className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-[9px] sm:text-[10px] font-bold flex-shrink-0"
                                  style={{
                                    fontFamily:
                                      "'Outfit', sans-serif",

                                    background:
                                      'rgba(61,214,208,0.1)',

                                    color:
                                      '#3DD6D0',

                                    border:
                                      '1px solid #3DD6D0'
                                  }}
                                >
                                  {idx + 1}
                                </span>

                                <div className="min-w-0">

                                  <div
                                    className="font-semibold text-[11px] sm:text-xs text-[#F5F1E8] truncate"
                                    style={{
                                      fontFamily:
                                        "'IBM Plex Mono', monospace"
                                    }}
                                  >
                                    {level.name}
                                  </div>

                                  <div className="text-[9px] text-[#3DD6D0] font-mono font-bold">
                                    Target Output:{' '}
                                    {level.target}
                                  </div>

                                </div>

                              </div>

                            </div>

                            {/* INPUTS USED */}
                            <div className="flex flex-wrap items-center gap-2 pl-2 sm:pl-8 border-t border-[#1E344D] pt-2 mt-1">

                              <span
                                className="text-[8px] sm:text-[9px] text-[#AAB7C4] uppercase tracking-wider font-bold min-w-[70px]"
                                style={{
                                  fontFamily:
                                    "'Outfit', sans-serif"
                                }}
                              >
                                Inputs:
                              </span>

                              <div className="flex flex-wrap gap-1.5 sm:gap-2">

                                {INPUT_LABELS.map(
                                  label => (
                                    <span
                                      key={label}
                                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-md flex items-center justify-center text-sm sm:text-base font-bold border-2 transition-colors"
                                      style={{
                                        fontFamily:
                                          "'Outfit', sans-serif",

                                        background:
                                          usedInputs[
                                            label
                                          ] === 1
                                            ? 'rgba(244,201,93,0.2)'
                                            : 'rgba(61,214,208,0.1)',

                                        color:
                                          usedInputs[
                                            label
                                          ] === 1
                                            ? '#F4C95D'
                                            : '#3DD6D0',

                                        borderColor:
                                          usedInputs[
                                            label
                                          ] === 1
                                            ? '#F4C95D'
                                            : '#3DD6D0'
                                      }}
                                    >
                                      {label}=
                                      {usedInputs[
                                        label
                                      ] ?? 0}
                                    </span>
                                  )
                                )}

                              </div>
                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>
              )}

              {/* =================================================
                  ACTION BUTTON
              ================================================= */}
              <div className="pt-1 sm:pt-2">
                <button
                  onClick={allCleared ? resetEntireGame : goToNextLevel}
                  className="w-full py-3.5 rounded-md text-base cursor-pointer font-ui font-medium"
                  style={{
                    color: '#080b12',
                    background: 'linear-gradient(180deg, #e8d3a8 0%, #d4b483 100%)',
                  }}
                >
                  {allCleared ? 'Finish' : 'Next level'}
                </button>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
