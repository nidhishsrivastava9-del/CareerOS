import React from 'react';
import { 
  Search, 
  Filter, 
  Layers, 
  BookOpen, 
  FileText, 
  Video, 
  HelpCircle, 
  Briefcase, 
  Terminal, 
  Rocket, 
  X 
} from 'lucide-react';

const TAB_CONFIG = [
  { id: 'all', label: 'All Resources', icon: Layers },
  { id: 'theory', label: 'Theory', icon: BookOpen },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'notes', label: 'Notes & Cheatsheet', icon: FileText },
  { id: 'quiz', label: 'Quiz Assessment', icon: HelpCircle },
  { id: 'pyq', label: 'PYQs & Interview', icon: Briefcase },
  { id: 'practice', label: 'Practice Challenge', icon: Terminal },
  { id: 'project', label: 'Mini Project', icon: Rocket }
];

export default function ResourceFilters({
  activeType = 'all',
  onSelectType,
  searchQuery = '',
  onSearchChange,
  activeDifficulty = 'All',
  onSelectDifficulty,
  resourceCounts = {},
  availableTypes = []
}) {
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="space-y-3">
      {/* Search Bar & Difficulty Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search resources by title, keyword, or concept (e.g. event loop, closure, memoize)..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Level:
          </span>
          <div className="flex items-center gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/5">
            {difficulties.map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => onSelectDifficulty(diff)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all
                  ${activeDifficulty === diff
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Type Tabs Bar */}
      <div className="border-b border-white/[0.08] flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const count = resourceCounts[tab.id] || 0;

          // Only show tab if it has resources or if it is 'all'
          if (tab.id !== 'all' && count === 0 && !availableTypes.includes(tab.id)) {
            return null;
          }

          const isActive = activeType === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectType(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer
                ${isActive 
                  ? 'border-indigo-500 text-indigo-400 bg-white/[0.02]' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.01]'}`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold
                  ${isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/[0.05] text-slate-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
