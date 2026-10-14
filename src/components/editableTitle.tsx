// src/components/editableTitle.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface EditableTitleProps {
  initialValue: string;
  mode: 'course' | 'group';
  className?: string;
  onSave: (field: string, level: string) => void;
  onSaveGroup?: (newName: string) => void;
  onDelete?: () => void;
  titleTip?: string;
}

export function EditableTitle({
  initialValue,
  mode,
  className = '',
  onSave,
  onSaveGroup,
  onDelete,
  titleTip = 'Click edit icon to rename',
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state during render when prop changes
  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue);
    setValue(initialValue);
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (!value.trim()) {
      setValue(initialValue);
      return;
    }

    if (mode === 'group' && onSaveGroup) {
      onSaveGroup(value.trim());
    } else {
      const parts = value.trim().split(' ');
      const field = parts[0] || '';
      const level = parts.slice(1).join(' ') || '';
      onSave(field, level);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="gt-editable-title-input"
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div className="gt-editable-title-container">
      <span className={className} title={initialValue}>
        {initialValue}
      </span>

      <div className="gt-inline-action-group">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="gt-popout-btn-small gt-pop-target"
          title={titleTip}
        >
          <Image src="/edit-icon.svg" alt="Edit" width={12} height={12} />
        </button>

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className="gt-popout-btn-small gt-popout-btn-delete gt-pop-target"
            title="Delete"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}