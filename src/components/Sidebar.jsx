import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Compass, 
  Layers, 
  FolderGit2, 
  Binary, 
  Target, 
  FileText, 
  BarChart3, 
  Settings, 
  Sparkles, 
  ChevronRight, 
  X, 
  GraduationCap,
  LogOut,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUser, subscribeToStorage, STORAGE_KEYS } from '../utils/storage';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Helping AI', path: '/ai', icon: Bot },
  { name: 'Career Catalog', path: '/careers', icon: Compass },
  { name: 'Roadmap', path: '/roadmap', icon: Map },
  { name: 'Skills', path: '/skills', icon: Layers },
  { name: 'Projects', path: '/projects', icon: FolderGit2 },
  { name: 'DSA Tracker', path: '/dsa', icon: Binary },
  { name: 'Goals', path: '/goals', icon: Target },
  { name: 'Resume', path: '/resume', icon: FileText },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(() => getUser());

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
    if (onClose) onClose();
  };

  const displayName = user?.name || profile?.roleTitle || profile?.name || 'Alex Rivera';
  const displayEmail = user?.email || profile?.major || 'Student Account';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col justify-between 
          bg-[#0B0F19]/95 dark:bg-[#0B0F19]/95 bg-white/95 backdrop-blur-xl 
          border-r border-slate-200 dark:border-white/[0.08] shadow-2xl lg:shadow-none
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Branding */}
        <div>
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-white/[0.06]">
            <NavLink to="/" className="flex items-center gap-3 group" onClick={onClose}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-glow-brand group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 dark:from-white dark:via-indigo-200 dark:to-indigo-400 from-slate-900 via-indigo-900 to-indigo-600 bg-clip-text text-transparent">
                  CareerOS
                </span>
                <span className="block text-[10px] font-medium tracking-wider uppercase text-indigo-400">
                  Student Edition
                </span>
              </div>
            </NavLink>
            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-4 py-6 space-y-1.5 overflow-y-auto max-h-[calc(100vh-210px)]">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === '/'
                ? location.pathname === '/'
                : item.path === '/careers'
                  ? location.pathname.startsWith('/careers') || location.pathname.startsWith('/learn')
                  : location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-glow-brand" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-slate-400" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Student Profile & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-black/20">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <img 
                  src={profile?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                  alt={displayName}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/40" 
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0B0F19]" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold truncate text-slate-900 dark:text-slate-100">
                  {displayName}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                  <span className="truncate">{displayEmail}</span>
                </p>
              </div>
            </div>

            {/* Logout Action Button */}
            <button
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
