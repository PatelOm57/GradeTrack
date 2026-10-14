// src/components/gradeGroup.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
  onDeleteGroup?: (groupId: number) => void;
  onUpdateGroup?: (groupId: number, newName: string, newWeight: number) => void;
  onOpenAddItemForGroup?: (groupId: number) => void;
  onConfigureGrade?: (grade: GradeItem) => void;
}

export function GradeGroup({
  group,
  grades,
  onUpdateScore,
  onDeleteGrade,
  onDeleteGroup,
  onUpdateGroup,
  onOpenAddItemForGroup,
  onConfigureGrade,
}: GradeGroupProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(group.name);

  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightInput, setWeightInput] = useState(String(group.weight));

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

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() !== '' && onUpdateGroup) {
      onUpdateGroup(group.id, titleInput.trim(), group.weight);
    } else {
      setTitleInput(group.name);
    }
  };

  const handleWeightSubmit = () => {
    setIsEditingWeight(false);
    const parsed = parseFloat(weightInput);
    if (!isNaN(parsed) && onUpdateGroup) {
      onUpdateGroup(group.id, group.name, parsed);
    } else {
      setWeightInput(String(group.weight));
    }
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    if (onDeleteGroup) {
      onDeleteGroup(group.id);
    }
  };

  return (
    <>
      <section className="gt-group-card">
        <div className="gt-group-header">
          <div className="gt-group-meta-col">
            <div className="gt-group-title-row">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                  autoFocus
                  className="gt-editable-title-input gt-group-title"
                />
              ) : (
                <h3 className="gt-group-title">{group.name}</h3>
              )}

              <div className="gt-group-popout-actions">
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  className="gt-popout-btn-small gt-pop-target"
                  title="Edit group name"
                >
                  <Image src="/edit-icon.svg" alt="Edit" width={12} height={12} />
                </button>

                {onDeleteGroup && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="gt-popout-btn-small gt-popout-btn-delete gt-pop-target"
                    title={`Delete ${group.name} group`}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="gt-group-weight-row">
              {isEditingWeight ? (
                <input
                  type="number"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  onBlur={handleWeightSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleWeightSubmit()}
                  autoFocus
                  className="gt-weight-input"
                />
              ) : (
                <span 
                  onClick={() => setIsEditingWeight(true)}
                  className="cursor-pointer hover:underline"
                  title="Click to edit group weight percentage"
                >
                  {group.weight}% of grade
                </span>
              )}
            </div>
          </div>

          <div className="gt-group-stats">
            <span className="gt-group-avg-display">
              Avg:{' '}
              <span className={groupAverage !== null ? 'gt-avg-value' : 'gt-avg-empty'}>
                {groupAverage !== null ? `${groupAverage}%` : '—'}
              </span>
            </span>
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
                onConfigure={onConfigureGrade}
              />
            ))
          ) : (
            <div className="gt-group-empty-state">
              No grade items added to this group yet.
            </div>
          )}
        </div>

        {onOpenAddItemForGroup && (
          <button
            type="button"
            onClick={() => onOpenAddItemForGroup(group.id)}
            className="gt-group-add-btn gt-pop-target"
            title={`Add grade item to ${group.name}`}
          >
            <span>+</span>
            <span className="gt-group-add-label">Add Grade Item</span>
          </button>
        )}
      </section>

      {showDeleteModal && (
        <div className="gt-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="gt-modal-card" onClick={(e) => e.stopPropagation()}>
            <h4 className="gt-modal-title">Delete Grade Group?</h4>
            <p className="gt-modal-text">
              Are you sure you want to delete <strong>{group.name}</strong>? This action will permanently remove all grade items inside this group.
            </p>

            <div className="gt-modal-actions">
              <button 
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="gt-btn-cancel gt-pop-target"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleConfirmDelete}
                className="gt-btn-delete gt-pop-target"
              >
                Delete Group
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}