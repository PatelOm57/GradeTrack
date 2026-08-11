// src/components/gradeGroup.tsx
'use client';

import React from 'react';
import { GradeCard, GradeItem } from '@/components/gradeCard';

export interface GradeGroupType {
  id: number;
  course_id: number;
  name: string;
  weight: number;
}

interface GradeGroupProps {
  group: GradeGroupType;
  grades: GradeItem[];
  onUpdateScore: (gradeId: number, newPoints: number | null, newPercent: number | null) => void;
  onDeleteGrade: (gradeId: number) => void;
  onAddGrade?: (groupId: number) => void;
}

export function GradeGroup({
  group,
  grades,
  onUpdateScore,
  onDeleteGrade,
  onAddGrade,
}: GradeGroupProps) {
  // Calculate category average
  const groupAverage = React.useMemo(() => {
    let totalEarnedPoints = 0;
    let totalPossiblePoints = 0;
    let percentSum = 0;
    let percentCount = 0;

    grades.forEach((g) => {
      if (g.is_points) {
        if (g.points !== null && g.points !== undefined && g.points_of && g.points_of > 0) {
          totalEarnedPoints += g.points;
          totalPossiblePoints += g.points_of;
        }
      } else {
        if (g.percent !== null && g.percent !== undefined) {
          percentSum += g.percent;
          percentCount += 1;
        }
      }
    });

    if (totalPossiblePoints > 0) {
      return Math.round((totalEarnedPoints / totalPossiblePoints) * 100);
    } else if (percentCount > 0) {
      return Math.round(percentSum / percentCount);
    }

    return null;
  }, [grades]);

  return (
    <section className="border rounded-xl bg-white shadow-sm overflow-hidden transition-all">
      {/* Group Header */}
      <div className="flex items-center justify-between p-4 border-b bg-slate-50/60">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-slate-800 text-lg">{group.name}</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/70 text-slate-600">
            {group.weight}% of grade
          </span>
        </div>

        {/* Group Stats & Add Button */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-slate-600">
            Avg:{' '}
            <span className={groupAverage !== null ? 'text-blue-600 font-bold' : 'text-slate-400'}>
              {groupAverage !== null ? `${groupAverage}%` : '—'}
            </span>
          </span>

          {onAddGrade && (
            <button
              onClick={() => onAddGrade(group.id)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors border border-blue-200"
            >
              + Add Grade Item
            </button>
          )}
        </div>
      </div>

      {/* Grades List */}
      <div>
        {grades.length > 0 ? (
          grades.map((grade) => (
            <GradeCard
              key={grade.id}
              grade={grade}
              onUpdateScore={onUpdateScore}
              onDelete={onDeleteGrade}
            />
          ))
        ) : (
          <div className="p-4 text-center text-xs text-slate-400 italic">
            No grade items added to this group yet.
          </div>
        )}
      </div>
    </section>
  );
}