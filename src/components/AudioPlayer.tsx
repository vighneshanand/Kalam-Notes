/**
 * AudioPlayer Component
 *
 * Fixed bottom player for lecture audio playback, timeline scrubbing,
 * topic markers, and synchronized active speaker line.
 */

import React, { useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Session, Segment } from '../types';

interface AudioPlayerProps {
  session: Session;
  currentTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  audioUrl?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  session,
  currentTime,
  isPlaying,
  onTogglePlay,
  onSeek,
  audioUrl,
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const totalDuration = Math.max(1, session.duration_seconds || 1800);

  const formatTime = (secs: number) => {
    const total = Math.max(0, Math.floor(secs));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * totalDuration);
  };

  // Find active transcript segment
  const activeSegment: Segment | undefined = session.segments?.find((seg, idx, arr) => {
    const nextStart = arr[idx + 1]?.start_seconds ?? Infinity;
    return currentTime >= seg.start_seconds && currentTime < nextStart;
  }) || session.segments?.[0];

  const progressPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#DEE1EA] shadow-lg pb-safe">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3.5">
        {/* Play / Pause */}
        <button
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-full bg-[#2F43B8] hover:bg-[#253696] text-white flex items-center justify-center shrink-0 shadow-xs transition-colors"
          aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Center Progress & Text */}
        <div className="min-w-0 flex-1">
          <div className="text-xs text-[#1A1F33] truncate mb-1">
            {activeSegment ? (
              <>
                <strong className="font-bold text-[#2F43B8] mr-2">
                  {activeSegment.speaker_name || activeSegment.speaker_tag}:
                </strong>
                <span className="text-[#5C6378]">{activeSegment.text}</span>
              </>
            ) : (
              <span className="text-[#5C6378]">{session.title}</span>
            )}
          </div>

          <div
            ref={progressBarRef}
            onClick={handleProgressBarClick}
            className="h-1.5 rounded-full bg-[#F7F8FB] border border-[#DEE1EA] relative cursor-pointer group"
          >
            {/* Topic ticks */}
            {session.topics?.map((tp) => (
              <span
                key={tp.id}
                className="absolute top-[-3px] w-0.5 h-3 bg-[#8A90A3]/50 pointer-events-none"
                style={{ left: `${(tp.start_seconds / totalDuration) * 100}%` }}
                title={tp.title}
              />
            ))}

            {/* Filled track */}
            <div
              className="absolute inset-y-0 left-0 bg-[#2F43B8] rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Time Readout */}
        <div className="font-mono text-xs text-[#5C6378] tabular-nums shrink-0 whitespace-nowrap">
          <span className="text-[#1A1F33] font-semibold">{formatTime(currentTime)}</span>
          <span className="mx-1">/</span>
          <span>{session.duration_formatted}</span>
        </div>
      </div>
    </aside>
  );
};
