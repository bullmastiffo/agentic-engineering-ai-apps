import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TimerDisplay } from '../TimerDisplay';

describe('TimerDisplay', () => {
  it('renders idle state with no time', () => {
    render(<TimerDisplay status="idle" remainingSeconds={null} />);
    expect(screen.getByRole('timer')).toBeInTheDocument();
    expect(screen.getByText('--:--')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Idle');
  });

  it('renders running state with countdown', () => {
    render(<TimerDisplay status="running" remainingSeconds={90} />);
    expect(screen.getByText('01:30')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Running');
  });

  it('renders paused state', () => {
    render(<TimerDisplay status="paused" remainingSeconds={300} />);
    expect(screen.getByRole('status')).toHaveTextContent('Paused');
  });

  it('renders completed state', () => {
    render(<TimerDisplay status="completed" remainingSeconds={0} />);
    expect(screen.getByRole('status')).toHaveTextContent('Completed');
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('renders stopped_early state', () => {
    render(<TimerDisplay status="stopped_early" remainingSeconds={0} />);
    expect(screen.getByRole('status')).toHaveTextContent('Stopped early');
  });

  it('formats seconds into mm:ss correctly', () => {
    render(<TimerDisplay status="running" remainingSeconds={1500} />);
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('never shows negative time', () => {
    render(<TimerDisplay status="running" remainingSeconds={-5} />);
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('renders break state', () => {
    render(<TimerDisplay status="break" remainingSeconds={300} />);
    expect(screen.getByRole('status')).toHaveTextContent('Break');
    expect(screen.getByText('05:00')).toBeInTheDocument();
  });
});
