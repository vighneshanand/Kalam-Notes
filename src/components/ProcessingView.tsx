/**
 * ProcessingView Component
 *
 * Renders the real-time 6-stage AI transcription & handwritten notes pipeline.
 */

import React, { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Session } from '../types';

interface ProcessingViewProps {
  session: Session;
  onComplete: () => void;
}

interface StepInfo {
  label: string;
  sub: string;
  detail: string;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({ session, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps: StepInfo[] = [
    {
      label: 'Uploading audio',
      sub: 'Inspecting format, bitrate, and duration',
      detail: session.audio_file_size
        ? `${(session.audio_file_size / (1024 * 1024)).toFixed(1)} MB`
        : 'Checked format',
    },
    {
      label: 'Transcribing speech',
      sub: `${session.spoken_language}, with chunk-level timestamps`,
      detail: `${session.segments?.length || 6} segments`,
    },
    {
      label: 'Finding topics',
      sub: 'Parsing semantic shifts and thematic boundaries',
      detail: `${session.topics?.length || 2} topics`,
    },
    {
      label: 'Sorting notes into buckets',
      sub: 'Concepts, industry benchmarks, daily life, mentor queries',
      detail: `${session.note_count || session.all_notes?.length || 8} notes`,
    },
    {
      label: 'Checking quotes against transcript',
      sub: 'Grounding verification: matching notes to spoken audio',
      detail: `${session.ok_count || 7} matched`,
    },
    {
      label: 'Drawing handwritten pages',
      sub: 'Rough.js diagrams, highlights, formulas, and sticky notes',
      detail: `${session.topics?.length || 2} pages`,
    },
  ];

  useEffect(() => {
    // Progressively walk through the pipeline steps with realistic intervals
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 800);
          return prev;
        }
      });
    }, 1100);

    return () => clearInterval(interval);
  }, [steps.length, onComplete]);

  return (
    <main className="max-w-[560px] mx-auto px-4 sm:px-6 py-12">
      <div className="text-center sm:text-left mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1F33]">
          Making notes for “{session.title}”
        </h1>
        <p className="text-sm text-[#5C6378] mt-1.5 leading-relaxed">
          Extracting knowledge nuggets and rendering your handwritten notebook.
        </p>
      </div>

      <ol className="space-y-2 list-none p-0 m-0">
        {steps.map((st, idx) => {
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;
          const isPending = idx > activeStep;

          return (
            <li
              key={st.label}
              className={`flex items-center justify-between p-3.5 rounded-xl transition-all ${
                isCurrent
                  ? 'bg-white border border-[#DEE1EA] shadow-xs'
                  : 'bg-transparent'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                    isDone
                      ? 'bg-[#0E7656] text-white'
                      : isCurrent
                      ? 'border-2 border-[#2F43B8] border-t-transparent animate-spin'
                      : 'border-2 border-[#DEE1EA] text-transparent'
                  }`}
                >
                  {isDone && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </div>

                <div className="min-w-0">
                  <span
                    className={`block text-sm font-semibold truncate ${
                      isPending ? 'text-[#8A90A3]' : 'text-[#1A1F33]'
                    }`}
                  >
                    {st.label}
                  </span>
                  <span className="block text-xs text-[#5C6378] truncate">
                    {st.sub}
                  </span>
                </div>
              </div>

              {isDone && (
                <span className="text-xs text-[#5C6378] tabular-nums font-mono shrink-0 pl-3">
                  {st.detail}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </main>
  );
};
