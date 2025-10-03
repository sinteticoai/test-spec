# Tasks: Mortgage Calculator with Loan Comparison

**Feature Branch**: `001-mortgage-calculator-that`
**Input**: Design documents from `/Users/cristian/Apps/test-spec/specs/001-mortgage-calculator-that/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Summary

This task list implements a mortgage loan comparison calculator using Next.js 15, TypeScript, React 19, shadcn/ui components, and Lucide React icons. The implementation follows TDD principles with contract tests written first.

**Tech Stack**:
- Next.js 15.5.4 with App Router
- TypeScript (strict mode)
- React 19
- shadcn/ui + Lucide React
- Tailwind CSS 4
- Zod for validation
- Jest + React Testing Library

**Key Files**:
- 3 entities: LoanInputs, LoanResults, AmortizationEntry
- 2 contract test files
- 4 feature components
- 1 calculation library
- 1 validation library

---

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in task descriptions
- Paths relative to repository root: `/Users/cristian/Apps/test-spec/`

---

## Phase 3.1: Setup & Dependencies

### T001: Install required dependencies
**Description**: Install Zod for validation and prepare for shadcn/ui installation.
```bash
npm install zod
npm install --save-dev @types/jest @testing-library/react @testing-library/jest-dom
```
**Dependencies**: None
**Status**: [ ]

---

### T002 [P]: Install shadcn/ui components
**Description**: Install required shadcn/ui components for the calculator UI.
```bash
npx shadcn-ui@latest add button card input label collapsible separator alert
```
**Components**: button, card, input, label, collapsible, separator, alert
**Location**: Will create files in `src/components/ui/`
**Dependencies**: None (parallel with T003)
**Status**: [ ]

---

### T003 [P]: Install Lucide React icons
**Description**: Install Lucide React icon library.
```bash
npm install lucide-react
```
**Dependencies**: None (parallel with T002)
**Status**: [ ]

---

### T004: Create directory structure for feature components
**Description**: Create necessary directories for feature implementation.
```bash
mkdir -p src/components/features
mkdir -p src/types
mkdir -p src/lib
mkdir -p __tests__/lib
mkdir -p __tests__/components/features
```
**Dependencies**: None
**Status**: [ ]

---

## Phase 3.2: Contract Tests (TDD - MUST FAIL) ⚠️

**CRITICAL**: These tests MUST be written and MUST FAIL before ANY implementation in Phase 3.3.

### T005 [P]: Copy contract test: mortgage-calculator.contract.ts
**Description**: Copy the mortgage calculator contract test file from contracts/ to __tests__/lib/.
**Source**: `specs/001-mortgage-calculator-that/contracts/mortgage-calculator.contract.ts`
**Destination**: `__tests__/lib/mortgage-calculator.test.ts`
**Action**: Copy file and verify imports are correct (change from `@jest/globals` if needed)
**Dependencies**: T001, T004
**Expected**: Test file should be runnable but ALL tests should FAIL (functions don't exist yet)
**Status**: [ ]

---

### T006 [P]: Copy contract test: validation.contract.ts
**Description**: Copy the validation contract test file from contracts/ to __tests__/lib/.
**Source**: `specs/001-mortgage-calculator-that/contracts/validation.contract.ts`
**Destination**: `__tests__/lib/validations.test.ts`
**Action**: Copy file and verify imports are correct
**Dependencies**: T001, T004 (parallel with T005)
**Expected**: Test file should be runnable but ALL tests should FAIL (schemas don't exist yet)
**Status**: [ ]

---

### T007: Verify all contract tests fail (RED state)
**Description**: Run the test suite to confirm all contract tests fail as expected (TDD RED state).
```bash
npm test -- __tests__/lib/
```
**Expected Output**: All tests FAIL with errors like "Cannot find module '@/lib/mortgage-calculator'" or "Cannot find module '@/lib/validations'"
**Dependencies**: T005, T006
**Status**: [ ]

---

## Phase 3.3: Type Definitions

### T008 [P]: Create loan type definitions
**Description**: Create TypeScript interfaces for loan data structures in `src/types/loan.ts`.
**File**: `src/types/loan.ts`
**Content**:
```typescript
export interface LoanInputs {
  principal: number;
  interestRate: number;
  termYears: number;
  propertyTax?: number;
  insurance?: number;
  hoaFees?: number;
  pmi?: number;
}

