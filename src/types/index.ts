/**
 * Kalam Notes Frontend Type Definitions.
 *
 * Matches the backend SQLite relational schema and 4-bucket knowledge structure.
 */

export type BucketKey = 'k' | 'i' | 'd' | 'm';

export interface BucketDefinition {
  label: string;
  hand: string;
  color: string;
  softColor: string;
  description: string;
}

export const BUCKET_DEFINITIONS: Record<BucketKey, BucketDefinition> = {
  k: {
    label: 'Key concepts',
    hand: 'Key concepts',
    color: '#2F43B8',
    softColor: '#EEF0FC',
    description: 'Foundational theory, definitions, and core principles',
  },
  i: {
    label: 'Industry insights',
    hand: 'From the industry',
    color: '#0E7656',
    softColor: '#E8F5EF',
    description: 'Real-world benchmarks, analyst practices, and domain conventions',
  },
  d: {
    label: 'Daily-life application',
    hand: 'In daily life',
    color: '#B0521C',
    softColor: '#FBEFE6',
    description: 'Relatable analogies, personal finance, and decision models',
  },
  m: {
    label: 'Questions for next session',
    hand: 'Ask next time',
    color: '#8A6700',
    softColor: '#FFF6D6',
    description: 'Unresolved inquiries, cohort queries, and mentor follow-ups',
  },
};

export const BUCKET_ORDER: BucketKey[] = ['k', 'i', 'd', 'm'];

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_initials: string;
  preferred_notes_lang: string;
  daily_minutes_used: number;
  daily_quota_minutes: number;
  last_reset_date: string;
  save_to_drive: number;
}

export interface Segment {
  id: string;
  session_id: string;
  segment_index: number;
  start_seconds: number;
  end_seconds: number;
  start_formatted: string;
  end_formatted: string;
  speaker_tag: string;
  speaker_name: string;
  text: string;
  language?: string;
}

export interface Note {
  id: string;
  session_id: string;
  topic_id: string;
  bucket: BucketKey;
  note_text: string;
  timestamp_seconds: number;
  timestamp_formatted: string;
  quote: string;
  verification_status: 'ok' | 'check';
  note_index: number;
}

export interface Topic {
  id: string;
  session_id: string;
  topic_index: number;
  title: string;
  start_seconds: number;
  end_seconds: number;
  start_formatted: string;
  end_formatted: string;
  highlights_json: string;
  formulas_json: string;
  visual_type: 'wacc' | 'range' | 'pie' | 'scale' | 'ltv' | string | null;
  visual_caption: string | null;
  diagram_mermaid: string;
  sketches_json: string;
  notes: Note[];
}

export interface Session {
  id: string;
  user_id: string;
  title: string;
  speaker: string;
  role: string;
  session_date: string;
  session_day: string;
  session_mon: string;
  duration_seconds: number;
  duration_formatted: string;
  spoken_language: string;
  notes_language: string;
  consent_confirmed: number;
  audio_file_path?: string;
  audio_file_name?: string;
  audio_mime_type?: string;
  audio_file_size?: number;
  status: 'created' | 'processing' | 'ready' | 'failed';
  status_step: number;
  error_message?: string;
  topic_count?: number;
  note_count?: number;
  count_k?: number;
  count_i?: number;
  count_d?: number;
  count_m?: number;
  ok_count?: number;
  check_count?: number;
  segments?: Segment[];
  topics?: Topic[];
  all_notes?: Note[];
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

