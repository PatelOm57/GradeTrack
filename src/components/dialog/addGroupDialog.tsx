// src/components/dialogs/addGroupDialog.tsx
'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/dialog/dialog';

interface AddGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, weight: number) => Promise<void>;
}

export function AddGroupDialog({ isOpen, onClose, onCreateGroup }: AddGroupDialogProps) {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('10');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onCreateGroup(name.trim(), parseFloat(weight) || 0);
    setName('');
    setWeight('10');
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create Grade Group">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase text-slate-500">Group Name</label>
          <input
            type="text"
            placeholder="e.g. Quizzes, Midterms, Assignments"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="gt-editable-title-input"
          />

          <label className="text-xs font-bold uppercase text-slate-500">Weight (%)</label>
          <input
            type="number"
            placeholder="10"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="gt-editable-title-input"
          />
        </div>

        <div className="gt-modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="gt-btn-cancel gt-pop-target"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="gt-btn-primary gt-pop-target"
          >
            Create Group
          </button>
        </div>
      </form>
    </Dialog>
  );
}