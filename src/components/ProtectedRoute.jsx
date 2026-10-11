import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A12] flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center animate-pulse shadow-glow-brand">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-sm font-medium text-slate-300">Verifying CareerOS Session...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
