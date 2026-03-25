import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Controls } from '../Controls';

const noop = () => { /* intentional no-op */ };

describe('Controls — US1', () => {
  it('shows Start button when idle', () => {
    render(<Controls status="idle" onStart={noop} onPause={noop} onResume={noop} onStop={noop} />);
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pause/i })).not.toBeInTheDocument();
  });

  it('calls onStart when Start is clicked', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<Controls status="idle" onStart={onStart} onPause={noop} onResume={noop} onStop={noop} />);
    await user.click(screen.getByRole('button', { name: /start/i }));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it('shows Start after completed', () => {
    render(<Controls status="completed" onStart={noop} onPause={noop} onResume={noop} onStop={noop} />);
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('shows Start after stopped_early', () => {
    render(<Controls status="stopped_early" onStart={noop} onPause={noop} onResume={noop} onStop={noop} />);
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });
});

describe('Controls — US2 pause/resume', () => {
  it('shows Pause and Stop when running', () => {
    render(<Controls status="running" onStart={noop} onPause={noop} onResume={noop} onStop={noop} />);
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /start/i })).not.toBeInTheDocument();
  });

  it('calls onPause when Pause is clicked', async () => {
    const user = userEvent.setup();
    const onPause = vi.fn();
    render(<Controls status="running" onStart={noop} onPause={onPause} onResume={noop} onStop={noop} />);
    await user.click(screen.getByRole('button', { name: /pause/i }));
    expect(onPause).toHaveBeenCalledOnce();
  });

  it('shows Resume and Stop when paused', () => {
    render(<Controls status="paused" onStart={noop} onPause={noop} onResume={noop} onStop={noop} />);
    expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pause/i })).not.toBeInTheDocument();
  });

  it('calls onResume when Resume is clicked', async () => {
    const user = userEvent.setup();
    const onResume = vi.fn();
    render(<Controls status="paused" onStart={noop} onPause={noop} onResume={onResume} onStop={noop} />);
    await user.click(screen.getByRole('button', { name: /resume/i }));
    expect(onResume).toHaveBeenCalledOnce();
  });
});

describe('Controls — US3 stop', () => {
  it('Stop is available when running', () => {
    render(<Controls status="running" onStart={noop} onPause={noop} onResume={noop} onStop={noop} />);
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
  });

  it('Stop is available when paused', () => {
    render(<Controls status="paused" onStart={noop} onPause={noop} onResume={noop} onStop={noop} />);
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
  });

  it('calls onStop when Stop is clicked from running', async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();
    render(<Controls status="running" onStart={noop} onPause={noop} onResume={noop} onStop={onStop} />);
    await user.click(screen.getByRole('button', { name: /stop/i }));
    expect(onStop).toHaveBeenCalledOnce();
  });
});
