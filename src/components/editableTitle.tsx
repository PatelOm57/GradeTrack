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

/** Parser to extract field and level */
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
  className = 'gt-editable-title-default',
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
      <div className="gt-editable-input-container">
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
          className={`${className} gt-editable-input ${
            hasError ? 'gt-editable-input-error' : ''
          }`}
        />
        {hasError && (
          <span className="gt-editable-error-msg">
            {mode === 'course'
              ? 'Must start with letters and end with numbers (e.g. CS 210)'
              : 'Name cannot be empty'}
          </span>
        )}
      </div>
    );
  }

  return (
    <div 
      className="gt-editable-title-container"
      onClick={(e) => e.stopPropagation()} /* Prevents triggering card link */
    >
      <h2
        onClick={() => setIsEditing(true)}
        className={`${className} gt-editable-title-display group`}
        title={titleTip}
      >
        <span>{value}</span>
        <Image
          src="/edit-icon.svg"
          alt="Edit"
          width={20}
          height={20}
          className="gt-editable-icon"
        />
      </h2>
    </div>
  );
}