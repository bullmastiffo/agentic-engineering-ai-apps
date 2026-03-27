# Research: Break Timer

**Feature**: 002-break-timer | **Date**: 2025-07-17

## R1: How to extend the timer state machine with a 'break' status

**Decision**: Add `'break'` to the existing `TimerStatus` union type and manage all break state within the same `useTimerStore` Zustand store.

**Rationale**: The timer store already owns all timer state (Principle IX — Single Source of Truth). Adding `'break'` as another status value keeps the state machine flat and understandable. The break countdown reuses the same `computeRemaining` approach (wall-clock timestamp computation) that the focus timer uses, ensuring consistency with Principle II.

**Alternatives considered**:
- **Separate break store/hook**: Rejected because it would create a second source of truth for timer state, violating Principle IX and requiring cross-store synchronization.
- **Local component state for break**: Rejected because it would place business logic in the UI layer, violating Principle VII (Small, Composable Components — business logic in hooks, not JSX).

**Implementation detail**: The break needs its own set of timestamp fields. Rather than adding separate `breakStartAt` / `breakConfiguredSeconds` fields, the existing `startAt` and `configuredSeconds` fields can be repurposed during break state. When transitioning from `completed` → `break`, the store sets:
- `status: 'break'`
- `startAt: Date.now()` (break start timestamp)
- `configuredSeconds: settings.break_minutes * 60`
- `pausedSeconds: 0` (breaks cannot be paused)
- `pausedAt: null`
- `sessionId: null` (no backend session for breaks)

This allows `computeRemaining` to work unchanged for the break countdown. When the break ends (naturally or via skip), these fields are cleared to `null` and status returns to `'idle'`.

## R2: Focus-to-break transition mechanism

**Decision**: Modify the `tick()` action's auto-complete logic. After successfully completing a focus session (POST `/sessions/{id}/complete` succeeds), instead of setting `status: 'completed'`, initiate the break countdown by setting the break state fields and `status: 'break'`.

**Rationale**: The transition must be automatic with zero manual steps (SC-001). The `tick()` function is already the point where session completion is detected, making it the natural place to trigger the break transition.

**Alternatives considered**:
- **Effect-based transition** (React `useEffect` watching for `completed` status): Rejected because it introduces a render cycle delay between `completed` and `break` states, creating a visible flash of "Completed" UI. Also adds complexity.
- **Two-phase: briefly show `completed`, then auto-transition**: Rejected because the spec says the transition should be immediate ("the timer immediately switches to a Break state") with no intermediate state visible.

**Implementation detail**: The `.then()` callback in `tick()` currently does:
```ts
set({ status: 'completed', remainingSeconds: 0 });
```
This will change to:
```ts
const { settings } = get();
set({
  status: 'break',
  sessionId: null,
  startAt: Date.now(),
  configuredSeconds: settings.break_minutes * 60,
  pausedSeconds: 0,
  pausedAt: null,
  remainingSeconds: settings.break_minutes * 60,
});
```

## R3: Break countdown tick behaviour

**Decision**: Extend the existing `tick()` function to handle `status === 'break'` using the same `computeRemaining` logic as the focus countdown.

**Rationale**: Reusing the same mechanism ensures consistent accuracy and avoids code duplication (Principle VI — Readable Over Clever). The `computeRemaining` function is timestamp-based, which maintains < 1 second drift (Constitution: Performance & Reliability → Timer accuracy).

**Alternatives considered**:
- **Separate tick function for breaks**: Rejected because it duplicates logic and creates maintenance burden.
- **requestAnimationFrame instead of setInterval**: Rejected because the existing 200ms setInterval approach works well and is consistent with the focus timer.

**Implementation detail**: The `tick()` guard currently checks `status !== 'running'`. This will be expanded to also process `status === 'break'`. When break remaining reaches 0, the tick sets status to `'idle'` and sets a `breakNotification` flag.

## R4: Break-over notification approach

**Decision**: Add a `breakNotification` field to the store (`string | null`). When a break completes naturally, set it to `"Break over — ready when you are"`. Display this as an inline notification element (similar to the offline banner pattern). The notification is cleared when the user starts a new session.

