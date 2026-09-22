import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, Sparkles, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { getSkills, saveSkills, subscribeToStorage, STORAGE_KEYS } from '../utils/storage';
import SkillModal from '../components/SkillModal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';

const CATEGORIES = [
  'All',
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Core CS',
  'Programming',
  'Web Development',
  'Tools',
  'Other'
];

export default function SkillsPage() {
  const [skills, setSkills] = useState(() => getSkills());
  const [activeCategory, setActiveCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deletingSkill, setDeletingSkill] = useState(null);
  const [toast, setToast] = useState('');

  // Keep state synchronized with LocalStorage events
  useEffect(() => {
    const unsubscribe = subscribeToStorage((key, data) => {
      if (key === STORAGE_KEYS.SKILLS && Array.isArray(data)) {
        setSkills(data);
      }
    });
    return unsubscribe;
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filteredSkills = activeCategory === 'All' 
    ? skills 
    : skills.filter(s => s.category?.toLowerCase() === activeCategory.toLowerCase());

  const avgMastery = skills.length > 0 
    ? Math.round(skills.reduce((acc, curr) => acc + (Number(curr.level) || 0), 0) / skills.length) 
    : 0;

  const proficientCount = skills.filter(s => (Number(s.level) || 0) >= 75).length;

  const handleSaveSkill = (savedSkill) => {
    let updated;
    const exists = skills.some(s => s.id === savedSkill.id);

    if (exists) {
      updated = skills.map(s => (s.id === savedSkill.id ? savedSkill : s));
      showToast(`Updated "${savedSkill.name}" (${savedSkill.level}%)`);
    } else {
      updated = [savedSkill, ...skills];
      showToast(`Added "${savedSkill.name}" (${savedSkill.level}%)`);
    }

    setSkills(updated);
    saveSkills(updated);
    setEditingSkill(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingSkill) return;
    const updated = skills.filter(s => s.id !== deletingSkill.id);
    setSkills(updated);
    saveSkills(updated);
    showToast(`Removed "${deletingSkill.name}"`);
    setDeletingSkill(null);
  };

  const handleQuickLevelChange = (skill, delta) => {
    const nextLevel = Math.max(0, Math.min(100, (Number(skill.level) || 0) + delta));
    let nextStatus = skill.status;
    if (nextLevel < 40) nextStatus = 'Learning';
    else if (nextLevel < 75) nextStatus = 'Intermediate';
    else if (nextLevel < 90) nextStatus = 'Proficient';
    else nextStatus = 'Advanced';

    const updatedSkill = { ...skill, level: nextLevel, status: nextStatus };
    const updated = skills.map(s => s.id === skill.id ? updatedSkill : s);
    setSkills(updated);
    saveSkills(updated);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-20 right-8 z-50 px-4 py-3 rounded-xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 flex items-center gap-2 text-xs font-semibold"
        >
          <Sparkles className="w-4 h-4" />
          <span>{toast}</span>
        </motion.div>
      )}

      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="w-3.5 h-3.5" />
            <span>Competency Assessment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Technical Skill Matrix
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Evaluate your technical stack, identify competency gaps, and align your proficiencies with target engineering job specifications.
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

      {/* Skills Grid or Empty State */}
      {filteredSkills.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={skills.length === 0 ? 'No skills tracked yet' : `No skills found in "${activeCategory}"`}
          description={
            skills.length === 0 
              ? 'Start building your technical skill matrix by adding your first programming language or tool.'
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
            {filteredSkills.map((skill, index) => (
              <motion.div
                key={skill.id || skill.name}
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
                        ${Number(skill.level) >= 75 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {skill.status || (Number(skill.level) >= 75 ? 'Proficient' : 'Learning')}
                      </span>

                      {/* Card Action Menu */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSkill(skill);
                          setIsModalOpen(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit Skill"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingSkill(skill)}
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
                    <span className="font-extrabold text-indigo-400">{skill.level}%</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
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
        message={`Are you sure you want to delete "${deletingSkill?.name}"? It will be removed from your skill matrix and LocalStorage.`}
        confirmText="Delete Skill"
      />
    </div>
  );
}
