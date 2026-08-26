'use client';

import React, { useState } from 'react';

export interface GradeItem {
  id: number;
  ggroup_id: number;
  name: string;
  percent: number | null;
  is_points: boolean;
  points: number | null;
  points_of: number | null;
  auto_percent?: boolean;
  due_date?: string | null;
}

interface GradeCardProps {
  grade: GradeItem;
  onUpdateScore: (id: number, newPoints: number | null, newPercent: number | null) => void;
  onDelete: (id: number) => void;
}

export function GradeCard({ grade, onUpdateScore, onDelete }: GradeCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const activeScore = grade.is_points ? grade.points : grade.percent;
  const maxPoints = grade.is_points ? (grade.points_of ?? 100) : 100;

  const [scoreInput, setScoreInput] = useState<string>(
    activeScore !== null && activeScore !== undefined ? String(activeScore) : ''
  );

  const calculatedPercentage = React.useMemo(() => {
    if (grade.is_points) {
      if (grade.points !== null && grade.points !== undefined && maxPoints > 0) {
        return Math.round((grade.points / maxPoints) * 100);
      }
      return null;
    }
    return grade.percent !== null ? Math.round(grade.percent) : null;
  }, [grade, maxPoints]);

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

  const getBadgeClass = () => {
    if (calculatedPercentage === null) return 'gt-badge-pending';
    if (calculatedPercentage >= 80) return 'gt-badge-high';
    if (calculatedPercentage >= 70) return 'gt-badge-mid';
    return 'gt-badge-low';
  };

  return (
    <div className="gt-grade-card">
      <div className="gt-grade-info">
        <span className="gt-grade-name">{grade.name}</span>
        {grade.due_date && (
          <span className="gt-grade-due-date">
            Due {new Date(grade.due_date).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="gt-grade-actions">
        <div className="gt-grade-score-wrapper">
          {isEditing ? (
            <input
              type="number"
              value={scoreInput}
              onChange={(e) => setScoreInput(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
              autoFocus
              className="gt-grade-score-input"
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
          {grade.is_points && <span className="gt-grade-max-points">/ {maxPoints}</span>}
        </div>

        <span className={`gt-grade-badge ${getBadgeClass()}`}>
          {calculatedPercentage !== null ? `${calculatedPercentage}%` : 'Pending'}
        </span>

        <button
          onClick={() => onDelete(grade.id)}
          className="gt-grade-delete-btn"
          title="Delete grade item"
        >
          ✕
        </button>
      </div>
    </div>
  );
}