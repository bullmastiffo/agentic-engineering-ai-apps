# Implementation Plan: Break Timer

**Branch**: `002-break-timer` | **Date**: 2025-07-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-break-timer/spec.md`

## Summary

When a focus session completes (countdown reaches 0:00), the app automatically transitions into a break countdown using the user's configured `break_minutes` duration. The break state is visually distinct (new colour theme), displays a "BREAK" label, and counts down in real time. When the break finishes naturally, the timer returns to idle and shows a "Break over — ready when you are" notification. Users can skip the break early via a "Skip Break" button, which returns to idle immediately without a notification. This is a **frontend-only** feature — no backend changes are required. The existing `break_minutes` setting (already stored in the database and returned by the settings endpoint) provides the duration.

**Technical approach**: Extend the existing Zustand timer store (`useTimerStore`) with a new `'break'` status in the `TimerStatus` union type. Reuse the same `setInterval`-based tick mechanism and wall-clock timestamp computation (`computeRemaining`) that powers the focus countdown. Add a `'break'` data-status CSS theme with a teal/cyan colour token. Add a "Skip Break" button to the `Controls` component and a break-over notification to the `TimerDisplay` or `App` component.

## Technical Context

**Language/Version**: TypeScript 5.5.3 (frontend), Python 3.11 (backend — no changes)
**Primary Dependencies**: React 18.3.1, Zustand 4.5.2, Vite 5.4.1
**Storage**: SQLite via aiosqlite (backend — no changes needed)
**Testing**: Vitest + React Testing Library (frontend), pytest + httpx (backend — no new tests needed)
**Target Platform**: Web browser (localhost SPA served by Vite dev server / static build)
**Project Type**: Web application (React SPA + FastAPI backend)
**Performance Goals**: Break countdown must maintain < 1 second drift (same as focus timer); Skip Break response < 1 second (synchronous state update)
**Constraints**: Frontend-only changes; no new API endpoints; no database schema changes; break state is ephemeral (not persisted across page reloads)
**Scale/Scope**: Single-user local app; ~5 files modified, ~2 new test files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Compliance | Notes |
|---|-----------|------------|-------|
| I | Focus-First Design | ✅ PASS | "Skip Break" is a secondary action, visually subordinate to the primary timer display. Only break-relevant controls shown during break state. No noisy animations. |
| II | Predictable & Deterministic Behavior | ⚠️ JUSTIFIED DEVIATION | Break state is **not** persisted and is lost on page reload. This is an **explicit spec decision** (see Spec § Edge Cases and Assumptions): breaks are short, low-stakes rest periods with no data to preserve. Focus sessions (which are high-stakes) remain fully persisted. Break countdown still uses wall-clock timestamps for accuracy during a session. |
| III | User Trust Through Honest Reporting | ✅ PASS | Breaks are not tracked in session history per spec. No inflation of focus time — break time is a separate, non-recorded rest period. |
| IV | Privacy by Default | ✅ PASS | No new network calls, no external services. Frontend-only state change. |
| V | Accessibility First | ✅ PASS (with requirements) | "Skip Break" button must be keyboard-operable (Tab/Enter/Space), have meaningful ARIA label, and visible focus state. Break colour must meet 4.5:1 contrast ratio. Timer display already has `role="timer"` and `role="status"`. |
| VI | Readable Over Clever | ✅ PASS | Extends existing patterns (same tick mechanism, same Zustand store). No new abstractions introduced. |
| VII | Small, Composable Components | ✅ PASS | Business logic stays in `useTimerStore` hook. UI components (`Controls`, `TimerDisplay`) receive state as props. No component exceeds 150 lines. |
| VIII | Typed Boundaries | ✅ PASS | `TimerStatus` union type extended with `'break'`. All new state fields are strictly typed. No `any` types. |
| IX | Single Source of Truth for Timer State | ✅ PASS | Break state is managed exclusively in `useTimerStore`. UI components read from the store and do not maintain local copies. All break transitions go through store actions. |

**Gate result: PASS** — One justified deviation (Principle II) with explicit spec rationale.

## Project Structure

### Documentation (this feature)

```text
specs/002-break-timer/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (skipped — no new external interfaces)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── hooks/
│   │   └── useTimerService.ts     # Modified: add 'break' status, break transitions, skip action
│   ├── components/
│   │   ├── Controls.tsx           # Modified: add "Skip Break" button for break state
│   │   ├── TimerDisplay.tsx       # Modified: add "BREAK" label, break-over notification
│   │   └── __tests__/
│   │       ├── Controls.test.tsx          # Modified: add break state button tests
│   │       ├── TimerDisplay.test.tsx      # Modified: add break display tests
│   │       └── useTimerService.test.ts    # New: timer store break transition tests
│   ├── App.tsx                    # Modified: wire break-over notification display
│   └── index.css                  # Modified: add break colour theme (teal/cyan)
```

**Structure Decision**: Web application structure (Option 2). This feature modifies only the `frontend/` tree. No backend changes per FR-012.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Principle II: Break not persisted | Breaks are short (1–120 min), low-stakes rest periods. Persisting break state would require new backend endpoints and database schema for negligible user value. | Spec explicitly states: "reopening the app returns to idle state. This is acceptable because breaks are short, low-stakes rest periods." |
