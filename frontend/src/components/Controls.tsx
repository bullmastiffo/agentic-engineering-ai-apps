import React from 'react';
import type { TimerStatus } from '../hooks/useTimerService';

interface Props {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export const Controls = React.memo(function Controls({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
}: Props) {
  return (
    <div className="controls" role="group" aria-label="Timer controls">
      {status === 'idle' || status === 'completed' || status === 'stopped_early' ? (
        <button
          className="btn btn-primary"
          onClick={onStart}
          aria-label="Start a new focus session"
        >
          Start
        </button>
      ) : null}

      {status === 'running' ? (
        <>
          <button
            className="btn btn-secondary"
            onClick={onPause}
            aria-label="Pause the current session"
          >
            Pause
          </button>
          <button
            className="btn btn-danger"
            onClick={onStop}
            aria-label="Stop the current session early"
          >
            Stop
          </button>
        </>
      ) : null}

      {status === 'paused' ? (
        <>
          <button
            className="btn btn-primary"
            onClick={onResume}
            aria-label="Resume focus session"
          >
            Resume
          </button>
          <button
            className="btn btn-danger"
            onClick={onStop}
            aria-label="Stop the current session early"
          >
            Stop
          </button>
        </>
      ) : null}
    </div>
  );
});
