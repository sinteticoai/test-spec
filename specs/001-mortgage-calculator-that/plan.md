
# Implementation Plan: Mortgage Calculator with Loan Comparison

**Branch**: `001-mortgage-calculator-that` | **Date**: 2025-10-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/cristian/Apps/test-spec/specs/001-mortgage-calculator-that/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code, or `AGENTS.md` for all other agents).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Build a mortgage calculator that allows users to compare two loan options side-by-side. Users can input principal amount, interest rate, loan term, and optional additional costs (property taxes, insurance, HOA, PMI) for each loan. The system displays monthly payments (principal+interest and total), total interest, and total cost, with an optional collapsible amortization schedule. Anonymous access, responsive design using shadcn components and Lucide React icons.

## Technical Context
**Language/Version**: TypeScript with React 19
**Primary Dependencies**: Next.js 15.5.4, shadcn/ui components, Lucide React icons, Tailwind CSS 4
**Storage**: N/A (client-side calculation only, no persistence)
**Testing**: Jest + React Testing Library
**Target Platform**: Web browsers (responsive: mobile, tablet, desktop)
**Project Type**: Single Next.js application with App Router
**Performance Goals**: <100ms calculation latency, smooth animations 60fps, responsive layout breakpoints
**Constraints**: Client-side only (no backend), calculation accuracy to 2 decimal places for currency, blur event triggers calculation
**Scale/Scope**: Single-page application, ~5-10 components, amortization schedules up to 600 payments (50 years)

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Component Architecture ✅
- Server Components by default (calculation logic can be Server Component)
- Client Components only for form inputs and interactive UI (marked with 'use client')
- Single responsibility: separate components for loan input form, results display, amortization table
- Components under 200 lines each
- No prop drilling expected (flat component structure)

### Server-First Pattern ✅
- No data fetching required (pure calculation feature)
- No Server Actions needed (client-side state only)
- Client Components limited to form inputs and collapsible UI elements
- No caching strategy needed (stateless calculations)

### Type Safety ✅
- Strict TypeScript mode enforced
- Explicit types for loan data model (LoanInputs, LoanResults, AmortizationEntry)
- Zod validation for input ranges (FR-007: $1K-$10M, 0.01%-20%, 1-50 years)
- No `any` types

### Code Organization ✅
- `src/app/page.tsx` - main calculator page (Server Component wrapper)
- `src/components/features/` - LoanInputForm, LoanComparison, AmortizationSchedule (Client Components)
- `src/lib/mortgage-calculator.ts` - pure calculation functions
- `src/types/loan.ts` - TypeScript interfaces
- `src/lib/validations.ts` - Zod schemas
- Co-located component tests

### Performance & Optimization ✅
- No images required for calculator UI (icons via Lucide React)
- Geist font already configured in layout
- No dynamic imports needed (small bundle size)
- Static rendering for main page wrapper
- No metadata generation changes required

**Initial Check Result**: PASS - All constitutional requirements satisfied

**Post-Design Re-evaluation**: PASS ✅
- Component structure confirmed: LoanInputForm, LoanComparison, AmortizationSchedule (all <200 lines)
- Pure calculation functions in `lib/` (testable, no side effects)
- Client Components properly marked for interactivity only
- Type definitions complete in `types/loan.ts` with Zod validation
- No deviations from constitution required

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── app/
│   ├── page.tsx                          # Main calculator page (updated)
│   ├── layout.tsx                        # Root layout (existing)
│   └── globals.css                       # Global styles (existing)
├── components/
│   ├── ui/                               # shadcn components (to be added)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── collapsible.tsx
│   └── features/                         # Feature components (new)
│       ├── loan-input-form.tsx           # Loan input form (Client)
│       ├── loan-results.tsx              # Results display
│       ├── loan-comparison.tsx           # Side-by-side comparison (Client)
│       └── amortization-schedule.tsx     # Collapsible schedule (Client)
├── lib/
│   ├── mortgage-calculator.ts            # Core calculation logic (new)
│   ├── validations.ts                    # Zod schemas (new)
│   └── utils.ts                          # Existing utilities
└── types/
    └── loan.ts                           # Loan type definitions (new)

__tests__/
├── lib/
│   └── mortgage-calculator.test.ts       # Unit tests for calculations
└── components/
    └── features/
        ├── loan-input-form.test.tsx
        └── loan-comparison.test.tsx
