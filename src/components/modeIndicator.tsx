'use client';

import React, { useState } from 'react';
import { getStorageMode, setStorageMode, StorageMode } from '@/lib/local/session';

export function ModeIndicator() {
  const [mode, setMode] = useState<StorageMode>(() => getStorageMode());

  const handleToggle = () => {
    const nextMode = mode === 'local' ? 'cloud' : 'local';
    setStorageMode(nextMode);
    setMode(nextMode);
  };

  return (
    <div className="gt-mode-banner">
      <div className="gt-mode-status">
        <span
          className={`gt-mode-dot ${
            mode === 'local' ? 'gt-dot-local' : 'gt-dot-cloud'
          }`}
        />
        <span className="gt-mode-text">
          Storage Mode:{' '}
          <strong className="gt-mode-label">
            {mode === 'local' ? 'Offline (Local Storage)' : 'Cloud (Supabase)'}
          </strong>
        </span>
      </div>

      <button 
        onClick={handleToggle} 
        type="button" 
        className="gt-mode-toggle-btn gt-pop-target"
      >
        Switch to {mode === 'local' ? 'Cloud' : 'Local'}
      </button>
    </div>
  );
}