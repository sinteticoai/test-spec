# Data Model: Mortgage Calculator

## Overview
Type definitions and data structures for the mortgage loan comparison calculator. All types are client-side TypeScript interfaces with Zod runtime validation.

---

## Core Entities

### 1. LoanInputs
Represents user-provided loan parameters.

```typescript
interface LoanInputs {
  // Required fields
  principal: number;              // Loan amount in USD ($1,000 - $10,000,000)
  interestRate: number;           // Annual percentage rate (0.01% - 20%)
  termYears: number;              // Loan duration in years (1 - 50)

  // Optional additional costs
  propertyTax?: number;           // Annual property tax in USD (≥0)
  insurance?: number;             // Annual homeowners insurance in USD (≥0)
  hoaFees?: number;               // Monthly HOA fees in USD (≥0)
  pmi?: number;                   // Monthly PMI in USD (≥0)
}
```

**Validation Rules** (from FR-007):
- `principal`: min $1,000, max $10,000,000
- `interestRate`: min 0.01%, max 20%
- `termYears`: min 1, max 50 (integer)
- All optional fields: min 0, no upper bound

**Business Rules**:
- Required fields must be present to calculate results
- Optional fields default to 0 if omitted
- Interest rate stored as percentage (5 = 5%, not 0.05)

**State Transitions**:
- Initial: All fields undefined/empty
- Partial: Some required fields filled
- Valid: All required fields within ranges → triggers calculation
- Invalid: Any field outside range → shows error message

---

### 2. LoanResults
Represents calculated mortgage outcomes.

```typescript
interface LoanResults {
  // Core calculations
  monthlyPaymentPI: number;       // Principal + Interest only (USD)
  monthlyPaymentTotal: number;    // Total with additional costs (USD)
  totalInterest: number;          // Total interest over loan life (USD)
  totalCost: number;              // Total amount paid over loan life (USD)

  // Amortization details
  amortizationSchedule: AmortizationEntry[];  // Payment-by-payment breakdown
}
```

**Calculation Formulas**:

**monthlyPaymentPI**:
```
If interestRate > 0:
  r = interestRate / 12 / 100
  n = termYears × 12
  M = principal × [r(1 + r)^n] / [(1 + r)^n - 1]
Else (0% interest):
  M = principal / (termYears × 12)
```

**monthlyPaymentTotal**:
```
Total = monthlyPaymentPI +
        (propertyTax / 12) +
        (insurance / 12) +
        hoaFees +
        pmi
```

**totalInterest**:
```
Sum of all interest payments in amortizationSchedule
```

**totalCost**:
```
(monthlyPaymentTotal × termYears × 12)
```

**Precision**: All currency values rounded to 2 decimals at display time, full precision during calculation.

---

### 3. AmortizationEntry
Represents a single payment period in the amortization schedule.

```typescript
interface AmortizationEntry {
  paymentNumber: number;          // Payment index (1 to n)
  paymentDate: Date;              // Calculated date (assumes today as start)
  principalPaid: number;          // Principal portion of payment (USD)
  interestPaid: number;           // Interest portion of payment (USD)
  remainingBalance: number;       // Loan balance after payment (USD)
}
```

**Calculation Algorithm** (per payment):
```
For payment i (1 to n):
  interestPaid[i] = remainingBalance[i-1] × monthlyRate
  principalPaid[i] = monthlyPaymentPI - interestPaid[i]
  remainingBalance[i] = remainingBalance[i-1] - principalPaid[i]
  paymentDate[i] = startDate + i months
```

**Edge Cases**:
- Final payment: Adjust principal to zero out remaining balance (handle rounding)
- 0% interest: interestPaid = 0, principalPaid = M for all payments

**Size Constraints**:
- Max entries: 600 (50 years × 12 months)
- Total schedule size: ~600 × 5 fields = 3000 data points

---

## Validation Schemas (Zod)

