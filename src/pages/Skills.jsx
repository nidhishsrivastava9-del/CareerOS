import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, Sparkles, Pencil, Trash2, Loader2, AlertCircle, RefreshCw, Database } from 'lucide-react';
import api from '../utils/api';
import { saveSkills } from '../utils/storage';
import { useToast } from '../context/ToastContext';
import SkillModal from '../components/SkillModal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';

const CATEGORIES = [
  'All',
  'Programming',
  'Frontend',
  'Backend',
  'Database',
  'Tools',
  'DevOps',
  'Core CS',
  'Web Development',
  'Other'
];

export default function SkillsPage() {
  const { showToast } = useToast();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deletingSkill, setDeletingSkill] = useState(null);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.skills.getAll();
      if (res && res.success && Array.isArray(res.data)) {
        setSkills(res.data);
        saveSkills(res.data);
      } else {
        setError(res?.message || 'Failed to load skills from server database');
      }
    } catch (err) {
      setError(err.message || 'An unexpected network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const filteredSkills = activeCategory === 'All' 
    ? skills 
    : skills.filter(s => s.category?.toLowerCase() === activeCategory.toLowerCase());

  const avgMastery = skills.length > 0 
    ? Math.round(skills.reduce((acc, curr) => acc + (Number(curr.level || curr.progress) || 0), 0) / skills.length) 
    : 0;

  const proficientCount = skills.filter(s => (Number(s.level || s.progress) || 0) >= 75).length;

  const handleSaveSkill = async (savedSkill) => {
    try {
      const exists = skills.some(s => s.id === savedSkill.id || s._id === savedSkill.id);
      let updated;

      if (exists) {
        const targetId = savedSkill.id || savedSkill._id;
        const res = await api.skills.update(targetId, savedSkill);
        if (res && res.success && res.data) {
          const item = res.data;
          updated = skills.map(s => (s.id === targetId || s._id === targetId ? item : s));
          showToast(`Updated "${item.name}" (${item.level || item.progress}%)`, 'success');
        } else {
          showToast(res?.message || 'Failed to update skill on server', 'error');
          return;
        }
      } else {
        const res = await api.skills.create(savedSkill);
        if (res && res.success && res.data) {
          const item = res.data;
          updated = [item, ...skills];
          showToast(`Added "${item.name}" (${item.level || item.progress}%)`, 'success');
        } else {
          showToast(res?.message || 'Failed to create skill in database', 'error');
          return;
        }
      }

      setSkills(updated);
      saveSkills(updated);
      setEditingSkill(null);
    } catch (err) {
      showToast(err.message || 'Error saving skill', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSkill) return;
    const targetId = deletingSkill.id || deletingSkill._id;
    try {
      const res = await api.skills.delete(targetId);
      if (res && res.success) {
        const updated = skills.filter(s => s.id !== targetId && s._id !== targetId);
        setSkills(updated);
        saveSkills(updated);
        showToast(`Removed "${deletingSkill.name}"`, 'info');
      } else {
        showToast(res?.message || 'Failed to delete skill from database', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error deleting skill', 'error');
    } finally {
      setDeletingSkill(null);
    }
  };

  const handleQuickLevelChange = async (skill, delta) => {
    const currentVal = Number(skill.level || skill.progress) || 0;
    const nextLevel = Math.max(0, Math.min(100, currentVal + delta));
    let nextStatus = skill.status;
    if (nextLevel < 40) nextStatus = 'Learning';
    else if (nextLevel < 75) nextStatus = 'Intermediate';
    else if (nextLevel < 90) nextStatus = 'Proficient';
    else nextStatus = 'Advanced';

    const targetId = skill.id || skill._id;
    const optimisticSkills = skills.map(s => 
      (s.id === targetId || s._id === targetId)
        ? { ...s, level: nextLevel, progress: nextLevel, status: nextStatus } 
        : s
    );
    setSkills(optimisticSkills);

    try {
      const res = await api.skills.update(targetId, {
        level: nextLevel,
        progress: nextLevel,
        status: nextStatus
      });
      if (res && res.success && res.data) {
        const synced = skills.map(s => (s.id === targetId || s._id === targetId ? res.data : s));
        setSkills(synced);
        saveSkills(synced);
      } else {
        // Rollback
        setSkills(skills);
        showToast(res?.message || 'Failed to update level on server', 'error');
      }
    } catch (err) {
      setSkills(skills);
      showToast(err.message || 'Network error updating level', 'error');
    }
  };

  const handleSeedSampleSkills = async () => {
    try {
      setIsSeeding(true);
      const res = await api.seed(false);
      if (res && res.success) {
        showToast('Sample starter skills populated in database!', 'success');
        await fetchSkills();
      } else {
        showToast(res?.message || 'Could not seed sample data', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Error seeding sample data', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="w-3.5 h-3.5" />
            <span>Database-Backed Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Technical Skill Matrix
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Evaluate your technical stack, identify competency gaps, and sync your proficiencies with target engineering job specifications.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-center min-w-[100px]">
            <div className="text-2xl font-black text-indigo-400">{avgMastery}%</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">Avg Mastery</div>
          </div>
          <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-center min-w-[100px]">
            <div className="text-2xl font-black text-emerald-400">{proficientCount}</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">Proficient</div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-4 text-rose-400">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={fetchSkills}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Controls & Categories */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
                ${activeCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-white hover:bg-white/[0.08]'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          {skills.length === 0 && !loading && (
            <button
              onClick={handleSeedSampleSkills}
              disabled={isSeeding}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
            >
              {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
              <span>Load Sample Skills</span>
            </button>
          )}

          <button
            onClick={() => {
              setEditingSkill(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Skill</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-5 space-y-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="w-20 h-4 bg-white/10 rounded-full" />
                <div className="w-16 h-4 bg-white/10 rounded-md" />
              </div>
              <div className="space-y-2">
                <div className="w-32 h-5 bg-white/10 rounded-lg" />
                <div className="w-48 h-3 bg-white/5 rounded" />
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full" />
            </div>
          ))}
        </div>
      ) : filteredSkills.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={skills.length === 0 ? 'No skills tracked yet' : `No skills found in "${activeCategory}"`}
          description={
            skills.length === 0 
              ? 'Start building your technical skill matrix by adding your first programming language or tool, or load curated starter competencies.'
              : 'Try selecting a different category or add a new skill to this category.'
          }
          actionText="Add New Skill"
          onAction={() => {
            setEditingSkill(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredSkills.map((skill, index) => {
              const skillLevel = Number(skill.level !== undefined ? skill.level : skill.progress) || 0;
              const skillId = skill._id || skill.id;
              return (
                <motion.div
                  key={skillId || skill.name}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03 }}
                  className="glass-card-interactive p-5 space-y-4 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.05] text-indigo-400 border border-indigo-500/20">
                        {skill.category}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md
                          ${skillLevel >= 75 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {skill.status || (skillLevel >= 75 ? 'Proficient' : 'Learning')}
                        </span>

                        {/* Card Action Menu */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSkill({ ...skill, id: skillId, level: skillLevel });
                            setIsModalOpen(true);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Edit Skill"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingSkill({ ...skill, id: skillId })}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Skill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                        {skill.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Assessed proficiency based on coursework & projects
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Mastery Level</span>
                        <div className="inline-flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleQuickLevelChange(skill, -5)}
                            className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-white/5 hover:bg-white/10 text-slate-300"
                            title="-5%"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickLevelChange(skill, 5)}
                            className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-white/5 hover:bg-white/10 text-indigo-400"
                            title="+5%"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                      <span className="font-extrabold text-indigo-400">{skillLevel}%</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${skillLevel}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      <SkillModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSkill(null);
        }}
        onSave={handleSaveSkill}
        initialData={editingSkill}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingSkill)}
        onClose={() => setDeletingSkill(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Skill"
        message={`Are you sure you want to delete "${deletingSkill?.name}"? It will be permanently removed from your MongoDB database.`}
        confirmText="Delete Skill"
      />
    </div>
  );
}
