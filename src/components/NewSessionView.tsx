/**
 * NewSessionView Component
 *
 * Captures lecture details, enforces speaker consent verification,
 * and provides in-browser audio recording and file upload capabilities.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Trash2, Mic, AlertCircle } from 'lucide-react';
import { CreateSessionPayload, UserProfile } from '../types';

interface NewSessionViewProps {
  user: UserProfile | null;
  onBack: () => void;
  onSubmit: (payload: CreateSessionPayload) => void;
  isSubmitting: boolean;
}

export const NewSessionView: React.FC<NewSessionViewProps> = ({
  user,
  onBack,
  onSubmit,
  isSubmitting,
}) => {
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [spokenLang, setSpokenLang] = useState('Auto-detect');
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [mode, setMode] = useState<'record' | 'upload'>('record');

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<{
    file: File;
    base64: string;
    duration: number;
  } | null>(null);
  const [uploadError, setUploadError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  // Clean up timer and streams
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const startRecording = async () => {
    if (!consentConfirmed) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const blobUrl = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(blobUrl);

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setAudioBase64(base64data);
        };

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordSeconds(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setUploadError('Microphone access was denied. Please allow microphone permissions or upload an audio file.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
    setRecordedDuration(recordSeconds);
  };

  const resetRecording = () => {
    setAudioBase64(null);
    setAudioBlobUrl(null);
    setRecordSeconds(0);
    setRecordedDuration(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validMimes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/m4a', 'audio/aac'];
    const validExtensions = /\.(mp3|wav|ogg|webm|m4a|aac)$/i;

    if (!file.type.startsWith('audio/') && !validExtensions.test(file.name)) {
      setUploadError(`"${file.name}" is not an audio file. Please choose an MP3, M4A, WAV, OGG, or WEBM file.`);
      setUploadedFile(null);
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setUploadError('File exceeds 500 MB limit. Please trim the session to 2 hours or less.');
      setUploadedFile(null);
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setUploadedFile({
        file,
        base64: reader.result as string,
        duration: 1800, // estimated 30 mins
      });
    };
  };

  const isReady =
    consentConfirmed &&
    ((mode === 'record' && audioBase64 !== null) || (mode === 'upload' && uploadedFile !== null));

  const handleCreate = () => {
    if (!isReady || isSubmitting) return;

    const payload: CreateSessionPayload = {
      title: title.trim() || 'Untitled Lecture',
      speaker: speaker.trim() || 'Speaker',
      spoken_language: spokenLang,
      notes_language: user?.preferred_notes_lang || 'English',
      consent_confirmed: true,
      audio_base64: mode === 'record' ? audioBase64 || undefined : uploadedFile?.base64,
      audio_filename: mode === 'record' ? 'recording.webm' : uploadedFile?.file.name,
      audio_mime_type: mode === 'record' ? 'audio/webm' : uploadedFile?.file.type,
      duration_seconds: mode === 'record' ? recordedDuration : uploadedFile?.duration || 1800,
    };

    onSubmit(payload);
  };

  return (
    <main className="max-w-[1120px] mx-auto px-4 sm:px-6 py-6 pb-24">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5C6378] hover:text-[#1A1F33] transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        All sessions
      </button>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1F33]">New session</h1>
        <p className="text-sm text-[#5C6378] mt-1">
          Provide session context, confirm speaker consent, then record or upload audio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Left Card: Session Meta & Consent */}
        <section className="bg-white border border-[#DEE1EA] rounded-2xl p-5 sm:p-6 shadow-xs">
          <h2 className="text-base font-bold text-[#1A1F33] mb-1">About this session</h2>
          <p className="text-xs text-[#5C6378] mb-5">
            Displayed on your handwritten notebook headers and library archive.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-xs font-semibold text-[#1A1F33] mb-1.5">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cost of Capital and WACC"
                className="w-full h-10 px-3 rounded-lg border border-[#DEE1EA] bg-[#F7F8FB] text-sm text-[#1A1F33] focus:outline-none focus:ring-2 focus:ring-[#2F43B8]/30 focus:border-[#2F43B8]"
              />
            </div>

            <div>
              <label htmlFor="speaker" className="block text-xs font-semibold text-[#1A1F33] mb-1.5">
                Speaker
              </label>
              <input
                id="speaker"
                type="text"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                placeholder="e.g. Rohan Mehta"
                className="w-full h-10 px-3 rounded-lg border border-[#DEE1EA] bg-[#F7F8FB] text-sm text-[#1A1F33] focus:outline-none focus:ring-2 focus:ring-[#2F43B8]/30 focus:border-[#2F43B8]"
              />
            </div>

            <div>
              <label htmlFor="lang" className="block text-xs font-semibold text-[#1A1F33] mb-1.5">
                Spoken language
              </label>
              <select
                id="lang"
                value={spokenLang}
                onChange={(e) => setSpokenLang(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#DEE1EA] bg-[#F7F8FB] text-sm text-[#1A1F33] focus:outline-none focus:ring-2 focus:ring-[#2F43B8]/30 focus:border-[#2F43B8]"
              >
                <option value="Auto-detect">Auto-detect</option>
                <option value="English">English</option>
                <option value="Hinglish (mixed)">Hinglish (mixed)</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
                <option value="Marathi">Marathi</option>
                <option value="Bengali">Bengali</option>
              </select>
            </div>

            {/* Speaker Consent Confirmation */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FFF6D6] border border-[#E9C75A]/60 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentConfirmed}
                onChange={(e) => setConsentConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#2F43B8] focus:ring-[#2F43B8] accent-[#2F43B8]"
              />
              <span className="text-xs text-[#3D3413] leading-relaxed">
                <strong className="font-semibold block text-[#1A1F33]">
                  The speaker agreed to be recorded.
                </strong>
                This explicit confirmation is saved with the session record for compliance.
              </span>
            </label>
          </div>
        </section>

        {/* Right Card: Audio Recorder or Upload */}
        <section className="bg-white border border-[#DEE1EA] rounded-2xl p-5 sm:p-6 shadow-xs">
          <h2 className="text-base font-bold text-[#1A1F33] mb-1">Audio</h2>
          <p className="text-xs text-[#5C6378] mb-4">
            Sessions up to 2 hours. Silence and ambient noise are normalized automatically.
          </p>

          {/* Mode Switcher */}
          <div className="inline-flex bg-[#F7F8FB] border border-[#DEE1EA] rounded-lg p-1 mb-5">
            <button
              type="button"
              onClick={() => setMode('record')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'record' ? 'bg-white text-[#1A1F33] shadow-xs' : 'text-[#5C6378] hover:text-[#1A1F33]'
              }`}
            >
              Record
            </button>
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'upload' ? 'bg-white text-[#1A1F33] shadow-xs' : 'text-[#5C6378] hover:text-[#1A1F33]'
              }`}
            >
              Upload file
            </button>
          </div>

          {mode === 'record' ? (
            <div className="flex flex-col items-center justify-center py-6 gap-4">
              {isRecording && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#D93A2B] rec-blink">
                  <span className="w-2 h-2 rounded-full bg-[#D93A2B]" />
                  Recording · speaker consent saved
                </div>
              )}

              {/* Waveform placeholder visualization */}
              <div className="flex items-center gap-1 h-10 px-4">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rec-bar ${isRecording ? 'active' : ''}`}
                    style={{
                      animationDelay: isRecording ? `${(i * 0.08) % 0.8}s` : '0s',
                      height: isRecording ? undefined : '6px',
                    }}
                  />
                ))}
              </div>

              {/* Time display */}
              <div className="font-mono text-3xl font-semibold text-[#1A1F33] tabular-nums tracking-tight">
                {formatTimer(isRecording ? recordSeconds : recordedDuration)}
              </div>

              {/* Big Record Button */}
              <button
                type="button"
                disabled={!consentConfirmed}
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center border-4 border-[#F7F8FB] shadow-md transition-all ${
                  !consentConfirmed
                    ? 'bg-[#8A90A3] opacity-60 cursor-not-allowed'
                    : isRecording
                    ? 'bg-[#D93A2B] hover:opacity-95'
                    : 'bg-[#D93A2B] hover:scale-105'
                }`}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              >
                {isRecording ? (
                  <span className="w-6 h-6 rounded-sm bg-white" />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-white" />
                )}
              </button>

              <div className="text-center text-xs text-[#5C6378] max-w-xs mt-2">
                {!consentConfirmed ? (
                  <span className="text-[#9A5B00] font-medium flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Confirm speaker consent to enable recording.
                  </span>
                ) : isRecording ? (
                  'Tap square to finish recording.'
                ) : recordedDuration > 0 ? (
                  <div className="space-y-1">
                    <span className="text-[#0E7656] font-semibold block">
                      Recording captured ({formatTimer(recordedDuration)}).
                    </span>
                    <button
                      type="button"
                      onClick={resetRecording}
                      className="text-xs text-[#2F43B8] underline hover:opacity-80"
                    >
                      Record again
                    </button>
                  </div>
                ) : (
                  'Tap circle to start. Position your device near the lecturer.'
                )}
              </div>
            </div>
          ) : (
            <div>
              <label
                htmlFor="audio-upload"
                className="flex flex-col items-center justify-center gap-2.5 border-2 border-dashed border-[#8A90A3]/50 hover:border-[#2F43B8] transition-colors rounded-xl p-8 text-center cursor-pointer bg-[#F7F8FB]"
              >
                <Upload className="w-7 h-7 text-[#5C6378]" />
                <span className="text-sm font-bold text-[#1A1F33]">Choose an audio file</span>
                <span className="text-xs text-[#5C6378]">
                  MP3, M4A, WAV, OGG, or WEBM · up to 2 hours
                </span>
                <input
                  id="audio-upload"
                  type="file"
                  accept="audio/*,.m4a,.mp3,.wav,.ogg,.webm"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {uploadedFile && (
                <div className="flex items-center justify-between border border-[#DEE1EA] rounded-xl p-3 mt-3 bg-white">
                  <div className="min-w-0 pr-3">
                    <span className="block text-xs font-semibold text-[#1A1F33] truncate">
                      {uploadedFile.file.name}
                    </span>
                    <span className="text-[11px] text-[#5C6378]">
                      {(uploadedFile.file.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="p-1.5 text-[#5C6378] hover:text-[#B42318] rounded-lg hover:bg-[#FDECEA] transition-colors"
                    aria-label="Remove audio file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {uploadError && (
                <div className="text-xs text-[#B42318] mt-2 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Footer bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-7 pt-5 border-t border-[#DEE1EA]">
        <p className="text-xs text-[#5C6378]">
          Notes will be generated in {user?.preferred_notes_lang || 'English'}. You can adjust this in Settings.
        </p>

        <button
          onClick={handleCreate}
          disabled={!isReady || isSubmitting}
          className={`h-10 px-6 rounded-lg font-semibold text-sm transition-all shadow-xs ${
            isReady && !isSubmitting
              ? 'bg-[#2F43B8] hover:bg-[#253696] text-white'
              : 'bg-[#DEE1EA] text-[#8A90A3] cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Starting pipeline…' : 'Make notes'}
        </button>
      </div>
    </main>
  );
};
