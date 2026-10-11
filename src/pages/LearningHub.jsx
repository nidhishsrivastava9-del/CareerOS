import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Map, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Compass, 
  AlertCircle, 
  RefreshCw, 
  Layers,
  Bot,
  Brain,
  Award
} from 'lucide-react';
import { 
  getModuleApi, 
  getResourcesApi, 
  getCareerProgressApi, 
  toggleLessonProgressApi, 
  submitQuizProgressApi, 
  completePracticeProgressApi,
  getAssessmentsApi
} from '../utils/api';
import { useToast } from '../context/ToastContext';
import ResourceCard from '../components/careers/ResourceCard';
import ResourceFilters from '../components/careers/ResourceFilters';
import ProgressIndicator from '../components/careers/ProgressIndicator';
import AssessmentModal from '../components/assessments/AssessmentModal';
import { CAREERS_SEED } from '../data/careersData.js';

export default function LearningHub() {
  const { careerSlug, moduleSlug } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [moduleData, setModuleData] = useState(null);
  const [careerInfo, setCareerInfo] = useState(null);
  const [subjectInfo, setSubjectInfo] = useState(null);
  const [navigationInfo, setNavigationInfo] = useState(null);
  const [resourcesList, setResourcesList] = useState([]);
  const [progress, setProgress] = useState(null);

  // Day 11 Assessment Engine State
  const [moduleAssessments, setModuleAssessments] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDifficulty, setActiveDifficulty] = useState('All');

  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to find module from static seed if backend returns 404 or is offline
  const findModuleFromSeed = (cSlug, mSlug) => {
    const career = CAREERS_SEED.find(c => c.slug.toLowerCase() === cSlug.toLowerCase()) || CAREERS_SEED[0];
    for (const phase of (career.roadmapPhases || [])) {
      for (const subject of (phase.subjects || [])) {
        for (const mod of (subject.modules || [])) {
          if (mod.slug.toLowerCase() === mSlug.toLowerCase() || mod.id === mSlug) {
            return {
              career: { title: career.title, slug: career.slug },
              subject: { id: subject.id, title: subject.title },
              module: mod,
              navigation: { prev: null, next: null, currentIndex: 1, totalModules: 1 }
            };
          }
        }
      }
    }
    const firstMod = career.roadmapPhases?.[0]?.subjects?.[0]?.modules?.[0];
    return {
      career: { title: career.title, slug: career.slug },
      subject: { id: 'sub-1', title: 'Foundations' },
      module: firstMod,
      navigation: { prev: null, next: null, currentIndex: 1, totalModules: 1 }
    };
  };

  const loadLearningHubData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [modRes, resRes, progressRes, assessRes] = await Promise.all([
        getModuleApi(careerSlug, moduleSlug),
        getResourcesApi({ career: careerSlug, module: moduleSlug, status: 'published' }),
        getCareerProgressApi(careerSlug),
        getAssessmentsApi({ career: careerSlug, module: moduleSlug })
      ]);

      if (assessRes && assessRes.success && Array.isArray(assessRes.assessments)) {
        setModuleAssessments(assessRes.assessments);
      } else {
        // Fallback: fetch all active assessments
        const fallbackAssess = await getAssessmentsApi();
        if (fallbackAssess && fallbackAssess.success) {
          setModuleAssessments(fallbackAssess.assessments || []);
        }
      }

      if (modRes && modRes.success && modRes.module) {
        setModuleData(modRes.module);
        setCareerInfo(modRes.career);
        setSubjectInfo(modRes.subject);
        setNavigationInfo(modRes.navigation);

        // Priority 1: Standalone published resources from Day 8 Content Engine
        if (resRes && resRes.success && resRes.resources && resRes.resources.length > 0) {
          setResourcesList(resRes.resources);
        } else if (modRes.module.resources && modRes.module.resources.length > 0) {
          // Priority 2: Embedded resources from module schema
          setResourcesList(modRes.module.resources);
        } else {
          setResourcesList([]);
        }
      } else {
        const fallback = findModuleFromSeed(careerSlug, moduleSlug);
        setModuleData(fallback.module);
        setCareerInfo(fallback.career);
        setSubjectInfo(fallback.subject);
        setNavigationInfo(fallback.navigation);
        setResourcesList(fallback.module?.resources || []);
      }

      if (progressRes && progressRes.success && progressRes.progress) {
        setProgress(progressRes.progress);
      }
    } catch (err) {
      console.warn('[LearningHub] Fetch error, using fallback:', err.message);
      const fallback = findModuleFromSeed(careerSlug, moduleSlug);
      setModuleData(fallback.module);
      setCareerInfo(fallback.career);
      setSubjectInfo(fallback.subject);
      setNavigationInfo(fallback.navigation);
      setResourcesList(fallback.module?.resources || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (careerSlug && moduleSlug) {
      loadLearningHubData();
    }
  }, [careerSlug, moduleSlug]);

  const completedLessons = progress?.completedLessons || [];

  // Toggle complete handler
  const handleToggleComplete = async (resourceId) => {
    const isCurrentlyDone = completedLessons.includes(String(resourceId));
    const nextState = !isCurrentlyDone;

    // Optimistic UI update
    const updatedLessons = nextState
      ? [...completedLessons, String(resourceId)]
      : completedLessons.filter(id => id !== String(resourceId));

    setProgress(prev => ({
      ...(prev || {}),
      completedLessons: updatedLessons
    }));

    try {
      const res = await toggleLessonProgressApi({
        careerSlug,
        moduleSlug,
        lessonId: resourceId,
        completed: nextState
      });

      if (res && res.success && res.progress) {
        setProgress(res.progress);
      }
      showToast(
        nextState ? 'Lesson completed! Progress saved.' : 'Lesson marked incomplete.',
        nextState ? 'success' : 'info'
      );
    } catch (err) {
      console.warn('[LearningHub] Progress toggle error:', err.message);
    }
  };

  // Submit quiz handler
  const handleSubmitQuiz = async (quizId, score, total) => {
    try {
      const res = await submitQuizProgressApi({
        careerSlug,
        moduleSlug,
        quizId,
        score,
        total
      });

      if (res && res.success && res.progress) {
        setProgress(res.progress);
      }
      showToast(`Quiz assessment score: ${score}/${total} recorded!`, 'success');
    } catch (err) {
      console.warn('[LearningHub] Quiz progress error:', err.message);
    }
  };

  // Complete practice challenge handler
  const handleCompletePractice = async (taskId) => {
    try {
      const res = await completePracticeProgressApi({
        careerSlug,
        moduleSlug,
        taskId
      });

      if (res && res.success && res.progress) {
        setProgress(res.progress);
      }
      showToast('Practice challenge verified! Progress updated.', 'success');
    } catch (err) {
      console.warn('[LearningHub] Practice progress error:', err.message);
    }
  };

  // Loading Skeleton State
  if (loading && !moduleData) {
    return (
      <div className="space-y-6 pb-14 animate-pulse">
        <div className="h-4 w-64 bg-slate-800 rounded-lg" />
        <div className="glass-card p-8 h-48 bg-slate-900/40 rounded-3xl" />
        <div className="h-10 w-full bg-slate-800/60 rounded-2xl" />
        <div className="space-y-4">
          <div className="glass-card h-40 bg-slate-900/30 rounded-2xl" />
          <div className="glass-card h-40 bg-slate-900/30 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Error State with Retry
  if (error) {
    return (
      <div className="glass-card p-12 text-center space-y-4 max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Failed to Load Module</h3>
        <p className="text-sm text-slate-400">{error}</p>
        <button
          type="button"
          onClick={loadLearningHubData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="glass-card p-12 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Module Not Found</h3>
        <p className="text-sm text-slate-400">
          The requested learning module "{moduleSlug}" does not exist.
        </p>
        <Link
          to={`/careers/${careerSlug}/roadmap`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Roadmap</span>
        </Link>
      </div>
    );
  }

  // Compute resources and progress
  const totalResources = resourcesList.length;
  const completedInModule = resourcesList.filter(r => 
    completedLessons.includes(String(r.id || r.slug))
  ).length;
  const moduleProgressPercent = totalResources > 0 
    ? Math.round((completedInModule / totalResources) * 100) 
    : 0;

  // Compute counts per type for filters
  const countsPerType = { all: totalResources };
  const availableTypes = [];
  resourcesList.forEach(r => {
    const t = r.type;
    countsPerType[t] = (countsPerType[t] || 0) + 1;
    if (!availableTypes.includes(t)) availableTypes.push(t);
  });

  // Filter resources by active tab, difficulty, and search keyword
  const filteredResources = resourcesList.filter(r => {
    // Type filter
    if (activeTab !== 'all' && r.type !== activeTab) return false;
    // Difficulty filter
    if (activeDifficulty !== 'All' && r.difficulty !== activeDifficulty) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchTitle = r.title?.toLowerCase().includes(q);
      const matchDesc = r.description?.toLowerCase().includes(q);
      const matchTopic = r.topic?.toLowerCase().includes(q);
      const matchTags = (r.tags || []).some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTopic && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-14">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
          <Link to="/careers" className="inline-flex items-center gap-1 hover:text-white transition-colors">
            <Compass className="w-3.5 h-3.5" />
            <span>Careers</span>
          </Link>
          <span>/</span>
          <Link to={`/careers/${careerSlug}`} className="hover:text-white transition-colors">
            {careerInfo?.title || careerSlug}
          </Link>
          <span>/</span>
          <Link to={`/careers/${careerSlug}/roadmap`} className="hover:text-white transition-colors">
            Roadmap
          </Link>
          <span>/</span>
          <span className="text-slate-400">{subjectInfo?.title}</span>
          <span>/</span>
          <span className="text-slate-100 font-semibold">{moduleData.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Ask Helping AI Quick Action */}
          <Link
            to={`/ai?career=${careerSlug}&module=${moduleSlug}&topic=${encodeURIComponent(moduleData.title)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 shadow-glow-brand transition-all"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ask Helping AI</span>
          </Link>

          {/* Roadmap Quick Link */}
          <Link
            to={`/careers/${careerSlug}/roadmap`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-all"
          >
            <Map className="w-3.5 h-3.5 text-indigo-400" />
            <span>Roadmap Tree</span>
          </Link>
        </div>
      </div>

      {/* Module Hero Banner */}
      <div className="glass-card p-6 sm:p-8 border-indigo-500/20 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {subjectInfo?.title || 'Subject Module'}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] text-slate-300 border border-white/5">
                {moduleData.difficulty || 'Intermediate'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{moduleData.estimatedHours} hours estimated</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {moduleData.title}
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {moduleData.description}
            </p>
          </div>

          {/* Module Progress Card */}
          <div className="glass-card p-5 bg-slate-900/60 border-white/10 w-full lg:w-80 flex-shrink-0 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">Module Completion</span>
              <span className="font-extrabold text-indigo-400 text-sm">{moduleProgressPercent}%</span>
            </div>
            <ProgressIndicator
              percent={moduleProgressPercent}
              size="md"
              showText={false}
              color={moduleProgressPercent === 100 ? 'emerald' : 'indigo'}
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{completedInModule} of {totalResources} lessons done</span>
              {moduleProgressPercent === 100 && (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Mastered
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Learning Objectives Checklist */}
        {moduleData.learningObjectives && moduleData.learningObjectives.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/[0.08] space-y-2.5">
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Learning Objectives</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
              {moduleData.learningObjectives.map((obj, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Day 11 Assessment Engine: Interactive Module Assessments & Adaptive Evaluations */}
      {moduleAssessments && moduleAssessments.length > 0 && (
        <div className="glass-card p-5 sm:p-6 border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 via-slate-900/60 to-purple-950/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">
                    Module Assessments & Adaptive Practice
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Day 11 Engine
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Authoritative server-graded assessments that recalibrate your skill mastery and diagnose weak areas.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {moduleAssessments.map(assess => (
              <div 
                key={assess._id || assess.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      {assess.type?.replace('_', ' ')}
                    </span>
                    {assess.adaptive ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Adaptive
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        Pass: {assess.passingScore}%
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {assess.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {assess.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>{assess.questionCount || (assess.questions?.length) || 5} questions</span>
                    {assess.timeLimitMinutes > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {assess.timeLimitMinutes}m
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAssessmentId(assess._id || assess.id);
                      setIsAssessmentModalOpen(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <span>Start</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resource Filtering Bar */}
      <ResourceFilters
        activeType={activeTab}
        onSelectType={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeDifficulty={activeDifficulty}
        onSelectDifficulty={setActiveDifficulty}
        resourceCounts={countsPerType}
        availableTypes={availableTypes}
      />

      {/* Resources Render List */}
      <div className="space-y-6">
        {filteredResources.length === 0 ? (
          <div className="glass-card p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">No resources match your filters</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery 
                ? `No resources found matching "${searchQuery}". Try clearing search or choosing another filter.`
                : 'Select "All Resources" to view all available learning content.'}
            </p>
            <button
              type="button"
              onClick={() => { setActiveTab('all'); setSearchQuery(''); setActiveDifficulty('All'); }}
              className="mt-2 px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id || resource.slug}
              resource={resource}
              isCompleted={completedLessons.includes(String(resource.id || resource.slug))}
              onToggleComplete={handleToggleComplete}
              onSubmitQuiz={handleSubmitQuiz}
              onCompletePractice={handleCompletePractice}
            />
          ))
        )}
      </div>

      {/* Prev / Next Module Navigation Footer */}
      <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-4">
        {navigationInfo?.prev ? (
          <Link
            to={`/learn/${careerSlug}/${navigationInfo.prev.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <div className="text-left">
              <div className="text-[10px] text-slate-500 uppercase">Previous Module</div>
              <div className="truncate max-w-[180px] sm:max-w-xs">{navigationInfo.prev.title}</div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {navigationInfo?.next ? (
          <Link
            to={`/learn/${careerSlug}/${navigationInfo.next.slug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
          >
            <div className="text-right">
              <div className="text-[10px] text-indigo-200 uppercase">Next Module</div>
              <div className="truncate max-w-[180px] sm:max-w-xs">{navigationInfo.next.title}</div>
            </div>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            to={`/careers/${careerSlug}/roadmap`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] transition-all"
          >
            <span>Roadmap Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </Link>
        )}
      </div>

      {/* Day 11 Assessment Engine Modal */}
      {isAssessmentModalOpen && selectedAssessmentId && (
        <AssessmentModal
          isOpen={isAssessmentModalOpen}
          onClose={() => {
            setIsAssessmentModalOpen(false);
            setSelectedAssessmentId(null);
          }}
          assessmentId={selectedAssessmentId}
          onSubmitted={() => {
            loadLearningHubData();
          }}
        />
      )}
    </div>
  );
}
