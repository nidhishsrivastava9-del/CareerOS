import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
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
import Login from './pages/Login';
import Register from './pages/Register';
import CareerCatalog from './pages/CareerCatalog';
import CareerOverview from './pages/CareerOverview';
import CareerRoadmap from './pages/CareerRoadmap';
import LearningHub from './pages/LearningHub';
import HelpingAI from './pages/HelpingAI';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected App Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="careers" element={<CareerCatalog />} />
                <Route path="careers/:careerSlug" element={<CareerOverview />} />
                <Route path="careers/:careerSlug/roadmap" element={<CareerRoadmap />} />
                <Route path="learn/:careerSlug/:moduleSlug" element={<LearningHub />} />
                <Route path="ai" element={<HelpingAI />} />
                <Route path="helping-ai" element={<Navigate to="/ai" replace />} />
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
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
