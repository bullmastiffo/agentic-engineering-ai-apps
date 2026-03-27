# Tasks: Break Timer

**Input**: Design documents from `/specs/002-break-timer/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅
**Contracts**: None (frontend-only feature, no new external interfaces)

**Tests**: Included — plan.md explicitly scopes test files as part of the feature deliverable.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` (frontend — all changes), `backend/` (no changes per FR-012)

---

## Phase 1: Foundational (Type & Style Foundation)

**Purpose**: Extend the type system, state shape, and CSS theme to support the new `'break'` status. These changes are prerequisites for ALL user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T001 Extend TimerStatus union type with `'break'`, add `breakNotification` state field (`string | null`, default `null`) to TimerState interface, add `skipBreak: () => void` action signature to TimerActions interface, and initialise `breakNotification: null` in the store's initial state in `frontend/src/hooks/useTimerService.ts`
- [ ] T002 [P] Add `--teal: #0ea5a5` colour token to `:root`, add `data-status="break"` CSS rules for `.timer-status` (teal text), `.timer-countdown` (teal text), and `.timer-display::before` (teal-tinted gradient ring `radial-gradient(circle, #e0f7f7 0%, transparent 70%)`) in `frontend/src/index.css`
- [ ] T003 [P] Add `'break': 'Break'` entry to the `STATUS_LABELS` record in `frontend/src/components/TimerDisplay.tsx`

**Checkpoint**: TypeScript compiles with the new `'break'` status. Timer card renders teal theme when `data-status="break"`. STATUS_LABELS covers all TimerStatus values.

---

## Phase 2: User Story 1 — Automatic Break Countdown After Session Completion (Priority: P1) 🎯 MVP

**Goal**: When a focus session countdown reaches 0:00, the timer automatically transitions to a "Break" state and counts down from the user's configured `break_minutes` value.

**Independent Test**: Complete a focus session (set focus_minutes to 1 for speed) → verify timer shows "Break" label with teal colour theme → verify countdown starts from configured break_minutes value and ticks down in real time.

### Implementation for User Story 1

- [ ] T004 [US1] Modify the `tick()` action's auto-complete `.then()` callback: instead of `set({ status: 'completed', remainingSeconds: 0 })`, read `settings.break_minutes` from the store via `get()` and set break state fields (`status: 'break'`, `sessionId: null`, `startAt: Date.now()`, `configuredSeconds: settings.break_minutes * 60`, `pausedSeconds: 0`, `pausedAt: null`, `remainingSeconds: settings.break_minutes * 60`) in `frontend/src/hooks/useTimerService.ts`
- [ ] T005 [US1] Extend the `tick()` guard to also process `status === 'break'`: add a second code path that computes remaining time using `computeRemaining(startAt, configuredSeconds, pausedSeconds, pausedAt)` and updates `remainingSeconds` on each tick interval in `frontend/src/hooks/useTimerService.ts`
- [ ] T006 [US1] Add guards to `pauseSession()` and `stopSession()` to return early when `status === 'break'` (breaks cannot be paused or stopped, only skipped) in `frontend/src/hooks/useTimerService.ts`

**Checkpoint**: At this point, completing a focus session triggers an automatic break countdown. The timer shows "Break" with teal styling and ticks down from the configured break duration. User Story 1 is fully functional and testable independently.

---

## Phase 3: User Story 2 — Break Completion Returns to Idle (Priority: P1)

**Goal**: When the break countdown reaches 0:00, the timer returns to idle state and displays a "Break over — ready when you are" notification.

**Independent Test**: Let a break countdown run to 0:00 → verify timer returns to "Idle" state → verify notification "Break over — ready when you are" appears → verify Start button is available → start a new session → verify notification clears.

### Implementation for User Story 2

- [ ] T007 [US2] Extend the `tick()` break processing branch: when `remaining <= 0`, transition to idle (`status: 'idle'`, clear all timer fields to `null`) and set `breakNotification: 'Break over — ready when you are'` in `frontend/src/hooks/useTimerService.ts`
- [ ] T008 [US2] Extend `startSession()` to clear `breakNotification` (set to `null`) at the start of the action, before the API call, so the notification disappears when the user begins a new focus session in `frontend/src/hooks/useTimerService.ts`
- [ ] T009 [P] [US2] Add break-over notification banner in `frontend/src/App.tsx`: destructure `breakNotification` from `useTimerService()`, render a `<div className="break-notification" role="alert" aria-live="assertive">` containing the `breakNotification` text, conditionally displayed when `breakNotification !== null`, positioned between the offline banner and the header
- [ ] T010 [P] [US2] Add `.break-notification` CSS styles in `frontend/src/index.css`: follow the existing `.offline-banner` pattern with teal colour scheme (`background: #e0f7f7`, `color: #0a6e6e`, `border: 1px solid var(--teal)`), centered text, rounded corners, matching spacing

**Checkpoint**: At this point, the full focus → break → idle cycle works end-to-end. Natural break completion shows the notification, and starting a new session clears it. User Stories 1 AND 2 are both fully functional.

---

## Phase 4: User Story 3 — Skip Break Early (Priority: P2)

**Goal**: During a break, the user can click "Skip Break" to immediately return to idle without waiting for the countdown to finish. No notification is shown on skip (FR-009).

**Independent Test**: Complete a focus session to enter break → click "Skip Break" mid-countdown → verify timer immediately returns to "Idle" → verify no "Break over" notification appears → verify Start button is available.

### Implementation for User Story 3

