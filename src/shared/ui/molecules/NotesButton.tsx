import React from 'react';
import Icon from '@/shared/ui/atoms/Icon';

interface NotesButtonProps {
  hasNotes: boolean;
  notesCount?: number;
  onClick: () => void;
  title?: string;
}

export const NotesButton: React.FC<NotesButtonProps> = ({
  hasNotes,
  notesCount = 0,
  onClick,
  title = 'View notes',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="group relative inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
    >
      <div
        className={`
          relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5
          transition-all duration-200 ease-out
          ${
            hasNotes
              ? 'bg-blue-500/15 text-blue-400 shadow-sm shadow-blue-500/20 hover:bg-blue-500/25 hover:shadow-md hover:shadow-blue-500/30'
              : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/60 hover:text-gray-300'
          }
          border ${
            hasNotes
              ? 'border-blue-500/40 hover:border-blue-400/60'
              : 'border-gray-600/50 hover:border-gray-500/70'
          }
        `}
      >
        <Icon
          name="lucide:file-text"
          size={16}
          className="transition-transform group-hover:scale-105"
        />
        {hasNotes && notesCount > 0 && (
          <span className="text-[10px] font-medium tabular-nums">
            {notesCount}
          </span>
        )}
      </div>
    </button>
  );
};
