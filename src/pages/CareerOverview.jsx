import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Map, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  Layers, 
  Sparkles, 
  BookOpen, 
  ChevronRight, 
  ShieldCheck, 
  ListChecks, 
  Compass, 
  ArrowUpRight 
} from 'lucide-react';
import { getCareerBySlugApi, getCareerProgressApi } from '../utils/api';
import ProgressIndicator from '../components/careers/ProgressIndicator';
import { CAREERS_SEED } from '../data/careersData.js';

export default function CareerOverview() {
  const { careerSlug } = useParams();
  const navigate = useNavigate();
  const [career, setCareer] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCareer() {
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
        console.warn('[CareerOverview] Fetch error, using fallback:', err.message);
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
      loadCareer();
    }
    return () => { isMounted = false; };
  }, [careerSlug]);

  if (loading && !career) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading career overview...</span>
      </div>
    );
  }

  if (!career) {
    return (
      <div className="glass-card p-12 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Career Not Found</h3>
        <p className="text-sm text-slate-400">
          We couldn't locate the requested career path "{careerSlug}".
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
  const phases = career.roadmapPhases || [];
  const completedLessons = progress?.completedLessons || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Back Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/careers" className="inline-flex items-center gap-1 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Career Catalog</span>
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold">{career.title}</span>
      </div>

      {/* Hero Overview Card */}
      <div className="glass-card p-6 sm:p-10 border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {career.category}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] text-slate-300 border border-white/5">
                {career.difficulty}
              </span>
              {career.status && (
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {career.status}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {career.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {career.description}
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-6 pt-2 flex-wrap text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span><strong>{career.estimatedHours}</strong> total hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span><strong>{phases.length}</strong> roadmap phases</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span><strong>{career.moduleCount || '10+'}</strong> curriculum modules</span>
              </div>
            </div>
          </div>

          {/* Progress & Launch Action Box */}
          <div className="glass-card p-6 bg-slate-900/60 border-white/10 w-full lg:w-80 flex-shrink-0 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 uppercase tracking-wider">Your Progress</span>
                <span className="font-extrabold text-indigo-400 text-sm">{overallPercent}%</span>
              </div>
              <ProgressIndicator percent={overallPercent} size="md" showText={false} />
              <div className="text-[11px] text-slate-400 text-right">
                {completedLessons.length} lessons completed
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                to={`/careers/${career.slug}/roadmap`}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <span>{overallPercent > 0 ? 'Resume Roadmap' : 'Start Roadmap'}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              <Link
                to="/careers"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-all"
              >
                <span>Browse Other Careers</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Skills & Prerequisites Two-Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Skills Card */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Target Competencies to Master</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(career.skills || []).map((skill, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-200 border border-white/5 font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Prerequisites Card */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Recommended Prerequisites</span>
          </div>
          <ul className="space-y-2">
            {(career.prerequisites || ['No hard prerequisites — beginner friendly']).map((req, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Roadmap Phases Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Curriculum Roadmap Phases
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Structured progressive stages from foundations to production mastery.
            </p>
          </div>

          <Link
            to={`/careers/${career.slug}/roadmap`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>Open Detailed Roadmap</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {phases.map((phase) => {
            const subjects = phase.subjects || [];
            let totalMods = 0;
            subjects.forEach(s => { totalMods += (s.modules || []).length; });

            return (
              <div
                key={phase.phaseNumber}
                className="glass-card p-6 border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {phase.phaseNumber}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-100">
                      {phase.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      {phase.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span>{subjects.length} Subjects</span>
                      <span>•</span>
                      <span>{totalMods} Learning Modules</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{phase.estimatedHours} hrs</span>
                  </div>
                  <Link
                    to={`/careers/${career.slug}/roadmap`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    <span>View Phase</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
