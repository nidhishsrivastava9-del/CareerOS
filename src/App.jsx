import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RoadmapPage from './pages/Roadmap';
import SkillsPage from './pages/Skills';
import ProjectsPage from './pages/Projects';
import DSAPage from './pages/DSA';
import GoalsPage from './pages/Goals';
import ResumePage from './pages/Resume';
import AnalyticsPage from './pages/Analytics';
import SettingsPage from './pages/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="dsa" element={<DSAPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
