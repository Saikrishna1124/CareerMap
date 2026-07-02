import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Compass, CheckCircle2, Circle, Clock, Award, FileText, Brain,
    Video, Heart, Briefcase, ChevronRight, Loader2, Play, Zap,
    TrendingUp, RefreshCw, GitCommit, Navigation, HelpCircle,
    Target, Search, Bell, Sparkles, User, AlertCircle, Info,
    Maximize2, Minimize2, ZoomIn, ZoomOut, Check, Sliders,
    Menu, ArrowUpRight, Github, Code, ArrowRight, ShieldCheck, Database, Server
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface TechTreeNode {
    id: number;
    title: string;
    subtitle: string;
    details: string;
    skillsTargeted: string[];
    x: number;
    y: number;
    actionRoute: string;
    actionText: string;
    estimatedHours: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export const CareerMapPage: React.FC = () => {
    const { user, setUser, fetchMe } = useAuth();
    const { theme, contrastMode } = useTheme();
    const navigate = useNavigate();

    // Active inputs
    const [targetRole, setTargetRole] = useState(user?.targetRole || 'Software Professional');
    const [searchQuery, setSearchQuery] = useState('');

    // Custom Dynamic Zoom & Drag Panning Canvas states
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState<number>(0.8);
    const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: -100, y: 0 });
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    // Interactive Stats states
    const [confidenceIndex, setConfidenceIndex] = useState<number>(82);
    const [showNotificationPopup, setShowNotificationPopup] = useState(true);
    const [aiStatusMessage, setAiStatusMessage] = useState('System Synergy: ACTIVE | Gemini Engine Online');

    // Node loading and generating states
    const [selectedNodeId, setSelectedNodeId] = useState<number>(3); // Node 3 is interactive active default
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingLog, setGeneratingLog] = useState('');
    const [generatingProgress, setGeneratingProgress] = useState(0);

    // Typewriter text state for AI advice
    const [typedAdvice, setTypedAdvice] = useState('');
    const [activeAdviceIndex, setActiveAdviceIndex] = useState(0);

    const completedMilestones = user?.roadmapProgress || [1, 2]; // Keep default progress to make it look active

    // Symmetrical Neural Skill Tree Configuration: 9-Nodes
    const defaultNetworkNodes: TechTreeNode[] = [
        {
            id: 1,
            title: 'Programming Foundations',
            subtitle: 'Syntax & Primitives',
            details: 'Master syntax rules, logic gates, block scopes, dynamic and static type boundaries inside primary languages (JavaScript, Python, Kotlin, or Go).',
            skillsTargeted: ['Primitives', 'Data Types', 'Execution Stack', 'Git Standard Version Control'],
            x: 500,
            y: 540,
            actionRoute: '/skills',
            actionText: 'Learning Hub',
            estimatedHours: '12 Hours',
            difficulty: 'Beginner'
        },
        {
            id: 2,
            title: 'Problem Solving Matrix',
            subtitle: 'Algorithmic Complexity',
            details: 'Utilize big-O notation metrics to measure code speed. Master fundamental arrays, hash indexing, recursive systems, and linear queue stacks.',
            skillsTargeted: ['Big-O Analysis', 'Hash Maps', 'Stack & Heap', 'String Manipulation'],
            x: 320,
            y: 450,
            actionRoute: '/skills',
            actionText: 'Algorithmic Drills',
            estimatedHours: '18 Hours',
            difficulty: 'Beginner'
        },
        {
            id: 3,
            title: 'Data Structures & Trees',
            subtitle: 'Hierarchical Storage',
            details: 'Advance into hierarchical tree data models, graph search traversals (BFS, DFS), priority sorting maps, and high-efficiency memory heaps.',
            skillsTargeted: ['In-Memory Trees', 'Binary Search Trees', 'Heaps', 'Graph Traversals'],
            x: 680,
            y: 450,
            actionRoute: '/skills',
            actionText: 'Advanced Modules',
            estimatedHours: '22 Hours',
            difficulty: 'Intermediate'
        },
        {
            id: 4,
            title: 'Web Application Frame',
            subtitle: 'Modern SDKs & Ecosystems',
            details: 'Configure responsive CSS engines, dynamic SPA components, state routers, custom hooks, and standard visual interface frameworks.',
            skillsTargeted: ['Component Lifecycles', 'React/NextJS', 'State Trees', 'CSS Utility Engines'],
            x: 180,
            y: 310,
            actionRoute: '/resume',
            actionText: 'Project Builder',
            estimatedHours: '30 Hours',
            difficulty: 'Intermediate'
        },
        {
            id: 5,
            title: 'Database Coordination',
            subtitle: 'Storage & Schema Designs',
            details: 'Create schema scripts, model entity-relationship charts, write robust SQL queries, optimize transaction bounds, and establish indexes.',
            skillsTargeted: ['SQL/NoSQL', 'Database Normalization', 'Index Tuning', 'Migrations'],
            x: 380,
            y: 315,
            actionRoute: '/skills',
            actionText: 'Database Laboratory',
            estimatedHours: '25 Hours',
            difficulty: 'Intermediate'
        },
        {
            id: 6,
            title: 'Backend Services',
            subtitle: 'Secure API Gateways',
            details: 'Design multi-route server APIs, token-based verification strategies (JWT), rate limiting, error mitigation traps, and static content serving.',
            skillsTargeted: ['API REST Controllers', 'Middleware Pipelines', 'CJS/ESM Bundling', 'JWT Auditing'],
            x: 620,
            y: 315,
            actionRoute: '/resume',
            actionText: 'API Engineering Dashboard',
            estimatedHours: '28 Hours',
            difficulty: 'Advanced'
        },
        {
            id: 7,
            title: 'Resume ATS Overhaul',
            subtitle: 'Strategic Proof-of-Work',
            details: 'Overhaul your technical resume with the high-impact STAR method bullet lines, target keyword matching scores, and clean single-column PDF templates.',
            skillsTargeted: ['ATS Optimization', 'STAR Blueprint Formatting', 'Proof-of-work', 'Open-source'],
            x: 820,
            y: 310,
            actionRoute: '/resume',
            actionText: 'ATS Resume Intelligence',
            estimatedHours: '10 Hours',
            difficulty: 'Intermediate'
        },
        {
            id: 8,
            title: 'Interactive Verbal Drill',
            subtitle: 'AI Placement Simulation',
            details: 'Face advanced AI proctored challenges under simulated stress. Articulate structural complexities, system designs, and explain design anomalies.',
            skillsTargeted: ['Interpersonal Pitching', 'Architecture Explanations', 'Behavioral Star Metrics', 'Live Speech Clarity'],
            x: 500,
            y: 195,
            actionRoute: '/interview',
            actionText: 'AI Mock Trainer',
            estimatedHours: '20 Hours',
            difficulty: 'Advanced'
        },
        {
            id: 9,
            title: `${targetRole || 'Software Professional'} Hub`,
            subtitle: 'Ultimate Career Placement Goal',
            details: 'Placement Readiness achieved! Fully prepared to pass high-tier screening pools, showcase production quality code, and land exceptional salaries.',
            skillsTargeted: ['Production System Delivery', 'CI/CD Pipelines', 'Code-Review Standards', 'Scalable Architecture'],
            x: 500,
            y: 75,
            actionRoute: '/careers',
            actionText: 'Active Job Openings',
            estimatedHours: 'Ready',
            difficulty: 'Expert'
        }
    ];

    const [networkNodes, setNetworkNodes] = useState<TechTreeNode[]>(defaultNetworkNodes);

    // Synchronize target career role when loaded in context
    useEffect(() => {
        if (user?.targetRole) {
            setTargetRole(user.targetRole);
        }
    }, [user?.targetRole]);

    // Synchronize dynamic user profile career roadmap nodes
    useEffect(() => {
        if (user?.careerMap && Array.isArray(user.careerMap) && user.careerMap.length === 9) {
            const customNetwork = (user.careerMap as any[]).map((node: any) => {
                const coordinateMatch = defaultNetworkNodes.find(n => n.id === node.id);
                return {
                    ...node,
                    x: coordinateMatch ? coordinateMatch.x : 500,
                    y: coordinateMatch ? coordinateMatch.y : 300,
                };
            });
            setNetworkNodes(customNetwork);
        }
    }, [user?.careerMap]);

    // Handle Drag / Panning logic
    const handleMouseDown = (e: React.MouseEvent) => {
        // Exclude button clicks or input focus from dragging
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
            return;
        }
        setIsDragging(true);
        setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPanOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Reset viewport zoom/pan dimensions
    const handleResetViewport = () => {
        setZoom(0.8);
        setPanOffset({ x: -100, y: 0 });
        triggerTransitSound('arrival');
    };

    // HTML Audio Oscillator synthetic buzzer cues
    const triggerTransitSound = (cueType: 'arrival' | 'click' | 'generation' | 'success') => {
        if (localStorage.getItem('pref_sound_fx') === 'false') return;
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();

            // Auto-resume to bypass browser suspension for programmatic AudioContexts within iframes
            if (ctx.state === 'suspended') {
                ctx.resume().catch(e => console.warn('Ctx resume error:', e));
            }

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (cueType === 'success') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
                osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
                osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.36); // C6
                gain.gain.setValueAtTime(0.18, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
                osc.start();
                osc.stop(ctx.currentTime + 0.7);
            } else if (cueType === 'arrival') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440.00, ctx.currentTime); // A4
                osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.15); // C#5
                gain.gain.setValueAtTime(0.14, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                osc.start();
                osc.stop(ctx.currentTime + 0.4);
            } else if (cueType === 'generation') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                osc.start();
                osc.stop(ctx.currentTime + 0.5);
            } else {
                // High fidelity click blip
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                osc.start();
                osc.stop(ctx.currentTime + 0.08);
            }
        } catch (e) {
            console.warn('Audio feedback context prevented or unsupported.', e);
        }
    };

    // Toggle node completion states
    const handleToggleMilestone = async (nodeId: number) => {
        triggerTransitSound('click');
        let updated: number[] = [];
        if (completedMilestones.includes(nodeId)) {
            updated = completedMilestones.filter(id => id !== nodeId);
        } else {
            updated = [...completedMilestones, nodeId];
            if (updated.length === networkNodes.length) {
                setTimeout(() => triggerTransitSound('success'), 400);
            } else {
                setTimeout(() => triggerTransitSound('arrival'), 200);
            }
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/roadmap', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ completedSteps: updated })
            });

            if (res.ok) {
                setUser(prev => prev ? { ...prev, roadmapProgress: updated } : null);
            }
        } catch (err) {
            console.error('Failed to sync node status back to cloud servers.', err);
        }
    };

    // Live roadmap recalculation algorithm effect
    const handleTriggerLiveAIReplan = async () => {
        if (!targetRole.trim()) return;

        triggerTransitSound('generation');
        setIsGenerating(true);
        setGeneratingProgress(0);
        setSelectedNodeId(1);

        const logs = [
            'Establishing secure connection to Gemini Cognitive Matrix...',
            'Analyzing market vacancy scores & role requirements discrepancy...',
            'Mapping technical roadmap tree & branching progressive levels...',
            'Integrating diagnostic criteria milestones & STAR credentials...',
            'Injecting smart simulated speech and verbal mock interview loops...',
            'Calibrating interactive quiz portals... Dynamic Map Ready!'
        ];

        let currentLogIndex = 0;
        setGeneratingLog(logs[0]);

        // Fast-log simulation ticker
        const timer = setInterval(() => {
            if (currentLogIndex < logs.length - 2) {
                currentLogIndex++;
                setGeneratingLog(logs[currentLogIndex]);
                setGeneratingProgress(prev => Math.min(prev + 15, 80));
            }
        }, 450);

        try {
            const token = localStorage.getItem('token');
            const apiRes = await fetch('/api/roadmap/generate-map', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ targetRole: targetRole.trim() })
            });

            if (!apiRes.ok) {
                throw new Error('API server failed to construct customized map.');
            }

            const freshMap = await apiRes.json();

            clearInterval(timer);
            setGeneratingLog(logs[logs.length - 1]);
            setGeneratingProgress(100);

            if (Array.isArray(freshMap) && freshMap.length === 9) {
                const mappedNodes = freshMap.map((node: any) => {
                    const match = defaultNetworkNodes.find((n: any) => n.id === node.id);
                    return {
                        ...node,
                        x: match ? match.x : 500,
                        y: match ? match.y : 300,
                    };
                });

                // Set local state
                setNetworkNodes(mappedNodes);

                // Refresh Auth Context state with updated target_role and career_map
                await fetchMe();

                setSelectedNodeId(1); // Auto-focus on first custom node
                triggerTransitSound('success');
            } else {
                console.warn("API map did not contain exactly 9 nodes, using default fallback placement map.");
            }
        } catch (err) {
            console.error("AI map synthesis failed:", err);
            clearInterval(timer);
            setGeneratingProgress(100);
            setAiStatusMessage("Generative Engine Offline. Displaying default technical placements.");
            triggerTransitSound('arrival');
        } finally {
            setIsGenerating(false);
        }
    };

    // Typewriter effect controller for customized node recommendations
    const activeNode = networkNodes.find(n => n.id === selectedNodeId) || networkNodes[0];

    useEffect(() => {
        const recommendedLine = `Mastering "${activeNode.title}" is a premium milestone. Focus index items: ${activeNode.skillsTargeted.join(', ')}. Details: ${activeNode.details}`;
        setTypedAdvice('');
        let currentIdx = 0;

        // Clear and execute typewriter intervals
        const interval = setInterval(() => {
            if (currentIdx < recommendedLine.length) {
                setTypedAdvice(prev => prev + recommendedLine.charAt(currentIdx));
                currentIdx++;
            } else {
                clearInterval(interval);
            }
        }, 8);

        return () => clearInterval(interval);
    }, [selectedNodeId, activeNode]);

    // Percent variables
    const computedPercent = Math.round((completedMilestones.length / networkNodes.length) * 100);
    const selectedNodeStatus = completedMilestones.includes(selectedNodeId)
        ? 'Completed'
        : (selectedNodeId === 1 || completedMilestones.includes(selectedNodeId - 1)) ? 'Active' : 'Locked';

    return (
        <div className="bg-warm-bg dark:bg-stone-950 text-warm-text dark:text-stone-100 min-h-screen relative overflow-hidden font-sans select-none pb-12">

            {/* Dynamic theme grid background styling */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#DDD5C840_1px,transparent_1px),linear-gradient(to_bottom,#DDD5C840_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#292524_1px,transparent_1px),linear-gradient(to_bottom,#292524_1px,transparent_1px)] bg-[size:4rem_4rem]" />

            {/* Background ambient glows */}
            <div className="absolute -top-40 right-10 w-96 h-96 bg-brand-purple/5 dark:bg-brand-purple/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-2/3 -left-20 w-80 h-96 bg-brand-purple/5 dark:bg-brand-purple/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-10 right-20 w-72 h-80 bg-brand-amber/5 dark:bg-brand-amber/10 rounded-full blur-[90px] pointer-events-none" />

            <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 relative z-10">

                {/* Dynamic Micro-Popup Recommendation Badge (Top Area) */}
                <AnimatePresence>
                    {showNotificationPopup && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="bg-badge-purple/40 dark:bg-brand-purple/10 border border-brand-purple/20 dark:border-brand-purple/30 p-4 rounded-2xl flex items-center justify-between gap-4 backdrop-blur-xl shadow-sm"
                            id="careermap-notification-badge"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-purple/10 dark:bg-brand-purple/20 flex items-center justify-center border border-brand-purple/20 dark:border-brand-purple/35">
                                    <Sparkles size={16} className="text-brand-purple dark:text-indigo-400 animate-pulse" />
                                </div>
                                <p className="text-xs sm:text-sm text-warm-text dark:text-stone-200 font-semibold leading-relaxed">
                                    <span className="font-extrabold text-brand-purple dark:text-white">AI Suggestion:</span> You are currently <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">85% prepared</span> for technical mock trials. Complete Node 6 (Secure Gateway API) to unlock premium salary listings!
                                </p>
                            </div>
                            <button
                                onClick={() => { triggerTransitSound('click'); setShowNotificationPopup(false); }}
                                className="text-xs text-brand-purple dark:text-indigo-300 hover:text-black dark:hover:text-white font-extrabold cursor-pointer shrink-0"
                                id="careermap-notification-dismiss"
                            >
                                Dismiss
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Futuristic Status Bar & Navigation Deck */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/70 dark:bg-stone-900/70 border border-warm-border dark:border-stone-800 p-4 rounded-3xl backdrop-blur-xl shadow-lg" id="careermap-status-bar">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search filter for navigation check */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-2.5 text-warm-secondary" size={16} />
                            <input
                                type="text"
                                placeholder="Search branches or skills..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-warm-bg/55 dark:bg-stone-950/60 border border-warm-border dark:border-stone-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-purple text-xs text-warm-text dark:text-white font-bold placeholder:text-warm-secondary/70 w-56 transition-all"
                                id="careermap-search-input"
                            />
                        </div>

                        {/* AI Status Synergizer Indicator */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-warm-bg/55 dark:bg-stone-950/60 border border-warm-border dark:border-stone-850/80 rounded-xl text-[11px] font-bold text-warm-secondary dark:text-stone-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                            <span>{aiStatusMessage}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        {/* Profile badge metric */}
                        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-brand-purple/10 dark:bg-brand-purple/20 border border-brand-purple/20 dark:border-brand-purple/35 rounded-xl">
                            <div className="w-5 h-5 rounded-full bg-brand-purple/20 text-[9px] font-black flex items-center justify-center text-brand-purple dark:text-indigo-300 border border-brand-purple/30">
                                P
                            </div>
                            <span className="text-[10px] uppercase font-black text-brand-purple dark:text-indigo-350 tracking-wider">Level 3 Specialist</span>
                        </div>

                        {/* Target Role Recalculation Trigger */}
                        <div className="flex items-center gap-2 bg-warm-bg/50 dark:bg-stone-950/60 p-1 rounded-xl border border-warm-border dark:border-stone-850">
                            <input
                                type="text"
                                placeholder="Change Target Career..."
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                className="bg-transparent pl-3 pr-1 py-1 text-xs font-bold text-warm-text dark:text-white focus:outline-none placeholder:text-warm-secondary/60 w-40"
                                id="careermap-target-role"
                            />
                            <button
                                onClick={handleTriggerLiveAIReplan}
                                disabled={isGenerating || !targetRole.trim()}
                                className="px-3 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white font-black text-[10px] uppercase rounded-lg tracking-wider cursor-pointer disabled:opacity-40 select-none transition-all"
                                id="careermap-assemble-btn"
                            >
                                Assemble Tree
                            </button>
                        </div>
                    </div>
                </div>

                {/* Centerpiece Split Framework */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

                    {/* LEFT CANOPY PANEL: Tech Growth Tree Draggable Miro Stage */}
                    <div className="xl:col-span-8 flex flex-col space-y-4">

                        <div className="bg-white/80 dark:bg-stone-900/40 border border-warm-border dark:border-stone-800 rounded-[36px] overflow-hidden relative shadow-xl backdrop-blur-md" id="careermap-canvas-card">

                            {/* Floating controls panel on main canvas */}
                            <div className="absolute top-6 left-6 z-30 flex items-center gap-2 bg-white/90 dark:bg-stone-950/80 p-2 rounded-2xl border border-warm-border dark:border-stone-850 shadow-md backdrop-blur-md canvas-control">
                                <button
                                    onClick={() => { triggerTransitSound('click'); setZoom(prev => Math.min(prev + 0.1, 1.5)); }}
                                    className="p-2 bg-warm-bg dark:bg-stone-900 border border-warm-border dark:border-stone-800 rounded-xl hover:bg-badge-purple dark:hover:bg-stone-850 text-warm-text dark:text-stone-300 hover:text-brand-purple dark:hover:text-white transition-all cursor-pointer"
                                    title="Zoom In"
                                    id="careermap-zoom-in"
                                >
                                    <ZoomIn size={14} />
                                </button>
                                <div className="text-[10px] font-mono font-black px-2 text-warm-secondary dark:text-stone-400">
                                    {Math.round(zoom * 100)}%
                                </div>
                                <button
                                    onClick={() => { triggerTransitSound('click'); setZoom(prev => Math.max(prev - 0.1, 0.6)); }}
                                    className="p-2 bg-warm-bg dark:bg-stone-900 border border-warm-border dark:border-stone-800 rounded-xl hover:bg-badge-purple dark:hover:bg-stone-850 text-warm-text dark:text-stone-300 hover:text-brand-purple dark:hover:text-white transition-all cursor-pointer"
                                    title="Zoom Out"
                                    id="careermap-zoom-out"
                                >
                                    <ZoomOut size={14} />
                                </button>
                                <div className="h-4 w-px bg-warm-border dark:bg-stone-800" />
                                <button
                                    onClick={handleResetViewport}
                                    className="p-2 bg-warm-bg/60 dark:bg-stone-905/60 border border-warm-border dark:border-stone-850 hover:border-brand-purple/40 rounded-xl text-[10px] font-extrabold text-warm-text dark:text-stone-400 hover:text-brand-purple dark:hover:text-brand-purple transition-all uppercase tracking-wider cursor-pointer font-sans"
                                    title="Recenter and calibrate view coordinates"
                                    id="careermap-reset-view"
                                >
                                    Reset View
                                </button>
                            </div>

                            {/* Status Header Legend Overlay (Top Right of Stage) */}
                            <div className="absolute top-6 right-6 z-30 hidden sm:flex items-center gap-3 bg-white/95 dark:bg-stone-950/70 py-2 px-3 border border-warm-border dark:border-stone-800 rounded-xl text-[10px] font-bold text-warm-secondary dark:text-stone-400 backdrop-blur-sm shadow-sm canvas-control">
                                <span className="flex items-center gap-1.5 font-bold"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Complete</span>
                                <span className="flex items-center gap-1.5 font-bold"><span className="w-2 h-2 rounded-full bg-brand-purple animate-pulse" /> Active Node</span>
                                <span className="flex items-center gap-1.5 font-bold"><span className="w-2 h-2 rounded-full bg-warm-hint dark:bg-stone-700" /> Locked</span>
                                <span className="flex items-center gap-1.5 font-bold"><span className="w-2 h-2 rounded-full bg-brand-amber shadow-sm shadow-brand-amber" /> Hub Goal</span>
                            </div>

                            {/* Draggable Viewport stage area container */}
                            <div
                                className="w-full h-[640px] select-none overflow-hidden relative cursor-grab active:cursor-grabbing"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >

                                {/* Embedded Grid Wallpaper overlay panel */}
                                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#DDD5C8_1px,transparent_1px)] dark:bg-[radial-gradient(#333_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                                {/* Animated Loading Overlay when recalculating custom trees */}
                                <AnimatePresence>
                                    {isGenerating && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 z-50 bg-[#F6F2ECef] dark:bg-[#0c0a09ef] backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                                        >
                                            <div className="relative mb-6">
                                                {/* Circular processing scanning effect */}
                                                <div className="w-24 h-24 rounded-full border-4 border-dashed border-brand-purple animate-spin absolute inset-0 text-brand-purple" />
                                                <div className="w-24 h-24 rounded-full border-4 border-solid border-brand-purple/20 flex items-center justify-center">
                                                    <Compass className="text-brand-amber animate-pulse" size={40} />
                                                </div>
                                            </div>
                                            <div className="space-y-3 max-w-lg">
                                                <h4 className="text-lg font-extrabold text-warm-text dark:text-white">Synthesizing AI Career Growth Map</h4>
                                                <p className="text-xs text-warm-secondary font-mono dark:text-brand-amber h-10 overflow-hidden leading-relaxed animate-pulse">
                                                    {generatingLog}
                                                </p>

                                                {/* Custom status indicator tracker bar */}
                                                <div className="w-64 bg-warm-bg/50 dark:bg-stone-950 border border-warm-border dark:border-stone-800 p-1 rounded-full overflow-hidden mx-auto">
                                                    <motion.div
                                                        className="bg-gradient-to-r from-brand-purple to-brand-amber h-2 rounded-full"
                                                        style={{ width: `${generatingProgress}%` }}
                                                        transition={{ duration: 0.2 }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-warm-secondary block">Deploying neural node connections...</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Main Graph Component Canvas Group */}
                                <div
                                    className="absolute inset-0 select-none pb-12 transition-transform duration-75"
                                    style={{
                                        transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                                        transformOrigin: 'center center'
                                    }}
                                >

                                    {/* SVG LASER LINE CONNECTIONS TRACKS: High-end Cyber lines mapping */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none min-w-[1000px] min-h-[600px] z-10">
                                        <defs>
                                            <linearGradient id="cyberLaserGlowGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                                                <stop offset="0%" stopColor="#4F378B" />
                                                <stop offset="100%" stopColor="#D97706" />
                                            </linearGradient>
                                            <filter id="laserLineNeonFilter" x="-20%" y="-20%" width="140%" height="140%">
                                                <feGaussianBlur stdDeviation="5" result="blur" />
                                                <feMerge>
                                                    <feMergeNode in="blur" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                        </defs>

                                        {/* Simple Path connections drawer map helper */}
                                        {(() => {
                                            const connectionsList = [
                                                [1, 2], [1, 3],
                                                [2, 4], [2, 5],
                                                [3, 6], [3, 7],
                                                [4, 8], [5, 8], [6, 8], [7, 8],
                                                [8, 9]
                                            ];

                                            return connectionsList.map(([fromId, toId], idx) => {
                                                const fromNode = networkNodes.find(n => n.id === fromId);
                                                const toNode = networkNodes.find(n => n.id === toId);
                                                if (!fromNode || !toNode) return null;

                                                const isActivatedLine = completedMilestones.includes(fromId) && completedMilestones.includes(toId);
                                                const isPrimaryLine = completedMilestones.includes(fromId);

                                                return (
                                                    <g key={idx}>
                                                        {/* Outer dark underlying track */}
                                                        <line
                                                            x1={fromNode.x} y1={fromNode.y}
                                                            x2={toNode.x} y2={toNode.y}
                                                            stroke={theme === 'dark' ? '#1c1917' : '#DDD5C8'}
                                                            strokeWidth="8"
                                                            strokeLinecap="round"
                                                        />

                                                        {/* Inner standard track */}
                                                        <line
                                                            x1={fromNode.x} y1={fromNode.y}
                                                            x2={toNode.x} y2={toNode.y}
                                                            stroke={theme === 'dark' ? '#292524' : '#E7E2D8'}
                                                            strokeWidth="3"
                                                            strokeLinecap="round"
                                                        />

                                                        {/* Neon glowing overlay for completed paths */}
                                                        {isPrimaryLine && (
                                                            <motion.line
                                                                x1={fromNode.x} y1={fromNode.y}
                                                                x2={toNode.x} y2={toNode.y}
                                                                stroke={isActivatedLine ? '#D97706' : '#4F378B'}
                                                                strokeWidth="2.5"
                                                                strokeLinecap="round"
                                                                filter="url(#laserLineNeonFilter)"
                                                                style={{ strokeOpacity: 0.7 }}
                                                            />
                                                        )}

                                                        {/* Animated marching dash laser flow dots */}
                                                        {isPrimaryLine && (
                                                            <motion.line
                                                                x1={fromNode.x} y1={fromNode.y}
                                                                x2={toNode.x} y2={toNode.y}
                                                                stroke="#D97706"
                                                                strokeWidth="2.5"
                                                                strokeLinecap="round"
                                                                strokeDasharray="14, 50"
                                                                animate={{ strokeDashoffset: [-100, 100] }}
                                                                transition={{ ease: 'linear', duration: 5, repeat: Infinity }}
                                                            />
                                                        )}
                                                    </g>
                                                );
                                            });
                                        })()}
                                    </svg>

                                    {/* ACTIVE DRAGGABLE NODES ASSEMBLY ROWPORT */}
                                    <div className="absolute inset-0 z-20 min-w-[1000px] min-h-[600px] pointer-events-none">
                                        {networkNodes
                                            .filter(node =>
                                                searchQuery === '' ||
                                                node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                node.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
                                            )
                                            .map((node, index) => {
                                                const isCompleted = completedMilestones.includes(node.id);
                                                const isSelected = selectedNodeId === node.id;

                                                // Active check
                                                const isCurrentActiveNode = node.id === selectedNodeId;
                                                const isLocked = !isCompleted && !isCurrentActiveNode && node.id > 1 && !completedMilestones.includes(node.id - 1);

                                                // Dynamic styling variables
                                                let nodeOuterGlow = 'border-[#DDD5C8] bg-white text-warm-text dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100';
                                                if (node.id === 9) {
                                                    // Goals hub glows deeply values
                                                    nodeOuterGlow = 'border-brand-amber bg-white dark:bg-stone-900 shadow-[0_0_25px_rgba(217,119,6,0.3)] text-brand-amber';
                                                } else if (isCompleted) {
                                                    nodeOuterGlow = 'border-emerald-500 bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
                                                } else if (isCurrentActiveNode) {
                                                    nodeOuterGlow = 'border-brand-purple bg-badge-purple dark:bg-stone-900/60 text-brand-purple dark:text-indigo-400 shadow-[0_0_20px_rgba(79,55,139,0.4)]';
                                                } else if (isLocked) {
                                                    nodeOuterGlow = 'border-warm-border bg-warm-bg/50 text-warm-hint dark:border-stone-850 dark:bg-stone-950/70 dark:text-stone-600 opacity-60';
                                                }

                                                return (
                                                    <motion.div
                                                        key={node.id}
                                                        style={{
                                                            position: 'absolute',
                                                            left: `${node.x}px`,
                                                            top: `${node.y}px`,
                                                            transform: 'translate(-50%, -50%)',
                                                        }}
                                                        className="pointer-events-auto map-node"
                                                    >

                                                        {/* Sentry active circular waves */}
                                                        {isCurrentActiveNode && (
                                                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-brand-purple/20 border border-brand-purple/50 animate-ping pointer-events-none -z-10" />
                                                        )}

                                                        {/* Node Orb trigger */}
                                                        <button
                                                            onClick={() => {
                                                                triggerTransitSound('click');
                                                                setSelectedNodeId(node.id);
                                                            }}
                                                            className={`w-14 h-14 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center cursor-pointer relative group ${nodeOuterGlow}`}
                                                            id={`careermap-node-trigger-${node.id}`}
                                                        >
                                                            <span className="absolute -top-1.5 -right-1.5 text-[8px] font-black w-4.5 h-4.5 rounded bg-warm-bg dark:bg-stone-950 border border-warm-border dark:border-stone-800 text-warm-secondary dark:text-stone-400 flex items-center justify-center">
                                                                {node.id}
                                                            </span>

                                                            {node.id === 9 ? (
                                                                <Award size={20} className="animate-pulse" />
                                                            ) : isCompleted ? (
                                                                <Check size={18} className="stroke-[3px]" />
                                                            ) : isLocked ? (
                                                                <GitCommit size={18} className="rotate-45" />
                                                            ) : (
                                                                <Brain size={18} />
                                                            )}
                                                        </button>

                                                        {/* Inline label descriptions display for fast understanding */}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 text-center w-40 mt-2 pointer-events-none space-y-0.5">
                                                            <h5 className={`text-[11px] font-black tracking-tight leading-none truncate ${isSelected ? 'text-brand-purple dark:text-indigo-400' : 'text-warm-text dark:text-stone-300'
                                                                }`}>
                                                                {node.title}
                                                            </h5>
                                                            <span className="text-[9px] font-bold text-warm-secondary dark:text-stone-500 block truncate italic">
                                                                {node.subtitle}
                                                            </span>
                                                        </div>

                                                    </motion.div>
                                                );
                                            })}
                                    </div>

                                </div>

                            </div>

                            {/* Floating Bottom Navigation Hints overlay */}
                            <div className="absolute bottom-6 left-6 z-30 flex items-center gap-2 text-[10px] font-bold text-warm-secondary dark:text-slate-500 pointer-events-none">
                                <Navigation size={12} className="text-brand-purple" />
                                <span>Scroll or Drag to Pan the Neural Pathway Stage</span>
                            </div>
                        </div>



                    </div>

                    {/* RIGHT TOWER PANEL: Dynamic Selected Node Operations Desk */}
                    <div className="xl:col-span-4 space-y-4">

                        <div className="bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800 p-6 sm:p-7 rounded-[36px] shadow-xl relative overflow-hidden backdrop-blur-md space-y-6" id="careermap-node-details-card">

                            <div className="absolute -top-12 -right-12 w-28 h-28 bg-brand-purple/5 rounded-full blur-xl pointer-events-none" />

                            {/* Sentry node description banner panel */}
                            <div className="flex justify-between items-start gap-4 border-b border-warm-border dark:border-stone-800 pb-5">
                                <div className="space-y-1.5">
                                    <div className="inline-flex items-center gap-1.5 bg-warm-bg dark:bg-stone-950 text-warm-secondary dark:text-slate-400 border border-warm-border dark:border-stone-850 px-3 py-1 rounded-lg text-[9px] font-mono font-black uppercase">
                                        Stage Node STP-0{activeNode.id}
                                    </div>
                                    <h3 className="text-xl font-black text-warm-text dark:text-white leading-tight">
                                        {activeNode.title}
                                    </h3>
                                    <span className="text-xs text-brand-purple dark:text-indigo-400 font-extrabold block">
                                        {activeNode.subtitle}
                                    </span>
                                </div>

                                <div className="p-3 bg-brand-purple/10 border border-brand-purple/20 rounded-2xl text-brand-purple shadow-sm">
                                    <Sliders size={18} />
                                </div>
                            </div>

                            {/* Interactive task criteria paragraph */}
                            <div className="space-y-2">
                                <span className="text-[9px] uppercase font-black text-warm-secondary dark:text-slate-450 tracking-wider">Milestone Diagnostic Checklist</span>
                                <p className="text-xs text-warm-text dark:text-stone-300 leading-relaxed font-semibold bg-warm-bg/60 dark:bg-stone-950/60 border border-warm-border dark:border-stone-850 p-4 rounded-2xl">
                                    {activeNode.details}
                                </p>
                            </div>

                            {/* Estimate metrics table blocks */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-warm-bg/50 dark:bg-stone-950 rounded-2xl border border-warm-border/50 dark:border-stone-850/80">
                                    <span className="text-[8px] uppercase tracking-wider text-warm-secondary dark:text-stone-500 font-extrabold block mb-0.5">Estimated Master Time</span>
                                    <p className="text-xs font-black text-warm-text dark:text-white flex items-center gap-1 truncate">
                                        <Clock size={13} className="text-brand-purple" />
                                        {activeNode.estimatedHours}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleToggleMilestone(activeNode.id)}
                                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer select-none ${completedMilestones.includes(activeNode.id)
                                            ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                            : 'bg-brand-purple/10 border-brand-purple/20 hover:bg-brand-purple/15 hover:border-brand-purple/45 text-brand-purple'
                                        }`}
                                    id="careermap-toggle-milestone"
                                >
                                    <span className="text-[8px] uppercase tracking-wider text-warm-secondary dark:text-stone-500 font-extrabold block mb-0.5">
                                        Action Status
                                    </span>
                                    <p className="text-xs font-black flex items-center gap-1 truncate select-none">
                                        {completedMilestones.includes(activeNode.id) ? (
                                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-extrabold"><Check size={13} strokeWidth={3} /> Completed</span>
                                        ) : (
                                            <span className="text-brand-purple flex items-center gap-1 font-extrabold"><Circle size={13} /> Mark Complete</span>
                                        )}
                                    </p>
                                </button>
                            </div>

                            {/* Sentry benchmark goals checklist labels */}
                            <div className="space-y-2">
                                <span className="text-[9px] uppercase font-black text-warm-secondary dark:text-slate-450 tracking-wider">Fitted Target Skills</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {activeNode.skillsTargeted.map((skill, sIdx) => (
                                        <span
                                            key={sIdx}
                                            className="text-[10px] font-mono font-black text-warm-text bg-warm-bg dark:text-stone-300 dark:bg-stone-950 px-2.5 py-1 rounded-lg border border-warm-border/60 dark:border-stone-850"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Symmetrical AI generated typed suggestions panel */}
                            <div className="rounded-2xl border border-dashed border-warm-border dark:border-slate-800 bg-warm-bg/40 dark:bg-stone-950/40 p-4 relative space-y-2" id="careermap-ai-recommendation">
                                <span className="text-[9px] uppercase tracking-widest text-brand-purple dark:text-[#06B6D4] font-black flex items-center gap-1.5">
                                    <Sparkles size={11} className="text-brand-purple dark:text-cyan-400 animate-spin-slow" />
                                    AI Synergy Recommendation
                                </span>

                                {/* Typewriter message string display */}
                                <p className="text-xs text-warm-text dark:text-slate-300 font-bold min-h-12 leading-relaxed">
                                    {typedAdvice}
                                    <span className="w-1.5 h-3.5 bg-brand-purple dark:bg-cyan-400 inline-block animate-pulse ml-0.5" />
                                </p>

                                <div className="flex justify-between items-center text-[8px] font-mono font-black text-warm-secondary dark:text-slate-500 pt-1 border-t border-warm-border dark:border-slate-900">
                                    <span>Gemini multi-agent feedback model</span>
                                    <span>Confidence Multiplier: {confidenceIndex}%</span>
                                </div>
                            </div>

                            {/* Station clearance togglers and Immediate route portals */}
                            <div className="pt-4 border-t border-warm-border dark:border-stone-800 space-y-3">
                                {/* Live component navigator link */}
                                <button
                                    onClick={() => {
                                        triggerTransitSound('click');
                                        navigate(activeNode.actionRoute);
                                    }}
                                    className="w-full flex items-center justify-center gap-1.5 p-3.5 bg-brand-purple hover:bg-brand-purple/95 text-white rounded-2xl font-black text-xs cursor-pointer select-none transition-all shadow-lg"
                                    id="careermap-enter-hub"
                                >
                                    <Play size={12} fill="white" />
                                    <span>Enter {activeNode.actionText} Hub</span>
                                    <ChevronRight size={12} />
                                </button>
                            </div>

                        </div>

                        {/* AI Custom Project suggestion popups (Bottom of right deck) */}
                        <div className="bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800/80 p-5 rounded-[28px] flex items-center justify-between gap-4 shadow-sm" id="careermap-sample-task">
                            <div className="space-y-1">
                                <span className="text-[8px] uppercase tracking-widest text-brand-purple dark:text-indigo-400 font-extrabold block">Fitted Practice Task</span>
                                <span className="text-xs text-warm-text dark:text-white font-extrabold block">GitHub Mock System Audit</span>
                                <span className="text-[10px] text-warm-secondary dark:text-slate-505 font-semibold block">Create scalable components using Docker.</span>
                            </div>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noreferrer"
                                className="p-3 bg-warm-bg hover:bg-badge-purple/40 border border-warm-border text-warm-text dark:bg-stone-950 dark:border-stone-800 dark:hover:border-stone-700 dark:text-stone-300 dark:hover:text-white rounded-2xl transition-all"
                                id="careermap-task-link"
                            >
                                <ArrowUpRight size={16} />
                            </a>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};
