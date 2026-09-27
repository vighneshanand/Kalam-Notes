/**
 * HomeView Component
 *
 * Displays the session library, daily audio quota meter,
 * and clean zero-state without mock data.
 */

import React from 'react';
import { Mic, FileAudio, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { Session, UserProfile, BUCKET_DEFINITIONS, BUCKET_ORDER } from '../types';

interface HomeViewProps {
  sessions: Session[];
  user: UserProfile | null;
  onOpenSession: (id: string) => void;
  onNewSession: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  sessions,
  user,
  onOpenSession,
  onNewSession,
}) => {
  const dailyUsed = user ? Math.round(user.daily_minutes_used) : 0;
  const dailyQuota = user ? Math.round(user.daily_quota_minutes) : 120;
  const usagePercent = Math.min(100, Math.round((dailyUsed / dailyQuota) * 100));

  return (
    <main className="max-w-[1120px] mx-auto px-4 sm:px-6 py-7 pb-20">
      {/* Header & Usage Bar */}
      <section className="flex flex-wrap items-end justify-between gap-5 mb-7">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1F33]">
            Your sessions
          </h1>
          <p className="text-sm text-[#5C6378] mt-1">
            Lectures, seminars, and mentor calls, transformed into verified handwritten notes.
          </p>
        </div>

        <div className="w-full sm:w-64 bg-white border border-[#DEE1EA] rounded-xl p-3 shadow-xs">
          <div className="flex justify-between text-xs text-[#5C6378] mb-2 font-medium">
            <span>Audio used today</span>
            <span className="text-[#1A1F33] font-bold tabular-nums">
              {dailyUsed} of {dailyQuota} min
            </span>
          </div>
          <div className="h-1.5 bg-[#F7F8FB] rounded-full overflow-hidden border border-[#DEE1EA]">
            <div
              className="h-full bg-[#2F43B8] rounded-full transition-all duration-300"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Session List or Zero State */}
      {sessions.length > 0 ? (
        <ul className="grid gap-3 list-none p-0 m-0">
          {sessions.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => onOpenSession(s.id)}
                className="w-full text-left bg-white border border-[#DEE1EA] hover:border-[#8A90A3] transition-colors rounded-2xl p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Date badge */}
                  <div className="shrink-0 w-14 text-center border-r border-[#DEE1EA] pr-3">
                    <span className="block text-2xl font-bold text-[#1A1F33] leading-none tabular-nums">
                      {s.session_day}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6378]">
                      {s.session_mon}
                    </span>
                  </div>

                  {/* Title & metadata */}
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-[#1A1F33] group-hover:text-[#2F43B8] transition-colors truncate">
                      {s.title}
                    </h3>
                    <div className="text-xs text-[#5C6378] mt-1 flex flex-wrap items-center gap-x-2">
                      <span>{s.speaker}</span>
                      <span aria-hidden="true">·</span>
                      <span>{s.role || 'Mentor'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{s.duration_formatted}</span>
                      <span aria-hidden="true">·</span>
                      <span>{s.spoken_language}</span>
                    </div>
                  </div>
                </div>

                {/* Right badges & bucket summary */}
                <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F2F3F7]">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E7656] bg-[#E8F5EF] px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Notes ready
                  </span>

                  <div className="flex items-center gap-1.5 text-xs text-[#5C6378]">
                    <div className="flex gap-1 items-center">
                      {BUCKET_ORDER.map((b) => (
                        <span
                          key={b}
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: BUCKET_DEFINITIONS[b].color }}
                          title={`${BUCKET_DEFINITIONS[b].label}`}
                        />
                      ))}
                    </div>
                    <span className="tabular-nums">
                      {s.topic_count ?? 0} topics · {s.note_count ?? 0} notes
                    </span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-white border border-[#DEE1EA] rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF0FC] text-[#2F43B8] mx-auto flex items-center justify-center mb-5">
            <Mic className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-[#1A1F33] mb-2">No recorded sessions yet</h2>
          <p className="text-sm text-[#5C6378] max-w-md mx-auto mb-6 leading-relaxed">
            Record a lecture, classroom discussion, or mentor call to generate structured handwritten notes, diagrams, and grounded knowledge buckets.
          </p>

          <button
            onClick={onNewSession}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#2F43B8] hover:bg-[#253696] text-white text-sm font-semibold transition-colors shadow-xs"
          >
            <Mic className="w-4 h-4" />
            <span>Record your first session</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mt-10 pt-8 border-t border-[#DEE1EA]">
            <div className="p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1F33] mb-1">
                <FileAudio className="w-4 h-4 text-[#2F43B8]" />
                Live or Upload
              </div>
              <p className="text-xs text-[#5C6378]">
                Record directly in browser or upload an existing audio file.
              </p>
            </div>
            <div className="p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1F33] mb-1">
                <Sparkles className="w-4 h-4 text-[#0E7656]" />
                4 Knowledge Buckets
              </div>
              <p className="text-xs text-[#5C6378]">
                Concepts, industry insights, daily-life use, and mentor follow-ups.
              </p>
            </div>
            <div className="p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1F33] mb-1">
                <BookOpen className="w-4 h-4 text-[#B0521C]" />
                Handwritten Output
              </div>
              <p className="text-xs text-[#5C6378]">
                Ruled notebook pages with diagrams and sticky questions.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