```

**Structure Decision**: Single Next.js application using App Router. Core calculation logic in `src/lib/` as pure functions (testable, no side effects). UI components split between `ui/` (shadcn primitives) and `features/` (calculator-specific Client Components). Type definitions centralized in `src/types/`. Tests mirror source structure in `__tests__/`.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh codex`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
The `/tasks` command will generate tasks following TDD principles:

1. **Contract Test Tasks** (from `contracts/`):
   - Task: Create contract test files (already generated in contracts/)
   - Task: Verify contract tests fail (RED state)

2. **Type Definition Tasks** (from `data-model.md`):
   - Task: Create `src/types/loan.ts` with LoanInputs, LoanResults, AmortizationEntry interfaces
   - Task: Create `src/lib/validations.ts` with Zod schemas [P]

3. **Core Calculation Tasks** (from `research.md` + contracts):
   - Task: Implement `calculateMonthlyPayment()` in `src/lib/mortgage-calculator.ts`
   - Task: Implement `generateAmortizationSchedule()` [depends on above]
   - Task: Implement `calculateLoanResults()` wrapper [depends on above]
   - Task: Add utility functions (formatCurrency, formatPercentage, isLoanComplete)
   - Task: Verify contract tests pass (GREEN state)

4. **shadcn Component Setup**:
   - Task: Install shadcn/ui components (button, card, input, label, collapsible, separator, alert) [P]
   - Task: Install lucide-react icons [P]

5. **UI Component Tasks** (from spec + data-model):
   - Task: Create `src/components/features/loan-input-form.tsx` (Client Component with validation)
   - Task: Create `src/components/features/loan-results.tsx` (display component)
   - Task: Create `src/components/features/loan-comparison.tsx` (Client Component, parent state) [depends on above two]
   - Task: Create `src/components/features/amortization-schedule.tsx` (collapsible table)

6. **Page Integration Task**:
   - Task: Update `src/app/page.tsx` to use LoanComparison component

7. **Component Test Tasks**:
   - Task: Write tests for LoanInputForm (validation, blur events) [P]
   - Task: Write tests for LoanComparison (state management, rendering) [P]
   - Task: Verify all component tests pass

8. **Responsive Design Tasks**:
   - Task: Implement responsive grid layout (mobile-first, Tailwind breakpoints)
   - Task: Test on mobile (<640px), tablet (768px), desktop (>1024px)

9. **Integration & Validation Tasks**:
   - Task: Execute quickstart.md scenarios 1-10
   - Task: Fix any failing scenarios
   - Task: Run full test suite (`npm test`)
   - Task: Run build validation (`npm run build`, `npm run lint`)

**Ordering Strategy**:
- TDD order: Contract tests → Types → Implementation → Component tests → Integration
- Dependency order: Types → Calculations → UI primitives → Composed components → Page
- [P] marks parallel-executable tasks (independent files, no shared state)

**Estimated Output**: ~35-40 numbered tasks in tasks.md

**Key Dependencies**:
```
Types ─→ Validations ─→ Calculations ─→ UI Components ─→ Page Integration
  ↓                         ↓                  ↓
Contract Tests          Unit Tests      Component Tests → Quickstart
```

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) ✅
  - Generated: `research.md` (10 research areas, all decisions documented)
- [x] Phase 1: Design complete (/plan command) ✅
  - Generated: `data-model.md` (3 core entities, Zod schemas)
  - Generated: `contracts/mortgage-calculator.contract.ts` (25+ contract tests)
  - Generated: `contracts/validation.contract.ts` (35+ validation tests)
  - Generated: `quickstart.md` (10 validation scenarios, sign-off checklist)
  - Generated: `AGENTS.md` (agent context file)
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅
  - Task generation strategy documented
  - Dependency graph defined
  - Estimated 35-40 tasks
- [ ] Phase 3: Tasks generated (/tasks command) - **NEXT STEP**
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
- [x] All NEEDS CLARIFICATION resolved ✅
- [x] Complexity deviations documented: N/A (no deviations) ✅

**Artifacts Generated**:
1. `/Users/cristian/Apps/test-spec/specs/001-mortgage-calculator-that/research.md`
2. `/Users/cristian/Apps/test-spec/specs/001-mortgage-calculator-that/data-model.md`
3. `/Users/cristian/Apps/test-spec/specs/001-mortgage-calculator-that/contracts/mortgage-calculator.contract.ts`
4. `/Users/cristian/Apps/test-spec/specs/001-mortgage-calculator-that/contracts/validation.contract.ts`
5. `/Users/cristian/Apps/test-spec/specs/001-mortgage-calculator-that/quickstart.md`
6. `/Users/cristian/Apps/test-spec/AGENTS.md`

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
