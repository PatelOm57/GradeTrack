// src/components/gradeCard.tsx
'use client';

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface GradeItem {
  id: number;
  ggroup_id: number;
  name: string;
  percent: number | null;
  is_points: boolean;
  points: number | null;
  points_of: number | null;
  note?: string | null;
  auto_percent?: boolean;
  due_date?: string | null;
}

interface GradeCardProps {
  grade: GradeItem;
  onUpdateScore: (id: number, newPoints: number | null, newPercent: number | null) => void;
  onDelete: (id: number) => void;
  onConfigure?: (grade: GradeItem) => void;
}

export function GradeCard({ grade, onUpdateScore, onDelete, onConfigure }: GradeCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipCoords, setTooltipCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeScore = grade.is_points ? grade.points : grade.percent;
  const maxPoints = grade.is_points ? (grade.points_of ?? 10) : 100;

  const [scoreInput, setScoreInput] = useState<string>(
    activeScore !== null && activeScore !== undefined ? String(activeScore) : ''
  );

  // Sync internal input state whenever the prop score updates externally
  const [prevActiveScore, setPrevActiveScore] = useState<number | null>(activeScore ?? null);
  if (activeScore !== prevActiveScore) {
    setPrevActiveScore(activeScore ?? null);
    setScoreInput(activeScore !== null && activeScore !== undefined ? String(activeScore) : '');
  }

  const handleMouseEnter = () => {
    if (!grade.note || grade.note.trim() === '') return;

    hoverTimerRef.current = setTimeout(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setTooltipCoords({
          top: rect.bottom + window.scrollY + 12,
          left: rect.left + window.scrollX + rect.width / 2,
        });
        setShowTooltip(true);
      }
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    setShowTooltip(false);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const num = parseFloat(scoreInput);

    if (!isNaN(num)) {
      if (grade.is_points) {
        const computedPct = maxPoints > 0 ? (num / maxPoints) * 100 : null;
        onUpdateScore(grade.id, num, computedPct);
      } else {
        onUpdateScore(grade.id, null, num);
      }
    } else if (scoreInput.trim() === '') {
      onUpdateScore(grade.id, null, null);
    } else {
      setScoreInput(activeScore !== null && activeScore !== undefined ? String(activeScore) : '');
    }
  };

  return (
    <div
      ref={cardRef}
      className="gt-grade-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="gt-grade-info">
        <span className="gt-grade-name" title={grade.name}>
          {grade.name}
        </span>
      </div>

      <div className="gt-grade-score-wrapper">
        {isEditing ? (
          <input
            type="number"
            step="any"
            value={scoreInput}
            onChange={(e) => setScoreInput(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
            autoFocus
            className="gt-score-inline-input"
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className="gt-grade-score-display"
            title="Click to edit score"
          >
            {activeScore !== null && activeScore !== undefined ? activeScore : '—'}
          </span>
        )}
        {grade.is_points && <span className="gt-grade-max-points">/{maxPoints}</span>}
      </div>

      {/* Slide-out Bottom Action Controls */}
      <div className="gt-card-popout-controls">
        {onConfigure && (
          <button
            type="button"
            onClick={() => onConfigure(grade)}
            className="gt-card-pop-btn gt-pop-target text-black"
            title="Configure grade item"
          >
            <span className="inline-block translate-y-[-0.5px]">⚙</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(grade.id)}
          className="gt-card-pop-btn gt-card-pop-delete gt-pop-target"
          title="Delete grade item"
        >
          <span className="inline-block translate-y-[-0.5px]">✕</span>
        </button>
      </div>

      {/* Portal Tooltip */}
      {typeof window !== 'undefined' &&
        showTooltip &&
        grade.note &&
        grade.note.trim() !== '' &&
        createPortal(
          <div
            className="gt-portal-note-tooltip"
            style={{
              top: `${tooltipCoords.top}px`,
              left: `${tooltipCoords.left}px`,
            }}
          >
            {grade.note}
          </div>,
          document.body
        )}
    </div>
  );
}