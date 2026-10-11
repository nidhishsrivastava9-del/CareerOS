import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext({
  showToast: () => {}
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />;
      case 'info':
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />;
    }
  };

  const getToastStyle = (type) => {
    switch (type) {
      case 'error':
        return 'border-rose-500/30 bg-slate-900/90 shadow-rose-950/40 text-rose-200';
      case 'info':
        return 'border-indigo-500/30 bg-slate-900/90 shadow-indigo-950/40 text-indigo-200';
      case 'success':
      default:
        return 'border-emerald-500/30 bg-slate-900/90 shadow-emerald-950/40 text-emerald-200';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.92, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl text-xs font-semibold ${getToastStyle(
                toast.type
              )}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {getToastIcon(toast.type)}
                <span className="truncate text-white font-medium">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
