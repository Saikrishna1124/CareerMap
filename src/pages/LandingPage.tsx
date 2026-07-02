import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle2, Sparkles, Target, Zap, Video, Moon, Sun } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { StarField } from '../components/StarField';
import { useTheme, THEMES } from '../context/ThemeContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, activeDarkTheme, selectDarkTheme } = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      word: "① Plan",
      subtitle: "Map your professional trajectory with precision AI insights.",
      image: "https://cdn-icons-png.flaticon.com/128/11925/11925891.png"
    },
    {
      word: "② Prepare",
      subtitle: "Bridge your skills gaps and practice with immersive AI tools.",
      image: "https://cdn-icons-png.flaticon.com/128/12805/12805077.png"
    },
    {
      word: "③ Prosper",
      subtitle: "Accelerate your career evolution and land your dream role.",
      image: "https://cdn-icons-png.flaticon.com/128/16948/16948479.png"
    }
  ];

  const currentStep = steps[currentStepIndex];

  return (
    <div className="min-h-screen bg-warm-bg dark:bg-stone-950 text-warm-text dark:text-stone-100 transition-colors duration-500 overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="atmosphere absolute inset-0 opacity-40 dark:opacity-100" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/70 dark:bg-stone-950/50 backdrop-blur-md border-b border-warm-border/50 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-stone-50 dark:bg-stone-900 rounded-xl flex items-center justify-center shadow-sm border border-stone-100 dark:border-stone-800/80 shrink-0">
            <img
              src="/main_logo.png"
              alt="CareerMap Logo"
              className="w-9 h-9 object-contain"
            />
          </div>
          <span className="text-2xl font-black text-brand-purple tracking-tight">
            CareerMap
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-stone-50 dark:bg-stone-900 border border-warm-border/60 dark:border-stone-800/80 shadow-sm mr-2">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => selectDarkTheme(t.id)}
                className={`w-6 h-6 rounded-full transition-all duration-300 border-2 overflow-hidden ${
                  activeDarkTheme === t.id 
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
          <Link to="/login" className="text-sm font-bold text-warm-secondary hover:text-brand-purple transition-colors">
            Login
          </Link>
          <Link to="/signup" className="px-6 py-2.5 bg-brand-purple text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-brand-purple/20">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-40 pb-20 px-6 z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-badge-purple dark:bg-brand-purple/20 backdrop-blur-md border border-brand-purple/10 text-brand-purple text-[10px] font-black uppercase tracking-widest shadow-sm">
            <Sparkles size={14} /> New: AI Career Intelligence for future
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-warm-text dark:text-white tracking-tighter leading-[0.9] italic">
            Architect Your <br />
            <span className="text-brand-purple">Professional</span> Evolution.
          </h1>
          <p className="text-xl text-warm-secondary font-medium max-w-2xl mx-auto leading-relaxed dark:text-stone-400">
            Precision engineering for your career. Personalized insights and immersive tools to bridge the gap between where you are and where you belong.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/signup"
              className="px-8 py-4 bg-brand-purple text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-xl shadow-brand-purple/20 flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight size={20} />
            </Link>
            <Link
              to="/demo"
              className="px-8 py-4 bg-white dark:bg-white/5 text-warm-text dark:text-white border border-warm-border dark:border-white/10 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-warm-bg transition-all flex items-center justify-center"
            >
              View Demo
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="mt-20 w-full max-w-6xl mx-auto relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple to-brand-amber rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
          <div className="relative bg-white dark:bg-stone-900 border border-warm-border dark:border-white/10 rounded-[2.5rem] p-4 shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-purple/5 via-transparent to-transparent" />
            <div className="relative h-full w-full rounded-2xl border border-warm-border/50 bg-warm-bg/30 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center space-y-4 px-4 py-8">
                <div className="h-16 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`icon-${currentStepIndex}`}
                      initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0.8, opacity: 0, rotate: 15 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white dark:bg-stone-800 border border-warm-border/50 dark:border-stone-700/50 mx-auto shadow-lg"
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
                <div className="h-32 flex flex-col justify-center items-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`content-${currentStepIndex}`}
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -15, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="text-center flex flex-col items-center"
                    >
                      <h3 className="text-4xl md:text-5xl font-black text-warm-text dark:text-white uppercase tracking-wider italic">
                        {currentStep.word}
                      </h3>
                      <p className="text-warm-secondary font-bold text-xs max-w-sm uppercase tracking-widest mt-3 leading-relaxed dark:text-stone-400">
                        {currentStep.subtitle}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Resume Analysis",
                desc: "AI-powered extraction of your skills, impact, and carrier potential from any document.",
                color: "brand-purple"
              },
              {
                icon: Target,
                title: "Skill Gap Analysis",
                desc: "Understand exactly where you stand compared to industry benchmarks and top roles.",
                color: "brand-amber"
              },
              {
                icon: Video,
                title: "AI Interviews",
                desc: "Practice with our immersive simulator and get real-time feedback on your performance.",
                color: "brand-purple"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-warm-card dark:bg-stone-900 border border-warm-border dark:border-stone-800 shadow-sm"
              >
                <div className={`w-12 h-12 rounded-xl bg-badge-${feature.color === 'brand-purple' ? 'purple' : 'amber'} flex items-center justify-center text-${feature.color} mb-6`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-warm-text dark:text-white mb-3 italic tracking-tight">{feature.title}</h3>
                <p className="text-warm-secondary font-medium leading-relaxed dark:text-stone-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