### LoanInputsSchema
```typescript
import { z } from 'zod';

export const LoanInputsSchema = z.object({
  principal: z.number({
    required_error: "Principal amount is required",
    invalid_type_error: "Principal must be a number"
  })
    .min(1000, "Principal must be at least $1,000")
    .max(10_000_000, "Principal cannot exceed $10,000,000"),

  interestRate: z.number({
    required_error: "Interest rate is required",
    invalid_type_error: "Interest rate must be a number"
  })
    .min(0.01, "Interest rate must be at least 0.01%")
    .max(20, "Interest rate cannot exceed 20%"),

  termYears: z.number({
    required_error: "Loan term is required",
    invalid_type_error: "Loan term must be a number"
  })
    .int("Loan term must be a whole number")
    .min(1, "Loan term must be at least 1 year")
    .max(50, "Loan term cannot exceed 50 years"),

  propertyTax: z.number()
    .min(0, "Property tax cannot be negative")
    .optional(),

  insurance: z.number()
    .min(0, "Insurance cannot be negative")
    .optional(),

  hoaFees: z.number()
    .min(0, "HOA fees cannot be negative")
    .optional(),

  pmi: z.number()
    .min(0, "PMI cannot be negative")
    .optional()
});

export type LoanInputs = z.infer<typeof LoanInputsSchema>;
```

**Validation Timing**: Triggered on input blur event (FR-009).

**Error Handling**:
- Field-level errors: Display below each input
- Form-level errors: Prevent calculation if any loan has invalid required fields
- Partial data: Allow one loan to be complete, other incomplete (FR: independent calculation)

---

## Comparison Entity

### LoanComparison
High-level structure for comparing two loans (ephemeral, not persisted).

```typescript
interface LoanComparison {
  loan1: {
    inputs: LoanInputs;
    results: LoanResults | null;  // null if inputs invalid
  };
  loan2: {
    inputs: LoanInputs;
    results: LoanResults | null;
  };
}
```

**Derived Comparisons** (calculated in UI):
- Monthly payment difference: `|loan1.monthlyPaymentTotal - loan2.monthlyPaymentTotal|`
- Total interest difference: `|loan1.totalInterest - loan2.totalInterest|`
- Better deal indicator: Loan with lower `totalCost`

---

## Data Flow

### Input → Calculation → Display
```
1. User enters loan data in LoanInputForm (Client Component)
   ↓
2. On blur: Validate inputs with LoanInputsSchema
   ↓
3. If valid: Call calculateLoanResults(inputs) from mortgage-calculator.ts
   ↓
4. Update LoanResults state
   ↓
5. LoanComparison component renders results side-by-side
   ↓
6. User optionally expands AmortizationSchedule (collapsible)
```

**State Management**:
- Parent Client Component holds `LoanComparison` state
- Child components receive inputs/results via props
- Calculation functions pure (no side effects)

---

## Type Guards & Utilities

### isLoanComplete
```typescript
function isLoanComplete(inputs: Partial<LoanInputs>): inputs is LoanInputs {
  return (
    inputs.principal !== undefined &&
    inputs.interestRate !== undefined &&
    inputs.termYears !== undefined &&
    LoanInputsSchema.safeParse(inputs).success
  );
}
```

### formatCurrency
```typescript
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}
```

### formatPercentage
```typescript
function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
```

---

## Relationships

```
LoanInputs (1) ---> (1) LoanResults
                      |
                      +---> (n) AmortizationEntry

LoanComparison (1) ---> (2) LoanInputs
               (1) ---> (0..2) LoanResults
```

**Cardinality**:
- One set of inputs produces exactly one set of results (deterministic)
- One result includes 1 to 600 amortization entries
- One comparison contains exactly two loan input/result pairs

---

## Constraints Summary

| Field | Type | Min | Max | Required | Notes |
|-------|------|-----|-----|----------|-------|
| principal | number | $1,000 | $10,000,000 | Yes | - |
| interestRate | number | 0.01% | 20% | Yes | Stored as percentage |
| termYears | number | 1 | 50 | Yes | Integer only |
| propertyTax | number | $0 | - | No | Annual amount |
| insurance | number | $0 | - | No | Annual amount |
| hoaFees | number | $0 | - | No | Monthly amount |
| pmi | number | $0 | - | No | Monthly amount |

---

**Status**: Data model complete. Ready for contract generation.
