import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDown, User, LogOut, Settings, Bell, BellRing, Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Notification states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync notification lists
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

        const eventTimeStr = ev.time || '00:00';
        const eventDateTime = new Date(`${ev.date}T${eventTimeStr}:00`);

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
              scheduledTime: `${ev.date} {ev.time}`,
              createdAt: Date.now(),
              read: false
            };
            notifs.unshift(newNotif);
            updated = true;

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
    const notificationInterval = setInterval(checkScheduledNotifications, 10000);

    return () => clearInterval(notificationInterval);
  }, []);

  // Handle clicking outside notification elements
  useEffect(() => {
    const handleClickOutsideNotif = (event: MouseEvent) => {
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideNotif);
    return () => document.removeEventListener('mousedown', handleClickOutsideNotif);
  }, []);

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/careermap') return 'CareerMap Tree';
    if (path === '/resume') return 'Resume Intelligence';
    if (path === '/interview') return 'Mock Interviews';
    if (path === '/results') return 'Insights & Analysis';
    if (path === '/skills') return 'Skill Matrix';
    if (path === '/careers') return 'Career Explorer';
    if (path === '/profile') return 'My Profile';
    if (path === '/settings') return 'Settings';
    return 'CareerAI';
  };

  return (
    <header className="h-20 border-b border-warm-border dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-50 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-warm-text dark:text-white tracking-tight">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">

        {/* Notification Bell Symbol */}
        <div className="relative" ref={notificationDropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-xl bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-warm-border/60 dark:border-stone-805 text-warm-secondary hover:text-brand-purple transition-all duration-300 relative flex items-center justify-center ${unreadCount > 0 ? 'ring-2 ring-brand-purple/20 text-brand-purple' : ''
              }`}
            title="Interview Alarms"
          >
            {unreadCount > 0 ? (
              <BellRing className="w-4.5 h-4.5 animate-bounce text-brand-purple" />
            ) : (
              <Bell className="w-4.5 h-4.5" />
            )}
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-mono text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-lg">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification List Dropdown Panel */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-stone-900 border border-warm-border dark:border-stone-800 rounded-2xl shadow-xl shadow-warm-border/10 dark:shadow-black/40 p-4 text-left space-y-3 z-50 origin-top-right"
              >
                <div className="flex justify-between items-center pb-2 border-b border-warm-border/30 dark:border-stone-850">
                  <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-warm-text dark:text-stone-300 flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-brand-purple" /> Interview Alarms
                  </h4>
                  {notifications.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={markAllRead}
                        className="text-[10px] font-bold text-brand-purple hover:underline uppercase tracking-wide"
                      >
                        Read All
                      </button>
                      <span className="text-stone-300 dark:text-stone-850 text-[10px] select-none">|</span>
                      <button
                        onClick={clearAllNotifications}
                        className="text-[10px] font-bold text-rose-500 hover:underline uppercase tracking-wide"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto customize-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border transition-all duration-300 text-left ${n.read
                            ? 'bg-stone-50/40 dark:bg-stone-900/10 border-warm-border/20 dark:border-stone-850/50'
                            : 'bg-brand-purple/5 dark:bg-brand-purple/10 border-brand-purple/15 shadow-sm'
                          } flex flex-col gap-1.5 relative`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 leading-none">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${n.read ? 'bg-stone-300 dark:bg-stone-600' : 'bg-brand-purple animate-pulse'}`} />
                              <span className="font-extrabold text-[11px] text-warm-text dark:text-stone-200">
                                {n.title}
                              </span>
                            </div>
                            <div className="text-[10px] font-bold text-warm-secondary">
                              {n.company} — {n.role}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 z-10">
                            {!n.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(n.id);
                                }}
                                className="text-[9px] bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 px-1.5 py-0.5 rounded-md font-bold transition"
                                title="Mark read"
                              >
                                Read
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(n.id);
                              }}
                              className="p-1 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                              title="Delete Alarm"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-350 leading-relaxed font-semibold">
                          {n.message}
                        </p>
                        <span className="text-[9px] font-mono text-warm-hint text-right font-bold w-full block">
                          Scheduled: {n.scheduledTime}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 space-y-2">
                      <div className="w-8 h-8 rounded-full bg-stone-50 dark:bg-stone-950 flex items-center justify-center text-warm-hint mx-auto">
                        <Bell className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                      </div>
                      <p className="text-xs text-warm-secondary font-bold font-mono">All alarms clear</p>
                      <p className="text-[10px] text-warm-hint max-w-[220px] mx-auto leading-normal font-medium">
                        Reminders will pop open in message list format when your scheduled interview plan time starts.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 p-1.5 hover:bg-warm-bg dark:hover:bg-stone-800 rounded-2xl transition-all pr-3"
          >
            <div className="w-10 h-10 rounded-xl bg-badge-purple dark:bg-brand-purple/30 overflow-hidden flex items-center justify-center border border-warm-border dark:border-stone-800 shadow-inner">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-brand-purple" />
              )}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-bold text-warm-text dark:text-white leading-tight truncate max-w-[120px]">{user?.name}</p>
              <p className="text-[10px] font-bold text-warm-muted uppercase tracking-wider truncate max-w-[120px]">{user?.title || 'Pro User'}</p>
            </div>
            <ChevronDown size={16} className={`text-warm-hint transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-stone-900 rounded-2xl border border-warm-border dark:border-stone-800 shadow-xl shadow-warm-border/20 dark:shadow-black/20 overflow-hidden py-2"
              >
                <div className="px-4 py-3 border-b border-warm-bg dark:border-stone-800 lg:hidden">
                  <p className="text-sm font-bold text-warm-text dark:text-white">{user?.name}</p>
                  <p className="text-xs text-warm-muted">{user?.email}</p>
                </div>

                <button
                  onClick={() => { setIsOpen(false); navigate('/profile'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-warm-muted dark:text-stone-400 hover:bg-badge-purple dark:hover:bg-brand-purple/20 hover:text-brand-purple transition-colors"
                >
                  <User size={18} />
                  <span>View Profile</span>
                </button>

                <button
                  onClick={() => { setIsOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-warm-muted dark:text-stone-400 hover:bg-badge-purple dark:hover:bg-brand-purple/20 hover:text-brand-purple transition-colors"
                >
                  <Settings size={18} />
                  <span>Account Settings</span>
                </button>

                <div className="h-px bg-warm-bg dark:bg-stone-800 my-2"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-bold"
                >
                  <LogOut size={18} />
                  <span className="font-bold">Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
