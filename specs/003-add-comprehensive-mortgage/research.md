# Research: Comprehensive Mortgage Calculator Factors

**Feature**: 003-add-comprehensive-mortgage
**Date**: 2025-10-03
**Status**: Complete

## Overview

This document captures all technical research and decisions required to implement comprehensive mortgage calculator factors in the Next.js application.

## Research Questions & Findings

### 1. Down Payment Bidirectional Synchronization Pattern

**Question**: How to implement smooth percentage ↔ dollar synchronization without race conditions?

**Decision**: Use controlled component pattern with computed values
- Store both `downPaymentPercent` and `downPaymentDollar` in state
- Calculate derived value in onChange handlers, not useEffect
- Use onBlur to finalize sync (prevents jitter during typing)
- FormattedInput component already supports this pattern with internal displayValue state

**Rationale**:
- Avoids infinite render loops from useEffect chains
- Matches existing FormattedInput implementation (tax-benefits.tsx pattern)
- Provides instant visual feedback while typing
- onBlur commit prevents mid-typing calculation cascades

**Alternatives Considered**:
- Single source of truth (percentage only): Rejected - user may think in dollars
- useEffect synchronization: Rejected - causes input focus loss (we already fixed this in tax benefits)

---

### 2. PMI Calculation Implementation

**Question**: How to accurately calculate PMI based on LTV and track removal date?

**Decision**: Implement three PMI calculation modes
1. **Monthly PMI**: `(loanAmount × pmiRate) / 12`
2. **Single Premium**: Add upfront cost to closing costs, no monthly charge
3. **Lender-Paid**: Higher interest rate (not implemented in v1 - user enters adjusted rate manually)

PMI removal logic:
- Track LTV based on amortization schedule
- Mark removal month when remaining balance reaches 78% of original property value
- Display "PMI Removed" message in amortization schedule after removal month
- Recalculate monthly payment breakdown to exclude PMI after removal

**Rationale**:
- Follows federal Homeowners Protection Act of 1998 standards
- 78% LTV is automatic termination (non-negotiable)
- 80% LTV allows borrower to request removal (informational only - not enforced in calculator)

**Alternatives Considered**:
- Single flat monthly PMI: Too simplistic for comprehensive calculator
- Configurable removal threshold: Rejected - federal law mandates 78%

