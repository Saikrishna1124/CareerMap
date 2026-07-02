import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp, Users, Clock, Target,
  Award, BookOpen, ChevronRight, Sparkles,
  Video, FileText, Code, Brain, Map, Loader2,
  Briefcase, MapPin, Github, Linkedin, Globe,
  Bell, BellRing, Trash, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({ resumes: 0, interviews: 0, quizzes: 0, avgScore: 0, roadmapProgress: 0 });
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([
    { month: 'Jan', skills: 40, confidence: 30 },
    { month: 'Feb', skills: 55, confidence: 45 },
    { month: 'Mar', skills: 60, confidence: 55 },
    { month: 'Apr', skills: 75, confidence: 70 },
    { month: 'May', skills: 85, confidence: 80 },
  ]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recentInterviews, setRecentInterviews] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // States for notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Helper actions for notifications
  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('dashboard_notifications', JSON.stringify(updated));
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('dashboard_notifications', JSON.stringify(updated));
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('dashboard_notifications', JSON.stringify(updated));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('dashboard_notifications', JSON.stringify([]));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Load and check dynamic interview event notifications
  useEffect(() => {
    const checkScheduledNotifications = () => {
      const savedEvents = localStorage.getItem('interview_events');
      const savedNotifications = localStorage.getItem('dashboard_notifications');

      let events: any[] = [];
      try {
        events = savedEvents ? JSON.parse(savedEvents) : [];
      } catch (e) {
        console.error("Error parsing events: ", e);
      }

      let notifs: any[] = [];
      try {
        notifs = savedNotifications ? JSON.parse(savedNotifications) : [];
      } catch (e) {
        console.error("Error parsing notifications: ", e);
      }

      const now = new Date();
      let updated = false;

      events.forEach((ev: any) => {
        if (!ev.date || !ev.time) return;

        // Match standard ISO timezone parsing or simple string comparison
        const eventTimeStr = ev.time || '00:00';
        const eventDateTime = new Date(`${ev.date}T${eventTimeStr}:00`);

        // If event date/time has arrived or has passed, trigger notification
        if (eventDateTime <= now) {
          const notifyId = `notify-${ev.id}`;
          const alreadyExists = notifs.some(n => n.id === notifyId);

          if (!alreadyExists) {
            const newNotif = {
              id: notifyId,
              title: "Scheduled Plan Started! 🚀",
              message: `Your scheduled ${ev.type} interview for the "${ev.role}" role at ${ev.company} starts now (${ev.time}). Good luck!`,
              company: ev.company,
              role: ev.role,
              type: ev.type,
              scheduledTime: `${ev.date} ${ev.time}`,
              createdAt: Date.now(),
              read: false
            };
            notifs.unshift(newNotif);
            updated = true;

            // Optional: trigger synthetic sound bell chime
            try {
              const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
              if (AudioCtx) {
                const ctx = new AudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.8);
              }
            } catch (err) {
              console.warn(err);
            }
          }
        }
      });

      if (updated || !savedNotifications) {
        localStorage.setItem('dashboard_notifications', JSON.stringify(notifs));
      }
      setNotifications(notifs);
    };

    checkScheduledNotifications();
    const notificationInterval = setInterval(checkScheduledNotifications, 10000); // Check every 10 seconds

    return () => clearInterval(notificationInterval);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            if (data && !data.error) setStats(data);
          }
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    const fetchInterviews = async () => {
      try {
        const res = await fetch('/api/interviews', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            if (data && Array.isArray(data)) {
              setRecentInterviews(data.slice(0, 5));
              const chartData = data.slice(0, 7).reverse().map((item: any, i: number) => ({
                name: `Int ${i + 1}`,
                score: item.score
              }));
              setPerformanceData(chartData);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching interviews:", err);
      }
    };

    const fetchRecommendations = async () => {
      setLoadingRecs(true);
      try {
        // Migration to server-side AI for security and best practices
        const res = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ skills: user?.skills || [] })
        });

        if (res.ok) {
          const data = await res.json();
          setRecommendations(data);
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoadingRecs(false);
      }
    };

    const fetchGrowthData = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
        const [intRes, quizRes] = await Promise.all([
          fetch('/api/interviews', { headers }),
          fetch('/api/quizzes', { headers })
        ]);

        let interviewsList: any[] = [];
        let quizzesList: any[] = [];

        if (intRes.ok) {
          const data = await intRes.json();
          if (Array.isArray(data)) {
            interviewsList = data;
          }
        }
        if (quizRes.ok) {
          const data = await quizRes.json();
          if (Array.isArray(data)) {
            quizzesList = data;
          }
        }

        // Combine into chronological array of events
        const combined = [
          ...interviewsList.map(item => ({
            date: new Date(item.createdAt),
            score: Number(item.score || 0),
            type: 'Interview'
          })),
          ...quizzesList.map(item => ({
            date: new Date(item.createdAt),
            score: item.total > 0 ? Math.round((Number(item.score || 0) / Number(item.total || 1)) * 100) : 0,
            type: 'Quiz'
          }))
        ];

        // Sort ascending by date
        combined.sort((a, b) => a.date.getTime() - b.date.getTime());

        if (combined.length > 0) {
          let runningTotal = 0;
          const mappedGrowth = combined.map((entry, index) => {
            runningTotal += entry.score;
            const proficiency = Math.round(runningTotal / (index + 1));
            const dateStr = entry.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            return {
              name: dateStr,
              skills: proficiency,
              type: entry.type,
              score: entry.score
            };
          });
          setGrowthData(mappedGrowth);
        } else {
          // Illustrative fallback if there's no data
          setGrowthData([
            { name: 'Baseline', skills: 45, type: 'Baseline', score: 45 },
            { name: 'Drill 1', skills: 55, type: 'Quiz', score: 65 },
            { name: 'Drill 2', skills: 65, type: 'Interview', score: 75 },
            { name: 'Skill Quiz', skills: 72, type: 'Quiz', score: 80 },
            { name: 'Mock Int', skills: 85, type: 'Interview', score: 92 },
          ]);
        }
      } catch (err) {
        console.error("Error fetching growth data:", err);
      }
    };

    fetchStats();
    fetchInterviews();
    fetchRecommendations();
    fetchGrowthData();
  }, [user]);

  const skillData = useMemo(() => {
    const rawSkills = user?.skills || [];
    const targetRoleName = user?.targetRole || 'Software Professional';

    // Categorize role to provide appropriate default skills if none exist
    const isTechRole = /software|developer|engineer|coder|architect|programmer|ai|web|backend|frontend|data|cloud|devops|qa/i.test(targetRoleName);
    const isDesignRole = /designer|ux|ui|product|creative|motion|graphic/i.test(targetRoleName);
    const isManagementRole = /manager|lead|director|product manager|agile|scrum|operations|hr/i.test(targetRoleName);

    let baseSkills: any[] = [...rawSkills];
    if (baseSkills.length === 0) {
      if (isTechRole) {
        baseSkills = [
          { name: 'System Design', level: 65 },
          { name: 'Data Structures', level: 75 },
          { name: 'API Engineering', level: 70 },
          { name: 'Database Dev', level: 60 },
          { name: 'Cloud Infrastructure', level: 55 },
          { name: 'Communication', level: 80 }
        ];
      } else if (isDesignRole) {
        baseSkills = [
          { name: 'User Experience (UX)', level: 70 },
          { name: 'Interface Design (UI)', level: 75 },
          { name: 'Prototyping', level: 65 },
          { name: 'Design Systems', level: 60 },
          { name: 'User Research', level: 50 },
          { name: 'Communication', level: 85 }
        ];
      } else if (isManagementRole) {
        baseSkills = [
          { name: 'Product Strategy', level: 68 },
          { name: 'Agile & Scrum', level: 80 },
          { name: 'Team Leadership', level: 72 },
          { name: 'Metrics & Analytics', level: 60 },
          { name: 'Stakeholder Focus', level: 55 },
          { name: 'Communication', level: 90 }
        ];
      } else {
        baseSkills = [
          { name: 'Domain Knowledge', level: 70 },
          { name: 'Problem Solving', level: 75 },
          { name: 'Technical Literacy', level: 60 },
          { name: 'Professional Poise', level: 80 },
          { name: 'Strategic Planning', level: 65 },
          { name: 'Communication', level: 85 }
        ];
      }
    }

    return baseSkills.map((skill: any) => {
      let name = '';
      let currentLevel = 50;

      if (typeof skill === 'object' && skill?.name) {
        name = skill.name;
        currentLevel = skill.level || 50;
      } else {
        name = String(skill);
        // Fallback for string-based legacy skills
        let hash = 0;
        for (let i = 0; i < (name || '').length; i++) {
          hash = (name || '').charCodeAt(i) + ((hash << 5) - hash);
        }
        currentLevel = 60 + (Math.abs(hash) % 30);
      }

      // Determine standard benchmarks dynamically but deterministically based on skill name
      const lowerName = name.toLowerCase();
      let standard = 80;

      if (lowerName.includes('communication') || lowerName.includes('poise') || lowerName.includes('stakeholder')) {
        standard = isManagementRole ? 92 : 82;
      } else if (lowerName.includes('system') || lowerName.includes('architect') || lowerName.includes('engineering')) {
        standard = isTechRole ? 88 : 72;
      } else if (lowerName.includes('structure') || lowerName.includes('data') || lowerName.includes('database') || lowerName.includes('cloud')) {
        standard = isTechRole ? 84 : 68;
      } else if (lowerName.includes('ux') || lowerName.includes('ui') || lowerName.includes('design') || lowerName.includes('prototyping')) {
        standard = isDesignRole ? 88 : 70;
      } else if (lowerName.includes('strategy') || lowerName.includes('agile') || lowerName.includes('leadership')) {
        standard = isManagementRole ? 88 : 74;
      } else {
        // Deterministic fallback (between 76 and 88)
        let sum = 0;
        for (let i = 0; i < name.length; i++) {
          sum += name.charCodeAt(i);
        }
        standard = 76 + (sum % 13);
      }

      return {
        name,
        current: currentLevel,
        standard
      };
    });
  }, [user?.skills, user?.targetRole]);

  return (
    <div className="p-8 space-y-8 min-h-screen bg-warm-bg dark:bg-stone-950">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-6">
          {user?.avatar && (
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white dark:border-stone-800 shadow-xl">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-warm-text dark:text-white mb-2 tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-warm-secondary font-medium uppercase tracking-widest text-xs opacity-70">Strategic Professional Hub Ready</p>

              <div className="flex items-center gap-3 ml-2">
                {user?.socialLinks?.github && (
                  <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-warm-hint hover:text-black dark:hover:text-white transition-colors" title="GitHub Profile">
                    <Github size={16} />
                  </a>
                )}
                {user?.socialLinks?.linkedin && (
                  <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-warm-hint hover:text-[#0077b5] transition-colors" title="LinkedIn Profile">
                    <Linkedin size={16} />
                  </a>
                )}
                {user?.socialLinks?.portfolio && (
                  <a href={user.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="text-warm-hint hover:text-brand-purple transition-colors" title="Portfolio Website">
                    <Globe size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Overall Readiness', value: `${stats?.avgScore ?? 0}%`, icon: Target, color: 'brand-purple' },
          { label: 'Interviews Done', value: (stats?.interviews ?? 0).toString(), icon: Video, color: 'brand-amber' },
          { label: 'Resumes Analyzed', value: (stats?.resumes ?? 0).toString(), icon: FileText, color: 'brand-purple' },
          { label: 'Quizzes Taken', value: (stats?.quizzes ?? 0).toString(), icon: Brain, color: 'emerald' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-3d p-6 relative overflow-hidden"
          >
            <div className={`w-10 h-10 rounded-xl bg-${stat.color === 'emerald' ? 'emerald-500/10' : stat.color === 'brand-purple' ? 'badge-purple' : 'badge-amber'} flex items-center justify-center text-${stat.color === 'brand-purple' ? 'brand-purple' : stat.color === 'brand-amber' ? 'brand-amber' : 'emerald-600'} mb-4`}>
              <stat.icon size={20} />
            </div>
            <p className="text-xs text-warm-secondary font-black uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-warm-text dark:text-white tracking-tighter">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-3d p-8">
              <h3 className="text-lg font-bold text-warm-text dark:text-white mb-4">Success Roadmap</h3>
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 flex items-center justify-center animate-pulse-slow">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-warm-bg dark:text-stone-800" />
                    <motion.circle
                      cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                      className="text-brand-purple"
                      strokeDasharray={251.2}
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 - (251.2 * (stats.roadmapProgress || 0)) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <span className="absolute text-xl font-black text-warm-text dark:text-white">{stats.roadmapProgress || 0}%</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-warm-text dark:text-white mb-1">Career Success Map</p>
                  <p className="text-xs text-warm-secondary mb-3 font-medium">Dynamic, interactive milestone track</p>
                  <button onClick={() => navigate('/careermap')} className="text-xs font-black uppercase tracking-widest text-brand-purple hover:bg-badge-purple px-4 py-2 rounded-xl transition-all border border-brand-purple/10 cursor-pointer">Open Success Map</button>
                </div>
              </div>
            </div>

            <div className="card-3d p-8 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-lg font-bold text-warm-text dark:text-white">Growth Timeline</h3>
                  <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                    Active Progress
                  </span>
                </div>
                <p className="text-xs text-warm-secondary mb-4 leading-normal">
                  Overall progress calculated from interview performance and skill assessments.
                </p>
              </div>
              <div className="h-[120px] w-full mt-2 min-w-0 min-h-0">
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={growthData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="opacity-30 dark:opacity-10" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#78716C', fontSize: 9, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#78716C', fontSize: 9, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #DDD5C8',
                        boxShadow: '0 8px 16px -4px rgb(0 0 0 / 0.1)',
                        background: '#FFFFFF',
                        color: '#1C1917',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                      formatter={(value: any, name: string, props: any) => {
                        const scoreVal = props?.payload?.score;
                        const typeVal = props?.payload?.type;
                        if (name === 'skills') {
                          return [`${value}% (${typeVal}: ${scoreVal}%)`, 'Overall Skill Index'];
                        }
                        return [value, name];
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="skills"
                      stroke="#4F378B"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#4F378B', strokeWidth: 1 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 text-[10px] text-warm-secondary font-extrabold uppercase tracking-widest italic flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-brand-purple animate-ping" />
                Dynamic progression index active
              </p>
            </div>
          </div>

          <div className="card-3d p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-warm-text dark:text-white italic uppercase tracking-tight">Competency Architecture</h3>
                <p className="text-xs text-warm-secondary dark:text-stone-400 mt-1 font-semibold">
                  Benchmarked for <span className="text-brand-purple font-black uppercase tracking-wider">{user?.targetRole || 'Software Professional'}</span>
                </p>
              </div>
              <button
                onClick={() => navigate('/skills', { state: { mode: 'skillgap' } })}
                className="text-xs font-black uppercase tracking-widest text-brand-purple hover:underline transition-all"
              >
                Detailed Analysis
              </button>
            </div>
            <div className="h-[400px] w-full min-w-0 min-h-0">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                  <PolarGrid stroke="#DDD5C8" className="opacity-50 dark:opacity-20" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#78716C', fontSize: 11, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Your Level"
                    dataKey="current"
                    stroke="#4F378B"
                    fill="#4F378B"
                    fillOpacity={0.25}
                  />
                  <Radar
                    name="Industry Standard"
                    dataKey="standard"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.12}
                    strokeDasharray="4 4"
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: '1px solid #DDD5C8', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: '#FFFFFF', color: '#1C1917' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-3d p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-warm-text dark:text-white italic uppercase tracking-tight">Curated Learning Paths</h3>
              <button onClick={() => navigate('/skills')} className="text-brand-purple font-black uppercase tracking-widest text-xs hover:underline">Learning Hub</button>
            </div>
            {loadingRecs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-brand-purple mr-2" size={20} />
                <span className="text-warm-secondary font-black uppercase tracking-widest text-[10px]">Assembling intelligence...</span>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => navigate('/skills', { state: { subject: item.title, mode: 'roadmap' } })}
                    className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-warm-border/50 dark:border-stone-800 flex items-center gap-4 group cursor-pointer hover:border-brand-purple transition-all border-l-4 border-l-brand-purple shadow-sm hover:shadow-md"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-badge-purple flex items-center justify-center text-brand-purple`}>
                      <Map size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-warm-text dark:text-white group-hover:text-brand-purple transition-colors text-sm">{item.title}</h4>
                      <p className="text-[10px] uppercase font-black text-warm-hint tracking-widest mt-1">
                        {item.level} • {item.duration}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-warm-hint group-hover:text-brand-purple" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-stone-900/50 rounded-2xl border-2 border-dashed border-warm-border/50">
                <p className="font-black uppercase tracking-widest text-[10px] text-warm-hint italic">Upload resume for personalized intelligence</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="card-3d p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-warm-text dark:text-white italic uppercase tracking-tight">Market Matches</h3>
              <button onClick={() => navigate('/careers')} className="text-brand-purple font-black uppercase tracking-widest text-xs hover:underline">Explore All</button>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Frontend Engineer', type: 'Full-time', company: 'TechFlow', match: 95 },
                { title: 'UX Intern', type: 'Internship', company: 'DesignCo', match: 88 }
              ].map((job, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-warm-bg/30 dark:bg-stone-950 border border-warm-border/30 dark:border-stone-800 hover:border-brand-purple/50 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm text-warm-text dark:text-white group-hover:text-brand-purple">{job.title}</h4>
                    <span className="text-[10px] font-black bg-badge-purple dark:bg-brand-purple/30 text-brand-purple px-3 py-1 rounded-lg border border-brand-purple/10">{job.match}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-warm-hint">
                    <span className="flex items-center gap-1.5"><Briefcase size={10} className="text-brand-purple" /> {job.company}</span>
                    <span className="bg-white dark:bg-stone-900 px-2.5 py-1 rounded-lg border border-warm-border/50 dark:border-stone-800">{job.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand-purple rounded-[40px] p-8 text-white shadow-2xl shadow-brand-purple/30 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <h3 className="text-xl font-bold mb-4 relative z-10 text-white italic tracking-tight uppercase">Performance Velocity</h3>
            <div className="h-[150px] relative z-10 w-full min-w-0 min-h-0">
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={performanceData.length > 0 ? performanceData : [{ name: 'N/A', score: 0 }]}>
                  <Line type="monotone" dataKey="score" stroke="#fff" strokeWidth={4} dot={{ r: 5, fill: '#fff', stroke: '#4F378B', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <button
              onClick={() => navigate('/interview')}
              className="mt-6 w-full py-4 bg-white text-brand-purple rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/90 transition-all shadow-xl relative z-10"
            >
              Initiate Diagnostic
            </button>
          </div>

          <div className="card-3d p-8">
            <h3 className="text-lg font-bold text-warm-text dark:text-white mb-6 italic uppercase tracking-tight">Recent Sessions</h3>
            <div className="space-y-4">
              {recentInterviews.length > 0 ? (
                recentInterviews.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-badge-purple/30 dark:hover:bg-stone-950 transition-all border border-transparent hover:border-brand-purple/10 group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'Technical' ? 'bg-indigo-500/10 text-indigo-500' :
                          item.type === 'Coding' ? 'bg-brand-amber/10 text-brand-amber' :
                            'bg-brand-purple/10 text-brand-purple'
                        }`}>
                        {item.type === 'Technical' ? <Brain size={18} /> : item.type === 'Coding' ? <Code size={18} /> : <Users size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-warm-text dark:text-stone-200 group-hover:text-brand-purple transition-colors">{item.type}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-warm-hint">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-brand-purple">{item.score}%</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-warm-hint">Rating</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-warm-bg/30 dark:bg-stone-900 rounded-3xl border border-dashed border-warm-border/50">
                  <Video size={40} className="mx-auto text-warm-hint mb-4 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-warm-hint italic">No session history detected</p>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/results')}
              className="mt-8 w-full py-3 text-xs font-black uppercase tracking-widest text-brand-purple hover:bg-badge-purple dark:hover:bg-brand-purple/20 rounded-xl transition-all border border-brand-purple/10"
            >
              Analyze Full History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
