import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus,
    Download, Bell, Clock, Briefcase, Trash2, Edit, MapPin,
    AlertCircle, CheckCircle2, Volume2, ShieldCheck, HelpCircle, Save
} from 'lucide-react';

interface MockInterviewEvent {
    id: string;
    role: string;
    company: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    type: 'Technical' | 'Behavioral' | 'Coding' | 'HR' | 'System Design';
    location: string;
    notes: string;
    reminderSent?: boolean;
}

export const CalendarPage: React.FC = () => {
    // State for events stored in localStorage
    const [events, setEvents] = useState<MockInterviewEvent[]>(() => {
        const saved = localStorage.getItem('interview_events');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed parsing calendar events:", e);
            }
        }
        // Seed initial events in the future
        const today = new Date();
        const in3Days = new Date(today);
        in3Days.setDate(today.getDate() + 3);
        const in7Days = new Date(today);
        in7Days.setDate(today.getDate() + 7);

        const seed: MockInterviewEvent[] = [
            {
                id: 'seed-1',
                role: 'Senior Frontend Engineer',
                company: 'Stripe Inc.',
                date: in3Days.toISOString().split('T')[0],
                time: '14:30',
                type: 'Coding',
                location: 'Virtual Zoom / CoderPad',
                notes: 'Brush up on advanced layout algorithms, React 18 concurrent features, and system optimization.',
                reminderSent: false
            },
            {
                id: 'seed-2',
                role: 'Solutions Architect',
                company: 'Google Cloud Platform',
                date: in7Days.toISOString().split('T')[0],
                time: '11:00',
                type: 'System Design',
                location: 'Google Meet',
                notes: 'Focus on global load balancing, relational vs non-relational database trade-offs at extreme scale.',
                reminderSent: false
            }
        ];
        localStorage.setItem('interview_events', JSON.stringify(seed));
        return seed;
    });

    // Calendar dates navigation states
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [selectedDayEvents, setSelectedDayEvents] = useState<MockInterviewEvent[]>([]);
    const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);

    // Form states for creating/editing events
    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editingEvent, setEditingEvent] = useState<MockInterviewEvent | null>(null);
    const [formRole, setFormRole] = useState('');
    const [formCompany, setFormCompany] = useState('');
    const [formDate, setFormDate] = useState('');
    const [formTime, setFormTime] = useState('');
    const [formType, setFormType] = useState<MockInterviewEvent['type']>('Technical');
    const [formLocation, setFormLocation] = useState('');
    const [formNotes, setFormNotes] = useState('');

    // Toast notifications state
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'alert'>('success');

    // Trigger quick notifications helper
    const showToast = (msg: string, type: 'success' | 'alert' = 'success') => {
        setToastMessage(msg);
        setToastType(type);
        setTimeout(() => {
            setToastMessage(null);
        }, 4500);
    };

    // Sync state back to local storage
    useEffect(() => {
        localStorage.setItem('interview_events', JSON.stringify(events));
    }, [events]);

    // Sync selected day events whenever events or selected date change
    useEffect(() => {
        const filtered = events.filter(e => e.date === selectedDateStr);
        setSelectedDayEvents(filtered);
    }, [events, selectedDateStr]);

    // Request system alert notification permissions upon component mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().catch(err => {
                console.warn("Requested custom permission alert error:", err);
            });
        }
    }, []);

    // Background checker executing every 10 seconds to prompt user when scheduled time arrives
    useEffect(() => {
        const checkInterval = setInterval(() => {
            const now = new Date();

            // Format current YYYY-MM-DD local values
            const yearStr = now.getFullYear();
            const monthStr = String(now.getMonth() + 1).padStart(2, '0');
            const dayStr = String(now.getDate()).padStart(2, '0');
            const todayDateStr = `${yearStr}-${monthStr}-${dayStr}`;

            // Format current HH:MM local values
            const hourStr = String(now.getHours()).padStart(2, '0');
            const minStr = String(now.getMinutes()).padStart(2, '0');
            const timeStr = `${hourStr}:${minStr}`;

            let updated = false;
            const mappedEvents = events.map(ev => {
                if (ev.date === todayDateStr && ev.time === timeStr && !ev.reminderSent) {
                    // Play synthesized audio bell
                    playAudibleBell(true);

                    // Trigger standard system audio notifications and custom rich alert banners
                    showToast(`🚨 ATTENTION: Scheduled ${ev.type} Interview at ${ev.company} (${ev.role}) is starting now!`, 'success');

                    // Trigger Web API Notification if browser permitted
                    if ('Notification' in window && Notification.permission === 'granted') {
                        try {
                            new Notification(`Interview Session Started! 🚀`, {
                                body: `${ev.type} interview for ${ev.role} role at ${ev.company} starts now (${ev.time}).`,
                                tag: ev.id,
                                requireInteraction: true
                            });
                        } catch (err) {
                            console.warn("Could not dispatch web notify payload:", err);
                        }
                    }

                    updated = true;
                    return { ...ev, reminderSent: true };
                }
                return ev;
            });

            if (updated) {
                setEvents(mappedEvents);
            }
        }, 10000);

        return () => clearInterval(checkInterval);
    }, [events]);

    // Generate web synthesizer bell notification to give amazing craft experience
    const playAudibleBell = (isAutomatic = false) => {
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();

            // Node 1: Clear metallic chime
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime); // Pitch high A chime
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3); // Ramp down to A4

            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8); // Smooth ring-out

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.8);
            if (!isAutomatic) {
                showToast("Bell reminder chime verified successfully!");
            }
        } catch (err) {
            console.warn("Could not trigger synthesizer node audio:", err);
        }
    };

    // Generate standard Universal ICS Calendar Event to download and sync locally
    const exportToLocalCalendar = (event: MockInterviewEvent) => {
        try {
            const formatIcsDate = (dateStr: string, timeStr: string) => {
                const d = new Date(`${dateStr}T${timeStr || '00:00'}`);
                return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
            };

            const dStart = formatIcsDate(event.date, event.time);

            // Compute end time: Add 1 hour by default
            let endHours = parseInt(event.time.split(":")[0]) + 1;
            let minStr = event.time.split(":")[1] || "00";
            if (endHours >= 24) endHours = 23;
            const endHoursStr = endHours < 10 ? `0${endHours}` : `${endHours}`;
            const dEnd = formatIcsDate(event.date, `${endHoursStr}:${minStr}`);

            const icsLines = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//CareerMap//Interview Sync//EN",
                "BEGIN:VEVENT",
                `UID:${event.id}`,
                `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
                `DTSTART:${dStart}`,
                `DTEND:${dEnd}`,
                `SUMMARY:Interview with ${event.company} (${event.type})`,
                `DESCRIPTION:Job Role: ${event.role}\\nInterview Category: ${event.type}\\n\\nNotes from CareerMap: ${event.notes || 'None'}`,
                `LOCATION:${event.location || 'Virtual / Online'}`,
                "BEGIN:VALARM",
                "TRIGGER:-PT15M", // 15 mins reminder embedded
                "ACTION:DISPLAY",
                "DESCRIPTION:Upcoming Real-world Interview",
                "END:VALARM",
                "END:VEVENT",
                "END:VCALENDAR"
            ];

            const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const tempLink = document.createElement("a");
            tempLink.href = url;
            tempLink.download = `career-sync-${event.company.toLowerCase().replace(/\s+/g, '-')}.ics`;
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            showToast(`.ics Calendar sync file exported for ${event.company}!`);
        } catch (err) {
            console.error(err);
            showToast("Sync file compilation failed.", "alert");
        }
    };

    // Form handle create or edit
    const handleSubmitForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formRole || !formCompany || !formDate || !formTime) {
            showToast("Please provide job role, company name, date, and time.", "alert");
            return;
        }

        if (editingEvent) {
            // Edit mode
            const updated = events.map(ev => ev.id === editingEvent.id ? {
                ...ev,
                role: formRole,
                company: formCompany,
                date: formDate,
                time: formTime,
                type: formType,
                location: formLocation,
                notes: formNotes,
                reminderSent: false
            } : ev);
            setEvents(updated);
            showToast(`Successfully updated interview with ${formCompany}!`);
        } else {
            // Create mode
            const newEv: MockInterviewEvent = {
                id: `local-evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                role: formRole,
                company: formCompany,
                date: formDate,
                time: formTime,
                type: formType,
                location: formLocation || 'Virtual/Zoom Link',
                notes: formNotes || 'No specific metadata notes supplied.',
                reminderSent: false
            };
            setEvents([...events, newEv]);
            showToast(`Interview with ${formCompany} scheduled!`);
        }

        // Reset fields
        handleCloseModal();
    };

    const startEditEvent = (ev: MockInterviewEvent) => {
        setEditingEvent(ev);
        setFormRole(ev.role);
        setFormCompany(ev.company);
        setFormDate(ev.date);
        setFormTime(ev.time);
        setFormType(ev.type);
        setFormLocation(ev.location);
        setFormNotes(ev.notes);
        setShowFormModal(true);
    };

    const startNewEventAtDate = (dateStr: string) => {
        setEditingEvent(null);
        setFormRole('');
        setFormCompany('');
        setFormDate(dateStr);
        setFormTime('13:00');
        setFormType('Technical');
        setFormLocation('Virtual Zoom / Teams Video');
        setFormNotes('');
        setShowFormModal(true);
    };

    const deleteScheduledEvent = (id: string, name: string) => {
        setEvents(events.filter(ev => ev.id !== id));
        showToast(`Removed scheduled interview for ${name}.`);
    };

    const handleCloseModal = () => {
        setShowFormModal(false);
        setEditingEvent(null);
    };

    // Calendar dates processing
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // day of week

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Render days array: blank offsets, then active dates
    const datesArray: (number | null)[] = [];
    for (let s = 0; s < firstDayIndex; s++) {
        datesArray.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        datesArray.push(d);
    }

    // Quick helper to fetch color styles for interview type tags
    const getInterviewStyles = (type: MockInterviewEvent['type']) => {
        switch (type) {
            case 'Technical': return 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-500/10';
            case 'Coding': return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10';
            case 'System Design': return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10';
            case 'Behavioral': return 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-500/10';
            case 'HR': return 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-500/10';
        }
    };

    // Quick checker to identify active events on a given date (d)
    const getEventsForDay = (day: number): MockInterviewEvent[] => {
        const formattedD = day < 10 ? `0${day}` : `${day}`;
        const formattedM = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
        const key = `${year}-${formattedM}-${formattedD}`;
        return events.filter(e => e.date === key);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-warm-bg dark:bg-stone-950">

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${toastType === 'success'
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900/50'
                                : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-900/50'
                            }`}
                    >
                        {toastType === 'success' ? <CheckCircle2 className="text-emerald-500 shrink-0" size={18} /> : <AlertCircle className="text-rose-500 shrink-0" size={18} />}
                        <span className="text-xs font-semibold leading-relaxed tracking-tight">{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Title Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-warm-border dark:border-stone-850 gap-4">
                <div>
                    <span className="text-[10px] font-black bg-brand-purple/10 text-brand-purple px-3 py-1 rounded-full uppercase tracking-widest cursor-default">
                        Time Synchronization
                    </span>
                    <h1 className="text-4xl font-black text-warm-text dark:text-white mt-1 leading-tight tracking-tight italic">
                        Interview Sync Calendar
                    </h1>
                    <p className="text-sm font-semibold text-warm-secondary mt-1 max-w-2xl">
                        Schedule upcoming real-world interviews, visualize dates, toggle custom synthetic audio reminders, and sync events with local devices.
                    </p>
                </div>

                {/* Floating action buttons */}
                <div className="flex items-center gap-2.5 shrink-0">
                    <button
                        onClick={() => playAudibleBell(false)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 dark:bg-stone-850 border border-warm-border/65 dark:border-stone-800 rounded-xl text-xs font-bold uppercase tracking-wider text-warm-secondary dark:text-stone-300 hover:text-brand-purple hover:bg-white dark:hover:bg-stone-800 transition duration-300"
                    >
                        <Volume2 size={15} /> Test Chime
                    </button>
                    <button
                        onClick={() => startNewEventAtDate(selectedDateStr)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-purple text-white shadow-lg shadow-brand-purple/15 rounded-xl text-xs font-black uppercase tracking-wider hover:transform hover:-translate-y-0.5 transition duration-300"
                    >
                        <Plus size={15} /> New Interview
                    </button>
                </div>
            </div>

            {/* Main Grid Block */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* LEFT COLUMN: Large interactive month grid */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="card-3d p-6 relative">

                        {/* Header Control row */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <CalendarIcon className="text-brand-purple" size={22} />
                                <h2 className="text-xl font-black text-warm-text dark:text-white italic tracking-tight uppercase">
                                    {monthNames[month]} {year}
                                </h2>
                            </div>

                            <div className="flex items-center bg-stone-50 dark:bg-stone-900 border border-warm-border/40 dark:border-stone-850 rounded-xl p-1 shrink-0">
                                <button
                                    onClick={handlePrevMonth}
                                    className="p-1.5 text-warm-secondary hover:text-brand-purple rounded-lg transition"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <div className="h-4 w-[1px] bg-warm-border dark:bg-stone-800 mx-1" />
                                <button
                                    onClick={handleNextMonth}
                                    className="p-1.5 text-warm-secondary hover:text-brand-purple rounded-lg transition"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Days of week static label row */}
                        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase tracking-wider text-warm-hint mb-3">
                            <div>Sun</div>
                            <div>Mon</div>
                            <div>Tue</div>
                            <div>Wed</div>
                            <div>Thu</div>
                            <div>Fri</div>
                            <div>Sat</div>
                        </div>

                        {/* Interactive month cells grid */}
                        <div className="grid grid-cols-7 gap-2 md:gap-3">
                            {datesArray.map((day, idx) => {
                                if (day === null) {
                                    return (
                                        <div
                                            key={`empty-${idx}`}
                                            className="aspect-square bg-stone-50/20 dark:bg-stone-900/10 border border-dashed border-warm-border/10 dark:border-stone-900/20 rounded-2xl"
                                        />
                                    );
                                }

                                // Format state date to string match index
                                const formattedD = day < 10 ? `0${day}` : `${day}`;
                                const formattedM = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
                                const cellDateStr = `${year}-${formattedM}-${formattedD}`;

                                const isSelected = selectedDateStr === cellDateStr;
                                const isToday = new Date().toISOString().split('T')[0] === cellDateStr;
                                const dayEvents = getEventsForDay(day);

                                return (
                                    <div
                                        key={`day-${day}`}
                                        onClick={() => setSelectedDateStr(cellDateStr)}
                                        className={`aspect-square p-2 border transition-all duration-300 relative cursor-pointer select-none rounded-2xl flex flex-col justify-between overflow-hidden ${isSelected
                                                ? 'border-brand-purple bg-white dark:bg-stone-900 shadow-md shadow-brand-purple/5'
                                                : isToday
                                                    ? 'border-brand-purple/50 bg-brand-purple/5 hover:border-brand-purple'
                                                    : 'border-warm-border/30 dark:border-stone-850/80 bg-stone-50/30 dark:bg-stone-900/10 hover:border-brand-purple/20 hover:bg-white dark:hover:bg-stone-900/40'
                                            }`}
                                    >
                                        {/* Day number label */}
                                        <span className={`text-xs font-mono font-extrabold ${isToday
                                                ? 'text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-lg w-max'
                                                : isSelected ? 'text-brand-purple' : 'text-warm-text dark:text-stone-300'
                                            }`}>
                                            {day}
                                        </span>

                                        {/* Miniature cell content */}
                                        {dayEvents.length > 0 && (
                                            <div className="space-y-1 w-full text-[10px] mt-1 pr-0.5">
                                                {/* Desktop: tiny pill labels */}
                                                <div className="hidden sm:block space-y-1">
                                                    {dayEvents.slice(0, 2).map(ev => (
                                                        <div
                                                            key={ev.id}
                                                            className="px-1.5 py-0.5 font-bold truncate rounded-md text-[8px] bg-brand-purple/10 dark:bg-brand-purple/30 text-brand-purple leading-tight"
                                                        >
                                                            {ev.company}
                                                        </div>
                                                    ))}
                                                    {dayEvents.length > 2 && (
                                                        <div className="text-[7px] text-warm-hint font-black text-right pr-1">
                                                            +{dayEvents.length - 2} more
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Mobile: dot indicators */}
                                                <div className="sm:hidden flex flex-wrap gap-1 mt-auto">
                                                    {dayEvents.map(ev => (
                                                        <span
                                                            key={ev.id}
                                                            className="w-1.5 h-1.5 rounded-full bg-brand-purple"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Guide legend */}
                        <div className="mt-6 flex items-center justify-between border-t border-warm-border/40 dark:border-stone-850 pt-4 text-xs font-semibold text-warm-secondary">
                            <span className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full border border-brand-purple bg-brand-purple/5" /> Selected Day
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-brand-purple" /> Scheduled Interview
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded text-[9px] px-1 font-mono bg-brand-purple/10 text-brand-purple leading-none">Today</span> Real-world Date
                            </span>
                        </div>
                    </div>

                    {/* Calendar Anchor Quick sync reminder card */}
                    <div className="p-5 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 rounded-3xl border border-emerald-500/10 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                                <ShieldCheck size={14} /> Local Device Synchronization Enabled
                            </p>
                            <h3 className="text-sm font-bold text-warm-text dark:text-white">
                                How does calendar sync work?
                            </h3>
                            <p className="text-xs text-warm-secondary leading-relaxed">
                                Clicking the "Sync Export" button downloads a compiled, standard <strong>.ics payload</strong>. Open this payload on your smartphone or computer to sync instantly with Google Calendar, Apple Calendar, or Outlook.
                            </p>
                        </div>
                        <HelpCircle size={24} className="text-emerald-500/30 shrink-0 hidden sm:block" />
                    </div>
                </div>

                {/* RIGHT COLUMN: Active Selected Date schedule detail timeline & notifications */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Card: Events Scheduled for Selected Day */}
                    <div className="card-3d p-6 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-warm-border/40 dark:border-stone-850">
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-black uppercase tracking-widest text-warm-hint">Agenda Focus</p>
                                <h3 className="text-sm font-black text-warm-text dark:text-white uppercase tracking-tight">
                                    {new Date(selectedDateStr + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                </h3>
                            </div>
                            <button
                                onClick={() => startNewEventAtDate(selectedDateStr)}
                                className="p-1 px-2 text-[10px] font-bold bg-brand-purple/10 text-brand-purple rounded-lg flex items-center gap-1 uppercase tracking-wider"
                            >
                                <Plus size={12} /> Schedule
                            </button>
                        </div>

                        {/* List Events or blank view */}
                        <div className="space-y-3.5 max-h-[380px] overflow-y-auto customize-scrollbar text-left">
                            {selectedDayEvents.length > 0 ? (
                                selectedDayEvents.map(ev => (
                                    <div
                                        key={ev.id}
                                        className="p-4 bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-warm-border/30 dark:border-stone-850 hover:border-brand-purple/20 transition-all flex flex-col gap-3"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-0.5">
                                                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${getInterviewStyles(ev.type)}`}>
                                                    {ev.type}
                                                </span>
                                                <h4 className="font-extrabold text-sm text-warm-text dark:text-white mt-1">
                                                    {ev.role}
                                                </h4>
                                                <p className="text-xs text-warm-secondary font-semibold">
                                                    {ev.company}
                                                </p>
                                            </div>

                                            {/* Event node actions */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    onClick={() => startEditEvent(ev)}
                                                    className="p-1.5 text-stone-400 hover:text-indigo-650 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition"
                                                    title="Edit event"
                                                >
                                                    <Edit size={13} />
                                                </button>
                                                <button
                                                    onClick={() => deleteScheduledEvent(ev.id, ev.company)}
                                                    className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition"
                                                    title="Delete Event"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Metadata specs */}
                                        <div className="space-y-2 text-[11px] text-warm-secondary border-t border-warm-border/20 dark:border-stone-850 pt-2.5">
                                            <div className="flex items-center gap-2">
                                                <Clock size={12} className="text-brand-purple shrink-0" />
                                                <span className="font-semibold text-warm-text dark:text-stone-300">{ev.time} Local Session</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={12} className="text-brand-purple shrink-0" />
                                                <span className="truncate">{ev.location}</span>
                                            </div>
                                            {ev.notes && (
                                                <p className="text-stone-400 italic text-[11px] font-medium leading-relaxed mt-1">
                                                    "{ev.notes}"
                                                </p>
                                            )}
                                        </div>

                                        {/* Export Action button */}
                                        <button
                                            onClick={() => exportToLocalCalendar(ev)}
                                            className="w-full py-2 bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 hover:text-brand-purple hover:border-brand-purple/40 transition"
                                        >
                                            <Download size={11} /> Sync / Export Event
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 space-y-3.5">
                                    <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-warm-hint mx-auto">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-warm-secondary font-bold">No Scheduled Interviews Today</p>
                                        <p className="text-[10px] text-warm-hint mt-0.5">Select another grid cell or click 'Schedule' above to add interviews.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card: All Upcoming Interviews Tracker list */}
                    <div className="card-3d p-6 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-warm-border/40 dark:border-stone-850">
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-black uppercase tracking-widest text-warm-hint">Timeline Progression</p>
                                <h3 className="text-sm font-black text-warm-text dark:text-white uppercase tracking-tight">
                                    Upcoming Schedules ({events.length})
                                </h3>
                            </div>
                            <Bell className="text-brand-purple" size={16} />
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto customize-scrollbar text-left">
                            {events.length > 0 ? (
                                [...events]
                                    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                                    .map(ev => {
                                        const diffDays = Math.ceil((new Date(ev.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                        return (
                                            <div
                                                key={`all-${ev.id}`}
                                                onClick={() => setSelectedDateStr(ev.date)}
                                                className="p-3 bg-stone-50/50 dark:bg-stone-900/10 hover:bg-white dark:hover:bg-stone-900/40 rounded-xl border border-warm-border/30 dark:border-stone-850 cursor-pointer transition flex items-center justify-between gap-3"
                                            >
                                                <div className="space-y-0.5 min-w-0">
                                                    <h4 className="font-extrabold text-xs text-warm-text dark:text-white truncate">
                                                        {ev.role}
                                                    </h4>
                                                    <div className="flex items-center gap-1.5 text-[9px] text-warm-hint font-bold">
                                                        <span>{ev.company}</span>
                                                        <span>•</span>
                                                        <span>{new Date(ev.date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-[9px] font-black uppercase tracking-widest bg-badge-purple text-brand-purple px-1.5 py-0.5 rounded-md">
                                                        {diffDays <= 0 ? 'Today' : `${diffDays}d left`}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                            ) : (
                                <div className="text-center py-6 text-warm-hint">
                                    <p className="text-xs font-mono">No upcoming scheduled items</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* FORM DIALOG MODAL / DRAWER */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-slate-205 dark:border-stone-800 shadow-2xl max-w-lg w-full text-left space-y-6 relative max-h-[90vh] overflow-y-auto customize-scrollbar"
                    >
                        <div className="flex justify-between items-center pb-3 border-b border-warm-border/40 dark:border-stone-850">
                            <h3 className="text-lg font-black text-warm-text dark:text-white uppercase tracking-tight italic flex items-center gap-2">
                                <CalendarIcon size={18} className="text-brand-purple" /> {editingEvent ? 'Modifier Interview Node' : 'Schedule Real-world Interview'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-warm-secondary hover:text-brand-purple transition font-bold"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={handleSubmitForm} className="space-y-4">

                            {/* Role & Company Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-warm-hint">Job Role Header</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Senior Frontend Dev"
                                        value={formRole}
                                        onChange={(e) => setFormRole(e.target.value)}
                                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-warm-border/60 dark:border-stone-850 rounded-xl text-xs font-medium focus:border-brand-purple focus:outline-none transition"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-warm-hint">Company Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Stripe Inc."
                                        value={formCompany}
                                        onChange={(e) => setFormCompany(e.target.value)}
                                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-warm-border/60 dark:border-stone-850 rounded-xl text-xs font-medium focus:border-brand-purple focus:outline-none transition"
                                    />
                                </div>
                            </div>

                            {/* Date & Time Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-warm-hint">Interview Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formDate}
                                        onChange={(e) => setFormDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-warm-border/60 dark:border-stone-850 rounded-xl text-xs font-medium focus:border-brand-purple focus:outline-none transition"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-warm-hint">Interview Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={formTime}
                                        onChange={(e) => setFormTime(e.target.value)}
                                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-warm-border/60 dark:border-stone-850 rounded-xl text-xs font-medium focus:border-brand-purple focus:outline-none transition"
                                    />
                                </div>
                            </div>

                            {/* Interview Category Dropdown */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-warm-hint">Interview Category</label>
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                    {(['Technical', 'Behavioral', 'Coding', 'HR', 'System Design'] as MockInterviewEvent['type'][]).map(type => (
                                        <button
                                            type="button"
                                            key={type}
                                            onClick={() => setFormType(type)}
                                            className={`py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition ${formType === type
                                                    ? 'border-brand-purple bg-brand-purple/10 text-brand-purple'
                                                    : 'border-warm-border/50 bg-stone-50/20 text-warm-secondary hover:border-brand-purple/20'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Location Input */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-warm-hint">In-Person Location or Web Video Link</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Zoom Link, Teams Web Link, or Head Office SF Address"
                                    value={formLocation}
                                    onChange={(e) => setFormLocation(e.target.value)}
                                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-warm-border/60 dark:border-stone-850 rounded-xl text-xs font-medium focus:border-brand-purple focus:outline-none transition"
                                />
                            </div>

                            {/* Notes Context Textarea */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-warm-hint">Preparation Notes & Context</label>
                                <textarea
                                    placeholder="Notes, names of recruiters, specific frameworks or projects to highlight..."
                                    value={formNotes}
                                    onChange={(e) => setFormNotes(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-warm-border/60 dark:border-stone-850 rounded-xl text-xs font-medium focus:border-brand-purple focus:outline-none transition resize-none"
                                />
                            </div>

                            <div className="pt-4 border-t border-warm-border/40 dark:border-stone-850 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xl text-xs font-bold uppercase tracking-wider text-warm-secondary dark:text-stone-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-brand-purple text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:transform hover:-translate-y-0.5 transition shadow-lg shadow-brand-purple/10"
                                >
                                    <Save size={13} /> {editingEvent ? 'Save Modifications' : 'Create Event Node'}
                                </button>
                            </div>

                        </form>
                    </motion.div>
                </div>
            )}

        </div>
    );
};
