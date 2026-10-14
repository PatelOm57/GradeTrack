'use client';

import React from 'react';

interface LoadingScreenProps {
  message?: string;
  variant?: 'spinner' | 'skeleton';
}

export function LoadingScreen({ 
  message = 'Loading GradeTrack...', 
  variant = 'spinner' 
}: LoadingScreenProps) {
  if (variant === 'skeleton') {
    return (
      <main className="gt-skeleton-container">
        {/* Main Centered Dashboard Title Placeholder */}
        <div className="gt-skeleton-title" />
        
        {/* Course Group Skeleton */}
        <div className="gt-skeleton-section">
          <div className="gt-skeleton-group-title" />
          <div className="gt-skeleton-grid">
            <div className="gt-skeleton-card">
              <div className="gt-skeleton-card-line w-3/4" />
              <div className="gt-skeleton-card-line w-1/2" />
              <div className="gt-skeleton-card-line w-1/3 mt-auto" />
            </div>
            <div className="gt-skeleton-card">
              <div className="gt-skeleton-card-line w-3/4" />
              <div className="gt-skeleton-card-line w-1/2" />
              <div className="gt-skeleton-card-line w-1/3 mt-auto" />
            </div>
            <div className="gt-skeleton-card">
              <div className="gt-skeleton-card-line w-3/4" />
              <div className="gt-skeleton-card-line w-1/2" />
              <div className="gt-skeleton-card-line w-1/3 mt-auto" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="gt-loading-screen">
      <div className="gt-spinner" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}