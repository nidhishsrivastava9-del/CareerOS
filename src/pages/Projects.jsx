import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderGit2, Plus, Github, ExternalLink, Sparkles, Pencil, Trash2 } from 'lucide-react';
import { getProjects, saveProjects, subscribeToStorage, STORAGE_KEYS } from '../utils/storage';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';

const FILTER_TABS = ['All', 'Completed', 'In Progress', 'Planning'];

export default function ProjectsPage() {
  const [projects, setProjects] = useState(() => getProjects());
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [toast, setToast] = useState('');

  // Keep state synchronized with LocalStorage events
  useEffect(() => {
    const unsubscribe = subscribeToStorage((key, data) => {
      if (key === STORAGE_KEYS.PROJECTS && Array.isArray(data)) {
        setProjects(data);
      }
    });
    return unsubscribe;
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => p.status === filter);

  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const inProgressProjects = projects.filter(p => p.status === 'In Progress').length;
  const planningProjects = projects.filter(p => p.status === 'Planning').length;

  const handleSaveProject = (savedProj) => {
    let updated;
    const exists = projects.some(p => p.id === savedProj.id);

    if (exists) {
      updated = projects.map(p => (p.id === savedProj.id ? savedProj : p));
      showToast(`Updated project "${savedProj.title}"`);
    } else {
      updated = [savedProj, ...projects];
      showToast(`Created project "${savedProj.title}"`);
    }

    setProjects(updated);
    saveProjects(updated);
    setEditingProject(null);
    if (selectedProject?.id === savedProj.id) {
      setSelectedProject(savedProj);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingProject) return;
    const updated = projects.filter(p => p.id !== deletingProject.id);
    setProjects(updated);
    saveProjects(updated);
    showToast(`Deleted project "${deletingProject.title}"`);
    if (selectedProject?.id === deletingProject.id) {
      setSelectedProject(null);
    }
    setDeletingProject(null);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-20 right-8 z-50 px-4 py-3 rounded-xl bg-purple-600 text-white shadow-xl shadow-purple-600/30 flex items-center gap-2 text-xs font-semibold"
        >
          <Sparkles className="w-4 h-4" />
          <span>{toast}</span>
        </motion.div>
      )}

      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Portfolio Showcase</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Engineering Projects
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Real-world applications proving full-stack execution, system modularity, and modern engineering practices.
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-center min-w-[90px]">
            <div className="text-2xl font-black text-purple-400">{projects.length}</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">Total</div>
          </div>
          <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-center min-w-[90px]">
            <div className="text-2xl font-black text-emerald-400">{completedProjects}</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">Completed</div>
          </div>
          <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-center min-w-[90px]">
            <div className="text-2xl font-black text-amber-400">{inProgressProjects}</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">In Progress</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
                ${filter === tab 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                  : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-white hover:bg-white/[0.08]'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setEditingProject(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/20 hover:shadow-purple-600/40 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Projects Grid or Empty State */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title={projects.length === 0 ? 'No projects yet' : `No projects in "${filter}"`}
          description={
            projects.length === 0 
              ? 'Start building your portfolio by adding your first project and technical stack.'
              : 'Try switching to another status tab or add a new project in this stage.'
          }
          actionText="Add Project"
          onAction={() => {
            setEditingProject(null);
            setIsModalOpen(true);
          }}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10 border-purple-500/20"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProjects.map((proj) => (
              <ProjectCard 
                key={proj.id} 
                project={proj} 
                onViewDetails={(item) => setSelectedProject(item)}
                onEdit={(item) => {
                  setEditingProject(item);
                  setIsModalOpen(true);
                }}
                onDelete={(item) => setDeletingProject(item)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass-card p-6 sm:p-7 space-y-4 border border-white/10 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedProject.title}</h3>
                <span className="text-xs text-slate-400">Project Overview</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
                ${selectedProject.status === 'Completed' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : selectedProject.status === 'Planning'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                {selectedProject.status} ({selectedProject.progress}%)
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedProject.description}
            </p>

            {/* Technologies */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Technologies Used</span>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(selectedProject.techStack) ? selectedProject.techStack : []).map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-purple-600 dark:text-purple-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = selectedProject;
                    setSelectedProject(null);
                    setEditingProject(toEdit);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const toDelete = selectedProject;
                    setSelectedProject(null);
                    setDeletingProject(toDelete);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Close
                </button>
                {selectedProject.githubUrl && (
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/30 transition-all"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>Source Code</span>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        initialData={editingProject}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingProject)}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.title}"? All associated progress and metadata will be permanently removed.`}
        confirmText="Delete Project"
      />
    </div>
  );
}
