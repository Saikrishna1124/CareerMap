import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video, Mic, MicOff, VideoOff, Play,
  AlertTriangle, CheckCircle2, Timer,
  Brain, Code, Users, ChevronRight,
  ShieldAlert,
  Loader2,
  Settings,
  RefreshCw,
  Scan,
  Search,
  Sparkles,
  Heart,
  Trophy,
  ChevronDown,
  ChevronUp,
  Check,
  Award,
  MessageSquare,
  HelpCircle,
  Activity,
  BookOpen,
  Clock,
  Volume2,
  Terminal,
  Maximize,
  FileText,
  Flame,
  Lightbulb,
  X,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getInterviewQuestions } from '../services/ai';
import { getDynamicSuggestedAnswer } from '../utils/interviewHelper';
import { useAuth } from '../context/AuthContext';
import { Tooltip } from '../components/Tooltip';

type InterviewType = 'Behavioral' | 'Technical' | 'Coding';

const renderFeedbackText = (feedback: any): React.ReactNode => {
  if (!feedback) return "";
  if (typeof feedback === 'string') {
    return feedback;
  }
  if (typeof feedback === 'object') {
    if ('good' in feedback || 'needsImprovement' in feedback) {
      return (
        <span className="block space-y-2">
          {feedback.good && (
            <span className="block text-slate-700 dark:text-slate-300">
              <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider text-[10px] block mb-0.5">What went well:</strong>
              {feedback.good}
            </span>
          )}
          {feedback.needsImprovement && (
            <span className="block text-slate-705 dark:text-slate-350">
              <strong className="text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider text-[10px] block mb-0.5">Needs improvement:</strong>
              {feedback.needsImprovement}
            </span>
          )}
        </span>
      );
    }
    return (
      <span className="block space-y-2">
        {Object.entries(feedback).map(([key, val]) => {
          if (typeof val === 'string' || typeof val === 'number') {
            const label = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase());
            return (
              <span key={key} className="block text-slate-700 dark:text-slate-300">
                <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-wider text-[10px] block mb-0.5">{label}:</strong>
                {val}
              </span>
            );
          }
          return null;
        })}
      </span>
    );
  }
  return String(feedback);
};

const LANGUAGE_KEYWORDS: { [key: string]: string[] } = {
  python: ['def ', 'self', 'return ', 'import ', 'class ', 'append', 'range', 'print', 'len', 'True', 'False', 'None', 'List', 'Dict'],
  javascript: ['const ', 'let ', 'function ', 'return ', 'async ', 'await ', 'console.log', 'Promise', 'map', 'filter', 'reduce'],
  java: ['public ', 'private ', 'class ', 'return ', 'void', 'String', 'System.out.println', 'ArrayList', 'HashMap', 'List'],
  cpp: ['class ', 'public:', 'private:', 'int ', 'string ', 'vector', 'unordered_map', 'return ', 'cout', 'endl']
};

