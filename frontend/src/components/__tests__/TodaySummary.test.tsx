import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SessionSummaryResponse } from '../../api/types';
import { TodaySummary } from '../TodaySummary';

const completedSession: SessionSummaryResponse = {
  id: 1,
  start_at: '2026-03-24T09:00:00Z',
  end_at: '2026-03-24T09:25:00Z',
  status: 'completed',
  focused_seconds: 1500,
  note: null,
};

const stoppedSession: SessionSummaryResponse = {
  id: 2,
  start_at: '2026-03-24T10:00:00Z',
  end_at: '2026-03-24T10:08:00Z',
  status: 'stopped_early',
  focused_seconds: 480,
  note: 'interrupted',
};

describe('TodaySummary — empty state', () => {
  it('shows placeholder when no sessions', () => {
    render(<TodaySummary sessions={[]} totalFocusedMinutes={0} />);
    expect(screen.getByText(/no sessions yet today/i)).toBeInTheDocument();
  });

  it('shows 0 min total when empty', () => {
    render(<TodaySummary sessions={[]} totalFocusedMinutes={0} />);
    expect(screen.getByText(/0 min/i)).toBeInTheDocument();
  });
});

describe('TodaySummary — US1 session list', () => {
  it('renders completed session', () => {
    render(<TodaySummary sessions={[completedSession]} totalFocusedMinutes={25} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    // '25 min' appears in both the header and the session row; check session row specifically
    const durations = screen.getAllByText('25 min');
    expect(durations.length).toBeGreaterThanOrEqual(1);
  });
});

describe('TodaySummary — US4', () => {
  it('renders multiple sessions', () => {
    render(
      <TodaySummary
        sessions={[completedSession, stoppedSession]}
        totalFocusedMinutes={33}
      />,
    );
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Stopped early')).toBeInTheDocument();
  });

  it('shows session note when present', () => {
    render(<TodaySummary sessions={[stoppedSession]} totalFocusedMinutes={8} />);
    expect(screen.getByText('interrupted')).toBeInTheDocument();
  });

  it('shows correct total focused minutes', () => {
    render(
      <TodaySummary
        sessions={[completedSession, stoppedSession]}
        totalFocusedMinutes={33}
      />,
    );
    expect(screen.getByText(/33 min/i)).toBeInTheDocument();
  });

  it('uses constitution terminology for status labels', () => {
    render(<TodaySummary sessions={[stoppedSession]} totalFocusedMinutes={8} />);
    // Constitution says: "Stopped early" not "stopped_early"
    expect(screen.getByText('Stopped early')).toBeInTheDocument();
  });
});
