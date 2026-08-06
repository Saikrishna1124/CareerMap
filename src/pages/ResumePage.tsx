import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, Award, Clock, ChevronRight, Trash2, Briefcase, GraduationCap, Wand2, Download, ArrowUpRight, TrendingUp, RotateCcw, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from '../components/Tooltip';

import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';

export const ResumePage: React.FC = () => {
  const { user, fetchMe } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<{ data: string, mimeType: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Improved resume generation states
  const [isGeneratingImproved, setIsGeneratingImproved] = useState(false);
  const [improvedResult, setImprovedResult] = useState<any>(null);
  const [genProgress, setGenProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'alert'>('success');

  const showToast = (msg: string, type: 'success' | 'alert' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4500);
  };

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
    setImprovedResult(null); // Reset improved resume when re-analyzing
    
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

  // Generate improved resume based on tips
  const handleGenerateImproved = async () => {
    if (!result) return;
    setIsGeneratingImproved(true);
    setGenProgress(0);
    setImprovedResult(null);

    const progressInterval = setInterval(() => {
      setGenProgress(prev => Math.min(prev + 3, 92));
    }, 300);

    try {
      const res = await fetch('/api/generate-improved-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          resumeText,
          resumeFile,
          tips: result.tips,
          profileData: {
            ...result?.profileData,
            name: (result?.profileData?.name && result?.profileData?.name !== 'Member' && result?.profileData?.name !== 'string') ? result.profileData.name : user?.name,
            email: user?.email
          },
          score: result.score,
          skills: result.skills
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Failed to generate improved resume');
      }

      const data = await res.json();
      setImprovedResult(data);
      showToast('✅ Improved resume generated successfully!');
    } catch (err: any) {
      console.error('Error generating improved resume:', err);
      showToast(`Generation failed: ${err.message}`, 'alert');
    } finally {
      clearInterval(progressInterval);
      setGenProgress(100);
      setIsGeneratingImproved(false);
    }
  };

  // Generate ATS-friendly PDF resume
  const handleDownloadResume = () => {
    const rd = improvedResult?.resumeData;
    if (!rd) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 50;
    const contentW = pageW - margin * 2;
    let y = 50;

    const checkPage = (needed: number) => {
      if (y + needed > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        y = 50;
      }
    };

    const drawSectionLine = () => {
      doc.setDrawColor(60, 60, 60);
      doc.setLineWidth(0.8);
      doc.line(margin, y, pageW - margin, y);
      y += 10;
    };

    const drawSectionHeader = (title: string) => {
      checkPage(30);
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text(title.toUpperCase(), margin, y);
      y += 6;
      drawSectionLine();
    };

    const wrapText = (text: string, fontSize: number, maxW: number, font = 'helvetica', style = 'normal'): string[] => {
      doc.setFont(font, style);
      doc.setFontSize(fontSize);
      return doc.splitTextToSize(text, maxW);
    };

    // === NAME ===
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 30, 30);
    doc.text(rd.name || 'Professional', pageW / 2, y, { align: 'center' });
    y += 22;

    // === TITLE ===
    if (rd.title) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(rd.title, pageW / 2, y, { align: 'center' });
      y += 16;
    }

    // === CONTACT LINE ===
    const contactParts = [rd.email, rd.phone, rd.location, rd.linkedin].filter(Boolean);
    if (contactParts.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(contactParts.join('  |  '), pageW / 2, y, { align: 'center' });
      y += 14;
    }

    drawSectionLine();

    // === PROFESSIONAL SUMMARY ===
    if (rd.summary) {
      drawSectionHeader('Professional Summary');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      const lines = wrapText(rd.summary, 10, contentW);
      lines.forEach((line: string) => {
        checkPage(14);
        doc.text(line, margin, y);
        y += 14;
      });
      y += 4;
    }

    // === SKILLS ===
    if (rd.skillCategories?.length > 0) {
      drawSectionHeader('Technical Skills');
      rd.skillCategories.forEach((cat: any) => {
        checkPage(16);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        const label = `${cat.category}: `;
        doc.text(label, margin, y);
        const labelW = doc.getTextWidth(label);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const skillsText = (cat.skills || []).join(', ');
        const skillLines = wrapText(skillsText, 10, contentW - labelW);
        skillLines.forEach((sl: string, si: number) => {
          checkPage(14);
          doc.text(sl, margin + (si === 0 ? labelW : 0), y);
          y += 14;
        });
      });
      y += 4;
    }

    // === EXPERIENCE ===
    if (rd.experience?.length > 0) {
      drawSectionHeader('Professional Experience');
      rd.experience.forEach((exp: any) => {
        checkPage(30);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 30);
        doc.text(exp.role || '', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(exp.period || '', pageW - margin, y, { align: 'right' });
        y += 15;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(70, 70, 70);
        const compLine = [exp.company, exp.location].filter(Boolean).join('  |  ');
        doc.text(compLine, margin, y);
        y += 14;

        (exp.bullets || []).forEach((bullet: string) => {
          const bulletLines = wrapText(bullet, 10, contentW - 14);
          bulletLines.forEach((bl: string, bi: number) => {
            checkPage(14);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(50, 50, 50);
            if (bi === 0) {
              doc.text('\u2022', margin + 4, y);
              doc.text(bl, margin + 14, y);
            } else {
              doc.text(bl, margin + 14, y);
            }
            y += 14;
          });
        });
        y += 6;
      });
    }

    // === EDUCATION ===
    if (rd.education?.length > 0) {
      drawSectionHeader('Education');
      rd.education.forEach((edu: any) => {
        checkPage(30);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(30, 30, 30);
        doc.text(edu.degree || '', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(edu.year || '', pageW - margin, y, { align: 'right' });
        y += 14;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(70, 70, 70);
        const eduLine = [edu.school, edu.gpa ? `GPA: ${edu.gpa}` : ''].filter(Boolean).join('  |  ');
        doc.text(eduLine, margin, y);
        y += 18;
      });
    }

    // === PROJECTS ===
    if (rd.projects?.length > 0) {
      drawSectionHeader('Projects');
      rd.projects.forEach((proj: any) => {
        checkPage(30);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(30, 30, 30);
        doc.text(proj.name || '', margin, y);
        if (proj.tech) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(`[${proj.tech}]`, margin + doc.getTextWidth(proj.name + '  '), y);
        }
        y += 14;
        (proj.bullets || []).forEach((bullet: string) => {
          const bulletLines = wrapText(bullet, 10, contentW - 14);
          bulletLines.forEach((bl: string, bi: number) => {
            checkPage(14);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(50, 50, 50);
            doc.text(bi === 0 ? '\u2022' : '', margin + 4, y);
            doc.text(bl, margin + 14, y);
            y += 14;
          });
        });
        y += 6;
      });
    }

    // === CERTIFICATIONS ===
    if (rd.certifications?.length > 0) {
      drawSectionHeader('Certifications');
      rd.certifications.forEach((cert: string) => {
        checkPage(14);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.text('\u2022  ' + cert, margin, y);
        y += 14;
      });
    }

    const fileName = `${(rd.name || 'resume').replace(/\s+/g, '-').toLowerCase()}-improved-resume.pdf`;
    doc.save(fileName);
    showToast('\ud83d\udcc4 ATS-friendly PDF resume downloaded!');
  };

  // Copy resume summary to clipboard
  const handleCopyResume = async () => {
    const rd = improvedResult?.resumeData;
    if (!rd) return;
    try {
      const textVersion = [
        rd.name, rd.title, '',
        'SUMMARY', rd.summary, '',
        'SKILLS', ...(rd.skillCategories || []).map((c: any) => `${c.category}: ${c.skills.join(', ')}`), '',
        'EXPERIENCE', ...(rd.experience || []).flatMap((e: any) => [
          `${e.role} at ${e.company} (${e.period})`,
          ...(e.bullets || []).map((b: string) => `  • ${b}`), ''
        ]),
        'EDUCATION', ...(rd.education || []).map((e: any) => `${e.degree} - ${e.school} (${e.year})`)
      ].join('\n');
      await navigator.clipboard.writeText(textVersion);
      setCopied(true);
      showToast('\ud83d\udccb Resume copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy to clipboard', 'alert');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 min-h-screen">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border max-w-md ${
              toastType === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900/50'
                : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-900/50'
            }`}
          >
            {toastType === 'success'
              ? <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
              : <AlertCircle className="text-rose-500 shrink-0" size={18} />}
            <span className="text-xs font-semibold leading-relaxed tracking-tight">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

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

                  {/* Generate Improved Resume Button */}
                  <div className="mt-8 pt-6 border-t border-warm-border dark:border-stone-800">
                    <div className="flex items-start gap-4 mb-5 p-4 bg-gradient-to-r from-brand-purple/5 to-brand-amber/5 rounded-2xl border border-brand-purple/10">
                      <div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center shrink-0">
                        <Wand2 size={20} className="text-brand-purple" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-warm-text dark:text-white">AI Auto-Improve</p>
                        <p className="text-xs text-warm-muted dark:text-stone-400 mt-0.5 leading-relaxed">
                          Let AI automatically apply all the improvement tips above and generate an upgraded, ATS-optimized version of your resume — ready to download.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateImproved}
                      disabled={isGeneratingImproved || !!improvedResult}
                      className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg ${
                        improvedResult
                          ? 'bg-emerald-600 text-white shadow-emerald-600/20 cursor-default'
                          : isGeneratingImproved
                            ? 'bg-brand-purple/70 text-white shadow-brand-purple/10 cursor-wait'
                            : 'bg-brand-purple text-white shadow-brand-purple/20 hover:bg-brand-purple/90 hover:-translate-y-0.5'
                      }`}
                    >
                      {improvedResult ? (
                        <><CheckCircle2 size={16} /> Improved Resume Generated — View Below</>
                      ) : isGeneratingImproved ? (
                        <><Loader2 size={16} className="animate-spin" /> AI is Rewriting Your Resume...</>
                      ) : (
                        <><Wand2 size={16} /> Generate Improved Resume with AI</>
                      )}
                    </button>

                    {isGeneratingImproved && (
                      <div className="mt-4">
                        <div className="w-full bg-warm-bg dark:bg-stone-800 rounded-full h-2 overflow-hidden border border-warm-border/50">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${genProgress}%` }}
                            className="h-full bg-gradient-to-r from-brand-purple to-brand-amber"
                          />
                        </div>
                        <p className="text-[10px] text-warm-hint text-center mt-2 font-bold uppercase tracking-widest">
                          Applying {(result?.tips || []).length} improvement tips...
                        </p>
                      </div>
                    )}
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

      {/* AI Improved Resume Preview Panel */}
      <AnimatePresence>
        {improvedResult && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* Score Comparison Header */}
            <div className="bg-gradient-to-r from-brand-purple via-brand-purple/90 to-brand-amber rounded-3xl p-8 text-white shadow-2xl shadow-brand-purple/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <Wand2 size={20} />
                  <span className="text-xs font-black uppercase tracking-widest opacity-80">AI-Generated Improved Resume</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Before Score */}
                  <div className="text-center p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Original Score</p>
                    <p className="text-4xl font-black">{result?.score || 0}<span className="text-lg opacity-60">%</span></p>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-[2px] bg-white/30" />
                      <TrendingUp size={28} className="text-white animate-pulse" />
                      <div className="w-12 h-[2px] bg-white/30" />
                    </div>
                  </div>

                  {/* After Score */}
                  <div className="text-center p-5 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Improved Score</p>
                    <p className="text-4xl font-black">{improvedResult.estimatedNewScore || 90}<span className="text-lg opacity-60">%</span></p>
                  </div>
                </div>

                <p className="text-center mt-6 text-sm font-bold opacity-80">
                  +{(improvedResult.estimatedNewScore || 90) - (result?.score || 0)} point improvement from {(result?.tips || []).length} applied tips
                </p>
              </div>
            </div>

            {/* Key Improvements */}
            {(improvedResult.keyImprovements || []).length > 0 && (
              <div className="card-3d p-6">
                <h3 className="font-bold text-warm-text dark:text-white mb-5 flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-500" />
                  Key Improvements Made
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(improvedResult.keyImprovements || []).map((improvement: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-200/30 dark:border-emerald-800/30">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-warm-text dark:text-stone-300">{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Changes Summary */}
            {(improvedResult.changesSummary || []).length > 0 && (
              <div className="card-3d p-6">
                <h3 className="font-bold text-warm-text dark:text-white mb-5 flex items-center gap-2">
                  <Sparkles size={18} className="text-brand-amber" />
                  What Was Changed
                </h3>
                <div className="space-y-2">
                  {(improvedResult.changesSummary || []).map((change: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-warm-muted dark:text-stone-400">
                      <div className="w-5 h-5 rounded-lg bg-brand-purple/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[9px] font-black text-brand-purple">{i + 1}</span>
                      </div>
                      <span className="leading-relaxed">{change}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resume-Style Preview */}
            <div className="card-3d p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-warm-text dark:text-white flex items-center gap-2">
                  <FileText size={18} className="text-brand-purple" />
                  Your Improved Resume Preview
                </h3>
                <div className="flex gap-2">
                  <Tooltip content={copied ? "Copied!" : "Copy to Clipboard"} position="top">
                    <button onClick={handleCopyResume} className="flex items-center gap-1.5 px-3 py-2 bg-warm-bg dark:bg-stone-800 border border-warm-border dark:border-stone-700 rounded-xl text-[10px] font-bold uppercase tracking-wider text-warm-secondary hover:text-brand-purple transition-all">
                      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </Tooltip>
                  <button onClick={handleDownloadResume} className="flex items-center gap-1.5 px-4 py-2 bg-brand-purple text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-brand-purple/90 transition-all shadow-md shadow-brand-purple/20">
                    <Download size={13} /> Download PDF
                  </button>
                </div>
              </div>

              {/* Resume Card */}
              {(() => {
                const rd = improvedResult?.resumeData;
                if (!rd) return <p className="text-warm-hint text-sm text-center py-8">No resume data generated.</p>;
                return (
                  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-warm-border dark:border-stone-800 p-10 max-h-[700px] overflow-y-auto customize-scrollbar shadow-inner" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                    {/* Name & Title */}
                    <div className="text-center border-b-2 border-stone-300 dark:border-stone-600 pb-5 mb-5">
                      <h2 className="text-2xl font-bold text-stone-900 dark:text-white tracking-wide">{rd.name}</h2>
                      {rd.title && <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 tracking-wider uppercase">{rd.title}</p>}
                      {[rd.email, rd.phone, rd.location, rd.linkedin].filter(Boolean).length > 0 && (
                        <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">
                          {[rd.email, rd.phone, rd.location, rd.linkedin].filter(Boolean).join('  •  ')}
                        </p>
                      )}
                    </div>

                    {/* Summary */}
                    {rd.summary && (
                      <div className="mb-5">
                        <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-[0.2em] border-b border-stone-200 dark:border-stone-700 pb-1 mb-3">Professional Summary</h3>
                        <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{rd.summary}</p>
                      </div>
                    )}

                    {/* Skills */}
                    {rd.skillCategories?.length > 0 && (
                      <div className="mb-5">
                        <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-[0.2em] border-b border-stone-200 dark:border-stone-700 pb-1 mb-3">Technical Skills</h3>
                        <div className="space-y-2">
                          {rd.skillCategories.map((cat: any, i: number) => (
                            <p key={i} className="text-sm text-stone-600 dark:text-stone-400">
                              <span className="font-bold text-stone-800 dark:text-stone-200">{cat.category}:</span>{' '}
                              {(cat.skills || []).join(', ')}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {rd.experience?.length > 0 && (
                      <div className="mb-5">
                        <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-[0.2em] border-b border-stone-200 dark:border-stone-700 pb-1 mb-3">Professional Experience</h3>
                        <div className="space-y-4">
                          {rd.experience.map((exp: any, i: number) => (
                            <div key={i}>
                              <div className="flex justify-between items-baseline">
                                <span className="text-sm font-bold text-stone-900 dark:text-white">{exp.role}</span>
                                <span className="text-xs text-stone-400 shrink-0 ml-4">{exp.period}</span>
                              </div>
                              <p className="text-sm italic text-stone-500 dark:text-stone-400">{[exp.company, exp.location].filter(Boolean).join('  |  ')}</p>
                              <ul className="mt-2 space-y-1">
                                {(exp.bullets || []).map((b: string, j: number) => (
                                  <li key={j} className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed flex gap-2">
                                    <span className="shrink-0">•</span>
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {rd.education?.length > 0 && (
                      <div className="mb-5">
                        <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-[0.2em] border-b border-stone-200 dark:border-stone-700 pb-1 mb-3">Education</h3>
                        {rd.education.map((edu: any, i: number) => (
                          <div key={i} className="mb-2">
                            <div className="flex justify-between items-baseline">
                              <span className="text-sm font-bold text-stone-900 dark:text-white">{edu.degree}</span>
                              <span className="text-xs text-stone-400 shrink-0 ml-4">{edu.year}</span>
                            </div>
                            <p className="text-sm text-stone-500 dark:text-stone-400">{[edu.school, edu.gpa ? `GPA: ${edu.gpa}` : ''].filter(Boolean).join('  |  ')}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Projects */}
                    {rd.projects?.length > 0 && (
                      <div className="mb-5">
                        <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-[0.2em] border-b border-stone-200 dark:border-stone-700 pb-1 mb-3">Projects</h3>
                        {rd.projects.map((proj: any, i: number) => (
                          <div key={i} className="mb-3">
                            <span className="text-sm font-bold text-stone-900 dark:text-white">{proj.name}</span>
                            {proj.tech && <span className="text-xs text-stone-400 italic ml-2">[{proj.tech}]</span>}
                            <ul className="mt-1 space-y-1">
                              {(proj.bullets || []).map((b: string, j: number) => (
                                <li key={j} className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed flex gap-2">
                                  <span className="shrink-0">•</span><span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Certifications */}
                    {rd.certifications?.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-[0.2em] border-b border-stone-200 dark:border-stone-700 pb-1 mb-3">Certifications</h3>
                        <ul className="space-y-1">
                          {rd.certifications.map((cert: string, i: number) => (
                            <li key={i} className="text-sm text-stone-600 dark:text-stone-400 flex gap-2">
                              <span>•</span><span>{cert}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Action Footer */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => { setImprovedResult(null); handleGenerateImproved(); }}
                className="flex-1 py-4 bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-warm-secondary hover:text-brand-purple hover:border-brand-purple transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} /> Regenerate Resume
              </button>
              <button
                onClick={handleDownloadResume}
                className="flex-1 py-4 bg-brand-purple text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-purple/90 transition-all shadow-xl shadow-brand-purple/20"
              >
                <Download size={14} /> Download ATS-Friendly PDF
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
