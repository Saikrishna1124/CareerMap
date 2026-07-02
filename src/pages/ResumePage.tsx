import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, Award, Clock, ChevronRight, Trash2, Briefcase, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from '../components/Tooltip';

import { useAuth } from '../context/AuthContext';

export const ResumePage: React.FC = () => {
  const { user, fetchMe } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<{ data: string, mimeType: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/resumes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setHistory(data);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = (e.target?.result as string).split(',')[1];
      setResumeFile({ data: base64Data, mimeType: file.type });
      setResumeText(`[File Uploaded: ${file.name}]`);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    multiple: false
  } as any);

  const handleUpload = async () => {
    if (!resumeText && !resumeFile && !isUploading) return;
    setIsUploading(true);
    setProgress(0);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 90));
    }, 200);

    try {
      // Call server-side analysis
      const analysisRes = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ resumeText, resumeFile })
      });

      if (!analysisRes.ok) {
        const errorData = await analysisRes.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Identity verification failed or service unavailable');
      }

      const analysis = await analysisRes.json();
      
      // Update user profile automatically
      if (analysis.profileData) {
        await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...analysis.profileData,
            skills: analysis.skills,
            // Preserve existing info
            avatar: user?.avatar || null,
            socialLinks: user?.socialLinks || {}
          })
        });
        await fetchMe();
      }

      // Save to backend
      const saveRes = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: resumeText,
          score: analysis.score,
          skills: analysis.skills,
          tips: analysis.tips
        })
      });

      if (saveRes.ok) {
        const contentType = saveRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const { id } = await saveRes.json();
          setResult({ ...analysis, id });
          fetchHistory();
        }
      }
    } catch (err: any) {
      console.error("Error analyzing resume:", err);
      alert(`Optimization Error: ${err.message}\n\nTip: If you're uploading a large image, try a smaller file or copy-pasting the text.`);
    } finally {
      clearInterval(progressInterval);
      setProgress(100);
      setIsUploading(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!id) {
      console.error("No ID provided for deletion");
      alert("Error: Missing resume identifier");
      return;
    }

    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      console.log('User confirmed delete for resume ID:', deleteId);
      const res = await fetch(`/api/resumes/${deleteId}`, { 
        method: 'DELETE',
        headers: { 
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (res.ok) {
        console.log('Successfully deleted analysis:', deleteId, data);
        await fetchHistory();
        if (result?.id === deleteId) setResult(null);
        setDeleteId(null);
      } else {
        console.error('Delete operation failed on server:', res.status, data);
        alert(`Failed to delete: ${data.error || 'Server error'}`);
        setDeleteId(null);
      }
    } catch (err) {
      console.error("Network or execution error during delete:", err);
      alert('A technical error occurred while trying to delete.');
      setDeleteId(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-warm-text dark:text-white mb-2 tracking-tight italic">Resume Intelligence</h1>
          <p className="text-warm-muted font-medium">Identify gaps and optimize your profile for top-tier ATS systems.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
              isDragActive ? 'border-brand-purple bg-brand-purple/5' : 'border-warm-border dark:border-stone-800 hover:border-brand-purple/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 bg-badge-purple dark:bg-brand-purple/20 rounded-2xl flex items-center justify-center text-brand-purple mx-auto mb-6">
              <Upload size={32} />
            </div>
            <h3 className="text-xl font-bold text-warm-text dark:text-white mb-2">
              {isDragActive ? 'Drop it here' : 'Drop your resume'}
            </h3>
            <p className="text-warm-muted text-sm font-medium">PDF, DOCX (Max 5MB)</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-warm-border dark:border-stone-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-warm-bg dark:bg-stone-950 font-bold text-warm-hint uppercase tracking-widest text-[10px]">Or paste text</span>
            </div>
          </div>

          <div className="card-3d p-6">
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your professional experience here..."
              className="w-full h-48 bg-transparent border-none focus:ring-0 resize-none text-warm-text dark:text-stone-300 font-medium"
            />
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleUpload}
                disabled={!resumeText || isUploading}
                className="px-6 py-3 bg-brand-purple text-white rounded-xl font-bold hover:bg-brand-purple/90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-brand-purple/20"
              >
                {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                Analyze Profile
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="card-3d p-12 text-center"
              >
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <div className="absolute inset-0 border-4 border-brand-purple/20 rounded-full"></div>
                  <motion.div 
                    className="absolute inset-0 border-4 border-brand-purple rounded-full border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="text-brand-purple" size={32} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-warm-text dark:text-white mb-2">Analyzing Profile</h3>
                <p className="text-warm-muted font-medium mb-8 italic">Extracting industry-standard keywords...</p>
                <div className="w-full bg-warm-bg dark:bg-stone-800 rounded-full h-3 overflow-hidden border border-warm-border/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-brand-purple to-brand-amber"
                  />
                </div>
              </motion.div>
            ) : result ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-brand-purple to-brand-amber rounded-3xl p-8 text-white shadow-xl shadow-brand-purple/20">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-badge-purple/80 text-sm font-medium uppercase tracking-wider">Resume Score</p>
                      <h2 className="text-5xl font-bold">{result.score}%</h2>
                    </div>
                    <Award className="text-white/20" size={64} />
                  </div>
                  <div className="flex items-center gap-2 text-badge-purple/80 text-sm">
                    <CheckCircle2 size={16} />
                    Optimized for ATS systems
                  </div>
                </div>

                <div className="card-3d p-6">
                  <h3 className="font-bold text-warm-text dark:text-white mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-brand-amber" />
                    Extracted Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result?.skills?.map((skill: any, i: number) => {
                      const name = typeof skill === 'object' ? skill.name : skill;
                      const level = typeof skill === 'object' ? `${skill.level}%` : null;
                      return (
                        <span key={i} className="px-3 py-1 bg-badge-purple dark:bg-brand-purple/20 text-brand-purple dark:text-stone-300 rounded-lg text-sm font-medium flex items-center gap-1.5 border border-brand-purple/10">
                          {name}
                          {level && <span className="text-xs text-warm-muted dark:text-stone-400 font-black">({level})</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="card-3d p-6">
                  <h3 className="font-bold text-warm-text dark:text-white mb-6 flex items-center gap-2">
                    <Briefcase size={18} className="text-brand-purple" />
                    Extracted Experience
                  </h3>
                  <div className="space-y-6">
                    {result.profileData?.experience?.map((exp: any, i: number) => (
                      <div key={i} className="relative pl-6 border-l-2 border-warm-border dark:border-stone-800">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-stone-900 border-2 border-brand-purple" />
                        <h4 className="font-bold text-warm-text dark:text-white text-sm">{exp.role}</h4>
                        <p className="text-brand-purple dark:text-stone-300 text-xs font-bold mb-1">{exp.company} • {exp.period}</p>
                        <p className="text-warm-muted text-xs leading-relaxed">{exp.desc}</p>
                      </div>
                    ))}
                    {!result.profileData?.experience?.length && <p className="text-warm-hint text-xs italic text-center py-4">No experience extracted</p>}
                  </div>
                </div>

                <div className="card-3d p-6">
                  <h3 className="font-bold text-warm-text dark:text-white mb-6 flex items-center gap-2">
                    <GraduationCap size={18} className="text-brand-purple" />
                    Educational Background
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.profileData?.education?.map((edu: any, i: number) => (
                      <div key={i} className="p-5 bg-warm-bg dark:bg-stone-800/50 rounded-2xl border border-warm-border dark:border-stone-800 group hover:border-brand-purple/30 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div className="w-10 h-10 bg-badge-purple dark:bg-brand-purple/20 rounded-xl flex items-center justify-center text-brand-purple">
                            <GraduationCap size={20} />
                          </div>
                          <span className="shrink-0 text-xs font-black text-brand-purple dark:text-stone-300 bg-white dark:bg-stone-900 px-3 py-1 rounded-lg border border-warm-border dark:border-stone-700 shadow-sm">
                            {edu.year}
                          </span>
                        </div>
                        <h4 className="font-bold text-warm-text dark:text-white text-lg mb-1 leading-tight">{edu.school}</h4>
                        <p className="text-brand-purple dark:text-stone-300 text-sm font-bold">{edu.degree}</p>
                      </div>
                    ))}
                    {!result.profileData?.education?.length && (
                      <div className="col-span-full py-8 text-center bg-warm-bg/50 dark:bg-stone-900/50 rounded-2xl border-2 border-dashed border-warm-border/50">
                        <GraduationCap className="mx-auto text-warm-hint mb-2 opacity-20" size={32} />
                        <p className="text-warm-hint text-xs italic">No education extracted from profile</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-3d p-6">
                  <h3 className="font-bold text-warm-text dark:text-white mb-6 flex items-center gap-2">
                    <AlertCircle size={18} className="text-brand-amber" />
                    Improvement Tips
                  </h3>
                  <div className="space-y-6">
                    {Object.entries(
                      (result?.tips || []).reduce((acc: any, tip: any) => {
                        const category = typeof tip === 'string' ? 'General' : tip.category;
                        const text = typeof tip === 'string' ? tip : tip.text;
                        if (!acc[category]) acc[category] = [];
                        acc[category].push(text);
                        return acc;
                      }, {})
                    ).map(([category, tips]: [string, any], i: number) => (
                      <div key={i} className="space-y-3">
                        <h4 className="text-xs font-bold text-brand-purple uppercase tracking-widest">{category}</h4>
                        <ul className="space-y-3">
                          {tips.map((text: string, j: number) => (
                            <li key={j} className="flex gap-3 text-sm text-warm-muted dark:text-stone-400 leading-relaxed">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-purple mt-1.5 shrink-0" />
                              {text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-warm-border/50 dark:border-stone-800 rounded-3xl">
                <FileText className="text-warm-border mb-4" size={64} />
                <p className="text-warm-muted">Upload your resume to see the analysis here.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {history.length > 0 && (
        <div className="card-3d p-8">
          <h3 className="text-xl font-bold text-warm-text dark:text-white mb-6 flex items-center gap-2">
            <Clock size={20} className="text-brand-purple" /> Recent Analyses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <div 
                key={item.id} 
                onClick={() => {
                  setResult(item);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="card-3d p-6 cursor-pointer group hover:-translate-y-1 transition-transform relative"
              >
                <Tooltip content="Remove Analysis" position="left" className="absolute top-4 right-4 z-20">
                  <button 
                    type="button"
                    onClick={(e) => handleDelete(e, item.id)}
                    className="p-2 text-warm-hint hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </Tooltip>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-badge-purple dark:bg-brand-purple/20 flex items-center justify-center text-brand-purple">
                    <FileText size={20} />
                  </div>
                  <span className="text-lg font-bold text-brand-purple mr-8">{item.score}%</span>
                </div>
                <h4 className="font-bold text-warm-text dark:text-white mb-1 truncate">
                  {item.content.substring(0, 30)}...
                </h4>
                <p className="text-xs text-warm-muted mb-4">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
                <div className="flex items-center text-xs font-semibold text-brand-purple gap-1 group-hover:gap-2 transition-all">
                  View Detailed Analysis <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-8 shadow-2xl border border-warm-border dark:border-stone-800"
            >
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-warm-text dark:text-white mb-2">Delete Analysis?</h3>
              <p className="text-warm-muted dark:text-stone-400 text-sm mb-8 leading-relaxed">
                This action cannot be undone. This resume analysis will be permanently removed from your history.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-6 py-3 bg-warm-bg dark:bg-stone-800 text-warm-muted dark:text-stone-300 font-bold rounded-xl hover:bg-warm-border/50 dark:hover:bg-stone-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
