// src/components/dialog/editGradeItemDialog.tsx
'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/dialog/dialog';
import { GradeItem } from '@/components/gradeCard';

interface EditGradeItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  grade: GradeItem | null;
  onSave: (
    id: number,
    newName: string,
    newPoints: number | null,
    newPointsOf: number,
    newNote: string | null
  ) => Promise<void>;
}

export function EditGradeItemDialog({
  isOpen,
  onClose,
  grade,
  onSave,
}: EditGradeItemDialogProps) {
  const [name, setName] = useState(grade?.name ?? '');
  const [points, setPoints] = useState(
    grade?.points !== null && grade?.points !== undefined ? String(grade.points) : ''
  );
  const [pointsOf, setPointsOf] = useState(String(grade?.points_of ?? 10));
  const [note, setNote] = useState(grade?.note ?? '');

  // Sync state when grade changes
  const [prevGradeId, setPrevGradeId] = useState<number | null>(grade?.id ?? null);
  if (grade && grade.id !== prevGradeId) {
    setPrevGradeId(grade.id);
    setName(grade.name);
    setPoints(grade.points !== null && grade.points !== undefined ? String(grade.points) : '');
    setPointsOf(String(grade.points_of ?? 10));
    setNote(grade.note ?? '');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grade || !name.trim()) return;

    const parsedPoints = points.trim() !== '' ? parseFloat(points) : null;
    const finalPoints = parsedPoints !== null && !isNaN(parsedPoints) ? parsedPoints : null;
    const finalMaxPoints = parseFloat(pointsOf) || 10;
    const finalNote = note.trim() !== '' ? note.trim() : null;

    // 1. Close modal instantly on submit press/Enter key
    onClose();

    // 2. Persist state & DB updates in background
    onSave(grade.id, name.trim(), finalPoints, finalMaxPoints, finalNote);
  };

  if (!grade) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Configure Grade Item">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase text-slate-500">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="gt-editable-title-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase text-slate-500">
                Earned Score
              </label>
              <input
                type="number"
                step="any"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="e.g. 8.5"
                className="gt-editable-title-input"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase text-slate-500">Max Points</label>
              <input
                type="number"
                step="any"
                value={pointsOf}
                onChange={(e) => setPointsOf(e.target.value)}
                className="gt-editable-title-input"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase text-slate-500">
              Notes <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Add any notes here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="gt-editable-title-input resize-none"
            />
          </div>
        </div>

        <div className="gt-modal-actions">
          <button type="button" onClick={onClose} className="gt-btn-cancel gt-pop-target">
            Cancel
          </button>
          <button type="submit" className="gt-btn-primary gt-pop-target">
            Save Changes
          </button>
        </div>
      </form>
    </Dialog>
  );
}