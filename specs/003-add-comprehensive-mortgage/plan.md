
# Implementation Plan: Comprehensive Mortgage Calculator Factors

**Branch**: `003-add-comprehensive-mortgage` | **Date**: 2025-10-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/cristian/Apps/test-spec/specs/003-add-comprehensive-mortgage/spec.md`

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
Extend the existing Next.js mortgage calculator to include comprehensive factors missing from the current implementation: property price with down payment (percentage/dollar sync), discount/origination points with rate buydown, detailed closing costs breakdown, PMI calculation with automatic removal at 78% LTV, extra payment strategies (monthly/annual/lump-sum/bi-weekly), and ARM loan configuration. This transforms the basic calculator into a production-ready tool for home buyers to compare complete loan scenarios with accurate upfront costs and payment schedules.

## Technical Context
**Language/Version**: TypeScript 5, React 19, Next.js 15.5.4
**Primary Dependencies**: React 19, Next.js App Router, Radix UI (label, separator, collapsible), Tailwind CSS 4, Zod 4.1.11, class-variance-authority
**Storage**: Client-side state only (useState/useMemo) - no persistence
**Testing**: Jest 30.2.0, React Testing Library 16.3.0, @testing-library/jest-dom 6.9.1
**Target Platform**: Web browsers (Next.js SSR + client hydration), Turbopack for dev/build
**Project Type**: Single web application (Next.js App Router with src/ structure)
**Performance Goals**: <100ms input responsiveness, instant calculation updates, smooth bi-directional sync for down payment fields
**Constraints**: Client-side only calculations (no API), must handle 360 monthly amortization entries efficiently, PMI calculations must follow federal standards (78% LTV)
**Scale/Scope**: 2-loan comparison interface, 38 functional requirements, 6 new entity types, estimated 15-20 new input fields across collapsible sections

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Component Architecture ✅
- **Server Components by default**: Input forms require interactivity → mark as 'use client' (existing pattern)
- **Single responsibility**: Each new section (down payment, points, closing costs, PMI, extra payments, ARM) gets dedicated component
- **200 line limit**: Current loan-input-form.tsx is ~150 lines with 7 fields. Adding 15-20 fields requires extraction into collapsible sub-components
- **No prop drilling**: Use composition pattern - pass callbacks directly to sections
- **Independently testable**: Each calculation function and sub-component isolated

### Server-First Pattern ✅
- **Data fetching**: N/A - all calculations are client-side
- **Server Actions**: N/A - no mutations or persistence
- **Client Components**: All form components require 'use client' for useState/onChange handlers
- **Caching**: N/A - no external data fetching

### Type Safety (NON-NEGOTIABLE) ✅
- **No `any` types**: Existing code uses explicit types (LoanInputs, LoanResults, AmortizationEntry)
- **Explicit types**: Must extend LoanInputs interface with new fields, create types for ClosingCosts, PMIConfig, ExtraPayments, ARMConfig
- **Zod validation**: Zod 4.1.11 already installed - extend LoanInputsSchema with new field validations
- **Generic types**: Use generic types for calculation functions
- **Type errors**: Must resolve before commits (existing npm run build requirement)

### Code Organization ✅
- **Route structure**: Existing /app structure unchanged - all work in src/components/features and src/lib
- **Component separation**: /ui for FormattedInput (already done), /features for loan forms
- **Utilities**: src/lib/mortgage-calculator.ts extends with new calculation functions
- **Type definitions**: src/types/loan.ts extends with new interfaces
- **Co-location**: Keep component tests alongside components

### Performance & Optimization ✅
- **Images**: N/A - calculator has no images
- **Fonts**: Already using Geist font via next/font
- **Dynamic imports**: Not needed - components are small and critical to initial render
- **Static/dynamic rendering**: All pages are client-interactive (Calculator requires user input)
- **Metadata**: Not applicable to internal components

**Verdict**: All constitutional requirements satisfied. No violations detected.

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
├── app/                          # Next.js App Router (unchanged)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # Reusable UI primitives
│   │   ├── formatted-input.tsx   # ✅ Existing - currency/percentage formatting
│   │   ├── card.tsx              # ✅ Existing
│   │   ├── label.tsx             # ✅ Existing
│   │   ├── separator.tsx         # ✅ Existing
│   │   ├── input.tsx             # ✅ Existing
│   │   └── collapsible.tsx       # ✅ Existing - for grouping new fields
│   └── features/                 # Business logic components
│       ├── loan-comparison.tsx   # 🔧 EXTEND - add new state fields
│       ├── loan-input-form.tsx   # 🔧 MAJOR REFACTOR - extract sections
│       ├── loan-results.tsx      # 🔧 EXTEND - display closing costs, PMI removal date
│       ├── amortization-schedule.tsx # 🔧 EXTEND - show PMI removal, extra payments
│       └── tax-benefits.tsx      # ✅ Existing
├── lib/                          # Business logic and utilities
│   ├── mortgage-calculator.ts    # 🔧 EXTEND - add new calculation functions
│   ├── tax-calculator.ts         # ✅ Existing
│   ├── validations.ts            # 🔧 EXTEND - add Zod schemas for new fields
│   └── utils.ts                  # ✅ Existing
└── types/                        # TypeScript type definitions
    ├── loan.ts                   # 🔧 EXTEND - add ClosingCosts, PMIConfig, ExtraPayments, ARMConfig
    └── tax.ts                    # ✅ Existing

__tests__/                        # Test files
├── lib/
│   └── mortgage-calculator.test.ts  # 🆕 NEW - contract tests for new calculations
└── components/
    └── features/
        └── loan-input-form.test.tsx # 🆕 NEW - integration tests for new inputs
```

