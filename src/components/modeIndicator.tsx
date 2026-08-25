'use client';

import React, { useState } from 'react';
import { getStorageMode, setStorageMode, StorageMode } from '@/lib/local/session';

export function ModeIndicator() {
  // Read mode lazily on initial client render
  const [mode, setMode] = useState<StorageMode>(() => getStorageMode());

  const handleToggle = () => {
    const nextMode = mode === 'local' ? 'cloud' : 'local';
    setStorageMode(nextMode);
    setMode(nextMode);
  };

  return (
    <div className="flex items-center justify-between bg-slate-900 text-white text-xs px-4 py-2 rounded-lg shadow-sm mb-6">
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            mode === 'local' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'
          }`}
        />
        <span>
          Storage Mode:{' '}
          <strong className="font-semibold uppercase tracking-wider">
            {mode === 'local' ? 'Offline (Local Storage)' : 'Cloud (Supabase)'}
          </strong>
        </span>
      </div>

      <button
        onClick={handleToggle}
        type="button"
        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded border border-slate-700 transition-colors"
      >
        Switch to {mode === 'local' ? 'Cloud' : 'Local'}
      </button>
    </div>
  );
}