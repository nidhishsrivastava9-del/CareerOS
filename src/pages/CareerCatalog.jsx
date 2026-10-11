import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Search, 
  Filter, 
  Sparkles, 
  Layers, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  GraduationCap 
} from 'lucide-react';
import CareerCard from '../components/careers/CareerCard';
import { getCareersApi, getAllProgressApi } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { CAREERS_SEED } from '../data/careersData.js';

export default function CareerCatalog() {
  const { showToast } = useToast();
  const [careers, setCareers] = useState(CAREERS_SEED);
  const [userProgressMap, setUserProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Load careers and user progress
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [careerRes, progressRes] = await Promise.all([
          getCareersApi(),
          getAllProgressApi()
        ]);

        if (isMounted) {
          if (careerRes && careerRes.success && careerRes.careers) {
            setCareers(careerRes.careers);
          } else {
            setCareers(CAREERS_SEED);
          }

          if (progressRes && progressRes.success && progressRes.progress) {
            const pMap = {};
            progressRes.progress.forEach(p => {
              pMap[p.careerSlug] = p.overallPercentage || 0;
            });
            setUserProgressMap(pMap);
          }
        }
      } catch (err) {
        console.warn('[CareerCatalog] Failed to fetch data, using starter fallback:', err.message);
        if (isMounted) setCareers(CAREERS_SEED);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  // Compute unique categories
  const categories = ['All', ...Array.from(new Set(careers.map(c => c.category).filter(Boolean)))];

  // Filtered list
  const filteredCareers = careers.filter(c => {
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'All' && c.difficulty !== selectedDifficulty) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchSkills = (c.skills || []).some(s => s.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchSkills) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Catalog Banner */}
      <div className="glass-card p-6 sm:p-10 border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/5 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Compass className="w-3.5 h-3.5" />
              <span>Career Roadmap Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Explore Technical Career Paths
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Choose your target role from 23 specialized engineering domains. Every career features an industry-verified roadmap, topic modules, interactive quizzes, PYQs, and hands-on projects.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-4 bg-white/[0.03] p-5 rounded-2xl border border-white/5 flex-shrink-0">
            <div className="text-center px-2">
              <div className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                23
              </div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Tech Paths
              </div>
            </div>
            <div className="w-[1px] h-10 bg-white/10" />
            <div className="text-center px-2">
              <div className="text-2xl font-extrabold text-emerald-400">
                100+
              </div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Modules
              </div>
            </div>
            <div className="w-[1px] h-10 bg-white/10" />
            <div className="text-center px-2">
              <div className="text-2xl font-extrabold text-pink-400">
                7
              </div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Resource Types
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search careers by title, role, or skills (e.g. React, Docker, Python)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Clear All Filters Button */}
            {(selectedCategory !== 'All' || search) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedDifficulty('All');
                  setSearch('');
                }}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-all whitespace-nowrap"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Category Chips Carousel / Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 flex-shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0
                  ${selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Career Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-slate-200">{filteredCareers.length}</strong> of {careers.length} careers
          </span>
          {selectedCategory !== 'All' && (
            <span>Filtered by: <strong className="text-indigo-400">{selectedCategory}</strong></span>
          )}
        </div>

        {filteredCareers.length === 0 ? (
          <div className="glass-card p-12 text-center space-y-3">
            <Compass className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No careers found matching your search</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Try adjusting your search keyword or clearing category filters to view all 23 available career paths.
            </p>
            <button
              type="button"
              onClick={() => { setSelectedCategory('All'); setSearch(''); }}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-all"
            >
              Show All Careers
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCareers.map((career, idx) => (
              <motion.div
                key={career.slug || career.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.3) }}
              >
                <CareerCard
                  career={career}
                  progress={userProgressMap[career.slug] || 0}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
