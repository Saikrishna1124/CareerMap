import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, Code, BookOpen, ChevronRight, 
  Play, CheckCircle2, XCircle, Loader2,
  Trophy, Lightbulb, Map as MapIcon,
  Route, Video, Target, Save, X
} from 'lucide-react';
import * as d3 from 'd3';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { Tooltip } from '../components/Tooltip';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface MindMapNode {
  name: string;
  children?: MindMapNode[];
}

export const SkillsPage: React.FC = () => {
  const { user, fetchMe } = useAuth();
  const location = useLocation();
  const [subject, setSubject] = useState(location.state?.subject || '');
  const [mode, setMode] = useState<'selection' | 'quiz' | 'roadmap' | 'skillgap'>(location.state?.mode || 'selection');
  const [loading, setLoading] = useState(false);

  // Skill Gap State
  const [targetRole, setTargetRole] = useState(user?.targetRole || '');
  const [skillGaps, setSkillGaps] = useState<any[]>([]);

  useEffect(() => {
    if (user?.targetRole) {
      setTargetRole(user.targetRole);
    }
  }, [user?.targetRole]);

  useEffect(() => {
    if (location.state?.subject && location.state?.mode === 'roadmap') {
      generateRoadmap(location.state.subject);
    }
  }, [location.state]);

  // Quiz State
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  // Roadmap State
  interface Slide { title: string; content: string[]; }
  interface RoadmapSubTask {
    title: string;
    description: string;
    youtubeVideoQuery: string;
    objective: string;
  }
  interface RoadmapModule {
    title: string;
    description: string;
    estimatedHours: string;
    subTasks: RoadmapSubTask[];
    slides: Slide[];
  }
  const [roadmapData, setRoadmapData] = useState<RoadmapModule[]>([]);
  const [activeSlides, setActiveSlides] = useState<Slide[] | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Roadmap Progress Logic (granular sub-task system)
  const isSubTaskCompleted = (mIdx: number, sIdx: number) => {
    const stepId = 20000 + mIdx * 10 + sIdx;
    return user?.roadmapProgress?.includes(stepId);
  };

  const isModuleCompleted = (mIdx: number) => {
    const module = roadmapData[mIdx];
    if (!module || !module.subTasks || module.subTasks.length === 0) return false;
    return module.subTasks.every((_, sIdx) => isSubTaskCompleted(mIdx, sIdx));
  };

  const toggleSubTaskCompletion = async (mIdx: number, sIdx: number) => {
    const stepId = 20000 + mIdx * 10 + sIdx;
    const currentProgress = user?.roadmapProgress || [];
    const newProgress = currentProgress.includes(stepId)
      ? currentProgress.filter(id => id !== stepId)
      : [...currentProgress, stepId];

    try {
      const res = await fetch('/api/auth/roadmap', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ completedSteps: newProgress })
      });
      
      if (res.ok) {
        fetchMe(); // Refresh profile state
      }
    } catch (err) {
      console.error("Failed to sync subtask progress:", err);
    }
  };

  const calculateProgress = () => {
    if (roadmapData.length === 0) return 0;
    const totalSubTasks = roadmapData.reduce((acc, m) => acc + (m.subTasks?.length || 0), 0);
    if (totalSubTasks === 0) return 0;
    
    let completedCount = 0;
    roadmapData.forEach((m, mIdx) => {
      m.subTasks?.forEach((_, sIdx) => {
        if (isSubTaskCompleted(mIdx, sIdx)) {
          completedCount++;
        }
      });
    });
    return Math.round((completedCount / totalSubTasks) * 100);
  };

  const saveQuizResult = async (finalScore: number) => {
    try {
      await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subject,
          score: finalScore,
          total: quiz.length
        })
      });
    } catch (err) {
      console.error("Error saving quiz result:", err);
    }
  };

  const generateQuiz = async () => {
    if (!subject) return;
    setLoading(true);
    setMode('quiz');
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ subject })
      });
      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
        setCurrentQuizIndex(0);
        setScore(0);
        setShowQuizResult(false);
        setUserAnswers([]);
      }
    } catch (err: any) {
      console.error("Error generating quiz:", err);
      alert("Failed to generate quiz: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async (targetSubject?: string) => {
    // Ensure we don't accidentally use a MouseEvent as the subject
    const sub = (typeof targetSubject === 'string' ? targetSubject : null) || subject;
    if (!sub) return;
    setLoading(true);
    setMode('roadmap');
    try {
      const res = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ subject: sub })
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmapData(data);
      }
    } catch (err: any) {
      console.error("Error generating roadmap:", err);
      alert("Failed to generate roadmap: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const generateSkillGap = async () => {
    if (!targetRole) return;
    setLoading(true);
    setMode('skillgap');
    try {
      const currentSkills = (user?.skills || []).map((s: any) => 
        typeof s === 'object' ? s.name : s
      );
      
      const res = await fetch('/api/skillgap/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ targetRole, currentSkills })
      });
      if (res.ok) {
        const data = await res.json();
        setSkillGaps(data);
        fetchMe(); // Refresh to ensure targetRole is saved in context
      }
    } catch (err: any) {
      console.error("Error generating skill gap:", err);
      alert("Failed to generate skill gap: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-warm-text dark:text-white tracking-tight mb-2">Learning Hub</h1>
          <p className="text-warm-muted font-medium">Master new skills with AI-guided assessments and roadmaps.</p>
        </div>
        {mode !== 'selection' && (
          <button 
            onClick={() => setMode('selection')}
            className="px-4 py-2 text-sm font-bold text-brand-purple hover:bg-warm-bg dark:hover:bg-stone-900 rounded-xl transition-all"
          >
            ← Back to Hub
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'selection' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="card-3d p-8">
              <label className="block text-sm font-bold text-warm-hint uppercase tracking-wider mb-4">What do you want to learn?</label>
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. React, System Design, Python, Product Management..."
                  className="flex-1 px-4 py-3 bg-warm-bg dark:bg-stone-950 border border-warm-border dark:border-stone-800 rounded-xl focus:ring-1 focus:ring-brand-purple outline-none text-warm-text dark:text-white"
                />
              </div>
            </div>

            <div className="card-3d p-8">
              <label className="block text-sm font-bold text-warm-hint uppercase tracking-wider mb-4">Target Career Role</label>
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="flex-1 px-4 py-3 bg-warm-bg dark:bg-stone-950 border border-warm-border dark:border-stone-800 rounded-xl focus:ring-1 focus:ring-brand-purple outline-none text-warm-text dark:text-white font-medium"
                />
                <button
                  onClick={generateSkillGap}
                  disabled={!targetRole || loading}
                  className="px-6 py-3 bg-brand-purple text-white rounded-xl font-bold hover:bg-brand-purple/90 disabled:opacity-50 transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-brand-purple/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Target size={18} />}
                  Analyze Readiness
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'quiz', title: 'Start Quiz', desc: 'Test your knowledge with 5-10 AI-generated questions.', icon: Brain, action: () => generateQuiz() },
                { id: 'roadmap', title: 'Generate Roadmap', desc: 'Get a step-by-step learning path with curated resources.', icon: Route, action: () => generateRoadmap() },
              ].map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ y: -5 }}
                  onClick={item.action}
                  disabled={!subject}
                  className="p-8 card-3d text-left group transition-all disabled:opacity-50"
                >
                  <div className={`w-12 h-12 rounded-xl bg-badge-purple dark:bg-brand-purple/20 flex items-center justify-center text-brand-purple mb-6 group-hover:scale-110 transition-transform`}>
                    <item.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-warm-text dark:text-white mb-2">{item.title}</h3>
                  <p className="text-warm-muted text-sm mb-6">{item.desc}</p>
                  <div className="flex items-center text-brand-purple font-bold gap-1 text-sm">
                    Get Started <ChevronRight size={16} />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {mode === 'quiz' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto w-full"
          >
            {loading ? (
              <div className="card-3d p-12 text-center">
                <Loader2 className="mx-auto text-brand-purple animate-spin mb-6" size={48} />
                <h3 className="text-xl font-bold text-warm-text dark:text-white">Generating Quiz...</h3>
              </div>
            ) : showQuizResult ? (
              <div className="card-3d p-12">
                <div className="text-center mb-12">
                  <Trophy className="mx-auto text-brand-amber mb-6" size={64} />
                  <h2 className="text-3xl font-bold text-warm-text dark:text-white mb-2">Quiz Finished!</h2>
                  <p className="text-warm-muted text-lg">You scored {score} out of {quiz.length}</p>
                </div>
                
                <div className="space-y-8 mb-12">
                  {quiz.map((q, i) => {
                    const isCorrect = userAnswers[i] === q.correctAnswer;
                    return (
                      <div key={i} className={`p-6 rounded-2xl border ${isCorrect ? 'border-success/20 bg-success/5' : 'border-error/20 bg-error/5'}`}>
                        <h4 className="font-bold text-warm-text dark:text-white mb-4">{i + 1}. {q.question}</h4>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm">
                            <span className="font-semibold text-warm-hint">Your Answer:</span>{' '}
                            <span className={isCorrect ? 'text-success font-medium' : 'text-error font-medium'}>
                              {q.options[userAnswers[i]]}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-sm">
                              <span className="font-semibold text-warm-hint">Correct Answer:</span>{' '}
                              <span className="text-success font-medium">{q.options[q.correctAnswer]}</span>
                            </p>
                          )}
                        </div>
                        <div className="p-4 bg-white dark:bg-stone-950 rounded-xl border border-warm-border dark:border-stone-800 text-sm text-warm-muted dark:text-stone-400">
                          <strong className="text-warm-text dark:text-white">Explanation:</strong> {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center">
                  <button 
                    onClick={() => setMode('selection')}
                    className="px-8 py-3 bg-brand-purple text-white rounded-xl font-bold hover:bg-brand-purple/90 transition-all shadow-lg shadow-brand-purple/20"
                  >
                    Back to Learning
                  </button>
                </div>
              </div>
            ) : quiz.length > 0 && (
              <div className="card-3d p-8 space-y-8">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-brand-purple uppercase tracking-widest">Question {currentQuizIndex + 1} of {quiz.length}</span>
                  <span className="text-xs font-bold text-warm-muted">Score: {score}</span>
                </div>
                <h3 className="text-2xl font-bold text-warm-text dark:text-white leading-tight">{quiz[currentQuizIndex].question}</h3>
                <div className="grid grid-cols-1 gap-4">
                  {quiz[currentQuizIndex].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedOption(i)}
                      className={`p-6 text-left rounded-2xl border-2 transition-all font-medium ${
                        selectedOption === i 
                          ? 'border-brand-purple bg-badge-purple dark:bg-brand-purple/20 text-brand-purple' 
                          : 'border-warm-border dark:border-stone-800 hover:border-brand-purple/30 text-warm-text dark:text-stone-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    disabled={selectedOption === null}
                    onClick={() => {
                      const newAnswers = [...userAnswers, selectedOption!];
                      setUserAnswers(newAnswers);
                      if (selectedOption === quiz[currentQuizIndex].correctAnswer) {
                        setScore(prev => prev + 1);
                      }
                      if (currentQuizIndex < quiz.length - 1) {
                        setCurrentQuizIndex(prev => prev + 1);
                        setSelectedOption(null);
                      } else {
                        const finalScore = selectedOption === quiz[currentQuizIndex].correctAnswer ? score + 1 : score;
                        setShowQuizResult(true);
                        saveQuizResult(finalScore);
                      }
                    }}
                    className="px-8 py-3 bg-brand-purple text-white rounded-xl font-bold hover:bg-brand-purple/90 disabled:opacity-50 transition-all shadow-lg shadow-brand-purple/20"
                  >
                    Next Question
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {mode === 'roadmap' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-3d p-8 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-warm-border dark:border-stone-800">
              <div>
                <h3 className="text-2xl font-bold text-warm-text dark:text-white flex items-center gap-2">
                  <Route size={24} className="text-brand-purple" /> {subject} Path
                </h3>
                <p className="text-warm-muted text-sm mt-1 font-medium">Follow this step-by-step masterclass to mastery.</p>
              </div>
              <div className="w-full md:w-64 space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-warm-hint">
                  <span>Progress</span>
                  <span className="text-brand-purple">{calculateProgress()}% Complete</span>
                </div>
                <div className="h-2 bg-warm-bg dark:bg-stone-900 rounded-full overflow-hidden border border-warm-border/50 dark:border-stone-800">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateProgress()}%` }}
                    className="h-full bg-brand-purple shadow-[0_0_10px_rgba(79,55,139,0.4)]"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="h-[500px] flex flex-col items-center justify-center">
                <div className="relative">
                  <Loader2 className="text-brand-purple animate-spin" size={64} />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-brand-purple rounded-full blur-xl"
                  />
                </div>
                <p className="text-warm-muted mt-8 font-black uppercase tracking-widest text-xs animate-pulse">Growing Specialized Skill Tree...</p>
              </div>
            ) : (
              <div className="relative px-4 py-8 select-none">
                {/* Central Trunk Header representing Root Network */}
                <div className="flex flex-col items-center mb-12">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-stone-50 dark:bg-stone-900 border border-brand-purple/20 px-8 py-5 rounded-3xl shadow-xl text-center relative z-20 max-w-md w-full"
                  >
                    <span className="text-[10px] font-black tracking-widest uppercase text-brand-purple bg-brand-purple/10 px-3 py-1 rounded-full animate-pulse">Skill Tree Architecture</span>
                    <h3 className="text-2xl font-black text-warm-text dark:text-white tracking-tight mt-2.5">{subject} Roadmap</h3>
                    <p className="text-xs text-warm-muted mt-1 font-medium">4 skill branches • 12 active lesson nodes</p>
                  </motion.div>
                  {/* SVG connecting Trunk stem to first branch */}
                  <div className="w-1 h-8 bg-brand-purple/20" />
                </div>

                <div className="space-y-12">
                  {roadmapData.map((module, i) => {
                    return (
                      <div 
                        key={i} 
                        className="border border-warm-border dark:border-stone-800/80 p-6 rounded-3xl bg-white/40 dark:bg-stone-900/40 backdrop-blur-sm relative shadow-sm"
                      >
                        {/* Branch Node Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-warm-border/60 dark:border-stone-800/50">
                          <div>
                            <span className="text-[10px] font-black uppercase text-brand-purple bg-brand-purple/15 px-2.5 py-1 rounded-lg tracking-widest">
                              Branch Node {i + 1}
                            </span>
                            <h4 className="text-xl font-black text-warm-text dark:text-white mt-1.5 leading-snug">
                              {module.title}
                            </h4>
                            <p className="text-sm text-warm-muted leading-relaxed font-medium mt-1">
                              {module.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className="text-xs font-bold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-200/50 dark:border-stone-800/80">
                              ⏱️ {module.estimatedHours || "3 Hours"}
                            </span>
                            <button 
                              onClick={() => { setActiveSlides(module.slides); setCurrentSlide(0); }}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition duration-300 bg-badge-purple text-brand-purple dark:text-stone-300 hover:bg-badge-purple/80"
                            >
                              <BookOpen size={12} /> Master Slides
                            </button>
                          </div>
                        </div>

                        {/* Connection Tree Network Layout */}
                        <div className="relative pl-6 md:pl-10 space-y-5">
                          {/* Visual dashed connector stem line on left */}
                          <div className="absolute top-0 bottom-4 left-2 w-0.5 border-l-2 border-dashed border-brand-purple/30 dark:border-brand-purple/20 pointer-events-none" />

                          {module.subTasks?.map((subTask, sIdx) => {
                            const subCompleted = isSubTaskCompleted(i, sIdx);
                            return (
                              <div key={sIdx} className="relative flex items-start group">
                                {/* Horizontal connection bridge to Leaf card */}
                                <div className="absolute -left-4 top-5 w-4 h-0.5 border-t-2 border-dashed border-brand-purple/30 dark:border-brand-purple/20 pointer-events-none" />
                                
                                {/* Leaf Node Button / Marker */}
                                <Tooltip 
                                  content={subCompleted ? "Mark Incomplete" : "Mark Complete"} 
                                  position="top"
                                  className="absolute -left-6.5 top-2.5 z-10"
                                >
                                  <button 
                                    onClick={() => toggleSubTaskCompletion(i, sIdx)}
                                    className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                                      subCompleted 
                                        ? 'bg-success border-success text-white shadow-md shadow-success/20 animate-bounce' 
                                        : 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 text-stone-400 hover:border-brand-purple'
                                    }`}
                                  >
                                    {subCompleted ? <CheckCircle2 size={10} className="stroke-[3px]" /> : <span className="text-[9px] font-black">{sIdx + 1}</span>}
                                  </button>
                                </Tooltip>

                                {/* Leaf SubTask Card */}
                                <div className={`w-full p-4 rounded-2xl border transition-all duration-300 shadow-sm ${
                                  subCompleted 
                                    ? 'border-success/20 bg-success/[0.01]' 
                                    : 'border-warm-border dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-950/20 hover:border-brand-purple/20 hover:-translate-y-0.5'
                                }`}>
                                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black tracking-widest uppercase text-brand-purple bg-brand-purple/15 px-2 py-0.5 rounded">
                                          Leaf {i + 1}.{sIdx + 1}
                                        </span>
                                        {subCompleted && (
                                          <span className="text-[9px] font-bold text-success uppercase tracking-widest">
                                            • Perfected
                                          </span>
                                        )}
                                      </div>
                                      <h5 className="font-extrabold text-stone-800 dark:text-stone-200 leading-tight">
                                        {subTask.title}
                                      </h5>
                                      <p className="text-xs text-warm-muted leading-relaxed font-medium">
                                        {subTask.description}
                                      </p>
                                      <div className="text-[10px] text-brand-purple bg-brand-purple/5 px-2.5 py-1 rounded-lg border border-brand-purple/10 inline-block font-mono font-bold">
                                        🎯 Milestone Target: {subTask.objective}
                                      </div>
                                    </div>

                                    {/* Targeted, Specific YouTube Tutorial link */}
                                    <div className="shrink-0">
                                      <a 
                                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(subTask.youtubeVideoQuery)}`}
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide bg-red-600 hover:bg-red-700 text-white transition duration-300 shadow-md shadow-red-600/15"
                                      >
                                        <Video size={12} /> Watch Tutorial
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {mode === 'skillgap' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-3d p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-warm-text dark:text-white flex items-center gap-2">
                <Target size={24} className="text-brand-purple" /> Skill Gap: {targetRole}
              </h3>
            </div>
            {loading ? (
              <div className="h-[400px] flex flex-col items-center justify-center">
                <Loader2 className="text-brand-purple animate-spin mb-4" size={48} />
                <p className="text-warm-muted">Analyzing your skills...</p>
              </div>
            ) : skillGaps.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="h-[400px] w-full min-w-0 min-h-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillGaps}>
                      <PolarGrid stroke="#DDD5C8" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: '#78716C', fontSize: 12, fontWeight: 500 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                      <Radar name="Current" dataKey="current" stroke="#4F378B" fill="#4F378B" fillOpacity={0.5} />
                      <Radar name="Required" dataKey="required" stroke="#16A34A" fill="#16A34A" fillOpacity={0.3} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-6">
                  <h4 className="text-lg font-bold text-warm-text dark:text-white mb-4 border-b border-warm-border pb-2">Improvement Areas</h4>
                  {skillGaps.map((gap, i) => {
                    const difference = gap.required - gap.current;
                    return (
                      <div key={i} className="space-y-2 p-3 rounded-xl bg-warm-bg/30 dark:bg-stone-900 shadow-sm border border-warm-border/20">
                        <div className="flex justify-between text-sm">
                          <span className="font-bold text-warm-text dark:text-stone-300">{gap.skill}</span>
                          <span className="font-black text-brand-purple bg-badge-purple/50 px-2 py-0.5 rounded text-[10px]">Gap: {difference > 0 ? difference : 0}</span>
                        </div>
                        <div className="h-2.5 bg-warm-border dark:bg-stone-800 rounded-full overflow-hidden flex shadow-inner">
                          <div 
                            className="bg-brand-purple h-full shadow-[0_0_10px_rgba(79,55,139,0.5)]" 
                            style={{ width: `${(gap.current / 10) * 100}%` }}
                          />
                          {difference > 0 && (
                            <div 
                              className="bg-success h-full opacity-40 animate-pulse" 
                              style={{ width: `${(difference / 10) * 100}%` }}
                            />
                          )}
                        </div>
                        {difference > 0 && (
                          <button 
                            onClick={() => {
                              setSubject(gap.skill);
                              generateRoadmap(gap.skill);
                            }}
                            className="text-xs text-brand-purple hover:text-brand-purple/80 font-bold flex items-center gap-1 mt-1 transition-colors"
                          >
                            Generate Roadmap <ChevronRight size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center text-warm-muted py-12">No data available.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slides Modal */}
      <AnimatePresence>
        {activeSlides && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-warm-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setActiveSlides(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="card-3d p-8 max-w-4xl w-full aspect-[16/9] flex flex-col relative"
            >
              <Tooltip content="Close Presentation" position="left" className="absolute top-6 right-6 z-10">
                <button onClick={() => setActiveSlides(null)} className="text-warm-muted hover:text-warm-text dark:hover:text-white transition-colors">
                  <X size={28} />
                </button>
              </Tooltip>
              
              <div className="flex-1 flex flex-col justify-center items-center text-center px-12 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="w-full flex flex-col items-center justify-center"
                  >
                    <h2 className="text-3xl md:text-5xl font-black text-warm-text dark:text-white mb-12 leading-tight tracking-tight">
                      {activeSlides[currentSlide].title}
                    </h2>
                    <ul className="space-y-6 text-left inline-block max-w-2xl">
                      {activeSlides[currentSlide].content.map((point, idx) => (
                        <li key={idx} className="text-xl md:text-2xl text-warm-muted dark:text-stone-300 flex items-start gap-4">
                          <span className="text-brand-purple mt-1.5 text-2xl">•</span> {point}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-warm-border dark:border-stone-800">
                <button 
                  onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                  disabled={currentSlide === 0}
                  className="px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-30 bg-warm-bg dark:bg-stone-900 text-warm-text dark:text-stone-300 hover:bg-warm-border dark:hover:bg-stone-800"
                >
                  Previous
                </button>
                <span className="text-warm-hint font-bold tracking-widest uppercase text-xs">
                  Slide {currentSlide + 1} of {activeSlides.length}
                </span>
                <button 
                  onClick={() => setCurrentSlide(prev => Math.min(activeSlides.length - 1, prev + 1))}
                  disabled={currentSlide === activeSlides.length - 1}
                  className="px-6 py-3 rounded-xl font-black transition-all disabled:opacity-30 bg-brand-purple text-white hover:bg-brand-purple/90 shadow-lg shadow-brand-purple/20"
                >
                  Next
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
