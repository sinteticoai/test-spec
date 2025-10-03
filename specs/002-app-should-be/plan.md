# Implementation Plan: Mortgage Tax Benefits Display

**Branch**: `002-app-should-be` | **Date**: 2025-10-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-app-should-be/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✅ Loaded from /Users/cristian/Apps/test-spec/specs/002-app-should-be/spec.md
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ All clarifications resolved via /clarify session
   → Project Type: Single project (Next.js 15 App Router)
   → Structure Decision: Next.js App Router with existing src/ structure
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → Evaluating against constitution v1.0.0...
5. Execute Phase 0 → research.md
   → ✅ COMPLETE
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
   → ✅ COMPLETE
7. Re-evaluate Constitution Check section
   → ✅ COMPLETE
8. Plan Phase 2 → Describe task generation approach
   → ✅ COMPLETE
9. STOP - Ready for /tasks command
   → ✅ COMPLETE
```

**IMPORTANT**: The /plan command STOPS at step 9. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Add a tax benefits calculation and display section to the existing mortgage calculator that shows users their estimated federal tax savings from mortgage interest and property tax deductions. The system will automatically determine the user's marginal tax bracket based on their income and filing status, compare itemized vs. standard deduction methods, and display the effective monthly payment after tax savings. All calculations follow 2025 federal tax code rules including the $750,000 qualified debt limit, $10,000 SALT cap, and filing-status-specific standard deductions.

## Technical Context

**Language/Version**: TypeScript 5 with Next.js 15.5.4, React 19
**Primary Dependencies**: Zod 4.1.11 (validation), Radix UI (components), Tailwind CSS 4
**Storage**: N/A (client-side calculations, no persistence required)
**Testing**: Jest 30.2.0 with React Testing Library 16.3.0
**Target Platform**: Web browsers (Next.js SSR + client interactivity)
**Project Type**: Single project - Next.js App Router architecture
**Performance Goals**: Real-time calculation updates (<50ms for tax benefit calculations), smooth UI interactions at 60fps
**Constraints**: Client-side calculations only (no external APIs), accurate 2025 federal tax code implementation, accessible UI (WCAG 2.1 AA)
**Scale/Scope**: Single-page feature addition, ~500-800 lines of new code across 3-5 files

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Assessment (Pre-Phase 0)

**I. Component Architecture** ✅ PASS
- Tax benefits component will be Server Component with Client Component boundaries for form inputs
- Single responsibility: separate calculation logic, display logic, and form handling
- Current components average ~150 lines; will maintain this pattern
- Use composition (tax benefit as sibling to amortization schedule)

**II. Server-First Pattern** ✅ PASS
- All calculations are pure functions (no data fetching required)
- Client Components only for interactive form inputs (income, filing status, property tax)
- Tax calculation logic in `/lib` can be used from both server and client contexts
- No caching strategies needed (client-side computation)

**III. Type Safety (NON-NEGOTIABLE)** ✅ PASS
- Will extend existing Zod schemas for new input fields
- All tax calculation functions will have explicit TypeScript types
- 2025 tax bracket constants will be strongly typed
- No `any` types will be introduced

**IV. Code Organization** ✅ PASS
- New files will follow existing structure:
  - `/src/lib/tax-calculator.ts` - calculation logic
  - `/src/components/features/tax-benefits.tsx` - display component
  - `/src/types/tax.ts` - TypeScript interfaces
  - Co-located tests in `/__tests__/`
- Extends existing `/types/loan.ts` with tax profile fields

**V. Performance & Optimization** ✅ PASS
- Tax calculations are lightweight (< 1ms execution time)
- No images or fonts to optimize
- No dynamic imports needed (small bundle impact ~15KB)
- Real-time calculation updates use React state (no debouncing needed for performance)

### Post-Design Re-check: ✅ PASS

**Re-evaluation after Phase 1 design artifacts**:

All constitutional principles remain satisfied after detailed design:

**I. Component Architecture** ✅ PASS
- Data model confirms single responsibility separation (TaxProfile, TaxBenefitCalculation separate entities)
- Component contracts specify clear prop interfaces
- No prop drilling beyond one level (page → TaxBenefitsDisplay)

**II. Server-First Pattern** ✅ PASS
- All calculation functions are pure (no side effects, no data fetching)
- Contract tests confirm client-side interactivity limited to form inputs
- No server actions or API routes needed

**III. Type Safety (NON-NEGOTIABLE)** ✅ PASS
- Data model defines explicit TypeScript interfaces for all entities
- Zod schemas extend existing validation patterns
- Contract tests enforce type safety via TypeScript compilation

**IV. Code Organization** ✅ PASS
- File structure matches constitutional guidelines:
  - Types in `/types/tax.ts`
  - Logic in `/lib/tax-calculator.ts`
  - Components in `/components/features/`
  - Tests co-located in `__tests__/`

**V. Performance & Optimization** ✅ PASS
- Contract tests verify calculation performance (< 50ms requirement testable)
- No heavy computation or async operations
- Real-time updates via standard React state (no performance optimizations needed)

**Complexity**: No violations introduced. Design follows existing patterns exactly.

## Project Structure

### Documentation (this feature)
```
specs/002-app-should-be/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── tax-calculator.contract.ts
│   └── tax-benefits-component.contract.ts
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── app/
│   ├── layout.tsx                          # [EXISTS] Root layout
│   └── page.tsx                            # [MODIFY] Add tax inputs to main page
├── components/
│   ├── features/
│   │   ├── amortization-schedule.tsx       # [EXISTS] Current schedule display
│   │   ├── loan-comparison.tsx             # [EXISTS] Loan comparison
│   │   ├── loan-input-form.tsx             # [MODIFY] Add tax-related inputs
│   │   ├── loan-results.tsx                # [MODIFY] Position tax benefits above schedule
│   │   └── tax-benefits.tsx                # [NEW] Tax benefits display component
│   └── ui/                                  # [EXISTS] Radix UI components
│       ├── input.tsx
│       ├── card.tsx
│       ├── label.tsx
│       └── ...
├── lib/
│   ├── mortgage-calculator.ts              # [EXISTS] Core calculation logic
│   ├── tax-calculator.ts                   # [NEW] Tax benefit calculations
│   ├── utils.ts                            # [EXISTS] Utility functions
│   └── validations.ts                      # [MODIFY] Add tax input validations
└── types/
    ├── loan.ts                             # [MODIFY] Extend with tax fields
    └── tax.ts                              # [NEW] Tax-specific types

