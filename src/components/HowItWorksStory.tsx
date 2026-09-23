import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { 
  FileText, 
  Compass, 
  Gamepad2, 
  Video, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Mic, 
  Activity, 
  TrendingUp, 
  Award,
  Layers,
  Zap,
  Check,
  ChevronRight
} from 'lucide-react';

interface StepData {
  num: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  desc: string;
  icon: React.ElementType;
  accent: string;
  color: string;
  badge: string;
  highlights: string[];
}

const STEPS: StepData[] = [
  {
    num: "01",
    stepNumber: 1,
    title: "Connect & Upload",
    subtitle: "Establish Your Skill Baseline",
    desc: "Import your resume or enter your current experience to establish your skill baseline. Our AI instantly parses technical competencies, work history, and hidden potential.",
    icon: FileText,
    accent: "from-cyan-500/20 via-indigo-500/20 to-purple-500/20",
    color: "#00F2FE",
    badge: "AI Resume Parsing",
    highlights: [
      "Instant ATS & skill extraction engine",
      "Identifies 150+ technical & soft skills",
      "Zero manual data entry required"
    ]
  },
  {
    num: "02",
    stepNumber: 2,
    title: "Generate Roadmap",
    subtitle: "Precision AI Trajectory Blueprint",
    desc: "Get an interactive node-based roadmap targeting your exact desired dream position. Visualize every milestone, required tech stack, and estimated market salary.",
    icon: Compass,
    accent: "from-purple-500/20 via-indigo-500/20 to-cyan-500/20",
    color: "#8B5CF6",
    badge: "Interactive Career Nodes",
    highlights: [
      "Custom node progression tree",
      "Real-time market salary benchmarks",
      "Direct skill gap path mapping"
    ]
  },
  {
    num: "03",
    stepNumber: 3,
    title: "Bridge Skill Gaps",
    subtitle: "Daily Gamified Practice & Optimization",
    desc: "Play daily puzzles, complete targeted learning steps, and optimize your resume. Build daily habits while closing high-value technical skill gaps.",
    icon: Gamepad2,
    accent: "from-amber-500/20 via-orange-500/20 to-purple-500/20",
    color: "#F59E0B",
    badge: "Daily Connections Game",
    highlights: [
      "LinkedIn-style daily career word puzzle",
      "Progressive hints with streak rewards",
      "Real-time resume score feedback"
    ]
  },
  {
    num: "04",
    stepNumber: 4,
    title: "Ace AI Interviews",
    subtitle: "Real-Time Voice & Confidence Feedback",
    desc: "Practice realistic mock interviews with instant voice and tone analytics to land offers. Get granular scoring on keyword coverage, delivery speed, and confidence.",
    icon: Video,
    accent: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
    color: "#10B981",
    badge: "Voice & Tone Simulator",
    highlights: [
      "Live audio waveform & speech transcription",
      "Role & seniority tailored questions",
      "Instant 0-100 interview readiness score"
    ]
  }
];

// --- STEP VISUAL COMPONENTS ---

