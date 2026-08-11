// src/components/EditableTitle.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface EditableTitleProps {
  initialValue: string;
  onSave: (field: string, level: string) => void;
  /** Optional mode: 'course' enforces [Text][Number]. 'group' allows any single text block. */
  mode?: 'course' | 'group';
  onSaveGroup?: (value: string) => void;
  className?: string;
  titleTip?: string;
}

/** Helper parser to extract course field and level */
export function parseCourseTitle(raw: string): { field: string; level: string } | null {
  const trimmed = raw.trim();
  // Regex matches 1+ non-digits at start, optional spaces, and 1+ digits at end
  const match = trimmed.match(/^([A-Za-z\s-]+?)\s*(\d+)$/);
  if (!match) return null;

  return {
    field: match[1].trim(),
    level: match[2].trim(),
  };
}

export function EditableTitle({
  initialValue,
  onSave,
  mode = 'course',
  onSaveGroup,
  className = 'text-2xl font-bold',
  titleTip = 'Click to rename',
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [hasError, setHasError] = useState(false);

  const handleSave = () => {
    const trimmed = value.trim();

    if (mode === 'course') {
      const parsed = parseCourseTitle(trimmed);
      if (!parsed) {
        setHasError(true);
        return; // Don't close or save if format is invalid
      }
      setHasError(false);
      setIsEditing(false);
      if (trimmed !== initialValue) {
        onSave(parsed.field, parsed.level);
      }
    } else {
      // Group mode (allows any name, e.g., "Fall 2026")
      if (trimmed === '') {
        setHasError(true);
        return;
      }
      setHasError(false);
      setIsEditing(false);
      if (trimmed !== initialValue && onSaveGroup) {
        onSaveGroup(trimmed);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setValue(initialValue);
      setHasError(false);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="inline-flex flex-col">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (hasError) setHasError(false);
          }}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className={`${className} border-2 ${
            hasError ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-white'
          } px-2 py-0.5 rounded-lg text-slate-800 outline-none shadow-sm transition-colors`}
        />
        {hasError && (
          <span className="text-xs text-red-500 mt-1 font-normal">
            {mode === 'course'
              ? 'Must start with letters and end with numbers (e.g. CS 210)'
              : 'Name cannot be empty'}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="inline-block">
      <h2
        onClick={() => setIsEditing(true)}
        className={`${className} text-slate-800 hover:text-slate-400 cursor-pointer border border-transparent hover:border-slate-300 px-2 py-1 rounded-lg transition-all inline-flex items-center gap-2 group`}
        title={titleTip}
      >
        <span>{value}</span>
        <Image
          src="/edit-icon.svg"
          alt="Edit"
          width={20}
          height={20}
          className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </h2>
    </div>
  );
}