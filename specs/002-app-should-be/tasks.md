# Tasks: Mortgage Tax Benefits Display

**Feature**: 002-app-should-be
**Branch**: `002-app-should-be`
**Input**: Design documents from `/specs/002-app-should-be/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → ✅ Tech stack: TypeScript 5, Next.js 15.5.4, React 19, Zod 4.1.11
   → ✅ Structure: Single project (src/, __tests__/)
2. Load optional design documents:
   → ✅ data-model.md: 4 entities (FilingStatus, TaxProfile, TaxBracket, TaxBenefitCalculation)
   → ✅ contracts/: 2 contract files (tax-calculator, tax-benefits-component)
   → ✅ research.md: 7 technical decisions documented
   → ✅ quickstart.md: 10 validation scenarios
3. Generate tasks by category:
   → Setup: Type definitions, validation schemas
   → Tests: 2 contract test files (48 test cases total)
   → Core: Tax calculator functions, component implementation
   → Integration: Extend existing loan types and components
   → Polish: Integration tests, quickstart validation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → ✅ All contracts have tests
   → ✅ All entities have type definitions
   → ✅ All functions implemented
9. Return: ✅ SUCCESS (20 tasks ready for execution)
```

---

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- All paths relative to repository root

---

## Phase 3.1: Setup & Type Definitions

### T001 [P] Create TypeScript type definitions for tax entities
**File**: `src/types/tax.ts`
**Description**: Create complete type definitions for tax-related entities based on data-model.md:
- `FilingStatus` type (union of 4 string literals)
- `TaxProfile` interface (annualIncome, filingStatus, propertyTaxAnnual)
- `TaxBracket` interface (rate, minIncome, maxIncome)
- `TaxBenefitCalculation` interface (all 18 fields from data model)
- Export all types for use across the codebase

**Dependencies**: None
**Acceptance**: File compiles without errors; all types exported

---

### T002 [P] Extend Zod validation schemas for tax inputs
**File**: `src/lib/validations.ts`
**Description**: Extend existing Zod schemas with tax-related validation:
- `FilingStatusSchema`: Zod enum with 4 allowed values
- `TaxProfileSchema`: Zod object schema with validation rules:
  - `annualIncome`: positive, max 10M
  - `filingStatus`: enum validation
  - `propertyTaxAnnual`: non-negative (≥0)
- Export schemas and infer types
- Follow existing pattern in validations.ts (see LoanInputsSchema)

**Dependencies**: T001 (needs FilingStatus type)
**Acceptance**: Schemas validate correctly; invalid inputs rejected with clear messages

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation of Phase 3.3**

### T003 [P] Copy tax calculator contract tests to __tests__
**File**: `__tests__/lib/tax-calculator.contract.test.ts`
**Description**: Copy the contract test file from specs to the test directory:
- Source: `specs/002-app-should-be/contracts/tax-calculator.contract.ts`
- Destination: `__tests__/lib/tax-calculator.contract.test.ts`
- Update imports to match actual file locations
- Verify tests compile but FAIL (no implementation yet)
- 48 test cases covering:
  - `calculateMarginalTaxRate()` (7 tests)
  - `getStandardDeduction()` (4 tests)
  - `calculateFirstYearInterest()` (3 tests)
  - `calculateTaxBenefits()` (30+ tests including edge cases)

**Dependencies**: T001, T002 (needs types and schemas)
**Acceptance**: All tests compile; all tests FAIL with "not implemented" errors

---

