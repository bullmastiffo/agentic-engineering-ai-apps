import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimerStore } from '../useTimerService';

// Mock apiFetch so no real HTTP calls are made
vi.mock('../../api/client', () => ({
  apiFetch: vi.fn(),
  OfflineError: class OfflineError extends Error {
    constructor() { super('Backend unreachable'); this.name = 'OfflineError'; }
  },
}));

function resetStore() {
  useTimerStore.setState({
    status: 'idle',
    sessionId: null,
    startAt: null,
    configuredSeconds: null,
    pausedSeconds: null,
    pausedAt: null,
    remainingSeconds: null,
    breakNotification: null,
    todaySessions: [],
    totalFocusedMinutes: 0,
    settings: { focus_minutes: 25, break_minutes: 5 },
    backendReachable: true,
  });
}

describe('useTimerStore — break timer', () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('transitions to break state after session completes', async () => {
    const { apiFetch } = await import('../../api/client');
    const mockApiFetch = vi.mocked(apiFetch);
    mockApiFetch.mockResolvedValueOnce(undefined);
    mockApiFetch.mockResolvedValueOnce({ date: '2026-03-27', total_focused_minutes: 25, sessions: [] });

    const now = Date.now();
    useTimerStore.setState({
      status: 'running',
      sessionId: 1,
      startAt: now - 1500 * 1000,
      configuredSeconds: 1500,
      pausedSeconds: 0,
      pausedAt: null,
      remainingSeconds: 1,
      settings: { focus_minutes: 25, break_minutes: 5 },
    });

    useTimerStore.getState().tick();

    await vi.waitFor(() => {
      const state = useTimerStore.getState();
      expect(state.status).toBe('break');
    });

    const state = useTimerStore.getState();
    expect(state.status).toBe('break');
    expect(state.configuredSeconds).toBe(300);
    expect(state.remainingSeconds).toBe(300);
    expect(state.sessionId).toBeNull();
  });

  it('ticks down break remaining seconds', () => {
    const now = Date.now();
    useTimerStore.setState({
      status: 'break',
      sessionId: null,
      startAt: now - 10_000,
      configuredSeconds: 300,
      pausedSeconds: 0,
      pausedAt: null,
      remainingSeconds: 300,
    });

    useTimerStore.getState().tick();

    const state = useTimerStore.getState();
    expect(state.status).toBe('break');
    expect(state.remainingSeconds).toBeLessThan(295);
    expect(state.remainingSeconds).toBeGreaterThan(285);
  });

  it('transitions to idle when break countdown reaches 0', () => {
    const now = Date.now();
    useTimerStore.setState({
      status: 'break',
      sessionId: null,
      startAt: now - 301_000,
      configuredSeconds: 300,
      pausedSeconds: 0,
      pausedAt: null,
      remainingSeconds: 1,
      breakNotification: null,
    });

    useTimerStore.getState().tick();

    const state = useTimerStore.getState();
    expect(state.status).toBe('idle');
    expect(state.remainingSeconds).toBeNull();
    expect(state.breakNotification).toBe('Break over — ready when you are');
  });

  it('skipBreak returns to idle without notification', () => {
    useTimerStore.setState({
      status: 'break',
      sessionId: null,
      startAt: Date.now(),
      configuredSeconds: 300,
      pausedSeconds: 0,
      pausedAt: null,
      remainingSeconds: 250,
      breakNotification: null,
    });

    useTimerStore.getState().skipBreak();

    const state = useTimerStore.getState();
    expect(state.status).toBe('idle');
    expect(state.remainingSeconds).toBeNull();
    expect(state.breakNotification).toBeNull();
  });

  it('skipBreak does nothing when not in break state', () => {
    useTimerStore.setState({ status: 'idle' });
    useTimerStore.getState().skipBreak();
    expect(useTimerStore.getState().status).toBe('idle');

    useTimerStore.setState({ status: 'running' });
    useTimerStore.getState().skipBreak();
    expect(useTimerStore.getState().status).toBe('running');
  });

  it('pauseSession is guarded during break state', async () => {
    useTimerStore.setState({
      status: 'break',
      sessionId: null,
      startAt: Date.now(),
      configuredSeconds: 300,
      pausedSeconds: 0,
      pausedAt: null,
      remainingSeconds: 250,
    });

    await useTimerStore.getState().pauseSession();
    expect(useTimerStore.getState().status).toBe('break');
  });

  it('stopSession is guarded during break state', async () => {
    useTimerStore.setState({
      status: 'break',
      sessionId: null,
      startAt: Date.now(),
      configuredSeconds: 300,
      pausedSeconds: 0,
      pausedAt: null,
      remainingSeconds: 250,
    });

    await useTimerStore.getState().stopSession();
    expect(useTimerStore.getState().status).toBe('break');
  });

  it('startSession clears breakNotification', async () => {
    const { apiFetch } = await import('../../api/client');
    const mockApiFetch = vi.mocked(apiFetch);
    mockApiFetch.mockResolvedValueOnce({
      id: 2,
      start_at: new Date().toISOString(),
      end_at: null,
      status: 'running',
      configured_minutes: 25,
      paused_seconds: 0,
      paused_at: null,
      remaining_seconds: 1500,
      note: null,
    });

    useTimerStore.setState({
      status: 'idle',
      breakNotification: 'Break over — ready when you are',
      settings: { focus_minutes: 25, break_minutes: 5 },
    });

    await useTimerStore.getState().startSession();

    expect(useTimerStore.getState().breakNotification).toBeNull();
  });
});
