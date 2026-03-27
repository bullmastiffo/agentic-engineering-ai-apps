import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Controls } from '../Controls';

const noop = () => { /* intentional no-op */ };
const defaultProps = { onStart: noop, onPause: noop, onResume: noop, onStop: noop, onSkipBreak: noop };

describe('Controls — US1', () => {
  it('shows Start button when idle', () => {
    render(<Controls status="idle" {...defaultProps} />);
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pause/i })).not.toBeInTheDocument();
  });

  it('calls onStart when Start is clicked', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<Controls status="idle" {...defaultProps} onStart={onStart} />);
    await user.click(screen.getByRole('button', { name: /start/i }));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it('shows Start after completed', () => {
    render(<Controls status="completed" {...defaultProps} />);
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('shows Start after stopped_early', () => {
    render(<Controls status="stopped_early" {...defaultProps} />);
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });
});

describe('Controls — US2 pause/resume', () => {
  it('shows Pause and Stop when running', () => {
    render(<Controls status="running" {...defaultProps} />);
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /start/i })).not.toBeInTheDocument();
  });

  it('calls onPause when Pause is clicked', async () => {
    const user = userEvent.setup();
    const onPause = vi.fn();
    render(<Controls status="running" {...defaultProps} onPause={onPause} />);
    await user.click(screen.getByRole('button', { name: /pause/i }));
    expect(onPause).toHaveBeenCalledOnce();
  });

  it('shows Resume and Stop when paused', () => {
    render(<Controls status="paused" {...defaultProps} />);
    expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pause/i })).not.toBeInTheDocument();
  });

  it('calls onResume when Resume is clicked', async () => {
    const user = userEvent.setup();
    const onResume = vi.fn();
    render(<Controls status="paused" {...defaultProps} onResume={onResume} />);
    await user.click(screen.getByRole('button', { name: /resume/i }));
    expect(onResume).toHaveBeenCalledOnce();
  });
});

describe('Controls — US3 stop', () => {
  it('Stop is available when running', () => {
    render(<Controls status="running" {...defaultProps} />);
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
  });

  it('Stop is available when paused', () => {
    render(<Controls status="paused" {...defaultProps} />);
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
  });

  it('calls onStop when Stop is clicked from running', async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();
    render(<Controls status="running" {...defaultProps} onStop={onStop} />);
    await user.click(screen.getByRole('button', { name: /stop/i }));
    expect(onStop).toHaveBeenCalledOnce();
  });
});

describe('Controls — break state', () => {
  it('shows Skip Break button when in break state', () => {
    render(<Controls status="break" {...defaultProps} />);
    expect(screen.getByRole('button', { name: /skip break/i })).toBeInTheDocument();
  });

  it('calls onSkipBreak when Skip Break is clicked', async () => {
    const user = userEvent.setup();
    const onSkipBreak = vi.fn();
    render(<Controls status="break" {...defaultProps} onSkipBreak={onSkipBreak} />);
    await user.click(screen.getByRole('button', { name: /skip break/i }));
    expect(onSkipBreak).toHaveBeenCalledOnce();
  });

  it('does not show Start, Pause, Resume, or Stop during break', () => {
    render(<Controls status="break" {...defaultProps} />);
    expect(screen.queryByRole('button', { name: /^start/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pause/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /resume/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^stop/i })).not.toBeInTheDocument();
  });
});
