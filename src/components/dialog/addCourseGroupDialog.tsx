// src/components/dialog/addCourseGroupDialog.tsx
'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/dialog/dialog';

interface AddCourseGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string) => Promise<void>;
}

export function AddCourseGroupDialog({
  isOpen,
  onClose,
  onCreateGroup,
}: AddCourseGroupDialogProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onClose();
    onCreateGroup(name.trim());
    setName('');
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add Course Group">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase text-slate-500">Group Name</label>
          <input
            type="text"
            placeholder="e.g. Fall 2026, Year 1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="gt-editable-title-input"
          />
        </div>

        <div className="gt-modal-actions">
          <button type="button" onClick={onClose} className="gt-btn-cancel gt-pop-target">
            Cancel
          </button>
          <button type="submit" className="gt-btn-primary gt-pop-target">
            Create Group
          </button>
        </div>
      </form>
    </Dialog>
  );
}