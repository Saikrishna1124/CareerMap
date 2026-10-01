import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  User, Mail, Briefcase, GraduationCap, 
  Plus, Trash2, Save, Loader2, 
  CheckCircle2, Award, Github, Linkedin, Globe,
  Activity, Star, Camera, BarChart3, Radio, Sparkles
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  Tooltip as RechartsTooltip
} from 'recharts';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, fetchMe, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    avatar: '',
    targetRole: '',
    skills: [] as { name: string, level: number }[],
    experience: [] as any[],
    education: [] as any[],
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: ''
    }
  });

  const [newSkill, setNewSkill] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(70);

  const [matrixView, setMatrixView] = useState<'radar' | 'bars'>('radar');
  const [sortBy, setSortBy] = useState<'highest' | 'lowest' | 'default'>('highest');

  // Sorted skills for clear, organized matrix visualization
  const displaySkills = useMemo(() => {
    const list = [...formData.skills];
    if (sortBy === 'highest') return list.sort((a, b) => b.level - a.level);
    if (sortBy === 'lowest') return list.sort((a, b) => a.level - b.level);
    return list;
  }, [formData.skills, sortBy]);

  useEffect(() => {
    if (user) {
      // Migrate old string skills to objects if necessary
      const skills = Array.isArray(user.skills) 
        ? user.skills.map((s: any) => typeof s === 'string' ? { name: s, level: 70 } : s)
        : [];
        
      setFormData({
        name: user.name || '',
        title: user.title || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        targetRole: user.targetRole || '',
        skills: skills,
        experience: Array.isArray(user.experience) ? [...user.experience] : [],
        education: Array.isArray(user.education) ? [...user.education] : [],
        socialLinks: {
          linkedin: user.socialLinks?.linkedin || '',
          github: user.socialLinks?.github || '',
          portfolio: user.socialLinks?.portfolio || ''
        }
      });
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("Image is too large. Please keep it under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const avatar = reader.result as string;
        setFormData({ ...formData, avatar });
        // Update global user state immediately for instant feedback in Header
        if (user) {
          setUser({ ...user, avatar });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSuccess(true);
        await fetchMe();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { company: '', role: '', period: '', desc: '' }]
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { school: '', degree: '', year: '' }]
    });
  };

  if (!user) return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-500 font-medium">Syncing profile data...</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 min-h-screen bg-[#F5F7FB] dark:bg-slate-950 transition-colors duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">User Profile</h1>
          <p className="text-slate-500 font-medium">Manage your professional appearance and data.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : success ? <CheckCircle2 size={20} /> : <Save size={20} />}
            {success ? 'Saved' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center relative group">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 dark:border-indigo-800 overflow-hidden">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} />
                )}
              </div>
              <label 
                htmlFor="avatar-upload" 
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-indigo-700 transition-all border-2 border-white dark:border-slate-900"
                title="Change Photo"
              >
                <Camera size={16} />
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                className="hidden" 
              />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{formData.name}</h3>
            <div className="flex justify-center gap-2">
              <a href={formData.socialLinks.github} target="_blank" rel="noopener noreferrer" className={`p-2 transition-colors bg-[#F5F7FB] dark:bg-slate-950 rounded-lg ${formData.socialLinks.github ? 'text-indigo-600' : 'text-slate-400 opacity-50 pointer-events-none'}`}><Github size={18} /></a>
              <a href={formData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className={`p-2 transition-colors bg-[#F5F7FB] dark:bg-slate-950 rounded-lg ${formData.socialLinks.linkedin ? 'text-[#0077b5]' : 'text-slate-400 opacity-50 pointer-events-none'}`}><Linkedin size={18} /></a>
              <a href={formData.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className={`p-2 transition-colors bg-[#F5F7FB] dark:bg-slate-950 rounded-lg ${formData.socialLinks.portfolio ? 'text-indigo-600' : 'text-slate-400 opacity-50 pointer-events-none'}`}><Globe size={18} /></a>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Skills</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.skills.map((skill, i) => (
                <div key={i} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-medium flex flex-col gap-1 min-w-[80px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate max-w-[80px]">{skill.name}</span>
                    <span className="text-xs text-indigo-900 dark:text-indigo-200 font-black">{skill.level}%</span>
                    <button onClick={() => setFormData({...formData, skills: formData.skills.filter((_, idx) => idx !== i)})} className="hover:text-red-500">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="w-full bg-indigo-200 dark:bg-indigo-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full" style={{ width: `${skill.level}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <input 
                type="text" 
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && newSkill && (setFormData({...formData, skills: [...formData.skills, { name: newSkill, level: newSkillLevel }]}), setNewSkill(''))}
                placeholder="Skill name..."
                className="w-full bg-[#F5F7FB] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Level: {newSkillLevel}%</label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(parseInt(e.target.value))}
                  className="flex-1 accent-indigo-600 cursor-pointer"
                />
              </div>
              <button 
                onClick={() => { if(newSkill) { setFormData({...formData, skills: [...formData.skills, { name: newSkill, level: newSkillLevel }]}); setNewSkill(''); } }}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-xs font-bold"
              >
                <Plus size={14} /> Add Skill
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          {/* Enhanced Skill Matrix Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/10 blur-3xl pointer-events-none rounded-full -mr-20 -mt-20"></div>
            
            <div className="p-6 sm:p-8 space-y-6 relative z-10">
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
                    <Sparkles size={12} /> Skill Intelligence Matrix
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    Skill Proficiency & Market Fit
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
                    Real-time comparison between your active skill ratings and competitive industry benchmarks (80% standard).
                  </p>
                </div>

                {/* View Switcher Toggle */}
                {formData.skills.length > 0 && (
                  <div className="flex items-center self-start sm:self-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setMatrixView('radar')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        matrixView === 'radar'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Radio size={13} /> Radar Web
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatrixView('bars')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        matrixView === 'bars'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <BarChart3 size={13} /> Breakdown Bars
                    </button>
                  </div>
                )}
              </div>

              {/* Chart & Visualization Content */}
              {formData.skills.length === 0 ? (
                <div className="w-full py-16 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-950/30">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-500 mb-3">
                    <Star size={32} />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Skills Added Yet</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs text-center">
                    Add your programming languages, frameworks, or tools on the left to generate your interactive matrix.
                  </p>
                </div>
              ) : matrixView === 'bars' ? (
                /* Clean Horizontal Matrix Graph (Primary View) */
                <div className="space-y-5">
                  {/* Graph Controls & Legend Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Your Proficiency</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400 dark:border-slate-500"></span>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">80% Market Benchmark</span>
                      </div>
                    </div>

                    {/* Quick Sort Options */}
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider">Sort:</span>
                      <button
                        type="button"
                        onClick={() => setSortBy('highest')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          sortBy === 'highest'
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        Highest
                      </button>
                      <button
                        type="button"
                        onClick={() => setSortBy('lowest')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          sortBy === 'lowest'
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        Lowest
                      </button>
                      <button
                        type="button"
                        onClick={() => setSortBy('default')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          sortBy === 'default'
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        Default
                      </button>
                    </div>
                  </div>

                  {/* Graph Canvas with Vertical Gridlines */}
                  <div className="relative pt-6 pb-2">
                    {/* Background Gridlines & Axis Numbers */}
                    <div className="absolute inset-0 pointer-events-none flex justify-between text-[10px] font-semibold text-slate-300 dark:text-slate-600">
                      <div className="relative h-full flex flex-col justify-between" style={{ left: '0%' }}>
                        <div className="border-l border-slate-200 dark:border-slate-800/80 h-full"></div>
                        <span className="-ml-1">0%</span>
                      </div>
                      <div className="relative h-full flex flex-col justify-between" style={{ left: '25%' }}>
                        <div className="border-l border-slate-200 dark:border-slate-800/80 h-full"></div>
                        <span className="-ml-3">25%</span>
                      </div>
                      <div className="relative h-full flex flex-col justify-between" style={{ left: '50%' }}>
                        <div className="border-l border-slate-200 dark:border-slate-800/80 h-full"></div>
                        <span className="-ml-3">50%</span>
                      </div>
                      <div className="relative h-full flex flex-col justify-between" style={{ left: '75%' }}>
                        <div className="border-l border-slate-200 dark:border-slate-800/80 h-full"></div>
                        <span className="-ml-3">75%</span>
                      </div>
                      <div className="relative h-full flex flex-col justify-between" style={{ left: '100%' }}>
                        <div className="border-l border-slate-200 dark:border-slate-800/80 h-full"></div>
                        <span className="-ml-5">100%</span>
                      </div>
                    </div>

                    {/* 80% Benchmark Vertical Line Overlay */}
                    <div 
                      className="absolute top-0 bottom-6 w-0.5 border-l-2 border-dashed border-indigo-400/80 dark:border-cyan-400/80 z-20 pointer-events-none"
                      style={{ left: '80%' }}
                    >
                      <span className="absolute -top-5 -translate-x-1/2 px-1.5 py-0.5 rounded bg-indigo-500/10 dark:bg-cyan-500/20 text-indigo-600 dark:text-cyan-300 text-[9px] font-black tracking-wider uppercase border border-indigo-300/40 dark:border-cyan-400/30 whitespace-nowrap shadow-sm">
                        80% Target
                      </span>
                    </div>

                    {/* Skill Rows */}
                    <div className="space-y-3 relative z-10">
                      {displaySkills.map((skill, idx) => {
                        const diff = skill.level - 80;
                        const isExceeding = diff >= 0;
                        return (
                          <div 
                            key={skill.name + idx}
                            className="group p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-slate-200/70 dark:border-slate-800 transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-center justify-between mb-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 w-4">
                                  #{idx + 1}
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white text-sm">
                                  {skill.name}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  skill.level >= 85
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    : skill.level >= 70
                                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                }`}>
                                  {skill.level >= 85 ? 'Master' : skill.level >= 70 ? 'Proficient' : 'Developing'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 dark:text-white text-sm">
                                  {skill.level}%
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
                                  isExceeding 
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                }`}>
                                  {isExceeding ? `▲ +${diff}%` : `▼ ${diff}%`}
                                </span>
                              </div>
                            </div>

                            {/* Bar Track */}
                            <div className="relative w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.level}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                className={`h-full rounded-full transition-all ${
                                  skill.level >= 80
                                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                                    : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Spacious Polar Radar (Alternative View) */
                <div className="flex flex-col items-center">
                  <div className="w-full h-[360px] sm:h-[400px] min-w-0 min-h-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart 
                        cx="50%" 
                        cy="50%" 
                        outerRadius="62%" 
                        data={formData.skills.map(s => ({
                          subject: s.name,
                          A: s.level,
                          B: 80,
                          fullMark: 100,
                        }))}
                      >
                        <defs>
                          <linearGradient id="userRadarGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.75} />
                            <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.4} />
                          </linearGradient>
                        </defs>

                        <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" opacity={0.6} />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                        />
                        <PolarRadiusAxis 
                          angle={30} 
                          domain={[0, 100]} 
                          tick={{ fill: '#94a3b8', fontSize: 9 }}
                          tickCount={5}
                          axisLine={false}
                        />

                        {/* Interactive Tooltip */}
                        <RechartsTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const diff = data.A - data.B;
                              return (
                                <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-700/80 p-3 rounded-2xl shadow-2xl text-xs text-white min-w-[190px] space-y-1.5 pointer-events-none">
                                  <div className="font-black text-sm text-indigo-300 flex items-center justify-between border-b border-slate-800 pb-1">
                                    <span>{data.subject}</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/30 text-indigo-200">
                                      {data.A >= 85 ? 'Master' : data.A >= 70 ? 'Proficient' : 'Developing'}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between pt-1">
                                    <span className="flex items-center gap-1.5 text-slate-300">
                                      <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"></span> Your Rating:
                                    </span>
                                    <span className="font-black text-white text-sm">{data.A}%</span>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-slate-500"></span> Benchmark:
                                    </span>
                                    <span className="font-semibold text-slate-300">{data.B}%</span>
                                  </div>
                                  <div className={`text-[11px] font-bold pt-1.5 border-t border-slate-800 flex items-center gap-1 ${diff >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {diff >= 0 ? `▲ +${diff}% Ahead of Target` : `▼ ${Math.abs(diff)}% Below Target`}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />

                        {/* Benchmark Line */}
                        <Radar
                          name="Benchmark (80%)"
                          dataKey="B"
                          stroke="#94a3b8"
                          strokeWidth={1.5}
                          strokeDasharray="4 4"
                          fill="transparent"
                        />

                        {/* User Rating Polygon */}
                        <Radar
                          name="Your Rating"
                          dataKey="A"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          fill="url(#userRadarGrad)"
                          fillOpacity={0.65}
                          dot={{ r: 4, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: '#06b6d4', stroke: '#ffffff', strokeWidth: 2 }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex items-center gap-6 pt-2 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-md bg-gradient-to-r from-indigo-500 to-cyan-500 shadow-sm"></div>
                      <span className="text-slate-700 dark:text-slate-300">Your Rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-0.5 border-t-2 border-dashed border-slate-400"></div>
                      <span className="text-slate-500 dark:text-slate-400">80% Benchmark</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User size={20} className="text-indigo-500" /> Basic Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#F5F7FB] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 ml-1">Professional Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[#F5F7FB] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-brand-purple ml-1 font-bold">Target Career Role</label>
                <input 
                  type="text" 
                  value={formData.targetRole}
                  onChange={(e) => setFormData({...formData, targetRole: e.target.value})}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full bg-white dark:bg-slate-900 border border-brand-purple/30 dark:border-brand-purple/20 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-purple font-bold text-brand-purple"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 ml-1">Bio</label>
              <textarea 
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full h-32 bg-[#F5F7FB] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Social & Online Presence</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-1 flex items-center gap-1"><Github size={10} /> GitHub URL</label>
                  <input 
                    type="url" 
                    placeholder="https://github.com/username"
                    value={formData.socialLinks.github}
                    onChange={(e) => setFormData({...formData, socialLinks: { ...formData.socialLinks, github: e.target.value }})}
                    className="w-full bg-[#F5F7FB] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-1 flex items-center gap-1"><Linkedin size={10} /> LinkedIn URL</label>
                  <input 
                    type="url" 
                    placeholder="https://linkedin.com/in/username"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => setFormData({...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value }})}
                    className="w-full bg-[#F5F7FB] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-1 flex items-center gap-1"><Globe size={10} /> Portfolio URL</label>
                  <input 
                    type="url" 
                    placeholder="https://yourportfolio.com"
                    value={formData.socialLinks.portfolio}
                    onChange={(e) => setFormData({...formData, socialLinks: { ...formData.socialLinks, portfolio: e.target.value }})}
                    className="w-full bg-[#F5F7FB] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase size={20} className="text-indigo-500" /> Experience
              </h4>
              <button onClick={addExperience} className="px-3 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                + Add Experience
              </button>
            </div>
            <div className="space-y-6">
              {formData.experience.map((exp, i) => (
                <div key={i} className="p-6 bg-[#F5F7FB] dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 relative group">
                  <button 
                    onClick={() => setFormData({...formData, experience: formData.experience.filter((_, idx) => idx !== i)})}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <input 
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...formData.experience];
                        newExp[i].company = e.target.value;
                        setFormData({...formData, experience: newExp});
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none"
                    />
                    <input 
                      placeholder="Role"
                      value={exp.role}
                      onChange={(e) => {
                        const newExp = [...formData.experience];
                        newExp[i].role = e.target.value;
                        setFormData({...formData, experience: newExp});
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none"
                    />
                  </div>
                  <input 
                    placeholder="Period (e.g. 2021 - Present)"
                    value={exp.period}
                    onChange={(e) => {
                      const newExp = [...formData.experience];
                      newExp[i].period = e.target.value;
                      setFormData({...formData, experience: newExp});
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none mb-4"
                  />
                  <textarea 
                    placeholder="Description"
                    value={exp.desc}
                    onChange={(e) => {
                      const newExp = [...formData.experience];
                      newExp[i].desc = e.target.value;
                      setFormData({...formData, experience: newExp});
                    }}
                    className="w-full h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap size={20} className="text-indigo-500" /> Education
              </h4>
              <button onClick={addEducation} className="px-3 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                + Add Education
              </button>
            </div>
            <div className="space-y-6">
              {formData.education.map((edu, i) => (
                <div key={i} className="p-6 bg-[#F5F7FB] dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 relative group">
                  <button 
                    onClick={() => setFormData({...formData, education: formData.education.filter((_, idx) => idx !== i)})}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input 
                      placeholder="School"
                      value={edu.school}
                      onChange={(e) => {
                        const newEdu = [...formData.education];
                        newEdu[i].school = e.target.value;
                        setFormData({...formData, education: newEdu});
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none"
                    />
                    <input 
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => {
                        const newEdu = [...formData.education];
                        newEdu[i].degree = e.target.value;
                        setFormData({...formData, education: newEdu});
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none"
                    />
                    <input 
                      placeholder="Year"
                      value={edu.year}
                      onChange={(e) => {
                        const newEdu = [...formData.education];
                        newEdu[i].year = e.target.value;
                        setFormData({...formData, education: newEdu});
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
