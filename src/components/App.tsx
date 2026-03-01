import { useState } from 'react';
import { LandingPage } from './LandingPage';
import { Editor } from './Editor';

export function App() {
  const [page, setPage] = useState<'landing' | 'editor'>('landing');

  if (page === 'landing') {
    return <LandingPage onStart={() => setPage('editor')} />;
  }

  return <Editor />;
}
