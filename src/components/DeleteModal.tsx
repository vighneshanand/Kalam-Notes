/**
 * DeleteModal Component
 *
 * Prompts user for confirmation before permanent session deletion.
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  sessionTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  sessionTitle,
  onConfirm,
  onCancel,
  isDeleting,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#0A0C18]/50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-[#DEE1EA] shadow-2xl p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-heading"
      >
        <div className="flex items-center gap-2.5 text-[#B42318] mb-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h2 id="delete-heading" className="text-lg font-bold text-[#1A1F33]">
            Delete this session?
          </h2>
        </div>

        <p className="text-xs text-[#5C6378] leading-relaxed mb-6">
          This permanently removes the transcript, handwritten notes, diagrams, and audio recording for “
          <span className="font-semibold text-[#1A1F33]">{sessionTitle}</span>”. This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#DEE1EA]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="h-9 px-4 rounded-lg border border-[#DEE1EA] hover:bg-[#F7F8FB] text-xs font-semibold text-[#5C6378] transition-colors"
          >
            Keep session
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-9 px-4 rounded-lg bg-[#B42318] hover:bg-[#911d13] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            {isDeleting ? 'Deleting…' : 'Delete session'}
          </button>
        </div>
      </div>
    </div>
  );
};