**Structure Decision**: Single Next.js project with App Router. All feature work happens in `src/components/features` and `src/lib`. Type extensions in `src/types`. Existing architecture supports this expansion without structural changes.

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

The /tasks command will generate a dependency-ordered task list following TDD principles:

1. **Type System Tasks** (Foundation - can run in parallel):
   - Extend `LoanInputs` interface with new fields (propertyPrice, downPayment, points, etc.)
   - Create `ClosingCosts` interface
   - Create `PMIConfig` interface with discriminated union for type
   - Create `ExtraPayments` interface
   - Create `ARMConfig` interface
   - Extend `LoanResults` interface with new calculated fields
   - Extend `AmortizationEntry` interface with PMI and extra payment tracking

2. **Validation Tasks** (Depends on types):
   - Extend Zod `LoanInputsSchema` with new field validations
   - Create `ClosingCostsSchema`
   - Create `PMIConfigSchema` with conditional validation
   - Create `ExtraPaymentsSchema`
   - Create `ARMConfigSchema`

3. **Contract Test Tasks** (Depends on types - TDD approach):
   - Write failing tests for `calculateEffectiveRate()`
   - Write failing tests for `calculatePointsCost()`
   - Write failing tests for `calculateTotalClosingCosts()`
   - Write failing tests for `calculateCashAtClosing()`
   - Write failing tests for `calculateLTV()`
   - Write failing tests for `calculateMonthlyPMI()`
   - Write failing tests for `findPMIRemovalMonth()`
   - Write failing tests for `recalculateWithExtraPayments()`
   - Write failing tests for `generateARMProjections()`
   - Write failing tests for `syncDownPayment()`
   - Write failing tests for `calculateComprehensiveLoanResults()`

4. **Calculation Implementation Tasks** (Make tests pass):
   - Implement `calculateEffectiveRate()`
   - Implement `calculatePointsCost()`
   - Implement `calculateTotalClosingCosts()`
   - Implement `calculateCashAtClosing()`
   - Implement `calculateLTV()`
   - Implement `calculateMonthlyPMI()`
   - Implement `findPMIRemovalMonth()`
   - Implement `recalculateWithExtraPayments()`
   - Implement `generateARMProjections()`
   - Implement `syncDownPayment()`
   - Implement `calculateComprehensiveLoanResults()` (integrates all functions)

5. **UI Component Refactor Tasks** (Depends on calculations):
   - Extract down payment section component from loan-input-form
   - Extract points & fees section component
   - Extract closing costs section component (with collapsible)
   - Extract PMI configuration section component (conditional)
   - Extract extra payments section component (with collapsible)
   - Extract ARM configuration section component (conditional)
   - Refactor loan-input-form to compose all sections (keep under 200 lines)
   - Update loan-comparison state management for new fields
   - Update loan-results to display closing costs breakdown
   - Update loan-results to display PMI removal information
   - Update loan-results to display extra payment savings
   - Update loan-results to display ARM projections
   - Update amortization-schedule to show PMI column
   - Update amortization-schedule to show extra payments column
   - Update amortization-schedule to show ARM rate changes

6. **Integration Test Tasks** (Validate acceptance scenarios):
   - Integration test: Scenario 1 - Property Price and Down Payment
   - Integration test: Scenario 2 - Using Points to Buy Down Rate
   - Integration test: Scenario 3 - Lender Credits Reducing Closing Costs
   - Integration test: Scenario 4 - PMI Calculation and Removal
   - Integration test: Scenario 5 - Extra Monthly Payments
   - Integration test: Scenario 6 - Bi-weekly Payment Strategy
   - Integration test: Scenario 7 - Comprehensive Closing Costs
   - Integration test: Scenario 8 - ARM Loan Configuration

7. **Quality & Validation Tasks**:
   - Run full test suite (npm test)
   - Run build verification (npm run build)
   - Run linting (npm run lint)
   - Manual quickstart validation (follow quickstart.md)
   - Performance validation (<100ms for calculations)

**Ordering Strategy**:
- **Phase 1 (Types & Validation)**: All tasks can run in parallel [P]
- **Phase 2 (Contract Tests)**: All tasks can run in parallel [P] after Phase 1
- **Phase 3 (Calculations)**: Some parallel, some sequential:
  - Basic calculations [P]: effectiveRate, pointsCost, LTV, cashAtClosing
  - Advanced calculations: PMI functions after LTV
  - Amortization extensions: extraPayments and ARM after basic calculations
  - Comprehensive function: Last, integrates all others
- **Phase 4 (UI Components)**: Section extractions [P], then form composition, then results updates
- **Phase 5 (Integration Tests)**: Can run in parallel [P] after implementation complete
- **Phase 6 (Quality)**: Sequential, run in order

**Dependency Markers**:
- `[P]` = Can run in parallel (no dependencies within phase)
- `[D: task-X]` = Depends on task X completing first
- `[GATE]` = All previous tasks must pass before proceeding

**Estimated Output**: ~50-55 numbered, ordered tasks in tasks.md

**Task Granularity**:
- Each task represents 15-30 minutes of focused work
- Complex components split into subtasks (extract → compose → test)
- Contract tests separate from implementations (TDD workflow)

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
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command) - 58 tasks across 7 phases
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS (no new violations introduced)
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none - no violations)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
