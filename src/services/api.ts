/**
 * Kalam Notes API Client Service.
 *
 * Interfaces with the Python backend proxy for session operations,
 * speech transcription, note editing, and preferences.
 */

import { Session, UserProfile } from '../types';

const BASE_URL = '/api';

export async function fetchUserProfile(): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/user`);
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

export async function updateUserPreferences(
  preferredNotesLang: string,
  saveToDrive: boolean
): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/user`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferred_notes_lang: preferredNotesLang, save_to_drive: saveToDrive }),
  });
  if (!res.ok) throw new Error('Failed to update preferences');
  return res.json();
}

export async function deleteUserProfile(): Promise<void> {
  const res = await fetch(`${BASE_URL}/user`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete user profile');
}

export async function fetchSessions(): Promise<Session[]> {
  const res = await fetch(`${BASE_URL}/sessions`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function fetchSessionDetail(id: string): Promise<Session> {
  const res = await fetch(`${BASE_URL}/sessions/${id}`);
  if (!res.ok) throw new Error('Failed to fetch session detail');
  return res.json();
}

export interface CreateSessionPayload {
  title: string;
  speaker: string;
  spoken_language: string;
  notes_language: string;
  consent_confirmed: boolean;
  audio_base64?: string;
  audio_filename?: string;
  audio_mime_type?: string;
  duration_seconds?: number;
}

export async function createSession(payload: CreateSessionPayload): Promise<Session> {
  const res = await fetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create session');
  }
  return res.json();
}

export async function updateSessionEdits(
  sessionId: string,
  notes: Array<{ id: string; text: string }>,
  topics: Array<{ id: string; title: string }>
): Promise<Session> {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/edits`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes, topics }),
  });
  if (!res.ok) throw new Error('Failed to save edits');
  return res.json();
}

export async function deleteSession(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/sessions/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete session');
}

export function getAudioStreamUrl(sessionId: string): string {
  return `${BASE_URL}/sessions/${sessionId}/audio`;
}