export interface AmortizationEntry {
  paymentNumber: number;
  paymentDate: Date;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export interface LoanResults {
  monthlyPaymentPI: number;
  monthlyPaymentTotal: number;
  totalInterest: number;
  totalCost: number;
  amortizationSchedule: AmortizationEntry[];
}
```
**Dependencies**: T004
**Reference**: `data-model.md` sections 1-3
**Status**: [ ]

---

### T009 [P]: Create Zod validation schemas
**Description**: Create Zod schemas for input validation in `src/lib/validations.ts`.
**File**: `src/lib/validations.ts`
**Content**: Implement `LoanInputsSchema` with validation rules:
- principal: min 1000, max 10,000,000
- interestRate: min 0.01, max 20
- termYears: integer, min 1, max 50
- Optional fields: propertyTax, insurance, hoaFees, pmi (all ≥0)
**Dependencies**: T001, T004, T008 (needs LoanInputs type)
**Reference**: `data-model.md` "Validation Schemas" section
**Expected**: validation.test.ts should now find the module but tests may still fail until schemas are complete
**Status**: [ ]

---

## Phase 3.4: Core Calculation Logic

### T010: Implement calculateMonthlyPayment function
**Description**: Create core mortgage payment calculation function in `src/lib/mortgage-calculator.ts`.
**File**: `src/lib/mortgage-calculator.ts`
**Function**: `calculateMonthlyPayment(principal: number, interestRate: number, termYears: number): number`
**Formula**:
- If interestRate > 0: `M = P × [r(1 + r)^n] / [(1 + r)^n - 1]`
- If interestRate === 0: `M = P / (termYears × 12)`
**Dependencies**: T008
**Reference**: `research.md` section 1 "Mortgage Calculation Algorithms"
**Test Coverage**: Should pass tests in mortgage-calculator.test.ts "calculateMonthlyPayment" describe block
**Status**: [ ]

---

### T011: Implement generateAmortizationSchedule function
**Description**: Create amortization schedule generator in `src/lib/mortgage-calculator.ts`.
**File**: `src/lib/mortgage-calculator.ts` (same file as T010)
**Function**: `generateAmortizationSchedule(principal: number, interestRate: number, termYears: number, startDate?: Date): AmortizationEntry[]`
**Logic**:
- Calculate monthly payment using calculateMonthlyPayment
- Loop n times (termYears × 12)
- For each payment: calculate interest, principal, remaining balance
- Return array of AmortizationEntry objects
**Dependencies**: T008, T010
**Reference**: `research.md` section 1, `data-model.md` section 3
**Test Coverage**: Should pass tests in mortgage-calculator.test.ts "generateAmortizationSchedule" describe block
**Status**: [ ]

---

### T012: Implement calculateLoanResults function
**Description**: Create wrapper function that calculates all loan results in `src/lib/mortgage-calculator.ts`.
**File**: `src/lib/mortgage-calculator.ts` (same file as T010, T011)
**Function**: `calculateLoanResults(inputs: LoanInputs): LoanResults`
**Logic**:
- Call calculateMonthlyPayment for P&I
- Add optional costs for total monthly payment
- Generate amortization schedule
- Calculate totalInterest (sum schedule interest)
- Calculate totalCost (monthlyPaymentTotal × n)
**Dependencies**: T008, T010, T011
**Reference**: `data-model.md` section 2 "LoanResults"
**Test Coverage**: Should pass tests in mortgage-calculator.test.ts "calculateLoanResults" and "Edge Cases" describe blocks
**Status**: [ ]

---

### T013 [P]: Add utility functions to mortgage-calculator.ts
**Description**: Add helper utility functions for formatting and validation.
**File**: `src/lib/mortgage-calculator.ts` (append to same file)
**Functions**:
- `formatCurrency(value: number): string` - uses Intl.NumberFormat for USD
- `formatPercentage(value: number): string` - returns "{value}%"
- `isLoanComplete(inputs: Partial<LoanInputs>): inputs is LoanInputs` - type guard
**Dependencies**: T008 (parallel with T010-T012, but same file so not truly parallel)
**Reference**: `data-model.md` section "Type Guards & Utilities"
**Status**: [ ]

---

### T014: Verify all calculation contract tests pass (GREEN state)
**Description**: Run calculation tests to confirm TDD GREEN state achieved.
```bash
npm test -- __tests__/lib/mortgage-calculator.test.ts
```
**Expected Output**: All tests PASS (25+ tests)
**Dependencies**: T010, T011, T012, T013
**Status**: [ ]

---

### T015: Verify all validation contract tests pass (GREEN state)
**Description**: Run validation tests to confirm TDD GREEN state achieved.
```bash
npm test -- __tests__/lib/validations.test.ts
```
**Expected Output**: All tests PASS (35+ tests)
**Dependencies**: T009
**Status**: [ ]

---

## Phase 3.5: UI Components

### T016 [P]: Create LoanInputForm component
**Description**: Create Client Component for loan input form with validation in `src/components/features/loan-input-form.tsx`.
**File**: `src/components/features/loan-input-form.tsx`
**Component**: `LoanInputForm` (Client Component - add `'use client'` directive)
**Props**:
```typescript
{
  loanNumber: 1 | 2;
  inputs: Partial<LoanInputs>;
  onInputsChange: (inputs: Partial<LoanInputs>) => void;
  onCalculate: () => void;
}
```
**UI Elements**:
- Card wrapper (shadcn card)
- Input fields for principal, interestRate, termYears (required)
- Input fields for propertyTax, insurance, hoaFees, pmi (optional, collapsible)
- Labels (shadcn label)
- Validation on blur (use Zod schema from T009)
- Error messages (shadcn alert) below each field
- Icons from Lucide React (DollarSign, Percent, Calendar)
**Dependencies**: T002, T003, T008, T009
**Reference**: `spec.md` FR-001, FR-002, FR-007, FR-008, FR-009
**Status**: [ ]

---

### T017 [P]: Create LoanResults component
**Description**: Create display component for loan calculation results in `src/components/features/loan-results.tsx`.
**File**: `src/components/features/loan-results.tsx`
**Component**: `LoanResults` (can be Server Component)
**Props**:
```typescript
{
  loanNumber: 1 | 2;
  results: LoanResults | null;
}
```
**UI Elements**:
- Card wrapper
- Display monthlyPaymentPI (formatted as currency)
- Display monthlyPaymentTotal (formatted as currency)
- Clearly separate P&I vs Total (FR-016)
- Display totalInterest
- Display totalCost
- Use formatCurrency from T013
**Dependencies**: T002, T008, T013 (parallel with T016)
**Reference**: `spec.md` FR-003, FR-004, FR-005, FR-016
**Status**: [ ]

---

### T018 [P]: Create AmortizationSchedule component
**Description**: Create collapsible amortization schedule table in `src/components/features/amortization-schedule.tsx`.
**File**: `src/components/features/amortization-schedule.tsx`
**Component**: `AmortizationSchedule` (Client Component for collapsible interaction)
**Props**:
```typescript
{
  schedule: AmortizationEntry[];
}
```
**UI Elements**:
- Collapsible wrapper (shadcn collapsible) - collapsed by default
- Trigger button with ChevronDown/ChevronUp icon (Lucide)
- Table with columns: Payment #, Date, Principal Paid, Interest Paid, Remaining Balance
- Max height 400px with overflow-y scroll
- Format currency using formatCurrency
**Dependencies**: T002, T003, T008, T013 (parallel with T016, T017)
**Reference**: `spec.md` FR-012, FR-017; `research.md` section 7
**Status**: [ ]

---

### T019: Create LoanComparison parent component
**Description**: Create parent Client Component that manages state for two loans in `src/components/features/loan-comparison.tsx`.
**File**: `src/components/features/loan-comparison.tsx`
**Component**: `LoanComparison` (Client Component - manages state)
**State**:
```typescript
const [loan1, setLoan1] = useState<Partial<LoanInputs>>({});
const [loan2, setLoan2] = useState<Partial<LoanInputs>>({});
const [results1, setResults1] = useState<LoanResults | null>(null);
const [results2, setResults2] = useState<LoanResults | null>(null);
```
**Logic**:
- When loan inputs change (blur event), validate and calculate results
- Call calculateLoanResults from T012
- Pass state down to child components
**Layout**:
- Responsive grid: `grid-cols-1 md:grid-cols-2 gap-6`
- Two LoanInputForm components (loan 1 and 2)
- Two LoanResults components (if results exist)
- Two AmortizationSchedule components (if results exist)
**Dependencies**: T008, T012, T016, T017, T018
**Reference**: `spec.md` FR-001, FR-006, FR-009; `research.md` section 4 "Responsive Layout", section 5 "State Management"
**Status**: [ ]

---

### T020: Update main page to use LoanComparison
**Description**: Replace default content in `src/app/page.tsx` with the mortgage calculator.
**File**: `src/app/page.tsx`
**Content**:
- Import LoanComparison component
- Wrap in Server Component
- Add page title with Calculator icon (Lucide)
- Add brief description
- Center layout with max-width container
- Keep as Server Component (wrapper only, LoanComparison is Client)
**Dependencies**: T019
**Reference**: `plan.md` "Code Organization" section
**Status**: [ ]

---

## Phase 3.6: Component Tests

### T021 [P]: Write tests for LoanInputForm component
**Description**: Create React Testing Library tests for LoanInputForm in `__tests__/components/features/loan-input-form.test.tsx`.
**File**: `__tests__/components/features/loan-input-form.test.tsx`
**Test Cases**:
- Renders all required input fields
- Renders optional input fields (collapsible)
- Validation triggers on blur event
- Error messages display for invalid inputs
- onInputsChange callback fires on blur
- onCalculate callback fires when all required fields valid
**Dependencies**: T016 (parallel with T022)
**Reference**: `quickstart.md` Scenario 2, 3
**Status**: [ ]

---

### T022 [P]: Write tests for LoanComparison component
**Description**: Create React Testing Library tests for LoanComparison in `__tests__/components/features/loan-comparison.test.tsx`.
**File**: `__tests__/components/features/loan-comparison.test.tsx`
**Test Cases**:
- Renders two loan input forms
- Manages state independently for each loan
- Calculates results on valid input
- Displays results when calculation completes
- Handles incomplete loan data gracefully (one loan empty)
- Responsive layout renders correctly
**Dependencies**: T019 (parallel with T021)
**Reference**: `quickstart.md` Scenario 1, 6
**Status**: [ ]

---

### T023: Run all component tests
**Description**: Verify all component tests pass.
```bash
npm test -- __tests__/components/
```
**Expected Output**: All component tests PASS
**Dependencies**: T021, T022
**Status**: [ ]

---

## Phase 3.7: Integration & Validation

### T024: Execute quickstart scenario 1 (Basic Loan Comparison)
**Description**: Manually test basic loan comparison workflow.
**Action**:
1. Run `npm run dev`
2. Navigate to `http://localhost:3000`
3. Follow steps in `quickstart.md` Scenario 1
4. Verify expected results match
**Dependencies**: T020
**Reference**: `quickstart.md` Scenario 1
**Status**: [ ]

---

### T025: Execute quickstart scenario 2 (Input Validation)
**Description**: Manually test validation rules.
**Action**: Follow steps in `quickstart.md` Scenario 2
**Dependencies**: T020
**Reference**: `quickstart.md` Scenario 2
**Status**: [ ]

---

### T026: Execute quickstart scenario 3 (Real-Time Updates)
**Description**: Manually test blur-triggered calculations.
**Action**: Follow steps in `quickstart.md` Scenario 3
**Dependencies**: T020
**Reference**: `quickstart.md` Scenario 3
**Status**: [ ]

---

### T027: Execute quickstart scenario 4 (Additional Costs)
**Description**: Manually test optional additional cost fields.
**Action**: Follow steps in `quickstart.md` Scenario 4
**Dependencies**: T020
**Reference**: `quickstart.md` Scenario 4
**Status**: [ ]

---

### T028: Execute quickstart scenario 5 (Amortization Schedule)
**Description**: Manually test collapsible amortization schedule.
**Action**: Follow steps in `quickstart.md` Scenario 5
**Dependencies**: T020
**Reference**: `quickstart.md` Scenario 5
**Status**: [ ]

---

### T029: Execute quickstart scenario 6 (Independent Loan Calculation)
**Description**: Manually test edge case of incomplete loan data.
**Action**: Follow steps in `quickstart.md` Scenario 6
**Dependencies**: T020
**Reference**: `quickstart.md` Scenario 6
**Status**: [ ]

---

### T030: Execute quickstart scenario 7-8 (Edge Cases)
**Description**: Manually test boundary value edge cases.
**Action**: Follow steps in `quickstart.md` Scenarios 7 and 8
**Dependencies**: T020
**Reference**: `quickstart.md` Scenarios 7, 8
**Status**: [ ]

---

### T031: Execute quickstart scenario 9 (Responsive Layout)
**Description**: Test responsive design at different viewport sizes.
**Action**: Follow steps in `quickstart.md` Scenario 9
**Dependencies**: T020
**Reference**: `quickstart.md` Scenario 9
**Status**: [ ]

---

### T032: Execute quickstart scenario 10 (Accessibility)
**Description**: Test keyboard navigation and screen reader support.
**Action**: Follow steps in `quickstart.md` Scenario 10
**Dependencies**: T020
**Reference**: `quickstart.md` Scenario 10
**Status**: [ ]

---

## Phase 3.8: Polish & Final Validation

### T033: Run full test suite
**Description**: Execute all tests to ensure nothing is broken.
```bash
npm test
```
**Expected Output**: All tests PASS (60+ tests total)
**Dependencies**: T014, T015, T023
**Status**: [ ]

---

### T034: Run linting
**Description**: Ensure code passes all linting rules.
```bash
npm run lint
```
**Expected Output**: Zero errors, zero warnings
**Dependencies**: T020
**Status**: [ ]

---

### T035: Run production build
**Description**: Verify application builds successfully for production.
```bash
npm run build
```
**Expected Output**: Build completes without errors, no TypeScript errors, bundle size reasonable
**Dependencies**: T020
**Reference**: `quickstart.md` "Build Validation" section
**Status**: [ ]

---

### T036: Performance validation
**Description**: Verify performance goals are met.
**Action**:
1. Open DevTools Performance tab
2. Enter loan data and trigger calculation
3. Verify calculation completes in <100ms
4. Expand 50-year amortization schedule
5. Verify animation maintains 60fps
**Dependencies**: T020
**Reference**: `plan.md` "Performance Goals", `quickstart.md` "Performance Validation"
**Status**: [ ]

---

### T037: Complete quickstart sign-off checklist
**Description**: Go through all checkboxes in quickstart.md and verify completion.
**Action**: Review `quickstart.md` "Sign-Off Checklist" and check all boxes
**Dependencies**: T024-T032, T033-T036
**Reference**: `quickstart.md` "Sign-Off Checklist"
**Status**: [ ]

---

## Dependencies Graph

```
Setup: T001 → T002, T003 [P]
       T001 → T004

Contract Tests: T001, T004 → T005, T006 [P] → T007

Types: T004 → T008 [P]
       T001, T004, T008 → T009 [P]

Calculations: T008 → T010 → T011 → T012
              T008 → T013 [P with above, same file]
              T010, T011, T012, T013 → T014
              T009 → T015

Components: T002, T003, T008, T009 → T016 [P]
            T002, T008, T013 → T017 [P]
            T002, T003, T008, T013 → T018 [P]
            T008, T012, T016, T017, T018 → T019
            T019 → T020

Component Tests: T016 → T021 [P]
                 T019 → T022 [P]
                 T021, T022 → T023

Integration: T020 → T024, T025, T026, T027, T028, T029, T030, T031, T032 [P]

Polish: T014, T015, T023 → T033
        T020 → T034, T035, T036 [P]
        T024-T032, T033-T036 → T037
```

---

## Parallel Execution Examples

### Batch 1: Initial Setup (after T001, T004)
```bash
# Run T002, T003 in parallel
Task 1: "Install shadcn/ui components: npx shadcn-ui@latest add button card input label collapsible separator alert"
Task 2: "Install Lucide React: npm install lucide-react"
```

### Batch 2: Contract Tests (after T001, T004)
```bash
# Run T005, T006 in parallel
Task 1: "Copy mortgage-calculator.contract.ts to __tests__/lib/mortgage-calculator.test.ts"
Task 2: "Copy validation.contract.ts to __tests__/lib/validations.test.ts"
```

### Batch 3: Types (after T004)
```bash
# Run T008, T009 in parallel (T009 needs T001 + T008 though)
Task 1: "Create src/types/loan.ts with LoanInputs, LoanResults, AmortizationEntry interfaces"
# T009 must wait for T008 to complete, so not truly parallel
```

### Batch 4: UI Components (after T002, T003, T008, T009, T013)
```bash
# Run T016, T017, T018 in parallel
Task 1: "Create LoanInputForm component in src/components/features/loan-input-form.tsx"
Task 2: "Create LoanResults component in src/components/features/loan-results.tsx"
Task 3: "Create AmortizationSchedule component in src/components/features/amortization-schedule.tsx"
```

### Batch 5: Component Tests (after T016, T019)
```bash
# Run T021, T022 in parallel
Task 1: "Write tests for LoanInputForm in __tests__/components/features/loan-input-form.test.tsx"
Task 2: "Write tests for LoanComparison in __tests__/components/features/loan-comparison.test.tsx"
```

### Batch 6: Manual Testing (after T020)
```bash
# Run T024-T032 in parallel (manual tests can be done by different people)
Task 1: "Execute quickstart scenario 1: Basic Loan Comparison"
Task 2: "Execute quickstart scenario 2: Input Validation"
Task 3: "Execute quickstart scenario 3: Real-Time Updates"
# ... etc
```

---

## Notes

- **[P] Tasks**: Different files, no dependencies, safe to parallelize
- **TDD Critical**: T005-T007 MUST complete and fail before T010-T013
- **Same File**: T010, T011, T012, T013 all modify mortgage-calculator.ts (sequential)
- **Commit Strategy**: Commit after each task or logical group
- **Testing**: Run tests frequently during development

---

## Validation Checklist

*Applied before marking tasks.md as complete*

- [x] All contract files have corresponding test tasks (T005, T006)
- [x] All entities have type definition tasks (T008: LoanInputs, LoanResults, AmortizationEntry)
- [x] All tests come before implementation (T005-T007 before T010-T013)
- [x] Parallel tasks are truly independent (verified file paths)
- [x] Each task specifies exact file path or command
- [x] No task modifies same file as another [P] task (T010-T013 sequential)
- [x] Dependencies graph is acyclic
- [x] All quickstart scenarios have corresponding tasks (T024-T032)

---

**Total Tasks**: 37
**Parallel Tasks**: 10 marked [P]
**Estimated Time**: 8-12 hours (depending on parallel execution)
**Next Step**: Begin with T001 (Install dependencies)
