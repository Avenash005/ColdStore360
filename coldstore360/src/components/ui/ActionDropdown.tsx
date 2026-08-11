import React, { useState, useRef, useEffect } from 'react';

interface ActionDropdownProps {
  onEdit?: () => void;
  onDelete?: () => void;
  deleteLabel?: string;
  isDestructive?: boolean;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ 
  onEdit, 
  onDelete, 
  deleteLabel = 'Delete',
  isDestructive = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (e: React.MouseEvent, action?: () => void) => {
    e.stopPropagation();
    e.preventDefault();
    if (action) {
      action();
    } else {
      alert("Edit functionality coming soon!");
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="text-outline hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-low focus:outline-none"
      >
        <span className="material-symbols-outlined text-[20px]">more_vert</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-surface-container-lowest ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={(e) => handleAction(e, onEdit)}
              className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2"
              role="menuitem"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (onDelete) onDelete();
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                isDestructive 
                  ? 'text-error hover:bg-error-container/50' 
                  : 'text-on-surface hover:bg-surface-container-low'
              }`}
              role="menuitem"
            >
              <span className="material-symbols-outlined text-[18px]">{isDestructive ? 'delete' : 'block'}</span>
              {deleteLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;