**Rationale**: The spec says "A brief, non-intrusive notification" and the Assumptions section confirms "The notification for break completion is a subtle, in-app visual message — not a browser notification or system alert." The offline banner pattern already exists in the codebase and provides a tested, accessible (ARIA `role="alert"`) inline notification approach.

**Alternatives considered**:
- **Toast library** (react-toastify, etc.): Rejected because no toast library is currently in the project, adding one introduces unnecessary dependency for a single notification.
- **Browser Notification API**: Rejected because the spec explicitly says the notification is "in-app visual" not a system alert.
- **Temporary CSS animation that auto-dismisses**: Rejected because it requires timer-based auto-dismiss logic and the user might miss it. Better to persist until the next action.

## R5: "Skip Break" button styling and placement

**Decision**: Add a `'break'` branch to the `Controls` component that renders a single "Skip Break" button with `btn-secondary` styling (visually subordinate to the timer display).

**Rationale**: Constitution Principle I (Focus-First Design) requires that secondary actions are "visually subordinate and never compete with the primary action." During a break, the primary element is the countdown display; "Skip Break" is secondary. Using `btn-secondary` (outlined, not filled) matches the existing pattern for secondary actions (e.g., the Pause button during focus).

**Alternatives considered**:
- **Using `btn-primary` for Skip Break**: Rejected because it would compete visually with the timer display, violating Principle I.
- **Placing Skip Break as a small link instead of button**: Rejected because it reduces keyboard accessibility and discoverability.

## R6: Break state colour theme

**Decision**: Add a `--teal` colour token (`#0ea5a5`) and corresponding CSS rules for `data-status="break"`. This includes teal status text, teal-tinted gradient ring, and teal countdown text.

**Rationale**: The spec requires the break state be "visually differentiated from the focus (running) state" (FR-010) and the Assumptions confirm "The existing colour palette will be extended with one new colour token (e.g., a teal/cyan shade)." The existing pattern uses `data-status` attributes for state-specific styling, so adding `data-status="break"` rules follows the established approach.

**Colour choice rationale**: Teal/cyan (`#0ea5a5`) provides:
- Clear differentiation from tomato red (focus/running) and amber (paused)
- Associations with rest, calm, and refreshment
- Sufficient contrast ratio against the cream background (> 4.5:1, meeting WCAG AA per Principle V)

**Alternatives considered**:
- **Blue (#3b82f6)**: Viable but too similar to default link colours, potentially confusing.
- **Purple (#7c3aed)**: Viable but lacks the "restful" association of teal.
- **Green**: Already used for "Completed" status, would create confusion.

## R7: Handling edge case — settings change during break

**Decision**: When `break_minutes` changes in settings while a break is in progress, the current break continues with its original duration. The new value takes effect on the next break.

**Rationale**: This is explicitly specified in the Edge Cases section of the spec. Implementing this is automatic with the current approach because `configuredSeconds` is set at break start time from the settings value at that moment. Subsequent settings changes update `settings.break_minutes` but don't retroactively modify `configuredSeconds`.

## R8: Timer display for break durations > 99 minutes

**Decision**: The existing `formatTime` function in `TimerDisplay.tsx` uses `Math.floor(s / 60)` which correctly handles values > 99 minutes (e.g., 120 minutes → `"120:00"`). No changes needed to the formatting function.

**Rationale**: The spec edge case notes that `break_minutes` can be up to 120. The current `padStart(2, '0')` for minutes would display `"120"` correctly (padStart only adds padding if the string is shorter than the target length). Verified: `String(120).padStart(2, '0')` → `"120"` ✓.

## R9: Hydration and page reload during break

**Decision**: No special hydration logic for breaks. On page reload, `hydrate()` fetches `/sessions/active` from the backend. Since breaks are not persisted, the backend returns no active session, and the frontend defaults to `idle` state.

**Rationale**: The spec explicitly states: "reopening the app returns to idle state. This is acceptable because breaks are short, low-stakes rest periods." This is also the justified Principle II deviation documented in the Constitution Check.
