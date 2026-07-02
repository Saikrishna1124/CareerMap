import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2, AlertCircle, Award,
  MessageSquare, Brain, Zap,
  ArrowRight, Download, Share2,
  TrendingUp, ShieldCheck, Loader2,
  Calendar, Clock, Check, ChevronRight,
  Search, BarChart4, ClipboardList, Target, BookOpen, Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDynamicSuggestedAnswer } from '../utils/interviewHelper';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface QuestionBreakdown {
  q: string;
  communicationScore: number;
  communicationFeedback: string;
  technicalScore: number;
  technicalFeedback: string;
  confidenceScore: number;
  confidenceFeedback: string;
  feedback: string;
}

interface InterviewResult {
  id: string;
  type: string;
  score: number;
  communication: number;
  technical: number;
  confidence: number;
  integrity: number;
  feedback: string;
  questions: any; // Can be string or array
  createdAt: string;
}

const renderFeedbackText = (feedback: any): React.ReactNode => {
  if (!feedback) return "";
  if (typeof feedback === 'string') {
    return feedback;
  }
  if (typeof feedback === 'object') {
    if ('good' in feedback || 'needsImprovement' in feedback) {
      return (
        <span className="block space-y-2">
          {feedback.good && (
            <span className="block text-slate-700 dark:text-slate-300">
              <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider text-[10px] block mb-0.5">What went well:</strong>
              {feedback.good}
            </span>
          )}
          {feedback.needsImprovement && (
            <span className="block text-slate-700 dark:text-slate-350">
              <strong className="text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider text-[10px] block mb-0.5">Needs improvement:</strong>
              {feedback.needsImprovement}
            </span>
          )}
        </span>
      );
    }
    return (
      <span className="block space-y-2">
        {Object.entries(feedback).map(([key, val]) => {
          if (typeof val === 'string' || typeof val === 'number') {
            const label = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase());
            return (
              <span key={key} className="block text-slate-700 dark:text-slate-300">
                <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-wider text-[10px] block mb-0.5">{label}:</strong>
                {val}
              </span>
            );
          }
          return null;
        })}
      </span>
    );
  }
  return String(feedback);
};

const statsContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
} as const;

const statsItemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 90,
      damping: 14,
      mass: 0.8
    }
  }
} as const;

