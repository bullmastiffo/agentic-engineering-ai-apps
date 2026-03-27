# Feature Specification: Break Timer

**Feature Branch**: `002-break-timer`  
**Created**: 2025-07-17  
**Status**: Draft  
**Input**: User description: "As a user, when my focus session completes I want the app to automatically start a break countdown using my configured break duration, so I know exactly how long to rest before the next session. I should be able to skip the break early if I want to start sooner."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatic Break Countdown After Session Completion (Priority: P1)

As a user who has just completed a focus session, I want the app to automatically transition into a break countdown so that I have a clear, timed rest period without needing to take any action.

When my focus session countdown reaches 0:00, the timer immediately switches to a "Break" state and begins counting down from my configured break duration (the `break_minutes` value I set in the Settings modal). The timer display clearly shows the label "BREAK" so I can tell at a glance that I'm in a rest period, not a focus session. The countdown ticks down in real time, showing minutes and seconds remaining in my break.

**Why this priority**: This is the core value proposition of the feature. Without automatic break transitions, users must manually track their rest time, which undermines the purpose of a structured focus-break cycle. This story delivers the fundamental behaviour that all other stories build upon.

**Independent Test**: Can be fully tested by completing a focus session and observing that the timer transitions to BREAK state with a countdown from the configured break duration. Delivers the core rest-tracking value.

**Acceptance Scenarios**:

1. **Given** a focus session is running and the countdown reaches 0:00, **When** the session completes, **Then** the timer transitions to BREAK state and begins counting down from the user's configured `break_minutes` value
2. **Given** the timer is in BREAK state, **When** the user views the timer display, **Then** the label reads "BREAK" and the countdown shows minutes and seconds remaining
3. **Given** the user has configured `break_minutes` to 10 in settings, **When** a focus session completes, **Then** the break countdown starts from 10:00

---

### User Story 2 - Break Completion Returns to Idle (Priority: P1)

As a user whose break countdown has reached zero, I want the app to return to the idle state and show a subtle notification so I know my break is over and I can start a new focus session when ready.

When the break countdown reaches 0:00, the timer automatically transitions back to the idle state. A brief, non-intrusive notification appears with the message "Break over — ready when you are" to let me know the break has ended naturally. From this point I can start a new focus session whenever I choose.

**Why this priority**: Equal priority to Story 1 because the break must have a defined end to be useful. Without returning to idle, users would be stuck in a break state with no clear path forward.

**Independent Test**: Can be tested by letting a break countdown run to completion and verifying the timer returns to idle with a notification message displayed.

**Acceptance Scenarios**:

1. **Given** the timer is in BREAK state and the countdown reaches 0:00, **When** the break completes, **Then** the timer transitions to IDLE state
2. **Given** the break countdown just reached 0:00, **When** the timer returns to idle, **Then** a notification reading "Break over — ready when you are" is displayed to the user
3. **Given** the timer has returned to idle after a break, **When** the user views the controls, **Then** the Start button is available to begin a new focus session

---

### User Story 3 - Skip Break Early (Priority: P2)

As a user who is currently in a break but wants to resume working sooner, I want to skip the remaining break time so I can start a new focus session immediately without waiting for the countdown to finish.

During the break countdown, a "Skip Break" button is visible. Clicking it ends the break immediately, returning the timer to idle. No notification is shown because the user intentionally ended the break. The Start button becomes available so I can begin a new session right away.

**Why this priority**: Important for user autonomy and flexibility, but the break timer is functional without it. Some users may feel ready to work before the break ends, and forcing them to wait would be frustrating.

**Independent Test**: Can be tested by starting a break (after a session completes), clicking "Skip Break" mid-countdown, and verifying the timer returns to idle immediately.

**Acceptance Scenarios**:

1. **Given** the timer is in BREAK state with time remaining, **When** the user clicks "Skip Break", **Then** the timer immediately transitions to IDLE state
2. **Given** the timer is in BREAK state, **When** the user views the controls, **Then** a "Skip Break" button is visible
3. **Given** the user has skipped a break, **When** the timer returns to idle, **Then** no "Break over" notification is shown

---

### Edge Cases

- What happens when `break_minutes` is set to its minimum value (1 minute)? The break countdown should still run normally from 1:00 to 0:00.
- What happens when `break_minutes` is set to its maximum value (120 minutes)? The break countdown should display correctly (e.g., 120:00) and count down without issue.
- What happens if the user changes `break_minutes` in Settings while a break is already in progress? The current break continues with its original duration; the new value applies to the next break.
- What happens if the user closes and reopens the app during a break? The break is a purely frontend countdown with no backend persistence, so reopening the app returns to idle state. This is acceptable because breaks are short, low-stakes rest periods.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST automatically transition the timer from the completed state to a BREAK state when a focus session countdown reaches 0:00
- **FR-002**: System MUST start a break countdown from the user's configured `break_minutes` value when entering BREAK state
- **FR-003**: System MUST display the label "BREAK" on the timer during the break countdown so users can distinguish it from a focus session
- **FR-004**: System MUST count down the break timer in real time, displaying remaining minutes and seconds
- **FR-005**: System MUST transition the timer to IDLE state when the break countdown reaches 0:00
- **FR-006**: System MUST display a notification with the message "Break over — ready when you are" when a break completes naturally (countdown reaches zero)
- **FR-007**: System MUST display a "Skip Break" button during the BREAK state
- **FR-008**: System MUST transition the timer to IDLE state immediately when the user clicks "Skip Break"
- **FR-009**: System MUST NOT display the "Break over" notification when the user skips a break manually
- **FR-010**: System MUST visually differentiate the break state from the focus (running) state using a distinct colour theme
- **FR-011**: System MUST make the Start button available after the timer returns to IDLE from a break (whether completed or skipped)
- **FR-012**: System MUST NOT require any backend changes — the break countdown is a frontend-only timer using the existing `break_minutes` setting returned by the settings endpoint

### Key Entities

- **Break State**: A new timer state representing an active rest period. It has a duration (sourced from the `break_minutes` setting), a remaining-seconds countdown, and a completion trigger (natural expiry or user skip). It exists only in the frontend and is not persisted to the backend.
- **Break Minutes Setting**: An existing user-configurable value (1–120 minutes, default 5) that determines break duration. Already stored in the database, editable via the Settings modal, and returned by the settings endpoint.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users experience zero manual steps between completing a focus session and starting a break — the transition is fully automatic
- **SC-002**: The break countdown displays the correct remaining time (matching the configured `break_minutes`) within 1 second of accuracy at all times
- **SC-003**: Users can skip a break and return to idle in under 1 second (single click, immediate response)
- **SC-004**: 100% of natural break completions result in the "Break over — ready when you are" notification being displayed
- **SC-005**: The break state is visually distinguishable from the focus state — users can identify whether they are in a break or focus session at a glance
- **SC-006**: The full focus-break cycle (start session → complete → break → idle) works without any page reload or manual intervention

## Assumptions

- The `break_minutes` setting is already available in the frontend via the existing settings endpoint and does not need to be fetched separately
- The break countdown is entirely a frontend concern — no new backend endpoints, database changes, or session records are needed for breaks
- Break periods are not persisted or tracked in session history; only focus sessions are recorded
- The break countdown uses the same timing mechanism as the focus countdown (interval-based tick)
- If the app is closed during a break, the break is lost — this is acceptable because breaks are short, low-stakes rest periods with no data to preserve
- The existing colour palette will be extended with one new colour token (e.g., a teal/cyan shade) to differentiate the break state from focus and idle states
- The notification for break completion is a subtle, in-app visual message — not a browser notification or system alert
