# Tasks: Comprehensive Mortgage Calculator Factors

**Feature**: 003-add-comprehensive-mortgage
**Input**: Design documents from `/Users/cristian/Apps/test-spec/specs/003-add-comprehensive-mortgage/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Overview

This task list implements comprehensive mortgage calculator factors following TDD principles. Total: 58 tasks across 5 phases.

**Tech Stack**: TypeScript 5, React 19, Next.js 15.5.4, Tailwind CSS 4, Zod 4.1.11, Jest 30.2.0

**Key Principles**:
- Tests before implementation (TDD)
- Parallel execution where possible [P]
- Component composition (200 line limit)
- Type safety (no `any` types)

## Phase 3.1: Type System & Validation (Foundation)

**Goal**: Extend type system with new entities and validation schemas

- [ ] **T001** [P] Extend `LoanInputs` interface in `src/types/loan.ts`
  - Add: propertyPrice, downPaymentPercent, downPaymentDollar, discountPoints, originationPoints, lenderCredits, sellerConcessions, loanType
  - Add: closingCosts, pmiConfig, extraPayments, armConfig (nested types)
  - All new fields properly typed (no `any`)

- [ ] **T002** [P] Create `ClosingCosts` interface in `src/types/loan.ts`
  - Fields: appraisalFee, titleInsurance, titleSearchFee, recordingFees, attorneyFees, transferTax, surveyFee, prepaidEscrow, otherClosingCosts, buyerAgentCommission
  - All fields optional numbers

- [ ] **T003** [P] Create `PMIConfig` interface in `src/types/loan.ts`
  - Discriminated union: type: 'monthly' | 'single_premium' | 'lender_paid' | 'none'
  - Fields: monthlyRate?, singlePremiumAmount?, removalMonth?, removalDate?
  - Conditional fields based on type

- [ ] **T004** [P] Create `ExtraPayments` interface in `src/types/loan.ts`
  - Fields: extraMonthly?, extraAnnual?, extraAnnualMonth?, lumpSums?, biweeklyEnabled?
  - LumpSumPayment sub-interface: amount, paymentMonth, paymentDate?

- [ ] **T005** [P] Create `ARMConfig` interface in `src/types/loan.ts`
  - Fields: initialFixedPeriodYears, adjustmentFrequency, initialCap, periodicCap, lifetimeCap, projectedRateSchedule?
  - ARMRateEntry sub-interface: year, rate, monthlyPayment

- [ ] **T006** [P] Extend `LoanResults` interface in `src/types/loan.ts`
  - Add: totalClosingCosts, netClosingCosts, cashNeededAtClosing
  - Add: monthlyPMI?, pmiRemovalMonth?, pmiRemovalDate?, totalPMIPaid?
  - Add: originalTermMonths, acceleratedTermMonths?, totalInterestSaved?, earlyPayoffDate?
  - Add: armProjections?, worstCaseMaxPayment?, worstCaseTotalCost?

- [ ] **T007** [P] Extend `AmortizationEntry` interface in `src/types/loan.ts`
  - Add: pmiPaid?, ltvPercent?, pmiActive, extraPrincipalPaid?, totalPayment, currentRate?, rateAdjustment?

- [ ] **T008** [P] Create `ClosingCostsSchema` in `src/lib/validations.ts`
  - Zod schema with all 10 closing cost fields as optional positive numbers
  - Export ClosingCostsSchema

- [ ] **T009** [P] Create `PMIConfigSchema` in `src/lib/validations.ts`
  - Zod discriminated union on type field
  - Conditional validation: if type='monthly' require monthlyRate (0.003-0.015 range)
  - Conditional validation: if type='single_premium' require singlePremiumAmount > 0

- [ ] **T010** [P] Create `ExtraPaymentsSchema` in `src/lib/validations.ts`
  - All payment amounts ≥ 0
  - extraAnnualMonth 1-12 if extraAnnual provided
  - lumpSums array validation (max 10 entries)

- [ ] **T011** [P] Create `ARMConfigSchema` in `src/lib/validations.ts`
  - initialFixedPeriodYears: enum [3, 5, 7, 10]
  - All caps: 0-10 range
  - adjustmentFrequency: enum ['annual', 'semi-annual']

- [ ] **T012** [P] Extend `LoanInputsSchema` in `src/lib/validations.ts`
  - Add all new fields with proper validation
  - discountPoints: 0-4 range, originationPoints: 0-3 range
  - Conditional validation: if loanType='arm' then armConfig required

## Phase 3.2: Contract Tests (TDD - Must Fail First) ⚠️ CRITICAL

**Goal**: Write failing tests for all calculation functions before implementation

- [ ] **T013** [P] Contract test `calculateEffectiveRate()` in `__tests__/lib/mortgage-calculator.test.ts`
  - Test: 6% - 1 point = 5.75%
  - Test: 6% - 2 points = 5.5%
  - Test: 1% - 10 points = 0% (floor at 0)
  - Test: 0 points = unchanged rate
  - **Must fail** (function not implemented yet)

- [ ] **T014** [P] Contract test `calculatePointsCost()` in `__tests__/lib/mortgage-calculator.test.ts`
  - Test: $500k loan, 1 discount + 1 origination = $10,000
  - Test: $500k loan, 0 points = $0
  - Test: $400k loan, 2 discount = $8,000
  - **Must fail**

- [ ] **T015** [P] Contract test `calculateTotalClosingCosts()` in `__tests__/lib/mortgage-calculator.test.ts`
  - Test: $10k costs + $5k points - $2k concessions - $1k credits = $12k
  - Test: Handle negative result (credits > costs)
  - Test: Empty closing costs = 0
  - **Must fail**

- [ ] **T016** [P] Contract test `calculateCashAtClosing()` in `__tests__/lib/mortgage-calculator.test.ts`
  - Test: $100k down + $10k closing = $110k
  - Test: $100k down + $0 closing = $100k
  - **Must fail**

- [ ] **T017** [P] Contract test `calculateLTV()` in `__tests__/lib/mortgage-calculator.test.ts`
  - Test: $400k loan / $500k property = 80%
  - Test: $450k loan / $500k property = 90%
  - Test: $500k loan / $500k property = 100%
  - **Must fail**

- [ ] **T018** [P] Contract test `calculateMonthlyPMI()` in `__tests__/lib/mortgage-calculator.test.ts`
  - Test: $400k loan, 0.5% rate, monthly type = $166.67
  - Test: $400k loan, 1% rate, monthly type = $333.33
  - Test: type='none' returns 0
  - Test: type='single_premium' returns 0
  - **Must fail**

- [ ] **T019** [P] Contract test `findPMIRemovalMonth()` in `__tests__/lib/mortgage-calculator.test.ts`
  - Test: 80% LTV loan finds removal when balance ≤ 78% of property price
  - Test: Create mock schedule, verify first month where LTV ≤ 78%
  - Test: Returns null if never reaches 78% (edge case)
  - **Must fail**

- [ ] **T020** [P] Contract test `syncDownPayment()` in `__tests__/lib/mortgage-calculator.test.ts`
  - Test: $500k property, 20% → { percent: 20, dollar: 100000, loanAmount: 400000 }
  - Test: $500k property, $100k → { percent: 20, dollar: 100000, loanAmount: 400000 }
  - Test: $500k property, 15% → { percent: 15, dollar: 75000, loanAmount: 425000 }
  - **Must fail**

- [ ] **T021** [P] Contract test `recalculateWithExtraPayments()` in `__tests__/lib/mortgage-calculator.test.ts`
  - Test: $200/month extra shortens 360-month schedule
  - Test: Bi-weekly adds equivalent of 1 extra monthly payment/year
  - Test: Lump sum at month 60 reduces balance
  - Test: Final balance reaches exactly 0
  - **Must fail**

- [ ] **T022** [P] Contract test `generateARMProjections()` in `__tests__/lib/mortgage-calculator.test.ts`
  - Test: 5/1 ARM, 5% initial, 2/2/5 caps → year 6 = 7%, year 7 = 9%, year 8+ = 10%
  - Test: 7/1 ARM, 4% initial, 5/1/6 caps → proper cap application
  - Test: Projection length = loan term in years
  - **Must fail**

- [ ] **T023** [P] Contract test `calculateComprehensiveLoanResults()` in `__tests__/lib/mortgage-calculator.test.ts`
  - Test: Complete integration with all features
  - Test: Standard 30-year fixed, 20% down (no PMI)
  - Test: 30-year fixed, 10% down, 0.5% PMI (with removal)
  - Test: 30-year with $200 extra monthly (accelerated payoff)
  - Test: 5/1 ARM with projections
  - **Must fail**

## Phase 3.3: Calculation Implementation (Make Tests Pass)

**Goal**: Implement calculation functions to make contract tests pass

- [ ] **T024** Implement `calculateEffectiveRate()` in `src/lib/mortgage-calculator.ts`
  - Formula: baseRate - (discountPoints × 0.25)
  - Floor at 0% (cannot go negative)
  - Verify T013 passes

- [ ] **T025** [P] Implement `calculatePointsCost()` in `src/lib/mortgage-calculator.ts`
  - Formula: loanAmount × (discountPoints + originationPoints) / 100
  - Verify T014 passes

- [ ] **T026** [P] Implement `calculateTotalClosingCosts()` in `src/lib/mortgage-calculator.ts`
  - Sum all ClosingCosts fields + pointsCost - sellerConcessions - lenderCredits
  - Verify T015 passes

- [ ] **T027** [P] Implement `calculateCashAtClosing()` in `src/lib/mortgage-calculator.ts`
  - Formula: downPayment + totalClosingCosts
  - Verify T016 passes

- [ ] **T028** [P] Implement `calculateLTV()` in `src/lib/mortgage-calculator.ts`
  - Formula: (loanAmount / propertyPrice) × 100
  - Return percentage (0-100+)
  - Verify T017 passes

- [ ] **T029** Implement `calculateMonthlyPMI()` in `src/lib/mortgage-calculator.ts`
  - If type='monthly': (loanAmount × monthlyRate) / 12
  - Else: return 0
  - Verify T018 passes

- [ ] **T030** Implement `findPMIRemovalMonth()` in `src/lib/mortgage-calculator.ts`
  - Depends on: calculateLTV() (T028)
  - Iterate schedule, find first month where LTV ≤ 78%
  - Return month number or null
  - Verify T019 passes

- [ ] **T031** [P] Implement `syncDownPayment()` in `src/lib/mortgage-calculator.ts`
  - If percent changed: dollar = propertyPrice × (percent / 100)
  - If dollar changed: percent = (dollar / propertyPrice) × 100
  - loanAmount = propertyPrice - dollar
  - Verify T020 passes

- [ ] **T032** Implement `recalculateWithExtraPayments()` in `src/lib/mortgage-calculator.ts`
  - Clone base schedule
  - Apply extraMonthly to every month
  - Apply extraAnnual at specified month each year
  - Apply lumpSums at specified months
  - If biweekly: add (monthlyPayment / 2 × 26 - monthlyPayment × 12) annually
  - Recalculate balance and interest after each payment
  - Truncate schedule when balance reaches 0
  - Verify T021 passes

- [ ] **T033** Implement `generateARMProjections()` in `src/lib/mortgage-calculator.ts`
  - Years 1-initialFixedPeriodYears: initial rate
  - Year N+1: min(initialRate + initialCap, initialRate + lifetimeCap)
  - Years N+2+: min(previousRate + periodicCap, initialRate + lifetimeCap)
  - Calculate monthly payment for each rate
  - Return array of { year, rate, monthlyPayment }
  - Verify T022 passes

- [ ] **T034** Implement `calculateComprehensiveLoanResults()` in `src/lib/mortgage-calculator.ts`
  - Depends on: All previous calculation functions (T024-T033)
  - Validate inputs with LoanInputsSchema
  - Calculate effective rate (discount points)
  - Calculate base monthly payment
  - Calculate monthly PMI
  - Generate base amortization schedule
  - Find PMI removal month
  - Recalculate with extra payments
  - Calculate closing costs
  - Generate ARM projections (if ARM)
  - Return complete LoanResults
  - Verify T023 passes

## Phase 3.4: Integration Tests (Acceptance Scenarios)

**Goal**: Validate all 8 acceptance scenarios from quickstart.md

- [ ] **T035** [P] Integration test Scenario 1 in `__tests__/components/features/loan-calculation.test.tsx`
  - Property Price and Down Payment
  - $700k property, 20% down → $560k loan, no PMI
  - Assert: principal = 560000, downPaymentDollar = 140000, monthlyPMI = undefined

- [ ] **T036** [P] Integration test Scenario 2 in `__tests__/components/features/loan-calculation.test.tsx`
  - Using Points to Buy Down Rate
  - 6% rate, 1 discount point → 5.75% effective, $5,600 points cost
  - Assert: effectiveRate = 5.75, closing costs include points, payment reduced

- [ ] **T037** [P] Integration test Scenario 3 in `__tests__/components/features/loan-calculation.test.tsx`
  - Lender Credits Reducing Closing Costs
  - $5k costs, $2k credits → $3k net closing
  - Assert: totalClosingCosts = 5000, netClosingCosts = 3000

- [ ] **T038** [P] Integration test Scenario 4 in `__tests__/components/features/loan-calculation.test.tsx`
  - PMI Calculation and Removal
  - 15% down (85% LTV), 0.5% PMI → removal at 78% LTV
  - Assert: monthlyPMI calculated, pmiRemovalMonth between 100-200, schedule shows removal

- [ ] **T039** [P] Integration test Scenario 5 in `__tests__/components/features/loan-calculation.test.tsx`
  - Extra Monthly Payments
  - $200/month extra → ~6.6 years saved, ~$180k interest saved
  - Assert: acceleratedTermMonths < 360, totalInterestSaved > 100000

- [ ] **T040** [P] Integration test Scenario 6 in `__tests__/components/features/loan-calculation.test.tsx`
  - Bi-weekly Payment Strategy
  - Bi-weekly enabled → ~3.8 years saved, ~$97k interest saved
  - Assert: equivalent to 1 extra monthly payment/year, acceleratedTermMonths ~314

- [ ] **T041** [P] Integration test Scenario 7 in `__tests__/components/features/loan-calculation.test.tsx`
  - Comprehensive Closing Costs
  - All 10 cost categories + points - concessions - credits
  - Assert: cashNeededAtClosing = downPayment + netClosingCosts

- [ ] **T042** [P] Integration test Scenario 8 in `__tests__/components/features/loan-calculation.test.tsx`
  - ARM Loan Configuration
  - 5/1 ARM, 2/2/5 caps → year 6: 7%, year 7: 9%, year 8+: 10%
  - Assert: armProjections correct, worstCaseMaxPayment > initial payment

## Phase 3.5: UI Component Refactoring

**Goal**: Extract input sections into composable components (under 200 lines each)

- [ ] **T043** [P] Create `DownPaymentSection` component in `src/components/features/loan-sections/down-payment-section.tsx`
  - Fields: Property Price, Down Payment (%), Down Payment ($)
  - Bi-directional sync using syncDownPayment()
  - Auto-calculate Loan Amount (read-only display)
  - Props: values, onChange handlers
  - Mark as 'use client'

- [ ] **T044** [P] Create `PointsFeesSection` component in `src/components/features/loan-sections/points-fees-section.tsx`
  - Collapsible section using Radix Collapsible
  - Fields: Discount Points, Origination Points, Lender Credits
  - Display calculated: Points Cost, Effective Interest Rate
  - Props: values, onChange handlers, loanAmount (for cost calculation)
  - Mark as 'use client'

- [ ] **T045** [P] Create `ClosingCostsSection` component in `src/components/features/loan-sections/closing-costs-section.tsx`
  - Collapsible section
  - All 10 closing cost input fields
  - Field: Seller Concessions
  - Display calculated: Total Closing Costs, Net Closing Costs
  - Props: closingCosts object, onChange handler
  - Mark as 'use client'

- [ ] **T046** [P] Create `PMIConfigSection` component in `src/components/features/loan-sections/pmi-config-section.tsx`
  - Collapsible section
  - Conditional rendering: only show if LTV > 80%
  - Select: PMI Type (monthly/single_premium/lender_paid/none)
  - Conditional fields based on type
  - Props: pmiConfig, onChange, ltvPercent (for visibility)
  - Mark as 'use client'

- [ ] **T047** [P] Create `ExtraPaymentsSection` component in `src/components/features/loan-sections/extra-payments-section.tsx`
  - Collapsible section
  - Fields: Extra Monthly, Extra Annual (with month selector), Lump Sums (array input)
  - Toggle: Enable Bi-weekly Payments
  - Props: extraPayments object, onChange handler
  - Mark as 'use client'

- [ ] **T048** [P] Create `ARMConfigSection` component in `src/components/features/loan-sections/arm-config-section.tsx`
  - Collapsible section
  - Conditional rendering: only show if loanType='arm'
  - Fields: Initial Fixed Period, Adjustment Frequency, Initial Cap, Periodic Cap, Lifetime Cap
  - Props: armConfig, onChange, visible (based on loanType)
  - Mark as 'use client'

- [ ] **T049** Refactor `loan-input-form.tsx` to compose sections
  - Depends on: T043-T048 (all section components)
  - Import all 6 section components
  - Replace inline fields with section components
  - Keep existing: Loan Term, Interest Rate, Property Tax, Insurance, HOA
  - Pass appropriate props to each section
  - Ensure total component under 200 lines
  - Maintain 'use client' directive

- [ ] **T050** Update `loan-comparison.tsx` state management
  - Depends on: T049 (refactored form)
  - Add state for all new LoanInputs fields
  - Initialize: closingCosts = {}, pmiConfig = { type: 'none' }, extraPayments = {}, loanType = 'fixed'
  - Update handleLoan1Change and handleLoan2Change to handle nested objects
  - Ensure calculations trigger on state changes via useMemo

## Phase 3.6: Results Display Enhancements

**Goal**: Display comprehensive calculation results

- [ ] **T051** [P] Update `loan-results.tsx` to display closing costs breakdown
  - Add "Closing Costs" section after monthly payment
  - Table/list showing all 10 closing cost line items
  - Display: Discount Points Cost, Origination Points Cost
  - Display: Total Closing Costs, Seller Concessions, Lender Credits, Net Closing Costs
  - Display: Cash Needed at Closing (prominent)
  - Props: results.totalClosingCosts, results.cashNeededAtClosing, etc.

- [ ] **T052** [P] Update `loan-results.tsx` to display PMI information
  - If monthlyPMI exists: show "Monthly PMI: $XXX"
  - If pmiRemovalMonth exists: show "PMI Removal Date: Month XXX (MMM YYYY)"
  - If totalPMIPaid exists: show "Total PMI Paid: $XXX"
  - Message: "No PMI Required" if none

- [ ] **T053** [P] Update `loan-results.tsx` to display extra payment savings
  - If acceleratedTermMonths exists:
    - Show "Original Term: XXX months (YY years)"
    - Show "Accelerated Term: XXX months (YY years)"
    - Show "Time Saved: XX months (YY years)"
  - If totalInterestSaved exists:
    - Show "Interest Saved: $XXX,XXX"
  - If earlyPayoffDate exists: show payoff date

- [ ] **T054** [P] Update `loan-results.tsx` to display ARM projections
  - If armProjections exists:
    - Table: Year | Rate | Monthly Payment
    - Highlight rate changes
    - Show "Worst-Case Maximum Payment: $XXX"
    - Show "Worst-Case Total Cost: $XXX,XXX"
  - Only display for ARM loans

- [ ] **T055** Update `amortization-schedule.tsx` to show PMI column
  - Add "PMI" column to table
  - Display pmiPaid for each month
  - Highlight PMI removal month (when pmiActive changes from true to false)
  - Show LTV percentage for each month

- [ ] **T056** Update `amortization-schedule.tsx` to show extra payments column
  - Add "Extra Principal" column
  - Display extraPrincipalPaid for each month
  - Update "Total Payment" column to include extra

## Phase 3.7: Quality & Validation

**Goal**: Ensure all tests pass and quality gates are met

- [ ] **T057** Run full test suite and verify all tests pass
  - Command: `npm test`
  - All contract tests passing (T013-T023)
  - All integration tests passing (T035-T042)
  - Zero test failures
  - Fix any failures before proceeding

- [ ] **T058** Run build and linting verification
  - Command: `npm run build` (must succeed with 0 type errors)
  - Command: `npm run lint` (must pass with 0 errors)
  - Fix any TypeScript errors
  - Fix any ESLint violations
  - Ensure constitutional compliance maintained

---

## Dependencies

**Phase Dependencies**:
- Phase 3.2 (Tests) depends on Phase 3.1 (Types)
- Phase 3.3 (Implementation) depends on Phase 3.2 (Tests must fail first)
- Phase 3.4 (Integration Tests) depends on Phase 3.3 (Implementation complete)
- Phase 3.5 (UI Refactor) depends on Phase 3.3 (Calculations working)
- Phase 3.6 (Results Display) depends on Phase 3.3 (Calculations working)
- Phase 3.7 (Quality) depends on all previous phases

**Task-Level Dependencies**:
- T030 (findPMIRemovalMonth) depends on T028 (calculateLTV)
- T034 (calculateComprehensiveLoanResults) depends on T024-T033 (all calculations)
- T049 (refactor form) depends on T043-T048 (section components)
- T050 (update state) depends on T049 (refactored form)
- T057-T058 depend on all implementation tasks

## Parallel Execution Examples

**Types & Validation (Phase 3.1)** - All can run in parallel:
```bash
# Launch T001-T012 together (different parts of same files, but independent)
# Or batch in groups:
# Group 1: Type definitions
T001, T002, T003, T004, T005, T006, T007

