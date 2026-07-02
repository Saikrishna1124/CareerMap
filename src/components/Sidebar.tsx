import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Video, Award, Settings, Compass, Brain, Briefcase, Heart, Map, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Map, label: 'Career Map', path: '/careermap' },
  { icon: FileText, label: 'Resume Intelligence', path: '/resume' },
  { icon: Briefcase, label: 'Careers', path: '/careers' },
  { icon: Video, label: 'AI Interviewer', path: '/interview' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: Heart, label: 'Confidence Support', path: '/confidence' },
  { icon: Award, label: 'Performance', path: '/results' },
  { icon: Brain, label: 'Learning Hub', path: '/skills' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="w-64 h-screen bg-warm-sidebar dark:bg-stone-900 border-r border-warm-border dark:border-stone-800 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-stone-50 dark:bg-stone-800/35 rounded-xl flex items-center justify-center shadow-sm border border-stone-100 dark:border-stone-850/50 shrink-0">
          <img
            src="/main_logo.png"
            alt="CareerMap Logo"
            className="w-9 h-9 object-contain"
          />
        </div>
        <span className="text-2xl font-black text-warm-text dark:text-white tracking-tight">
          CareerMap
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-badge-purple dark:bg-brand-purple/20 text-brand-purple dark:text-stone-100 font-bold shadow-sm'
                : 'text-warm-secondary hover:bg-white dark:hover:bg-stone-800'
                }`}
            >
              <item.icon size={20} className={isActive ? 'text-brand-purple dark:text-stone-100' : 'group-hover:text-warm-text'} />
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-purple dark:bg-stone-100"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-warm-border dark:border-stone-800 space-y-1">
        <Link
          to="/settings"
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${location.pathname === '/settings'
            ? 'bg-badge-purple dark:bg-brand-purple/20 text-brand-purple dark:text-stone-100 font-bold'
            : 'text-warm-secondary hover:bg-white dark:hover:bg-stone-800'
            }`}
        >
          <Settings size={20} />
          Settings
        </Link>
      </div>
    </div>
  );
};