__tests__/
├── lib/
│   ├── mortgage-calculator.test.ts         # [EXISTS] Current tests
│   └── tax-calculator.test.ts              # [NEW] Tax calculation tests
└── components/
    └── tax-benefits.test.tsx               # [NEW] Component tests
```

**Structure Decision**: Single project using Next.js 15 App Router architecture. The existing `src/` structure follows constitutional guidelines with clear separation between app routes, reusable components (features + ui), business logic (lib), and type definitions. We'll extend this structure with tax-related modules while maintaining the established patterns.

## Phase 0: Outline & Research
**Status**: ✅ COMPLETE

All technical decisions were clarified during the `/clarify` session. Research findings consolidated below:

### 1. 2025 Federal Tax Code Parameters
**Decision**: Use 2025 IRS tax brackets and deduction limits
**Rationale**: Spec explicitly requires 2025 tax rules; provides most current guidance for users
**Source**: 2025 tax year parameters (standard deductions adjusted for inflation)

**Key Constants**:
- **Qualified Residence Debt Limit**: $750,000 (post-TCJA limit)
- **SALT Cap**: $10,000 (state and local tax deduction limit)
- **Standard Deductions (2025)**:
  - Single: $15,000
  - Married Filing Jointly: $30,000
  - Married Filing Separately: $15,000
  - Head of Household: $22,500
- **Tax Brackets (2025)**: Seven brackets (10%, 12%, 22%, 24%, 32%, 35%, 37%) with filing-status-specific thresholds

### 2. Marginal vs. Effective Tax Rate
**Decision**: Use marginal tax rate for deduction benefit calculation
**Rationale**: Deductions save taxes at the marginal rate (highest bracket); this is standard tax planning methodology
**Alternatives considered**: Effective rate would understate tax benefit

### 3. Itemized vs. Standard Deduction Logic
**Decision**: Calculate both methods, compare totals, use the greater benefit, and clearly indicate which method was selected
**Rationale**: Many taxpayers don't benefit from itemizing post-TCJA due to higher standard deductions; showing both provides educational value
**Implementation**: Display comparison prominently with visual indicator of selected method

### 4. First-Year Interest Calculation
**Decision**: Use full-year equivalent for simplicity; add disclaimer about actual timing
**Rationale**: Partial-year calculations require loan origination date input; adds complexity with marginal accuracy improvement
**Alternatives considered**: Exact date-based calculation rejected as out-of-scope for MVP

### 5. Input Validation Strategy
**Decision**: Extend existing Zod schemas in `/lib/validations.ts`
**Rationale**: Project already uses Zod for loan input validation; maintains consistency
**Validation rules**:
  - Annual income: positive number, reasonable max (e.g., $10M)
  - Property tax: positive number or zero
  - Filing status: enum of four allowed values

### 6. Component State Management
**Decision**: Lift tax-related state to parent component (page.tsx), pass as props
**Rationale**: Maintains consistency with existing loan input pattern; tax benefits depend on mortgage data
**Alternatives considered**: Separate context rejected as over-engineering for single-page feature

**Output**: research.md (inline above)

## Phase 1: Design & Contracts
**Status**: ✅ COMPLETE

### Data Model

See [data-model.md](./data-model.md) for full details. Key entities:

1. **TaxProfile** - User's tax information
   - annualIncome: number
   - filingStatus: FilingStatus enum
   - propertyTaxAnnual: number

2. **TaxBenefitCalculation** - Calculation results
   - mortgageInterestDeduction: number
   - propertyTaxDeduction: number (capped at SALT limit)
   - totalItemizedDeductions: number
   - standardDeduction: number
   - recommendedMethod: 'itemized' | 'standard'
   - marginalTaxRate: number
   - annualTaxSavings: number
   - monthlyTaxSavings: number
   - effectiveMonthlyPayment: number

3. **TaxBracket** - 2025 IRS tax bracket definition
   - rate: number
   - minIncome: number
   - maxIncome: number | null

### API Contracts

**Contract 1**: `calculateMarginalTaxRate(income: number, filingStatus: FilingStatus): number`
- Input: Annual income, filing status
- Output: Marginal tax rate as decimal (e.g., 0.22 for 22%)
- Rules: Compare income against 2025 bracket thresholds for filing status

**Contract 2**: `calculateTaxBenefits(mortgage: LoanInputs, taxProfile: TaxProfile): TaxBenefitCalculation`
- Input: Mortgage parameters, tax profile
- Output: Complete tax benefit calculation
- Rules:
  - Apply $750K debt limit to interest
  - Cap property tax at $10K SALT limit
  - Compare itemized vs. standard
  - Calculate savings using marginal rate

**Contract 3**: `<TaxBenefitsDisplay>` component props
- Input: `calculation: TaxBenefitCalculation`, `onInputChange: (field, value) => void`
- Output: Rendered tax benefits section with form inputs
- Behavior: Real-time updates on input change

See [contracts/](./contracts/) for full contract tests.

### Quickstart Validation

See [quickstart.md](./quickstart.md) for complete test scenarios. Key validation:

1. User enters mortgage details + $120K income + MFJ status + $12K property tax
2. System calculates 22% marginal rate, shows itemized deduction recommended
3. User sees monthly tax savings and effective payment
4. User changes to Single status, sees standard deduction recommended instead

### Agent Context Update

Updated CLAUDE.md with new tax calculation context.

**Output**: ✅ data-model.md, contracts/, quickstart.md, CLAUDE.md created

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
1. Load existing codebase context (LoanInputs, mortgage-calculator.ts patterns)
2. Generate tasks in TDD order:
   - **Phase A: Foundation** (data model + types + validation schemas)
   - **Phase B: Core Logic** (tax calculator functions with tests first)
   - **Phase C: Integration** (extend loan types, integrate calculations)
   - **Phase D: UI Components** (tax benefits display, input fields)
   - **Phase E: Testing & Validation** (integration tests, quickstart verification)

**Ordering Strategy**:
- Types before implementation [P] - multiple files can be created in parallel
- Contract tests before implementation
- Core calculations before UI
- Pure functions before components
- Unit tests before integration tests

**Estimated Output**: 18-22 numbered tasks in dependency order

**Key Parallelization Opportunities** [P]:
- Type definitions (tax.ts, extend loan.ts)
- Validation schemas (extend validations.ts)
- Contract test files (can all be written upfront)
- Component tests (tax-benefits.test.tsx independent of implementation)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, verify acceptance criteria)

## Complexity Tracking
*No constitutional violations identified*

This feature extends existing patterns without introducing architectural complexity:
- Uses established Next.js App Router structure
- Follows existing component composition patterns
- Maintains strict TypeScript typing throughout
- Leverages existing Zod validation approach
- No new dependencies required

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command) - 20 tasks created
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none found)

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
