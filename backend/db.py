"""
Kalam Notes Database Access Module.

Manages SQLite database connections, schema execution, and transactional
operations across users, sessions, segments, topics, and notes.
"""

import os
import sqlite3
from datetime import datetime, date
from typing import Any, Dict, List, Optional

DATABASE_PATH = os.environ.get("DATABASE_PATH", "./data/kalam_notes.db")


def get_db_connection() -> sqlite3.Connection:
    """Creates and returns a connection to the SQLite database with row factory enabled."""
    db_dir = os.path.dirname(DATABASE_PATH)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db(schema_file_path: Optional[str] = None) -> None:
    """Initializes the database schema from schema.sql and creates default user if missing."""
    if not schema_file_path:
        schema_file_path = os.path.join(os.path.dirname(__file__), "schema.sql")

    with open(schema_file_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    conn = get_db_connection()
    try:
        conn.executescript(schema_sql)
        today_str = date.today().isoformat()

        # Check if default user exists
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE id = 'user_default';")
        user = cursor.fetchone()
        if not user:
            cursor.execute(
                """
                INSERT INTO users (
                    id, email, display_name, avatar_initials,
                    preferred_notes_lang, daily_minutes_used, daily_quota_minutes,
                    last_reset_date, save_to_drive
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    "user_default",
                    "user@example.com",
                    "Notes Author",
                    "NA",
                    os.environ.get("DEFAULT_NOTES_LANGUAGE", "English"),
                    0.0,
                    float(os.environ.get("DAILY_AUDIO_LIMIT_MINUTES", "120")),
                    today_str,
                    1,
                ),
            )
            conn.commit()
    finally:
        conn.close()


def get_user_profile(user_id: str = "user_default") -> Dict[str, Any]:
    """Retrieves user profile with daily quota reset logic."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?;", (user_id,))
        row = cursor.fetchone()
        if not row:
            return {}

        user_data = dict(row)
        today_str = date.today().isoformat()
        if user_data.get("last_reset_date") != today_str:
            cursor.execute(
                "UPDATE users SET daily_minutes_used = 0.0, last_reset_date = ? WHERE id = ?;",
                (today_str, user_id),
            )
            conn.commit()
            user_data["daily_minutes_used"] = 0.0
            user_data["last_reset_date"] = today_str

        return user_data
    finally:
        conn.close()


def update_user_preferences(
    user_id: str, preferred_notes_lang: str, save_to_drive: bool
) -> Dict[str, Any]:
    """Updates user language and drive storage preferences."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE users
            SET preferred_notes_lang = ?,
                save_to_drive = ?,
                updated_at = datetime('now')
            WHERE id = ?;
            """,
            (preferred_notes_lang, 1 if save_to_drive else 0, user_id),
        )
        conn.commit()
        return get_user_profile(user_id)
    finally:
        conn.close()


def add_user_audio_minutes(user_id: str, minutes: float) -> None:
    """Increments the daily audio minutes used by the user."""
    conn = get_db_connection()
    try:
        conn.execute(
            """
            UPDATE users
            SET daily_minutes_used = daily_minutes_used + ?,
                updated_at = datetime('now')
            WHERE id = ?;
            """,
            (minutes, user_id),
        )
        conn.commit()
    finally:
        conn.close()


def list_sessions(user_id: str = "user_default") -> List[Dict[str, Any]]:
    """Retrieves all sessions for a user with aggregated counts."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        query = """
        SELECT
            s.*,
            (SELECT COUNT(*) FROM topics t WHERE t.session_id = s.id) AS topic_count,
            (SELECT COUNT(*) FROM notes n WHERE n.session_id = s.id) AS note_count,
            (SELECT COUNT(*) FROM notes n WHERE n.session_id = s.id AND n.bucket = 'k') AS count_k,
            (SELECT COUNT(*) FROM notes n WHERE n.session_id = s.id AND n.bucket = 'i') AS count_i,
            (SELECT COUNT(*) FROM notes n WHERE n.session_id = s.id AND n.bucket = 'd') AS count_d,
            (SELECT COUNT(*) FROM notes n WHERE n.session_id = s.id AND n.bucket = 'm') AS count_m,
            (SELECT COUNT(*) FROM notes n WHERE n.session_id = s.id AND n.verification_status = 'ok') AS ok_count,
            (SELECT COUNT(*) FROM notes n WHERE n.session_id = s.id AND n.verification_status = 'check') AS check_count
        FROM sessions s
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC;
        """
        cursor.execute(query, (user_id,))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_session_detail(session_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves complete session details including segments, topics, and notes."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sessions WHERE id = ?;", (session_id,))
        session_row = cursor.fetchone()
        if not session_row:
            return None

        session = dict(session_row)

        # Segments
        cursor.execute(
            "SELECT * FROM segments WHERE session_id = ? ORDER BY segment_index ASC;",
            (session_id,),
        )
        session["segments"] = [dict(r) for r in cursor.fetchall()]

        # Topics
        cursor.execute(
            "SELECT * FROM topics WHERE session_id = ? ORDER BY topic_index ASC;",
            (session_id,),
        )
        topics = [dict(r) for r in cursor.fetchall()]

        # Notes
        cursor.execute(
            "SELECT * FROM notes WHERE session_id = ? ORDER BY note_index ASC;",
            (session_id,),
        )
        all_notes = [dict(r) for r in cursor.fetchall()]

        # Attach notes to topics
        notes_by_topic: Dict[str, List[Dict[str, Any]]] = {}
        for n in all_notes:
            notes_by_topic.setdefault(n["topic_id"], []).append(n)

        for t in topics:
            t["notes"] = notes_by_topic.get(t["id"], [])

        session["topics"] = topics
        session["all_notes"] = all_notes
        return session
    finally:
        conn.close()


def delete_session(session_id: str) -> bool:
    """Deletes a session and its associated files and cascade database records."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT audio_file_path FROM sessions WHERE id = ?;", (session_id,))
        row = cursor.fetchone()
        if row and row["audio_file_path"]:
            audio_path = row["audio_file_path"]
            if os.path.exists(audio_path):
                try:
                    os.remove(audio_path)
                except OSError:
                    pass

        cursor.execute("DELETE FROM sessions WHERE id = ?;", (session_id,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def delete_all_user_data(user_id: str = "user_default") -> None:
    """Wipes all sessions and resets daily usage for a user."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT audio_file_path FROM sessions WHERE user_id = ?;", (user_id,))
        for row in cursor.fetchall():
            if row["audio_file_path"] and os.path.exists(row["audio_file_path"]):
                try:
                    os.remove(row["audio_file_path"])
                except OSError:
                    pass

        cursor.execute("DELETE FROM sessions WHERE user_id = ?;", (user_id,))
        cursor.execute(
            "UPDATE users SET daily_minutes_used = 0.0, updated_at = datetime('now') WHERE id = ?;",
            (user_id,),
        )
        conn.commit()
    finally:
        conn.close()
