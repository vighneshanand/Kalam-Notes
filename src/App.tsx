/**
 * Kalam Notes Main Application Container
 *
 * Firebase Authentication & Firestore connection as the application starting point,
 * managing view routing, session lifecycle, and persistent handwritten notes.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { HomeView } from './components/HomeView';
import { NewSessionView } from './components/NewSessionView';
import { ProcessingView } from './components/ProcessingView';
import { SessionDetailView } from './components/SessionDetailView';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { DeleteModal } from './components/DeleteModal';
import { SignInView } from './components/SignInView';
import { Session, UserProfile, CreateSessionPayload } from './types';
import {
  auth,
  onAuthStateChanged,
  signOutUser,
  testFirestoreConnection,
  FirebaseUser,
} from './firebase/config';
import {
  fetchUserProfile,
  updateUserPreferences,
  deleteUserProfile,
  fetchSessions,
  fetchSessionDetail,
  createSession,
  updateSessionEdits,
  deleteSession,
} from './services/api';

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [screen, setScreen] = useState<'home' | 'new' | 'processing' | 'session'>('home');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modals state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  const loadData = useCallback(async (currentFbUser?: FirebaseUser | null) => {
    try {
      setLoading(true);
      const [userData, sessionsData] = await Promise.all([
        fetchUserProfile(),
        fetchSessions(),
      ]);

      // Enhance with Firebase user credentials if logged in
      const effectiveUser: UserProfile = {
        ...userData,
        display_name: currentFbUser?.displayName || userData.display_name,
        email: currentFbUser?.email || userData.email,
        avatar_initials: currentFbUser?.displayName
          ? currentFbUser.displayName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
          : userData.avatar_initials,
      };

      setUser(effectiveUser);
      setSessions(sessionsData);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Monitor Firebase Auth state & validate Firestore connection on boot
  useEffect(() => {
    // Validate live Firestore connection
    testFirestoreConnection().catch((err) => {
      console.warn('Firestore validation warning:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      setAuthChecked(true);

      if (currentUser) {
        await loadData(currentUser);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [loadData]);

  const handleOpenSession = async (sessionId: string) => {
    try {
      const detail = await fetchSessionDetail(sessionId);
      setCurrentSession(detail);
      setScreen('session');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Failed to load session details:', err);
      showToast('Failed to open session');
    }
  };

  const handleCreateSession = async (payload: CreateSessionPayload) => {
    setIsSubmitting(true);
    try {
      const newSession = await createSession(payload);
      setCurrentSession(newSession);
      setScreen('processing');
    } catch (err: any) {
      console.error('Failed to create session:', err);
      showToast(err.message || 'Error creating session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessingComplete = async () => {
    if (currentSession) {
      const detail = await fetchSessionDetail(currentSession.id);
      setCurrentSession(detail);
      setScreen('session');
      showToast('Handwritten notes generated successfully');
      loadData(firebaseUser);
    }
  };

  const handleSaveEdits = async (
    noteEdits: Array<{ id: string; text: string }>,
    topicEdits: Array<{ id: string; title: string }>
  ) => {
    if (!currentSession) return;
    try {
      const updated = await updateSessionEdits(currentSession.id, noteEdits, topicEdits);
      setCurrentSession(updated);
      showToast('Notebook edits saved');
    } catch (err) {
      console.error('Failed to save notebook edits:', err);
      showToast('Failed to save changes');
    }
  };

  const handleDeleteSession = async () => {
    if (!currentSession) return;
    setIsDeleting(true);
    try {
      await deleteSession(currentSession.id);
      setIsDeleteOpen(false);
      setCurrentSession(null);
      setScreen('home');
      showToast('Session and audio deleted');
      await loadData(firebaseUser);
    } catch (err) {
      console.error('Failed to delete session:', err);
      showToast('Failed to delete session');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdatePreferences = async (lang: string, saveDrive: boolean) => {
    try {
      const updated = await updateUserPreferences(lang, saveDrive);
      setUser(updated);
      showToast(`Notes language updated to ${lang}`);
    } catch (err) {
      console.error('Failed to update preferences:', err);
      showToast('Failed to update preferences');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUserProfile();
      showToast('All sessions and stored data cleared');
      await loadData(firebaseUser);
      setScreen('home');
    } catch (err) {
      console.error('Failed to clear data:', err);
      showToast('Failed to clear user data');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setFirebaseUser(null);
      setScreen('home');
      showToast('Signed out of Firebase');
    } catch (err) {
      console.error('Failed to sign out:', err);
      showToast('Failed to sign out');
    }
  };

  // Initial authentication loading state
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F2F3F7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#2F43B8] border-t-transparent rounded-full animate-spin" />
          <div className="text-xs font-semibold text-[#5C6378]">
            Connecting to Firebase…
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, render Firebase Google Sign-In as starting application point
  if (!firebaseUser) {
    return (
      <>
        <SignInView
          onSignInSuccess={() => loadData(auth.currentUser)}
          showToast={showToast}
        />
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#1A1F33] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl"
          >
            {toastMessage}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F3F7] text-[#1A1F33] flex flex-col font-sans">
      {/* Top Header */}
      <TopBar
        user={user}
        onNavigateHome={() => {
          setScreen('home');
          window.scrollTo(0, 0);
        }}
        onNewSession={() => {
          setScreen('new');
          window.scrollTo(0, 0);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isNewScreen={screen === 'new' || screen === 'processing'}
      />

      {/* Screen Routing */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-sm font-semibold text-[#5C6378] animate-pulse">
            Loading Kalam Notes…
          </div>
        </div>
      ) : (
        <div className="flex-1">
          {screen === 'home' && (
            <HomeView
              sessions={sessions}
              user={user}
              onOpenSession={handleOpenSession}
              onNewSession={() => setScreen('new')}
            />
          )}

          {screen === 'new' && (
            <NewSessionView
              user={user}
              onBack={() => setScreen('home')}
              onSubmit={handleCreateSession}
              isSubmitting={isSubmitting}
            />
          )}

          {screen === 'processing' && currentSession && (
            <ProcessingView
              session={currentSession}
              onComplete={handleProcessingComplete}
            />
          )}

          {screen === 'session' && currentSession && (
            <SessionDetailView
              session={currentSession}
              onBack={() => setScreen('home')}
              onOpenExport={() => setIsExportOpen(true)}
              onOpenDelete={() => setIsDeleteOpen(true)}
              onSaveEdits={handleSaveEdits}
            />
          )}
        </div>
      )}

      {/* Global Modals */}
      {isExportOpen && currentSession && (
        <ExportModal
          session={currentSession}
          onClose={() => setIsExportOpen(false)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          user={user}
          onClose={() => setIsSettingsOpen(false)}
          onUpdatePreferences={handleUpdatePreferences}
          onDeleteAccount={handleDeleteAccount}
          onSignOut={handleSignOut}
        />
      )}

      {isDeleteOpen && currentSession && (
        <DeleteModal
          sessionTitle={currentSession.title}
          onConfirm={handleDeleteSession}
          onCancel={() => setIsDeleteOpen(false)}
          isDeleting={isDeleting}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#1A1F33] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl transition-all"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
