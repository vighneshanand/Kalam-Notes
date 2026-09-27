/**
 * Kalam Notes Firebase Google Sign-In View
 * Serves as the authentication starting point for the application.
 */

import React, { useState } from 'react';
import { signInWithGoogle } from '../firebase/config';

interface SignInViewProps {
  onSignInSuccess: () => void;
  showToast: (msg: string) => void;
}

export const SignInView: React.FC<SignInViewProps> = ({ onSignInSuccess, showToast }) => {
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true);
      const user = await signInWithGoogle();
      showToast(`Welcome, ${user.displayName || user.email}!`);
      onSignInSuccess();
    } catch (err: any) {
      console.error('Firebase Google sign-in error:', err);
      // If user closed the popup, don't show an intrusive error
      if (err?.code !== 'auth/popup-closed-by-user') {
        showToast(err?.message || 'Failed to sign in with Google');
      }
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1.1fr_1fr] bg-[var(--bg)] text-[var(--ink)]">
      {/* Visual Artistic Hero Side */}
      <div className="bg-[var(--accent-soft)] flex items-center justify-center p-8 md:p-12 overflow-hidden order-2 md:order-1">
        <div className="w-full max-w-[420px] -rotate-2 shadow-[0_20px_50px_rgba(20,24,60,0.18)] bg-[var(--paper)] text-[var(--pen)] p-8 pb-10 rounded-[3px] border border-amber-200/60 relative font-['Caveat',cursive] text-[22px] leading-[34px]">
          <div className="flex justify-between items-center text-[12px] font-mono text-[var(--pencil)] mb-2 border-b border-rose-200/50 pb-1">
            <span>27 Sep 2026</span>
            <span>Rohan Mehta · Mentor</span>
          </div>

          <h2 className="text-[32px] font-bold text-[var(--red)] leading-[42px] mb-2">
            Cost of Capital & WACC
          </h2>

          <div className="space-y-2">
            <p className="flex items-start gap-2">
              <span className="text-[var(--pencil)]">–</span>
              <span>
                blended hurdle rate: equity + debt, weighted by proportions
              </span>
            </p>

            <div className="my-3 py-1 px-3 border-2 border-[var(--pen)] rounded-[8px] bg-white/40 text-center text-[20px] font-bold text-[var(--pen)] shadow-sm">
              WACC = (E/V × Re) + (D/V × Rd × (1 − T))
            </div>

            <p className="flex items-start gap-2">
              <span className="text-[var(--pencil)]">–</span>
              <span>
                use <mark className="bg-amber-200/70 px-1 rounded-sm text-inherit">market values</mark>, book equity is misleading
              </span>
            </p>

            <div className="mt-4 p-3 bg-amber-100/90 text-amber-950 rounded-sm shadow-sm text-[19px] leading-[24px] rotate-1 border-t-4 border-amber-300">
              <b className="block text-[14px] font-sans font-bold text-amber-900 uppercase tracking-wider mb-1">Ask Mentor</b>
              Why is after-tax debt always cheaper than equity in growth stages?
            </div>
          </div>
        </div>
      </div>

      {/* Sign In Action Side */}
      <div className="flex flex-col justify-center px-6 py-12 md:px-16 lg:px-20 bg-[var(--surface)] order-1 md:order-2">
        <div className="max-w-[420px] w-full mx-auto space-y-6">
          <div className="flex items-baseline gap-2">
            <span className="font-['Caveat',cursive] text-5xl font-bold text-[var(--accent)]">
              kalam
            </span>
            <span className="text-sm font-bold text-[var(--muted)] tracking-wider uppercase font-sans">
              notes
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] leading-tight">
              Record a lecture. Get handwritten notes you can check against what was said.
            </h1>
            <p className="text-[var(--muted)] text-[15px] leading-relaxed">
              Every note is categorized into 4 structured knowledge buckets: key concepts, industry insights, daily-life applications, and mentor questions—each with exact timestamp links back to the audio.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3.5 h-12 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--ink)] font-semibold text-[15px] shadow-sm hover:border-[var(--faint)] transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5 flex-none" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
                <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
              </svg>
              <span>{signingIn ? 'Connecting to Firebase...' : 'Continue with Google'}</span>
            </button>
          </div>

          <p className="text-xs text-[var(--faint)] leading-normal">
            Secure Firebase Authentication and Firestore database connection enabled. We only use your account to store your personal notes and sync your session library.
          </p>
        </div>
      </div>
    </div>
  );
};
