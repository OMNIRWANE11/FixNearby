import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`} role="status">
            <span>
              {t.type === 'success' && '✓'}
              {t.type === 'error' && '✕'}
              {t.type === 'warning' && '⚠️'}
              {t.type === 'info' && 'ℹ️'}
            </span>
            <div style={{ flexGrow: 1, fontSize: '0.9rem' }}>{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              style={{ background: 'transparent', color: 'var(--text-muted)', padding: '2px', minHeight: 'auto' }}
              aria-label="Dismiss Notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default ToastProvider;