- [ ] T011 [US3] Implement the `skipBreak` action in the Zustand store: guard `status === 'break'`, transition to idle (`status: 'idle'`, clear `sessionId`, `startAt`, `configuredSeconds`, `pausedSeconds`, `pausedAt`, `remainingSeconds` to `null`), leave `breakNotification` as `null` (FR-009: no notification on manual skip) in `frontend/src/hooks/useTimerService.ts`
- [ ] T012 [P] [US3] Add `onSkipBreak` prop to the `Props` interface and add a `status === 'break'` rendering branch that shows a single "Skip Break" button with `className="btn btn-secondary"` and `aria-label="Skip break and return to idle"` in `frontend/src/components/Controls.tsx`
- [ ] T013 [P] [US3] Wire `skipBreak` store action to the Controls component: destructure `skipBreak` from `useTimerService()` and pass it as `onSkipBreak={() => { skipBreak(); }}` prop to `<Controls>` in `frontend/src/App.tsx`

**Checkpoint**: All three user stories are now independently functional. The complete focus → break → idle cycle works with both natural completion and manual skip.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Automated tests and final validation across all user stories.

- [ ] T014 [P] Create break transition unit tests in `frontend/src/components/__tests__/useTimerService.test.ts`: test completed→break transition (verify break state fields set from settings.break_minutes), break countdown tick (verify remainingSeconds decreases), break→idle natural completion (verify status becomes 'idle' and breakNotification is set), skipBreak action (verify status becomes 'idle' and breakNotification remains null), pauseSession/stopSession guards during break (verify no state change), startSession clears breakNotification
- [ ] T015 [P] Add break status label display test to existing suite in `frontend/src/components/__tests__/TimerDisplay.test.tsx`: render with `status="break"` and verify `role="status"` has text content "Break"
- [ ] T016 [P] Add break controls tests to existing suite in `frontend/src/components/__tests__/Controls.test.tsx`: verify "Skip Break" button is visible when `status="break"`, verify click calls `onSkipBreak`, verify Start/Pause/Resume/Stop buttons are NOT shown during break state
- [ ] T017 Run quickstart.md validation: execute automated test suite (`cd frontend && npx vitest run`), then perform manual smoke test of the full focus→break→idle cycle and the skip break flow per quickstart.md § How to Verify

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — can start immediately. BLOCKS all user stories.
- **User Story 1 (Phase 2)**: Depends on Phase 1 completion.
- **User Story 2 (Phase 3)**: Depends on Phase 2 completion (break must exist to complete).
- **User Story 3 (Phase 4)**: Depends on Phase 1 completion. Can run in parallel with Phases 2–3 (skipBreak action is independent of tick logic).
- **Polish (Phase 5)**: Depends on Phases 2, 3, and 4 all being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational only. No dependencies on other stories.
- **User Story 2 (P1)**: Depends on User Story 1 (break must exist to complete). Sequential after US1.
- **User Story 3 (P2)**: Depends on Foundational only. **Can be implemented in parallel with US1 and US2** since skipBreak is an independent store action.

### Within Each User Story

- Store/state changes before UI component changes
- Core logic before wiring/integration
- Implementation before tests

### Parallel Opportunities

- **Phase 1**: T002 and T003 can run in parallel (different files, no interdependency)
- **Phase 3**: T009 and T010 can run in parallel (App.tsx and index.css are independent)
- **Phase 4**: T012 and T013 can run in parallel (Controls.tsx and App.tsx are independent)
- **Phase 5**: T014, T015, and T016 can all run in parallel (three different test files)
- **Cross-phase**: Phase 4 (US3) can run in parallel with Phases 2–3 (US1–US2) after Phase 1 completes

---

## Parallel Example: After Phase 1 Completes

```text
# Stream A (sequential): User Story 1 → User Story 2
Task T004: Modify tick() for focus→break transition in useTimerService.ts
Task T005: Extend tick() for break countdown processing in useTimerService.ts
Task T006: Add pause/stop guards during break in useTimerService.ts
  → then →
Task T007: Extend tick() for break→idle transition in useTimerService.ts
Task T008: Clear breakNotification in startSession() in useTimerService.ts
Task T009: Add notification banner in App.tsx          } parallel
Task T010: Add notification CSS in index.css           } parallel

# Stream B (independent): User Story 3
Task T011: Implement skipBreak action in useTimerService.ts
Task T012: Add Skip Break button in Controls.tsx       } parallel
Task T013: Wire skipBreak in App.tsx                   } parallel
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational (T001–T003)
2. Complete Phase 2: User Story 1 (T004–T006)
3. **STOP and VALIDATE**: Complete a focus session → verify automatic break countdown starts with teal theme
4. This delivers the core break timer value

### Incremental Delivery

1. Phase 1: Foundational → Type system and CSS ready
2. Phase 2: User Story 1 → Automatic break countdown works → **MVP!**
3. Phase 3: User Story 2 → Break completes naturally with notification → **Full break lifecycle!**
4. Phase 4: User Story 3 → Skip break for user flexibility → **Feature complete!**
5. Phase 5: Polish → Tests pass, manual validation confirms all flows

### Single Developer Strategy

1. Complete Phases 1 → 2 → 3 → 4 → 5 sequentially
2. Each phase checkpoint validates independently before moving on

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in same phase
- [US1/US2/US3] labels map to spec.md user stories for traceability
- **Frontend-only feature** — no backend changes required (FR-012)
- Break state is ephemeral — not persisted across page reloads (spec § Edge Cases)
- `break_minutes` setting already exists in backend and frontend (1–120, default 5)
- All new UI elements must meet WCAG AA contrast (4.5:1) per Constitution Principle V
- "Skip Break" button uses `btn-secondary` styling per Constitution Principle I (Focus-First Design)
- Commit after each phase checkpoint for clean history
