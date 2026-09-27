/**
 * BucketsTab Component
 *
 * Implements the 4-bucket knowledge taxonomy for the active session:
 * 1. Key concepts
 * 2. Industry insights
 * 3. Daily-life application
 * 4. Questions for next session (mentor follow-ups)
 */

import React, { useState } from 'react';
import {
  Lightbulb,
  Building2,
  Home,
  HelpCircle,
  Play,
  CheckCircle2,
  AlertTriangle,
  PenTool,
} from 'lucide-react';
import {
  Session,
  Topic,
  Note,
  BucketKey,
  BUCKET_DEFINITIONS,
  BUCKET_ORDER,
} from '../types';

interface BucketsTabProps {
  session: Session;
  onSeek: (seconds: number) => void;
  onSwitchToNotes: () => void;
}

export const BucketsTab: React.FC<BucketsTabProps> = ({
  session,
  onSeek,
  onSwitchToNotes,
}) => {
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);

  const topics = session.topics || [];
  const currentTopic: Topic | undefined = topics[selectedTopicIndex] || topics[0];

  const bucketIcons: Record<BucketKey, React.ReactNode> = {
    k: <Lightbulb className="w-4 h-4 text-[#2F43B8]" />,
    i: <Building2 className="w-4 h-4 text-[#0E7656]" />,
    d: <Home className="w-4 h-4 text-[#B0521C]" />,
    m: <HelpCircle className="w-4 h-4 text-[#8A6700]" />,
  };

  if (!currentTopic) {
    return (
      <div className="text-center py-12 text-[#5C6378] text-sm">
        No topics available for this session.
      </div>
    );
  }

  const topicNotes = currentTopic.notes || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
      {/* Left Topic Sidebar */}
      <nav aria-label="Topics" className="space-y-1.5 sticky top-24">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#5C6378] px-2 mb-2">
          Topics
        </h4>
        {topics.map((tp, idx) => {
          const isSelected = idx === selectedTopicIndex;
          const noteCount = tp.notes?.length || 0;

          return (
            <button
              key={tp.id}
              onClick={() => setSelectedTopicIndex(idx)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                isSelected
                  ? 'bg-white border-[#DEE1EA] shadow-xs'
                  : 'bg-transparent border-transparent hover:bg-white/60'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  isSelected
                    ? 'bg-[#2F43B8] text-white'
                    : 'bg-[#F7F8FB] border border-[#DEE1EA] text-[#5C6378]'
                }`}
              >
                {idx + 1}
              </span>
              <div className="min-w-0">
                <span className="block text-sm font-semibold text-[#1A1F33] leading-snug truncate">
                  {tp.title}
                </span>
                <span className="block text-xs text-[#5C6378] font-mono mt-0.5">
                  {tp.start_formatted}–{tp.end_formatted} · {noteCount} notes
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Right Content Area: 4-Bucket Grid */}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
          <h2 className="text-xl font-bold text-[#1A1F33] tracking-tight">
            {currentTopic.title}
          </h2>
          <span className="font-mono text-xs text-[#5C6378] bg-white border border-[#DEE1EA] px-2.5 py-1 rounded-md">
            {currentTopic.start_formatted} – {currentTopic.end_formatted}
          </span>
        </div>

        <p className="text-xs text-[#5C6378] mb-5">
          Tap a time chip to play that exact moment in the recording. Supporting quotes are grounded directly in the spoken transcript.
        </p>

        {/* 2x2 Buckets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BUCKET_ORDER.map((bucketKey) => {
            const def = BUCKET_DEFINITIONS[bucketKey];
            const notes = topicNotes.filter((n) => n.bucket === bucketKey);

            return (
              <section
                key={bucketKey}
                className="rounded-2xl p-4 border"
                style={{
                  backgroundColor: def.softColor,
                  borderColor: `${def.color}30`,
                }}
              >
                <header className="flex items-center gap-2 font-bold text-sm mb-3" style={{ color: def.color }}>
                  {bucketIcons[bucketKey]}
                  <span>{def.label}</span>
                  <span className="ml-auto text-xs bg-white text-[#5C6378] border border-[#DEE1EA] rounded-full px-2 py-0.5 font-mono">
                    {notes.length}
                  </span>
                </header>

                <div className="space-y-3">
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <article
                        key={note.id}
                        className={`bg-white border rounded-xl p-3 shadow-2xs transition-colors ${
                          note.verification_status === 'check'
                            ? 'border-[#9A5B00]/40 bg-[#FFF1D6]/30'
                            : 'border-[#DEE1EA]'
                        }`}
                      >
                        <p className="text-sm text-[#1A1F33] leading-relaxed mb-2">
                          {note.note_text}
                        </p>

                        <div className="flex items-start gap-2 text-xs">
                          {/* Time Chip button */}
                          <button
                            onClick={() => onSeek(note.timestamp_seconds)}
                            className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#2F43B8] bg-[#F7F8FB] hover:bg-[#EEF0FC] border border-[#DEE1EA] px-1.5 py-0.5 rounded transition-colors shrink-0"
                            aria-label={`Play from ${note.timestamp_formatted}`}
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            {note.timestamp_formatted}
                          </button>

                          {/* Grounded Quote */}
                          <q className="text-[#5C6378] italic line-clamp-2">
                            {note.quote}
                          </q>
                        </div>

                        {/* Grounding Verification Badge */}
                        <div
                          className={`mt-2.5 pt-2 border-t border-[#DEE1EA]/60 text-[11px] font-semibold flex items-center gap-1.5 ${
                            note.verification_status === 'ok'
                              ? 'text-[#0E7656]'
                              : 'text-[#9A5B00]'
                          }`}
                        >
                          {note.verification_status === 'ok' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Found in transcript
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Verify: quote not found near {note.timestamp_formatted}
                            </>
                          )}
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="text-xs text-[#5C6378] italic py-2">
                      No notes recorded for this bucket in this topic.
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* CTA to handwritten notes */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onSwitchToNotes}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-white hover:bg-[#F7F8FB] border border-[#DEE1EA] text-sm font-semibold text-[#1A1F33] transition-colors shadow-xs"
          >
            <PenTool className="w-4 h-4 text-[#2F43B8]" />
            <span>See handwritten page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
