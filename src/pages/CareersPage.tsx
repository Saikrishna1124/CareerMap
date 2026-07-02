import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, Search, Filter, MapPin, 
  DollarSign, Building2, Sparkles,
  ArrowUpRight, Loader2, GraduationCap,
  X, CheckCircle2, Target, Compass, 
  Lightbulb, BookOpen, UserCheck,
  ChevronRight, BrainCircuit, Bookmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Tooltip } from '../components/Tooltip';

interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Internship' | 'Contract';
  salary: string;
  postedAt: string;
  matchScore: number;
  skills: string[];
  missingSkills: string[];
  learningRoadmap: string[];
  suggestedProjects: string[];
  interviewTips: string[];
  description: string;
  url?: string;
  whyRecommended?: string;
  eligibilityStatus?: 'High' | 'Medium' | 'Low';
}

export const CareersPage: React.FC = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [defaultOpportunities, setDefaultOpportunities] = useState<Opportunity[]>([]);
  const [activeTab, setActiveTab] = useState<'recommended' | 'default'>('recommended');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [scores, setScores] = useState({ resumeScore: 0, interviewScore: 0, skillMatchScore: 0, careerReadinessScore: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'jobs' | 'internships'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [locationFilter, setLocationFilter] = useState('');

  const fetchOpportunities = async (queryOverride?: string) => {
    setIsLoading(true);
    setError(null);
    setIsFallback(false);
    try {
      const skillsContext = user?.skills?.map((s: any) => typeof s === 'string' ? s : s.name).join(', ') || 'Software Development';
      const query = queryOverride || searchQuery || user?.targetRole || '';
      
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          skills: skillsContext, 
          type: filter,
          query
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch jobs');
      
      if (data.fallback) {
        setOpportunities(Array.isArray(data.jobs) ? data.jobs : []);
        setDefaultOpportunities(Array.isArray(data.defaultJobs) ? data.defaultJobs : []);
        setAnalysis(data.analysis || null);
        if (data.scores) setScores(data.scores);
        setIsFallback(true);
      } else if (data.jobs) {
        setOpportunities(Array.isArray(data.jobs) ? data.jobs : []);
        setDefaultOpportunities(Array.isArray(data.defaultJobs) ? data.defaultJobs : []);
        setAnalysis(data.analysis || null);
        if (data.scores) setScores(data.scores);
      } else {
        setOpportunities(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      console.error("Error fetching opportunities:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [user?.skills, filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOpportunities();
  };

  const currentOpportunities = activeTab === 'recommended' ? opportunities : defaultOpportunities;
  const filteredOpportunities = (Array.isArray(currentOpportunities) ? currentOpportunities : []).filter(op => {
    if (minMatchScore > 0 && (op.matchScore || 0) < minMatchScore) return false;
    if (locationFilter && !(op.location || '').toLowerCase().includes(locationFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-8 space-y-8 min-h-screen bg-warm-bg dark:bg-stone-950">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section: Career Readiness Dashboard */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-1 flex-1">
            <h1 className="text-4xl font-black text-warm-text dark:text-white tracking-tighter flex items-center gap-3">
              Career Readiness <BrainCircuit className="text-brand-purple" size={36} />
            </h1>
            <p className="text-warm-secondary font-medium max-w-xl">
              Personalized AI tracking based on your <span className="text-brand-purple font-bold">{(user?.skills || []).length} unique skills</span>, resume, and mock interviews.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-stone-900 p-2 rounded-2xl border border-warm-border dark:border-stone-800 shadow-sm">
            <div className="px-4 py-2 text-center border-r border-warm-border dark:border-stone-800 min-w-[100px]">
              <p className="text-[10px] font-black uppercase text-warm-hint tracking-widest">Resume</p>
              <p className="text-xl font-black text-warm-text dark:text-white">{scores.resumeScore}<span className="text-xs text-warm-hint">%</span></p>
            </div>
            <div className="px-4 py-2 text-center border-r border-warm-border dark:border-stone-800 min-w-[100px]">
              <p className="text-[10px] font-black uppercase text-warm-hint tracking-widest">Interview</p>
              <p className="text-xl font-black text-warm-text dark:text-white">{scores.interviewScore}<span className="text-xs text-warm-hint">%</span></p>
            </div>
            <div className="px-4 py-2 text-center border-r border-warm-border dark:border-stone-800 min-w-[100px]">
              <p className="text-[10px] font-black uppercase text-brand-purple tracking-widest">Skill Match</p>
              <p className="text-xl font-black text-brand-purple">{scores.skillMatchScore}<span className="text-xs text-brand-purple/50">%</span></p>
            </div>
            <div className="px-4 py-2 text-center min-w-[100px] bg-brand-purple/5 rounded-xl border border-brand-purple/10">
              <p className="text-[10px] font-black uppercase text-brand-purple tracking-widest">Readiness</p>
              <p className="text-xl font-black text-brand-purple">{scores.careerReadinessScore}<span className="text-xs text-brand-purple/50">%</span></p>
            </div>
          </div>
        </div>

        {/* Intelligence Hero Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-[300px] rounded-[40px] overflow-hidden border border-warm-border dark:border-stone-800 shadow-2xl group shadow-brand-purple/10"
        >
          <img 
            referrerPolicy="no-referrer"
            src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2M5eDhjbmllM2pzMjVtMDgxMmM0dWMwdWZnc3NwM3BoMWMwN3ppdSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/YnexM9LwlwGu4Z1QnS/giphy.webp" 
            alt="AI Market Neural Network" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[20s] ease-linear opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/40 to-transparent flex flex-col justify-center px-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-purple/20 backdrop-blur-md rounded-full border border-brand-purple/30 text-badge-purple text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} className="text-brand-purple" /> Market Intelligence Active
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter max-w-xl leading-none">
              Your Professional <br /> <span className="text-brand-purple">Next-Step</span> Identified.
            </h2>
            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Growth Velocity</p>
                <p className="text-2xl font-black text-white">+24.2%</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Skill Alignment</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-black text-white">High</p>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search & Filter Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <form onSubmit={handleSearch} className="md:col-span-8 flex gap-2 bg-white dark:bg-stone-900 p-2 rounded-[24px] border border-warm-border dark:border-stone-800 shadow-xl shadow-brand-purple/5">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-hint" size={20} />
                <input 
                  type="text"
                  placeholder="What role or company? e.g. React Internship at Meta"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-transparent border-none rounded-xl outline-none focus:ring-0 transition-all font-bold text-warm-text dark:text-stone-200"
                />
              </div>
              <button 
                type="submit"
                className="bg-brand-purple text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-purple/90 transition-all shadow-lg shadow-brand-purple/30 flex items-center gap-2"
              >
                Analyze Market <ArrowUpRight size={16} />
              </button>
            </form>
            
            <div className="md:col-span-4 flex gap-2 p-2 bg-white dark:bg-stone-900 rounded-[24px] border border-warm-border dark:border-stone-800 shadow-sm overflow-x-auto">
              {[
                { id: 'all', label: 'All Ops', icon: Briefcase },
                { id: 'jobs', label: 'Full-Time', icon: Building2 },
                { id: 'internships', label: 'Internships', icon: GraduationCap }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`flex-1 min-w-[90px] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    filter === f.id 
                      ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' 
                      : 'bg-transparent text-warm-hint hover:text-brand-purple'
                  }`}
                >
                  <f.icon size={14} /> {f.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white dark:bg-stone-900 p-4 rounded-[24px] border border-warm-border dark:border-stone-800 shadow-sm">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-warm-hint tracking-widest flex items-center gap-2"><Target size={12}/> Min Match Score: {minMatchScore}%</label>
              <input 
                type="range" min="0" max="100" step="5"
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="w-full accent-brand-purple"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-warm-hint tracking-widest flex items-center gap-2"><MapPin size={12}/> Location</label>
              <input 
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-4 py-2 bg-warm-bg dark:bg-stone-950 border border-warm-border dark:border-stone-800 rounded-xl outline-none focus:border-brand-purple transition-colors text-sm font-bold text-warm-text dark:text-stone-200"
              />
            </div>
            <div className="space-y-2 flex flex-col justify-end">
               <div className="flex items-center gap-2 px-4 py-2 bg-brand-purple/5 rounded-xl border border-brand-purple/10">
                 <Lightbulb size={14} className="text-brand-purple shrink-0" />
                 <p className="text-[9px] font-bold text-warm-secondary">
                   <span className="text-brand-purple">Pro Tip:</span> Results are pre-filtered by your {scores.careerReadinessScore}% Career Readiness.
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* Status Banners */}
        {analysis && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-brand-purple/5 dark:bg-brand-purple/10 border border-brand-purple/20 rounded-[32px] flex items-start gap-5 shadow-lg shadow-brand-purple/5"
          >
            <div className="w-14 h-14 shrink-0 bg-white dark:bg-stone-900 rounded-2xl flex items-center justify-center text-brand-purple shadow-sm border border-brand-purple/10">
              <BrainCircuit size={28} />
            </div>
            <div>
              <p className="text-brand-purple text-sm font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <Sparkles size={14} /> AI Readiness Analysis
              </p>
              <p className="text-warm-text dark:text-stone-300 text-sm font-bold leading-relaxed">{analysis}</p>
            </div>
          </motion.div>
        )}

        {isFallback && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-badge-purple dark:bg-brand-purple/10 border border-brand-purple/20 rounded-3xl flex items-center gap-5"
          >
            <div className="w-12 h-12 bg-white dark:bg-stone-900 rounded-2xl flex items-center justify-center text-brand-purple shadow-sm">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-brand-purple text-sm font-black uppercase tracking-tight">AI Agent Note</p>
              <p className="text-warm-secondary text-xs font-bold leading-relaxed">System load is high. We've matched you with top-tier roles specifically curated for your profile.</p>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        {!isLoading && !error && (
          <div className="flex gap-4 border-b border-warm-border dark:border-stone-800 pb-1 mt-4">
            <button 
              onClick={() => setActiveTab('recommended')}
              className={`pb-3 px-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'recommended' ? 'border-b-4 border-brand-purple text-brand-purple' : 'text-warm-secondary hover:text-brand-purple'}`}
            >
              Recommended For You
            </button>
            <button 
              onClick={() => setActiveTab('default')}
              className={`pb-3 px-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'default' ? 'border-b-4 border-brand-purple text-brand-purple' : 'text-warm-secondary hover:text-brand-purple'}`}
            >
              All Active Roles
            </button>
          </div>
        )}

        {/* Content Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-stone-900 rounded-[40px] border border-warm-border dark:border-stone-800 border-dashed">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="text-brand-purple mb-8"
            >
              <Loader2 size={64} />
            </motion.div>
            <h2 className="text-2xl font-black text-warm-text dark:text-white mb-2 tracking-tight uppercase">Scanning Tech Ecosystem...</h2>
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-brand-purple rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-brand-purple rounded-full animate-bounce delay-150" />
              <div className="w-2 h-2 bg-brand-purple rounded-full animate-bounce delay-300" />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 bg-red-50/30 dark:bg-red-900/10 rounded-[40px] border border-red-100 dark:border-red-800 shadow-sm text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center text-red-600 mb-6">
              <Filter size={40} />
            </div>
            <h2 className="text-2xl font-black text-warm-text dark:text-white mb-2 tracking-tight uppercase text-red-600">Search Threshold Exceeded</h2>
            <p className="text-warm-secondary font-medium text-sm mb-8 max-w-md">{error}</p>
            <button 
              onClick={() => fetchOpportunities()}
              className="px-10 py-4 bg-brand-purple text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-purple/90 transition-all shadow-xl shadow-brand-purple/30"
            >
              Restore Matrix Connection
            </button>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-warm-bg dark:bg-stone-900/50 rounded-[40px] border border-warm-border dark:border-stone-800 border-dashed text-center">
            <div className="w-16 h-16 bg-white dark:bg-stone-900 rounded-2xl flex items-center justify-center text-warm-hint mb-4 shadow-sm">
              <Search size={24} />
            </div>
            <h2 className="text-xl font-black text-warm-text dark:text-white mb-2 tracking-tight">No Matching Roles Found</h2>
            <p className="text-warm-secondary font-medium text-sm">Try adjusting your filters or running a new search analysis.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOpportunities.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedOpportunity(item)}
                className="group relative bg-white dark:bg-stone-900 rounded-[40px] border border-warm-border dark:border-stone-800 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-brand-purple transition-all cursor-pointer flex flex-col h-full overflow-hidden"
              >
                {/* Readiness Badge */}
                <div className="absolute top-0 right-0 p-8 pt-10">
                  <div className="flex flex-col items-end">
                    <div className="text-[32px] font-black text-brand-purple tracking-tighter leading-none flex items-start">
                      {item.matchScore}<span className="text-xs text-warm-hint mt-1">%</span>
                    </div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-warm-hint bg-warm-bg dark:bg-stone-950 px-2 py-1 rounded-md border border-warm-border dark:border-stone-800 mt-2">
                       Market Readiness
                    </div>
                  </div>
                </div>

                {/* Company & Icon */}
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-warm-bg dark:bg-stone-950 border border-warm-border dark:border-stone-800 flex items-center justify-center text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-all transform group-hover:rotate-6">
                    {item.type === 'Internship' ? <GraduationCap size={32} /> : <Briefcase size={32} />}
                  </div>
                </div>

                {/* Role Details */}
                <div className="flex-1 space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-warm-text dark:text-white leading-tight group-hover:text-brand-purple transition-colors">{item.title}</h3>
                    <p className="text-base font-bold text-brand-purple">{item.company}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-warm-secondary uppercase tracking-widest">
                      <MapPin size={12} className="text-brand-purple" /> {item.location || 'Remote'}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-warm-secondary uppercase tracking-widest">
                      <DollarSign size={12} className="text-brand-purple" /> {item.salary || 'Not specified'}
                    </div>
                    {item.eligibilityStatus && (
                      <div className="flex items-center gap-2 text-[10px] font-black text-warm-secondary uppercase tracking-widest">
                        <UserCheck size={12} className={item.eligibilityStatus === 'High' ? 'text-emerald-500' : item.eligibilityStatus === 'Medium' ? 'text-amber-500' : 'text-red-500'} /> 
                        Eligibility: {item.eligibilityStatus}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-warm-secondary dark:text-stone-400 line-clamp-3 leading-relaxed font-medium">
                    {item.description}
                  </p>

                  {item.whyRecommended && (
                    <div className="p-3 bg-brand-purple/5 border border-brand-purple/10 rounded-xl">
                      <p className="text-[10px] font-black uppercase text-brand-purple mb-1 flex items-center gap-1"><Sparkles size={10} /> Why Recommended</p>
                      <p className="text-xs font-medium text-warm-text dark:text-stone-300">{item.whyRecommended}</p>
                    </div>
                  )}

                  <div className="space-y-3 pt-4">
                    <p className="text-[10px] font-black uppercase text-warm-hint tracking-widest">Target Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(item.skills || []).map((skill, idx) => (
                        <span key={idx} className="text-[9px] font-black uppercase tracking-tighter bg-badge-purple dark:bg-brand-purple/20 text-brand-purple dark:text-stone-300 px-3 py-1.5 rounded-xl border border-brand-purple/10">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {(item.missingSkills || []).length > 0 && (
                    <div className="space-y-3 pt-2">
                      <p className="text-[10px] font-black uppercase text-brand-amber tracking-widest flex items-center gap-2">
                         <Target size={10} /> Gap Identified
                      </p>
                      <div className="flex flex-wrap gap-1.5 text-[9px] font-bold text-warm-hint italic">
                        {(item.missingSkills || []).join(' • ')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex gap-4 pt-8 border-t border-warm-border dark:border-stone-800 mt-8">
                  <button className="flex-1 py-4 bg-brand-purple text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-warm-text transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-purple/20">
                    View Readiness <Compass size={14} />
                  </button>
                  <Tooltip content="Bookmark Career" position="top">
                    <button className="p-4 bg-white dark:bg-stone-950 border border-warm-border dark:border-stone-800 rounded-2xl text-warm-hint hover:text-brand-purple transition-all">
                      <Bookmark size={20} />
                    </button>
                  </Tooltip>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Career Readiness Panel */}
      <AnimatePresence>
        {selectedOpportunity && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOpportunity(null)}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 p-4 flex items-center justify-end"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-stone-950 shadow-2xl z-[60] overflow-y-auto"
            >
              <div className="p-10 space-y-10">
                {/* Panel Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-brand-purple tracking-widest italic">AI Career Analysis</p>
                    <h2 className="text-3xl font-black text-warm-text dark:text-white tracking-tighter leading-tight">
                      {selectedOpportunity.title}
                    </h2>
                    <p className="text-xl font-bold text-warm-secondary">at {selectedOpportunity.company}</p>
                  </div>
                  <Tooltip content="Close Panel" position="left">
                    <button 
                      onClick={() => setSelectedOpportunity(null)}
                      className="p-3 bg-warm-bg dark:bg-stone-900 rounded-2xl text-warm-secondary hover:text-warm-text transition-all"
                    >
                      <X size={24} />
                    </button>
                  </Tooltip>
                </div>

                {/* Readiness Score Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-warm-bg dark:bg-stone-900 rounded-[32px] border border-warm-border dark:border-stone-800 text-center space-y-1">
                    <div className="text-4xl font-black text-brand-purple">{selectedOpportunity.matchScore}%</div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-warm-hint">Readiness Score</p>
                  </div>
                  <div className="p-6 bg-brand-purple rounded-[32px] text-center space-y-1 text-white shadow-xl shadow-brand-purple/20">
                    <div className="text-4xl font-black">AI</div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Powered Matching</p>
                  </div>
                </div>

                {/* Skill Matrix */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase text-warm-secondary tracking-widest flex items-center gap-3">
                    <Target size={14} className="text-brand-purple" /> Skill Compatibility Matrix
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-200/50 dark:border-emerald-800 space-y-3">
                      <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={12} /> Matching Strengths
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(selectedOpportunity.skills || []).map((s, i) => (
                          <span key={i} className="text-xs font-bold text-warm-text dark:text-stone-200 bg-white dark:bg-stone-950 px-3 py-1.5 rounded-xl shadow-sm border border-emerald-200/50">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-badge-amber dark:bg-brand-amber/10 rounded-3xl border border-brand-amber/20 dark:border-brand-amber/30 space-y-3">
                      <p className="text-[10px] font-black uppercase text-brand-amber tracking-widest flex items-center gap-2">
                        <Lightbulb size={12} /> Skills to Develop
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(selectedOpportunity.missingSkills || []).map((s, i) => (
                          <span key={i} className="text-xs font-bold text-warm-text dark:text-stone-200 bg-white dark:bg-stone-950 px-3 py-1.5 rounded-xl shadow-sm border border-brand-amber/20">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Learning Roadmap */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase text-warm-secondary tracking-widest flex items-center gap-3">
                    <BookOpen size={14} className="text-brand-purple" /> Suggested Learning Roadmap
                  </h3>
                  <div className="space-y-3">
                    {(selectedOpportunity.learningRoadmap || []).map((step, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-warm-bg dark:bg-stone-900 rounded-2xl border border-warm-border dark:border-stone-800 relative overflow-hidden">
                        <div className="text-2xl font-black text-brand-purple/10 italic absolute -right-2 -bottom-2 select-none">STEP {i+1}</div>
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-stone-950 border border-warm-border dark:border-stone-800 flex items-center justify-center text-brand-purple font-black shrink-0 shadow-sm">
                          {i + 1}
                        </div>
                        <p className="text-sm font-bold text-warm-text dark:text-stone-200 leading-snug">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects & Interview Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-warm-hint tracking-widest flex items-center gap-2">
                       Portfolio Boosters
                    </h3>
                    <div className="space-y-3 text-sm font-medium text-warm-secondary dark:text-stone-400">
                      {(selectedOpportunity.suggestedProjects || []).map((p, i) => (
                        <div key={i} className="flex gap-3">
                          <CheckCircle2 size={16} className="text-brand-purple shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-warm-hint tracking-widest flex items-center gap-2">
                       Interview Strategy
                    </h3>
                    <div className="space-y-3 text-sm font-medium text-warm-secondary dark:text-stone-400">
                      {(selectedOpportunity.interviewTips || []).map((t, i) => (
                        <div key={i} className="flex gap-3">
                          <UserCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-10 border-t border-warm-border dark:border-stone-800">
                  <a 
                    href={selectedOpportunity.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-3 py-5 bg-brand-purple text-white rounded-[24px] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-warm-text transition-all shadow-2xl shadow-brand-purple/20"
                  >
                    Launch Application <ArrowUpRight size={18} />
                  </a>
                  <button className="flex-1 py-5 bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800 rounded-[24px] text-[10px] font-black uppercase tracking-widest text-warm-hint hover:text-brand-purple transition-all">
                    Save Role
                  </button>
                </div>

                <div className="p-6 bg-warm-bg dark:bg-stone-900 rounded-[32px] border border-warm-border dark:border-stone-800 border-dashed text-center">
                   <p className="text-[9px] font-black uppercase italic text-warm-hint">Career Coach Insight</p>
                   <p className="text-xs font-bold text-warm-secondary mt-2">
                     "{selectedOpportunity.matchScore}% is a strong match. Focus on the {(selectedOpportunity.learningRoadmap || []).length} roadmap steps to hit 100% readiness."
                   </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CareersPage;
