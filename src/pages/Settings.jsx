import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Moon, Sun, Bell, Shield, Sparkles, Check } from 'lucide-react';
import { studentProfile } from '../data/dummyData';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const [profile, setProfile] = useState(studentProfile);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 border-indigo-500/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Platform Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Customize your student profile, workspace appearance, and notification cadences.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Settings */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <User className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Student Profile Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Role
              </label>
              <input
                type="text"
                value={profile.targetRole}
                onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                University / Institution
              </label>
              <input
                type="text"
                value={profile.university}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Major & Specialization
              </label>
              <input
                type="text"
                value={profile.major}
                onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            {isDark ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Appearance & Theme
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div>
              <h3 className="text-sm font-semibold text-white">Interface Theme Mode</h3>
              <p className="text-xs text-slate-400">
                Switch between modern obsidian dark mode and high-contrast light mode.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-all self-start sm:self-auto"
            >
              {isDark ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dark Mode (Active)</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode (Active)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Notification Preferences
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
              <div>
                <p className="font-semibold text-white">Daily Coding Streak Reminders</p>
                <p className="text-xs text-slate-400">Get notified if your daily problem has not been solved by 7 PM.</p>
              </div>
              <input
                type="checkbox"
                checked={streakReminders}
                onChange={(e) => setStreakReminders(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
              <div>
                <p className="font-semibold text-white">Weekly Career Velocity Summary</p>
                <p className="text-xs text-slate-400">Receive a weekly digest of study hours, milestones, and completed projects.</p>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <Check className="w-4 h-4" />
              Settings saved locally
            </span>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
          >
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
