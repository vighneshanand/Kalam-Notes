/**
 * TranscriptTab Component
 *
 * Full timestamped dialogue transcript with speaker tags,
 * topic dividers, clickable jump chips, and note source references.
 */

import React from 'react';
import { Play } from 'lucide-react';
import { Session, Segment, BUCKET_DEFINITIONS, BucketKey } from '../types';

interface TranscriptTabProps {
  session: Session;
  currentTime: number;
  onSeek: (seconds: number) => void;
}

export const TranscriptTab: React.FC<TranscriptTabProps> = ({
  session,
  currentTime,
  onSeek,
}) => {
  const segments = session.segments || [];
  const topics = session.topics || [];
  const allNotes = session.all_notes || [];

  // Map topic start seconds to topic indices
  const topicStarts: Record<number, { index: number; title: string }> = {};
  topics.forEach((tp, idx) => {
    topicStarts[Math.floor(tp.start_seconds)] = { index: idx + 1, title: tp.title };
  });

  return (
    <div className="max-w-[820px] mx-auto space-y-1">
      {segments.map((seg, idx) => {
        const nextStart = segments[idx + 1]?.start_seconds ?? Infinity;
        const isActive = currentTime >= seg.start_seconds && currentTime < nextStart;

        // Notes sourced from this segment
        const derivedNotes = allNotes.filter(
          (n) => n.timestamp_seconds >= seg.start_seconds && n.timestamp_seconds < nextStart
        );

        // Check if a topic starts at this segment
        const topicDivider = Object.entries(topicStarts).find(
          ([startSec]) => Math.abs(Number(startSec) - seg.start_seconds) <= 2
        );

        return (
          <React.Fragment key={seg.id || idx}>
            {topicDivider && (
              <div className="flex items-center gap-3 my-6 pt-2 text-xs font-bold uppercase tracking-wider text-[#5C6378]">
                <span>Topic {topicDivider[1].index} · {topicDivider[1].title}</span>
                <span className="flex-1 h-px bg-[#DEE1EA]" />
              </div>
            )}

            <div
              className={`grid grid-cols-[auto_100px_1fr] sm:grid-cols-[auto_110px_1fr] gap-3 items-baseline p-2.5 rounded-xl transition-colors ${
                isActive ? 'bg-[#EEF0FC]' : 'hover:bg-white/60'
              }`}
            >
              {/* Time chip button */}
              <button
                onClick={() => onSeek(seg.start_seconds)}
                className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#2F43B8] bg-white border border-[#DEE1EA] px-2 py-0.5 rounded shadow-2xs hover:border-[#2F43B8] transition-colors"
                aria-label={`Jump audio to ${seg.start_formatted}`}
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                {seg.start_formatted}
              </button>

              {/* Speaker Label */}
              <span
                className={`text-xs font-bold truncate ${
                  seg.speaker_name === 'You' || seg.speaker_tag === 'S2'
                    ? 'text-[#B0521C]'
                    : 'text-[#2F43B8]'
                }`}
              >
                {seg.speaker_name || seg.speaker_tag}
              </span>

              {/* Spoken Prose */}
              <p className="text-sm text-[#1A1F33] leading-relaxed m-0">
                {seg.text}

                {/* Sourced Note Indicator Dots */}
                {derivedNotes.length > 0 && (
                  <span className="inline-flex items-center gap-1 ml-2.5 align-middle">
                    {derivedNotes.map((n) => (
                      <span
                        key={n.id}
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: BUCKET_DEFINITIONS[n.bucket as BucketKey]?.color }}
                        title={`${BUCKET_DEFINITIONS[n.bucket as BucketKey]?.label}: ${n.note_text.slice(0, 40)}...`}
                      />
                    ))}
                  </span>
                )}
              </p>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
