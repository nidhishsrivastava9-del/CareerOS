import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
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
  GraduationCap
} from 'lucide-react';
import { studentProfile } from '../data/dummyData';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
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
          <nav className="px-4 py-6 space-y-1.5 overflow-y-auto max-h-[calc(100vh-190px)]">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
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

        {/* Bottom Student Profile */}
        <div className="p-4 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-black/20">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05]">
            <div className="relative">
              <img 
                src={studentProfile.avatar} 
                alt={studentProfile.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/40" 
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0B0F19]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">
                {studentProfile.roleTitle}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                <span>{studentProfile.major}</span>
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