**References**:
- [Homeowners Protection Act of 1998](https://www.consumerfinance.gov/rules-policy/regulations/1024/20/)
- Industry standard PMI rates: 0.3% - 1.5% of loan amount annually

---

### 3. Discount Points Rate Reduction

**Question**: How much should each discount point reduce interest rate?

**Decision**: Fixed 0.25% reduction per point (clarified in spec Session 2025-10-03)

Implementation:
```typescript
function calculateEffectiveRate(baseRate: number, discountPoints: number): number {
  return baseRate - (discountPoints * 0.25);
}
```

Point cost calculation:
```typescript
function calculatePointsCost(loanAmount: number, points: number): number {
  return loanAmount * (points / 100); // 1 point = 1% of loan amount
}
```

**Rationale**:
- Industry standard approximation
- Simplifies user decision-making
- Real rates vary by lender but 0.25% is widely accepted estimate

**Alternatives Considered**:
- Configurable rate reduction: Too complex for user input
- Variable reduction based on market conditions: Out of scope

---

### 4. Bi-weekly Payment Schedule

**Question**: How to implement bi-weekly payment option?

**Decision**: 26 payments per year (true bi-weekly: every 2 weeks)

Calculation approach:
```typescript
const biweeklyPayment = monthlyPayment / 2;
const paymentsPerYear = 26; // 52 weeks / 2
const extraAnnualPayment = biweeklyPayment * 26 - monthlyPayment * 12;
```

Effect on amortization:
- Apply extra principal every 6 months (equivalent to 13th monthly payment distributed)
- Recalculate remaining balance with accelerated principal reduction
- Display savings: reduced term + total interest saved

**Rationale**:
- True bi-weekly (26 payments) is more accurate than semi-monthly (24 payments)
- Matches industry standard bi-weekly mortgage programs
- Clarified in spec Session 2025-10-03

**Alternatives Considered**:
- 24 payments (twice per month): Rejected - doesn't create extra payment
- Weekly payments: Too granular for mortgage context

---

### 5. Closing Costs Structure

**Question**: What closing cost categories are required?

**Decision**: Implement all standard categories from spec FR-010:
1. Appraisal Fee
2. Title Insurance
3. Title Search Fee
4. Recording Fees
5. Attorney Fees
6. Transfer Tax
7. Survey Fee
8. Prepaid Escrow
9. Other Closing Costs
10. Buyer's Agent Commission (optional)

Plus modifiers:
- Discount Points Cost (calculated from loan amount)
- Origination Points Cost (calculated from loan amount)
- Seller Concessions (subtract)
- Lender Credits (subtract)

Cash needed at closing formula:
```typescript
totalClosingCosts = sum(allFees) + discountPointsCost + originationPointsCost
cashNeeded = downPayment + totalClosingCosts - sellerConcessions - lenderCredits
```

**Rationale**: Matches comprehensive mortgage disclosure requirements (TRID/TILA-RESPA)

**References**:
- [CFPB Closing Disclosure Form](https://www.consumerfinance.gov/owning-a-home/closing-disclosure/)

---

### 6. Extra Payments Application

**Question**: How to apply extra payments to amortization schedule?

**Decision**: Three extra payment types supported
1. **Extra Monthly**: Add to principal every month
2. **Extra Annual**: Add to principal once per year (user-specified month)
3. **One-Time Lump Sum**: Add on specific date

Application logic:
```typescript
function applyExtraPayments(
  schedule: AmortizationEntry[],
  extraMonthly: number,
  extraAnnual: { amount: number, month: number },
  lumpSums: { amount: number, date: Date }[]
): AmortizationEntry[] {
  // Recalculate from month 1 with extra payments applied to principal
  // When principal + extra >= remaining balance, loan pays off early
  // Truncate schedule at payoff month
}
```

Display:
- Show original term vs. accelerated term
- Display total interest saved
- Highlight payoff date in amortization schedule

**Rationale**:
- All extra payments reduce principal, not interest (standard mortgage behavior)
- Recalculation from scratch ensures accuracy
- Early payoff detection prevents negative balances

---

### 7. ARM (Adjustable Rate Mortgage) Configuration

**Question**: How to model ARM loans with rate adjustments?

**Decision**: Implement basic ARM projection (v1 scope)

Configuration inputs:
- Initial fixed rate period (3, 5, 7, 10 years)
- Rate adjustment frequency after initial period (annual)
- Initial cap (first adjustment max increase, e.g., 2%)
- Periodic cap (subsequent adjustment max, e.g., 2% per year)
- Lifetime cap (maximum rate over loan life, e.g., 5% above initial)

Projection logic:
```typescript
// Assume worst-case scenario for projections
// Year 1-N: Initial fixed rate
// Year N+1: Rate + initialCap
// Year N+2 onward: min(currentRate + periodicCap, initialRate + lifetimeCap)
```

Display:
- Amortization schedule with rate changes highlighted
- Payment schedule showing minimum/maximum potential payments
- Worst-case total cost

**Rationale**:
- Provides user with risk assessment
- Worst-case scenario helps conservative decision-making
- Actual rate adjustments depend on index (SOFR, etc.) - out of scope for calculator

**Alternatives Considered**:
- Index-based projections: Rejected - requires external data and predictions
- Best-case scenario: Rejected - misleading for risk assessment

---

### 8. Component Architecture for Expanded Form

**Question**: How to organize 15-20 new input fields without overwhelming UI?

**Decision**: Use Radix UI Collapsible component to group related fields

Proposed sections:
1. **Basic Loan Details** (always visible)
   - Property Price
   - Down Payment (% and $)
   - Loan Amount (calculated, read-only)
   - Interest Rate (with discount points adjustment)
   - Loan Term

2. **Points & Fees** (collapsible)
   - Discount Points
   - Origination Points
   - Lender Credits

3. **Closing Costs** (collapsible)
   - All 10 closing cost categories
   - Seller Concessions

4. **PMI Configuration** (collapsible, conditional on <20% down)
   - PMI Type (select)
   - PMI Rate (for Monthly PMI)
   - Single Premium Amount (for Single Premium PMI)

5. **Extra Payments** (collapsible)
   - Extra Monthly Payment
   - Extra Annual Payment
   - One-Time Lump Sum (with date picker)
   - Bi-weekly Payment Toggle

6. **ARM Settings** (collapsible, conditional on ARM loan type selected)
   - Initial Rate Period
   - Adjustment Frequency
   - Initial Cap
   - Periodic Cap
   - Lifetime Cap

7. **Escrow & Fees** (existing, keep as-is)
   - Property Tax
   - Insurance
   - HOA Fees

**Rationale**:
- Collapsible sections prevent visual overwhelm
- Conditional rendering (PMI, ARM) shows only relevant fields
- Follows existing Card + CardHeader + CardContent pattern
- Maintains <200 line component limit per constitutional requirement

---

### 9. State Management Approach

**Question**: Should we use context or prop drilling for new state?

**Decision**: Continue using local state in loan-comparison.tsx with prop callbacks

State structure:
```typescript
interface LoanInputs {
  // Existing
  principal: number;
  interestRate: number;
  termYears: number;
  propertyTax?: number;
  insurance?: number;
  hoaFees?: number;
  pmi?: number;

  // NEW
  propertyPrice?: number;
  downPaymentPercent?: number;
  downPaymentDollar?: number;
  discountPoints?: number;
  originationPoints?: number;
  lenderCredits?: number;
  closingCosts: ClosingCosts;
  pmiConfig: PMIConfig;
  extraPayments: ExtraPayments;
  loanType: 'fixed' | 'arm';
  armConfig?: ARMConfig;
}
```

**Rationale**:
- Current architecture supports this (loan-comparison.tsx manages loan1 and loan2 state)
- No cross-component state sharing needed
- Avoids context complexity
- Constitution principle: avoid prop drilling beyond 2 levels - current structure is only 2 levels deep

---

### 10. Calculation Performance

**Question**: Can client-side calculations handle 360-month amortization with PMI removal and extra payments?

**Decision**: Yes, with optimization

Performance strategy:
- Memoize calculation results with useMemo (already in use)
- Only recalculate when inputs change (controlled by temp state + blur pattern)
- Generate full 360-month schedule upfront (negligible for modern browsers)
- Extra payment recalculation: O(n) where n = number of months (max 360) - acceptable

Benchmark estimate:
- 360 iterations × (5 calculations per iteration) = 1,800 operations
- Modern JavaScript: ~10-20ms for full schedule generation
- Well under 100ms performance goal

**Rationale**: No optimization needed beyond existing memoization pattern

---

## Technology Decisions

### FormattedInput Enhancement
**Current State**: FormattedInput component supports currency, percentage, and number formatting with focus/blur state management

**Required Enhancement**: None - existing implementation sufficient for new fields

**Rationale**: Already handles the temp state + blur commit pattern needed for bidirectional sync

---

### Zod Schema Extension
**Current State**: LoanInputsSchema validates principal, interestRate, termYears

**Required Extension**:
```typescript
const ClosingCostsSchema = z.object({
  appraisalFee: z.number().min(0).optional(),
  titleInsurance: z.number().min(0).optional(),
  // ... all 10 categories
});

const PMIConfigSchema = z.object({
  type: z.enum(['monthly', 'single_premium', 'lender_paid']),
  monthlyRate: z.number().min(0).max(2).optional(), // 0-2% annual
  singlePremiumAmount: z.number().min(0).optional(),
});

const LoanInputsSchemaExtended = LoanInputsSchema.extend({
  propertyPrice: z.number().positive().optional(),
  downPaymentPercent: z.number().min(0).max(100).optional(),
  downPaymentDollar: z.number().min(0).optional(),
  discountPoints: z.number().min(0).max(4).optional(), // 0-4 points typical
  // ... etc
});
```

**Rationale**: Zod provides runtime validation at form boundaries, catches invalid inputs before calculation

---

## Best Practices Applied

### Mortgage Calculation Standards
- Use standard amortization formula: `M = P × [r(1+r)^n] / [(1+r)^n - 1]`
- Round to 2 decimal places for currency, display as whole dollars
- Handle edge cases: 0% interest, early payoff, negative amortization (reject)

### React Patterns
- Controlled components for all inputs
- Memoized calculations (useMemo) to prevent unnecessary recalculation
- Composition over prop drilling
- Single responsibility components

### TypeScript Patterns
- Explicit interfaces for all entities
- No `any` types
- Discriminated unions for PMI type and loan type
- Type guards for optional fields

---

## Open Questions (None)

All clarifications were resolved in spec Session 2025-10-03:
- ✅ Down payment input method: Both percentage and dollar with sync
- ✅ PMI removal threshold: 78% LTV (federal standard)
- ✅ Discount point rate reduction: 0.25% per point
- ✅ Bi-weekly payment frequency: 26 payments/year

---

## Next Steps

Proceed to Phase 1:
1. Define data model in data-model.md
2. Generate calculation function contracts
3. Create contract tests for new calculations
4. Generate quickstart.md with acceptance scenarios
5. Update CLAUDE.md with new technical context
