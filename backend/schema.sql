-- ============================================================================
-- Kalam Notes Database Schema
-- Architecture: SQLite relational persistence with strict foreign keys
-- Purpose: Lecture to handwritten notes processing, storage, and retrieval
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- Table: users
-- Stores the active user profile, daily audio usage tracker, and preferences
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar_initials TEXT NOT NULL DEFAULT 'VA',
    preferred_notes_lang TEXT NOT NULL DEFAULT 'English',
    daily_minutes_used REAL NOT NULL DEFAULT 0.0,
    daily_quota_minutes REAL NOT NULL DEFAULT 120.0,
    last_reset_date TEXT NOT NULL,
    save_to_drive INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------------------
-- Table: sessions
-- Represents an audio lecture or mentor session with lifecycle status
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    speaker TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Mentor',
    session_date TEXT NOT NULL,
    session_day TEXT NOT NULL,
    session_mon TEXT NOT NULL,
    duration_seconds REAL NOT NULL DEFAULT 0.0,
    duration_formatted TEXT NOT NULL DEFAULT '00:00',
    spoken_language TEXT NOT NULL DEFAULT 'Auto-detect',
    notes_language TEXT NOT NULL DEFAULT 'English',
    consent_confirmed INTEGER NOT NULL DEFAULT 0,
    consent_timestamp TEXT,
    audio_file_path TEXT,
    audio_file_name TEXT,
    audio_mime_type TEXT,
    audio_file_size INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'created', -- 'created', 'processing', 'ready', 'failed'
    status_step INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);

-- ----------------------------------------------------------------------------
-- Table: segments
-- Timestamped transcript segments with speaker attribution
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS segments (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    segment_index INTEGER NOT NULL,
    start_seconds REAL NOT NULL,
    end_seconds REAL NOT NULL,
    start_formatted TEXT NOT NULL,
    end_formatted TEXT NOT NULL,
    speaker_tag TEXT NOT NULL,  -- e.g., 'S1', 'S2', 'Mentor', 'You'
    speaker_name TEXT NOT NULL,
    text TEXT NOT NULL,
    language TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_segments_session_id ON segments(session_id);
CREATE INDEX IF NOT EXISTS idx_segments_times ON segments(session_id, start_seconds);

-- ----------------------------------------------------------------------------
-- Table: topics
-- High-level subject breakdown with time ranges and visual aids
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    topic_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    start_seconds REAL NOT NULL,
    end_seconds REAL NOT NULL,
    start_formatted TEXT NOT NULL,
    end_formatted TEXT NOT NULL,
    highlights_json TEXT NOT NULL DEFAULT '[]', -- JSON string array of keywords
    formulas_json TEXT NOT NULL DEFAULT '[]',   -- JSON string array of formulas
    visual_type TEXT,                           -- 'wacc', 'range', 'pie', 'scale', 'ltv', or NULL
    visual_caption TEXT,
    diagram_mermaid TEXT,
    sketches_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_topics_session_id ON topics(session_id);
CREATE INDEX IF NOT EXISTS idx_topics_session_index ON topics(session_id, topic_index);

-- ----------------------------------------------------------------------------
-- Table: notes
-- Atomic knowledge nuggets categorized into the 4 structured buckets:
--   'k' = Key concepts
--   'i' = Industry insights
--   'd' = Daily-life application
--   'm' = Questions for next session (sticky note)
-- Includes grounded transcript quote and verification status
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    bucket TEXT NOT NULL CHECK(bucket IN ('k', 'i', 'd', 'm')),
    note_text TEXT NOT NULL,
    timestamp_seconds REAL NOT NULL,
    timestamp_formatted TEXT NOT NULL,
    quote TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'ok' CHECK(verification_status IN ('ok', 'check')),
    note_index INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notes_session_id ON notes(session_id);
CREATE INDEX IF NOT EXISTS idx_notes_topic_id ON notes(topic_id);
CREATE INDEX IF NOT EXISTS idx_notes_bucket ON notes(session_id, bucket);