# Group 2: Validation schemas
T008, T009, T010, T011, T012
```

**Contract Tests (Phase 3.2)** - All can run in parallel after types complete:
```bash
# Launch T013-T023 together (all independent test files)
T013, T014, T015, T016, T017, T018, T019, T020, T021, T022, T023
```

**Implementation (Phase 3.3)** - Some parallel, some sequential:
```bash
# Group 1 (parallel - independent calculations):
T024, T025, T026, T027, T028, T031

# Group 2 (after T028):
T029, T030

# Group 3 (after T024-T031):
T032, T033

# Solo (after all):
T034
```

**Integration Tests (Phase 3.4)** - All can run in parallel:
```bash
# Launch T035-T042 together (independent test scenarios)
T035, T036, T037, T038, T039, T040, T041, T042
```

**UI Sections (Phase 3.5)** - Sections parallel, composition sequential:
```bash
# Group 1 (parallel - different files):
T043, T044, T045, T046, T047, T048

# Group 2 (after sections complete):
T049, T050
```

**Results Display (Phase 3.6)** - All can run in parallel:
```bash
# Launch T051-T056 together (different sections of results/schedule components)
# Note: T051-T054 modify loan-results.tsx (same file) - do sequentially
# T055-T056 modify amortization-schedule.tsx (same file) - do sequentially

