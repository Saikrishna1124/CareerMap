import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame, Trophy, HelpCircle, Shuffle, RotateCcw,
  XCircle, Share2, Sparkles, Clock, Heart, Award, ArrowRight,
  Zap, Lightbulb, Info, Timer, CheckCircle2
} from 'lucide-react';
import { getPuzzleForDate, DailyPuzzle, WordCategory } from '../data/dailyPuzzles';
import {
  getTodayDateStr, getYesterdayDateStr, loadUserGameState,
  saveUserGameState, getTimeUntilNextPuzzle, generateShareText,
  formatTimeSeconds, UserGameState
} from '../utils/dailyGameUtils';
import { useAuth } from '../context/AuthContext';

export const DailyGamePage: React.FC = () => {
  const { user } = useAuth();
  const userId = useMemo(() => user?.email || user?.id || 'guest', [user]);

  const todayStr = useMemo(() => getTodayDateStr(), []);
  const currentPuzzle = useMemo(() => getPuzzleForDate(todayStr), [todayStr]);

  // Flatten all 16 items for shuffle grid
  const allWords = useMemo(() => {
    const words: string[] = [];
    currentPuzzle.categories.forEach(cat => words.push(...cat.items));
    return words;
  }, [currentPuzzle]);

  // State
  const [gameState, setGameState] = useState<UserGameState>(() => loadUserGameState(userId));
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [solvedCategories, setSolvedCategories] = useState<WordCategory[]>([]);
  const [livesRemaining, setLivesRemaining] = useState<number>(4);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [shakeGrid, setShakeGrid] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showShareSuccess, setShowShareSuccess] = useState<boolean>(false);

  // Live Game Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Progressive Smart Hint State (No Timer / Cooldown)
  const [revealedCategoryIds, setRevealedCategoryIds] = useState<string[]>([]);
  const [highlightedCategoryIds, setHighlightedCategoryIds] = useState<string[]>([]);
  const [activeHintText, setActiveHintText] = useState<string | null>(null);
  const [highlightedWords, setHighlightedWords] = useState<string[]>([]);

  // Live game timer effect (stops when game is completed)
  useEffect(() => {
    if (isCompleted) return;

    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted]);

  // Initialize or restore today's game session
  useEffect(() => {
    const state = loadUserGameState(userId);
    setGameState(state);

    if (state.todayState && state.todayState.dateStr === todayStr) {
      // Restore today's state
      const solvedCats = currentPuzzle.categories.filter(c =>
        state.todayState?.solvedCategoryIds.includes(c.id)
      );
      setSolvedCategories(solvedCats);
      setLivesRemaining(state.todayState.livesRemaining);
      setIsCompleted(state.todayState.isCompleted);
      setIsWon(state.todayState.isWon);
      setShuffledWords(state.todayState.remainingWords);
      if (state.todayState.timeTakenSeconds) {
        setElapsedSeconds(state.todayState.timeTakenSeconds);
      }
    } else {
      // New day / initial shuffle
      const shuffled = [...allWords].sort(() => Math.random() - 0.5);
      setShuffledWords(shuffled);
      setElapsedSeconds(0);
    }
  }, [userId, todayStr, currentPuzzle, allWords]);

  // Toast trigger helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Smart Progressive Hint Handler (NO TIMER, NEVER REPEATS SAME HINT)
  const handleUseHint = () => {
    if (isCompleted) return;

    // 1. Get remaining unsolved categories
    const unsolvedCategories = currentPuzzle.categories.filter(
      cat => !solvedCategories.some(sc => sc.id === cat.id)
    );

    if (unsolvedCategories.length === 0) return;

    // 2. Find the first unsolved category that hasn't had its title revealed yet
    const nextUnrevealedCat = unsolvedCategories.find(
      cat => !revealedCategoryIds.includes(cat.id)
    );

    if (nextUnrevealedCat) {
      setRevealedCategoryIds(prev => [...prev, nextUnrevealedCat.id]);
      const hintMsg = `💡 Hint: Find 4 words related to "${nextUnrevealedCat.name}"`;
      setActiveHintText(hintMsg);
      showToast(hintMsg);
      return;
    }

    // 3. If all unsolved categories had titles revealed, find first category to highlight matching pair
    const nextUnhighlightedCat = unsolvedCategories.find(
      cat => !highlightedCategoryIds.includes(cat.id)
    );

    if (nextUnhighlightedCat) {
      setHighlightedCategoryIds(prev => [...prev, nextUnhighlightedCat.id]);
      const pair = nextUnhighlightedCat.items.slice(0, 2);
      setHighlightedWords(prev => Array.from(new Set([...prev, ...pair])));
      // Auto-select those 2 matching words on the board for convenience!
      setSelectedWords(prev => Array.from(new Set([...prev, ...pair])).slice(0, 4));
      const hintMsg = `💡 Highlighted: "${pair[0]}" & "${pair[1]}" belong in "${nextUnhighlightedCat.name}"!`;
      setActiveHintText(hintMsg);
      showToast(hintMsg);
      return;
    }

    // 4. If all items were hinted, auto-select full matching set of 4 for the next unsolved category!
    const targetCat = unsolvedCategories[0];
    setSelectedWords(targetCat.items);
    const hintMsg = `💡 Selected all 4 words for "${targetCat.name}"! Click Submit!`;
    setActiveHintText(hintMsg);
    showToast(hintMsg);
  };

  // Shuffle grid handler
  const handleShuffle = () => {
    setShuffledWords(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  // Deselect all
  const handleDeselectAll = () => {
    setSelectedWords([]);
  };

  // Toggle word selection
  const handleWordClick = (word: string) => {
    if (isCompleted) return;
    if (selectedWords.includes(word)) {
      setSelectedWords(prev => prev.filter(w => w !== word));
    } else {
      if (selectedWords.length >= 4) {
        showToast('Select exactly 4 words');
        return;
      }
      setSelectedWords(prev => [...prev, word]);
    }
  };

  // Submit 4 selected words
  const handleSubmitGuess = () => {
    if (selectedWords.length !== 4) {
      showToast('Select 4 words to submit');
      return;
    }

    // Check if matching any remaining category
    const remainingCategories = currentPuzzle.categories.filter(
      cat => !solvedCategories.some(sc => sc.id === cat.id)
    );

    const matchedCategory = remainingCategories.find(cat =>
      cat.items.every(item => selectedWords.includes(item))
    );

    if (matchedCategory) {
      // Correct group found!
      const newSolved = [...solvedCategories, matchedCategory];
      setSolvedCategories(newSolved);

      // Remove items from remaining grid & clear highlights
      const newRemainingWords = shuffledWords.filter(w => !selectedWords.includes(w));
      setShuffledWords(newRemainingWords);
      setSelectedWords([]);
      setHighlightedWords(prev => prev.filter(w => !selectedWords.includes(w)));
      setActiveHintText(null);

      showToast(`✨ Found: ${matchedCategory.name}!`);

      // Check if all 4 categories solved
      if (newSolved.length === 4) {
        finishGame(true, newSolved);
      } else {
        saveCurrentProgress(newSolved, livesRemaining, false, false, newRemainingWords);
      }
    } else {
      // Wrong guess! Check if "One Away" (3 out of 4 belong to a category)
      let isOneAway = false;
      remainingCategories.forEach(cat => {
        const overlapCount = cat.items.filter(item => selectedWords.includes(item)).length;
        if (overlapCount === 3) isOneAway = true;
      });

      setShakeGrid(true);
      setTimeout(() => setShakeGrid(false), 500);

      const newLives = livesRemaining - 1;
      setLivesRemaining(newLives);
      setSelectedWords([]);

      if (isOneAway) {
        showToast('🔥 One away! 3 words belong together');
      } else {
        showToast('❌ Not quite right. Try another combination');
      }

      if (newLives <= 0) {
        // Game Over - Ran out of lives
        finishGame(false, solvedCategories);
      } else {
        saveCurrentProgress(solvedCategories, newLives, false, false, shuffledWords);
      }
    }
  };

  // Save progress helper
  const saveCurrentProgress = (
    solved: WordCategory[],
    lives: number,
    completed: boolean,
    won: boolean,
    remWords: string[]
  ) => {
    const currentState = loadUserGameState(userId);
    const updated: UserGameState = {
      ...currentState,
      todayState: {
        dateStr: todayStr,
        solvedCategoryIds: solved.map(s => s.id),
        guessesHistory: [],
        livesRemaining: lives,
        isCompleted: completed,
        isWon: won,
        remainingWords: remWords,
        timeTakenSeconds: elapsedSeconds
      }
    };
    saveUserGameState(updated, userId);
    setGameState(updated);
  };

  // Finish game logic (Streak & Best Time calculations)
  const finishGame = (won: boolean, finalSolved: WordCategory[]) => {
    setIsCompleted(true);
    setIsWon(won);

    const currentState = loadUserGameState(userId);
    const yesterdayStr = getYesterdayDateStr();

    let newStreak = currentState.currentStreak;

    if (won) {
      // If played yesterday or today for first time, streak increments!
      if (currentState.lastPlayedDate === yesterdayStr || currentState.lastPlayedDate === todayStr) {
        newStreak = currentState.currentStreak + 1;
      } else if (!currentState.lastPlayedDate) {
        newStreak = 1;
      } else {
        // Reset streak if day missed
        newStreak = 1;
      }
    } else {
      // Lost today's game -> streak resets
      newStreak = 0;
    }

    const newMaxStreak = Math.max(currentState.maxStreak, newStreak);
    const newTotalPlayed = currentState.totalGamesPlayed + 1;
    const newTotalWins = currentState.totalWins + (won ? 1 : 0);

    // Calculate best completion time (LinkedIn style)
    let newBestTime = currentState.bestTimeSeconds;
    if (won) {
      if (!newBestTime || elapsedSeconds < newBestTime) {
        newBestTime = elapsedSeconds;
      }
    }

    const finalState: UserGameState = {
      lastPlayedDate: todayStr,
      currentStreak: newStreak,
      maxStreak: newMaxStreak,
      bestTimeSeconds: newBestTime,
      totalGamesPlayed: newTotalPlayed,
      totalWins: newTotalWins,
      todayState: {
        dateStr: todayStr,
        solvedCategoryIds: finalSolved.map(s => s.id),
        guessesHistory: [],
        livesRemaining: 0,
        isCompleted: true,
        isWon: won,
        remainingWords: [],
        timeTakenSeconds: elapsedSeconds
      }
    };

    saveUserGameState(finalState, userId);
    setGameState(finalState);
  };

  // Copy share result text
  const handleShareResult = () => {
    const text = generateShareText(
      todayStr,
      isWon,
      gameState.currentStreak,
      solvedCategories.map(s => s.id),
      elapsedSeconds
    );
    navigator.clipboard.writeText(text);
    setShowShareSuccess(true);
    setTimeout(() => setShowShareSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800 rounded-3xl p-6 shadow-xl shadow-warm-border/10 dark:shadow-black/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1 text-center md:text-left z-10">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border border-amber-300 dark:border-amber-700/50 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Daily Mind Gym
            </span>
            <button
              onClick={() => setShowRulesModal(true)}
              className="text-warm-hint hover:text-brand-purple p-1 transition"
              title="How to play"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-warm-text dark:text-white tracking-tight">
            Career Connections
          </h1>
          <p className="text-xs sm:text-sm text-warm-secondary font-medium">
            Group 4 related tech & career concepts together. 1 puzzle per day!
          </p>
        </div>

        {/* Live Timer & Stats Widgets */}
        <div className="flex flex-wrap items-center justify-center gap-3 z-10">
          {/* Live Play Timer Ticker */}
          <div className="bg-stone-100 dark:bg-stone-800 border border-warm-border dark:border-stone-700 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-inner">
            <Timer className="w-5 h-5 text-brand-purple animate-spin-slow" />
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-warm-hint">
                Time
              </p>
              <p className="text-lg font-mono font-black text-warm-text dark:text-white leading-none">
                {formatTimeSeconds(elapsedSeconds)}
              </p>
            </div>
          </div>

          {/* Best Time (LinkedIn Style) */}
          {gameState.bestTimeSeconds !== undefined && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-3.5 py-2.5 rounded-2xl flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Best Time
                </p>
                <p className="text-base font-mono font-black text-warm-text dark:text-white leading-none">
                  {formatTimeSeconds(gameState.bestTimeSeconds)}
                </p>
              </div>
            </div>
          )}

          {/* Current Streak */}
          <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Daily Streak
              </p>
              <p className="text-lg font-black text-warm-text dark:text-white leading-none">
                {gameState.currentStreak} <span className="text-xs font-bold text-orange-500">Days 🔥</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-2xl border border-stone-700 flex items-center gap-2 text-center max-w-md"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Hint Banner */}
      {activeHintText && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700/60 rounded-2xl p-3.5 text-center text-amber-900 dark:text-amber-200 text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm"
        >
          <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0 animate-bounce" />
          <span>{activeHintText}</span>
        </motion.div>
      )}

      {/* Solved Categories Stack */}
      <div className="space-y-3">
        {solvedCategories.map(cat => (
          <motion.div
            key={cat.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${cat.color} ${cat.borderColor} border-2 rounded-2xl p-4 text-center shadow-md`}
          >
            <h3 className={`text-xs font-black uppercase tracking-wider ${cat.textColor}`}>
              {cat.name}
            </h3>
            <p className={`text-sm sm:text-base font-extrabold tracking-wide mt-0.5 ${cat.textColor}`}>
              {cat.items.join(' • ')}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Unsolved Words Grid (4x4) */}
      {!isCompleted && (
        <motion.div
          animate={shakeGrid ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {shuffledWords.map(word => {
            const isSelected = selectedWords.includes(word);
            const isHighlighted = highlightedWords.includes(word);

            return (
              <button
                key={word}
                onClick={() => handleWordClick(word)}
                className={`h-24 sm:h-28 rounded-2xl font-black text-xs sm:text-sm tracking-wide transition-all duration-200 p-2 flex items-center justify-center text-center shadow-sm select-none border-2 relative ${isSelected
                    ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-stone-900 dark:border-white scale-95 ring-4 ring-purple-500/20'
                    : isHighlighted
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-400 ring-4 ring-amber-400/30 font-bold scale-105'
                      : 'bg-white dark:bg-stone-900 text-warm-text dark:text-stone-100 border-warm-border dark:border-stone-800 hover:border-brand-purple/50 dark:hover:border-purple-500/50 hover:shadow-md'
                  }`}
              >
                {word}
                {isHighlighted && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Game Controls & Smart Progressive Hint Button (NO TIMER!) */}
      {!isCompleted && (
        <div className="space-y-6 pt-2">
          {/* Lives Indicators */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-extrabold text-warm-hint uppercase tracking-wider mr-1">
              Mistakes Remaining:
            </span>
            {[1, 2, 3, 4].map(idx => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${idx <= livesRemaining
                    ? 'bg-rose-500 shadow-sm shadow-rose-500/40 scale-100'
                    : 'bg-stone-300 dark:bg-stone-800 scale-75'
                  }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Smart Hint Button (Instant, Progressive, No Timer!) */}
            <button
              onClick={handleUseHint}
              className="px-4 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900/80 text-amber-900 dark:text-amber-200 border border-amber-400 font-bold text-xs transition flex items-center gap-2 shadow-sm hover:scale-105 active:scale-95"
              title="Click for a progressive hint! Always reveals new info"
            >
              <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Get Hint! ✨</span>
            </button>

            <button
              onClick={handleShuffle}
              className="px-4 py-2.5 rounded-2xl border border-warm-border dark:border-stone-800 bg-white dark:bg-stone-900 font-bold text-xs text-warm-text dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition flex items-center gap-2 shadow-sm"
            >
              <Shuffle className="w-4 h-4 text-warm-hint" />
              Shuffle
            </button>

            <button
              onClick={handleDeselectAll}
              disabled={selectedWords.length === 0}
              className="px-4 py-2.5 rounded-2xl border border-warm-border dark:border-stone-800 bg-white dark:bg-stone-900 font-bold text-xs text-warm-text dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              <RotateCcw className="w-4 h-4 text-warm-hint" />
              Deselect All
            </button>

            <button
              onClick={handleSubmitGuess}
              disabled={selectedWords.length !== 4}
              className="px-6 py-2.5 rounded-2xl bg-brand-purple hover:bg-purple-700 text-white font-extrabold text-xs transition shadow-lg shadow-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Submit ({selectedWords.length}/4)
            </button>
          </div>
        </div>
      )}

      {/* Completion Banner (LinkedIn-Style Finish Screen) */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-stone-900 border-2 border-amber-300 dark:border-amber-700/60 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-orange-400/10 rounded-full blur-3xl" />

          {/* Puzzle # & Headline */}
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-700">
              Connections #14
            </span>
            <h2 className="text-3xl font-black text-warm-text dark:text-white tracking-tight pt-2">
              {isWon ? "You’re crushing it! 🎉" : "Good Attempt! Better Luck Tomorrow"}
            </h2>
            <p className="text-xs sm:text-sm text-warm-hint font-medium">
              {isWon
                ? "Here is how you performed against today’s puzzle."
                : "You ran out of tries today. Streak resets tomorrow!"}
            </p>
          </div>

          {/* LinkedIn-Style Golden Chiclet & Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
            {/* Streak Chiclet */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-4 rounded-2xl shadow-md flex flex-col items-center justify-center text-center">
              <Flame className="w-6 h-6 mb-1 animate-bounce text-amber-200" />
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-100">Streak</p>
              <p className="text-lg font-black">{gameState.currentStreak}-day streak!</p>
            </div>

            {/* Play Time */}
            <div className="bg-stone-50 dark:bg-stone-950 border border-warm-border dark:border-stone-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <Timer className="w-5 h-5 mb-1 text-brand-purple" />
              <p className="text-[10px] font-black uppercase tracking-wider text-warm-hint">Your Time</p>
              <p className="text-lg font-mono font-black text-warm-text dark:text-white">{formatTimeSeconds(elapsedSeconds)}</p>
            </div>

            {/* Today's Average */}
            <div className="bg-stone-50 dark:bg-stone-950 border border-warm-border dark:border-stone-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <Zap className="w-5 h-5 mb-1 text-amber-500" />
              <p className="text-[10px] font-black uppercase tracking-wider text-warm-hint">Today’s Avg</p>
              <p className="text-lg font-mono font-black text-warm-text dark:text-white">0:26</p>
            </div>

            {/* Leaderboard Rank */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <Trophy className="w-5 h-5 mb-1 text-emerald-600 dark:text-emerald-400" />
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Global Rank</p>
              <p className="text-sm font-black text-emerald-800 dark:text-emerald-200">Top 25% of players</p>
            </div>
          </div>

          {/* Reveal unrevealed categories if lost */}
          {!isWon && (
            <div className="space-y-2 text-left max-w-lg mx-auto relative z-10">
              <p className="text-xs font-bold text-warm-hint uppercase tracking-wider text-center">
                Unsolved Categories Revealed:
              </p>
              {currentPuzzle.categories
                .filter(cat => !solvedCategories.some(sc => sc.id === cat.id))
                .map(cat => (
                  <div key={cat.id} className={`${cat.color} ${cat.borderColor} border rounded-xl p-3 text-center`}>
                    <span className={`text-[10px] font-black uppercase ${cat.textColor}`}>{cat.name}</span>
                    <p className={`text-xs font-bold ${cat.textColor}`}>{cat.items.join(' • ')}</p>
                  </div>
                ))}
            </div>
          )}

          {/* LinkedIn Action Buttons (Post / Send / Copy) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 relative z-10">
            {/* Direct LinkedIn Post Button */}
            <a
              href={`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(
                generateShareText(todayStr, isWon, gameState.currentStreak, solvedCategories.map(s => s.id), elapsedSeconds)
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-2xl bg-[#0A66C2] hover:bg-[#004182] text-white font-extrabold text-xs transition flex items-center gap-2 shadow-lg hover:scale-105"
            >
              <Share2 className="w-4 h-4" />
              Post on LinkedIn
            </a>

            {/* Copy Button */}
            <button
              onClick={handleShareResult}
              className="px-6 py-3 rounded-2xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-extrabold text-xs transition flex items-center gap-2 shadow-lg hover:scale-105"
            >
              <Share2 className="w-4 h-4" />
              {showShareSuccess ? 'Copied to Clipboard! ✅' : 'Copy Result'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Rules / How to Play Modal */}
      <AnimatePresence>
        {showRulesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-warm-border/40 dark:border-stone-800 pb-3">
                <h3 className="font-black text-lg text-warm-text dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-brand-purple" /> How to Play
                </h3>
                <button
                  onClick={() => setShowRulesModal(false)}
                  className="p-1 text-warm-hint hover:text-warm-text transition"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-warm-secondary leading-relaxed font-medium">
                <p>1. Find groups of 4 words that share a tech or career connection.</p>
                <p>2. Select 4 items and click <strong>Submit</strong> to check if your guess is correct.</p>
                <p>3. Use the <strong>💡 Get Hint</strong> button anytime — each click reveals new clues without waiting!</p>
                <p>4. Play every day to build your <strong>Daily Streak 🔥</strong> and beat your <strong>Shortest Played Time ⏱️</strong>!</p>
              </div>

              <button
                onClick={() => setShowRulesModal(false)}
                className="w-full py-2.5 rounded-xl bg-brand-purple text-white font-bold text-xs"
              >
                Got It, Let's Play!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