### T004 [P] Copy tax benefits component contract tests to __tests__
**File**: `__tests__/components/tax-benefits.contract.test.tsx`
**Description**: Copy the component contract test file from specs to the test directory:
- Source: `specs/002-app-should-be/contracts/tax-benefits-component.contract.tsx`
- Destination: `__tests__/components/tax-benefits.contract.test.tsx`
- Update imports to match actual file locations
- Verify tests compile but FAIL (component doesn't exist yet)
- Test categories:
  - Rendering (4 tests)
  - Calculation Display (8 tests)
  - Standard Deduction Scenario (2 tests)
  - Interaction (3 tests)
  - Warning Indicators (2 tests)
  - Accessibility (2 tests)

**Dependencies**: T001 (needs TaxBenefitCalculation type)
**Acceptance**: Tests compile; all tests FAIL with "component not found" error

---

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### T005 [P] Implement 2025 tax bracket constants
**File**: `src/lib/tax-calculator.ts` (create new file)
**Description**: Define 2025 federal tax bracket constants as specified in research.md:
- `QUALIFIED_DEBT_LIMIT = 750000`
- `SALT_CAP = 10000`
- `STANDARD_DEDUCTIONS_2025`: Record<FilingStatus, number> with values:
  - single: 15000
  - married_joint: 30000
  - married_separate: 15000
  - head_of_household: 22500
- `TAX_BRACKETS_2025`: Record<FilingStatus, TaxBracket[]> with all 7 brackets per filing status:
  - Single filer brackets (10%, 12%, 22%, 24%, 32%, 35%, 37%)
  - Married Filing Jointly brackets
  - Married Filing Separately brackets
  - Head of Household brackets
- Use exact thresholds from research.md

**Dependencies**: T001 (needs FilingStatus, TaxBracket types)
**Acceptance**: Constants compile; values match research.md exactly

---

### T006 Implement calculateMarginalTaxRate function
**File**: `src/lib/tax-calculator.ts`
**Description**: Implement marginal tax rate calculation:
```typescript
export function calculateMarginalTaxRate(
  income: number,
  filingStatus: FilingStatus
): number
```
- Load appropriate bracket array for filing status
- Find bracket where income falls (minIncome ≤ income < maxIncome)
- Return bracket rate as decimal (e.g., 0.22 for 22%)
- Handle edge cases: $0 income → 10%, very high income → 37%
- Must pass T003 contract tests (7 test cases)

**Dependencies**: T003 (tests must be failing), T005 (needs bracket constants)
**Acceptance**: 7 calculateMarginalTaxRate tests pass in T003

---

### T007 Implement getStandardDeduction function
**File**: `src/lib/tax-calculator.ts`
**Description**: Implement standard deduction lookup:
```typescript
export function getStandardDeduction(filingStatus: FilingStatus): number
```
- Simple lookup in STANDARD_DEDUCTIONS_2025 constant
- Return filing-status-specific standard deduction
- Must pass T003 contract tests (4 test cases)

**Dependencies**: T003 (tests must be failing), T005 (needs constant)
**Acceptance**: 4 getStandardDeduction tests pass in T003

---

### T008 Implement calculateFirstYearInterest function
**File**: `src/lib/tax-calculator.ts`
**Description**: Calculate first-year mortgage interest:
```typescript
export function calculateFirstYearInterest(loanInputs: LoanInputs): number
```
- Use existing `generateAmortizationSchedule()` from mortgage-calculator.ts
- Sum `interestPaid` for first 12 payments
- Handle 0% interest rate (return 0)
- Must pass T003 contract tests (3 test cases)

**Dependencies**: T003 (tests must be failing), existing mortgage-calculator.ts
**Acceptance**: 3 calculateFirstYearInterest tests pass in T003

---

### T009 Implement calculateTaxBenefits function
**File**: `src/lib/tax-calculator.ts`
**Description**: Implement complete tax benefit calculation:
```typescript
export function calculateTaxBenefits(
  loanInputs: LoanInputs,
  taxProfile: TaxProfile
): TaxBenefitCalculation
```
- Calculate first-year interest using T008 function
- Apply $750K debt limit (cap interest if loan > 750K)
- Cap property tax at $10K SALT limit
- Calculate total itemized deductions
- Get standard deduction for filing status
- Compare itemized vs standard, select better method
- Calculate additional benefit (itemized - standard, or 0)
- Get marginal tax rate using T006 function
- Calculate annual and monthly savings
- Calculate effective monthly payment
- Set all boolean flags (exceeds750kLimit, exceedsSALTCap, itemizationBeneficial)
- Return complete TaxBenefitCalculation object
- Must pass T003 contract tests (30+ test cases including edge cases)

**Dependencies**: T003, T006, T007, T008 (needs all calculation functions)
**Acceptance**: All remaining T003 tests pass (48 total tests passing)

---

### T010 [P] Implement TaxBenefitsDisplay component
**File**: `src/components/features/tax-benefits.tsx`
**Description**: Create tax benefits display component:
```typescript
'use client';

interface TaxBenefitsDisplayProps {
  calculation: TaxBenefitCalculation;
  taxProfile: TaxProfile;
  onTaxProfileChange: (profile: TaxProfile) => void;
}
```
- Mark as Client Component (`'use client'`)
- Render form inputs:
  - Annual Income input (number, with validation)
  - Filing Status select (4 options dropdown)
  - Property Tax Annual input (number, with validation)
- Display calculation results:
  - Marginal tax rate (formatted as percentage)
  - Mortgage interest deduction (formatted currency)
  - Property tax deduction (formatted currency, show SALT cap indicator if applicable)
  - Total itemized vs standard deduction comparison
  - Recommended method (visual indicator: itemized or standard)
  - Annual and monthly tax savings (formatted currency)
  - Effective monthly payment (formatted currency)
- Warning indicators:
  - Show alert if exceeds750kLimit
  - Show info badge if exceedsSALTCap
- Disclaimer text: "Tax benefit estimates assume full-year deductions. Consult a tax professional."
- Use existing UI components from /components/ui/ (Card, Input, Label, Alert)
- Follow existing component patterns (see loan-results.tsx)
- Must pass T004 contract tests (21 test cases)

**Dependencies**: T004 (tests must be failing), T001 (needs types)
**Acceptance**: All T004 tests pass; component renders correctly

---

## Phase 3.4: Integration

### T011 Extend LoanInputs type with optional propertyTax field
**File**: `src/types/loan.ts`
**Description**: Verify LoanInputs already has `propertyTax?: number` field:
- Check existing LoanInputs interface
- If missing, add `propertyTax?: number` as optional field
- This field should already exist based on mortgage-calculator.ts usage
- No breaking changes to existing code

**Dependencies**: None
**Acceptance**: LoanInputs has propertyTax field; existing tests still pass

---

### T012 Update page.tsx to add tax profile state
**File**: `src/app/page.tsx`
**Description**: Integrate tax benefits into main calculator page:
- Import TaxProfile type and TaxBenefitsDisplay component
- Add taxProfile state:
  ```typescript
  const [taxProfile, setTaxProfile] = useState<TaxProfile>({
    annualIncome: 0,
    filingStatus: 'married_joint',
    propertyTaxAnnual: 0
  });
  ```
- Calculate tax benefits when both loanResults and taxProfile are valid:
  ```typescript
  const taxBenefits = useMemo(() => {
    if (loanResults && taxProfile.annualIncome > 0) {
      return calculateTaxBenefits(loanInputs, taxProfile);
    }
    return null;
  }, [loanResults, taxProfile, loanInputs]);
  ```
- Render TaxBenefitsDisplay ABOVE amortization schedule (per spec requirement):
  ```
  <LoanResults results={loanResults} />
  {taxBenefits && (
    <TaxBenefitsDisplay
      calculation={taxBenefits}
      taxProfile={taxProfile}
      onTaxProfileChange={setTaxProfile}
    />
  )}
  <AmortizationSchedule ... />
  ```

**Dependencies**: T009 (needs calculateTaxBenefits), T010 (needs component)
**Acceptance**: Tax benefits section appears above amortization; calculations update in real-time

---

### T013 Update loan-input-form.tsx to include property tax input
**File**: `src/components/features/loan-input-form.tsx`
**Description**: Add property tax input field to loan input form (if not already present):
- Check if propertyTax input already exists in the form
- If missing, add input field for annual property tax:
  - Label: "Annual Property Tax (optional)"
  - Input type: number
  - Validation: non-negative
  - Default: 0
- Use existing Input and Label components
- Follow existing input pattern for other optional fields (insurance, HOA, PMI)

**Dependencies**: T011 (needs updated LoanInputs type)
**Acceptance**: Property tax can be entered; value flows to tax calculations

---

## Phase 3.5: Polish & Validation

### T014 [P] Create unit tests for helper functions
**File**: `__tests__/lib/tax-calculator.unit.test.ts`
**Description**: Add focused unit tests for edge cases not covered by contracts:
- Test boundary conditions:
  - Income exactly at bracket threshold
  - Loan exactly at $750K limit
  - Property tax exactly at $10K SALT cap
- Test error handling:
  - Negative income (should handle gracefully or throw)
  - Invalid filing status
  - Zero loan amount
- Test calculation precision:
  - Rounding behavior for monthly savings
  - Currency formatting edge cases
- Minimum 15 additional test cases

**Dependencies**: T009 (implementation complete)
**Acceptance**: All unit tests pass; edge cases covered

---

### T015 [P] Verify TypeScript compilation with strict mode
**File**: `tsconfig.json` (verify), all new files
**Description**: Ensure all new code passes TypeScript strict mode:
- Run `npx tsc --noEmit` to check for type errors
- Verify no `any` types in new code (per constitution)
- Verify all function parameters and returns explicitly typed
- Check all new imports resolve correctly
- Fix any type errors found

**Dependencies**: All implementation tasks (T001-T013)
**Acceptance**: `npx tsc --noEmit` passes with zero errors

---

### T016 [P] Run ESLint and fix violations
**File**: All new TypeScript/React files
**Description**: Lint all new code and fix violations:
- Run `npm run lint` from repository root
- Fix any linting errors in new files:
  - `src/types/tax.ts`
  - `src/lib/tax-calculator.ts`
  - `src/components/features/tax-benefits.tsx`
  - All test files
- Follow Next.js ESLint rules (eslint-config-next)
- Address unused imports, missing dependencies, etc.

**Dependencies**: All implementation tasks (T001-T013)
**Acceptance**: `npm run lint` passes with zero errors for new files

---

### T017 Run full test suite and verify all tests pass
**File**: All test files
**Description**: Execute complete test suite:
- Run `npm test` to execute all tests (Jest)
- Verify all contract tests pass (T003, T004)
- Verify all unit tests pass (T014)
- Verify existing mortgage calculator tests still pass (no regressions)
- Test coverage should include:
  - 48 contract tests for tax-calculator
  - 21 contract tests for tax-benefits component
  - 15+ unit tests for edge cases
  - Existing mortgage calculator tests
- Fix any failing tests

**Dependencies**: T003, T004, T014, all implementation (T005-T013)
**Acceptance**: `npm test` passes with 100% success rate; no regressions

---

### T018 Execute quickstart validation scenarios
**File**: `specs/002-app-should-be/quickstart.md`
**Description**: Manually validate feature using quickstart scenarios:
- Start dev server: `npm run dev`
- Execute all 10 test scenarios from quickstart.md:
  1. Standard itemization benefit (MFJ)
  2. Standard deduction is better (low mortgage)
  3. Filing status change (MFJ → Single)
  4. High property tax (SALT cap applied)
  5. Loan exceeds $750K qualified debt limit
  6. Real-time calculation updates
  7. All four filing statuses
  8. Validation errors
  9. Zero property tax
  10. UI positioning (tax benefits above amortization)
- Verify regression check (existing functionality intact)
- Verify performance check (<50ms calculations)
- Document any issues found

**Dependencies**: T012 (integration complete), T017 (tests pass)
**Acceptance**: All 10 scenarios pass; acceptance sign-off checklist complete

---

### T019 Build production bundle and verify no errors
**File**: Repository root
**Description**: Build production version and verify:
- Run `npm run build` (Next.js build with Turbopack)
- Verify build succeeds without errors
- Check for any warnings related to new code
- Verify bundle size impact is reasonable (<20KB increase)
- Check that unused code is tree-shaken
- Verify no console errors in production build

**Dependencies**: T015, T016, T017 (all code verified)
**Acceptance**: Production build succeeds; bundle size within acceptable range

---

### T020 Final code review and cleanup
**File**: All new files
**Description**: Final review and cleanup:
- Remove any console.log or debug statements
- Verify all comments are accurate and helpful
- Check for code duplication opportunities to refactor
- Ensure consistent formatting (Prettier if configured)
- Verify all file headers/imports organized
- Double-check constitutional compliance:
  - ✓ Type safety (no `any` types)
  - ✓ Component architecture (single responsibility)
  - ✓ Code organization (correct directories)
  - ✓ Server-first pattern (client components marked)
- Update CLAUDE.md if needed (should already be done)

**Dependencies**: T019 (all testing complete)
**Acceptance**: Code is clean, well-documented, and follows all project standards

---

## Dependencies Graph

```
T001 (types) ────────┬─→ T002 (validation) ──→ T003 (contract tests calculator) ──┬─→ T005 (constants) ─→ T006 (marginal rate) ──┐
                     │                                                             │                                               │
                     └─→ T004 (contract tests component) ─────────────────────────┘                                               │
                                                                                                                                    ↓
T008 (first year interest) ←───────────────────────────────────────────────────────────────────────────────────────── T007 (std deduction)
         │                                                                                                                          │
         └─→ T009 (calculateTaxBenefits) ←────────────────────────────────────────────────────────────────────────────────────────┘
                     │
                     ├─→ T010 (component) ─────┐
                     │                          │
                     │                          ├─→ T012 (page integration) ──→ T013 (form update) ──┐
                     │                          │                                                      │
T011 (extend types) ─┘                          │                                                      │
                                                │                                                      │
         ┌──────────────────────────────────────┴──────────────────────────────────────────────────────┴─────────────────┐
         │                                                                                                                 │
         ├─→ T014 [P] (unit tests) ─────────────────────────────────────────────────────────────────────────────────┐    │
         │                                                                                                            │    │
         ├─→ T015 [P] (TypeScript check) ──────────────────────────────────────────────────────────────────────────┤    │
         │                                                                                                            │    │
         └─→ T016 [P] (ESLint) ────────────────────────────────────────────────────────────────────────────────────┴─→ T017 (test suite)
                                                                                                                            │
                                                                                                                            ├─→ T018 (quickstart)
                                                                                                                            │
                                                                                                                            └─→ T019 (build) ─→ T020 (cleanup)
```

---

## Parallel Execution Examples

### Batch 1: Type Definitions (Independent)
```bash
# Both tasks create different files, can run together
Task 1: Create TypeScript type definitions (src/types/tax.ts)
Task 2: Extend Zod validation schemas (src/lib/validations.ts)
```

### Batch 2: Contract Tests (Independent)
```bash
# Both tests are in different files, can run together
Task 3: Copy tax calculator contract tests (__tests__/lib/)
Task 4: Copy tax benefits component contract tests (__tests__/components/)
```

### Batch 3: Polish Tasks (Independent)
```bash
# All operate on different files or are read-only checks
Task 14: Create unit tests (new test file)
Task 15: Verify TypeScript compilation (read-only check)
Task 16: Run ESLint (read-only check + auto-fixes)
```

### Sequential Requirements
- T005-T009 MUST be sequential (same file: tax-calculator.ts)
- T012-T013 MUST be sequential (modify page.tsx then loan-input-form.tsx, but T013 depends on T012 changes)
- T017-T020 MUST be sequential (each depends on previous verification)

---

## Task Execution Checklist

### Pre-Execution
- [ ] Verify on branch `002-app-should-be`
- [ ] All design documents reviewed (plan.md, data-model.md, contracts/, quickstart.md)
- [ ] Existing tests pass: `npm test`
- [ ] Dev server runs: `npm run dev`

### During Execution
- [ ] Follow TDD: Write/copy tests before implementation
- [ ] Verify tests FAIL before implementing
- [ ] Commit after each task completion
- [ ] Run linter periodically: `npm run lint`

### Post-Execution
- [X] All 20 tasks completed
- [X] All tests pass (120 total test cases)
- [X] Production build succeeds
- [ ] All quickstart scenarios validated
- [X] Constitutional compliance verified
- [X] No regressions in existing functionality

---

## Notes

- **TDD Critical**: T003-T004 MUST fail before T005-T010 implementation
- **Same File Tasks**: T005-T009 all modify `tax-calculator.ts` - must be sequential
- **Integration Order**: T012 (page) before T013 (form) to ensure proper data flow
- **Performance Target**: Calculations must complete <50ms (verified in T018)
- **Constitutional Compliance**: All tasks align with constitution v1.0.0
- **Parallel Opportunities**: 6 tasks marked [P] can run concurrently with their batch
- **Existing Code**: Tasks T011-T013 integrate with existing codebase - minimal changes

---

## Validation Checklist
*GATE: Checked before marking feature complete*

- [x] All contracts have corresponding tests (T003, T004)
- [x] All entities have type definitions (T001)
- [x] All tests come before implementation (T003-T004 before T005-T010)
- [x] Parallel tasks truly independent (verified: different files)
- [x] Each task specifies exact file path (all tasks include file paths)
- [x] No task modifies same file as another [P] task (validated)
- [x] TDD workflow enforced (tests must fail first)
- [x] Integration preserves existing functionality (regression tests required)
- [x] Constitutional principles maintained throughout

---

**Total Tasks**: 20
**Parallel Opportunities**: 6 tasks can run concurrently
**Estimated Completion Time**: 8-12 hours for experienced developer
**Risk Level**: Low (extends existing patterns, comprehensive tests)

**Ready for Execution**: ✅ All tasks are specific, ordered, and actionable