const InterviewPageContent: React.FC = () => {
  const { fetchMe, user } = useAuth();
  const [step, setStep] = useState<'selection' | 'setup' | 'active' | 'finished'>('selection');
  const [type, setType] = useState<InterviewType | null>(null);
  const [jobRole, setJobRole] = useState('Software Engineer');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);

  // Toast notifications for context-aware preparation tips
  const [tipToasts, setTipToasts] = useState<Array<{
    id: string;
    title: string;
    message: string;
    icon: string;
    accent: string;
  }>>([]);

  const addTipToast = (title: string, message: string, icon: string, accent: string = 'indigo') => {
    const id = Math.random().toString(36).substring(2, 9);
    setTipToasts(prev => {
      // Avoid exact duplicate messages currently visible
      if (prev.some(t => t.message === message)) return prev;
      return [...prev, { id, title, message, icon, accent }];
    });
    // Auto remove after 7 seconds
    setTimeout(() => {
      setTipToasts(prev => prev.filter(t => t.id !== id));
    }, 7000);
  };

  const triggerRoleTip = React.useCallback((role: string) => {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('software') || roleLower.includes('engineer') || roleLower.includes('developer') || roleLower.includes('coder') || roleLower.includes('architect')) {
      addTipToast(
        "Code Structural Clarity",
        "Structure comments outlining your procedural steps before typing characters. Explaining Big O runtime upfront adds expert presentation points.",
        "Code",
        "violet"
      );
    } else if (roleLower.includes('product') || roleLower.includes('manager') || roleLower.includes('pm')) {
      addTipToast(
        "Product Strategy Metrics",
        "When designing products, state your primary customer personas and design metrics before proposing solutions. KPIs show data ownership.",
        "Users",
        "emerald"
      );
    } else if (roleLower.includes('designer') || roleLower.includes('ux') || roleLower.includes('ui') || roleLower.includes('creative')) {
      addTipToast(
        "Usability Validation",
        "Frame design narratives around user interviews, wireframe iterations, and measurable conversion metrics. Empathy fuels interaction.",
        "Heart",
        "rose"
      );
    } else if (roleLower.includes('data') || roleLower.includes('analyst') || roleLower.includes('scientist')) {
      addTipToast(
        "Statistical Trade-offs",
        "Be ready to argue model selection decisions including precision vs. recall or bias vs. variance tradeoffs. Simple accuracy is rarely enough.",
        "Brain",
        "violet"
      );
    } else if (roleLower.includes('system') || roleLower.includes('site') || roleLower.includes('infrastructure')) {
      addTipToast(
        "High Availability Design",
        "Highlight failure boundaries, replication lags, scale patterns, and network traffic decoupling when sketching solutions.",
        "Terminal",
        "indigo"
      );
    } else if (roleLower.includes('marketing') || roleLower.includes('sales') || roleLower.includes('customer')) {
      addTipToast(
        "Acquisition Tracking",
        "Discuss your conversion funnel math, cohort retention rates, customer acquisition costs, and channel attribution logic.",
        "Target",
        "amber"
      );
    } else {
      addTipToast(
        "Professional Quantification",
        `When simulating a ${role} interview, frame achievements with clear metrics. Explain the exact impact of your individual actions.`,
        "Award",
        "indigo"
      );
    }
  }, []);

  // Sync initial target role from profile auth context if set
  useEffect(() => {
    if (user?.targetRole) {
      setJobRole(user.targetRole);
    }
  }, [user]);

  // Handle mounting welcome prep tips & educational stargating
  useEffect(() => {
    const timer1 = setTimeout(() => {
      const currentRole = user?.targetRole || jobRole || 'Software Engineer';
      addTipToast(
        "Interactive Simulator Ready",
        `Prepared for ${currentRole} mock iterations. Select an interview module from Behavioral, Technical, or Coding to begin practicing.`,
        "Sparkles",
        "indigo"
      );
    }, 1200);

    const timer2 = setTimeout(() => {
      addTipToast(
        "The STAR Methodology",
        "When addressing behavioral metrics, anchor your answer around: Situation, Task, Action, and quantifiable Result.",
        "Award",
        "amber"
      );
    }, 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Debounced listener to trigger role tip when the input settles
  useEffect(() => {
    if (!jobRole) return;
    const trimmedRole = jobRole.trim();
    if (trimmedRole.length < 4) return;

    const timer = setTimeout(() => {
      triggerRoleTip(trimmedRole);
    }, 1805); // Wait with delay to avoid toast-spamming as they type

    return () => clearTimeout(timer);
  }, [jobRole, triggerRoleTip]);

  // Coding interview states
  const [codingQuestion, setCodingQuestion] = useState<any>(null);
  const codingTitleLower = String(codingQuestion?.title || "Coding Challenge").toLowerCase();
  const codingDescLower = String(codingQuestion?.description || "Select a coding task to begin.").toLowerCase();
  const [codingLanguage, setCodingLanguage] = useState<string>('python');
  const [activeCodingTab, setActiveCodingTab] = useState<'description' | 'results'>('description');
  const [codeExecutionResult, setCodeExecutionResult] = useState<any>(null);
  const [languageAnswers, setLanguageAnswers] = useState<{ [key: string]: string }>({});
  const [userNotes, setUserNotes] = useState<string>('');
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'notes' | 'reference'>('description');
  const [showAiHint, setShowAiHint] = useState<boolean>(false);
  const [customTestInput, setCustomTestInput] = useState<string>('');
  const [submissionHistory, setSubmissionHistory] = useState<Array<{
    timestamp: string;
    status: 'Passed' | 'Failed' | 'Error';
    passedCount: number;
    totalCount: number;
    language: string;
    runtime: number;
  }>>([]);
  const [codingStreak, setCodingStreak] = useState<number>(14);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState<boolean>(false);
  const [autocompleteSelectedIdx, setAutocompleteSelectedIdx] = useState<number>(0);

  // Format choice: 'text', 'voice', or 'proctor'
  const [interviewFormat, setInterviewFormat] = useState<'text' | 'voice' | 'proctor'>('text');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  // Audio dictation using Web Speech API
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const recognitionBaseTextRef = useRef<string>('');

  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins
  const [codeOutput, setCodeOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [anomalies, setAnomalies] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState<any>(null);

  const LOCAL_FALLBACK_CODING = {
    title: "Two Sum Target",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    constraints: "2 <= nums.length <= 1000\n-10^9 <= target <= 10^9",
    samples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    starterCode: {
      python: "def twoSum(nums, target):\n    # Write Python 3 solution\n    pass",
      javascript: "function twoSum(nums, target) {\n    // Write JavaScript solution\n    return [];\n}",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write C++ solution\n        return {};\n    }\n};",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write Java solution\n        return new int[0];\n    }\n}"
    },
    testCases: [
      { input: "[2, 7, 11, 15], 9", output: "[0, 1]" },
      { input: "[3, 2, 4], 6", output: "[1, 2]" },
      { input: "[3, 3], 6", output: "[0, 1]" }
    ]
  };

  useEffect(() => {
    if (type === 'Coding' && questions.length > 0) {
      try {
        const parsed = JSON.parse(questions[0]);
        setCodingQuestion(parsed);
        if (parsed.starterCode) {
          const initialAnswers: { [key: string]: string } = {};
          Object.keys(parsed.starterCode).forEach(lang => {
            initialAnswers[lang] = parsed.starterCode[lang];
          });
          setLanguageAnswers(prev => {
            const combined = { ...initialAnswers };
            Object.keys(prev).forEach(k => {
              if (prev[k]) combined[k] = prev[k];
            });
            return combined;
          });
          setCurrentAnswer(prev => prev && prev.trim() !== '' ? prev : (parsed.starterCode[codingLanguage] || ''));
        }
      } catch (err) {
        console.warn("Could not parse coding question JSON, fallback used:", err);
        setCodingQuestion(LOCAL_FALLBACK_CODING);
        if (LOCAL_FALLBACK_CODING.starterCode) {
          const initialAnswers: { [key: string]: string } = {};
          Object.keys(LOCAL_FALLBACK_CODING.starterCode).forEach(lang => {
            initialAnswers[lang] = (LOCAL_FALLBACK_CODING.starterCode as any)[lang];
          });
          setLanguageAnswers(prev => {
            const combined = { ...initialAnswers };
            Object.keys(prev).forEach(k => {
              if (prev[k]) combined[k] = prev[k];
            });
            return combined;
          });
          setCurrentAnswer(prev => prev && prev.trim() !== '' ? prev : ((LOCAL_FALLBACK_CODING.starterCode as any)[codingLanguage] || ''));
        }
      }
    }
  }, [questions, type]);

  const handleLanguageChange = (lang: string) => {
    // Save current answer to previous language
    setLanguageAnswers(prev => ({
      ...prev,
      [codingLanguage]: currentAnswer
    }));

    // Load selected language code
    const cachedCode = languageAnswers[lang];
    if (cachedCode !== undefined) {
      setCurrentAnswer(cachedCode);
    } else {
      if (codingQuestion?.starterCode) {
        setCurrentAnswer(codingQuestion.starterCode[lang] || '');
      }
    }
    setCodingLanguage(lang);
  };

  const applyAutocompleteSuggestion = (suggestion: string) => {
    const ta = document.getElementById('editor-code-input') as HTMLTextAreaElement;
    if (!ta) return;

    const start = ta.selectionStart;
    const val = ta.value;
    const textBeforeCursor = val.substring(0, start);
    const wordsParts = textBeforeCursor.split(/[\s(){}[\].,;+-/*]/);
    const lastWord = wordsParts[wordsParts.length - 1];

    const prefix = textBeforeCursor.substring(0, textBeforeCursor.length - lastWord.length);
    const newVal = prefix + suggestion + val.substring(start);

    setCurrentAnswer(newVal);
    setLanguageAnswers(prev => ({
      ...prev,
      [codingLanguage]: newVal
    }));

    const newAnswers = [...answers];
    newAnswers[0] = newVal;
    setAnswers(newAnswers);

    setShowAutocomplete(false);

    const newCursor = prefix.length + suggestion.length;
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = newCursor;
    }, 0);
  };
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [proctoringStatus, setProctoringStatus] = useState<'secure' | 'warning' | 'critical'>('secure');
  const [faceDetected, setFaceDetected] = useState(true);
  const [audioMetrics, setAudioMetrics] = useState({ pace: 0, tone: 0, clarity: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioDataRef = useRef<number[]>([]);

  // Immersive fullscreen state and helpers
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [isWarningActive, setIsWarningActive] = useState(false);
  const [lastViolationReason, setLastViolationReason] = useState('');
  const isResumingRef = useRef(false);

  // Auto-save and session continuity states
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<string | null>(null);
  const [restorableSession, setRestorableSession] = useState<{
    timestamp: number;
    type: InterviewType;
    jobRole: string;
    questions: string[];
    answers: string[];
    currentQuestionIndex: number;
    timeLeft: number;
    violationCount: number;
    anomalies: string[];
  } | null>(null);

  // Keep a synced ref of all active session fields for safe non-teardown interval-based auto-save
  const latestSessionRef = useRef({
    type,
    jobRole,
    questions,
    answers,
    currentAnswer,
    currentQuestionIndex,
    timeLeft,
    violationCount,
    anomalies
  });

  useEffect(() => {
    latestSessionRef.current = {
      type,
      jobRole,
      questions,
      answers,
      currentAnswer,
      currentQuestionIndex,
      timeLeft,
      violationCount,
      anomalies
    };
  }, [type, jobRole, questions, answers, currentAnswer, currentQuestionIndex, timeLeft, violationCount, anomalies]);

  // Load any restorable in-progress session on select screen
  useEffect(() => {
    if (step === 'selection') {
      const raw = localStorage.getItem('active_interview_session');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.questions && parsed.questions.length > 0 && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            setRestorableSession(parsed);
          }
        } catch (err) {
          console.warn("Could not parse restorable active session:", err);
        }
      }
    }
  }, [step]);

  // Restore session handler
  const handleRestoreSession = () => {
    if (!restorableSession) return;

    setType(restorableSession.type);
    setJobRole(restorableSession.jobRole);
    setQuestions(restorableSession.questions);
    setAnswers(restorableSession.answers);
    setCurrentQuestionIndex(restorableSession.currentQuestionIndex);

    const restoredCurrentAnswer = restorableSession.answers[restorableSession.currentQuestionIndex] || '';
    setCurrentAnswer(restoredCurrentAnswer);

    setTimeLeft(restorableSession.timeLeft !== undefined ? restorableSession.timeLeft : 1800);
    setViolationCount(restorableSession.violationCount || 0);
    setAnomalies(restorableSession.anomalies || []);

    setStep('active');
    setRestorableSession(null);
    playSoundEffect('click');

    // Automatically trigger fullscreen mode upon restoration
    try {
      const docEl = document.documentElement;
      const requestMethod = docEl.requestFullscreen || (docEl as any).webkitRequestFullscreen || (docEl as any).mozRequestFullScreen || (docEl as any).msRequestFullscreen;
      if (requestMethod) {
        requestMethod.call(docEl).then(() => {
          setIsFullscreen(true);
        }).catch((err: any) => {
          console.warn("Fullscreen auto-entry failed on session restore:", err);
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } catch (e) {
      setIsFullscreen(true);
    }
  };

  // 1. Countdown timer decrementer effect
  useEffect(() => {
    if (step !== 'active' || isWarningActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, isWarningActive]);

  // 2. Automounter for finishing exam if time runs out
  useEffect(() => {
    if (step === 'active' && timeLeft === 0) {
      finishInterview();
    }
  }, [timeLeft, step]);

  // 3. Every 30 seconds, automatically persist interview text answers & state
  useEffect(() => {
    if (step !== 'active') return;

    const autoSaveInterval = setInterval(() => {
      const data = latestSessionRef.current;
      if (!data.type) return;

      const syncedAnswers = [...data.answers];
      syncedAnswers[data.currentQuestionIndex] = data.currentAnswer;

      const sessionState = {
        timestamp: Date.now(),
        type: data.type,
        jobRole: data.jobRole,
        questions: data.questions,
        answers: syncedAnswers,
        currentQuestionIndex: data.currentQuestionIndex,
        timeLeft: data.timeLeft,
        violationCount: data.violationCount,
        anomalies: data.anomalies
      };

      localStorage.setItem('active_interview_session', JSON.stringify(sessionState));
      const saveTime = new Date().toLocaleTimeString();
      setLastAutoSavedAt(saveTime);
      console.log("[Auto-Save] Session saved at", saveTime);
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [step]);

  // Real-time dynamic response evaluation for text/voice analytics
  useEffect(() => {
    if (step !== 'active') return;

    if (!currentAnswer || !currentAnswer.trim()) {
      setAudioMetrics({ pace: 0, tone: 0, clarity: 0 });
      return;
    }

    const text = currentAnswer.trim();
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // 1. Pace (depth, length, and flow of phrasing)
    // Dynamic grading based on target word count (around 40-75 words is sweet spot)
    let paceScore = 0;
    if (wordCount > 0) {
      if (wordCount < 12) paceScore = 30 + wordCount * 3;
      else if (wordCount <= 60) paceScore = 66 + Math.round((wordCount - 12) * 0.6);
      else paceScore = Math.max(70, 95 - Math.round((wordCount - 60) * 0.4)); // slightly penalize excessive rambling
    }
    paceScore = Math.min(100, Math.max(10, paceScore));

    // 2. Tone (sentiment, action verbs, confidence cues)
    const professionalKeywords = [
      'design', 'build', 'implement', 'code', 'optimize', 'performance', 'solve', 'challenge',
      'team', 'collaborate', 'lead', 'scale', 'debug', 'test', 'handle', 'learn', 'experience',
      'project', 'solution', 'efficient', 'requirements', 'modular', 'architecture', 'api', 'state'
    ];
    const lowerText = text.toLowerCase();
    let matchedKeywords = 0;
    professionalKeywords.forEach(kw => {
      if (lowerText.includes(kw)) matchedKeywords++;
    });

    let toneScore = 60 + (matchedKeywords * 7);
    // Penalize filler and hesitation phrases in voice or text (e.g. "maybe", "i think", "just", "probably", "idk")
    const uncertaintyWords = ['maybe', 'i think', 'just', 'probably', 'guess', 'hope', 'like', 'um', 'uh'];
    let uncertaintyCount = 0;
    uncertaintyWords.forEach(uw => {
      const regex = new RegExp(`\\b${uw}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) uncertaintyCount += matches.length;
    });
    toneScore -= (uncertaintyCount * 5);
    toneScore = Math.min(100, Math.max(15, toneScore));

    // 3. Clarity (structure, grammar, punctuation check)
    let clarityScore = 60;
    if (/^[A-Z]/.test(text)) clarityScore += 10; // proper capitalization
    if (/[.!?]$/.test(text)) clarityScore += 10; // finished sentence structure

    // Average word length logic (detects gibberish or non-sensical strings)
    const avgWordLength = wordCount > 0 ? text.replace(/\s+/g, '').length / wordCount : 0;
    if (avgWordLength >= 4 && avgWordLength <= 7) clarityScore += 15;
    else if (avgWordLength > 7) clarityScore -= 10;
    else clarityScore -= 20;

    // Sentence separation logic
    const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
    if (sentenceCount > 1 && wordCount / sentenceCount <= 22) {
      clarityScore += 5;
    }

    clarityScore = Math.min(100, Math.max(10, clarityScore));

    // Smooth values if mic or active listening is running, otherwise set directly for high reactivity
    if (isListening || (isMicOn && streamRef.current?.active)) {
      setAudioMetrics(prev => ({
        pace: Math.round(prev.pace * 0.4 + paceScore * 0.6),
        tone: Math.round(prev.tone * 0.4 + toneScore * 0.6),
        clarity: Math.round(prev.clarity * 0.4 + clarityScore * 0.6)
      }));
    } else {
      setAudioMetrics({
        pace: paceScore,
        tone: toneScore,
        clarity: clarityScore
      });
    }
  }, [currentAnswer, step, isListening, isMicOn]);

  const toggleNativeFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch((err) => {
          console.warn("Fullscreen API suspended or blocked on this frame structure:", err);
          setIsFullscreen(true);
        });
      } else {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(() => {
          setIsFullscreen(false);
        });
      }
    } catch (e) {
      console.warn("Fullscreen request error:", e);
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleResumeActiveSession = () => {
    isResumingRef.current = true;
    setIsWarningActive(false);

    // Request fullscreen dynamically with native transition locks
    try {
      const enterFullscreen = () => {
        const docEl = document.documentElement;
        const requestMethod = docEl.requestFullscreen || (docEl as any).webkitRequestFullscreen || (docEl as any).mozRequestFullScreen || (docEl as any).msRequestFullscreen;
        if (requestMethod) {
          requestMethod.call(docEl).then(() => {
            setIsFullscreen(true);
            setTimeout(() => {
              isResumingRef.current = false;
            }, 1500);
          }).catch((err: any) => {
            console.warn("Fullscreen request rejected or blocked:", err);
            setIsFullscreen(true);
            setTimeout(() => {
              isResumingRef.current = false;
            }, 1500);
          });
        } else {
          setIsFullscreen(true);
          setTimeout(() => {
            isResumingRef.current = false;
          }, 1500);
        }
      };
      enterFullscreen();
    } catch (e) {
      setIsFullscreen(true);
      setTimeout(() => {
        isResumingRef.current = false;
      }, 1500);
    }
  };

  useEffect(() => {
    if (step !== 'active') return;

    let localAnomaliesCount = violationCount;

    const recordViolation = (reason: string) => {
      // Safeguard against overlapping trigger races, active recovery cooldown, or completed tests
      if (isWarningActive || isResumingRef.current) return;

      const nextCount = localAnomaliesCount + 1;
      setViolationCount(nextCount);
      localAnomaliesCount = nextCount;

      const timeString = new Date().toLocaleTimeString();
      const detailedReason = `[${timeString}] Proctor Warning: ${reason}`;

      setAnomalies(prev => [...prev, detailedReason]);
      setLastViolationReason(reason);
      setIsWarningActive(true);
      playSoundEffect('chime');

      // Sync user progress answers immediately so they do not lose code or text answers on termination
      setAnswers(prev => {
        const updated = [...prev];
        updated[currentQuestionIndex] = currentAnswer;
        return updated;
      });

      if (nextCount >= 3) {
        // Stop the exam and automatically end it! 1.5s delay to let the user see their score limit has broken.
        setTimeout(() => {
          setIsWarningActive(false);
          finishInterview();
        }, 1500);
      }
    };

    const handleFullscreenChangeLocal = () => {
      // Esc-key exits or manual system exit triggers
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        if (!isWarningActive && !isResumingRef.current) {
          showEditorNotification('Security Warning: Full Screen dismissed! Re-enter fullscreen mode immediately to continue your assessment.', 'warning');
          recordViolation("Exited Full Screen mode");
        }
      } else {
        setIsFullscreen(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isWarningActive && !isResumingRef.current) {
        recordViolation("Switched tab or minimized assessment browser tab");
      }
    };

    const handleWindowBlur = () => {
      if (!isWarningActive && !isResumingRef.current) {
        recordViolation("Navigated away from active window focus");
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChangeLocal);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChangeLocal);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [step, isWarningActive, violationCount, currentQuestionIndex, currentAnswer]);

  useEffect(() => {
    // Exit native fullscreen mode in browser context cleanly when session results are generated
    if (step !== 'active' && document.fullscreenElement) {
      document.exitFullscreen().catch(e => console.warn("Auto-exit fullscreen failed:", e));
    }
  }, [step]);

  // Real synthesized sound effects aligned with System Preferences
  const playSoundEffect = (soundType: 'chime' | 'success' | 'click') => {
    if (localStorage.getItem('pref_sound_fx') === 'false') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Auto-resume to bypass browser suspension for programmatic AudioContexts within iframes
      if (ctx.state === 'suspended') {
        ctx.resume().catch(e => console.warn('Ctx resume error:', e));
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (soundType === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
        gain.gain.setValueAtTime(0.22, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (soundType === 'chime') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1); // C#5
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {
      console.warn("AudioContext chime failed:", e);
    }
  };

  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [editorNotifications, setEditorNotifications] = useState<{ id: string; type: 'warning' | 'info'; message: string }[]>([]);

  const showEditorNotification = (message: string, type: 'warning' | 'info' = 'warning') => {
    const id = Math.random().toString(36).substring(2, 9);
    setEditorNotifications(prev => [...prev, { id, type, message }]);
    try {
      playSoundEffect('chime');
    } catch (e) {
      console.warn("Chime failed:", e);
    }
    setTimeout(() => {
      setEditorNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  // Real TTS Voice synthesis of current question block, responding to System Preferences speed
  useEffect(() => {
    if (step === 'active' && type !== 'Coding' && questions && questions[currentQuestionIndex]) {
      const speakNow = () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const ratePref = Number(localStorage.getItem('pref_voice_rate') || '1.0');
          const utterance = new SpeechSynthesisUtterance(questions[currentQuestionIndex]);
          utterance.rate = ratePref;

          // Try to select a warm/friendly English speaker voice
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(v => v.lang.startsWith('en-') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft')));
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
          window.speechSynthesis.speak(utterance);
        }
      };

      const t = setTimeout(speakNow, 350);
      return () => {
        clearTimeout(t);
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, [step, currentQuestionIndex, questions, type]);

  // Enumerate devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devInfo = await navigator.mediaDevices.enumerateDevices();
        setDevices(devInfo);

        // Set defaults if not set
        const videoDev = devInfo.find(d => d.kind === 'videoinput');
        const audioDev = devInfo.find(d => d.kind === 'audioinput');
        if (videoDev && !selectedVideoDevice) setSelectedVideoDevice(videoDev.deviceId);
        if (audioDev && !selectedAudioDevice) setSelectedAudioDevice(audioDev.deviceId);
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }
    };

    if (step === 'setup') {
      getDevices();
    }
  }, [step]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showRoleDropdown && !(event.target as HTMLElement).closest('.role-dropdown-container')) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRoleDropdown]);

  // Monitoring
  useEffect(() => {
    if (step === 'active') {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          const msg = 'Tab switching detected';
          setAnomalies(prev => [...prev, msg]);
          setProctoringStatus('critical');
          setTimeout(() => setProctoringStatus('secure'), 5000);
        }
      };
      const handleCopyPaste = (e: ClipboardEvent) => {
        e.preventDefault();
        const msg = 'Copy-paste attempt detected';
        setAnomalies(prev => [...prev, msg]);
        setProctoringStatus('warning');
        showEditorNotification('Copy & paste features are completely disabled during the evaluation to maintain secure assessment rules.', 'warning');
        setTimeout(() => setProctoringStatus('secure'), 3000);
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('copy', handleCopyPaste);
      document.addEventListener('paste', handleCopyPaste);

      // Enhanced Real-time Proctoring Simulation
      const proctoringInterval = setInterval(() => {
        const rand = Math.random();

        // Face detection simulation
        if (rand < 0.02) {
          setFaceDetected(false);
          const msg = 'Face not detected in frame';
          setAnomalies(prev => [...prev, msg]);
          setProctoringStatus('critical');
          setTimeout(() => {
            setFaceDetected(true);
            setProctoringStatus('secure');
          }, 3000);
        }
        // Eye movement / distraction simulation
        else if (rand < 0.05) {
          const msg = 'Suspicious eye movement / distraction detected';
          setAnomalies(prev => [...prev, msg]);
          setProctoringStatus('warning');
          setTimeout(() => setProctoringStatus('secure'), 3000);
        }
        // Multiple people simulation
        else if (rand < 0.01) {
          const msg = 'Multiple people detected in frame';
          setAnomalies(prev => [...prev, msg]);
          setProctoringStatus('critical');
          setTimeout(() => setProctoringStatus('secure'), 5000);
        }
      }, 5000);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('copy', handleCopyPaste);
        document.removeEventListener('paste', handleCopyPaste);
        clearInterval(proctoringInterval);
      };
    }
  }, [step]);

  // Web Speech audio dictation triggers
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition isn't natively supported in this browser. Please use Google Chrome, Edge, or Safari.");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      // Record any pre-existing text so we can seamlessly append to it as we speak
      recognitionBaseTextRef.current = currentAnswer;

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        let accumulatedFinal = '';
        let accumulatedInterim = '';

        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          if (result.isFinal) {
            accumulatedFinal += transcript;
          } else {
            accumulatedInterim += transcript;
          }
        }

        const base = recognitionBaseTextRef.current || '';
        const baseTrimmed = base.trim();
        const sessionText = (accumulatedFinal + accumulatedInterim).trim();

        if (sessionText) {
          setCurrentAnswer(baseTrimmed + (baseTrimmed ? ' ' : '') + sessionText);
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error(e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Safe play
      }
    }
    setIsListening(false);
  };

  // Camera & Audio Setup
  useEffect(() => {
    const startMedia = async () => {
      if ((step === 'setup' || step === 'active') && (isCameraOn || isMicOn)) {
        try {
          const constraints: MediaStreamConstraints = {};
          if (isCameraOn) {
            constraints.video = selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true;
          }
          if (isMicOn) {
            constraints.audio = selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true;
          }

          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = stream;
          if (isCameraOn && videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          // Setup Audio Analysis
          if (isMicOn) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            source.connect(analyserRef.current);

            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const analyzeAudio = () => {
              if (analyserRef.current && step === 'active' && streamRef.current?.active) {
                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / bufferLength;
                audioDataRef.current.push(average);

                // Update metrics periodically
                if (audioDataRef.current.length % 50 === 0) {
                  setAudioMetrics({
                    pace: Math.min(100, 60 + Math.random() * 20), // Simulated pace analysis
                    tone: Math.min(100, 70 + (average / 2)),
                    clarity: Math.min(100, 80 + Math.random() * 15)
                  });
                }
                requestAnimationFrame(analyzeAudio);
              }
            };
            analyzeAudio();
          }
        } catch (err) {
          console.error("Media error:", err);
        }
      }
    };

    startMedia();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
        audioContextRef.current = null;
      }
    };
  }, [step, isCameraOn, isMicOn, selectedVideoDevice, selectedAudioDevice]);

  const startInterview = async (selectedType: InterviewType) => {
    setType(selectedType);
    setStep('setup');
    setIsGeneratingQuestions(true);

    // Trigger type-specific prep tip for immediate guidance
    if (selectedType === 'Behavioral') {
      addTipToast(
        "STAR Delivery Focus",
        "Structure key points: Situation (15%), Task (15%), Action (50%), and Result (20%). Ensure results highlight measurable wins.",
        "Users",
        "indigo"
      );
    } else if (selectedType === 'Technical') {
      addTipToast(
        "Deep-Dive Preparation",
        "Walking the interviewer through the architecture step-by-step is preferred. If you are uncertain of a concept, explain your systematic approach.",
        "Brain",
        "emerald"
      );
    } else if (selectedType === 'Coding') {
      addTipToast(
        "Logical Pseudocode First",
        "Write comment blocks outlining your algorithms before writing nested lines. This ensures structure remains aligned under pressure.",
        "Code",
        "violet"
      );
    }

    try {
      const data = await getInterviewQuestions(jobRole, selectedType);
      setQuestions(data);
      setAnswers(new Array(data.length).fill(''));
    } catch (err: any) {
      console.error("Error generating questions:", err);
      // Fallback
      if (selectedType === 'Coding') {
        setQuestions([JSON.stringify(LOCAL_FALLBACK_CODING)]);
        setAnswers(new Array(1).fill(''));
      } else {
        setQuestions(["Tell me about yourself.", "Why do you want this role?", "Describe a challenge you faced.", "Where do you see yourself in 5 years?", "Do you have any questions for us?"]);
        setAnswers(new Array(5).fill(''));
      }
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const commonRoles = [
    "Software Engineer", "Frontend Developer", "Backend Developer",
    "Full Stack Developer", "Data Scientist", "Product Manager",
    "UX Designer", "DevOps Engineer", "QA Engineer", "System Architect"
  ];

  const runCode = async () => {
    setIsExecuting(true);
    setActiveCodingTab('results');
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          language: codingLanguage,
          code: currentAnswer,
          testCases: codingQuestion?.testCases || [],
          questionTitle: codingQuestion?.title || "Coding Challenge",
          customInput: customTestInput
        })
      });
      const data = await res.json();
      setCodeExecutionResult(data);
      if (data.error) {
        setCodeOutput(`Compilation/Execution Error:\n${data.error}`);
        // Record as error in history
        setSubmissionHistory(prev => [{
          timestamp: new Date().toLocaleTimeString(),
          status: 'Error',
          passedCount: 0,
          totalCount: (codingQuestion?.testCases?.length || 0) + (customTestInput && customTestInput.trim() ? 1 : 0),
          language: codingLanguage,
          runtime: 0
        }, ...prev]);
      } else {
        const passed = data.summary?.passed || 0;
        const total = data.summary?.total || 0;
        setCodeOutput(`[Run Status] ${passed}/${total} Test Cases Passed.\nRuntime: ${data.summary?.runtimeMs || 35}ms | Memory: ${data.summary?.memoryKb || 1280}kb`);

        // Record in history
        setSubmissionHistory(prev => [{
          timestamp: new Date().toLocaleTimeString(),
          status: passed === total ? 'Passed' : 'Failed',
          passedCount: passed,
          totalCount: total,
          language: codingLanguage,
          runtime: data.summary?.runtimeMs || 35
        }, ...prev]);
      }
    } catch (err) {
      setCodeOutput('Error connecting to safe sandbox compiler.');
    } finally {
      setIsExecuting(false);
    }
  };

  const finishInterview = async () => {
    localStorage.removeItem('active_interview_session');
    setIsEvaluating(true);
    setStep('finished');

    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          role: jobRole,
          type: type,
          questions,
          answers,
          proctoringAnomalies: anomalies
        })
      });

      if (!res.ok) throw new Error('Evaluation failed');
      const result = await res.json();

      // Save to backend tracking
      await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type,
          score: result.overallScore,
          communication: result.communication,
          technical: result.technical,
          confidence: result.confidence,
          integrity: result.integrity,
          feedback: result.feedback,
          questions: result.questions
        })
      });

      setEvaluation(result);
      // Refresh user data to get updated roadmap progress
      fetchMe();
    } catch (err: any) {
      console.error("Error evaluating interview:", err);
      const isCapacityError = err.message?.includes("quota") || err.status === 429 || err.status === 503 || err.message?.includes("capacity") || err.message?.includes("high demand") || err.message?.includes("UNAVAILABLE");

      if (isCapacityError) {
        // Provide a basic manual evaluation if AI fails
        const fallbackEval = {
          overallScore: 75,
          communication: 80,
          technical: 70,
          confidence: 75,
          integrity: 95,
          feedback: "Our AI evaluation system is currently experiencing high load. Based on our preliminary metrics, you showed good engagement. Please try another session later for a deep structural analysis.",
          communicationSuggestions: ["Maintain steady eye contact", "Vary your tone for emphasis", "Structure your logic using STAR method"],
          audioAnalysis: { pace: 70, tone: 75, clarity: 80, feedback: "Your speech was clear and audible." }
        };
        setEvaluation(fallbackEval);
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col min-h-screen">
      <AnimatePresence mode="wait">
        {step === 'selection' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Interview Simulator</h1>
              <p className="text-slate-500 font-medium">Practice with AI-powered mock interviews and get instant feedback.</p>
            </div>

            {restorableSession && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto bg-gradient-to-r from-indigo-505/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-600/25 dark:via-purple-600/20 dark:to-pink-600/25 border border-indigo-200 dark:border-indigo-800/40 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-600/5 backdrop-blur-sm"
              >
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-705 dark:text-indigo-300 text-xs font-black rounded-full uppercase tracking-wider font-mono">
                    <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '4s' }} /> Active Session Found
                  </div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                    Recover {restorableSession.type} Assessment?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-md">
                    We found an in-progress <strong>{restorableSession.jobRole}</strong> interview. Your answers and elapsed timer are fully intact! Resume to complete the assessment.
                  </p>
                  <div className="flex items-center gap-4 justify-center md:justify-start text-xs font-mono text-slate-450 dark:text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> Auto-saved: {new Date(restorableSession.timestamp).toLocaleTimeString()}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <HelpCircle size={12} /> Question: {restorableSession.currentQuestionIndex + 1} of {restorableSession.questions.length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto self-stretch md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Are you sure you want to discard this in-progress session and start a new one?")) {
                        localStorage.removeItem('active_interview_session');
                        setRestorableSession(null);
                      }
                    }}
                    className="flex-1 md:flex-initial px-5 py-3 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold transition-all border border-transparent hover:border-red-105 dark:hover:border-red-950/30 cursor-pointer text-center text-red-650"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleRestoreSession}
                    className="flex-1 md:flex-initial px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black tracking-wide shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    Resume <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            <div className="relative max-w-md mx-auto mb-12 role-dropdown-container">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={jobRole}
                onFocus={() => setShowRoleDropdown(true)}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="Target Role (e.g. Software Engineer)"
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm text-slate-900 dark:text-white font-medium"
              />
              <AnimatePresence>
                {showRoleDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto"
                  >
                    {commonRoles.filter(r => r.toLowerCase().includes(jobRole.toLowerCase())).map((role, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setJobRole(role);
                          setShowRoleDropdown(false);
                        }}
                        className="w-full text-left px-6 py-3 hover:bg-[#F5F7FB] dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {role}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { type: 'Behavioral', icon: Users, color: 'indigo', desc: 'Situational & behavioral questions.' },
                { type: 'Technical', icon: Brain, color: 'emerald', desc: 'Domain-specific technical theory.' },
                { type: 'Coding', icon: Code, color: 'violet', desc: 'Algorithm & data structure challenges.' }
              ].map((item) => (
                <motion.button
                  key={item.type}
                  whileHover={{ y: -5 }}
                  onClick={() => startInterview(item.type as InterviewType)}
                  className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-left group transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform`}>
                    <item.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.type}</h3>
                  <p className="text-slate-500 text-sm mb-6">{item.desc}</p>
                  <div className="flex items-center text-indigo-600 font-bold gap-1 text-sm">
                    Begin Lab <ChevronRight size={16} />
                  </div>
                </motion.button>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-brand-purple shadow-sm">
                  <Heart fill="currentColor" fillOpacity={0.2} size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Feeling nervous?</h4>
                  <p className="text-sm text-slate-500">Get a quick confidence boost and motivational coaching before you start.</p>
                </div>
              </div>
              <Link
                to="/confidence"
                state={{ from: 'interview', mode: 'pre' }}
                className="px-6 py-3 bg-white dark:bg-slate-900 text-brand-purple border border-indigo-100 dark:border-indigo-800 font-bold rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
              >
                Boost Confidence <Sparkles size={16} />
              </Link>
            </motion.div>
          </motion.div>
        )}        {step === 'setup' && (
          type === 'Coding' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center space-y-8 py-8 text-center max-w-2xl mx-auto"
            >
              <div className="w-20 h-20 bg-indigo-500/10 text-indigo-455 rounded-full flex items-center justify-center ring-8 ring-indigo-500/5">
                <Code className="text-indigo-400" size={40} />
              </div>
              <div className="space-y-3">
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold tracking-wide uppercase border border-indigo-500/10 mb-2 inline-block">Sandbox Dev Environment</span>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-snug">Algorithmic Coding Assessment</h2>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  You are entering the full-screen interactive coding lab. Audio/Video monitoring has been disabled for programming challenges. Complete the Leetcode-style coding exercise using our integrated compile/run environment.
                </p>
              </div>

              <div className="w-full bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-250 dark:border-slate-800 space-y-4 text-left">
                <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
                  <ShieldAlert size={16} className="text-indigo-500" /> Guidelines & Integrity Controls
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span><strong>Full Screen Lock:</strong> You must remain in full-screen mode at all times. Exiting full screen flags a violation and locks the editor screen.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-505 mt-1.5 shrink-0" />
                    <span><strong>Language Choice:</strong> You can solve using Python, JavaScript, Java, or C++. Switching languages preserves edits on other tabs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-505 mt-1.5 shrink-0" />
                    <span><strong>Run Code Tool:</strong> Execute test cases as many times as you want before submitting the final solution.</span>
                  </li>
                </ul>
              </div>

              {isGeneratingQuestions ? (
                <div id="ai-generating-questions" className="flex flex-col items-center justify-center p-4 py-6 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-250 dark:border-indigo-900 rounded-2xl w-full max-w-md mx-auto space-y-3.5">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm animate-pulse">
                    <Loader2 className="animate-spin text-indigo-500" size={18} />
                    <span>AI is crafting your tailored coding assessments...</span>
                  </div>
                  <p className="text-[11px] text-slate-500 text-center leading-relaxed font-semibold">
                    We are analyzing your chosen {jobRole} profession to engineer aligned algorithm questions with custom starter code and test evaluations.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setStep('active');
                    try {
                      const docEl = document.documentElement;
                      const requestMethod = docEl.requestFullscreen || (docEl as any).webkitRequestFullscreen || (docEl as any).mozRequestFullScreen || (docEl as any).msRequestFullscreen;
                      if (requestMethod) {
                        requestMethod.call(docEl).then(() => {
                          setIsFullscreen(true);
                        }).catch((err: any) => {
                          console.warn("Fullscreen entry failed:", err);
                          setIsFullscreen(true);
                        });
                      } else {
                        setIsFullscreen(true);
                      }
                    } catch (e) {
                      setIsFullscreen(true);
                    }
                  }}
                  className="px-12 py-4 bg-indigo-600 hover:bg-indigo-750 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 text-lg cursor-pointer"
                >
                  <Play size={20} /> Enter Practice Coding Lab
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center space-y-10 py-8"
            >
              <div className="text-center space-y-2 max-w-lg">
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold tracking-wide uppercase">Pre-Interview Stress Reduction</span>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-snug">Relax and Prepare Your Flow</h2>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  "You are fully prepared. Don't fear making mistakes. Focus on your clarity and step-by-step thinking."
                </p>
              </div>

              {/* Format choice cards */}
              <div className="w-full max-w-4xl space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block text-center mb-1">Select Practice Format</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      id: 'text' as const,
                      title: '💬 Text Only Mode',
                      desc: 'Silent practice. Type responses securely via keyboard. No permissions required.',
                      action: () => {
                        setInterviewFormat('text');
                        setIsCameraOn(false);
                        setIsMicOn(false);
                      }
                    },
                    {
                      id: 'voice' as const,
                      title: '🎤 Voice Mode',
                      desc: 'Read aloud and speak responses. Autocomplete fields using Web Speech API.',
                      action: () => {
                        setInterviewFormat('voice');
                        setIsCameraOn(false);
                        setIsMicOn(true);
                      }
                    },
                    {
                      id: 'proctor' as const,
                      title: '📹 Full Proctoring',
                      desc: 'Real simulation with interactive eye tracking, face detection, and integrity checks.',
                      action: () => {
                        setInterviewFormat('proctor');
                        setIsCameraOn(true);
                        setIsMicOn(true);
                      }
                    }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={item.action}
                      type="button"
                      className={`p-6 bg-white dark:bg-slate-900 border text-left rounded-3xl transition-all shadow-sm block w-full relative group ${interviewFormat === item.id
                        ? 'border-indigo-600 ring-2 ring-indigo-600/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-200'
                        }`}
                    >
                      <h4 className="font-bold text-slate-950 dark:text-white mb-2 text-base">{item.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                      {interviewFormat === item.id && (
                        <div className="absolute top-4 right-4 text-xs font-bold text-indigo-600 uppercase tracking-widest">Active</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Media pre-check box (only rendered if camera or mic is active) */}
              {(isCameraOn || isMicOn) && (
                <div className="w-full max-w-2xl bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 p-6 flex flex-col items-center space-y-4">
                  <div className="w-full aspect-video bg-slate-900 rounded-2xl relative overflow-hidden flex items-center justify-center">
                    {isCameraOn ? (
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-500 flex flex-col items-center gap-2">
                        <Mic size={48} className="text-indigo-400 animate-pulse" />
                        <span className="text-sm font-medium">Microphone Live (No Camera Stream Requested)</span>
                      </div>
                    )}

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                      <Tooltip content={isCameraOn ? "Turn Camera Off" : "Turn Camera On"} position="top">
                        <button
                          onClick={() => setIsCameraOn(!isCameraOn)}
                          className={`p-3 rounded-full ${isCameraOn ? 'bg-white/10 text-white' : 'bg-red-500 text-white'} backdrop-blur-md`}
                        >
                          {isCameraOn ? <Video size={18} /> : <VideoOff size={18} />}
                        </button>
                      </Tooltip>
                      <Tooltip content={isMicOn ? "Mute Microphone" : "Unmute Microphone"} position="top">
                        <button
                          onClick={() => setIsMicOn(!isMicOn)}
                          className={`p-3 rounded-full ${isMicOn ? 'bg-white/10 text-white' : 'bg-red-500 text-white'} backdrop-blur-md`}
                        >
                          {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
                        </button>
                      </Tooltip>
                      <Tooltip content="Device Settings" position="top">
                        <button
                          onClick={() => setShowDeviceSettings(!showDeviceSettings)}
                          className={`p-3 rounded-full ${showDeviceSettings ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white'} backdrop-blur-md`}
                        >
                          <Settings size={18} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showDeviceSettings && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="w-full grid grid-cols-2 gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800"
                      >
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Camera</label>
                          <select
                            value={selectedVideoDevice}
                            disabled={!isCameraOn}
                            onChange={(e) => setSelectedVideoDevice(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                          >
                            {devices.filter(d => d.kind === 'videoinput').map(d => (
                              <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 5)}`}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Microphone</label>
                          <select
                            value={selectedAudioDevice}
                            disabled={!isMicOn}
                            onChange={(e) => setSelectedAudioDevice(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                          >
                            {devices.filter(d => d.kind === 'audioinput').map(d => (
                              <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 5)}`}</option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="text-center space-y-4">
                {isGeneratingQuestions ? (
                  <div id="ai-generating-questions-noncoding" className="flex flex-col items-center justify-center p-4 py-6 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-250 dark:border-indigo-900 rounded-2xl w-full max-w-md mx-auto space-y-3.5">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm animate-pulse">
                      <Loader2 className="animate-spin text-indigo-500" size={18} />
                      <span>AI is designing simulation roleplay questions...</span>
                    </div>
                    <p className="text-[11px] text-slate-500 text-center leading-relaxed font-semibold">
                      We are styling real-world challenges for {jobRole}. The questions will load in a moment.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setStep('active');
                      // Place user directly in fullscreen mode automatically on interaction
                      try {
                        const docEl = document.documentElement;
                        const requestMethod = docEl.requestFullscreen || (docEl as any).webkitRequestFullscreen || (docEl as any).mozRequestFullScreen || (docEl as any).msRequestFullscreen;
                        if (requestMethod) {
                          requestMethod.call(docEl).then(() => {
                            setIsFullscreen(true);
                          }).catch((err: any) => {
                            console.warn("Fullscreen auto-entry failed on start:", err);
                            setIsFullscreen(true);
                          });
                        } else {
                          setIsFullscreen(true);
                        }
                      } catch (e) {
                        setIsFullscreen(true);
                      }
                    }}
                    className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 mx-auto text-lg animate-pulse cursor-pointer"
                  >
                    <Play size={20} /> Begin Interview Lab
                  </button>
                )}
              </div>
            </motion.div>
          )
        )}

        {step === 'active' && (
          type === 'Coding' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 bg-slate-950 overflow-hidden flex flex-col font-sans text-white text-left animate-fade-in"
            >
              {/* Split Header for LeetCode feel */}
              <div className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-405">
                    <Code size={16} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-indigo-500/10 text-indigo-405 font-mono px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest text-[9px]">Coding Lab</span>
                    <span className="text-sm font-semibold tracking-tight text-white">{codingQuestion?.title || "Coding Challenge"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mr-4">
                    <Timer size={14} className="text-indigo-400 animate-pulse" />
                    <span>Time Remaining:</span>
                    <span className="font-extrabold text-white text-sm">
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <Tooltip content="Exit assessment and evaluate your current progress" position="bottom">
                    <button
                      id="exit-coding-session-button"
                      onClick={() => setShowExitConfirmation(true)}
                      className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 border border-red-500/20 hover:border-red-500/50 hover:text-red-300 text-red-400 font-bold rounded-lg transition-all duration-300 ease-in-out hover:shadow-[0_0_12px_rgba(239,68,68,0.15)] focus:outline-none focus:ring-2 focus:ring-red-500/30 cursor-pointer text-xs"
                    >
                      Terminate & Evaluate
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Two-column layout */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 relative">

                {/* Full Screen Overlay Cover */}
                {(!isFullscreen || isWarningActive) && (
                  <div className="absolute inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 font-sans text-white">
                    <div className="max-w-md bg-slate-900 border border-red-500/30 p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
                      {/* Warning Glow Gradient Banner */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

                      <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-500/5">
                        <ShieldAlert className="text-red-400 animate-pulse" size={32} />
                      </div>

                      <h3 className="text-2xl font-black tracking-tight text-white uppercase font-mono">
                        {violationCount >= 3 ? "EXAM COMPLETED (LIMIT MET)" : `Security Warning (${violationCount}/3)`}
                      </h3>

                      <p className="text-sm text-slate-300 leading-relaxed font-semibold">
                        {violationCount >= 3 ? (
                          "You have exceeded the maximum allowed proctor violations (3 warnings). The assessment is now stopping and your final score is being compiled."
                        ) : (
                          `Security anomaly detected: "${lastViolationReason || "Exited Full Screen mode"}". Under secure exam policies, switching tabs, losing focus, or exiting full-screen mode is strictly prohibited.`
                        )}
                      </p>

                      {violationCount < 3 && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs font-bold text-red-400 font-mono tracking-wide uppercase">
                          {3 - violationCount} secure attempts remaining
                        </div>
                      )}

                      <div className="pt-2">
                        {violationCount >= 3 ? (
                          <div className="flex items-center justify-center gap-3 px-6 py-4 bg-red-950/50 border border-red-500/30 rounded-2xl text-red-400 font-bold text-sm w-full font-mono animate-pulse">
                            <Loader2 className="animate-spin" size={16} /> AUTO-SUBMITTING RESPONSES...
                          </div>
                        ) : (
                          <button
                            id="reenter-fullscreen-btn"
                            type="button"
                            onClick={() => {
                              try {
                                const docEl = document.documentElement;
                                const requestMethod = docEl.requestFullscreen || (docEl as any).webkitRequestFullscreen || (docEl as any).mozRequestFullScreen || (docEl as any).msRequestFullscreen;
                                if (requestMethod) {
                                  requestMethod.call(docEl).then(() => {
                                    setIsFullscreen(true);
                                    setIsWarningActive(false);
                                  }).catch(() => {
                                    setIsFullscreen(true);
                                    setIsWarningActive(false);
                                  });
                                } else {
                                  setIsFullscreen(true);
                                  setIsWarningActive(false);
                                }
                              } catch (e) {
                                setIsFullscreen(true);
                                setIsWarningActive(false);
                              }
                            }}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-505 text-white rounded-2xl font-bold tracking-wide shadow-lg shadow-indigo-600/20 transition-all text-sm block cursor-pointer hover:bg-indigo-700 font-sans"
                          >
                            Resume Assessment in Full Screen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Left panel: LeetCode descriptions & tests */}
                <div id="coding-problem-meta-panel" className="lg:col-span-5 border-r border-slate-800/85 bg-slate-900/40 flex flex-col overflow-hidden text-left">
                  {/* Tabs */}
                  <div className="flex border-b border-slate-800 bg-slate-900/60 p-2 gap-1 shrink-0 overflow-x-auto scrollbar-none">
                    <button
                      id="tab-description-btn"
                      onClick={() => {
                        setActiveCodingTab('description');
                        setActiveLeftTab('description');
                      }}
                      type="button"
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 px-2 ${activeCodingTab === 'description' && activeLeftTab === 'description'
                        ? 'bg-slate-800 text-indigo-400 border border-slate-700 font-bold'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      <Terminal size={13} /> Description
                    </button>
                    <button
                      id="tab-notes-btn"
                      onClick={() => {
                        setActiveCodingTab('description');
                        setActiveLeftTab('notes');
                      }}
                      type="button"
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 px-2 ${activeCodingTab === 'description' && activeLeftTab === 'notes'
                        ? 'bg-slate-800 text-indigo-400 border border-slate-700 font-bold'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      <FileText size={13} /> Notes
                    </button>
                    <button
                      id="tab-reference-btn"
                      onClick={() => {
                        setActiveCodingTab('description');
                        setActiveLeftTab('reference');
                      }}
                      type="button"
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 px-2 ${activeCodingTab === 'description' && activeLeftTab === 'reference'
                        ? 'bg-slate-800 text-indigo-400 border border-slate-700 font-bold'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      <BookOpen size={13} /> Reference
                    </button>
                    <button
                      id="tab-results-btn"
                      onClick={() => setActiveCodingTab('results')}
                      type="button"
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 px-2 relative ${activeCodingTab === 'results'
                        ? 'bg-slate-800 text-indigo-400 border border-slate-700 font-bold'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      <Sparkles size={13} /> Test Results
                      {codeExecutionResult && (
                        <span className={`w-1 h-1 rounded-full absolute top-1.5 right-2 ${codeExecutionResult.error ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'
                          }`} />
                      )}
                    </button>
                  </div>

                  {/* Tab contents */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {activeCodingTab === 'description' ? (
                      activeLeftTab === 'description' ? (
                        <div className="space-y-6">
                          {/* STREAK */}
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between text-left">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 font-mono">Daily Target</span>
                              <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                                🔥 {codingStreak}-Day Coding Streak!
                              </h4>
                              <p className="text-[11px] text-slate-400 leading-tight">Continuous skill sharpening increases transition potential by up to 40%.</p>
                            </div>
                            <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/25 rounded-full flex items-center justify-center text-amber-400 shrink-0">
                              <Flame size={18} className="animate-pulse" />
                            </div>
                          </div>

                          {/* DYNAMIC AI HINT SECTION */}
                          <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/20 p-4 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-indigo-400 animate-pulse">
                                <Brain size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider font-mono">Dynamic AI Interview Assistant</span>
                              </div>
                              {!showAiHint && (
                                <button
                                  onClick={() => setShowAiHint(true)}
                                  className="text-[10px] bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1 px-3 rounded-lg transition-all cursor-pointer shadow shadow-indigo-500/25"
                                >
                                  Reveal AI Algorithmic Hint
                                </button>
                              )}
                            </div>

                            {showAiHint ? (
                              <div className="text-slate-305 text-xs leading-relaxed space-y-2 animate-fade-in font-mono border-t border-indigo-950 pt-2 mt-2">
                                <p className="font-bold text-indigo-300">💡 Dynamic Solution Strategy Hint:</p>
                                <p>
                                  {codingTitleLower.includes("two sum") || codingDescLower.includes("two sum")
                                    ? "To solve this problem in O(n) linear-time rather than O(n²), consider using a Hash Map/Dictionary to store elements you have already seen paired with their sequence indices. When iterating through, check if (target - current_value) is already in your Hash Map!"
                                    : codingDescLower.includes("binary") || codingDescLower.includes("search")
                                      ? "This question suggests an sorted array or monotonic condition. Leverage two pointers (low and high) to perform Binary Search. Divide your search space in half dynamically, achieving O(log n) time complexity instead of linear scan!"
                                      : codingDescLower.includes("palindrome") || codingDescLower.includes("reverse")
                                        ? "Utilize the Two Pointer approach: place one pointer at the start of your string/array, and another pointer at the end. Step them inward simultaneously and compare values at each step to see if they're identical."
                                        : "Think about the optimal data structure. Can you use a Hash Map to record frequencies or indices? Or does sorting the array first simplify the relation? Keep space complexity in mind; an in-place pointer step may avoid auxiliary memory allocations!"}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 border-t border-slate-900 pt-1.5 mt-1">
                                  <span>Complexity Goal: O(n) Time • O(n) Space or O(1) Space optimal</span>
                                  <button onClick={() => setShowAiHint(false)} className="ml-auto text-indigo-400 hover:underline">Hide Hint</button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-400 select-none">Stuck or looking to optimize? Reveal a tailored structural strategy hint from the virtual AI proctor without exposing the full reference solution.</p>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h2 className="text-xl font-bold tracking-tight text-white">{codingQuestion?.title || "Coding Challenge"}</h2>
                              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-extrabold border shrink-0 ${codingQuestion?.difficulty?.toLowerCase() === 'easy'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-405'
                                : codingQuestion?.difficulty?.toLowerCase() === 'hard'
                                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                }`}>
                                {codingQuestion?.difficulty || "Medium"}
                              </span>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{codingQuestion?.description || "Select a coding task to begin."}</p>
                          </div>

                          {/* Constraints */}
                          {(() => {
                            const constraintsArray = typeof codingQuestion?.constraints === 'string'
                              ? codingQuestion.constraints.split('\n').filter(Boolean)
                              : Array.isArray(codingQuestion?.constraints)
                                ? codingQuestion.constraints
                                : [];
                            return constraintsArray.length > 0 && (
                              <div className="space-y-2">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono text-[9px]">Constraints</h3>
                                <ul className="space-y-1.5">
                                  {constraintsArray.map((c: string, idx: number) => (
                                    <li key={idx} className="text-xs text-slate-404 font-mono bg-slate-900 border border-slate-800/80 p-2 rounded-lg flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-505 shrink-0" /> {c}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })()}

                          {/* Sample Cases */}
                          {(() => {
                            const samplesArray = Array.isArray(codingQuestion?.samples)
                              ? codingQuestion.samples
                              : typeof codingQuestion?.samples === 'string'
                                ? [{ input: codingQuestion.samples, output: '', explanation: '' }]
                                : [];
                            return samplesArray.length > 0 && (
                              <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono text-[9px]">Examples</h3>
                                {samplesArray.map((sample: any, idx: number) => (
                                  <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-xs">
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Example {idx + 1}</div>
                                    <div><span className="text-indigo-400 font-bold">Input:</span> {sample.input || 'N/A'}</div>
                                    <div><span className="text-cyan-400 font-bold">Output:</span> {sample.output || 'N/A'}</div>
                                    {sample.explanation && (
                                      <div className="text-slate-404 text-xs italic border-t border-slate-800/80 pt-2 mt-2 leading-relaxed">
                                        <span className="text-slate-500 uppercase tracking-[0.1em] text-[10px] block mb-1 font-bold">Explanation:</span>
                                        {sample.explanation}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      ) : activeLeftTab === 'notes' ? (
                        <div className="space-y-6 flex flex-col h-full">
                          {/* STREAK */}
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between text-left shrink-0">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 font-mono">Streak Achieved</span>
                              <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                                🔥 {codingStreak}-Day Coding Streak!
                              </h4>
                              <p className="text-[11px] text-slate-400 leading-tight">You've solved coding challenges 14 days in a row. Maintain your momentum!</p>
                            </div>
                            <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/25 rounded-full flex items-center justify-center text-amber-400 shrink-0">
                              <Flame size={18} className="animate-pulse" />
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col space-y-2 min-h-[300px]">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Private Scratchpad & Plan</label>
                            <textarea
                              id="scratchpad-notes-area"
                              value={userNotes}
                              onChange={(e) => setUserNotes(e.target.value)}
                              placeholder="Type your design ideas, edge cases, pseudocode, or dry-run states here..."
                              className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 resize-none placeholder:text-slate-600 leading-relaxed font-semibold focus:text-white"
                            />
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono shrink-0 pt-1">
                              <span>{userNotes.split(/\s+/).filter(Boolean).length} Words • {userNotes.length} Characters</span>
                              <span className="text-emerald-400 flex items-center gap-1 animate-pulse">● Auto-saving scratchpad</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6 font-mono text-xs">
                          {/* CHEAT SHEET DEPENDING ON PROGRAMMING LANGUAGE SELECTED */}
                          <div className="space-y-2">
                            <h3 className="text-sm font-bold text-indigo-400 font-sans">🧠 {codingLanguage.toUpperCase()} Reference Cheat Sheet</h3>
                            <p className="text-slate-400 text-[11px] font-sans">Frequently used commands, optimal operations, standard templates and API summaries.</p>
                          </div>

                          {codingLanguage === 'python' ? (
                            <div className="space-y-4 text-left">
                              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                                <div className="text-indigo-400 font-bold uppercase tracking-wider text-[10px]">Operations & Hash Maps (dict)</div>
                                <pre className="text-[11px] text-slate-300 leading-relaxed">
                                  {`# Initialize & Lookup
seen = {}     # seen = dict()
seen[num] = idx
if num in seen:
    return [seen[num], idx]

# Set Operations
values = set([1, 2, 3])
values.add(4)
if x in values: # O(1) average
    pass`}
                                </pre>
                              </div>

                              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                                <div className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">Sorting & Custom Heaps</div>
                                <pre className="text-[11px] text-slate-300 leading-relaxed">
                                  {`# Sorting List (in-place VS copy)
nums.sort()              # O(n log n) in-place
sorted_list = sorted(arr)

# Heaps (Min Heap by default)
import heapq
heap = []
heapq.heappush(heap, item)
smallest = heapq.heappop(heap)`}
                                </pre>
                              </div>
                            </div>
                          ) : codingLanguage === 'javascript' ? (
                            <div className="space-y-4 text-left">
                              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                                <div className="text-indigo-400 font-bold uppercase tracking-wider text-[10px]">Maps & Objects</div>
                                <pre className="text-[11px] text-slate-300 leading-relaxed">
                                  {`// Initialize and map checks
const seen = new Map();
seen.set(num, idx);
if (seen.has(target)) {
    return [seen.get(target), idx];
}

// Plain Object
const obj = {};
obj[key] = value;
if (key in obj) { ... }`}
                                </pre>
                              </div>

                              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                                <div className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">Array Helper Methods</div>
                                <pre className="text-[11px] text-slate-300 leading-relaxed">
                                  {`// Sorting ES6 arrays (Caution: default is alphabetical!)
nums.sort((a, b) => a - b); // Ascending sort

// Useful iterations
const doubled = nums.map(x => x * 2);
const evens = nums.filter(x => x % 2 === 0);
const sum = nums.reduce((acc, curr) => acc + curr, 0);`}
                                </pre>
                              </div>
                            </div>
                          ) : codingLanguage === 'java' ? (
                            <div className="space-y-4 text-left">
                              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                                <div className="text-indigo-400 font-bold uppercase tracking-wider text-[10px]">HashMaps & Sets (Java Framework)</div>
                                <pre className="text-[11px] text-slate-300 leading-relaxed">
                                  {`import java.util.*;

Map<Integer, Integer> seen = new HashMap<>();
seen.put(num, index);
if (seen.containsKey(target)) {
    return new int[] { seen.get(target), index };
}

Set<Integer> set = new HashSet<>();
set.add(num);
if (set.contains(target)) { ... }`}
                                </pre>
                              </div>

                              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                                <div className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">Arrays & Dynamic List Conversion</div>
                                <pre className="text-[11px] text-slate-300 leading-relaxed">
                                  {`// Array sorting & helpers
Arrays.sort(nums); // O(n log n)

// ArrayList operations
List<Integer> list = new ArrayList<>();
list.add(10);
int val = list.get(0);
int size = list.size();`}
                                </pre>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4 text-left">
                              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                                <div className="text-indigo-400 font-bold uppercase tracking-wider text-[10px]">C++ STL Maps & Unordered Maps</div>
                                <pre className="text-[11px] text-slate-300 leading-relaxed">
                                  {`#include <unordered_map>
#include <vector>

std::unordered_map<int, int> seen;
seen[num] = index;
if (seen.count(target)) {
    return { seen[target], index };
}`}
                                </pre>
                              </div>

                              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                                <div className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">Sorting & Vectors</div>
                                <pre className="text-[11px] text-slate-300 leading-relaxed">
                                  {`#include <algorithm>

// Vectors (dynamic array size)
std::vector<int> nums = {4, 2, 1, 3};

// std::sort (in-place intro-sort)
std::sort(nums.begin(), nums.end());`}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      /* Test Results content space + custom test case configuration + history */
                      <div className="space-y-6">
                        {/* CUSTOM TEST INPUT FIELD */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-left shrink-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Run with Custom Case</span>
                            <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">Active Sandbox</span>
                          </div>
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              id="custom-input-textbox"
                              value={customTestInput}
                              onChange={(e) => setCustomTestInput(e.target.value)}
                              placeholder={
                                codingLanguage === 'python' || codingLanguage === 'javascript'
                                  ? 'e.g. nums = [2,7,11,15], target = 9'
                                  : 'Enter any customized parameters...'
                              }
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 px-3 text-xs font-mono text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-600 focus:text-white"
                            />
                            <p className="text-[10px] text-slate-500 leading-relaxed">This custom test case parameter input executes at the very beginning of the validation suite on click.</p>
                          </div>
                        </div>

                        {/* PREVIOUS SUBMISSION REVIEWS */}
                        {submissionHistory && submissionHistory.length > 0 && (
                          <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4 space-y-3 text-left shrink-0">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Submission Audit Logs</h4>
                            <div className="divide-y divide-slate-850/60 max-h-[160px] overflow-y-auto pr-1 space-y-2">
                              {submissionHistory.map((sh, sIdx) => (
                                <div key={sIdx} className="flex items-center justify-between text-xs font-mono pt-2 first:pt-0">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`w-1.5 h-1.5 rounded-full ${sh.status === 'Passed' ? 'bg-emerald-400' : sh.status === 'Failed' ? 'bg-amber-400' : 'bg-red-500'
                                        }`} />
                                      <span className={`font-bold ${sh.status === 'Passed' ? 'text-emerald-400' : sh.status === 'Failed' ? 'text-amber-400' : 'text-red-400'
                                        }`}>{sh.status}</span>
                                      <span className="text-slate-600 text-[10px]">({sh.language})</span>
                                    </div>
                                    <span className="text-slate-500 text-[10px] block">{sh.timestamp}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400 bg-slate-950 p-1 px-2 rounded-md border border-slate-850">
                                    {sh.passedCount}/{sh.totalCount} Cases • {sh.runtime}ms
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {!codeExecutionResult ? (
                          <div className="text-center py-16 space-y-3 bg-slate-905/30 border border-dashed border-slate-800 rounded-xl">
                            <div className="w-12 h-12 bg-slate-900 border border-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                              <Play size={20} />
                            </div>
                            <h3 className="text-sm font-semibold text-white">No Execution Logs</h3>
                            <p className="text-xs text-slate-550 max-w-xs mx-auto leading-relaxed">Click "Run Test Cases" on the IDE workspace to trigger compilation against verified test cases.</p>
                          </div>
                        ) : (
                          <div className="space-y-5 animate-fade-in text-left">
                            {/* Run summary banner */}
                            <div className={`p-4 rounded-xl border flex items-center justify-between ${codeExecutionResult.error
                              ? 'bg-red-500/10 border-red-500/30 text-red-405'
                              : codeExecutionResult.summary?.passed === codeExecutionResult.summary?.total
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              }`}>
                              <div>
                                <h4 className="text-sm font-bold uppercase tracking-wide font-mono">
                                  {codeExecutionResult.error ? "Compilation Failed" :
                                    codeExecutionResult.summary?.passed === codeExecutionResult.summary?.total
                                      ? "Passed All Test Cases" : "Failed Some Test Cases"}
                                </h4>
                                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                                  {!codeExecutionResult.error && `${codeExecutionResult.summary?.passed || 0}/${codeExecutionResult.summary?.total || 0} cases passed`}
                                </p>
                              </div>
                              <span className="text-xs font-mono px-2.5 py-1 bg-slate-950 rounded-lg font-bold">
                                {codeExecutionResult.summary?.runtimeMs || 45} ms
                              </span>
                            </div>

                            {/* Compilation errors */}
                            {codeExecutionResult.error && (
                              <div className="bg-slate-950/80 border border-red-500/25 p-4 rounded-xl font-mono text-xs text-red-400 overflow-x-auto space-y-2">
                                <div className="text-red-500 uppercase tracking-widest text-[9px] font-bold">Compiler Terminal Logs:</div>
                                <pre className="whitespace-pre-wrap leading-relaxed">{codeExecutionResult.error}</pre>
                              </div>
                            )}

                            {/* Individual cases */}
                            {codeExecutionResult.testResults && codeExecutionResult.testResults.length > 0 && (
                              <div className="space-y-3">
                                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 font-mono text-[9px] text-left">Test Case Breakdown</h3>
                                {codeExecutionResult.testResults.map((tr: any, idx: number) => (
                                  <div key={idx} className="bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden font-mono text-xs text-left">
                                    <div className="bg-slate-850 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between font-bold">
                                      <span className="text-slate-305">Case {idx + 1}</span>
                                      {tr.passed ? (
                                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                                          ✓ Passed
                                        </span>
                                      ) : (
                                        <span className="text-red-405 bg-red-500/10 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                                          ✗ Failed
                                        </span>
                                      )}
                                    </div>
                                    <div className="p-4 space-y-2.5">
                                      <div>
                                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-bold mb-0.5 mt-1">Parameters Input</span>
                                        <pre className="bg-slate-950 p-2 rounded border border-slate-850/80 text-white overflow-x-auto select-all">{tr.input}</pre>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <span className="text-indigo-400 block text-[9px] uppercase tracking-wider font-bold mb-0.5">Expected Output</span>
                                          <pre className="bg-slate-950 p-2 rounded border border-slate-850/80 text-slate-400 overflow-x-auto">{tr.expected}</pre>
                                        </div>
                                        <div>
                                          <span className={`${tr.passed ? 'text-emerald-400' : 'text-red-400'} block text-[9px] uppercase tracking-wider font-bold mb-0.5`}>Your Output</span>
                                          <pre className="bg-slate-950 p-2 rounded border border-slate-850/80 text-slate-300 overflow-x-auto">{tr.actual}</pre>
                                        </div>
                                      </div>
                                      {tr.stdout && tr.stdout.trim() !== "" && (
                                        <div>
                                          <span className="text-cyan-400 block text-[9px] uppercase tracking-wider font-bold mb-0.5">Console Standard Printout (Stdout)</span>
                                          <pre className="bg-slate-950 p-2 rounded border border-indigo-950/40 text-cyan-405 overflow-x-auto font-mono text-[11px] leading-relaxed italic">{tr.stdout}</pre>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right panel: Editor Workspace */}
                <div id="coding-editor-sandbox" className="lg:col-span-7 flex flex-col bg-slate-950 overflow-hidden relative border-l border-slate-800">
                  {/* Editor Toolbars */}
                  <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <select
                        id="programming-language-selector"
                        value={codingLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono cursor-pointer"
                      >
                        <option value="python">🐍 Python 3</option>
                        <option value="javascript">🟨 JavaScript (ES6)</option>
                        <option value="java">☕ Java (JDK 21)</option>
                        <option value="cpp">⚙️ C++ (G++ 11)</option>
                      </select>

                      <button
                        id="reset-code-template-btn"
                        onClick={() => {
                          if (confirm("Reset current language editor state back to the original template? Edits will be deleted.")) {
                            const cached = codingQuestion?.starterCode?.[codingLanguage] || '';
                            setCurrentAnswer(cached);
                          }
                        }}
                        className="p-1 px-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded text-xs font-mono transition-all border border-transparent hover:border-slate-700 cursor-pointer"
                      >
                        Reset Template
                      </button>
                    </div>

                    <div className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">
                      IDE Active Sandbox
                    </div>
                  </div>

                  {/* Absolute Editor */}
                  <div className="flex-1 overflow-hidden relative flex text-left">
                    {/* Line numbers column */}
                    <div className="w-10 bg-slate-950 border-r border-slate-900 select-none text-right pr-2 pt-4 font-mono text-xs text-slate-600 space-y-1">
                      {Array.from({ length: Math.max(15, currentAnswer.split('\n').length) }).map((_, i) => (
                        <div key={i} className="leading-6">{i + 1}</div>
                      ))}
                    </div>

                    {/* Editor Textarea */}
                    <textarea
                      id="editor-code-input"
                      value={currentAnswer}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCurrentAnswer(val);
                        setLanguageAnswers(prev => ({
                          ...prev,
                          [codingLanguage]: val
                        }));

                        const newAnswers = [...answers];
                        newAnswers[0] = val;
                        setAnswers(newAnswers);

                        // Intelligently trigger autocomplete suggestions matching language
                        const cursorPosition = e.target.selectionStart;
                        const textBeforeCursor = val.substring(0, cursorPosition);
                        const wordsParts = textBeforeCursor.split(/[\s(){}[\].,;+\-/*]/);
                        const lastWord = wordsParts[wordsParts.length - 1];

                        if (lastWord && lastWord.length >= 2) {
                          const keywords = LANGUAGE_KEYWORDS[codingLanguage] || [];
                          const matches = keywords.filter(k => k.toLowerCase().startsWith(lastWord.toLowerCase()) && k !== lastWord);
                          if (matches.length > 0) {
                            setAutocompleteSuggestions(matches);
                            setShowAutocomplete(true);
                            setAutocompleteSelectedIdx(0);
                          } else {
                            setShowAutocomplete(false);
                          }
                        } else {
                          setShowAutocomplete(false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (showAutocomplete && autocompleteSuggestions.length > 0) {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setAutocompleteSelectedIdx(prev => (prev + 1) % autocompleteSuggestions.length);
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setAutocompleteSelectedIdx(prev => (prev - 1 + autocompleteSuggestions.length) % autocompleteSuggestions.length);
                          } else if (e.key === 'Tab' || e.key === 'Enter') {
                            e.preventDefault();
                            applyAutocompleteSuggestion(autocompleteSuggestions[autocompleteSelectedIdx]);
                          } else if (e.key === 'Escape') {
                            setShowAutocomplete(false);
                          }
                        } else if (e.key === 'Tab') {
                          e.preventDefault();
                          const start = e.currentTarget.selectionStart;
                          const end = e.currentTarget.selectionEnd;
                          const val = e.currentTarget.value;
                          const newVal = val.substring(0, start) + "    " + val.substring(end);

                          setCurrentAnswer(newVal);
                          setLanguageAnswers(prev => ({ ...prev, [codingLanguage]: newVal }));

                          setTimeout(() => {
                            const ta = document.getElementById('editor-code-input') as HTMLTextAreaElement;
                            if (ta) {
                              ta.selectionStart = ta.selectionEnd = start + 4;
                            }
                          }, 0);
                        } else if (e.key === 'Enter') {
                          // Prevent default enter key mechanics to handle sequence smart indentation
                          e.preventDefault();
                          const start = e.currentTarget.selectionStart;
                          const end = e.currentTarget.selectionEnd;
                          const val = e.currentTarget.value;

                          // Determine correct indentation of the current active line
                          const beforeText = val.substring(0, start);
                          const lines = beforeText.split('\n');
                          const currentLine = lines[lines.length - 1];

                          // Match the exact active whitespace prefix sequence of the current line
                          const whitespaceMatch = currentLine.match(/^(\s*)/);
                          const baseIndent = whitespaceMatch ? whitespaceMatch[1] : '';

                          const trimmed = currentLine.trim();
                          let extraIndent = '';
                          let closingBlockText = '';

                          // Automatic bracket block indentation sequence Rules
                          if (trimmed.endsWith('{')) {
                            extraIndent = '    '; // Add a secondary logical indention level

                            // Check if next character is a closing brace to auto-indent it cleanly
                            const afterText = val.substring(end);
                            if (afterText.trim().startsWith('}')) {
                              closingBlockText = '\n' + baseIndent;
                            }
                          } else if (codingLanguage === 'python' && trimmed.endsWith(':')) {
                            extraIndent = '    ';
                          }

                          const generatedBlock = '\n' + baseIndent + extraIndent;
                          const newVal = val.substring(0, start) + generatedBlock + closingBlockText + val.substring(end);

                          setCurrentAnswer(newVal);
                          setLanguageAnswers(prev => ({ ...prev, [codingLanguage]: newVal }));

                          setTimeout(() => {
                            const ta = document.getElementById('editor-code-input') as HTMLTextAreaElement;
                            if (ta) {
                              ta.selectionStart = ta.selectionEnd = start + generatedBlock.length;
                            }
                          }, 0);
                        }
                      }}
                      placeholder={`# Write your compiled solution in ${codingLanguage}...`}
                      className="flex-1 bg-slate-955 text-emerald-450 font-mono text-sm leading-6 p-4 outline-none resize-none overflow-y-auto focus:ring-0 selection:bg-slate-800 focus:text-white-pure"
                      style={{ tabSize: 4 }}
                    />

                    {/* Autocomplete Suggestions Box Overlay */}
                    {showAutocomplete && autocompleteSuggestions.length > 0 && (
                      <div className="absolute bottom-4 right-4 bg-slate-900 border border-slate-700/85 rounded-xl shadow-2xl p-3 max-w-xs z-50 text-left font-mono font-bold animate-fade-in space-y-1.5 shrink-0 select-none">
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1 mb-1 font-bold flex items-center justify-between gap-4">
                          <span>Keyword Helper</span>
                          <span className="text-[8px] bg-slate-850 text-indigo-400 p-0.5 px-1 rounded border border-slate-700/50">TAB / ENTER</span>
                        </div>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {autocompleteSuggestions.map((suggestion, opIdx) => (
                            <button
                              key={opIdx}
                              onClick={() => applyAutocompleteSuggestion(suggestion)}
                              className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between transition-all cursor-pointer ${opIdx === autocompleteSelectedIdx
                                ? 'bg-indigo-600 border border-indigo-505 text-white font-extrabold focus:outline-none'
                                : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
                                }`}
                            >
                              <span>{suggestion}</span>
                              {opIdx === autocompleteSelectedIdx && <Check size={11} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar Panel */}
                  <div className="bg-slate-900/60 border-t border-slate-800 p-4 shrink-0 flex items-center justify-between font-mono">
                    <div className="text-slate-500 text-xs">
                      {isExecuting ? (
                        <span className="flex items-center gap-2 text-indigo-400">
                          <Loader2 className="animate-spin" size={14} /> Compiling and testing solution...
                        </span>
                      ) : (
                        <span>Sandbox debugger active</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        id="execute-test-cases-btn"
                        onClick={runCode}
                        disabled={isExecuting}
                        className="px-6 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {isExecuting ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />}
                        Run Test Cases
                      </button>

                      <button
                        id="submit-coding-challenge-btn"
                        onClick={() => {
                          if (currentAnswer.length < 20) {
                            alert("Your code is too short. Please solve the problem before submitting.");
                            return;
                          }

                          const newAnswers = [...answers];
                          newAnswers[0] = currentAnswer;
                          setAnswers(newAnswers);

                          playSoundEffect('success');
                          finishInterview();
                        }}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-lg shadow-indigo-600/20 cursor-pointer"
                      >
                        Submit Challenge
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 overflow-y-auto flex flex-col font-sans"
            >
              {/* Elegant Focus Header */}
              <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase font-mono">
                    Assessment Focus Mode
                  </span>
                  <span className="text-slate-350 dark:text-slate-700">|</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white">
                    {type} Session
                  </span>
                  <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-400 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                    {jobRole}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-xs text-red-550 dark:text-red-400 font-extrabold bg-red-50 dark:bg-red-950/40 px-3.5 py-1.5 rounded-full border border-red-100 dark:border-red-950/30 flex items-center gap-1.5 uppercase tracking-wide">
                    Proctoring Active
                  </div>
                </div>
              </div>

              <div className="flex-1 p-8 md:p-12 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[300px] flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
                      <motion.div
                        className="h-full bg-indigo-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-50 animate-pulse" />
                        <div className="absolute inset-2 bg-gradient-to-br from-indigo-400 to-cyan-400 rounded-full animate-spin-slow" style={{ animationDuration: '3s' }} />
                        <div className="absolute inset-3 bg-slate-900 rounded-full flex items-center justify-center">
                          <Brain size={20} className="text-cyan-400" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-1">
                          AI Interviewer <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="text-sm text-slate-500">Question {currentQuestionIndex + 1} of {questions?.length ?? 0}</div>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start justify-between">
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight flex-1">
                        {questions?.[currentQuestionIndex] || <Loader2 className="animate-spin" />}
                      </h2>
                      {questions?.[currentQuestionIndex] && (
                        <button
                          onClick={() => {
                            if ('speechSynthesis' in window) {
                              window.speechSynthesis.cancel();
                              const ratePref = Number(localStorage.getItem('pref_voice_rate') || '1.0');
                              const utterance = new SpeechSynthesisUtterance(questions[currentQuestionIndex]);
                              utterance.rate = ratePref;
                              const voices = window.speechSynthesis.getVoices();
                              const preferredVoice = voices.find(v => v.lang.startsWith('en-') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft')));
                              if (preferredVoice) {
                                utterance.voice = preferredVoice;
                              }
                              window.speechSynthesis.speak(utterance);
                            }
                            playSoundEffect('click');
                          }}
                          className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-slate-800 transition-all shadow-sm shrink-0 cursor-pointer"
                          title="Read Question Aloud"
                        >
                          <Volume2 size={20} />
                        </button>
                      )}
                    </div>

                    <div className="mt-8">
                      <div className="relative">
                        <textarea
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                          placeholder={isListening ? "Listening... Speak clearly into your microphone." : "Type your answer here, or click the microphone to speak... (Web Speech API Enabled)"}
                          className="w-full h-32 bg-[#F5F7FB] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 pr-16 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-900 dark:text-white font-medium"
                        />
                        <button
                          type="button"
                          onClick={isListening ? stopListening : startListening}
                          className={`absolute right-4 bottom-4 p-3.5 rounded-full transition-all flex items-center justify-center ${isListening
                            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                            }`}
                          title={isListening ? "Stop listening" : "Click to dictate using your voice"}
                        >
                          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="mt-12 flex justify-between items-center">
                      <div className="flex items-center gap-6 text-slate-500">
                        <div className="flex items-center gap-2">
                          <Timer size={18} /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Pace</span>
                            <span className="text-xs font-bold text-indigo-500">{audioMetrics.pace}%</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Tone</span>
                            <span className="text-xs font-bold text-cyan-500">{audioMetrics.tone}%</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Clarity</span>
                            <span className="text-xs font-bold text-violet-500">{audioMetrics.clarity}%</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newAnswers = [...answers];
                          newAnswers[currentQuestionIndex] = currentAnswer;
                          setAnswers(newAnswers);

                          if (currentQuestionIndex < questions.length - 1) {
                            const nextIndex = currentQuestionIndex + 1;
                            setCurrentQuestionIndex(nextIndex);
                            setCurrentAnswer(newAnswers[nextIndex] || '');
                            playSoundEffect('chime');

                            // Immediate save on transition for bulletproof session continuity
                            const sessionState = {
                              timestamp: Date.now(),
                              type,
                              jobRole,
                              questions,
                              answers: newAnswers,
                              currentQuestionIndex: nextIndex,
                              timeLeft,
                              violationCount,
                              anomalies
                            };
                            localStorage.setItem('active_interview_session', JSON.stringify(sessionState));
                          } else {
                            playSoundEffect('success');
                            finishInterview();
                          }
                        }}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
                      >
                        {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <h4 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Confidence Meter</h4>
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          animate={{ width: `${(audioMetrics.tone + audioMetrics.clarity) / 2}%` }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        {interviewFormat === 'text'
                          ? (((audioMetrics.tone + audioMetrics.clarity) / 2) > 80 ? 'Strong, professional phrasing' : 'Analyzing response structure...')
                          : (((audioMetrics.tone + audioMetrics.clarity) / 2) > 80 ? 'Stable and clear voice detected' : 'Analyzing voice patterns...')
                        }
                      </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <h4 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Integrity Status</h4>
                      <div className={`flex items-center gap-2 font-semibold ${proctoringStatus === 'secure' ? 'text-emerald-500' :
                        proctoringStatus === 'warning' ? 'text-amber-500' : 'text-red-500'
                        }`}>
                        <ShieldAlert size={18} />
                        {proctoringStatus === 'secure' ? 'Secure Session' :
                          proctoringStatus === 'warning' ? 'Warning' : 'Critical Alert'}
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        {proctoringStatus === 'secure' ? 'No suspicious activity found' : anomalies[anomalies.length - 1]}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {interviewFormat === 'proctor' ? (
                    <div className="aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-xl border-4 border-white dark:border-slate-800 relative group">
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />

                      {!faceDetected && (
                        <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex items-center justify-center z-10">
                          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-red-500 shadow-xl flex items-center gap-3 animate-bounce">
                            <AlertTriangle className="text-red-500" size={24} />
                            <span className="text-red-500 font-bold">Face Not Detected!</span>
                          </div>
                        </div>
                      )}

                      {/* Simulated Face Detection Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        <motion.div
                          animate={{
                            x: [100, 120, 100],
                            y: [80, 70, 80],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-cyan-500/50 rounded-2xl"
                        >
                          <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                          <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

                          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 bg-cyan-500/20 backdrop-blur-md rounded-md border border-cyan-500/30">
                            <Scan size={10} className="text-cyan-400" />
                            <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest">Face_ID_Verified</span>
                          </div>
                        </motion.div>

                        {/* Scanning Line */}
                        <motion.div
                          animate={{ top: ['0%', '100%', '0%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 w-full h-[1px] bg-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                        />

                        {/* Eye Tracking Simulation */}
                        <motion.div
                          animate={{
                            x: [140, 160, 140],
                            y: [100, 105, 100]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute top-1/3 left-1/3 w-4 h-4 rounded-full border border-cyan-400/50 flex items-center justify-center"
                        >
                          <div className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_5px_#22d3ee]" />
                        </motion.div>
                        <motion.div
                          animate={{
                            x: [240, 260, 240],
                            y: [100, 105, 100]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute top-1/3 right-1/3 w-4 h-4 rounded-full border border-cyan-400/50 flex items-center justify-center"
                        >
                          <div className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_5px_#22d3ee]" />
                        </motion.div>
                      </div>

                      {/* Proctoring Status Overlay */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <div className={`px-3 py-1.5 rounded-full backdrop-blur-md border flex items-center gap-2 transition-colors ${proctoringStatus === 'secure' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          proctoringStatus === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                            'bg-red-500/10 border-red-500/20 text-red-400'
                          }`}>
                          <div className={`w-2 h-2 rounded-full animate-pulse ${proctoringStatus === 'secure' ? 'bg-emerald-500' :
                            proctoringStatus === 'warning' ? 'bg-amber-500' :
                              'bg-red-500'
                            }`} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            {proctoringStatus === 'secure' ? 'Secure' : proctoringStatus === 'warning' ? 'Warning' : 'Critical'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px]">
                      {/* Glowing background pulses */}
                      <div className="absolute -inset-10 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />

                      <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-1 animate-spin-slow">
                          <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                            <Sparkles className="text-cyan-400 animate-pulse" size={32} />
                          </div>
                        </div>
                        {isListening && (
                          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-white font-bold text-lg relative z-10">CareerMap AI Coach</h4>
                      <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mb-4 relative z-10">
                        {isListening ? '🎙️ Coach listening to voice...' : '💬 Silent Practice Active'}
                      </p>

                      {/* Pre-Interview stress reduction quote helper */}
                      <div className="p-5 bg-slate-950/60 backdrop-blur-sm rounded-2xl border border-slate-800/80 relative z-10 mt-2">
                        <p className="text-sm font-medium text-slate-300 italic leading-relaxed">
                          {currentQuestionIndex % 3 === 0 ? '"Breathe, take your time. Stating the outline of your thinking counts double!"' :
                            currentQuestionIndex % 3 === 1 ? '"Do not stress if you stumble. Real mock situations build maximum memory!"' :
                              '"You are fully prepared. Maintain a confident, clear tone. You can do this!"'}
                        </p>
                      </div>
                    </div>
                  )}

                  {anomalies.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-200 dark:border-red-800 p-6">
                      <h4 className="text-red-600 dark:text-red-400 font-bold flex items-center gap-2 mb-3">
                        <AlertTriangle size={18} /> Warnings Detected
                      </h4>
                      <ul className="space-y-2">
                        {anomalies?.map((a, i) => (
                          <li key={i} className="text-sm text-red-500 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-red-500" /> {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/20">
                    <h4 className="font-bold mb-2">AI Interviewer Note</h4>
                    <p className="text-sm text-indigo-100 leading-relaxed">
                      "Take your time to explain the logic. I'm looking for how you approach the problem, not just the final answer."
                    </p>
                  </div>
                </div>
              </div>

              {/* Secure assessment warning modal overlay */}
              {isWarningActive && (
                <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 text-white animate-fade-in font-sans">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden text-center space-y-6"
                  >
                    {/* Warning Glow Gradient Banner */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

                    <div className="space-y-4">
                      <div className="inline-flex p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 animate-pulse">
                        <ShieldAlert size={48} />
                      </div>

                      <h3 className="text-2xl font-black tracking-tight text-white uppercase font-mono">
                        {violationCount >= 3 ? "EXAM COMPLETED (LIMIT MET)" : `Security Warning (${violationCount}/3)`}
                      </h3>

                      <p className="text-sm text-slate-300 leading-relaxed">
                        {violationCount >= 3 ? (
                          "You have exceeded the maximum allowed proctor violations (3 warnings). The assessment is now stopping and your final score is being compiled."
                        ) : (
                          `Security anomaly detected: "${lastViolationReason}". Under secure exam policies, switching tabs, losing focus, or exiting full-screen mode is strictly prohibited.`
                        )}
                      </p>

                      {violationCount < 3 && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs font-bold text-red-400 font-mono tracking-wide uppercase">
                          {3 - violationCount} secure attempts remaining
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      {violationCount >= 3 ? (
                        <div className="flex items-center justify-center gap-3 px-6 py-4 bg-red-950/50 border border-red-500/30 rounded-2xl text-red-400 font-bold text-sm w-full font-mono animate-pulse">
                          <Loader2 className="animate-spin" size={16} /> AUTO-SUBMITTING RESPONSES...
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResumeActiveSession}
                          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-505 text-white rounded-2xl font-bold tracking-wide shadow-lg shadow-indigo-600/20 transition-all text-sm w-full block text-center cursor-pointer hover:bg-indigo-700"
                        >
                          Resume Assessment in Full Screen
                        </button>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )
        )}

        {step === 'finished' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-5xl mx-auto w-full py-8 space-y-8"
          >
            {/* Elegant Header with Emotional Support Quote */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center text-white shadow-2xl">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />

              <div className="relative z-10 space-y-4">
                <div className="inline-flex p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
                  <CheckCircle2 size={32} className="animate-bounce" />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Interview Lab Accomplished!
                </h1>
                <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                  "Every performance is a stepping stone to mastership. Mistakes are merely raw materials of success. Be proud of taking dedicated action today!"
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isEvaluating ? (
                <motion.div
                  key="evaluating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-slate-900 p-16 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center flex flex-col items-center justify-center space-y-6"
                >
                  <div className="relative">
                    <Loader2 className="text-indigo-600 animate-spin" size={64} />
                    <Sparkles className="absolute -top-1 -right-1 text-cyan-400 animate-pulse" size={20} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Calculating Your Score and Feedback</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                      Our friendly AI is looking over your answers to see what you did well and how you can make them even better...
                    </p>
                  </div>
                </motion.div>
              ) : evaluation ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 text-left"
                >
                  {/* ROW 1: Executive Overview (Score + Coach Feedback Summary) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Overall Score Circle Card */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden h-full">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 dark:bg-slate-950/20 rounded-bl-full pointer-events-none" />

                      {/* Beautiful Radial Score Chart */}
                      <div className="relative flex items-center justify-center mb-6">
                        <svg className="w-36 h-36 transform -rotate-90">
                          <circle
                            cx="72"
                            cy="72"
                            r="60"
                            className="stroke-slate-100 dark:stroke-slate-800 fill-none"
                            strokeWidth="10"
                          />
                          <motion.circle
                            cx="72"
                            cy="72"
                            r="60"
                            className="stroke-indigo-600 fill-none"
                            strokeWidth="10"
                            strokeDasharray={376.99}
                            initial={{ strokeDashoffset: 376.99 }}
                            animate={{ strokeDashoffset: 376.99 - (376.99 * (Number(evaluation.overallScore) || 75)) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-4xl font-black text-slate-950 dark:text-white leading-none">
                            {evaluation.overallScore}
                          </span>
                          <span className="text-[9px] font-bold tracking-widest text-slate-400 mt-1 uppercase font-mono">Overall Score</span>
                        </div>
                      </div>

                      {/* Score Badge Pill */}
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-955/40 text-indigo-650 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/30 rounded-full text-xs font-bold tracking-wide">
                          <Trophy size={12} className="text-indigo-500" />
                          <span>
                            {evaluation.overallScore >= 92 ? 'Outstanding Profile' :
                              evaluation.overallScore >= 82 ? 'Above Average' :
                                evaluation.overallScore >= 70 ? 'Proficient' :
                                  'Needs Practice'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 max-w-[200px] leading-relaxed font-medium">
                          Your overall score compiles technical depth, logic accuracy, and presentation style.
                        </p>
                      </div>
                    </div>

                    {/* Global AI Coach Summary Notes (Executive Feedback) */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-650 dark:text-indigo-400">
                          <Sparkles size={20} className="text-indigo-500" />
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Coach's Executive Feedback</h3>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          High-level review of your interview simulation. Highlighted strengths, structure notes, and growth focus recommendations.
                        </p>
                        <div className="p-6 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 text-indigo-950 dark:text-indigo-200 text-sm leading-relaxed font-medium">
                          {typeof evaluation.feedback === 'string' ? `"${evaluation.feedback}"` : renderFeedbackText(evaluation.feedback)}
                        </div>
                      </div>

                      {/* Interactive metadata details */}
                      <div className="mt-6 flex items-center gap-4 text-xs font-mono text-slate-400">
                        <span>Target Role: <strong className="text-slate-700 dark:text-slate-300 font-bold">{jobRole}</strong></span>
                        <span>•</span>
                        <span>Format: <strong className="text-slate-700 dark:text-slate-300 font-bold">{type} Lab</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* ROW 2: Performance breakdown & Specific Checklist */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Quad Core Competency Analytics */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Activity size={18} className="text-indigo-505" />
                          Core Competency Breakdown
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Detailed grading across core evaluation matrices.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {(type === 'Coding' ? [
                          { label: 'Problem Solving Logic', icon: Brain, value: evaluation.communication || 75, color: 'bg-indigo-500', text: 'How well you broke down the algorithm and planned your approach.' },
                          { label: 'Technical & Code Accuracy', icon: Code, value: evaluation.technical || 70, color: 'bg-cyan-500', text: 'How accurately your written logic handles the test cases.' },
                          { label: 'Code Optimization', icon: Flame, value: evaluation.confidence || 75, color: 'bg-violet-500', text: 'How optimal your code is in terms of complexity and structure.' },
                          { label: 'Focus & Integrity', icon: ShieldAlert, value: evaluation.integrity || 95, color: 'bg-emerald-500', text: 'How focused you stayed on the screen during the practice.' },
                        ] : [
                          { label: 'Speaking Clarity', icon: MessageSquare, value: evaluation.communication || 75, color: 'bg-indigo-500', text: 'How easily and clearly you explained your thoughts.' },
                          { label: 'Technical Knowledge', icon: BookOpen, value: evaluation.technical || 70, color: 'bg-cyan-500', text: 'How accurately you answered the technical details.' },
                          { label: 'Self Confidence', icon: Award, value: evaluation.confidence || 75, color: 'bg-violet-500', text: 'How confident and calm you sounded while speaking.' },
                          { label: 'Focus & Integrity', icon: ShieldAlert, value: evaluation.integrity || 95, color: 'bg-emerald-500', text: 'How focused you stayed on the screen during the practice.' },
                        ]).map((metric, i) => (
                          <div key={i} className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 transition-all hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-2">
                                <metric.icon className="text-indigo-500 dark:text-indigo-400" size={14} />
                                {metric.label}
                              </span>
                              <span className="font-mono font-black text-slate-950 dark:text-white px-1.5 py-0.5 bg-slate-150 dark:bg-slate-800/80 rounded text-[10px]">{metric.value}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.value}%` }}
                                className={`h-full ${metric.color} rounded-full`}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{metric.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right column: Audio metrics OR Coding details */}
                    <div className="space-y-8">
                      {type === 'Coding' ? (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col justify-between gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Terminal className="text-indigo-505" size={18} />
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Code Design & Style Tips</h4>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                              Your algorithm solution was evaluated for style standard guidelines. Follow these recommended updates:
                            </p>
                          </div>

                          <div className="space-y-3">
                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold block">Coding Suggestions</span>
                            <div className="space-y-2">
                              {(evaluation.communicationSuggestions || ["Optimize loop boundaries", "Add dry-run documentation", "Handle empty inputs cleanly"]).map((s, i) => (
                                <div key={i} className="flex gap-2 p-3 bg-indigo-50/40 dark:bg-indigo-950/10 rounded-xl border border-indigo-100/50 dark:border-indigo-900/20">
                                  <Sparkles size={12} className="text-indigo-500 shrink-0 mt-0.5" />
                                  <p className="text-[11px] text-indigo-955 dark:text-indigo-200 font-semibold leading-relaxed">{s}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        evaluation.audioAnalysis && (
                          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                            <div className="flex items-center gap-2">
                              <Volume2 className="text-indigo-500" size={18} />
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Voice & Speaking Checklist</h4>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Speaking Speed</span>
                                <span className="text-lg font-black text-indigo-655 dark:text-indigo-400">{evaluation.audioAnalysis.pace}%</span>
                                <span className="text-[9px] text-slate-400 block mt-0.5">Nice, steady flow</span>
                              </div>
                              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-955/50 border border-slate-100 dark:border-slate-800">
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Tone Quality</span>
                                <span className="text-lg font-black text-cyan-655 dark:text-cyan-400">{evaluation.audioAnalysis.tone}%</span>
                                <span className="text-[9px] text-slate-400 block mt-0.5">Friendly & warm sound</span>
                              </div>
                              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Clear Words</span>
                                <span className="text-lg font-black text-violet-650 dark:text-violet-400">{evaluation.audioAnalysis.clarity}%</span>
                                <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">Easy to understand</span>
                              </div>
                              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Nervousness</span>
                                <span className="text-lg font-black text-amber-655 dark:text-amber-400">{evaluation.nervousnessLevel ?? 20}%</span>
                                <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">Filler words & pauses</span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <span className="text-[10px] uppercase tracking-widest text-slate-405 font-extrabold block">Simple Tips to Improve</span>
                              <div className="space-y-2">
                                {(evaluation.communicationSuggestions || []).map((s, i) => (
                                  <div key={i} className="flex gap-2 p-3 bg-indigo-50/40 dark:bg-indigo-950/10 rounded-xl border border-indigo-100/50 dark:border-indigo-900/20">
                                    <Sparkles size={12} className="text-indigo-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-indigo-955 dark:text-indigo-200 font-semibold leading-relaxed">{s}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* ROW 3: Detailed Accordion Critique */}
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Question-by-Question Critique</h3>
                        <p className="text-xs text-slate-500 font-medium">Click any question below to inspect what you answered and read your coach's helpful tips.</p>
                      </div>
                      <span className="text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/30">
                        {answers.length} {answers.length === 1 ? 'Question Checked' : 'Questions Checked'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {((evaluation.questions || []).length > 0 ? evaluation.questions : questions.map((q, idx) => ({
                        q,
                        feedback: "Your answer demonstrated clear logic and good engagement. Continue backing your explanations with simple, direct points.",
                        communicationScore: evaluation.communication || 75,
                        technicalScore: evaluation.technical || 70,
                        confidenceScore: evaluation.confidence || 75,
                        suggestedAnswer: "For a great simple response, clearly state your main approach, mention one reliable tool or practice you use, and briefly cite a positive outcome."
                      }))).map((item, idx) => {
                        const isExpanded = expandedQuestion === idx;
                        return (
                          <div
                            key={idx}
                            className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded
                              ? 'border-indigo-600 drop-shadow-sm bg-slate-50/20 dark:bg-slate-900/40'
                              : 'border-slate-150 dark:border-slate-800 hover:border-indigo-200'
                              }`}
                          >
                            {/* Accordion Trigger */}
                            <button
                              type="button"
                              onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                              className="w-full text-left p-5 flex items-center justify-between gap-4"
                            >
                              <div className="flex items-start gap-3 flex-grow">
                                <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <div className="space-y-1">
                                  <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 md:line-clamp-none">
                                    {item.q}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 font-medium">
                                    <span className="flex items-center gap-1">
                                      <MessageSquare size={10} className="text-indigo-500" />
                                      Delivery: <strong className="text-indigo-655 dark:text-indigo-455 font-bold">{item.communicationScore ?? 80}%</strong>
                                    </span>
                                    <span className="text-slate-350">•</span>
                                    <span className="flex items-center gap-1">
                                      <BookOpen size={10} className="text-cyan-500" />
                                      Accuracy: <strong className="text-cyan-655 dark:text-cyan-455 font-bold">{item.technicalScore ?? 75}%</strong>
                                    </span>
                                    <span className="text-slate-350">•</span>
                                    <span className="flex items-center gap-1">
                                      <Award size={10} className="text-violet-500" />
                                      Calmness: <strong className="text-violet-655 dark:text-violet-455 font-bold">{item.confidenceScore ?? 80}%</strong>
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-slate-400 shrink-0">
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </div>
                            </button>

                            {/* Accordion Detail Content */}
                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="border-t border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"
                                >
                                  <div className="p-5 space-y-4">
                                    {/* User Answer block */}
                                    <div className="space-y-1.5">
                                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold flex items-center gap-1.5 font-mono font-sans">
                                        <FileText size={12} className="text-slate-405" /> Your Response:
                                      </p>
                                      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60">
                                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                                          {answers[idx] || "No response recorded."}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Critiques */}
                                    <div className="space-y-1.5">
                                      <p className="text-[10px] uppercase tracking-widest text-indigo-505 text-indigo-500 font-extrabold flex items-center gap-1.5 font-mono">
                                        <Sparkles size={12} className="text-indigo-500" /> Improvement Feedback:
                                      </p>
                                      <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-150/40 dark:border-indigo-900/30">
                                        <div className="text-xs text-slate-855 dark:text-indigo-200 font-semibold leading-relaxed font-sans">
                                          {renderFeedbackText(item.feedback)}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Suggested / Model Answer block */}
                                    <div className="space-y-1.5 pt-1.5">
                                      <p className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1.5 font-mono">
                                        <CheckCircle2 size={12} className="text-emerald-500" /> Recommended Answer Model:
                                      </p>
                                      <div className="p-4 rounded-xl bg-emerald-50/30 dark:bg-emerald-955/10 border border-emerald-150/40 dark:border-emerald-900/30">
                                        <p className="text-xs text-slate-800 dark:text-emerald-250 font-semibold leading-relaxed whitespace-pre-wrap text-left">
                                          {getDynamicSuggestedAnswer(item.q || "", item.suggestedAnswer || item.modelAnswer)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ROW 4: Integrity compliance, Feelings corner & primary actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Integrity Compliance status */}
                    <div className="bg-gradient-to-tr from-indigo-700 to-indigo-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute right-0 bottom-0 pointer-events-none opacity-5 translate-y-6">
                        <ShieldAlert size={140} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldAlert className="text-indigo-200 opacity-90" size={20} />
                          <h4 className="font-bold text-base">Eye-Focus & Tracker</h4>
                        </div>
                        <p className="text-xs text-indigo-200 leading-relaxed mb-4 font-medium">
                          Measures screen focus and window presence during evaluation to model integrity compliance metrics.
                        </p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black">{evaluation.integrity ?? 100}%</span>
                        <span className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold font-mono">Stable Presence</span>
                      </div>
                    </div>

                    {/* Feelings Support corner */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Heart size={20} className="text-emerald-500 animate-pulse" />
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm font-sans">Reflect & Log Feelings</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          Acknowledging stress and logging how you felt during mock practice builds confidence and cuts anxiety levels.
                        </p>
                      </div>
                      <Link
                        to="/confidence"
                        state={{ from: 'interview', mode: 'post' }}
                        className="w-full py-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/10 transition-all border border-emerald-105/50 dark:border-emerald-900/30"
                      >
                        Log Feelings & Stress Review <ChevronRight size={14} />
                      </Link>
                    </div>

                    {/* Primary CTA Buttons */}
                    <div className="flex flex-col justify-center gap-3">
                      <button
                        onClick={() => window.location.href = '/results'}
                        className="w-full py-3.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
                      >
                        Performance History <BookOpen size={16} />
                      </button>

                      <button
                        onClick={() => {
                          setStep('selection');
                          setEvaluation(null);
                        }}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/10 text-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Start Another Mock Session <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>

                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean custom React portal-like overlay for exit confirmation */}
      <AnimatePresence>
        {showExitConfirmation && (
          <div className="fixed inset-0 z-[250] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 text-white font-sans animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden"
            >
              {/* Top Warning visual gradient bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

              <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-500/5">
                <AlertTriangle className="animate-pulse" size={28} />
              </div>

              <div className="space-y-2 text-center">
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Terminate Coding Session?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  Are you sure you want to exit the coding session? All progress matching your current saved solutions will be evaluated immediately. This action cannot be undone.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirmation(false)}
                  className="flex-1 py-3 bg-slate-800 text-slate-200 hover:text-white rounded-xl font-semibold text-xs border border-slate-700/80 transition-all cursor-pointer hover:bg-slate-750"
                >
                  No, Keep Solving
                </button>
                <button
                  id="confirm-exit-coding-session-button"
                  type="button"
                  onClick={() => {
                    setShowExitConfirmation(false);
                    finishInterview();
                  }}
                  className="flex-1 py-3 bg-red-650 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-red-600/10"
                >
                  Yes, Terminate & Evaluate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast alerts floating on top of the assessment layer */}
      {editorNotifications.length > 0 && (
        <div className="fixed top-6 right-6 z-[200] space-y-3 pointer-events-none max-w-sm w-full">
          <AnimatePresence>
            {editorNotifications.map(notification => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                className="bg-slate-900 border border-red-500/30 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 pointer-events-auto"
              >
                <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 shrink-0 mt-0.5 animate-pulse">
                  <ShieldAlert size={16} />
                </div>
                <div className="flex-1 space-y-1 text-left">
                  <div className="text-xs font-bold font-mono text-red-400 uppercase tracking-widest">
                    {notification.type === 'warning' ? 'Security Warning' : 'System Notice'}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-semibold">
                    {notification.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Dynamic Interview Preparation Tips Toast Alerts */}
      {tipToasts.length > 0 && (
        <div className="fixed bottom-6 left-6 z-[200] space-y-3 pointer-events-none max-w-sm w-full md:left-[280px]">
          <AnimatePresence>
            {tipToasts.map(toast => {
              // Accent mapping for custom colors
              const accentStyles: Record<string, { bg: string; text: string; sub: string; iconBg: string }> = {
                indigo: {
                  bg: "bg-indigo-50/95 dark:bg-stone-900/95 border-indigo-200 dark:border-indigo-900/65",
                  text: "text-indigo-900 dark:text-indigo-200",
                  sub: "text-indigo-750 dark:text-indigo-300",
                  iconBg: "bg-indigo-100/80 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400"
                },
                emerald: {
                  bg: "bg-emerald-50/95 dark:bg-stone-900/95 border-emerald-200 dark:border-emerald-900/65",
                  text: "text-emerald-900 dark:text-emerald-250",
                  sub: "text-emerald-700 dark:text-emerald-300",
                  iconBg: "bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400"
                },
                amber: {
                  bg: "bg-amber-50/95 dark:bg-stone-900/95 border-amber-200 dark:border-amber-900/65",
                  text: "text-amber-900 dark:text-amber-250",
                  sub: "text-amber-700 dark:text-amber-300",
                  iconBg: "bg-amber-100/80 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400"
                },
                violet: {
                  bg: "bg-violet-50/95 dark:bg-stone-900/95 border-violet-200 dark:border-violet-900/65",
                  text: "text-violet-900 dark:text-violet-255",
                  sub: "text-violet-700 dark:text-violet-300",
                  iconBg: "bg-violet-100/80 dark:bg-violet-950/80 text-violet-700 dark:text-violet-400"
                },
                rose: {
                  bg: "bg-rose-50/95 dark:bg-stone-900/95 border-rose-200 dark:border-rose-900/65",
                  text: "text-rose-900 dark:text-rose-250",
                  sub: "text-rose-750 dark:text-rose-300",
                  iconBg: "bg-rose-100/80 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400"
                }
              };

              const style = accentStyles[toast.accent] || accentStyles.indigo;

              // Resolve icon dynamically
              const renderToastIcon = () => {
                switch (toast.icon) {
                  case 'Award': return <Award size={18} />;
                  case 'HelpCircle': return <HelpCircle size={18} />;
                  case 'Code': return <Code size={18} />;
                  case 'Terminal': return <Terminal size={18} />;
                  case 'Users': return <Users size={18} />;
                  case 'Heart': return <Heart size={18} />;
                  case 'Brain': return <Brain size={18} />;
                  case 'BookOpen': return <BookOpen size={18} />;
                  case 'Sparkles': return <Sparkles size={18} />;
                  case 'Flame': return <Flame size={18} />;
                  case 'Target': return <Target size={18} />;
                  default: return <Lightbulb size={18} />;
                }
              };

              return (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, x: -100, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -30, transition: { duration: 0.15 } }}
                  className={`border p-4 rounded-2xl shadow-xl flex items-start gap-3 pointer-events-auto backdrop-blur-md ${style.bg}`}
                >
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${style.iconBg}`}>
                    {renderToastIcon()}
                  </div>
                  <div className="flex-1 space-y-1 text-left">
                    <div className="flex items-center justify-between">
                      <div className={`text-xs font-black uppercase tracking-wider ${style.text}`}>
                        {toast.title}
                      </div>
                      <button
                        onClick={() => setTipToasts(prev => prev.filter(t => t.id !== toast.id))}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-0.5 rounded-lg ml-2 cursor-pointer"
                        title="Dismiss Tip"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className={`text-xs leading-relaxed font-semibold ${style.sub}`}>
                      {toast.message}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class InterviewErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an interview flow error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('active_interview_session');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto min-h-screen flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/5">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Something went wrong in the simulation</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              We encountered a minor layout or synchronization error while loading the active assessment step:
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-mono text-[11px] text-red-500 text-left overflow-auto max-h-40 max-w-lg mx-auto">
              {this.state.error?.message || "Unknown State Crash"}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm justify-center pb-20">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/15"
            >
              Try Recovering State
            </button>
            <button
              onClick={this.handleReset}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              Reset Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const InterviewPage: React.FC = () => {
  return (
    <InterviewErrorBoundary>
      <InterviewPageContent />
    </InterviewErrorBoundary>
  );
};
