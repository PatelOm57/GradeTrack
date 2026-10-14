// src/components/dialog/addGradeItemDialog.tsx
'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/dialog/dialog';

interface AddGradeItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetGroupId: number | null;
  targetGroupName?: string;
  onCreateItem: (
    groupId: number,
    name: string,
    points: number | null,
    pointsOf: number,
    note: string | null
  ) => Promise<void>;
}

export function AddGradeItemDialog({
  isOpen,
  onClose,
  targetGroupId,
  targetGroupName,
  onCreateItem,
}: AddGradeItemDialogProps) {
  const [itemName, setItemName] = useState('');
  const [earnedPoints, setEarnedPoints] = useState('');
  const [pointsOf, setPointsOf] = useState('10');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGroupId || !itemName.trim()) return;

    const parsedPoints = earnedPoints.trim() !== '' ? parseFloat(earnedPoints) : null;
    const finalEarnedPoints = parsedPoints !== null && !isNaN(parsedPoints) ? parsedPoints : null;
    const finalMaxPoints = parseFloat(pointsOf) || 10;
    const finalNote = note.trim() !== '' ? note.trim() : null;

    // 1. Immediately dismiss dialog for an instant UI feel
    onClose();

    // 2. Fire backend creation in background
    onCreateItem(
      targetGroupId,
      itemName.trim(),
      finalEarnedPoints,
      finalMaxPoints,
      finalNote
    );

    // 3. Reset form fields
    setItemName('');
    setEarnedPoints('');
    setPointsOf('10');
    setNote('');
  };

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Add Item ${targetGroupName ? `to ${targetGroupName}` : ''}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {/* Item Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase text-slate-500">Item Name</label>
            <input
              type="text"
              placeholder="e.g. Quiz 1, Assignment 2"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              autoFocus
              className="gt-editable-title-input"
            />
          </div>

          {/* Points Fields Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase text-slate-500">
                Score <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 8.5"
                value={earnedPoints}
                onChange={(e) => setEarnedPoints(e.target.value)}
                className="gt-editable-title-input"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase text-slate-500">Max Points</label>
              <input
                type="number"
                step="any"
                placeholder="10"
                value={pointsOf}
                onChange={(e) => setPointsOf(e.target.value)}
                className="gt-editable-title-input"
              />
            </div>
          </div>

          {/* Plaintext Note Box */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase text-slate-500">
              Notes <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Add any reminders or notes here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="gt-editable-title-input resize-none"
            />
          </div>
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
            Add Item
          </button>
        </div>
      </form>
    </Dialog>
  );
}