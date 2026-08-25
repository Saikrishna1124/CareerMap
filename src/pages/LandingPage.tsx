import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Video,
  Flame,
  ChevronDown,
  Compass,
  Award,
  FileText,
  Gamepad2,
  HelpCircle,
  Github,
  Linkedin,
  Globe,
  Users
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { StarField } from '../components/StarField';
import { useTheme, THEMES } from '../context/ThemeContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, activeDarkTheme, selectDarkTheme } = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      word: "① Map Strategy",
      subtitle: "Map your professional trajectory with precision AI insights and visual node milestones.",
      image: "https://cdn-icons-png.flaticon.com/128/11925/11925891.png"
    },
    {
      word: "② Master Skills",
      subtitle: "Bridge critical skill gaps, practice AI mock interviews, and play daily career puzzles.",
      image: "https://cdn-icons-png.flaticon.com/128/12805/12805077.png"
    },
    {
      word: "③ Prosper & Lead",
      subtitle: "Accelerate your career evolution and confidently land your high-impact dream role.",
      image: "https://cdn-icons-png.flaticon.com/128/16948/16948479.png"
    }
  ];

  const currentStep = steps[currentStepIndex];

  // Motion variants for Staggered Scroll Reveal Animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.22,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 45, scale: 0.94 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-warm-bg dark:bg-stone-950 text-warm-text dark:text-stone-100 transition-colors duration-500 overflow-x-hidden">
      {/* Background Star Canvas */}
      <StarField />

      {/* Dynamic Ambient Blur background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="atmosphere absolute inset-0 opacity-40 dark:opacity-100" />
      </div>

      {/* Sticky Header Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-3.5 flex justify-between items-center bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-warm-border/60 dark:border-stone-800/80 transition-all">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-stone-50 dark:bg-stone-900 rounded-xl flex items-center justify-center shadow-sm border border-stone-200 dark:border-stone-800 shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/main_logo.png"
                alt="CareerMap Logo"
                className="w-7 h-7 object-contain"
              />
            </div>
            <span className="text-xl font-black text-brand-purple tracking-tight">
              CareerMap
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-warm-secondary dark:text-stone-400">
          <a href="#how-it-works" className="hover:text-brand-purple dark:hover:text-white transition-colors">How It Works</a>
          <a href="#daily-puzzle" className="hover:text-brand-purple dark:hover:text-white transition-colors flex items-center gap-1">
            Daily Game <span className="px-1.5 py-0.5 rounded bg-brand-amber/10 text-brand-amber text-[10px]">NEW</span>
          </a>
          <a href="#team" className="hover:text-brand-purple dark:hover:text-white transition-colors">Team</a>
        </nav>

        {/* Right Action buttons & Theme Switcher */}
        <div className="flex items-center gap-3">
          {/* Theme Palette Switcher */}
          <div className="hidden sm:flex items-center gap-1.5 p-1.5 rounded-full bg-stone-100 dark:bg-stone-900 border border-warm-border/60 dark:border-stone-800 shadow-inner mr-1">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => selectDarkTheme(t.id)}
                className={`w-5 h-5 rounded-full transition-all duration-300 border-2 overflow-hidden ${activeDarkTheme === t.id
                  ? 'border-brand-purple dark:border-white scale-110 shadow-md opacity-100 z-10'
                  : 'border-transparent hover:scale-110 opacity-60 hover:opacity-100'
                  }`}
                title={t.name}
                style={{
                  backgroundColor: t.variables['--accent-primary']
                }}
              />
            ))}
          </div>

          <Link
            to="/login"
            className="px-4 py-2 text-xs font-bold text-warm-secondary dark:text-stone-300 hover:text-brand-purple dark:hover:text-white transition-colors"
          >
            Log In
          </Link>

          <Link
            to="/signup"
            className="px-5 py-2.5 bg-brand-purple text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-brand-purple/20 flex items-center gap-1.5"
          >
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative pt-36 pb-20 px-4 md:px-8 z-10 flex flex-col items-center max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-4xl mx-auto space-y-7"
        >
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-badge-purple dark:bg-brand-purple/20 backdrop-blur-md border border-brand-purple/20 text-brand-purple dark:text-purple-300 text-[11px] font-black uppercase tracking-widest shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-purple animate-pulse" />
            <Sparkles size={14} /> Next-Gen AI Career Intelligence Platform
          </div>

          {/* Big Hero Title */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-warm-text dark:text-white tracking-tighter leading-[0.92] italic">
            Architect Your <br />
            <span className="text-brand-purple dark:text-purple-400">Professional</span> Evolution.
          </h1>

          {/* Hero Subtitle */}
          <p className="text-base sm:text-xl text-warm-secondary dark:text-stone-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Build your career roadmap, analyze your skills, and practice AI mock interviews to land your dream job.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-purple to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-95 transition-all shadow-xl shadow-brand-purple/25 flex items-center justify-center gap-2 group hover:scale-[1.02]"
            >
              Get Started Free <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/demo"
              className="w-full sm:w-auto px-8 py-4 bg-white/80 dark:bg-stone-900/80 text-warm-text dark:text-white border border-warm-border dark:border-stone-800 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition-all flex items-center justify-center gap-2 backdrop-blur-sm hover:scale-[1.02]"
            >
              Explore Interactive Demo
            </Link>
          </div>
        </motion.div>

        {/* Dynamic Rotating Stage Visualizer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-16 w-full max-w-5xl mx-auto relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple via-indigo-500 to-brand-amber rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-35 transition duration-1000" />

          <div className="relative bg-white/90 dark:bg-stone-900/90 border border-warm-border dark:border-stone-800 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-purple/5 via-transparent to-transparent" />

            <div className="relative h-64 md:h-72 w-full rounded-2xl border border-warm-border/60 dark:border-stone-800/80 bg-warm-bg/40 dark:bg-stone-950/40 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="text-center space-y-4 max-w-xl mx-auto">
                <div className="h-16 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`icon-${currentStepIndex}`}
                      initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 mx-auto shadow-lg"
                    >
                      <img
                        src={currentStep.image}
                        alt={currentStep.word}
                        className="w-10 h-10 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="h-28 flex flex-col justify-center items-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`content-${currentStepIndex}`}
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -12, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="text-center flex flex-col items-center"
                    >
                      <h3 className="text-3xl sm:text-4xl font-black text-warm-text dark:text-white uppercase tracking-wider italic">
                        {currentStep.word}
                      </h3>
                      <p className="text-warm-secondary dark:text-stone-300 font-bold text-xs sm:text-sm max-w-md tracking-wide mt-2 leading-relaxed">
                        {currentStep.subtitle}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Quick Indicator Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-2 rounded-full transition-all ${currentStepIndex === idx ? 'w-8 bg-brand-purple' : 'w-2 bg-stone-300 dark:bg-stone-700'
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Metrics Banner */}
      <section className="py-12 border-y border-warm-border/60 dark:border-stone-800/80 bg-white/40 dark:bg-stone-900/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-brand-purple dark:text-purple-400">95%+</div>
              <div className="text-xs font-bold uppercase tracking-wider text-warm-secondary dark:text-stone-400">Precision Path Match</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-brand-amber dark:text-amber-400">10,000+</div>
              <div className="text-xs font-bold uppercase tracking-wider text-warm-secondary dark:text-stone-400">Resumes Analyzed</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-brand-purple dark:text-purple-400">150+</div>
              <div className="text-xs font-bold uppercase tracking-wider text-warm-secondary dark:text-stone-400">Skill Blueprints</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">4.9 / 5</div>
              <div className="text-xs font-bold uppercase tracking-wider text-warm-secondary dark:text-stone-400">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section with Staggered Scroll-Reveal Animations */}
      <section id="how-it-works" className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-purple/10 text-brand-purple dark:text-purple-300 text-xs font-bold uppercase tracking-widest">
            <Compass size={14} /> Simple 4-Step Process
          </div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight italic">
            How CareerMap <span className="text-brand-purple dark:text-purple-400">Works</span>
          </h2>
          <p className="text-warm-secondary dark:text-stone-300 font-medium max-w-2xl mx-auto text-sm sm:text-base">
            Transforming your career is straightforward. Follow our structured AI roadmap step by step.
          </p>
        </motion.div>

        {/* Staggered Animated Grid Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {[
            {
              num: "01",
              title: "Connect & Upload",
              desc: "Import your resume or enter your current experience to establish your skill baseline.",
              icon: FileText,
              accent: "from-purple-500/20 to-indigo-500/20"
            },
            {
              num: "02",
              title: "Generate Roadmap",
              desc: "Get an interactive node-based roadmap targeting your exact desired dream position.",
              icon: Compass,
              accent: "from-blue-500/20 to-cyan-500/20"
            },
            {
              num: "03",
              title: "Bridge Skill Gaps",
              desc: "Play daily puzzles, complete targeted learning steps, and optimize your resume.",
              icon: Gamepad2,
              accent: "from-amber-500/20 to-orange-500/20"
            },
            {
              num: "04",
              title: "Ace AI Interviews",
              desc: "Practice realistic mock interviews with instant voice and tone analytics to land offers.",
              icon: Video,
              accent: "from-emerald-500/20 to-teal-500/20"
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="p-6 rounded-3xl bg-white/80 dark:bg-stone-900/80 border border-warm-border dark:border-stone-800 shadow-lg relative space-y-5 backdrop-blur-xl group overflow-hidden"
              >
                {/* Background Hover Accent Glow */}
                <div className={`absolute -inset-1 bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl`} />

                <div className="relative flex justify-between items-center z-10">
                  <span className="text-4xl font-black text-brand-purple/30 dark:text-purple-400/30 group-hover:text-brand-purple dark:group-hover:text-purple-300 transition-colors">
                    {item.num}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 dark:bg-stone-800 border border-brand-purple/20 dark:border-stone-700 text-brand-purple dark:text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon size={22} />
                  </div>
                </div>

                <div className="relative z-10 space-y-2">
                  <h3 className="text-xl font-black italic tracking-tight text-warm-text dark:text-white group-hover:text-brand-purple dark:group-hover:text-purple-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-warm-secondary dark:text-stone-300 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Spotlight: Daily Career Connections Puzzle Game */}
      <section id="daily-puzzle" className="py-20 px-4 md:px-8 bg-gradient-to-b from-stone-100/50 to-warm-bg dark:from-stone-900/40 dark:to-stone-950 border-y border-warm-border/60 dark:border-stone-800/80">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

          <div className="md:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Flame size={16} /> Daily Career Connections Game
            </div>

            <h2 className="text-3xl sm:text-5xl font-black italic tracking-tight leading-tight">
              Play 3 Minutes Daily. <br />
              <span className="text-brand-amber">Boost Your Career Mind</span>
            </h2>

            <p className="text-warm-secondary dark:text-stone-300 text-sm leading-relaxed font-medium">
              Train your professional brain with our LinkedIn-inspired daily puzzle. Connect 16 career terms into 4 logical groups ranging from entry level to executive strategy.
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs font-bold">
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800 flex items-center gap-3">
                <Flame className="text-amber-500" size={24} />
                <div>
                  <div className="text-warm-text dark:text-white font-black text-sm">Streak Counter</div>
                  <div className="text-warm-secondary dark:text-stone-400 text-[11px]">Keep daily habits alive</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800 flex items-center gap-3">
                <Award className="text-brand-purple" size={24} />
                <div>
                  <div className="text-warm-text dark:text-white font-black text-sm">Badges & Stats</div>
                  <div className="text-warm-secondary dark:text-stone-400 text-[11px]">Track your wins</div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/daily-game"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
              >
                Play Today's Puzzle <Gamepad2 size={16} />
              </Link>
            </div>
          </div>

          <div className="md:col-span-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800 pb-3">
                <span className="font-black text-sm uppercase tracking-wider">Career Connections #042</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">Solved</span>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-bold text-center">
                  💜 FRONTEND FRAMEWORKS: React, Vue, Angular, Svelte
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold text-center">
                  💚 CLOUD DATABASES: PostgreSQL, MongoDB, DynamoDB, Redis
                </div>
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold text-center">
                  💛 AGILE METRICS: Velocity, Burn-down, Cycle Time, Throughput
                </div>
                <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold text-center">
                  💙 LEADERSHIP SKILLS: Empathy, Delegation, Vision, Resilience
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Meet Our Team Section */}
      <section id="team" className="py-24 px-4 md:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-purple/10 text-brand-purple dark:text-purple-300 text-xs font-bold uppercase tracking-widest">
            <Users size={14} /> The Builders Behind CareerMap
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight italic">
            Meet Our <span className="text-brand-purple dark:text-purple-400">Team</span>
          </h2>
          <p className="text-warm-secondary dark:text-stone-300 font-medium max-w-xl mx-auto text-sm sm:text-base">
            The passionate engineers and designers driving CareerMap's vision forward.
          </p>
        </motion.div>

        {/* Team Members Continuous Marquee Ticker Container */}
        <div className="relative w-full overflow-hidden py-6">
          {/* Left & Right Soft Fade Overlay Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-warm-bg dark:from-stone-950 to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-warm-bg dark:from-stone-950 to-transparent z-20 pointer-events-none" />

          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            }}
            className="flex gap-6 w-max cursor-grab active:cursor-grabbing hover:[animation-play-state:paused]"
          >
            {[
              {
                name: "Chaitanya",
                role: "Backend Developer",
                image: "https://media.licdn.com/dms/image/v2/D5635AQFM2J_fwboIyA/profile-framedphoto-shrink_800_800/B56Z5pFAcCHkAY-/0/1779879381079?e=1788242400&v=beta&t=_nNuJ2Objk2Ya3RGUhMv2ZyybtHfLmjCGqQUPEgd-os",
                github: "https://github.com/GUTHACHAITANYA",
                linkedin: "https://www.linkedin.com/in/gutha-chaitanya-282a27353/"
              },
              {
                name: "Bharath Kumar",
                role: "Backend Developer",
                image: "https://media.licdn.com/dms/image/v2/D4D03AQFbDG1cuOPM1w/profile-displayphoto-crop_800_800/B4DZ2FtJOPJ4AI-/0/1776064705322?e=1787788800&v=beta&t=LaX_W2oxHoihGIroZtWhSs5frYmtim25_QFJKyuk7ps",
                linkedin: "https://www.linkedin.com/in/bharath-kumar-kuruva-513195317/"
              },
              {
                name: "Sai Krishna",
                role: "Lead Full Stack Developer",
                image: "https://media.licdn.com/dms/image/v2/D5603AQEDFlDSWh--aw/profile-displayphoto-crop_800_800/B56Z4asTS1KQAI-/0/1778564281746?e=1787788800&v=beta&t=IVhnmNc75BfLN7Erv2F9jGO5-Pg3HZ-qWfPrSwEyFk4",
                github: "https://github.com/Saikrishna1124",
                linkedin: "https://www.linkedin.com/in/sai-krishna-gummadidala-261984354/"
              },
              {
                name: "Tarun",
                role: "Database Engineer",
                image: "https://media.licdn.com/dms/image/v2/D4D03AQEh60WZpWWU5g/profile-displayphoto-crop_800_800/B4DZ1YGbjjHkAI-/0/1775299575532?e=1788998400&v=beta&t=stsKmWulS5UlmxqfX9sS4Tz7gdOW337Bw1_4RWWV4-4",
                github: "https://github.com/Tarunmuriki",
                linkedin: "https://www.linkedin.com/in/muriki-tarun/"
              },
              {
                name: "Jyothsna Vamisetti",
                role: "Frontend Developer",
                image: "/jyothsna.jpg",
                github: "https://github.com/24joshu",
                linkedin: "https://www.linkedin.com/in/jyothsnavamisetti/"
              },
              // Loop duplication for seamless continuous scroll
              {
                name: "Sai Krishna",
                role: "Lead Full Stack Developer",
                image: "https://media.licdn.com/dms/image/v2/D5603AQEDFlDSWh--aw/profile-displayphoto-crop_800_800/B56Z4asTS1KQAI-/0/1778564281746?e=1787788800&v=beta&t=IVhnmNc75BfLN7Erv2F9jGO5-Pg3HZ-qWfPrSwEyFk4",
                github: "https://github.com/Saikrishna1124",
                linkedin: "https://www.linkedin.com/in/sai-krishna-gummadidala-261984354/"
              },
              {
                name: "Bharath Kumar",
                role: "Backend Developer",
                image: "https://media.licdn.com/dms/image/v2/D4D03AQFbDG1cuOPM1w/profile-displayphoto-crop_800_800/B4DZ2FtJOPJ4AI-/0/1776064705322?e=1787788800&v=beta&t=LaX_W2oxHoihGIroZtWhSs5frYmtim25_QFJKyuk7ps",
                linkedin: "https://www.linkedin.com/in/bharath-kumar-kuruva-513195317/"
              },
              {
                name: "Chaitanya",
                role: "Backend Developer",
                image: "https://media.licdn.com/dms/image/v2/D5635AQFM2J_fwboIyA/profile-framedphoto-shrink_800_800/B56Z5pFAcCHkAY-/0/1779879381079?e=1788242400&v=beta&t=_nNuJ2Objk2Ya3RGUhMv2ZyybtHfLmjCGqQUPEgd-os",
                github: "https://github.com/GUTHACHAITANYA",
                linkedin: "https://www.linkedin.com/in/gutha-chaitanya-282a27353/"
              },
              {
                name: "Tarun",
                role: "Database Engineer",
                image: "https://media.licdn.com/dms/image/v2/D4D03AQEh60WZpWWU5g/profile-displayphoto-crop_800_800/B4DZ1YGbjjHkAI-/0/1775299575532?e=1788998400&v=beta&t=stsKmWulS5UlmxqfX9sS4Tz7gdOW337Bw1_4RWWV4-4",
                github: "https://github.com/Tarunmuriki",
                linkedin: "https://www.linkedin.com/in/muriki-tarun/"
              },
              {
                name: "Jyothsna Vamisetti",
                role: "Frontend Developer",
                image: "/jyothsna.jpg",
                github: "https://github.com/24joshu",
                linkedin: "https://www.linkedin.com/in/jyothsnavamisetti/"
              }
            ].map((member, idx) => (
              <div
                key={idx}
                className="w-[260px] sm:w-[290px] p-6 rounded-3xl bg-white/80 dark:bg-stone-900/80 border border-warm-border dark:border-stone-800 shadow-xl backdrop-blur-xl text-center space-y-4 group relative overflow-hidden shrink-0 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Subtle Ambient Glow */}
                <div className="absolute -inset-1 bg-gradient-to-br from-brand-purple/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl" />

                {/* Circular Profile Photo */}
                <div className="relative w-28 h-28 mx-auto rounded-full p-1 bg-gradient-to-tr from-brand-purple via-indigo-500 to-cyan-400 shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover object-top border-2 border-white dark:border-stone-900"
                  />
                </div>

                {/* Member Details: Name & Role Only */}
                <div className="space-y-1 relative z-10">
                  <h3 className="text-xl font-black text-warm-text dark:text-white tracking-tight group-hover:text-brand-purple dark:group-hover:text-purple-300 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-purple dark:text-purple-400">
                    {member.role}
                  </p>
                </div>

                {/* Social Links */}
                <div className="flex justify-center items-center gap-3 pt-2 relative z-10">
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center hover:bg-brand-purple hover:text-white dark:hover:bg-purple-500 dark:hover:text-white transition-colors shadow-sm"
                      title={`${member.name}'s GitHub Profile`}
                    >
                      <Github size={16} />
                    </a>
                  )}

                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center hover:bg-brand-purple hover:text-white dark:hover:bg-purple-500 dark:hover:text-white transition-colors shadow-sm"
                      title={`${member.name}'s LinkedIn Profile`}
                    >
                      <Linkedin size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="relative rounded-[2.5rem] bg-gradient-to-r from-brand-purple to-indigo-700 p-8 sm:p-14 text-white text-center shadow-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

          <div className="relative space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black italic tracking-tight leading-tight">
              Ready to Accelerate Your Career Trajectory?
            </h2>
            <p className="text-sm sm:text-base text-purple-100 font-medium leading-relaxed">
              Join thousands of ambitious professionals using AI precision maps, daily puzzles, and mock interview practice.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-4 bg-white text-stone-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-100 transition-all shadow-xl flex items-center justify-center gap-2"
              >
                Get Started Free <ArrowRight size={16} />
              </Link>
              <Link
                to="/demo"
                className="px-8 py-4 bg-purple-900/40 text-white border border-white/20 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-purple-900/60 transition-all flex items-center justify-center"
              >
                Try Demo First
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-warm-border/60 dark:border-stone-800/80 bg-white/70 dark:bg-stone-950/70 pt-16 pb-12 px-4 md:px-8 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-stone-100 dark:bg-stone-900 rounded-xl flex items-center justify-center border border-stone-200 dark:border-stone-800">
                <img src="/main_logo.png" alt="CareerMap Logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-lg font-black text-brand-purple tracking-tight">CareerMap</span>
            </div>
            <p className="text-warm-secondary dark:text-stone-400 font-medium leading-relaxed max-w-sm">
              Architect your professional evolution with precision AI insights, interactive roadmaps, daily connection puzzles, and mock interviews.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <div className="font-bold uppercase tracking-wider text-warm-text dark:text-white">Product</div>
            <ul className="space-y-2 text-warm-secondary dark:text-stone-400 font-medium">
              <li><Link to="/careermap" className="hover:text-brand-purple dark:hover:text-white">Career Roadmap</Link></li>
              <li><Link to="/daily-game" className="hover:text-brand-purple dark:hover:text-white">Daily Connections Game</Link></li>
              <li><Link to="/interview" className="hover:text-brand-purple dark:hover:text-white">AI Mock Interview</Link></li>
              <li><Link to="/resume" className="hover:text-brand-purple dark:hover:text-white">Resume Architect</Link></li>
              <li><Link to="/skills" className="hover:text-brand-purple dark:hover:text-white">Skill Benchmarking</Link></li>
            </ul>
          </div>

          {/* Quick Nav */}
          <div className="space-y-3">
            <div className="font-bold uppercase tracking-wider text-warm-text dark:text-white">Quick Links</div>
            <ul className="space-y-2 text-warm-secondary dark:text-stone-400 font-medium">
              <li><a href="#how-it-works" className="hover:text-brand-purple dark:hover:text-white">How It Works</a></li>
              <li><a href="#daily-puzzle" className="hover:text-brand-purple dark:hover:text-white">Daily Game</a></li>
              <li><a href="#team" className="hover:text-brand-purple dark:hover:text-white">Team</a></li>
              <li><Link to="/login" className="hover:text-brand-purple dark:hover:text-white">Log In</Link></li>
            </ul>
          </div>

          {/* Legal & Theme */}
          <div className="space-y-3">
            <div className="font-bold uppercase tracking-wider text-warm-text dark:text-white">Account</div>
            <ul className="space-y-2 text-warm-secondary dark:text-stone-400 font-medium">
              <li><Link to="/signup" className="hover:text-brand-purple dark:hover:text-white">Create Account</Link></li>
              <li><Link to="/demo" className="hover:text-brand-purple dark:hover:text-white">Demo Mode</Link></li>
              <li><Link to="/confidence" className="hover:text-brand-purple dark:hover:text-white">Confidence Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-warm-border/40 dark:border-stone-800/60 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-warm-secondary dark:text-stone-500 font-semibold">
          <div>© {new Date().getFullYear()} CareerMap AI. All rights reserved.</div>
          <div className="flex gap-6 text-xs">
            <span className="hover:text-brand-purple cursor-pointer">Privacy Policy</span>
            <span className="hover:text-brand-purple cursor-pointer">Terms of Service</span>
            <span className="hover:text-brand-purple cursor-pointer">Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
