# Data Model: Break Timer

**Feature**: 002-break-timer | **Date**: 2025-07-17

## Overview

This feature is **frontend-only** (FR-012). No backend database schema changes, no new API endpoints, no new backend models. The break state is ephemeral frontend state managed in the existing Zustand timer store.

## Entity Changes

### Modified Entity: TimerStatus (Frontend)

**File**: `frontend/src/hooks/useTimerService.ts`

**Current definition**:
```ts
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed' | 'stopped_early';
```

**New definition**:
```ts
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed' | 'stopped_early' | 'break';
```

### Modified Entity: TimerState (Frontend)

**File**: `frontend/src/hooks/useTimerService.ts`

**New field added**:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `breakNotification` | `string \| null` | `null` | Notification message shown after natural break completion. Set to `"Break over — ready when you are"` when break countdown reaches 0:00. Cleared when user starts a new session. |

**Existing fields reused during break state**:

| Field | Value During Break | Description |
|-------|-------------------|-------------|
| `status` | `'break'` | Identifies timer is in break countdown |
| `startAt` | `Date.now()` at break start | Wall-clock timestamp for `computeRemaining` |
| `configuredSeconds` | `settings.break_minutes * 60` | Total break duration in seconds |
| `pausedSeconds` | `0` | Breaks cannot be paused |
| `pausedAt` | `null` | Breaks cannot be paused |
| `sessionId` | `null` | No backend session for breaks |
| `remainingSeconds` | Computed each tick | Countdown display value |

### Modified Entity: TimerActions (Frontend)

**File**: `frontend/src/hooks/useTimerService.ts`

**New action added**:

| Action | Signature | Description |
|--------|-----------|-------------|
| `skipBreak` | `() => void` | Immediately transitions from `'break'` to `'idle'` state. Clears all timer fields. Does NOT set `breakNotification` (FR-009). |

**Modified actions**:

| Action | Change | Description |
|--------|--------|-------------|
| `tick` | Extended | Now also handles `status === 'break'`: computes remaining time, transitions to `'idle'` when reaching 0, and sets `breakNotification`. |
| `startSession` | Extended | Clears `breakNotification` when starting a new session. |

### Existing Entity: SettingsResponse (No Changes)

**Frontend type** (`frontend/src/api/types.ts`):
```ts
export interface SettingsResponse {
  focus_minutes: number;
  break_minutes: number;  // Already exists, range 1-120, default 5
}
```

**Backend model** (`backend/src/models.py`):
```py
class SettingsResponse(BaseModel):
    focus_minutes: int
    break_minutes: int  # Already exists, no changes needed
```

**Database** (`backend/src/database.py`):
```sql
-- Already exists, no changes needed
break_minutes INTEGER NOT NULL DEFAULT 5 CHECK(break_minutes BETWEEN 1 AND 120)
```

## State Transitions

```
                    ┌─────────────────────────────────┐
                    │                                 │
                    ▼                                 │
              ┌──────────┐     start()          ┌─────────┐
              │   IDLE   │ ──────────────────►  │ RUNNING │
              └──────────┘                      └─────────┘
                ▲      ▲                          │     │
                │      │                    pause │     │ tick (remaining ≤ 0)
                │      │                          ▼     │
                │      │                      ┌────────┐│
                │      │                      │ PAUSED ││
                │      │                      └────────┘│
                │      │                        │ resume│
                │      │                        ▼       │
                │      │               back to RUNNING  │
                │      │                                │
                │      │    stop()                      │
                │      ├──────────────── STOPPED_EARLY  │
                │      │                                │
                │      │                                ▼
                │      │                         ┌────────────┐
                │      │      (auto-transition)  │ COMPLETED  │
                │      │                         │ (transient)│
                │      │                         └────────────┘
                │      │                                │
                │      │                                │ (immediate, in same tick callback)
                │      │                                ▼
                │      │                          ┌──────────┐
                │      │                          │  BREAK   │
                │      │                          └──────────┘
                │      │                            │      │
                │      │          tick (remaining ≤ 0)      │ skipBreak()
                │      │            + notification │        │ (no notification)
                │      │                           │        │
                │      └───────────────────────────┘        │
                └───────────────────────────────────────────┘
```

**Key transitions for this feature**:

1. **COMPLETED → BREAK** (automatic, in `tick()` callback):
   - Trigger: Focus session countdown reaches 0, backend complete API call succeeds
   - Action: Set break state fields from `settings.break_minutes`
   - Note: `COMPLETED` is transient — it is set internally during the complete API call but transitions immediately to `BREAK` before the next render

2. **BREAK → IDLE** (natural completion, in `tick()`):
   - Trigger: Break countdown reaches 0
   - Action: Clear all timer fields, set `breakNotification = "Break over — ready when you are"`

3. **BREAK → IDLE** (user skip, via `skipBreak()` action):
   - Trigger: User clicks "Skip Break" button
   - Action: Clear all timer fields, `breakNotification` remains `null` (FR-009)

4. **IDLE (with notification) → RUNNING** (user starts new session):
   - Action: Normal `startSession()` flow + clear `breakNotification`

## Validation Rules

| Rule | Source | Enforcement |
|------|--------|-------------|
| `break_minutes` range: 1–120 | Backend `SettingsRequest` model | Backend Pydantic validation (already exists) |
| `break_minutes` default: 5 | Database schema | SQLite DEFAULT constraint (already exists) |
| Break cannot be paused | Feature design decision | `pauseSession()` checks `status !== 'break'` (guard) |
| Break cannot be stopped | Feature design decision | `stopSession()` checks `status !== 'break'` (guard) |
| Skip only during break | Feature design decision | `skipBreak()` checks `status === 'break'` (guard) |

## No Backend Changes Required

Per FR-012, this feature requires:
- ❌ No new database tables or columns
- ❌ No new API endpoints
- ❌ No changes to existing backend models
- ❌ No changes to existing backend services
- ❌ No changes to existing backend tests

The `break_minutes` setting already exists in:
- Database: `settings.break_minutes` column (1–120, default 5)
- Backend model: `SettingsResponse.break_minutes`
- Backend API: `GET /settings` returns `break_minutes`
- Frontend type: `SettingsResponse.break_minutes`
- Frontend store: `settings.break_minutes` in `useTimerStore`
