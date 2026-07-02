import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings, Moon, Sun, Bell, Shield, User, Monitor, Eye, EyeOff,
  Lock, Key, Sparkles, Volume2, Save, Download, Trash2, Check,
  AlertCircle, ChevronRight, CheckCircle2, Sliders, Smartphone,
  Database, UserCheck
} from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, toggleTheme, contrastMode, toggleContrastMode, activeDarkTheme, selectDarkTheme } = useTheme();
  const { user, setUser } = useAuth();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'appearance' | 'account' | 'notifications' | 'privacy'>('appearance');

  // Profile Edit states
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState<'success' | 'error' | null>(null);
  const [profileMessage, setProfileMessage] = useState('');

  // Password Edit states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<'success' | 'error' | null>(null);
  const [passwordMessage, setPasswordMessage] = useState('');

  // Notification Preferences states
  const [emailDaily, setEmailDaily] = useState(() => localStorage.getItem('pref_email_daily') !== 'false');
  const [emailFeedback, setEmailFeedback] = useState(() => localStorage.getItem('pref_email_feedback') !== 'false');
  const [emailUpdates, setEmailUpdates] = useState(() => localStorage.getItem('pref_email_updates') !== 'false');

  // Voice & Sound states
  const [voiceRate, setVoiceRate] = useState(() => Number(localStorage.getItem('pref_voice_rate') || '1.0'));
  const [soundFxEnabled, setSoundFxEnabled] = useState(() => localStorage.getItem('pref_sound_fx') !== 'false');

  // Security / Privacy states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => localStorage.getItem('pref_2fa') === 'true');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync profile details when user data is available
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTitle(user.title || '');
      setBio(user.bio || '');
      setTargetRole(user.targetRole || '');
    }
  }, [user?.id]);

  // Persist options inside localStorage
  useEffect(() => {
    localStorage.setItem('pref_email_daily', String(emailDaily));
  }, [emailDaily]);

  useEffect(() => {
    localStorage.setItem('pref_email_feedback', String(emailFeedback));
  }, [emailFeedback]);

  useEffect(() => {
    localStorage.setItem('pref_email_updates', String(emailUpdates));
  }, [emailUpdates]);

  useEffect(() => {
    localStorage.setItem('pref_voice_rate', String(voiceRate));
  }, [voiceRate]);

  useEffect(() => {
    localStorage.setItem('pref_sound_fx', String(soundFxEnabled));
  }, [soundFxEnabled]);

  useEffect(() => {
    localStorage.setItem('pref_2fa', String(twoFactorEnabled));
  }, [twoFactorEnabled]);

  // Update Profile Call
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileStatus(null);
    setProfileMessage('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name,
          title,
          bio,
          targetRole,
          avatar: user?.avatar,
          skills: user?.skills || [],
          experience: user?.experience || [],
          education: user?.education || [],
          socialLinks: user?.socialLinks || {}
        })
      });

      if (res.ok) {
        setUser(prev => prev ? { ...prev, name, title, bio, targetRole } : null);
        setProfileStatus('success');
        setProfileMessage('Your profile changes have been saved successfully.');
      } else {
        const data = await res.json().catch(() => ({}));
        setProfileStatus('error');
        setProfileMessage(data.error || 'Failed to edit profile.');
      }
    } catch (err) {
      setProfileStatus('error');
      setProfileMessage('Network error occurred. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change Password Call
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordStatus('error');
      setPasswordMessage('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus('error');
      setPasswordMessage('New password must be at least 6 characters.');
      return;
    }

    setIsSavingPassword(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (res.ok) {
        setPasswordStatus('success');
        setPasswordMessage('Your password has been updated securely.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json().catch(() => ({}));
        setPasswordStatus('error');
        setPasswordMessage(data.error || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordStatus('error');
      setPasswordMessage('Network error occurred. Please try again.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Export User Data Utility
  const handleExportData = () => {
    const dataStr = JSON.stringify({
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        title: user?.title,
        bio: user?.bio,
        targetRole: user?.targetRole,
        skillsCount: user?.skills?.length ?? 0,
      },
      preferences: {
        theme,
        contrastMode,
        emailDaily,
        emailFeedback,
        emailUpdates,
        voiceRate,
        soundFxEnabled,
        twoFactorEnabled,
      },
      exportedAt: new Date().toISOString(),
    }, null, 2);

    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `careermap-userdata-${user?.name?.toLowerCase().replace(/\s+/g, '-') || 'user'}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Simulate Account Deletion (since this is sandbox dev instance, we run clean simulation)
  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      return;
    }
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setShowDeleteModal(false);
      localStorage.clear();
      window.location.href = '/';
    }, 1500);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 min-h-screen settings-dm-sans">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
        
        .settings-dm-sans,
        .settings-dm-sans * {
          font-family: 'DM Sans', sans-serif !important;
        }
        
        .theme-transition-all,
        .theme-transition-all * {
          transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease, stroke 0.25s ease, fill 0.25s ease, box-shadow 0.25s ease !important;
        }
      `}} />

      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-warm-border/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Settings className="text-indigo-600 dark:text-indigo-400 animate-spin-hover" size={32} />
            System Preferences
          </h1>
          <p className="text-slate-500 font-medium">Control visual options, account credentials, notifications, and privacy preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Settings Sidebar Tabs */}
        <div className="md:col-span-1 space-y-1 bg-white/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-warm-border/45 dark:border-slate-800/60 max-h-[290px]">
          <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 px-3">Preference Sections</h3>
          {[
            { id: 'appearance', label: 'Appearance', icon: Monitor },
            { id: 'account', label: 'Account & Password', icon: User },
            { id: 'notifications', label: 'Notifications & Voice', icon: Bell },
            { id: 'privacy', label: 'Privacy & Security', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all relative ${isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Setting Panel Content View */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 bg-white dark:bg-slate-900 theme-transition-all"
              >
                <div>
                  <h3 id="appearance-header" className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                    <Monitor size={24} className="text-indigo-500" /> Theme Configuration
                  </h3>
                  <p className="text-sm text-slate-500 mt-1.5 font-medium leading-relaxed">
                    Personalize your CareerMap training workspace. You can choose your preferred active dark theme or use the default light mode.
                  </p>
                </div>

                {/* THEME QUICK TOGGLE */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Theme Mode</h4>
                    <p className="text-xs text-slate-500">Instantly switch between light and premium dark mode.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (theme === 'dark') {
                        setTheme('light');
                      } else {
                        setTheme('dark');
                      }
                    }}
                    id="theme-quick-btn"
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-500 transition-all font-bold text-xs justify-center cursor-pointer select-none"
                  >
                    {theme === 'dark' ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} className="text-indigo-600" />}
                    {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                  </button>
                </div>

                {/* THEME CARDS SELECTOR GRID */}
                <div className="space-y-6">
                  {/* Light Themes Divider */}
                  <div className="flex items-center gap-4 py-2">
                    <div className="h-px bg-slate-200 dark:bg-slate-800/80 flex-1"></div>
                    <span className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 select-none">Light Themes</span>
                    <div className="h-px bg-slate-200 dark:bg-slate-800/80 flex-1"></div>
                  </div>

                  {/* Light Themes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {THEMES.filter(t => !t.isDark).map((t) => {
                      const isSelected = activeDarkTheme === t.id;
                      const getThemeEmoji = (themeId: string) => {
                        switch (themeId) {
                          case 'warm-slate': return '☀️';
                          case 'teal-mint-light': return '🌱';
                          default: return '✨';
                        }
                      };

                      return (
                        <button
                          key={t.id}
                          onClick={() => selectDarkTheme(t.id)}
                          className={`relative text-left border rounded-2xl p-5 block w-full transition-all duration-300 transform select-none hover:-translate-y-0.5 cursor-pointer ${isSelected
                              ? 'border-indigo-500 dark:border-indigo-400 shadow-xl shadow-indigo-500/10'
                              : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          style={{
                            backgroundColor: t.variables['--bg-card'],
                            color: t.variables['--text-primary']
                          }}
                        >
                          {isSelected && (
                            <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-indigo-500 dark:bg-indigo-400 flex items-center justify-center shadow-md">
                              <Check className="text-white shrink-0" size={12} strokeWidth={3} />
                            </div>
                          )}

                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl" role="img" aria-label={t.name}>{getThemeEmoji(t.id)}</span>
                              <h5 className="font-extrabold text-base leading-none" style={{ color: t.variables['--text-primary'] }}>
                                {t.name}
                              </h5>
                            </div>
                            <p className="text-xs leading-relaxed line-clamp-3 font-medium opacity-80" style={{ color: t.variables['--text-secondary'] }}>
                              {t.description}
                            </p>

                            <div className="text-[10px] font-mono font-bold tracking-wide uppercase opacity-70" style={{ color: t.variables['--text-muted'] }}>
                              Feel: {t.feel}
                            </div>

                            <div className="flex gap-2">
                              {t.colors.map((c, idx) => (
                                <div
                                  key={idx}
                                  className="w-4 h-4 rounded-full border shadow-sm transition-transform hover:scale-110"
                                  style={{
                                    backgroundColor: c,
                                    borderColor: t.variables['--border-subtle']
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dark themes Divider */}
                  <div className="flex items-center gap-4 py-2">
                    <div className="h-px bg-slate-200 dark:bg-slate-800/80 flex-1"></div>
                    <span className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 select-none">Dark Themes</span>
                    <div className="h-px bg-slate-200 dark:bg-slate-800/80 flex-1"></div>
                  </div>

                  {/* Dark Themes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {THEMES.filter(t => t.isDark).map((t) => {
                      const isSelected = activeDarkTheme === t.id;
                      const getThemeEmoji = (themeId: string) => {
                        switch (themeId) {
                          case 'obsidian-warm': return '🌑';
                          case 'cyber-pastel': return '🌸';
                          default: return '✨';
                        }
                      };

                      return (
                        <button
                          key={t.id}
                          onClick={() => selectDarkTheme(t.id)}
                          className={`relative text-left border rounded-2xl p-5 block w-full transition-all duration-300 transform select-none hover:-translate-y-0.5 cursor-pointer ${isSelected
                              ? 'border-indigo-500 dark:border-indigo-400 shadow-xl shadow-indigo-500/10'
                              : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          style={{
                            backgroundColor: t.variables['--bg-card'],
                            color: t.variables['--text-primary']
                          }}
                        >
                          {isSelected && (
                            <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-indigo-500 dark:bg-indigo-400 flex items-center justify-center shadow-md">
                              <Check className="text-white shrink-0" size={12} strokeWidth={3} />
                            </div>
                          )}

                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl" role="img" aria-label={t.name}>{getThemeEmoji(t.id)}</span>
                              <h5 className="font-extrabold text-base leading-none" style={{ color: t.variables['--text-primary'] }}>
                                {t.name}
                              </h5>
                            </div>
                            <p className="text-xs leading-relaxed line-clamp-3 font-medium opacity-80" style={{ color: t.variables['--text-secondary'] }}>
                              {t.description}
                            </p>

                            <div className="text-[10px] font-mono font-bold tracking-wide uppercase opacity-70" style={{ color: t.variables['--text-muted'] }}>
                              Feel: {t.feel}
                            </div>

                            <div className="flex gap-2">
                              {t.colors.map((c, idx) => (
                                <div
                                  key={idx}
                                  className="w-4 h-4 rounded-full border shadow-sm transition-transform hover:scale-110"
                                  style={{
                                    backgroundColor: c,
                                    borderColor: t.variables['--border-subtle']
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>



                {/* Info Note */}
                <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/60 mt-6">
                  <AlertCircle size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Light theme is always the default on first sign in. Your dark theme choice is saved automatically.
                  </p>
                </div>

              </motion.div>
            )}

            {activeTab === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-8"
              >
                {/* Profile Edit Card */}
                <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  <div>
                    <h3 id="profile-settings-header" className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <User size={22} className="text-indigo-500" /> Professional Profile Settings
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Keep your career resume parameters, current role, and bio updated.</p>
                  </div>

                  {profileStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-2xl flex items-start gap-3 border text-sm ${profileStatus === 'success'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30'
                          : 'bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border-rose-100 dark:border-rose-900/30'
                        }`}
                    >
                      {profileStatus === 'success' ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" /> : <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />}
                      <span>{profileMessage}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">Display Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">Professional Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Senior Frontend Engineer"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="mt-1 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">Target Dream Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Technical Product Manager"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="mt-1 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">Biography</label>
                      <textarea
                        rows={3}
                        placeholder="Tell AI Coaches about yourself to refine interview and prep recommendations..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="mt-1 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium text-sm leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-end pt-3">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSavingProfile ? 'Saving...' : 'Save Profile Details'}
                        {!isSavingProfile && <Save size={16} />}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Change Password Card */}
                <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  <div>
                    <h3 id="password-settings-header" className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Lock size={22} className="text-indigo-500" /> Confidential Password Manager
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Change your current account access credentials periodically to maximize safety.</p>
                  </div>

                  {passwordStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-2xl flex items-start gap-3 border text-sm ${passwordStatus === 'success'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30'
                          : 'bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border-rose-100 dark:border-rose-900/30'
                        }`}
                    >
                      {passwordStatus === 'success' ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" /> : <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />}
                      <span>{passwordMessage}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">Current Password</label>
                      <div className="relative mt-1">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium text-sm pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">New Password (Min 6 chars)</label>
                        <div className="relative mt-1">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            required
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium text-sm pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">Confirm New Password</label>
                        <div className="relative mt-1">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium text-sm pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-3">
                      <button
                        type="submit"
                        disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSavingPassword ? 'Replacing...' : 'Change Current Password'}
                        {!isSavingPassword && <Key size={16} />}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell size={22} className="text-indigo-500" /> Notifications & Speech Controls
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Manage AI Coach sound triggers, speaking speeds, and system email preference alerts.</p>
                </div>

                <div className="space-y-6">
                  {/* Speech & Sound Effects Controls section */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-1.5">
                      <Volume2 size={14} className="text-indigo-500" /> Audio Settings
                    </h4>

                    {/* AI Coach speaking style slider */}
                    <div className="p-4 bg-[#F5F7FB] dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="font-bold text-slate-800 dark:text-white text-sm">AI Speech Speed Rate</h5>
                          <p className="text-xs text-slate-500">Pace rate multiplier used when AI reads questions aloud.</p>
                        </div>
                        <span className="font-mono text-sm font-black text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded">{voiceRate.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="1.5"
                        step="0.1"
                        value={voiceRate}
                        onChange={(e) => setVoiceRate(Number(e.target.value))}
                        className="w-full accent-indigo-600 bg-slate-200 dark:bg-slate-800 h-2 rounded-full cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-405 font-bold">
                        <span>0.8x (Slower)</span>
                        <span>1.0x (Normal)</span>
                        <span>1.5x (Faster)</span>
                      </div>
                    </div>

                    {/* Active sound effects switch */}
                    <div className="flex items-center justify-between p-4 bg-[#F5F7FB] dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <h5 className="font-bold text-slate-800 dark:text-white text-sm">Interface Sound FX</h5>
                        <p className="text-xs text-slate-500">Play responsive ding/chime support signals on correct answers.</p>
                      </div>
                      <button
                        onClick={() => setSoundFxEnabled(!soundFxEnabled)}
                        className={`w-12 h-6 rounded-full transition-all relative flex items-center cursor-pointer ${soundFxEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                      >
                        <motion.div
                          layout
                          className="w-4 h-4 bg-white rounded-full absolute shadow-sm"
                          style={{ left: soundFxEnabled ? '26px' : '4px' }}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Email Settings Section */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-1.5">
                      <Sliders size={14} className="text-indigo-500" /> Notifications Channels
                    </h4>

                    {[
                      { id: 'daily', label: 'Daily Practice Roadmaps', desc: 'Receive custom study schedules and interview tips directly on morning reports.', state: emailDaily, setter: setEmailDaily },
                      { id: 'feedback', label: 'Session Critique Alerts', desc: 'Get immediately notified when an AI Coach finishes evaluating an interview transcript.', state: emailFeedback, setter: setEmailFeedback },
                      { id: 'updates', label: 'Beta Features & Product News', desc: 'Stay updated with recently loaded system templates, models and metrics.', state: emailUpdates, setter: setEmailUpdates },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-[#F5F7FB] dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 gap-4">
                        <div className="max-w-[80%]">
                          <h5 className="font-bold text-slate-800 dark:text-white text-sm">{item.label}</h5>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => item.setter(!item.state)}
                          className={`w-12 h-6 rounded-full transition-all relative flex items-center cursor-pointer ${item.state ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                        >
                          <motion.div
                            layout
                            className="w-4 h-4 bg-white rounded-full absolute shadow-sm"
                            style={{ left: item.state ? '26px' : '4px' }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield size={22} className="text-indigo-500" /> Privacy & Cryptographic Safety
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Configure user login security variables, database portability logs and credential lifecycle.</p>
                </div>

                {/* Important Security Rules & Guidelines Card */}
                <div className="p-5 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 space-y-4 animate-fade-in">
                  <h4 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                    <UserCheck className="text-indigo-600 dark:text-indigo-400 animate-pulse" size={18} />
                    Essential Privacy & Security Rules
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-650 dark:text-slate-400">
                    <li className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1.5 shrink-0" />
                      <span><strong>Password Integrity:</strong> Create passwords with 12+ characters combining uppercase, lowercase, numbers, and symbols. Avoid reuse.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1.5 shrink-0" />
                      <span><strong>Active Session Care:</strong> Always sign out from your career dashboard when using shared or public workstations.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1.5 shrink-0" />
                      <span><strong>Data Autonomy:</strong> You retain complete data ownership. Port, download, or permanently erase your profile history at any time.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1.5 shrink-0" />
                      <span><strong>Phishing Awareness:</strong> CareerMap support agents will never ask for your account password or security keys. Verify URLs before logging in.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-6">
                  {/* Two Factor Authentication Option */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#F5F7FB] dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 gap-4">
                    <div className="flex items-start gap-3">
                      <Smartphone className="text-indigo-500 shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">Two-Factor Security Authentication</h4>
                        <p className="text-xs text-slate-500">Protect account with a mobile verification code requested upon login.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      className={`w-12 h-6 rounded-full transition-all relative flex items-center cursor-pointer ml-8 sm:ml-0 shrink-0 ${twoFactorEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                    >
                      <motion.div
                        layout
                        className="w-4 h-4 bg-white rounded-full absolute shadow-sm"
                        style={{ left: twoFactorEnabled ? '26px' : '4px' }}
                      />
                    </button>
                  </div>

                  {/* Portability / Data Export Option */}
                  <div className="p-4 bg-[#F5F7FB] dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-start gap-3">
                      <Database className="text-indigo-500 shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">Personal Data Export & Portability</h4>
                        <p className="text-xs text-slate-500">According to global storage privacy regulations, you have full ownership of your records. Download your profile JSON anytime.</p>
                      </div>
                    </div>

                    <div className="flex">
                      <button
                        onClick={handleExportData}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs select-none transition-all shadow-sm"
                      >
                        <Download size={14} />
                        Export All My Data (JSON)
                      </button>
                    </div>
                  </div>

                  {/* Dangerous Delete Zone */}
                  <div className="p-4 bg-rose-50/40 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl space-y-4 pt-5 pb-5">
                    <div>
                      <h4 className="font-bold text-rose-800 dark:text-rose-450 text-sm flex items-center gap-1.5">
                        <Trash2 size={16} /> Delete Account Permanently
                      </h4>
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 leading-relaxed">This action wipes out all your historic resume evaluations, progress analytics trackers, and interview assessments instantly. It cannot be undone.</p>
                    </div>

                    <div>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer"
                      >
                        Wipe Account Logs
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full relative z-10 shadow-2xl space-y-6"
            >
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 text-rose-600">
                  <Trash2 size={24} /> Strict Confirmation Required
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you absolutely sure you want to proceed? This will erase everything. To confirm, write <span className="font-mono bg-rose-50 dark:bg-rose-950 font-extrabold text-rose-600 px-1 py-0.5 rounded text-[10px]">DELETE MY ACCOUNT</span> in the input field below.
                </p>
              </div>

              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="DELETE MY ACCOUNT"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-rose-200 dark:border-rose-900 focus:ring-rose-500 rounded-xl focus:outline-none focus:ring-2 font-mono text-center font-extrabold text-slate-900 dark:text-white text-sm"
                />

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText('');
                    }}
                    className="px-4 py-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-bold text-xs cursor-pointer transition-all border border-slate-205 dark:border-slate-700"
                  >
                    Cancel Action
                  </button>
                  <button
                    type="submit"
                    disabled={deleteConfirmText !== 'DELETE MY ACCOUNT' || isDeleting}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs cursor-pointer transition-all shadow-md shadow-rose-600/10"
                  >
                    {isDeleting ? 'Erasing User...' : 'Wipe Clean'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
