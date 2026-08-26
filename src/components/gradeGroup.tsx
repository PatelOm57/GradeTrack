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
    <section className="gt-group-card">
      <div className="gt-group-header">
        <div className="gt-group-title-wrapper">
          <h3 className="gt-group-title">{group.name}</h3>
          <span className="gt-group-weight-badge">{group.weight}% of grade</span>
        </div>

        <div className="gt-group-stats">
          <span className="gt-group-avg-display">
            Avg:{' '}
            <span className={groupAverage !== null ? 'gt-avg-value' : 'gt-avg-empty'}>
              {groupAverage !== null ? `${groupAverage}%` : '—'}
            </span>
          </span>

          {onAddGrade && (
            <button onClick={() => onAddGrade(group.id)} className="gt-add-grade-btn">
              + Add Grade Item
            </button>
          )}
        </div>
      </div>

      <div className="gt-group-items-list">
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
          <div className="gt-group-empty-state">
            No grade items added to this group yet.
          </div>
        )}
      </div>
    </section>
  );
}