# Data Model: Mortgage Tax Benefits

**Feature**: 002-app-should-be
**Date**: 2025-10-03
**Status**: Complete

## Overview

This document defines the data structures for mortgage tax benefit calculations. All types follow TypeScript strict mode requirements and integrate with the existing `LoanInputs` and `LoanResults` types.

---

## Core Entities

### 1. FilingStatus (Enum)

Represents the four federal tax filing status options.

**Type Definition**:
```typescript
type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
```

**Values**:
- `'single'` - Single filer
- `'married_joint'` - Married Filing Jointly
- `'married_separate'` - Married Filing Separately
- `'head_of_household'` - Head of Household

**Validation Rules**:
- Must be one of the four allowed values
- No null or undefined allowed (required field)

**Usage Context**: User selection in tax profile form

---

### 2. TaxProfile

Represents user's tax-related information required for benefit calculations.

**Type Definition**:
```typescript
interface TaxProfile {
  annualIncome: number;           // Annual taxable income in USD
  filingStatus: FilingStatus;     // Tax filing status
  propertyTaxAnnual: number;      // Estimated annual property taxes in USD
}
```

**Field Specifications**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `annualIncome` | number | > 0, ≤ 10,000,000 | User's annual taxable income |
| `filingStatus` | FilingStatus | enum | Federal tax filing status |
| `propertyTaxAnnual` | number | ≥ 0 | Estimated annual property taxes |

**Validation Rules**:
- `annualIncome`: Must be positive, reasonable maximum of $10M
- `filingStatus`: Must be valid enum value
- `propertyTaxAnnual`: Must be non-negative (zero is valid)

**Relationships**:
- Combined with `LoanInputs` to calculate `TaxBenefitCalculation`
- Stored in page component state
- Passed to tax calculator functions

---

### 3. TaxBracket

Represents a single federal income tax bracket definition for 2025.

**Type Definition**:
```typescript
interface TaxBracket {
  rate: number;                   // Tax rate as decimal (e.g., 0.22 for 22%)
  minIncome: number;              // Minimum income for bracket (inclusive)
  maxIncome: number | null;       // Maximum income for bracket (exclusive), null = no cap
}
```

**Field Specifications**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `rate` | number | 0 < rate ≤ 1 | Marginal tax rate as decimal |
| `minIncome` | number | ≥ 0 | Lower bound of bracket (inclusive) |
| `maxIncome` | number \| null | > minIncome or null | Upper bound (exclusive), null for top bracket |

**Example**:
```typescript
{
  rate: 0.22,
  minIncome: 47151,
  maxIncome: 100525
}
// Represents: 22% bracket applies to income from $47,151 to $100,525 (single filer)
```

**Usage Context**: Internal constant arrays defining 2025 tax brackets per filing status

---

### 4. TaxBenefitCalculation

Represents the complete calculation results for mortgage tax benefits.

**Type Definition**:
```typescript
interface TaxBenefitCalculation {
  // Input summary
  loanAmount: number;                    // Original loan amount
  firstYearInterest: number;             // Estimated first-year mortgage interest

  // Deduction calculations
  mortgageInterestDeduction: number;     // Deductible mortgage interest (may be capped at $750K limit)
  propertyTaxDeduction: number;          // Deductible property tax (SALT capped at $10K)
  totalItemizedDeductions: number;       // Sum of mortgage + property deductions
  standardDeduction: number;             // Filing-status-specific standard deduction

  // Method selection
  recommendedMethod: 'itemized' | 'standard';  // Which deduction method provides greater benefit
  additionalItemizedBenefit: number;     // Extra deduction beyond standard (0 if standard is better)

  // Tax calculation
  marginalTaxRate: number;               // User's marginal tax rate as decimal
  annualTaxSavings: number;              // Estimated annual tax savings in USD
  monthlyTaxSavings: number;             // Annual savings / 12

  // Payment impact
  originalMonthlyPayment: number;        // Monthly P&I + escrow before tax benefit
  effectiveMonthlyPayment: number;       // Original payment - monthly tax savings

  // Flags and notes
  exceeds750kLimit: boolean;             // True if loan exceeds qualified debt limit
  exceedsSALTCap: boolean;               // True if property tax exceeds $10K cap
  itemizationBeneficial: boolean;        // True if itemizing beats standard deduction
}
```

