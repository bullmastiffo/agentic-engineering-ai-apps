# Workshop: Personal Focus Timer

Welcome to the Spec-Driven Development (SDD) workshop. This directory contains **two realistic
bugs** and **one new feature** to implement in the Personal Focus Timer application.

The goal is not just to fix bugs or add features — it's to practise the **speckit workflow**:
using spec artifacts and AI-assisted commands to diagnose, document, and verify changes before
writing a single line of code.

---

## The SDD Workflow

Both bug fixes and new features follow the same five-command pipeline:

```
1. SPECIFY   → encode the behaviour as a user story with acceptance criteria  (/speckit.specify)
2. CLARIFY   → resolve any open questions before committing to a design        (/speckit.clarify)
3. PLAN      → translate the spec into a technical design                     (/speckit.plan)
4. TASKS     → break the plan into ordered, parallelizable implementation steps (/speckit.tasks)
5. IMPLEMENT → execute the task list; speckit writes tests, applies changes,
               and runs verification automatically                             (/speckit.implement)
```

Each exercise file shows exactly which command to run and what to type at each stage.

---

## Branching Strategy

Each exercise runs on its own isolated branch. Speckit creates the branch and saves spec
artifacts automatically when you run the first speckit command for that exercise — you don't
need to do anything manually.

| Exercise | Branch (created by speckit) | Spec folder (populated by speckit) |
|----------|-----------------------------|-------------------------------------|
| Bug 01     | `workshop/bug-01-session-list-order-overflow` | `specs/bug-01-session-list-order-overflow/` |
| Bug 02     | `workshop/bug-02-inflate-total`               | `specs/bug-02-inflate-total/` |
| Feature 01 | `workshop/feature-01-break-timer`             | `specs/feature-01-break-timer/` |

---

## Bugs

| # | File | Title | Component | Branch | Speckit Focus |
|---|------|-------|-----------|--------|---------------|
| 1 | [bug-01-session-list-order-overflow.md](bugs/bug-01-session-list-order-overflow.md) | Session List Order & Overflow | Frontend | `workshop/bug-01-session-list-order-overflow` | `/speckit.specify` → `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` |
| 2 | [bug-02-inflate-total.md](bugs/bug-02-inflate-total.md) | Today's Total Includes Active Session Time | Backend | `workshop/bug-02-inflate-total` | `/speckit.specify` → `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` |

---

## Features

| # | File | Title | Component | Branch | Speckit Focus |
|---|------|-------|-----------|--------|---------------|
| 1 | [feature-01-break-timer.md](features/feature-01-break-timer.md) | Break Timer | Frontend | `workshop/feature-01-break-timer` | `/speckit.specify` → `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` |

---

## The SDD Specification Pipeline

The SDD methodology is significantly enhanced through three commands that automate the
specification → planning → tasking workflow.

### `/speckit.specify`

Transforms a simple feature description into a complete, structured specification with automatic
repository management:

- **Automatic feature numbering** — scans existing specs to determine the next feature number (e.g., `001`, `002`, `003`)
- **Branch creation** — generates a semantic branch name from your description and creates it automatically
- **Template-based generation** — copies and fills the feature specification template with your requirements
- **Directory structure** — creates the `specs/[branch-name]/` directory ready for all related documents

### `/speckit.plan`

Once a feature specification exists, creates a comprehensive implementation plan:

- **Specification analysis** — reads and understands the feature requirements, user stories, and acceptance criteria
- **Constitutional compliance** — ensures alignment with project constitution and architectural principles
- **Technical translation** — converts business requirements into technical architecture and implementation details
- **Detailed documentation** — generates supporting documents for data models, API contracts, and test scenarios
- **Quickstart validation** — produces a quickstart guide capturing key validation scenarios

### `/speckit.tasks`

After a plan is created, analyzes the plan and related design documents to generate an executable task list:

- **Inputs** — reads `plan.md` (required) and, if present, `data-model.md`, `contracts/`, and `research.md`
- **Task derivation** — converts contracts, entities, and scenarios into specific tasks
- **Parallelization** — marks independent tasks `[P]` and outlines safe parallel groups
- **Output** — writes `tasks.md` in the feature directory, ready for execution by a task agent

---

## Speckit Commands Quick Reference

| Command | When to use it |
|---------|----------------|
| `/speckit.specify` | Encode a new or corrected behaviour as a user story with acceptance criteria |
| `/speckit.clarify` | Ask targeted questions about an underspecified behaviour before writing code |
| `/speckit.plan` | Translate a completed spec into a technical implementation plan |
| `/speckit.tasks` | Break a plan into concrete, ordered, parallelizable implementation tasks |
| `/speckit.implement` | Execute the task list — writes tests, applies changes, and runs verification |
| `/speckit.checklist` | Generate a verification checklist for a specific change |
| `/speckit.analyze` | Audit consistency between spec, plan, and tasks after making changes |

---

## Running Tests

**Backend**:
```bash
cd backend
.venv\Scripts\activate   # Windows
source .venv/bin/activate  # macOS/Linux
pytest tests/ -v
```

**Frontend**:
```bash
cd frontend
npm test
```

**Linting & type checks** (run these before opening a PR):
```bash
# Backend
ruff check src/ tests/ && mypy src/

# Frontend
npm run lint && npm run typecheck
```
