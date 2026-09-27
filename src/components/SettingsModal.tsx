/**
 * SettingsModal Component
 *
 * User profile, preferred note language, daily audio usage monitoring,
 * and account data reset management.
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';

interface SettingsModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onUpdatePreferences: (lang: string, saveToDrive: boolean) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  onSignOut?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  onClose,
  onUpdatePreferences,
  onDeleteAccount,
  onSignOut,
}) => {
  const [preferredLang, setPreferredLang] = useState(user?.preferred_notes_lang || 'English');
  const [saveToDrive, setSaveToDrive] = useState(user?.save_to_drive === 1);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await onUpdatePreferences(preferredLang, saveToDrive);
      onClose();
    } catch (err) {
      console.error('Failed to update preferences:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsUpdating(true);
    try {
      await onDeleteAccount();
      onClose();
    } catch (err) {
      console.error('Failed to reset account:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0C18]/50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-[#DEE1EA] shadow-2xl p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-heading"
      >
        <h2 id="settings-heading" className="text-xl font-bold text-[#1A1F33] mb-4">
          Account & Settings
        </h2>

        {/* User Card */}
        <div className="flex items-center gap-3.5 mb-5 p-3 rounded-xl bg-[#F7F8FB] border border-[#DEE1EA]">
          <span className="w-11 h-11 rounded-full bg-[#C9573B] text-white font-bold text-sm flex items-center justify-center shrink-0">
            {user?.avatar_initials || 'VA'}
          </span>
          <div className="min-w-0">
            <b className="block text-sm font-semibold text-[#1A1F33] truncate">
              {user?.display_name || 'Vighnesh Anand'}
            </b>
            <span className="text-xs text-[#5C6378] truncate block">
              {user?.email || 'Signed in via Google Authentication'}
            </span>
          </div>
        </div>

        {/* Settings Rows */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between gap-4 py-2 border-t border-[#DEE1EA]">
            <div>
              <div className="text-xs font-semibold text-[#1A1F33]">Write notes in</div>
              <span className="text-[11px] text-[#5C6378]">Default for new sessions</span>
            </div>
            <select
              value={preferredLang}
              onChange={(e) => setPreferredLang(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-[#DEE1EA] bg-[#F7F8FB] text-xs font-medium text-[#1A1F33] focus:outline-none focus:ring-1 focus:ring-[#2F43B8]"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Tamil">Tamil</option>
              <option value="Marathi">Marathi</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4 py-2 border-t border-[#DEE1EA]">
            <div>
              <div className="text-xs font-semibold text-[#1A1F33]">Audio used today</div>
              <span className="text-[11px] text-[#5C6378]">Daily free limit resets at midnight</span>
            </div>
            <span className="font-mono text-xs font-bold text-[#1A1F33] tabular-nums">
              {Math.round(user?.daily_minutes_used || 0)} / {Math.round(user?.daily_quota_minutes || 120)} min
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 py-2 border-t border-[#DEE1EA]">
            <div>
              <div className="text-xs font-semibold text-[#1A1F33]">Save recordings to Drive</div>
              <span className="text-[11px] text-[#5C6378]">Only files this app creates</span>
            </div>
            <input
              type="checkbox"
              checked={saveToDrive}
              onChange={(e) => setSaveToDrive(e.target.checked)}
              className="w-4 h-4 rounded text-[#2F43B8] focus:ring-[#2F43B8] accent-[#2F43B8]"
            />
          </div>
        </div>

        {/* Delete Confirmation Area */}
        {showConfirmDelete ? (
          <div className="p-3.5 rounded-xl bg-[#FDECEA] border border-[#B42318]/30 mb-5">
            <span className="text-xs text-[#B42318] block leading-relaxed font-semibold mb-1">
              Delete all sessions and user data?
            </span>
            <span className="text-[11px] text-[#5C6378] block mb-3">
              This will remove all transcripts, handwritten notes, and saved audio from local persistence.
            </span>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="h-8 px-3 rounded-lg border border-[#DEE1EA] bg-white text-xs font-semibold text-[#5C6378]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                disabled={isUpdating}
                className="h-8 px-3 rounded-lg bg-[#B42318] text-white text-xs font-semibold hover:bg-[#911d13]"
              >
                Delete everything
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-4 border-t border-[#DEE1EA]">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="text-xs font-semibold text-[#B42318] hover:underline cursor-pointer"
            >
              Reset data
            </button>
            <div className="flex items-center gap-2">
              {onSignOut && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSignOut();
                  }}
                  className="h-9 px-3.5 rounded-lg border border-[#DEE1EA] hover:bg-[#F7F8FB] text-xs font-semibold text-[#5C6378] cursor-pointer"
                >
                  Sign out
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-3.5 rounded-lg border border-[#DEE1EA] hover:bg-[#F7F8FB] text-xs font-semibold text-[#5C6378] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isUpdating}
                className="h-9 px-4 rounded-lg bg-[#2F43B8] hover:bg-[#253696] text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
