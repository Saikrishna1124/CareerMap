import { getPuzzleForDate, DailyPuzzle } from '../data/dailyPuzzles';

export interface UserGameState {
  lastPlayedDate: string; // YYYY-MM-DD
  currentStreak: number;
  maxStreak: number;
  bestTimeSeconds?: number; // Shortest time ever taken to complete a puzzle (LinkedIn style)
  totalGamesPlayed: number;
  totalWins: number;
  // Today's active or completed puzzle state
  todayState?: {
    dateStr: string;
    solvedCategoryIds: string[];
    guessesHistory: string[][]; // Array of 4-word guesses
    livesRemaining: number;
    isCompleted: boolean;
    isWon: boolean;
    remainingWords: string[];
    timeTakenSeconds?: number;
  };
}

export function getStorageKey(userId?: string): string {
  const cleanId = (userId || 'guest').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  return `careermap_daily_game_v1_${cleanId}`;
}

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeSeconds(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}m ${secs}s`;
}

export function loadUserGameState(userId?: string): UserGameState {
  const todayStr = getTodayDateStr();
  const yesterdayStr = getYesterdayDateStr();
  const storageKey = getStorageKey(userId);

  const defaultState: UserGameState = {
    lastPlayedDate: '',
    currentStreak: 0,
    maxStreak: 0,
    totalGamesPlayed: 0,
    totalWins: 0
  };

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaultState;
    const parsed: UserGameState = JSON.parse(raw);

    // Check streak validity
    // If the user last played before yesterday AND hasn't played today, the streak is lost!
    if (parsed.lastPlayedDate && parsed.lastPlayedDate !== todayStr && parsed.lastPlayedDate !== yesterdayStr) {
      parsed.currentStreak = 0;
    }

    return parsed;
  } catch (err) {
    console.error('Error loading game state:', err);
    return defaultState;
  }
}

export function saveUserGameState(state: UserGameState, userId?: string): void {
  try {
    const storageKey = getStorageKey(userId);
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving game state:', err);
  }
}

export function getTimeUntilNextPuzzle(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const diffMs = midnight.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}

export function generateShareText(
  todayStr: string,
  isWon: boolean,
  currentStreak: number,
  solvedCategoryIds: string[],
  timeSeconds: number
): string {
  const emojiStr = isWon ? '🏆 VICTORY!' : '💔 ALMOST!';
  const timeFormatted = formatTimeSeconds(timeSeconds);
  let text = `CareerMap Connections ${todayStr}\n`;
  text += `${emojiStr} | Time: ${timeFormatted} | Streak: ${currentStreak} 🔥\n`;
  text += `Categories Solved: ${solvedCategoryIds.length}/4\n`;
  text += `Play daily on CareerMap to sharpen your career & tech skills!\n`;
  return text;
}