# Sequential within component:
T051 → T052 → T053 → T054
T055 → T056
```

## Validation Checklist

Pre-execution validation:
- [x] All contracts have corresponding tests (T013-T023)
- [x] All entities have type definitions (T001-T007)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks truly independent (verified [P] markers)
- [x] Each task specifies exact file path
- [x] TDD workflow enforced (tests fail first)

Post-execution validation (T057-T058):
- [ ] All tests passing (npm test)
- [ ] Build succeeds (npm run build)
- [ ] Linting passes (npm run lint)
- [ ] No TypeScript errors
- [ ] All 8 acceptance scenarios validated
- [ ] Performance <100ms for calculations
- [ ] Component line counts under 200

## Notes

**TDD Critical**: Phase 3.2 tests MUST fail before implementing Phase 3.3. Do not proceed to implementation until you have confirmed failing tests.

**Component Architecture**: Each extracted section component must:
- Be under 200 lines
- Have single responsibility
- Use FormattedInput for currency/percentage fields
- Include 'use client' directive
- Accept props for values and onChange handlers

**State Management**: Continue using local state in loan-comparison.tsx. No context needed (only 2 levels deep).

**Type Safety**: Zero `any` types allowed. All new code must pass TypeScript strict mode.

**Performance**: All calculations must complete in <100ms. Use useMemo to prevent unnecessary recalculation.

---

**Ready for execution**: Tasks are ordered, dependencies documented, parallel opportunities identified. Start with Phase 3.1 (T001-T012). 🚀
