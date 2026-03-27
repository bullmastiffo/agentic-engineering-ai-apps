import React from 'react';
import type { SessionSummaryResponse } from '../api/types';

interface Props {
  sessions: SessionSummaryResponse[];
  totalFocusedMinutes: number;
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completed',
  stopped_early: 'Stopped early',
  running: 'Running',
  paused: 'Paused',
};

function formatLocalTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

const SessionRow = React.memo(function SessionRow({ session }: { session: SessionSummaryResponse }) {
  const minutes =
    session.focused_seconds !== null ? Math.floor(session.focused_seconds / 60) : null;

  return (
    <li className="session-row">
      <span className="session-time">{formatLocalTime(session.start_at)}</span>
      <span className="session-duration">
        {minutes !== null ? `${minutes} min` : '—'}
      </span>
      <span className={`session-status session-status--${session.status}`}>
        {STATUS_LABELS[session.status] ?? session.status}
      </span>
      {session.note ? (
        <span className="session-note">{session.note}</span>
      ) : null}
    </li>
  );
});

export const TodaySummary = React.memo(function TodaySummary({
  sessions,
  totalFocusedMinutes,
}: Props) {
  return (
    <section className="today-summary" aria-label="Today's focus summary">
      <h2 className="today-total">
        Today: <strong>{totalFocusedMinutes} min</strong> focused
      </h2>
      {sessions.length === 0 ? (
        <p className="today-empty">No sessions yet today.</p>
      ) : (
        <ul className="session-list" aria-label="Today's sessions">
          {[...sessions].reverse().map((s) => (
            <SessionRow key={s.id} session={s} />
          ))}
        </ul>
      )}
    </section>
  );
});
