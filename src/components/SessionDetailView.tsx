/**
 * SessionDetailView Component
 *
 * Full-page view containing tabbed views:
 * - 4-bucket taxonomy
 * - Handwritten notebook on ruled paper with diagrams
 * - Interactive timestamped dialogue transcript
 * Along with persistent bottom audio player.
 */

import React, { useState } from 'react';
import { ArrowLeft, Download, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Session } from '../types';
import { BucketsTab } from './BucketsTab';
import { HandwrittenNotesTab } from './HandwrittenNotesTab';
import { TranscriptTab } from './TranscriptTab';
import { AudioPlayer } from './AudioPlayer';

interface SessionDetailViewProps {
  session: Session;
  onBack: () => void;
  onOpenExport: () => void;
  onOpenDelete: () => void;
  onSaveEdits: (
    noteEdits: Array<{ id: string; text: string }>,
    topicEdits: Array<{ id: string; title: string }>
  ) => Promise<void>;
}

export const SessionDetailView: React.FC<SessionDetailViewProps> = ({
  session,
  onBack,
  onOpenExport,
  onOpenDelete,
  onSaveEdits,
}) => {
  const [activeTab, setActiveTab] = useState<'buckets' | 'notes' | 'transcript'>('buckets');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Playback timer ticker
  React.useEffect(() => {
    let interval: number | null = null;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setCurrentTime((prev) => {
          const maxDur = session.duration_seconds || 1800;
          if (prev >= maxDur) {
            setIsPlaying(false);
            return maxDur;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, session.duration_seconds]);

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const topicCount = session.topic_count ?? session.topics?.length ?? 0;
  const noteCount = session.note_count ?? session.all_notes?.length ?? 0;
  const okCount = session.ok_count ?? session.all_notes?.filter((n) => n.verification_status === 'ok').length ?? 0;
  const checkCount = session.check_count ?? session.all_notes?.filter((n) => n.verification_status === 'check').length ?? 0;

  return (
    <main className="max-w-[1120px] mx-auto px-4 sm:px-6 py-6 pb-36">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5C6378] hover:text-[#1A1F33] transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        All sessions
      </button>

      {/* Header and Actions */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1F33]">
            {session.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-[#5C6378]">
            <span className="bg-white border border-[#DEE1EA] px-2.5 py-0.5 rounded-full font-medium">
              {session.session_date}
            </span>
            <span className="bg-white border border-[#DEE1EA] px-2.5 py-0.5 rounded-full font-medium">
              {session.speaker} · {session.role || 'Mentor'}
            </span>
            <span className="bg-white border border-[#DEE1EA] px-2.5 py-0.5 rounded-full font-medium font-mono">
              {session.duration_formatted}
            </span>
            <span className="bg-white border border-[#DEE1EA] px-2.5 py-0.5 rounded-full font-medium">
              Spoken: {session.spoken_language}
            </span>
            <span className="bg-white border border-[#DEE1EA] px-2.5 py-0.5 rounded-full font-medium">
              Notes: {session.notes_language}
            </span>
            <span className="inline-flex items-center gap-1 text-[#0E7656] bg-[#E8F5EF] border border-[#0E7656]/20 px-2.5 py-0.5 rounded-full font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              Consent saved
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenExport}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#DEE1EA] bg-white hover:bg-[#F7F8FB] text-xs font-semibold text-[#1A1F33] transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={onOpenDelete}
            className="w-9 h-9 rounded-lg border border-[#DEE1EA] bg-white hover:bg-[#FDECEA] text-[#5C6378] hover:text-[#B42318] flex items-center justify-center transition-colors shadow-xs"
            aria-label="Delete session"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Verification & Metrics bar */}
      <div className="flex flex-wrap items-center divide-x divide-[#DEE1EA] border border-[#DEE1EA] rounded-2xl bg-white mb-6 shadow-xs overflow-hidden">
        <div className="flex-1 min-w-[100px] p-3 sm:px-4">
          <b className="block text-xl font-bold text-[#1A1F33] tabular-nums leading-tight">
            {topicCount}
          </b>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6378]">
            Topics
          </span>
        </div>
        <div className="flex-1 min-w-[100px] p-3 sm:px-4">
          <b className="block text-xl font-bold text-[#1A1F33] tabular-nums leading-tight">
            {noteCount}
          </b>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6378]">
            Notes
          </span>
        </div>
        <div className="flex-1 min-w-[120px] p-3 sm:px-4">
          <b className="block text-xl font-bold text-[#0E7656] tabular-nums leading-tight">
            {okCount}
          </b>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6378]">
            Matched to transcript
          </span>
        </div>
        <div className="flex-1 min-w-[100px] p-3 sm:px-4">
          <b
            className={`block text-xl font-bold tabular-nums leading-tight ${
              checkCount > 0 ? 'text-[#9A5B00]' : 'text-[#1A1F33]'
            }`}
          >
            {checkCount}
          </b>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6378]">
            To check
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-[#DEE1EA] mb-6" role="tablist">
        <button
          role="tab"
          onClick={() => setActiveTab('buckets')}
          aria-selected={activeTab === 'buckets'}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'buckets'
              ? 'text-[#1A1F33] border-[#2F43B8]'
              : 'text-[#5C6378] border-transparent hover:text-[#1A1F33]'
          }`}
        >
          Buckets
        </button>
        <button
          role="tab"
          onClick={() => setActiveTab('notes')}
          aria-selected={activeTab === 'notes'}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'notes'
              ? 'text-[#1A1F33] border-[#2F43B8]'
              : 'text-[#5C6378] border-transparent hover:text-[#1A1F33]'
          }`}
        >
          Handwritten notes
        </button>
        <button
          role="tab"
          onClick={() => setActiveTab('transcript')}
          aria-selected={activeTab === 'transcript'}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'transcript'
              ? 'text-[#1A1F33] border-[#2F43B8]'
              : 'text-[#5C6378] border-transparent hover:text-[#1A1F33]'
          }`}
        >
          Transcript
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'buckets' && (
        <BucketsTab
          session={session}
          onSeek={handleSeek}
          onSwitchToNotes={() => setActiveTab('notes')}
        />
      )}

      {activeTab === 'notes' && (
        <HandwrittenNotesTab
          session={session}
          onSeek={handleSeek}
          onOpenExport={onOpenExport}
          onSaveEdits={onSaveEdits}
        />
      )}

      {activeTab === 'transcript' && (
        <TranscriptTab
          session={session}
          currentTime={currentTime}
          onSeek={handleSeek}
        />
      )}

      {/* Synchronized Audio Player */}
      <AudioPlayer
        session={session}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onSeek={handleSeek}
      />
    </main>
  );
};
