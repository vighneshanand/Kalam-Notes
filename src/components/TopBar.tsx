/**
 * TopBar Component
 *
 * Implements the single-row Top Bar Contract:
 * [Brand mark] - [Nav links] - [Primary Action + Avatar]
 */

import React from 'react';
import { Plus } from 'lucide-react';
import { UserProfile } from '../types';

interface TopBarProps {
  user: UserProfile | null;
  onNavigateHome: () => void;
  onNewSession: () => void;
  onOpenSettings: () => void;
  isNewScreen: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  onNavigateHome,
  onNewSession,
  onOpenSettings,
  isNewScreen,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-[#DEE1EA]">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Brand Zone */}
        <button
          onClick={onNavigateHome}
          className="flex items-baseline gap-1.5 focus:outline-none group text-left"
          aria-label="Kalam Notes home"
        >
          <span className="font-['Caveat'] text-3xl font-bold text-[#2F43B8] leading-none group-hover:opacity-90">
            kalam
          </span>
          <span className="text-[13px] font-semibold text-[#5C6378] tracking-wider uppercase">
            notes
          </span>
        </button>

        {/* Action Zone */}
        <div className="flex items-center gap-3">
          {!isNewScreen && (
            <button
              onClick={onNewSession}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#2F43B8] hover:bg-[#253696] text-white text-sm font-semibold transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New session</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-full bg-[#C9573B] text-white font-bold text-xs flex items-center justify-center hover:ring-2 hover:ring-[#2F43B8]/30 transition-all"
            aria-label="Account and settings"
          >
            {user?.avatar_initials || 'VA'}
          </button>
        </div>
      </div>
    </header>
  );
};
