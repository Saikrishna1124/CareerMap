import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import Markdown from 'react-markdown';
import { 
  Heart, Sparkles, Wind, Smile, 
  Trophy, Zap, BrainCircuit, MessageCircle, 
  ArrowRight, ShieldCheck, Stars, RefreshCw,
  Quote, Lightbulb, CheckCircle2, Target, Search, Map
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Tooltip } from '../components/Tooltip';

interface MotivationalCard {
  title: string;
  message: string;
  icon: any;
}

export const ConfidenceSupportPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<'selection' | 'pre' | 'post' | 'roadmap'>('selection');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Sync with user roadmap progress from backend
  useEffect(() => {
    if (user?.roadmapProgress) {
      setCompletedSteps(user.roadmapProgress);
    }
  }, [user?.roadmapProgress]);

  useEffect(() => {
    if (location.state?.mode) {
      setMode(location.state.mode);
    }
  }, [location.state]);

  const preInterviewSteps = [
    { id: 1, title: "Company Deep Dive", desc: "Research recent news, values, and their tech stack. Understanding their 'why' is as important as your 'how'.", icon: Search, color: "blue" },
    { id: 2, title: "Setup & Wardrobe", desc: "Test your camera/mic or iron your clothes. Removing technical friction builds immediate mental calm.", icon: ShieldCheck, color: "emerald" },
    { id: 3, title: "Cheat Sheet Prep", desc: "Have 3-4 key projects and metrics ready. Not to read, but to ground your memory.", icon: Quote, color: "amber" },
    { id: 4, title: "Interviewer Questions", desc: "Prepare high-level questions about team culture and growth. It shows you're interviewing them too.", icon: MessageCircle, color: "indigo" },
    { id: 5, title: "Confidence Zone", desc: "10 minutes of box breathing or a power pose. Your mindset is your strongest technical skill.", icon: Zap, color: "brand-purple" },
  ];

  const postInterviewSteps = [
    { id: 1, title: "Immediate Reflection", desc: "Write down what went well and what felt tricky while it's fresh. Honor your effort first.", icon: BrainCircuit, color: "emerald" },
    { id: 2, title: "Thank You Note", desc: "Send a personalized note within 24 hours. Mention a specific part of the conversation you enjoyed.", icon: Stars, color: "indigo" },
    { id: 3, title: "Skill Gap Audit", desc: "Identify one technical area to brush up on, regardless of the outcome. Continuous growth is win.", icon: Target, color: "rose" },
    { id: 4, title: "Patience Protocol", desc: "Set a 'Check-In' date in your calendar. Now, step away and celebrate the fact that you showed up.", icon: Trophy, color: "amber" },
    { id: 5, title: "Momentum Maintenance", desc: "Redirect your energy to the next lead or project. Staying in motion is the best cure for post-interview anxiety.", icon: RefreshCw, color: "brand-purple" },
  ];

  const toggleStep = async (id: number) => {
    const newSteps = completedSteps.includes(id) 
      ? completedSteps.filter(s => s !== id) 
      : [...completedSteps, id];
    
    setCompletedSteps(newSteps);

    // Save to backend
    try {
      const res = await fetch('/api/auth/roadmap', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ completedSteps: newSteps })
      });
      
      if (res.ok) {
        // Update local auth context too
        if (setUser && user) {
          setUser({ ...user, roadmapProgress: newSteps });
        }
      }
    } catch (err) {
      console.error("Failed to sync roadmap progress:", err);
    }
  };
  const [confidence, setConfidence] = useState(50);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingText, setBreathingText] = useState('Inhale');
  const [currentTip, setCurrentTip] = useState<MotivationalCard | null>(null);
  const [mentorChat, setMentorChat] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: `Hi ${user?.name || 'there'}! I'm your AI Confidence Mentor. How are you feeling about your upcoming or recent interview?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [reflections, setReflections] = useState({ better: '', refine: '' });
  const [reflectionAnalysis, setReflectionAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const chatRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mentorChat, isTyping]);

  const confidenceTips: MotivationalCard[] = [
    { title: "You are Prepared", message: "Confidence comes from the work you've already put in. Trust your preparation.", icon: Target },
    { title: "Focus on Value", message: "Remember, they want you to succeed. They are looking for reasons to hire you, not reason to reject you.", icon: ShieldCheck },
    { title: "Control the Pace", message: "It's okay to take a moment to think before answering. Silence is a sign of thoughtfulness, not uncertainty.", icon: Zap },
    { title: "Growth Mindset", message: "Every interview is a learning experience. Regardless of the outcome, you are becoming a stronger candidate.", icon: BrainCircuit },
  ];

  useEffect(() => {
    setCurrentTip(confidenceTips[Math.floor(Math.random() * confidenceTips.length)]);
  }, []);

  // Breathing Logic
  useEffect(() => {
    let interval: any;
    if (isBreathing) {
      let step = 0;
      interval = setInterval(() => {
        step = (step + 1) % 4;
        if (step === 0) setBreathingText('Inhale');
        if (step === 1) setBreathingText('Hold');
        if (step === 2) setBreathingText('Exhale');
        if (step === 3) setBreathingText('Hold');
      }, 4000); // 4-4-4-4 breathing
    }
    return () => clearInterval(interval);
  }, [isBreathing]);

  const quickSuggestions = [
    { label: "Pep Talk 🚀", value: "Give me a 1-minute pep talk! I'm about to enter an interview." },
    { label: "Handle Nerves 🧘", value: "How do I handle pre-interview nerves and anxiety right now?" },
    { label: "Body Language 👔", value: "What are some quick tips for good body language during the interview?" },
    { label: "Opening Intro ✨", value: "Help me refine my 30-second 'Tell me about yourself' opening pitch." },
    { label: "Impostor Syndrome 🧠", value: "I feel like I'm not good enough for this role. Help me overcome impostor syndrome." },
    { label: "Technical Nerves 💻", value: "I'm worried I'll freeze up on a technical question. How do I stay calm?" }
  ];

  const handleSendMessage = async (directMsg?: string) => {
    const textToSend = directMsg || input;
    if (!textToSend.trim()) return;
    
    const userMsg = { role: 'user' as const, text: textToSend };
    setMentorChat(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/confidence/mentor', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: textToSend })
      });
      if (!res.ok) throw new Error('Mentor fetch failed');
      const data = await res.json();
      setMentorChat(prev => [...prev, { role: 'model', text: data.text || "I'm right here with you. **You've got this!** 🚀" }]);
    } catch (err: any) {
      console.error(err);
      const isCapacityError = err.message?.includes("quota") || err.status === 429 || err.status === 503 || err.message?.includes("capacity") || err.message?.includes("high demand") || err.message?.includes("UNAVAILABLE");
      if (isCapacityError) {
        setMentorChat(prev => [...prev, { 
          role: 'model', 
          text: "I'm experiencing high traffic right now, but I'm still here for you! ✨ **Stay focused and breathe.** You have the skills and the drive to succeed. Take a moment to review your preparation – you've done the work! 🚀" 
        }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleAnalyzeReflection = async () => {
    if (!reflections.better.trim() && !reflections.refine.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/confidence/analyze-reflection', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          better: reflections.better, 
          refine: reflections.refine 
        })
      });
      if (!res.ok) throw new Error('Reflection analysis failed');
      const data = await res.json();
      setReflectionAnalysis(data.text || "Your mindset is **strong**. Keep moving forward! 🚀");
    } catch (err: any) {
      console.error(err);
      const isCapacityError = err.message?.includes("quota") || err.status === 429 || err.status === 503 || err.message?.includes("capacity") || err.message?.includes("high demand") || err.message?.includes("UNAVAILABLE");
      if (isCapacityError) {
        setReflectionAnalysis("✨ **YOU ARE ON THE RIGHT PATH!**\n\nThe coaching engine is currently busy, but don't let that stop your momentum. Your reflection shows great self-awareness. Trust your process and keep preparing for the next success! 🚀");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 min-h-screen pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-warm-text dark:text-white flex items-center gap-3">
             <Heart className="text-brand-purple" fill="currentColor" fillOpacity={0.2} /> Confidence Support
          </h1>
          <p className="text-warm-secondary mt-1">Strengthen your mindset before and after your career milestones.</p>
        </div>
        {mode !== 'selection' && (
          <button 
            onClick={() => setMode('selection')}
            className="text-sm font-bold text-brand-purple hover:underline flex items-center gap-1"
          >
            <RefreshCw size={14} /> Back to Selection
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Confidence Boost Intro Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-brand-purple/5 border border-brand-purple/10 p-6 rounded-[32px] flex items-center gap-6 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="w-14 h-14 rounded-2xl bg-brand-purple flex items-center justify-center text-white shadow-xl shadow-brand-purple/20 flex-shrink-0 relative z-10 transition-transform group-hover:scale-110">
                {currentTip ? <currentTip.icon size={28} /> : <Stars size={28} />}
              </div>
              <div className="flex-1 relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-purple mb-1">Daily Confidence Boost</h4>
                <p className="text-lg font-bold text-warm-text dark:text-stone-100 italic">"{currentTip?.message}"</p>
              </div>
              <button 
                onClick={() => setCurrentTip(confidenceTips[Math.floor(Math.random() * confidenceTips.length)])}
                className="p-3 text-brand-purple/40 hover:text-brand-purple transition-all hover:rotate-180 relative z-10"
              >
                <RefreshCw size={24} />
              </button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setMode('pre')}
              className="group p-10 card-3d bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800 text-left relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-purple/10 rounded-full blur-3xl group-hover:bg-brand-purple/20 transition-all" />
              <div className="w-16 h-16 rounded-2xl bg-badge-purple dark:bg-brand-purple/20 flex items-center justify-center text-brand-purple mb-8">
                <Zap size={32} />
              </div>
              <h2 className="text-3xl font-bold text-warm-text dark:text-white mb-4">Pre-Interview Prep</h2>
              <p className="text-warm-secondary mb-8 leading-relaxed">
                Boost your confidence, calm your nerves, and get into the right headspace. Features breathing exercises and motivational coaching.
              </p>
              <div className="flex items-center gap-2 text-brand-purple font-black uppercase tracking-widest text-xs">
                Enter Zone <ArrowRight size={16} />
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setMode('post')}
              className="group p-10 card-3d bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800 text-left relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 mb-8">
                <Trophy size={32} />
              </div>
              <h2 className="text-3xl font-bold text-warm-text dark:text-white mb-4">Post-Interview Reflection</h2>
              <p className="text-warm-secondary mb-8 leading-relaxed">
                Analyze your experience, reframe mistakes as growth, and stay motivated for the next opportunity regardless of the results.
              </p>
              <div className="flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-xs">
                Analyze Growth <ArrowRight size={16} />
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setMode('roadmap')}
              className="group p-10 card-3d bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800 text-left relative overflow-hidden md:col-span-2"
            >
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl group-hover:bg-brand-yellow/20 transition-all" />
              <div className="flex flex-col md:flex-row md:items-center gap-8">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                  <Map size={32} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-warm-text dark:text-white mb-2">Interview Success Roadmap</h2>
                  <p className="text-warm-secondary leading-relaxed max-w-2xl">
                    A complete visualization of your journey. Interactive steps from the week before to the follow-up. Check them off as you conquer each milestone.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-amber-600 font-black uppercase tracking-widest text-xs min-w-fit">
                  View Path <ArrowRight size={16} />
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      )}

        {mode === 'roadmap' && (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-4xl font-black text-warm-text dark:text-white tracking-tighter">Your Success Journey</h2>
              <p className="text-warm-secondary">Confidence is built on small, consistent wins. Check off each step as you prepare for greatness.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
              {/* Pre-Interview Phase */}
              <div className="space-y-8 relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-4 py-1.5 bg-brand-purple/10 border border-brand-purple/20 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-purple">
                    Phase 01: Pre-Interview Prep
                  </div>
                  <div className="flex-1 h-px bg-brand-purple/10" />
                </div>
                
                <div className="space-y-6">
                  {preInterviewSteps.map((step, idx) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => toggleStep(step.id * 10)} 
                      className={`group p-6 card-3d border transition-all cursor-pointer relative ${
                        completedSteps.includes(step.id * 10) 
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 opacity-70' 
                        : 'bg-white dark:bg-stone-900 border-warm-border dark:border-stone-800 hover:border-brand-purple shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="flex gap-4 items-start">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          completedSteps.includes(step.id * 10) ? 'bg-emerald-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 group-hover:text-brand-purple'
                        }`}>
                          {completedSteps.includes(step.id * 10) ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
                        </div>
                        <div>
                          <h4 className={`font-bold text-sm transition-all ${completedSteps.includes(step.id * 10) ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-warm-text dark:text-white group-hover:text-brand-purple'}`}>
                            {step.title}
                          </h4>
                          <p className="text-xs text-warm-secondary leading-relaxed mt-1">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Post-Interview Phase */}
              <div className="space-y-8 relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600">
                    Phase 02: Post-Interview Growth
                  </div>
                  <div className="flex-1 h-px bg-emerald-500/10" />
                </div>

                <div className="space-y-6">
                  {postInterviewSteps.map((step, idx) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (idx + 5) * 0.1 }}
                      onClick={() => toggleStep(step.id * 100)} 
                      className={`group p-6 card-3d border transition-all cursor-pointer relative ${
                        completedSteps.includes(step.id * 100) 
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 opacity-70' 
                        : 'bg-white dark:bg-stone-900 border-warm-border dark:border-stone-800 hover:border-emerald-500 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="flex gap-4 items-start">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          completedSteps.includes(step.id * 100) ? 'bg-emerald-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 group-hover:text-emerald-500'
                        }`}>
                          {completedSteps.includes(step.id * 100) ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
                        </div>
                        <div>
                          <h4 className={`font-bold text-sm transition-all ${completedSteps.includes(step.id * 100) ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-warm-text dark:text-white group-hover:text-emerald-500'}`}>
                            {step.title}
                          </h4>
                          <p className="text-xs text-warm-secondary leading-relaxed mt-1">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* The Career Loop (Bottom Component) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative pt-12"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-12 w-px bg-gradient-to-b from-transparent to-brand-purple/20" />
              <div className="relative flex justify-center">
                <div className="p-8 bg-gradient-to-br from-amber-500/10 via-white to-brand-purple/10 dark:via-stone-900 border border-amber-500/20 rounded-[40px] text-center space-y-6 max-w-2xl bg-white dark:bg-stone-900 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-brand-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-20 h-20 bg-amber-500 text-white rounded-[24px] flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30 rotate-3 group-hover:rotate-6 transition-transform">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                    >
                      <Trophy size={40} />
                    </motion.div>
                  </div>
                  <div className="space-y-2 relative z-10">
                    <h3 className="text-2xl font-black text-warm-text dark:text-white tracking-tighter uppercase">The Career Loop</h3>
                    <p className="text-base text-warm-secondary leading-relaxed">
                      Whether hire or no-hire, every interview strengthens your professional armor. You've completed the cycle—congratulations on showing up for your future!
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 relative z-10">
                     {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 bg-brand-purple/20 rounded-full" />)}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {mode === 'pre' && (
          <motion.div
            key="pre"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Breathing Exercise */}
            <div className="lg:col-span-1 space-y-6">
              <div className="p-8 card-3d bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800 text-center relative overflow-hidden h-[400px] flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold text-warm-text dark:text-white mb-8 flex items-center gap-2 justify-center">
                  <Wind size={20} className="text-brand-purple" /> Calming Space
                </h3>
                
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <motion.div
                    animate={isBreathing ? {
                      scale: breathingText === 'Inhale' ? 1.5 : (breathingText === 'Exhale' ? 1 : (breathingText === 'Hold' ? 1.5 : 1)),
                    } : { scale: 1 }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className="w-32 h-32 bg-brand-purple/10 rounded-full border border-brand-purple/30 flex items-center justify-center"
                  >
                    <span className="text-sm font-black text-brand-purple uppercase tracking-widest">
                      {isBreathing ? breathingText : 'Ready?'}
                    </span>
                  </motion.div>
                  {isBreathing && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-2 border-dashed border-brand-purple/20 rounded-full"
                    />
                  )}
                </div>

                <button
                  onClick={() => setIsBreathing(!isBreathing)}
                  className={`mt-12 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                    isBreathing ? 'bg-warm-bg text-warm-secondary hover:bg-stone-200' : 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20'
                  }`}
                >
                  {isBreathing ? 'Pause Practice' : 'Start Box Breathing'}
                </button>
              </div>

              {/* Confidence Meter */}
              <div className="p-8 card-3d bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800 text-center">
                <h3 className="text-sm font-bold text-warm-secondary mb-6 uppercase tracking-widest">Initial Confidence Level</h3>
                <div className="relative pt-1 px-2">
                  {/* Custom Animated Track */}
                  <div className="absolute top-1/2 left-2 right-2 h-2 -translate-y-1/2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden pointer-events-none">
                    <motion.div 
                      initial={{ width: 0, backgroundColor: "#8b5cf6" }}
                      animate={{ 
                        width: `${confidence}%`,
                        backgroundColor: confidence < 33 ? "#ef4444" : (confidence < 66 ? "#f59e0b" : "#10b981")
                      }}
                      transition={{ 
                        width: { type: "spring", stiffness: 100, damping: 20 },
                        backgroundColor: { duration: 0.5 }
                      }}
                      className="absolute inset-y-0 left-0 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                    />
                  </div>
                  
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={confidence}
                    onChange={(e) => setConfidence(parseInt(e.target.value))}
                    className="relative w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer accent-brand-purple z-10 opacity-0 md:opacity-100"
                  />
                  
                  {/* Minimalistic Value Indicators */}
                  <div className="flex justify-between mt-6 items-center">
                    <motion.div
                      animate={{ 
                        scale: confidence < 30 ? 1.2 : 1,
                        opacity: confidence < 30 ? 1 : 0.4
                      }}
                    >
                      <Smile size={20} className="text-stone-400" />
                    </motion.div>
                    
                    <div className="flex flex-col items-center">
                      <motion.span 
                        key={confidence}
                        initial={{ y: 5, opacity: 0 }}
                        animate={{ 
                          y: 0, 
                          opacity: 1,
                          color: confidence < 33 ? "#ef4444" : (confidence < 66 ? "#f59e0b" : "#10b981")
                        }}
                        className="text-3xl font-black"
                      >
                        {confidence}%
                      </motion.span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-warm-hint">Current Vibe</span>
                    </div>

                    <motion.div
                      animate={{ 
                        scale: confidence > 70 ? 1.4 : 1,
                        rotate: confidence > 90 ? [0, 15, -15, 0] : 0,
                        color: confidence < 33 ? "#ef4444" : (confidence < 66 ? "#f59e0b" : "#10b981")
                      }}
                      transition={{ rotate: { repeat: Infinity, duration: 2 } }}
                    >
                      <Zap size={22} className="transition-colors" fill="currentColor" fillOpacity={confidence > 70 ? 1 : 0.2} />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Coaching Chat */}
            <div className="lg:col-span-2 space-y-6">
              <div className="h-[600px] card-3d bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-warm-border dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-800/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                      <BrainCircuit size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-warm-text dark:text-white">AI Mentor</h3>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Active Supporter</p>
                    </div>
                  </div>
                  <Stars className="text-brand-yellow" size={20} />
                </div>

                <div ref={chatRef} className="flex-1 overflow-y-auto p-8 space-y-6">
                  {mentorChat.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-4 rounded-2xl ${
                        msg.role === 'user' 
                          ? 'bg-brand-purple text-white shadow-xl shadow-brand-purple/20 rounded-tr-none' 
                          : 'bg-white dark:bg-stone-800 text-warm-text dark:text-stone-100 rounded-tl-none border border-warm-border dark:border-stone-700 shadow-sm'
                      }`}>
                        <div className={`text-sm leading-normal text-left whitespace-normal break-words ${
                          msg.role === 'user' 
                            ? 'text-white font-medium' 
                            : 'text-warm-text dark:text-stone-100'
                        }`}>
                          <Markdown components={{
                            strong: ({node, ...props}) => <span className="font-extrabold text-inherit underline decoration-current/30" {...props} />,
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-none p-0 m-0 space-y-2 my-2" {...props} />,
                            li: ({node, ...props}) => <li className="flex items-start gap-2 before:content-['✨'] before:text-sm" {...props} />
                          }}>
                            {msg.text}
                          </Markdown>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-warm-bg dark:bg-stone-800/50 p-4 rounded-3xl flex gap-1">
                        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-stone-400 rounded-full" />
                        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-stone-400 rounded-full" />
                        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-stone-400 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-white dark:bg-stone-900 border-t border-warm-border dark:border-stone-800">
                  <div className="mb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-purple mb-2 flex items-center gap-2">
                       <Lightbulb size={12} /> Suggested Topics
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {quickSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(suggestion.value)}
                          disabled={isTyping}
                          className="px-3 py-1.5 bg-brand-purple/5 hover:bg-brand-purple/10 border border-brand-purple/10 rounded-full text-[11px] font-bold text-brand-purple transition-all active:scale-95 disabled:opacity-50"
                        >
                          {suggestion.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 bg-warm-bg dark:bg-stone-800 px-4 py-2 rounded-2xl border border-warm-border dark:border-stone-800 focus-within:ring-2 ring-brand-purple/20 transition-all">
                    <input 
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Share your thoughts or worries..."
                      className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-warm-text dark:text-white"
                    />
                    <Tooltip content="Send Message" position="top">
                      <button 
                        onClick={() => handleSendMessage()}
                        disabled={!input.trim() || isTyping}
                        className="p-2 text-brand-purple hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                      >
                        <MessageCircle size={24} />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'post' && (
          <motion.div
            key="post"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="md:col-span-2 space-y-8">
                  {/* Reflection Card */}
                  <div className="p-10 card-3d bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-warm-text dark:text-white flex items-center gap-3">
                        <Quote className="text-brand-purple" /> Growth Reflection
                      </h3>
                      {(reflections.better || reflections.refine || reflectionAnalysis) && (
                        <button 
                          onClick={() => {
                            setReflections({ better: '', refine: '' });
                            setReflectionAnalysis(null);
                          }}
                          className="text-xs font-bold text-warm-hint hover:text-rose-500 transition-colors flex items-center gap-1"
                        >
                          <RefreshCw size={12} /> Clear all
                        </button>
                      )}
                    </div>
                    <p className="text-warm-secondary mb-8">Take a moment to reframe your performance through the lens of experience. Mistake? No, a data point for your next win.</p>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-warm-hint">What went better than expected?</label>
                        <textarea 
                          value={reflections.better}
                          onChange={(e) => setReflections(prev => ({ ...prev, better: e.target.value }))}
                          placeholder="e.g. My opening introduction was very smooth..."
                          className="w-full bg-warm-bg dark:bg-stone-800/30 border border-warm-border dark:border-stone-800 rounded-2xl p-4 text-sm text-warm-text dark:text-white focus:ring-2 ring-brand-purple/20 outline-none"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-warm-hint">One thing to refine for next time?</label>
                        <textarea 
                          value={reflections.refine}
                          onChange={(e) => setReflections(prev => ({ ...prev, refine: e.target.value }))}
                          placeholder="e.g. I need to explain my technical logic more clearly..."
                          className="w-full bg-warm-bg dark:bg-stone-800/30 border border-warm-border dark:border-stone-800 rounded-2xl p-4 text-sm text-warm-text dark:text-white focus:ring-2 ring-brand-purple/20 outline-none"
                          rows={3}
                        />
                      </div>

                      <AnimatePresence>
                        {reflectionAnalysis && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-6 bg-brand-purple/5 border border-brand-purple/20 rounded-2xl"
                          >
                            <h4 className="flex items-center gap-2 text-brand-purple font-bold mb-3">
                              <Sparkles size={16} /> AI Growth Insights
                            </h4>
                            <div className="text-sm text-warm-text dark:text-stone-300 space-y-2 prose prose-sm dark:prose-invert max-w-none">
                              <Markdown components={{
                                strong: ({node, ...props}) => <span className="font-extrabold text-brand-purple dark:text-brand-purple-light" {...props} />,
                                li: ({node, ...props}) => <li className="marker:text-brand-purple mb-2 last:mb-0" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-brand-purple font-black uppercase tracking-tighter text-base mt-4 mb-2" {...props} />
                              }}>
                                {reflectionAnalysis}
                              </Markdown>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button 
                        onClick={handleAnalyzeReflection}
                        disabled={isAnalyzing || (!reflections.better.trim() && !reflections.refine.trim())}
                        className="w-full py-4 bg-brand-purple text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-brand-purple/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-purple/20"
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="animate-spin" size={16} /> 
                            Distilling Insights...
                          </>
                        ) : (
                          <>
                            Analyze My Reflection <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Motivational Analytics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-8 card-3d bg-gradient-to-br from-brand-purple/5 to-transparent border border-warm-border dark:border-stone-800 flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-badge-purple dark:bg-brand-purple/20 flex items-center justify-center text-brand-purple mb-4">
                        <CheckCircle2 size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-warm-text dark:text-white mb-2">Resilience Tracker</h4>
                      <p className="text-[10px] text-warm-secondary uppercase font-black mb-4">Current Level: High</p>
                      <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-brand-purple" />
                      </div>
                    </div>
                    <div className="p-8 card-3d bg-gradient-to-br from-emerald-500/5 to-transparent border border-warm-border dark:border-stone-800 flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 mb-4">
                        <Stars size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-warm-text dark:text-white mb-2">Learning Wins</h4>
                      <p className="text-[10px] text-warm-secondary uppercase font-black mb-4">+3 New Insights Gained</p>
                      <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} className="h-full bg-emerald-500" />
                      </div>
                    </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="p-8 card-3d bg-brand-purple text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-all">
                      <Sparkles size={120} />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Pro Tip for Confidence</h3>
                    <p className="text-sm text-brand-purple-light leading-relaxed mb-8">
                      "Instead of saying 'I messed up', say 'I found a specific area where I can grow.' Reframing is a superpower in the tech world."
                    </p>
                    <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all">
                      Next Tip <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="p-8 card-3d bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800">
                    <h4 className="font-bold text-warm-text dark:text-white mb-4 flex items-center gap-2">
                       <Lightbulb className="text-brand-yellow" size={18} /> Next Steps
                    </h4>
                    <ul className="space-y-4">
                      {[
                        "Review technical gaps from feedback",
                        "Optimize Resume for similar roles",
                        "Schedule a mock interview for retry"
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full border border-brand-purple/30 flex items-center justify-center text-[10px] font-black text-brand-purple mt-0.5">
                            {i+1}
                          </div>
                          <span className="text-sm text-warm-secondary">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
