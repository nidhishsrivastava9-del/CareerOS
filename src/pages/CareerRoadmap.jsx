import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Map, 
  Clock, 
  Layers, 
  BookOpen, 
  CheckCircle2, 
  Filter, 
  ChevronRight, 
  Compass 
} from 'lucide-react';
import { getCareerBySlugApi, getCareerProgressApi } from '../utils/api';
import RoadmapPhase from '../components/careers/RoadmapPhase';
import ProgressIndicator from '../components/careers/ProgressIndicator';
import { CAREERS_SEED } from '../data/careersData.js';

export default function CareerRoadmap() {
  const { careerSlug } = useParams();
  const [career, setCareer] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRoadmapData() {
      try {
        setLoading(true);
        const [careerRes, progressRes] = await Promise.all([
          getCareerBySlugApi(careerSlug),
          getCareerProgressApi(careerSlug)
        ]);

        if (isMounted) {
          if (careerRes && careerRes.success && careerRes.career) {
            setCareer(careerRes.career);
          } else {
            const fallback = CAREERS_SEED.find(
              c => c.slug.toLowerCase() === (careerSlug || '').toLowerCase()
            );
            setCareer(fallback || CAREERS_SEED[0]);
          }

          if (progressRes && progressRes.success && progressRes.progress) {
            setProgress(progressRes.progress);
          }
        }
      } catch (err) {
        console.warn('[CareerRoadmap] Fetch error, using fallback:', err.message);
        if (isMounted) {
          const fallback = CAREERS_SEED.find(
            c => c.slug.toLowerCase() === (careerSlug || '').toLowerCase()
          );
          setCareer(fallback || CAREERS_SEED[0]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (careerSlug) {
      loadRoadmapData();
    }
    return () => { isMounted = false; };
  }, [careerSlug]);

  if (loading && !career) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading career roadmap...</span>
      </div>
    );
  }

  if (!career) {
    return (
      <div className="glass-card p-12 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Roadmap Not Found</h3>
        <p className="text-sm text-slate-400">
          The requested career roadmap "{careerSlug}" could not be located.
        </p>
        <Link
          to="/careers"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const overallPercent = progress?.overallPercentage || 0;
  const completedLessons = progress?.completedLessons || [];
  const completedModules = progress?.completedModules || [];
  const phases = career.roadmapPhases || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/careers" className="inline-flex items-center gap-1 hover:text-white transition-colors">
          <Compass className="w-3.5 h-3.5" />
          <span>Careers</span>
        </Link>
        <span>/</span>
        <Link to={`/careers/${career.slug}`} className="hover:text-white transition-colors">
          {career.title}
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold">Roadmap</span>
      </div>

      {/* Top Roadmap Banner */}
      <div className="glass-card p-6 sm:p-8 border-indigo-500/20 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Map className="w-3.5 h-3.5" />
              <span>Hierarchical Learning Roadmap</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {career.title} Roadmap
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {career.description}
            </p>
          </div>

          {/* Overall Progress Widget */}
          <div className="glass-card p-5 bg-slate-900/60 border-white/10 w-full lg:w-80 flex-shrink-0 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">Career Progress</span>
              <span className="font-extrabold text-indigo-400 text-sm">{overallPercent}%</span>
            </div>
            <ProgressIndicator percent={overallPercent} size="md" showText={false} />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{completedLessons.length} lessons verified</span>
              <span>{career.estimatedHours} hrs total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchical Phases Timeline */}
      <div className="space-y-10 pt-2">
        {phases.map((phase) => (
          <RoadmapPhase
            key={phase.phaseNumber}
            phase={phase}
            careerSlug={career.slug}
            completedLessonIds={completedLessons}
            completedModuleSlugs={completedModules}
          />
        ))}
      </div>
    </div>
  );
}
