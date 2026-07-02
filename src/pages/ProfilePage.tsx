import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, Mail, Briefcase, GraduationCap, 
  Plus, Trash2, Save, Loader2, 
  CheckCircle2, Award, Github, Linkedin, Globe,
  Activity, Star, Camera
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
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
          {/* Radar Chart Section */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Activity size={120} className="text-indigo-600" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Star size={12} fill="currentColor" /> Skill Intelligence
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Skill Matrix</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                  Visualizing your current proficiency levels against industry standards. This matrix helps identify strengths and high-impact growth areas.
                </p>
                <div className="flex gap-4 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Current Level</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Industry Standard</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-[300px] md:w-[400px] min-w-0 min-h-0">
                {formData.skills.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={formData.skills.map(s => ({
                      subject: s.name,
                      A: s.level,
                      B: 80, // Industry Standard mock
                      fullMark: 100,
                    }))}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={false}
                        axisLine={false}
                      />
                      <Radar
                        name="Current"
                        dataKey="A"
                        stroke="#4f46e5"
                        fill="#4f46e5"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Standard"
                        dataKey="B"
                        stroke="#cbd5e1"
                        fill="#cbd5e1"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                    <Star size={32} className="mb-2 opacity-20" />
                    <p className="text-sm font-medium">Add skills to generate matrix</p>
                  </div>
                )}
              </div>
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
