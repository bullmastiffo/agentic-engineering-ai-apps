# Quickstart: Break Timer

**Feature**: 002-break-timer | **Date**: 2025-07-17

## What This Feature Does

When a focus session completes (countdown reaches 0:00), the app automatically starts a break countdown using the user's configured `break_minutes` setting. The break state has a distinct teal colour theme and displays "BREAK" as the status label. When the break finishes naturally, the timer returns to idle and shows a "Break over — ready when you are" notification. Users can click "Skip Break" to end the break early and return to idle immediately.

## Scope

- **Frontend only** — no backend changes (FR-012)
- **~5 files modified**, **~1 new test file**
- Estimated complexity: Low–Medium

## Files to Change

| File | Change Type | What Changes |
|------|-------------|--------------|
| `frontend/src/hooks/useTimerService.ts` | Modify | Add `'break'` to `TimerStatus`, add `breakNotification` state field, add `skipBreak` action, extend `tick()` for break countdown and break → idle transition, extend `startSession()` to clear notification |
| `frontend/src/components/TimerDisplay.tsx` | Modify | Add `'break': 'Break'` to `STATUS_LABELS` record |
| `frontend/src/components/Controls.tsx` | Modify | Add `'break'` status branch showing "Skip Break" button, add `onSkipBreak` prop |
| `frontend/src/App.tsx` | Modify | Wire `skipBreak` action to Controls `onSkipBreak` prop, render break-over notification banner |
| `frontend/src/index.css` | Modify | Add `--teal` colour token, add `data-status="break"` CSS rules, add break notification styles |
| `frontend/src/components/__tests__/Controls.test.tsx` | Modify | Add tests for "Skip Break" button visibility and click handler |
| `frontend/src/components/__tests__/TimerDisplay.test.tsx` | Modify | Add test for break status label display |
| `frontend/src/components/__tests__/useTimerService.test.ts` | New | Test break transitions: completed→break, break tick countdown, break→idle (natural), break→idle (skip), notification on natural completion, no notification on skip |

## Key Design Decisions

1. **Reuse existing timer fields** — Break state reuses `startAt`, `configuredSeconds`, `remainingSeconds` etc. rather than adding duplicate fields. The `computeRemaining` function works unchanged.

2. **COMPLETED is transient** — When focus reaches 0, the status briefly becomes `completed` during the API call, then immediately transitions to `break` in the same callback. The user never sees "Completed" between a focus session and a break.

3. **Break notification persists until next action** — The "Break over" message stays visible until the user starts a new session, ensuring they don't miss it.

4. **No break persistence** — Breaks are ephemeral. Page reload returns to idle. This is an explicit spec decision for low-stakes rest periods.

## How to Verify

### Manual Testing

1. **Start the app**:
   ```bash
   cd backend && make run &
   cd frontend && npm run dev
   ```

2. **Set a short break** (for testing): Open Settings → set Break Minutes to 1.

3. **Test automatic break transition**:
   - Set Focus Minutes to 1 (for quick testing)
   - Click Start, wait for focus countdown to reach 0:00
   - Verify: Timer immediately shows "BREAK" label with teal colour
   - Verify: Countdown starts from 01:00 (1 minute)

4. **Test break completion**:
   - Wait for break countdown to reach 0:00
   - Verify: Timer returns to "Idle" state
   - Verify: "Break over — ready when you are" notification appears
   - Verify: Start button is available

5. **Test skip break**:
   - Complete another focus session to enter break
   - Click "Skip Break" during the break countdown
   - Verify: Timer immediately returns to "Idle"
   - Verify: No "Break over" notification shown
   - Verify: Start button is available

### Automated Testing

```bash
cd frontend && npx vitest run
```

## Dependencies

- No new npm packages required
- No backend changes required
- Depends on existing `break_minutes` setting (already implemented)
