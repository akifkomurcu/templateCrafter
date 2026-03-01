import { useState, useEffect } from 'react';
import { LandingPage } from './LandingPage';
import { Editor } from './Editor';
import { useAppStore } from '../store/useAppStore';

export function App() {
  const [page, setPage] = useState<'landing' | 'editor'>('landing');
  const darkMode = useAppStore((s) => s.darkMode);

  // Initialize theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (!saved && systemDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      // If store is false, toggle it once to sync
      if (!darkMode) {
        useAppStore.getState().toggleDarkMode();
      }
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-stone-800 dark:text-stone-100 font-sans transition-colors duration-200">
      {page === 'landing' ? (
        <LandingPage onStart={() => setPage('editor')} />
      ) : (
        <Editor />
      )
      }
    </div>
  );
}
