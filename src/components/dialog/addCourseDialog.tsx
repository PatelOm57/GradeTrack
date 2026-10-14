// src/components/dialog/addCourseDialog.tsx
'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/dialog/dialog';

interface AddCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetGroupId: number | null;
  targetGroupName?: string;
  onCreateCourse: (
    cgroupId: number,
    field: string,
    level: string,
    target: number
  ) => Promise<void>;
}

export function AddCourseDialog({
  isOpen,
  onClose,
  targetGroupId,
  targetGroupName,
  onCreateCourse,
}: AddCourseDialogProps) {
  const [field, setField] = useState('');
  const [level, setLevel] = useState('');
  const [target, setTarget] = useState('85');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGroupId || !field.trim() || !level.trim()) return;

    const parsedTarget = parseFloat(target) || 85;

    onClose();
    onCreateCourse(targetGroupId, field.trim(), level.trim(), parsedTarget);

    setField('');
    setLevel('');
    setTarget('85');
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Course ${targetGroupName ? `to ${targetGroupName}` : ''}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase text-slate-500">Field</label>
              <input
                type="text"
                placeholder="e.g. MATH"
                value={field}
                onChange={(e) => setField(e.target.value)}
                autoFocus
                className="gt-editable-title-input"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase text-slate-500">Level / Code</label>
              <input
                type="text"
                placeholder="e.g. 101"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="gt-editable-title-input"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase text-slate-500">Target Grade (%)</label>
            <input
              type="number"
              placeholder="85"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="gt-editable-title-input"
            />
          </div>
        </div>

        <div className="gt-modal-actions">
          <button type="button" onClick={onClose} className="gt-btn-cancel gt-pop-target">
            Cancel
          </button>
          <button type="submit" className="gt-btn-primary gt-pop-target">
            Add Course
          </button>
        </div>
      </form>
    </Dialog>
  );
}