// Step 01 Visual: Resume Scanner & Skill Extraction Node Network
const Step01Visual: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[300px] sm:min-h-[380px] rounded-3xl bg-stone-900/90 border border-stone-800 p-6 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(0,242,254,0.15),_transparent_70%)]" />

      {/* Top Bar */}
      <div className="relative z-10 flex justify-between items-center pb-4 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
            AI Document Engine v2.4
          </span>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[11px] font-mono border border-cyan-500/20">
          SCANNING 100%
        </span>
      </div>

      {/* Main Visual Content */}
      <div className="relative z-10 my-auto grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Document Card with Scanning Beam */}
        <div className="sm:col-span-6 relative bg-stone-950/80 border border-cyan-500/30 rounded-2xl p-4 space-y-3 overflow-hidden shadow-xl">
          {/* Animated Laser Beam Scan */}
          <motion.div 
            animate={{ top: ['-10%', '110%'] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00F2FE] z-20"
          />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Alex_Rivera_Resume.pdf</div>
              <div className="text-[10px] text-stone-400 font-mono">Parsed: 4 Years Software Eng</div>
            </div>
          </div>

          {/* Skeleton Document Lines */}
          <div className="space-y-1.5 pt-2">
            <div className="h-2 w-3/4 bg-stone-800 rounded-full" />
            <div className="h-2 w-full bg-cyan-500/20 rounded-full" />
            <div className="h-2 w-5/6 bg-stone-800 rounded-full" />
            <div className="h-2 w-2/3 bg-cyan-500/20 rounded-full" />
          </div>
        </div>

        {/* Extracted Skill Nodes Floating out */}
        <div className="sm:col-span-6 space-y-2">
          <div className="text-[10px] uppercase font-mono font-bold text-stone-400 tracking-wider">
            Extracted Skills Baseline
          </div>

          <div className="space-y-2">
            {[
              { skill: "React & TypeScript", match: "98%", color: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" },
              { skill: "System Architecture", match: "91%", color: "bg-purple-500/20 border-purple-500/40 text-purple-300" },
              { skill: "Node.js & Cloud", match: "88%", color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" },
            ].map((s, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.4 }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex justify-between items-center ${s.color}`}
              >
                <span>{s.skill}</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/40">{s.match}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 flex justify-between items-center text-[11px] text-stone-400 pt-3 border-t border-stone-800">
        <span>Skill Graph Initialized</span>
        <span className="text-cyan-400 font-mono">14 Skill Gap Nodes Found →</span>
      </div>
    </div>
  );
};

// Step 02 Visual: Growing Node-Based Career Roadmap Tree
const Step02Visual: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[300px] sm:min-h-[380px] rounded-3xl bg-stone-900/90 border border-stone-800 p-6 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_rgba(139,92,246,0.18),_transparent_70%)]" />

      {/* Top Header */}
      <div className="relative z-10 flex justify-between items-center pb-4 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <Compass className="text-purple-400 animate-spin" size={16} style={{ animationDuration: '10s' }} />
          <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
            Career Node Network Generator
          </span>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[11px] font-mono border border-purple-500/20">
          TARGET: $185,000 / YR
        </span>
      </div>

      {/* Roadmap Tree Visualization */}
      <div className="relative z-10 my-auto py-4 space-y-4">
        <div className="relative flex justify-between items-center max-w-md mx-auto">
          {/* Animated Connecting SVG Line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
            <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#8B5CF6" strokeWidth="3" strokeDasharray="6 6" className="animate-pulse" />
          </svg>

          {[
            { level: "Current", title: "Mid Engineer", status: "Done", bg: "bg-purple-500 text-white shadow-[0_0_15px_#8B5CF6]" },
            { level: "Next 3m", title: "Senior Frontend", status: "In Progress", bg: "bg-stone-900 border-2 border-purple-400 text-purple-300" },
            { level: "Next 6m", title: "Tech Lead", status: "Locked", bg: "bg-stone-950 border border-stone-800 text-stone-500" },
            { level: "Dream Target", title: "Principal Architect", status: "Goal", bg: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg" }
          ].map((node, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center space-y-2 group">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-transform group-hover:scale-110 ${node.bg}`}>
                0{idx + 1}
              </div>
              <div className="text-[10px] font-mono text-purple-300 uppercase tracking-wider">{node.level}</div>
              <div className="text-xs font-black text-white max-w-[80px] leading-tight">{node.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Roadmap Metrics */}
      <div className="relative z-10 grid grid-cols-3 gap-2 pt-3 border-t border-stone-800 text-center">
        <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800">
          <div className="text-[10px] text-stone-400">Milestones</div>
          <div className="text-xs font-black text-purple-300">4 Core Nodes</div>
        </div>
        <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800">
          <div className="text-[10px] text-stone-400">Est. Timeline</div>
          <div className="text-xs font-black text-cyan-300">6 Months</div>
        </div>
        <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800">
          <div className="text-[10px] text-stone-400">Salary Impact</div>
          <div className="text-xs font-black text-emerald-400">+42% Salary</div>
        </div>
      </div>
    </div>
  );
};

// Step 03 Visual: Skill Gap Matching & Daily Connections Game
const Step03Visual: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[300px] sm:min-h-[380px] rounded-3xl bg-stone-900/90 border border-stone-800 p-6 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(245,158,11,0.15),_transparent_70%)]" />

      {/* Top Bar */}
      <div className="relative z-10 flex justify-between items-center pb-4 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <Gamepad2 className="text-amber-400 animate-bounce" size={16} />
          <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
            Daily Connections Puzzle Engine
          </span>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-mono border border-amber-500/20 flex items-center gap-1">
          🔥 12 DAY STREAK
        </span>
      </div>

      {/* Gamified Puzzle Tiles Showcase */}
      <div className="relative z-10 my-auto py-2 space-y-3">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-stone-300">Today's Category: Cloud Architecture</span>
          <span className="text-amber-400 font-mono">Progress: 75%</span>
        </div>

        {/* Level Progress Bar */}
        <div className="w-full bg-stone-950 rounded-full h-3 p-0.5 border border-stone-800">
          <motion.div 
            initial={{ width: "40%" }}
            animate={{ width: "75%" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-[0_0_10px_#F59E0B]"
          />
        </div>

        {/* Daily Puzzle Connected Groups */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {[
            { group: "Cloud Databases", items: "PostgreSQL • Redis • DynamoDB", solved: true, color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" },
            { group: "CI/CD Pipeline", items: "Docker • Kubernetes • GitHub Actions", solved: true, color: "bg-amber-500/20 border-amber-500/40 text-amber-300" },
            { group: "System Design", items: "Load Balancer • Caching • CDN", solved: true, color: "bg-purple-500/20 border-purple-500/40 text-purple-300" },
            { group: "Agile Leadership", items: "Sprint Planning • Retrospective", solved: false, color: "bg-stone-950 border-stone-800 text-stone-400" }
          ].map((item, idx) => (
            <div key={idx} className={`p-3 rounded-2xl border text-xs space-y-1 ${item.color}`}>
              <div className="font-bold flex items-center justify-between">
                <span>{item.group}</span>
                {item.solved ? <CheckCircle2 size={14} className="text-emerald-400" /> : <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
              </div>
              <div className="text-[10px] font-mono opacity-80">{item.items}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 flex justify-between items-center text-[11px] text-stone-400 pt-3 border-t border-stone-800">
        <span>Daily Skill XP Earned</span>
        <span className="text-amber-400 font-mono font-bold">+250 Career XP 🏆</span>
      </div>
    </div>
  );
};

// Step 04 Visual: AI Mock Interview Voice Waveform & Scoring HUD
const Step04Visual: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[300px] sm:min-h-[380px] rounded-3xl bg-stone-900/90 border border-stone-800 p-6 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,_rgba(16,185,129,0.18),_transparent_70%)]" />

      {/* Top Bar */}
      <div className="relative z-10 flex justify-between items-center pb-4 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <Mic className="text-emerald-400 animate-pulse" size={16} />
          <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
            AI Live Mock Interviewer
          </span>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-mono border border-emerald-500/20 flex items-center gap-1">
          <Activity size={12} /> LIVE RECORDING
        </span>
      </div>

      {/* Main HUD Content */}
      <div className="relative z-10 my-auto py-2 space-y-4">
        {/* Animated Soundwave Equalizer */}
        <div className="bg-stone-950/80 border border-emerald-500/30 rounded-2xl p-4 space-y-3 shadow-inner">
          <div className="flex justify-between items-center text-xs font-bold text-stone-300">
            <span>Interviewer Prompt #3</span>
            <span className="text-emerald-400 font-mono">01:42 / 03:00</span>
          </div>

          <div className="text-xs text-white font-medium italic">
            "How do you handle database failover and horizontal scalability in high-traffic microservices?"
          </div>

          {/* Equalizer Bars */}
          <div className="flex justify-center items-end gap-1.5 h-10 pt-2">
            {[40, 75, 95, 60, 85, 100, 70, 50, 90, 65, 80, 45, 85, 95, 60, 40].map((h, idx) => (
              <motion.div
                key={idx}
                animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.5}%`] }}
                transition={{ repeat: Infinity, duration: 0.8 + (idx % 4) * 0.2, ease: "easeInOut" }}
                className="w-1.5 bg-gradient-to-t from-emerald-600 to-teal-300 rounded-full shadow-[0_0_8px_#10B981]"
              />
            ))}
          </div>
        </div>

        {/* Real-time Feedback Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-stone-950/60 p-3 rounded-2xl border border-stone-800 space-y-1">
            <div className="text-[10px] font-mono text-stone-400">Tone & Confidence</div>
            <div className="text-sm font-black text-emerald-400 flex items-center gap-1">
              94% Excellent <Check size={14} />
            </div>
          </div>

          <div className="bg-stone-950/60 p-3 rounded-2xl border border-stone-800 space-y-1">
            <div className="text-[10px] font-mono text-stone-400">Keyword Alignment</div>
            <div className="text-sm font-black text-teal-300 flex items-center gap-1">
              91% Coverage <TrendingUp size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 flex justify-between items-center text-[11px] text-stone-400 pt-3 border-t border-stone-800">
        <span>Overall Interview Score</span>
        <span className="text-emerald-400 font-mono font-black text-xs">92/100 • Offer Ready! 🎉</span>
      </div>
    </div>
  );
};

// Map step numbers to visuals
const VISUAL_COMPONENTS: Record<number, React.FC> = {
  1: Step01Visual,
  2: Step02Visual,
  3: Step03Visual,
  4: Step04Visual,
};

export const HowItWorksStory: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Track scroll progress of the 350vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Map scroll progress to steps 0, 1, 2, 3 cleanly
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    let nextStep = 0;
    if (latest < 0.28) {
      nextStep = 0;
    } else if (latest < 0.54) {
      nextStep = 1;
    } else if (latest < 0.78) {
      nextStep = 2;
    } else {
      nextStep = 3;
    }

    if (nextStep !== activeStepIndex) {
      setActiveStepIndex(nextStep);
    }
  });

  const currentStepData = STEPS[activeStepIndex];
  const VisualComponent = VISUAL_COMPONENTS[currentStepData.stepNumber];

  // Manual Click Navigation Handler
  const handleStepClick = (index: number) => {
    setActiveStepIndex(index);
    if (containerRef.current) {
      const containerTop = containerRef.current.offsetTop;
      const containerHeight = containerRef.current.offsetHeight;
      const targetScroll = containerTop + (containerHeight / 4) * index;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={containerRef} 
      id="how-it-works"
      className="relative w-full h-[320vh] sm:h-[360vh] bg-stone-950 text-stone-100"
    >
      {/* Sticky Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between px-4 sm:px-8 py-8 overflow-hidden z-20 max-w-7xl mx-auto">
        
        {/* Top Header & Progress Bar Indicator */}
        <div className="w-full space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-mono font-bold uppercase tracking-widest">
                <Sparkles size={12} /> Pinned Interactive Story
              </div>
              <h2 className="text-2xl sm:text-4xl font-black italic tracking-tight text-white mt-1">
                How CareerMap <span className="text-cyan-400">Works</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 max-w-md font-medium">
              Transforming your career is straightforward. Scroll down to advance through our precision AI engine step by step.
            </p>
          </div>

          {/* Connected Step Progress Bar Line */}
          <div className="relative w-full max-w-3xl mx-auto py-2">
            <div className="flex justify-between items-center relative z-10">
              {STEPS.map((step, idx) => {
                const isActive = activeStepIndex === idx;
                const isPassed = activeStepIndex > idx;
                return (
                  <button
                    key={step.num}
                    onClick={() => handleStepClick(idx)}
                    className="flex items-center gap-2 group focus:outline-none"
                  >
                    <div 
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs sm:text-sm transition-all duration-300 border ${
                        isActive
                          ? 'bg-cyan-400 text-stone-950 border-cyan-300 scale-110 shadow-[0_0_15px_#00F2FE]'
                          : isPassed
                          ? 'bg-stone-800 text-cyan-400 border-cyan-500/40'
                          : 'bg-stone-900 text-stone-500 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      {step.num}
                    </div>
                    <span className={`hidden md:inline text-xs font-bold uppercase tracking-wider transition-colors ${
                      isActive ? 'text-white font-black' : 'text-stone-500 hover:text-stone-400'
                    }`}>
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Background Line Connector */}
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-stone-800 -translate-y-1/2 z-0">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400"
                style={{ width: `${(activeStepIndex / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>

        {/* Middle Main Content 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto w-full py-4">
          
          {/* Left Column: Step Description & Staggered Animations */}
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`step-text-${activeStepIndex}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="space-y-5"
              >
                {/* Large Step Badge */}
                <div className="flex items-center gap-3">
                  <span className="text-4xl sm:text-6xl font-black font-mono text-cyan-400/80 tracking-tighter">
                    {currentStepData.num}
                  </span>
                  <div className="h-8 w-0.5 bg-stone-800" />
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                      STEP {currentStepData.stepNumber} OF {STEPS.length}
                    </div>
                    <div className="text-xs text-stone-400 font-medium">
                      {currentStepData.subtitle}
                    </div>
                  </div>
                </div>

                {/* Step Title */}
                <h3 className="text-3xl sm:text-5xl font-black italic tracking-tight text-white leading-tight">
                  {currentStepData.title}
                </h3>

                {/* Step Description */}
                <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-medium">
                  {currentStepData.desc}
                </p>

                {/* Highlights List */}
                <div className="space-y-2.5 pt-2">
                  {currentStepData.highlights.map((h, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx + 0.2 }}
                      className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-stone-200"
                    >
                      <div className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                        <Check size={12} />
                      </div>
                      <span>{h}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Dynamic Step Visual Illustration */}
          <div className="lg:col-span-7 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={`step-visual-${activeStepIndex}`}
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full h-full"
              >
                <VisualComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Scroll Cue & Navigation Controls */}
        <div className="w-full flex justify-between items-center border-t border-stone-800/80 pt-4 text-xs font-mono text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Scroll down to control story progression</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleStepClick(Math.max(0, activeStepIndex - 1))}
              disabled={activeStepIndex === 0}
              className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 hover:border-stone-700 disabled:opacity-30 disabled:pointer-events-none text-stone-300 font-bold transition-all"
            >
              ← PREV STEP
            </button>
            <span className="text-stone-500">0{activeStepIndex + 1} / 04</span>
            <button
              onClick={() => handleStepClick(Math.min(STEPS.length - 1, activeStepIndex + 1))}
              disabled={activeStepIndex === STEPS.length - 1}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 text-stone-950 font-bold hover:bg-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(0,242,254,0.3)]"
            >
              NEXT STEP →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