**Field Specifications**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `loanAmount` | number | > 0 | Original loan principal |
| `firstYearInterest` | number | ≥ 0 | Estimated interest paid in first year |
| `mortgageInterestDeduction` | number | ≥ 0 | Deductible interest (capped if needed) |
| `propertyTaxDeduction` | number | ≥ 0, ≤ 10000 | Deductible property tax (SALT capped) |
| `totalItemizedDeductions` | number | ≥ 0 | Sum of deductions |
| `standardDeduction` | number | > 0 | Filing-status standard deduction |
| `recommendedMethod` | enum | 'itemized' \| 'standard' | Better deduction method |
| `additionalItemizedBenefit` | number | ≥ 0 | Itemized - standard (0 if standard wins) |
| `marginalTaxRate` | number | 0 < rate ≤ 1 | User's marginal tax bracket rate |
| `annualTaxSavings` | number | ≥ 0 | Annual tax benefit in USD |
| `monthlyTaxSavings` | number | ≥ 0 | Monthly tax benefit (annual / 12) |
| `originalMonthlyPayment` | number | > 0 | Total monthly payment before tax benefit |
| `effectiveMonthlyPayment` | number | > 0 | Payment after subtracting monthly tax savings |
| `exceeds750kLimit` | boolean | true \| false | Loan exceeds qualified debt limit flag |
| `exceedsSALTCap` | boolean | true \| false | Property tax exceeds SALT cap flag |
| `itemizationBeneficial` | boolean | true \| false | Itemizing provides additional benefit flag |

**Calculation Logic**:
```typescript
// Deduction calculations
mortgageInterestDeduction = min(firstYearInterest, interestOn750k)
propertyTaxDeduction = min(propertyTaxAnnual, 10000)
totalItemizedDeductions = mortgageInterestDeduction + propertyTaxDeduction

// Method selection
if (totalItemizedDeductions > standardDeduction) {
  recommendedMethod = 'itemized'
  additionalItemizedBenefit = totalItemizedDeductions - standardDeduction
  itemizationBeneficial = true
} else {
  recommendedMethod = 'standard'
  additionalItemizedBenefit = 0
  itemizationBeneficial = false
}

// Tax savings (only from additional itemized benefit)
annualTaxSavings = additionalItemizedBenefit * marginalTaxRate
monthlyTaxSavings = annualTaxSavings / 12

// Effective payment
effectiveMonthlyPayment = originalMonthlyPayment - monthlyTaxSavings

// Flags
exceeds750kLimit = loanAmount > 750000
exceedsSALTCap = propertyTaxAnnual > 10000
```

**Usage Context**:
- Returned by `calculateTaxBenefits()` function
- Passed to `TaxBenefitsDisplay` component for rendering
- Used to display all tax benefit information to user

---

## Constants

### 2025 Tax Parameters

**Standard Deductions**:
```typescript
const STANDARD_DEDUCTIONS_2025: Record<FilingStatus, number> = {
  single: 15000,
  married_joint: 30000,
  married_separate: 15000,
  head_of_household: 22500
};
```

**Tax Limits**:
```typescript
const QUALIFIED_DEBT_LIMIT = 750000;    // Mortgage interest deduction limit
const SALT_CAP = 10000;                  // State & local tax deduction cap
```

**Tax Brackets** (see research.md for complete bracket arrays per filing status)

---

## Data Flow

```
User Inputs (Form)
├── LoanInputs (existing)
│   ├── principal
│   ├── interestRate
│   ├── termYears
│   └── ... (optional costs)
└── TaxProfile (new)
    ├── annualIncome
    ├── filingStatus
    └── propertyTaxAnnual

↓ (calculateLoanResults)

LoanResults (existing)
├── monthlyPaymentPI
├── monthlyPaymentTotal
├── totalInterest
├── totalCost
└── amortizationSchedule
    └── firstYearInterest (derived)

↓ (calculateTaxBenefits)

TaxBenefitCalculation
└── [all fields as defined above]

↓ (render)

TaxBenefitsDisplay Component
├── Shows deduction comparison
├── Shows tax savings
└── Shows effective monthly payment
```

---

## Validation Summary

All entities must pass Zod schema validation before calculation:

```typescript
// Extend existing validations.ts
export const FilingStatusSchema = z.enum([
  'single',
  'married_joint',
  'married_separate',
  'head_of_household'
]);

export const TaxProfileSchema = z.object({
  annualIncome: z.number()
    .positive("Income must be positive")
    .max(10000000, "Income must be reasonable"),
  filingStatus: FilingStatusSchema,
  propertyTaxAnnual: z.number()
    .min(0, "Property tax cannot be negative")
});
```

---

## Integration with Existing Types

**Extended LoanInputs** (no changes to existing interface, tax fields stay separate):
```typescript
// TaxProfile remains separate but is used alongside LoanInputs
// This maintains separation of concerns and keeps loan calculations pure
```

**Usage Pattern**:
```typescript
// In component
const loanResults = calculateLoanResults(loanInputs);
const taxBenefits = calculateTaxBenefits(loanInputs, taxProfile);

// Both results displayed together
<LoanResults results={loanResults} />
<TaxBenefitsDisplay
  calculation={taxBenefits}
  taxProfile={taxProfile}
  onTaxProfileChange={setTaxProfile}
/>
```

---

**File Location**: This model will be implemented in:
- `/src/types/tax.ts` - TypeScript interfaces
- `/src/lib/validations.ts` - Zod schemas (extended)
- `/src/lib/tax-calculator.ts` - Constants and calculation logic
