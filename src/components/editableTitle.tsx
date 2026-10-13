// src/components/editableTitle.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface EditableTitleProps {
  initialValue: string;
  mode: 'course' | 'group';
  className?: string;
  onSave?: (field: string, level: string) => void;
  onSaveGroup?: (newName: string) => void;
  titleTip?: string;
}

export function EditableTitle({
  initialValue,
  mode,
  className = '',
  onSave,
  onSaveGroup,
  titleTip = 'Edit title',
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(true);
  };

  const handleBlurOrSubmit = () => {
    setIsEditing(false);
    if (mode === 'course' && onSave) {
      const parts = value.trim().split(' ');
      const field = parts[0] || 'UNKN';
      const level = parts.slice(1).join(' ') || '100';
      onSave(field, level);
    } else if (mode === 'group' && onSaveGroup) {
      onSaveGroup(value.trim());
    }
  };

  if (isEditing) {
    return (
      <div 
        className="gt-editable-title-container w-full" 
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlurOrSubmit}
          onKeyDown={(e) => e.key === 'Enter' && handleBlurOrSubmit()}
          autoFocus
          className={`gt-editable-title-input ${className}`}
        />
      </div>
    );
  }

  return (
    <div className="gt-editable-title-container">
      <span className={className}>{initialValue}</span>

      {/* Slide-out Edit Button */}
      <button
        type="button"
        onClick={handleEditClick}
        className="gt-edit-popout-btn gt-pop-target"
        title={titleTip}
      >
        <Image
          src="/edit-icon.svg"
          alt="Edit"
          width={12}
          height={12}
        />
      </button>
    </div>
  );
}