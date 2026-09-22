import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileCheck2, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Code, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  Linkedin,
  Github
} from 'lucide-react';
import { resumeData, studentProfile } from '../data/dummyData';

export default function ResumePage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Top ATS Score & Action Header */}
      <div className="glass-card p-6 sm:p-8 border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>ATS Resume Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Resume & Professional Profile
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Optimized for applicant tracking systems (ATS) and tech recruiters. Live synchronized with your projects and achievements.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-center min-w-[120px]">
            <div className="text-3xl font-black text-emerald-400">{resumeData.score}%</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">ATS Strength</div>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: ATS Resume Preview (8 cols) */}
        <div className="lg:col-span-8 glass-card p-6 sm:p-8 space-y-6 border-white/10 bg-slate-900/60 print:bg-white print:text-black">
          {/* Header */}
          <div className="border-b border-white/10 pb-5 space-y-1.5">
            <h2 className="text-2xl font-black text-white tracking-tight">{studentProfile.name}</h2>
            <p className="text-sm font-medium text-indigo-400">{studentProfile.targetRole}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                {studentProfile.email}
              </span>
              <span className="flex items-center gap-1">
                <Github className="w-3.5 h-3.5 text-indigo-400" />
                github.com/alexrivera
              </span>
              <span className="flex items-center gap-1">
                <Linkedin className="w-3.5 h-3.5 text-indigo-400" />
                linkedin.com/in/alexrivera
              </span>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-1">
              Professional Summary
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {resumeData.summary}
            </p>
          </div>

          {/* Education */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              Education
            </h3>
            {resumeData.education.map((edu, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-bold text-white">{edu.degree}</span>
                  <span className="text-slate-400">{edu.period}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-indigo-300">
                  <span>{edu.institution}</span>
                  <span className="font-semibold">GPA: {edu.gpa}</span>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-400 pt-1 space-y-0.5">
                  {edu.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Technical Skills */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-1 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              Technical Skills
            </h3>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {resumeData.skillsList.map((skill) => (
                <span key={skill} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-slate-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              Certifications & Credentials
            </h3>
            <div className="space-y-2">
              {resumeData.certifications.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">{c.name}</span>
                  <span className="text-slate-400">{c.issuer} • {c.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: ATS Recommendations (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">ATS Optimization Insights</h3>
            </div>

            <div className="space-y-3">
              {resumeData.improvements.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{item.title}</span>
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
