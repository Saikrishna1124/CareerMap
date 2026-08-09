export interface WordCategory {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'tricky';
  color: string; // Tailwind background color styling
  borderColor: string;
  textColor: string;
  items: string[];
}

export interface DailyPuzzle {
  id: string;
  dateStr?: string; // YYYY-MM-DD format if assigned to specific date
  categories: WordCategory[];
}

export const PUZZLE_COLLECTIONS: DailyPuzzle[] = [
  {
    id: 'puzzle-1',
    categories: [
      {
        id: 'cat-1',
        name: 'PROGRAMMING LANGUAGES',
        difficulty: 'easy',
        color: 'bg-amber-100 dark:bg-amber-950/70',
        borderColor: 'border-amber-400 dark:border-amber-600',
        textColor: 'text-amber-900 dark:text-amber-200',
        items: ['PYTHON', 'JAVASCRIPT', 'JAVA', 'C++']
      },
      {
        id: 'cat-2',
        name: 'JOB APPLICATION DOCUMENTS',
        difficulty: 'medium',
        color: 'bg-emerald-100 dark:bg-emerald-950/70',
        borderColor: 'border-emerald-400 dark:border-emerald-600',
        textColor: 'text-emerald-900 dark:text-emerald-200',
        items: ['RESUME', 'COVER LETTER', 'PORTFOLIO', 'DIPLOMA']
      },
      {
        id: 'cat-3',
        name: 'WORK ENVIRONMENTS',
        difficulty: 'hard',
        color: 'bg-blue-100 dark:bg-blue-950/70',
        borderColor: 'border-blue-400 dark:border-blue-600',
        textColor: 'text-blue-900 dark:text-blue-200',
        items: ['REMOTE', 'HYBRID', 'ON-SITE', 'FREELANCE']
      },
      {
        id: 'cat-4',
        name: 'OFFICE COMMUNICATION TOOLS',
        difficulty: 'tricky',
        color: 'bg-purple-100 dark:bg-purple-950/70',
        borderColor: 'border-purple-400 dark:border-purple-600',
        textColor: 'text-purple-900 dark:text-purple-200',
        items: ['EMAIL', 'SLACK', 'ZOOM', 'CALENDAR']
      }
    ]
  },
  {
    id: 'puzzle-2',
    categories: [
      {
        id: 'cat-1',
        name: 'FRONTEND WEB BASICS',
        difficulty: 'easy',
        color: 'bg-amber-100 dark:bg-amber-950/70',
        borderColor: 'border-amber-400 dark:border-amber-600',
        textColor: 'text-amber-900 dark:text-amber-200',
        items: ['HTML', 'CSS', 'JAVASCRIPT', 'REACT']
      },
      {
        id: 'cat-2',
        name: 'INTERVIEW STAGES',
        difficulty: 'medium',
        color: 'bg-emerald-100 dark:bg-emerald-950/70',
        borderColor: 'border-emerald-400 dark:border-emerald-600',
        textColor: 'text-emerald-900 dark:text-emerald-200',
        items: ['SCREENING', 'CODING TEST', 'BEHAVIORAL', 'JOB OFFER']
      },
      {
        id: 'cat-3',
        name: 'KEY RESUME SECTIONS',
        difficulty: 'hard',
        color: 'bg-blue-100 dark:bg-blue-950/70',
        borderColor: 'border-blue-400 dark:border-blue-600',
        textColor: 'text-blue-900 dark:text-blue-200',
        items: ['EXPERIENCE', 'EDUCATION', 'PROJECTS', 'SKILLS']
      },
      {
        id: 'cat-4',
        name: 'VALUABLE SOFT SKILLS',
        difficulty: 'tricky',
        color: 'bg-purple-100 dark:bg-purple-950/70',
        borderColor: 'border-purple-400 dark:border-purple-600',
        textColor: 'text-purple-900 dark:text-purple-200',
        items: ['TEAMWORK', 'LEADERSHIP', 'LISTENING', 'CREATIVITY']
      }
    ]
  },
  {
    id: 'puzzle-3',
    categories: [
      {
        id: 'cat-1',
        name: 'DATABASE ENGINES',
        difficulty: 'easy',
        color: 'bg-amber-100 dark:bg-amber-950/70',
        borderColor: 'border-amber-400 dark:border-amber-600',
        textColor: 'text-amber-900 dark:text-amber-200',
        items: ['POSTGRES', 'MONGODB', 'MYSQL', 'REDIS']
      },
      {
        id: 'cat-2',
        name: 'CLOUD PROVIDERS',
        difficulty: 'medium',
        color: 'bg-emerald-100 dark:bg-emerald-950/70',
        borderColor: 'border-emerald-400 dark:border-emerald-600',
        textColor: 'text-emerald-900 dark:text-emerald-200',
        items: ['AWS', 'AZURE', 'GOOGLE CLOUD', 'VERCEL']
      },
      {
        id: 'cat-3',
        name: 'VERSION CONTROL TERMS',
        difficulty: 'hard',
        color: 'bg-blue-100 dark:bg-blue-950/70',
        borderColor: 'border-blue-400 dark:border-blue-600',
        textColor: 'text-blue-900 dark:text-blue-200',
        items: ['COMMIT', 'BRANCH', 'MERGE', 'PUSH']
      },
      {
        id: 'cat-4',
        name: 'SOFTWARE ROLES',
        difficulty: 'tricky',
        color: 'bg-purple-100 dark:bg-purple-950/70',
        borderColor: 'border-purple-400 dark:border-purple-600',
        textColor: 'text-purple-900 dark:text-purple-200',
        items: ['DEVELOPER', 'DESIGNER', 'TESTER', 'MANAGER']
      }
    ]
  }
];

/**
 * Returns today's puzzle deterministically based on date string (YYYY-MM-DD)
 */
export function getPuzzleForDate(dateStr: string): DailyPuzzle {
  // Convert date string into a hash number
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PUZZLE_COLLECTIONS.length;
  return PUZZLE_COLLECTIONS[index];
}
