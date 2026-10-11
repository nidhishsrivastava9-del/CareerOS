import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  Sparkles,
  Command,
  LogOut,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUser, subscribeToStorage, STORAGE_KEYS } from '../utils/storage';
import { studentProfile } from '../data/dummyData';

const pageTitles = {
  '/': 'Dashboard',
  '/roadmap': 'Career Roadmap',
  '/skills': 'Skill Matrix',
  '/projects': 'Projects Showcase',
  '/dsa': 'DSA Problem Tracker',
  '/goals': 'Milestones & Goals',
  '/resume': 'ATS Resume Studio',
  '/analytics': 'Growth Analytics',
  '/settings': 'Account Settings'
};

export default function Header({ onOpenSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(() => getUser());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToStorage((key, data) => {
      if (key === STORAGE_KEYS.USER && data) {
        setProfile(data);
      }
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    logout();
    showToast('Signed out of CareerOS. See you soon!');
    navigate('/login');
  };

  const currentTitle = pageTitles[location.pathname] || 'Dashboard';
  const displayName = user?.name || profile?.roleTitle || profile?.name || 'Student';
  const displayEmail = user?.email || 'Authenticated User';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4 
      bg-[#090D16]/80 dark:bg-[#090D16]/80 bg-white/80 backdrop-blur-xl 
      border-b border-slate-200 dark:border-white/[0.08] transition-colors duration-200">
      
      {/* Left: Mobile Toggle & Page Greeting */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {currentTitle}
            </h1>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Active Term
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>Good evening, {displayName}</span>
            <span className="inline-block animate-wave origin-bottom-right">👋</span>
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search skills, projects, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 lg:w-64 pl-9 pr-8 py-1.5 rounded-xl text-xs sm:text-sm 
              bg-slate-100 dark:bg-white/[0.04] text-slate-900 dark:text-slate-200 
              border border-slate-200 dark:border-white/[0.08] 
              focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 transition-all placeholder:text-slate-400"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-200/50 dark:bg-white/10">
            <Command className="w-2.5 h-2.5" /> K
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] 
            bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 
            hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (showUserMenu) setShowUserMenu(false);
            }}
            aria-label="View notifications"
            className="relative p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] 
              bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 
              hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#090D16]" />
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-card p-4 border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Notifications</span>
                <span className="text-[11px] text-indigo-400 cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="mt-3 space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 transition-colors">
                  <p className="font-medium text-slate-200">🎯 Daily Goal Progress</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">You have active goals today. Keep going!</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 transition-colors">
                  <p className="font-medium text-slate-200">⚡ MongoDB & JWT Active</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Secure authentication session is active.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & User Dropdown */}
        <div className="relative pl-2 border-l border-slate-200 dark:border-white/[0.08]">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              if (showNotifications) setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer focus:outline-none"
            aria-label="User menu"
          >
            <div className="relative">
              <img
                src={profile?.avatar || studentProfile?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                alt={displayName}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/30 hover:ring-indigo-500 transition-all"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#090D16]" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-card p-2 border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate">{displayEmail}</p>
              </div>

              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
                >
                  <UserIcon className="w-4 h-4 text-indigo-400" />
                  <span>Account Settings</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
