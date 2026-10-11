import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderGit2, Plus, Github, ExternalLink, Sparkles, Pencil, Trash2, Loader2, AlertCircle, RefreshCw, Database } from 'lucide-react';
import api from '../utils/api';
import { saveProjects } from '../utils/storage';
import { useToast } from '../context/ToastContext';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';

const FILTER_TABS = ['All', 'Completed', 'In Progress', 'Planning'];

export default function ProjectsPage() {
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.projects.getAll();
      if (res && res.success && Array.isArray(res.data)) {
        setProjects(res.data);
        saveProjects(res.data);
      } else {
        setError(res?.message || 'Failed to load projects from server');
      }
    } catch (err) {
      setError(err.message || 'An unexpected network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => p.status === filter);

  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const inProgressProjects = projects.filter(p => p.status === 'In Progress').length;
  const planningProjects = projects.filter(p => p.status === 'Planning').length;

  const handleSaveProject = async (savedProj) => {
    try {
      const exists = projects.some(p => p.id === savedProj.id || p._id === savedProj.id);
      let updated;

      if (exists) {
        const targetId = savedProj.id || savedProj._id;
        const res = await api.projects.update(targetId, savedProj);
        if (res && res.success && res.data) {
          const item = res.data;
          updated = projects.map(p => (p.id === targetId || p._id === targetId ? item : p));
          showToast(`Updated project "${item.title || item.name}"`, 'success');
          if (selectedProject?.id === targetId || selectedProject?._id === targetId) {
            setSelectedProject(item);
          }
        } else {
          showToast(res?.message || 'Failed to update project', 'error');
          return;
        }
      } else {
        const res = await api.projects.create(savedProj);
        if (res && res.success && res.data) {
          const item = res.data;
          updated = [item, ...projects];
          showToast(`Created project "${item.title || item.name}"`, 'success');
        } else {
          showToast(res?.message || 'Failed to save project', 'error');
          return;
        }
      }

      setProjects(updated);
      saveProjects(updated);
      setEditingProject(null);
    } catch (err) {
      showToast(err.message || 'Error saving project', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;
    const targetId = deletingProject.id || deletingProject._id;
    try {
      const res = await api.projects.delete(targetId);
      if (res && res.success) {
        const updated = projects.filter(p => p.id !== targetId && p._id !== targetId);
        setProjects(updated);
        saveProjects(updated);
        showToast(`Deleted project "${deletingProject.title || deletingProject.name}"`, 'info');
        if (selectedProject?.id === targetId || selectedProject?._id === targetId) {
          setSelectedProject(null);
        }
      } else {
        showToast(res?.message || 'Failed to delete project', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error deleting project', 'error');
    } finally {
      setDeletingProject(null);
    }
  };

  const handleSeedSampleProjects = async () => {
    try {
      setIsSeeding(true);
      const res = await api.seed(false);
      if (res && res.success) {
        showToast('Sample projects loaded into database!', 'success');
        await fetchProjects();
      } else {
        showToast(res?.message || 'Could not seed sample projects', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Error seeding sample projects', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Database-Backed Portfolio</span>
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

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-4 text-rose-400">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={fetchProjects}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

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

        <div className="flex items-center gap-2.5 flex-shrink-0">
          {projects.length === 0 && !loading && (
            <button
              onClick={handleSeedSampleProjects}
              disabled={isSeeding}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all"
            >
              {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
              <span>Load Sample Projects</span>
            </button>
          )}

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
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="w-28 h-5 bg-white/10 rounded-lg" />
                <div className="w-20 h-5 bg-white/10 rounded-full" />
              </div>
              <div className="w-full h-12 bg-white/5 rounded-lg" />
              <div className="flex gap-2">
                <div className="w-14 h-6 bg-white/10 rounded-md" />
                <div className="w-14 h-6 bg-white/10 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title={projects.length === 0 ? 'No projects yet' : `No projects in "${filter}"`}
          description={
            projects.length === 0 
              ? 'Start building your portfolio by adding your first project and technical stack, or load starter engineering applications.'
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
            {filteredProjects.map((proj) => {
              const projId = proj._id || proj.id;
              const normalized = {
                ...proj,
                id: projId,
                title: proj.title || proj.name,
                techStack: proj.techStack || proj.technologies || []
              };
              return (
                <ProjectCard 
                  key={projId} 
                  project={normalized} 
                  onViewDetails={(item) => setSelectedProject(item)}
                  onEdit={(item) => {
                    setEditingProject(item);
                    setIsModalOpen(true);
                  }}
                  onDelete={(item) => setDeletingProject(item)}
                />
              );
            })}
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedProject.title || selectedProject.name}
                </h3>
                <span className="text-xs text-slate-400">Database Record</span>
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
              {selectedProject.description || 'No description provided.'}
            </p>

            {/* Technologies */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Technologies Used</span>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(selectedProject.techStack || selectedProject.technologies) 
                  ? (selectedProject.techStack || selectedProject.technologies) 
                  : []).map(t => (
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
        message={`Are you sure you want to delete "${deletingProject?.title || deletingProject?.name}"? All associated progress and metadata will be permanently deleted from MongoDB.`}
        confirmText="Delete Project"
      />
    </div>
  );
}
