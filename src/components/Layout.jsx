import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col lg:flex-row transition-colors duration-200">
      {/* Sidebar for Desktop & Mobile Drawer */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 min-h-screen">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Minimal Footer */}
        <footer className="px-4 sm:px-8 py-4 border-t border-slate-200 dark:border-white/[0.06] text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CareerOS — "Build your skills. Track your growth. Shape your career."</span>
          <span className="text-[11px] text-indigo-400 font-mono">Day 1 • Frontend Architecture</span>
        </footer>
      </div>
    </div>
  );
}
