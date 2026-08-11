// src/components/gradeCard.tsx
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
  
  // Calculate display percentage and current score value based on `is_points`
  const activeScore = grade.is_points ? grade.points : grade.percent;
  const maxPoints = grade.is_points ? (grade.points_of ?? 100) : 100;

  const [scoreInput, setScoreInput] = useState<string>(
    activeScore !== null && activeScore !== undefined ? String(activeScore) : ''
  );

  // Derive percentage value for the badge
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

  return (
    <div className="flex items-center justify-between p-3 border-b hover:bg-slate-50/80 transition-colors text-sm">
      {/* Grade Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="font-medium text-slate-800 truncate">{grade.name}</span>
        {grade.due_date && (
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            Due {new Date(grade.due_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Editable Points / Max Points */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {isEditing ? (
            <input
              type="number"
              value={scoreInput}
              onChange={(e) => setScoreInput(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
              autoFocus
              className="w-16 border-2 border-blue-500 rounded px-1 text-right font-medium outline-none bg-white"
            />
          ) : (
            <span
              onClick={() => setIsEditing(true)}
              className="cursor-pointer hover:bg-slate-200/60 px-2 py-0.5 rounded font-medium text-slate-700 min-w-[2.5rem] text-right"
              title="Click to edit score"
            >
              {activeScore !== null && activeScore !== undefined ? activeScore : '—'}
            </span>
          )}
          {grade.is_points && <span className="text-slate-400">/ {maxPoints}</span>}
        </div>

        {/* Calculated Percentage Badge */}
        <span
          className={`w-14 text-right font-semibold text-xs px-2 py-1 rounded ${
            calculatedPercentage === null
              ? 'text-slate-400 bg-slate-100'
              : calculatedPercentage >= 80
              ? 'text-emerald-700 bg-emerald-50'
              : calculatedPercentage >= 70
              ? 'text-amber-700 bg-amber-50'
              : 'text-rose-700 bg-rose-50'
          }`}
        >
          {calculatedPercentage !== null ? `${calculatedPercentage}%` : 'Pending'}
        </span>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(grade.id)}
          className="text-slate-300 hover:text-rose-500 transition-colors px-1"
          title="Delete grade item"
        >
          ✕
        </button>
      </div>
    </div>
  );
}