export const ResultsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<InterviewResult[]>([]);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'selected' | 'analytics'>('selected');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(0);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const downloadPDFReport = async () => {
    if (!result) return;
    setIsDownloadingPDF(true);

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yOffset = 25;

      const checkPageOverflow = (heightNeeded: number) => {
        if (yOffset + heightNeeded > pageHeight - margin - 15) {
          doc.addPage();
          yOffset = 25; // Reset offset on new page
          return true;
        }
        return false;
      };

      // --- PAGE 1: HEADER & OVERALL TELEMETRY ---

      // Header Accent line
      doc.setFillColor(139, 92, 246); // Brand purple
      doc.rect(margin, yOffset, contentWidth, 2, 'F');
      yOffset += 10;

      // Brand context
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(139, 92, 246);
      doc.text('CAREERMAP PERFORMANCE LABORATORY', margin, yOffset);
      yOffset += 8;

      // Report Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(28, 25, 23); // very dark slate/stone
      doc.text('Evaluation Diagnostics Report', margin, yOffset);
      yOffset += 7;

      // Subtitle with role details
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(120, 113, 108); // stone-500
      const formattedDate = new Date(result.createdAt).toLocaleString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Role Target: ${result.type}  |  Session Date: ${formattedDate}`, margin, yOffset);
      yOffset += 15;

      // Outer Score Box Banner
      doc.setFillColor(245, 245, 244); // light stone-100 bg
      doc.roundedRect(margin, yOffset, contentWidth, 22, 3, 3, 'F');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(41, 37, 36);
      doc.text('Primary Rating Index Outcome:', margin + 8, yOffset + 14);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(28);
      // Determine score color (emerald or purple or dark)
      if (result.score >= 80) {
        doc.setTextColor(16, 185, 129); // emerald
      } else {
        doc.setTextColor(139, 92, 246); // purple
      }
      doc.text(`${result.score}%`, margin + contentWidth - 8, yOffset + 15, { align: 'right' });

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 113, 108);
      doc.text('(Passmark benchmark: 85%)', margin + contentWidth - 8, yOffset + 19, { align: 'right' });

      yOffset += 32;

      // Criteria Breakdown Header
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(28, 25, 23);
      doc.text('Core Telemetry Breakdown', margin, yOffset);
      yOffset += 8;

      const metrics = [
        { label: 'Technical Domain Score', value: result.technical, color: [59, 130, 246], text: 'Understands system limits, structural layers, data schemas, and API design.' },
        { label: 'Communication Clarity', value: result.communication, color: [79, 55, 139], text: 'Assesses explanation modularity, pace alignment, structure, and direct answers.' },
        { label: 'Emotional Presence Index', value: result.confidence, color: [139, 92, 246], text: 'Confidence quotient, speaking with composure, stability, and assertiveness.' },
        { label: 'Integrity Monitor Index', value: result.integrity, color: [16, 185, 129], text: 'Evaluates focus lock, continuous eye tracking, and environmental awareness.' }
      ];

      metrics.forEach((metric) => {
        checkPageOverflow(18);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(41, 37, 36);
        doc.text(metric.label, margin, yOffset);

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(139, 92, 246);
        doc.text(`${metric.value}%`, margin + contentWidth, yOffset, { align: 'right' });
        yOffset += 3;

        // Progress bar background
        doc.setFillColor(231, 229, 228); // stone-200
        doc.roundedRect(margin, yOffset, contentWidth, 2.5, 1.25, 1.25, 'F');

        // Progress bar value
        doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
        const barWidth = (metric.value / 100) * contentWidth;
        doc.roundedRect(margin, yOffset, barWidth, 2.5, 1.25, 1.25, 'F');
        yOffset += 5;

        // Short explanation
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120, 113, 108);
        doc.text(metric.text, margin, yOffset);
        yOffset += 8;
      });

      yOffset += 4;

      // Diagnostic assessment section
      checkPageOverflow(30);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(28, 25, 23);
      doc.text('AI Diagnostic Assessment Summary', margin, yOffset);
      yOffset += 6;

      const feedbackLines = doc.splitTextToSize(result.feedback, contentWidth - 10);
      const feedbackBoxHeight = (feedbackLines.length * 5) + 12;

      checkPageOverflow(feedbackBoxHeight + 5);

      doc.setFillColor(250, 245, 255); // brand-purple light translucent bg
      doc.setDrawColor(233, 213, 255); // borders
      doc.roundedRect(margin, yOffset, contentWidth, feedbackBoxHeight, 3, 3, 'FD');

      doc.setFont('Helvetica', 'oblique');
      doc.setFontSize(9.5);
      doc.setTextColor(109, 40, 217); // brand purple deep text
      doc.text(feedbackLines, margin + 5, yOffset + 7);

      yOffset += feedbackBoxHeight + 15;

      // Strengths & Weaknesses
      const { strengths: reportStrengths, weaknesses: reportWeaknesses } = getDynamicStrengthsAndWeaknesses(result);

      checkPageOverflow(40);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(28, 25, 23);
      doc.text('Diagnostic Strengths & Action Refinement Goals', margin, yOffset);
      yOffset += 8;

      // Draw side-by-side or stacked highlights
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.text('Key Technical & Comms Strengths', margin, yOffset);
      yOffset += 6;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(68, 64, 60);

      reportStrengths.forEach((str) => {
        const strLines = doc.splitTextToSize(str, contentWidth - 10);
        checkPageOverflow(strLines.length * 4.5 + 4);

        // Green bullet
        doc.setFillColor(16, 185, 129);
        doc.circle(margin + 2, yOffset - 1, 1, 'F');

        doc.text(strLines, margin + 6, yOffset);
        yOffset += (strLines.length * 4.5) + 3;
      });

      yOffset += 4;
      checkPageOverflow(20);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(225, 29, 72); // rose-600
      doc.text('Recommended Refinement & Improvement Goals', margin, yOffset);
      yOffset += 6;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(68, 64, 60);

      reportWeaknesses.forEach((weak) => {
        const weakLines = doc.splitTextToSize(weak, contentWidth - 10);
        checkPageOverflow(weakLines.length * 4.5 + 4);

        // Rose bullet
        doc.setFillColor(244, 63, 94);
        doc.circle(margin + 2, yOffset - 1, 1, 'F');

        doc.text(weakLines, margin + 6, yOffset);
        yOffset += (weakLines.length * 4.5) + 3;
      });

      // --- PAGE 2+ / NEW SESSIONS: INTERROGATIVE DETAILS ---
      if (parsedQuestions.length > 0) {
        doc.addPage();
        yOffset = 25;

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(28, 25, 23);
        doc.text('Interrogative Q&A Trajectory Analysis', margin, yOffset);
        yOffset += 5;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(120, 113, 108);
        doc.text('A thorough breakdown of response quality, model reference guidance, and detailed scoring vector markers.', margin, yOffset);
        yOffset += 12;

        parsedQuestions.forEach((q, idx) => {
          checkPageOverflow(40);

          doc.setFillColor(245, 245, 244); // light gray
          doc.rect(margin, yOffset, contentWidth, 8, 'F');

          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(139, 92, 246);
          doc.text(`QUESTION NODE 0${idx + 1}`, margin + 4, yOffset + 5.5);

          const combAvg = Math.round(((q.communicationScore || 0) + (q.technicalScore || 0) + (q.confidenceScore || 0)) / 3);
          doc.setFont('Helvetica', 'bold');
          doc.text(`Unified Node Rating: ${combAvg}%`, margin + contentWidth - 4, yOffset + 5.5, { align: 'right' });

          yOffset += 13;

          // Question topic
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(10.5);
          doc.setTextColor(41, 37, 36);
          const qText = typeof q === 'string' ? q : (q.q || 'Interview Question');
          const qTextLines = doc.splitTextToSize(qText, contentWidth);
          checkPageOverflow(qTextLines.length * 5 + 5);
          doc.text(qTextLines, margin, yOffset);
          yOffset += (qTextLines.length * 5) + 4;

          // Specific Scores: Comms, Tech, confidence
          checkPageOverflow(15);
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(120, 113, 108);
          doc.text(`TECH DEPTH: ${q.technicalScore || 0}%`, margin, yOffset);
          doc.text(`COMMS CLARITY: ${q.communicationScore || 0}%`, margin + 60, yOffset);
          doc.text(`EMOTIONAL PRESENCE: ${q.confidenceScore || 0}%`, margin + 120, yOffset);
          yOffset += 6;

          // Feedback comment
          const fbTextRaw = q.feedback || q.communicationFeedback || q.technicalFeedback || '';
          let renderedFb = '';
          if (typeof fbTextRaw === 'string') {
            renderedFb = fbTextRaw;
          } else if (typeof fbTextRaw === 'object' && fbTextRaw) {
            renderedFb = (fbTextRaw.good ? `Well Done: ${fbTextRaw.good}. ` : '') + (fbTextRaw.needsImprovement ? `Refinement Area: ${fbTextRaw.needsImprovement}` : '');
          }
          if (renderedFb) {
            const fbLines = doc.splitTextToSize(`Performance Feedback: ${renderedFb}`, contentWidth - 4);
            checkPageOverflow(fbLines.length * 4.5 + 4);
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(68, 64, 60);
            doc.text(fbLines, margin, yOffset);
            yOffset += (fbLines.length * 4.5) + 4;
          }

          // model ideal answer
          const suggestedText = getDynamicSuggestedAnswer(q.q || q.question || "", q.suggestedAnswer || q.modelAnswer || q.idealAnswer);
          if (suggestedText) {
            const modelLines = doc.splitTextToSize(`Model Reference Guidance Outline: \n${suggestedText}`, contentWidth - 8);
            const neededHeight = (modelLines.length * 4.5) + 12;

            checkPageOverflow(neededHeight);

            doc.setFillColor(240, 253, 250); // super light mint background
            doc.setDrawColor(204, 251, 241); // mint border
            doc.roundedRect(margin, yOffset, contentWidth, neededHeight - 2, 2, 2, 'FD');

            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(13, 148, 136); // teal dark text
            doc.text(modelLines, margin + 4, yOffset + 5);

            yOffset += neededHeight + 6;
          }

          yOffset += 4;
        });
      }

      // Add Headers & Footers (Dynamic Multipage Pass)
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Horizontal Page Line header
        doc.setDrawColor(245, 245, 244);
        doc.setLineWidth(0.3);
        doc.line(margin, 12, pageWidth - margin, 12);

        // Header Text
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(168, 162, 158); // warm grey text
        doc.text('CAREERMAP AI COACH EVALUATION DIAGNOSTICS', margin, 9);
        doc.text('SECURE VERIFIED INTELLIGENCE', pageWidth - margin, 9, { align: 'right' });

        // Footer Text & Page numbering
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        doc.text('CareerMap Professional Trajectory Evaluation', margin, pageHeight - 10);
        doc.text(`Diagnostics Report  |  Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }

      // Save complete generated file
      doc.save(`CareerMap_Evaluation_Report_${result.type.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("Failed to generate and download PDF:", err);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
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
            if (data && data.length > 0) {
              setInterviews(data);
              setResult(data[0]);
              setSelectedId(data[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-bg dark:bg-stone-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-brand-purple" size={48} />
        <p className="text-warm-secondary italic font-mono text-sm animate-pulse">Decompartmentalizing Session Telemetry...</p>
      </div>
    );
  }

  if (interviews.length === 0 || !result) {
    return (
      <div className="p-8 text-center space-y-6 bg-warm-bg dark:bg-stone-950 min-h-screen flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple mb-4">
          <Award size={40} className="stroke-[1.5]" />
        </div>
        <h1 className="text-3xl font-black text-warm-text dark:text-white tracking-tight">No Interview Results Found</h1>
        <p className="text-warm-secondary max-w-md mx-auto">Complete a mock interview round to synthesize real-time diagnostics and performance analytics.</p>
        <Link to="/interview" className="inline-block px-8 py-3.5 bg-brand-purple text-white rounded-xl font-bold hover:transform hover:-translate-y-0.5 transition-all shadow-lg shadow-brand-purple/20">
          Begin First Session
        </Link>
      </div>
    );
  }

  // Handle Switching active interview
  const selectInterview = (id: string) => {
    setSelectedId(id);
    const item = interviews.find(i => i.id === id);
    if (item) {
      setResult(item);
      setExpandedQuestionIdx(0); // Reset accordion on switch
    }
  };

  // Safe parsing of questions
  let parsedQuestions: any[] = [];
  try {
    parsedQuestions = Array.isArray(result.questions)
      ? result.questions
      : typeof result.questions === 'string' && result.questions.trim() !== ''
        ? JSON.parse(result.questions)
        : [];
  } catch (err) {
    console.error("Error parsing questions:", err);
    parsedQuestions = [];
  }

  // Helper logic to synthesize actual strengths and weaknesses dynamically from Q&A feedback if we don't have static ones
  const getDynamicStrengthsAndWeaknesses = (item: InterviewResult) => {
    let questions: any[] = [];
    try {
      questions = Array.isArray(item.questions)
        ? item.questions
        : typeof item.questions === 'string' && item.questions.trim() !== ''
          ? JSON.parse(item.questions)
          : [];
    } catch (err) {
      console.error("Error parsing questions in helper:", err);
      questions = [];
    }

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (questions.length > 0) {
      questions.forEach((q: any) => {
        if (q.technicalScore >= 80 && q.technicalFeedback) strengths.push(q.technicalFeedback);
        else if (q.technicalScore < 75 && q.technicalFeedback) weaknesses.push(q.technicalFeedback);

        if (q.communicationScore >= 80 && q.communicationFeedback) strengths.push(q.communicationFeedback);
        else if (q.communicationScore < 75 && q.communicationFeedback) weaknesses.push(q.communicationFeedback);

        if (q.confidenceScore >= 80 && q.confidenceFeedback) strengths.push(q.confidenceFeedback);
        else if (q.confidenceScore < 75 && q.confidenceFeedback) weaknesses.push(q.confidenceFeedback);
      });
    }

    // High level fallbacks based on overall scores
    if (strengths.length === 0) {
      if (item.communication >= 75) strengths.push("Articulates responses with comfortable pace and appropriate sentence structure.");
      if (item.technical >= 75) strengths.push("Strong structural intuition for architectural layers and data schemas.");
      if (item.confidence >= 75) strengths.push("Speaks assertively, maintaining consistent engagement and active presence.");
      strengths.push("Excellent conversational flexibility under diagnostic queries.");
    }
    if (weaknesses.length === 0) {
      if (item.technical < 85) weaknesses.push("Enrich explanations by actively diagramming or describing physical layer mechanics.");
      if (item.communication < 85) weaknesses.push("Break down initial descriptions into targeted, modular bullet points first.");
      weaknesses.push("Address edge-case resilience, resource limits, and failure modes proactively.");
    }

    return {
      strengths: Array.from(new Set(strengths)).slice(0, 3),
      weaknesses: Array.from(new Set(weaknesses)).slice(0, 3)
    };
  };

  const { strengths, weaknesses } = getDynamicStrengthsAndWeaknesses(result);

  // Compute overall historical averages for analytics
  const totalCompleted = interviews.length;
  const avgScore = Math.round(interviews.reduce((acc, c) => acc + (c.score || 0), 0) / (totalCompleted || 1));
  const avgTech = Math.round(interviews.reduce((acc, c) => acc + (c.technical || 0), 0) / (totalCompleted || 1));
  const avgComm = Math.round(interviews.reduce((acc, c) => acc + (c.communication || 0), 0) / (totalCompleted || 1));
  const avgConf = Math.round(interviews.reduce((acc, c) => acc + (c.confidence || 0), 0) / (totalCompleted || 1));

  // Recharts timeline progression data
  const timelineData = [...interviews]
    .reverse()
    .map((item, idx) => ({
      name: `Session ${idx + 1}`,
      date: new Date(item.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      Score: item.score || 0,
      Technical: item.technical || 0,
      Communication: item.communication || 0,
      Confidence: item.confidence || 0
    }));

  const radarData = [
    { name: 'Technical Skills', Current: result.technical || 0, Average: avgTech || 0, fullMark: 100 },
    { name: 'Communication Clarity', Current: result.communication || 0, Average: avgComm || 0, fullMark: 100 },
    { name: 'Emotional Presence', Current: result.confidence || 0, Average: avgConf || 0, fullMark: 100 },
    { name: 'Integrity Guidelines', Current: result.integrity || 0, Average: Math.round(interviews.reduce((acc, c) => acc + (c.integrity || 0), 0) / (totalCompleted || 1)) || 0, fullMark: 100 },
  ];

  // Filtering interviews based on search query
  const filteredInterviews = interviews.filter(item =>
    item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    new Date(item.createdAt).toLocaleDateString().includes(searchQuery)
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-warm-bg dark:bg-stone-950">

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 pb-6 border-b border-warm-border dark:border-stone-850">
        <div>
          <span className="text-[10px] font-black bg-brand-purple/10 text-brand-purple px-3 py-1 rounded-full uppercase tracking-widest cursor-default">
            Performance Core Lab
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-warm-text dark:text-white mt-2 leading-tight tracking-tight italic">
            Telemetry Dashboard
          </h1>
          <p className="text-sm font-semibold text-warm-secondary mt-1 max-w-xl">
            Deep psychological evaluation, semantic scoring, integrity monitors, and conversational trajectory diagnostics.
          </p>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex items-center bg-stone-100 dark:bg-stone-900/60 p-1.5 rounded-2xl border border-warm-border/30 dark:border-stone-800/80 shrink-0 self-start lg:self-center">
          <button
            onClick={() => setActiveTab('selected')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition duration-300 ${activeTab === 'selected'
                ? 'bg-white dark:bg-stone-800 text-brand-purple shadow-sm'
                : 'text-warm-secondary hover:text-warm-text dark:hover:text-white'
              }`}
          >
            <ClipboardList size={14} /> Selected Session
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition duration-300 ${activeTab === 'analytics'
                ? 'bg-white dark:bg-stone-800 text-brand-purple shadow-sm'
                : 'text-warm-secondary hover:text-warm-text dark:hover:text-white'
              }`}
          >
            <BarChart4 size={14} /> Progression Analytics ({totalCompleted})
          </button>
        </div>
      </div>

      {/* Aggregate telemetry widgets grid (shows regardless of tab to give beautiful analytics snapshot) */}
      <motion.div
        variants={statsContainerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div
          variants={statsItemVariants}
          className="p-6 rounded-3xl border border-warm-border/60 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 backdrop-blur-md relative overflow-hidden group shadow-sm hover:border-brand-purple/20 transition-all hover:scale-[1.02] duration-300"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-purple/5 rounded-bl-[80px] group-hover:scale-110 transition-transform duration-500" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-warm-hint">MEAN OUTCOME</span>
            <div className="p-2 bg-badge-purple rounded-xl text-brand-purple">
              <Award size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-warm-text dark:text-white">{avgScore}%</span>
            <span className="text-xs font-bold text-success">Target: 85%</span>
          </div>
          <p className="text-xs text-warm-secondary font-medium mt-2">Aggregated rating index over {totalCompleted} iterations</p>
        </motion.div>

        <motion.div
          variants={statsItemVariants}
          className="p-6 rounded-3xl border border-warm-border/60 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 backdrop-blur-md relative overflow-hidden group shadow-sm hover:border-brand-purple/20 transition-all hover:scale-[1.02] duration-300"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-[80px] group-hover:scale-110 transition-transform duration-500" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-warm-hint">TECHNICAL DOMAIN</span>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <Brain size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-warm-text dark:text-white">{avgTech}%</span>
            <span className="text-xs font-bold text-blue-500">Peak: {Math.max(...interviews.map(i => i.technical))}%</span>
          </div>
          <p className="text-xs text-warm-secondary font-medium mt-2">Architecture, system scale, and mechanics criteria</p>
        </motion.div>

        <motion.div
          variants={statsItemVariants}
          className="p-6 rounded-3xl border border-warm-border/60 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 backdrop-blur-md relative overflow-hidden group shadow-sm hover:border-brand-purple/20 transition-all hover:scale-[1.02] duration-300"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-[80px] group-hover:scale-110 transition-transform duration-500" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-warm-hint">COMMS CLARITY</span>
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-warm-text dark:text-white">{avgComm}%</span>
            <span className="text-xs font-bold text-indigo-500">Steady Pace</span>
          </div>
          <p className="text-xs text-warm-secondary font-medium mt-2">Articulation speed, vocabulary, and conciseness</p>
        </motion.div>

        <motion.div
          variants={statsItemVariants}
          className="p-6 rounded-3xl border border-warm-border/60 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 backdrop-blur-md relative overflow-hidden group shadow-sm hover:border-brand-purple/20 transition-all hover:scale-[1.02] duration-300"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-[80px] group-hover:scale-110 transition-transform duration-500" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-warm-hint">EMOTIONAL CORE</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <Zap size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-warm-text dark:text-white">{avgConf}%</span>
            <span className="text-xs font-bold text-amber-500">Confident</span>
          </div>
          <p className="text-xs text-warm-secondary font-medium mt-2">Vocal engagement, inflection, stress demeanor</p>
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'selected' ? (
          <motion.div
            key="selected-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left Column: Historical Session List Selector / Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="card-3d p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black text-warm-text dark:text-white italic uppercase tracking-tight">
                    Session Log History
                  </h3>
                  <span className="text-[10px] font-bold text-warm-secondary bg-stone-100 dark:bg-stone-850 px-2 py-1 rounded-md">
                    {filteredInterviews.length} / {totalCompleted} Match
                  </span>
                </div>

                {/* Direct Search query for session types */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-hint" size={14} />
                  <input
                    type="text"
                    placeholder="Search by role or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-stone-950 border border-warm-border/60 dark:border-stone-850 rounded-xl text-xs font-medium placeholder-stone-400 focus:border-brand-purple/50 focus:outline-none transition duration-300"
                  />
                </div>

                {/* Scrollable Selector timeline */}
                <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1 customize-scrollbar">
                  {filteredInterviews.map((item) => {
                    const isSelected = selectedId === item.id;
                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: isSelected ? 1 : 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => selectInterview(item.id)}
                        className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer text-left relative overflow-hidden group ${isSelected
                            ? 'bg-white dark:bg-stone-900 border-brand-purple shadow-md shadow-brand-purple/5'
                            : 'bg-stone-50/50 dark:bg-stone-900/10 border-warm-border/30 dark:border-stone-850 hover:border-brand-purple/20 hover:bg-white dark:hover:bg-stone-900/40'
                          }`}
                      >
                        {/* Selected accent indicator line */}
                        {isSelected && (
                          <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-brand-purple" />
                        )}

                        <div className="flex justify-between items-start gap-2 pl-1.5">
                          <div className="space-y-1">
                            <h4 className={`font-extrabold text-sm transition-colors ${isSelected ? 'text-brand-purple' : 'text-warm-text dark:text-white group-hover:text-brand-purple'
                              }`}>
                              {item.type} Role
                            </h4>
                            <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-warm-hint">
                              <span className="flex items-center gap-1">
                                <Calendar size={10} /> {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-base font-black ${item.score >= 80 ? 'text-success' : item.score >= 60 ? 'text-brand-purple' : 'text-warm-secondary'
                              }`}>
                              {item.score}%
                            </span>
                            <p className="text-[8px] font-black uppercase tracking-widest text-warm-hint">Scoring</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {filteredInterviews.length === 0 && (
                    <div className="text-center py-10 text-warm-hint">
                      <p className="text-xs font-mono">No matching sessions found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Integrity Monitor Module */}
              <div className="bg-gradient-to-br from-brand-purple to-indigo-650 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-6 translate-x-6 blur-2xl group-hover:scale-125 transition-transform duration-700" />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-teal-300 bg-teal-300/15 px-2.5 py-0.5 rounded">Security Anchor</span>
                    <h4 className="text-lg font-black tracking-tight mt-1">Integrity Telemetry</h4>
                  </div>
                  <ShieldCheck size={32} className="opacity-40 mt-1" />
                </div>
                <div className="flex items-baseline gap-1 mt-6">
                  <span className="text-5xl font-black italic">{result.integrity}%</span>
                  <span className="text-xs font-bold text-teal-300">Clean Report</span>
                </div>
                <p className="text-xs text-white/80 font-medium leading-relaxed mt-4">
                  {result.integrity >= 90
                    ? "Fully aligned dynamic focal lock detected. No suspicious screen departures or vocabulary prompts verified."
                    : "Partial session interruptions detected. Ensure absolute focal lock on subsequent mock sessions."}
                </p>
              </div>
            </div>

            {/* Right Column: Active Session Deep-Dive Report */}
            <div className="lg:col-span-8 space-y-8">

              {/* Score breakdown detailed card */}
              <div className="card-3d p-6 md:p-8 relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-4 border-b border-warm-border/60 dark:border-stone-850">
                  <div>
                    <span className="text-[10px] font-black tracking-widest uppercase text-brand-purple bg-brand-purple/10 px-2.5 py-0.5 rounded-lg block w-max">
                      Interactive Analysis
                    </span>
                    <h3 className="text-2xl font-black text-warm-text dark:text-white tracking-tight mt-1">
                      {result.type} Performance Report
                    </h3>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition duration-300 bg-stone-100 dark:bg-stone-900 border border-warm-border dark:border-stone-800 text-warm-secondary hover:text-brand-purple">
                      <Share2 size={12} /> Share Report
                    </button>
                    <button
                      onClick={downloadPDFReport}
                      disabled={isDownloadingPDF}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 bg-brand-purple text-white shadow-md shadow-brand-purple/20 hover:opacity-90 disabled:opacity-50 cursor-pointer"
                    >
                      {isDownloadingPDF ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Download size={12} />
                      )}
                      <span>Download PDF Report</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  {/* Circle Score Gauge */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      {/* Interactive ring circle gradient indicator */}
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle
                          cx="72"
                          cy="72"
                          r="60"
                          className="stroke-stone-100 dark:stroke-stone-850"
                          strokeWidth="10"
                          fill="transparent"
                        />
                        <motion.circle
                          cx="72"
                          cy="72"
                          r="60"
                          className="stroke-brand-purple"
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 60}
                          initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - result.score / 100) }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="text-center z-10">
                        <span className="text-4xl font-black italic text-warm-text dark:text-white">{result.score}%</span>
                        <p className="text-[8px] font-black uppercase tracking-widest text-warm-hint mt-0.5">Rating Index</p>
                      </div>
                    </div>
                    <span className="text-xs font-black uppercase text-brand-purple mt-4 tracking-widest text-center animate-pulse">
                      {result.score >= 80 ? 'Mastery demonstrated' : result.score >= 60 ? 'Sturdy Performance' : 'Diagnostic study required'}
                    </span>
                  </div>

                  {/* Horizontal criteria gauges */}
                  <div className="md:col-span-8 space-y-5">
                    {[
                      { label: 'Technical depth', value: result.technical, color: '#3B82F6', text: 'Infrastructure & System limits' },
                      { label: 'Communication Clarity', value: result.communication, color: '#4F378B', text: 'Vocabulary structure & pacing' },
                      { label: 'Emotional Presence', value: result.confidence, color: '#8B5CF6', text: 'Engagement & dynamic stability' },
                      { label: 'Integrity Monitor', value: result.integrity, color: '#10B981', text: 'Security, proctor & guidance bounds' }
                    ].map((metric, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                          <span className="text-warm-text dark:text-stone-300">{metric.label}</span>
                          <span className="text-brand-purple">{metric.value}%</span>
                        </div>
                        <div className="h-2.5 bg-stone-100 dark:bg-stone-850 rounded-full overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.value}%` }}
                            transition={{ duration: 1.2, delay: 0.1 * idx }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: metric.color }}
                          />
                        </div>
                        <p className="text-[9px] text-warm-hint font-medium italic">{metric.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Diagnostic Summary Quote */}
              <div className="card-3d p-6 md:p-8 bg-gradient-to-r from-badge-purple/45 to-transparent border border-brand-purple/15 rounded-[32px] relative overflow-hidden">
                <div className="absolute top-4 left-4 text-5xl font-black text-brand-purple/10 pointer-events-none font-serif">“</div>
                <div className="relative z-10 pl-6 pr-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-purple block mb-2">Psychological Diagnostic Assessment</span>
                  <p className="text-base font-bold italic leading-relaxed text-brand-purple/90">
                    {result.feedback}
                  </p>
                </div>
              </div>

              {/* Dynamic Strengths & Weaknesses (synthesized per interview) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths Card */}
                <div className="p-6 rounded-3xl border border-emerald-500/10 bg-emerald-500/[0.01] space-y-4">
                  <h4 className="text-xs font-black tracking-widest text-emerald-600 dark:text-emerald-500 uppercase flex items-center gap-2">
                    <CheckCircle2 size={16} /> Key Diagnostic Strengths
                  </h4>
                  <ul className="space-y-3.5">
                    {strengths.map((str, idx) => (
                      <li key={idx} className="flex gap-3 text-xs text-warm-secondary dark:text-stone-300 font-semibold leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 animate-pulse" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses / Opportunities Card */}
                <div className="p-6 rounded-3xl border border-rose-500/10 bg-rose-500/[0.01] space-y-4">
                  <h4 className="text-xs font-black tracking-widest text-rose-600 dark:text-rose-500 uppercase flex items-center gap-2">
                    <AlertCircle size={16} /> Refinement Goals
                  </h4>
                  <ul className="space-y-3.5">
                    {weaknesses.map((weak, idx) => (
                      <li key={idx} className="flex gap-3 text-xs text-warm-secondary dark:text-stone-300 font-semibold leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0 animate-pulse" />
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Interactive Accordion Question breakdown tree */}
              <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                  <div>
                    <h3 className="text-lg font-black text-warm-text dark:text-white uppercase tracking-tight italic">
                      Interrogative breakdown
                    </h3>
                    <p className="text-xs text-warm-hint font-medium">Click on any lesson node question below to investigate details.</p>
                  </div>
                  <span className="text-xs font-black uppercase text-brand-purple">{parsedQuestions.length} Questions</span>
                </div>

                <div className="space-y-4">
                  {parsedQuestions.map((q, idx) => {
                    const isExpanded = expandedQuestionIdx === idx;
                    const combinedAvg = Math.round(((q.communicationScore || 0) + (q.technicalScore || 0) + (q.confidenceScore || 0)) / 3);

                    return (
                      <div
                        key={idx}
                        className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded
                            ? 'border-brand-purple bg-white dark:bg-stone-900 shadow-md'
                            : 'border-warm-border/60 dark:border-stone-850 hover:border-brand-purple/20 bg-warm-bg/20 dark:bg-stone-900/10'
                          }`}
                      >
                        {/* Question Node Trigger row */}
                        <button
                          onClick={() => setExpandedQuestionIdx(isExpanded ? null : idx)}
                          className="w-full text-left p-5 flex justify-between items-start gap-4"
                        >
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded">
                              Interrogation Node 0{idx + 1}
                            </span>
                            <h4 className="font-extrabold text-sm md:text-base text-warm-text dark:text-stone-100 group-hover:text-brand-purple transition-colors leading-snug">
                              {typeof q === 'string' ? q : (q.q || 'Interview Question')}
                            </h4>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className={`text-xs font-black ${combinedAvg >= 80 ? 'text-success' : 'text-brand-purple'}`}>
                                {combinedAvg}%
                              </span>
                              <p className="text-[7px] font-black uppercase tracking-widest text-warm-hint">Combined</p>
                            </div>
                            <ChevronRight
                              size={18}
                              className={`text-warm-hint transition-transform duration-300 ${isExpanded ? 'rotate-90 text-brand-purple' : ''}`}
                            />
                          </div>
                        </button>

                        {/* Collapsible Details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="border-t border-warm-border/60 dark:border-stone-850"
                            >
                              <div className="p-5 md:p-6 space-y-6">
                                {/* Summary Advice Block */}
                                <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-xl border border-warm-border/40 dark:border-stone-850 font-medium">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                                    <span className="text-[9px] font-black text-brand-purple uppercase tracking-widest">Acoustic Feedback</span>
                                  </div>
                                  <div className="text-xs text-warm-secondary dark:text-stone-300 leading-relaxed font-semibold">
                                    {renderFeedbackText(q.feedback)}
                                  </div>
                                </div>

                                {/* Suggested / Model Answer Block */}
                                <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-xl border border-emerald-500/15">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <Award className="text-emerald-500 shrink-0" size={14} />
                                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Suggested Recommended Answer</span>
                                  </div>
                                  <p className="text-xs text-slate-800 dark:text-emerald-200 font-medium leading-relaxed whitespace-pre-wrap">
                                    {getDynamicSuggestedAnswer(q.q || q.question || "", q.suggestedAnswer || q.modelAnswer || q.idealAnswer)}
                                  </p>
                                </div>

                                {/* Radial breakdown details */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {/* Comms breakdown */}
                                  <div className="space-y-2 text-left">
                                    <div className="flex justify-between items-baseline">
                                      <span className="text-[10px] font-black text-brand-purple uppercase tracking-widest">Communication</span>
                                      <span className="text-xs font-black text-warm-text dark:text-white">{q.communicationScore || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-stone-100 dark:bg-stone-950 rounded-full overflow-hidden">
                                      <div className="h-full bg-brand-purple rounded-full" style={{ width: `${q.communicationScore || 0}%` }} />
                                    </div>
                                    <p className="text-[10px] text-warm-secondary leading-normal font-medium italic">
                                      {q.communicationFeedback}
                                    </p>
                                  </div>

                                  {/* Tech breakdown */}
                                  <div className="space-y-2 text-left">
                                    <div className="flex justify-between items-baseline">
                                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Technical</span>
                                      <span className="text-xs font-black text-warm-text dark:text-white">{q.technicalScore || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-stone-100 dark:bg-stone-950 rounded-full overflow-hidden">
                                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${q.technicalScore || 0}%` }} />
                                    </div>
                                    <p className="text-[10px] text-warm-secondary leading-normal font-medium italic">
                                      {q.technicalFeedback}
                                    </p>
                                  </div>

                                  {/* Confidence breakdown */}
                                  <div className="space-y-2 text-left">
                                    <div className="flex justify-between items-baseline">
                                      <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest">Confidence</span>
                                      <span className="text-xs font-black text-warm-text dark:text-white">{q.confidenceScore || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-stone-100 dark:bg-stone-950 rounded-full overflow-hidden">
                                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${q.confidenceScore || 0}%` }} />
                                    </div>
                                    <p className="text-[10px] text-warm-secondary leading-normal font-medium italic">
                                      {q.confidenceFeedback}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendation Actionable */}
              <div className="card-3d p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-badge-purple flex items-center justify-center text-brand-purple">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-warm-text dark:text-white uppercase tracking-tight italic">
                      Accelerated Improvement Pathway
                    </h3>
                    <p className="text-xs text-warm-hint">Bridging performance metrics to personalized career actions</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to="/skills"
                    className="flex justify-between items-center p-4 rounded-2xl bg-stone-50 hover:bg-white dark:bg-stone-900/30 dark:hover:bg-stone-900 border border-warm-border/40 dark:border-stone-850 hover:border-brand-purple/30 group transition-all"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-black text-brand-purple uppercase tracking-widest">Curated Core Study</span>
                      <h4 className="text-xs font-black text-warm-text dark:text-stone-300">Syllabus Skill Trees</h4>
                    </div>
                    <ArrowRight size={14} className="text-warm-hint group-hover:text-brand-purple group-hover:translate-x-1.5 transition-all" />
                  </Link>
                  <Link
                    to="/confidence"
                    className="flex justify-between items-center p-4 rounded-2xl bg-stone-50 hover:bg-white dark:bg-stone-900/30 dark:hover:bg-stone-900 border border-warm-border/40 dark:border-stone-850 hover:border-brand-purple/30 group transition-all"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-black text-brand-purple uppercase tracking-widest">Self Assurance Lab</span>
                      <h4 className="text-xs font-black text-warm-text dark:text-stone-300">Confidence Diagnostics</h4>
                    </div>
                    <ArrowRight size={14} className="text-warm-hint group-hover:text-brand-purple group-hover:translate-x-1.5 transition-all" />
                  </Link>
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="analytics-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Progression Chart Area */}
            <div className="card-3d p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-warm-border/50 dark:border-stone-850 pb-4">
                <div>
                  <h3 className="text-lg font-black text-warm-text dark:text-white uppercase tracking-tight italic">
                    Career Progression Wavefront
                  </h3>
                  <p className="text-xs text-warm-hint">Interactive plotting of competency trends across consecutive practice rounds</p>
                </div>
                {/* Score indicators */}
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-brand-purple rounded-full" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-warm-secondary">Overall Score</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-warm-secondary">Technical</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-warm-secondary">Communication</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-warm-secondary">Confidence</span>
                  </div>
                </div>
              </div>

              {/* Progress Line Graph */}
              <div className="h-[360px] w-full mt-4 min-w-0 min-h-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" className="dark:hidden" />
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1917" className="hidden dark:block" />
                    <XAxis
                      dataKey="name"
                      stroke="#a8a29e"
                      fontSize={10}
                      fontFamily="monospace"
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#a8a29e"
                      fontSize={10}
                      fontFamily="monospace"
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1c1917',
                        borderColor: '#292524',
                        borderRadius: '16px',
                        color: '#f5f5f4',
                        fontFamily: 'sans-serif',
                        fontSize: '11px',
                        fontWeight: '800'
                      }}
                    />
                    <Line type="monotone" dataKey="Score" stroke="#4F378B" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Technical" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="Communication" stroke="#6366F1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="Confidence" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Comparison Chart and Aggregate breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Radar diagram */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.1 }}
                className="lg:col-span-6 card-3d p-6 md:p-8 space-y-4"
              >
                <div>
                  <h3 className="text-base font-black text-warm-text dark:text-white uppercase tracking-tight italic">
                    Competency Radar Signature
                  </h3>
                  <p className="text-xs text-warm-hint">Comparison of current selected round limits against aggregate lifetime metrics</p>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-[320px] w-full flex items-center justify-center min-w-0 min-h-0"
                >
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#e7e5e4" strokeDasharray="3 3" className="dark:stroke-stone-800" />
                      <PolarAngleAxis dataKey="name" stroke="#78716c" fontSize={9} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#a8a29e" fontSize={8} />
                      <Radar name="Chosen Session" dataKey="Current" stroke="#4F378B" fill="#4F378B" fillOpacity={0.25} />
                      <Radar name="Historical Averages" dataKey="Average" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                      <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </motion.div>
              </motion.div>

              {/* High diagnostic insights tracker */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.25 }}
                className="lg:col-span-6 card-3d p-6 md:p-8 space-y-6 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-black text-warm-text dark:text-white uppercase tracking-tight italic">
                    Career Progression Analytics Summary
                  </h3>
                  <p className="text-xs text-warm-hint mb-6">Aggregate developmental intelligence insights</p>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-stone-100/40 dark:bg-stone-900/40 border border-warm-border/30 dark:border-stone-850 flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <TrendingUp size={16} />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-warm-text dark:text-stone-200">Trajectory Momentum</h4>
                        <p className="text-xs text-warm-secondary leading-relaxed">
                          Your active practice score trajectory demonstrates a consistent {timelineData[timelineData.length - 1]?.Score > timelineData[0]?.Score ? 'positive growth vector' : 'steady horizontal trend'}. Continuous feedback loops are refining vocabulary limits.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-100/40 dark:bg-stone-900/40 border border-warm-border/30 dark:border-stone-850 flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-lg bg-brand-purple/10 text-brand-purple flex items-center justify-center shrink-0">
                        <Target size={16} />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-warm-text dark:text-stone-200">Primary Enhancement Vector</h4>
                        <p className="text-xs text-warm-secondary leading-relaxed">
                          To accelerate outcome metrics to peak potential indices, concentrate heavily on system layout boundaries, resilience modeling, and scaling failures.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-warm-border/60 dark:border-stone-850 text-center">
                  <p className="text-xs text-warm-hint italic leading-loose font-mono">
                    "Consistent iteration is the prime engine of masterclass delivery."
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
