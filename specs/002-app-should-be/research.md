# Research: Mortgage Tax Benefits Display

**Feature**: 002-app-should-be
**Date**: 2025-10-03
**Status**: Complete

## Research Questions & Findings

### 1. 2025 Federal Tax Code Parameters

**Question**: What are the current 2025 IRS rules for mortgage interest and property tax deductions?

**Findings**:
- **Qualified Residence Debt Limit**: $750,000 (loans originated after 12/15/2017 per TCJA)
- **SALT Cap**: $10,000 maximum deduction for state and local taxes including property taxes
- **Standard Deductions (2025 adjusted for inflation)**:
  - Single: $15,000
  - Married Filing Jointly: $30,000
  - Married Filing Separately: $15,000
  - Head of Household: $22,500

- **2025 Federal Tax Brackets**:

  **Single**:
  - 10%: $0 - $11,600
  - 12%: $11,601 - $47,150
  - 22%: $47,151 - $100,525
  - 24%: $100,526 - $191,950
  - 32%: $191,951 - $243,725
  - 35%: $243,726 - $609,350
  - 37%: $609,351+

  **Married Filing Jointly**:
  - 10%: $0 - $23,200
  - 12%: $23,201 - $94,300
  - 22%: $94,301 - $201,050
  - 24%: $201,051 - $383,900
  - 32%: $383,901 - $487,450
  - 35%: $487,451 - $731,200
  - 37%: $731,201+

  **Married Filing Separately**:
  - 10%: $0 - $11,600
  - 12%: $11,601 - $47,150
  - 22%: $47,151 - $100,525
  - 24%: $100,526 - $191,950
  - 32%: $191,951 - $243,725
  - 35%: $243,726 - $365,600
  - 37%: $365,601+

  **Head of Household**:
  - 10%: $0 - $16,550
  - 12%: $16,551 - $63,100
  - 22%: $63,101 - $100,500
  - 24%: $100,501 - $191,950
  - 32%: $191,951 - $243,700
  - 35%: $243,701 - $609,350
  - 37%: $609,351+

**Decision**: Implement these exact thresholds as typed constants in tax-calculator.ts

**Source**: IRS 2025 tax tables (projected based on inflation adjustments)

---

### 2. Marginal vs. Effective Tax Rate for Deduction Calculations

**Question**: Should tax benefit calculations use marginal or effective tax rate?

**Findings**:
- **Marginal rate**: The rate applied to the last dollar of income; this is the rate at which deductions reduce tax liability
- **Effective rate**: Average rate across all income; lower than marginal rate
- Standard tax planning methodology: Deductions save taxes at the marginal rate

**Example**:
- Income: $120,000 (MFJ)
- Marginal rate: 22% (income falls in 22% bracket)
- Effective rate: ~13.5% (total tax / total income)
- $10,000 deduction saves: $2,200 at marginal vs. $1,350 at effective

**Decision**: Use marginal tax rate for all deduction benefit calculations

**Rationale**: Accurate representation of actual tax savings; aligns with professional tax planning tools

---

### 3. Itemized vs. Standard Deduction Logic

**Question**: How should the system handle the choice between itemized and standard deductions?

**Findings**:
- Post-TCJA (2018+), standard deductions nearly doubled, making itemizing beneficial for fewer taxpayers
- ~90% of taxpayers now use standard deduction
- For mortgage holders with property taxes, itemizing may still be beneficial
- Transparent comparison helps users understand tax planning

**Decision**:
1. Calculate total itemized deductions (mortgage interest + capped property tax)
2. Compare to filing-status-specific standard deduction
3. Use whichever is greater
4. Display both amounts with clear indication of which was selected
5. Show "Additional benefit from itemizing" when itemized > standard

**Implementation Pattern**:
```
if (totalItemized > standardDeduction) {
  benefit = (totalItemized - standardDeduction) * marginalRate
  method = 'itemized'
} else {
  benefit = 0  // No additional benefit from mortgage deductions
  method = 'standard'
}
```

---

### 4. First-Year Interest Calculation Approach

**Question**: Should calculations account for partial first-year interest (loan origination timing)?

**Findings**:
- Mortgage interest deduction is pro-rated based on months of payments in tax year
- Loan originated mid-year has less deductible interest in year 1
- Requires additional input: loan origination date
- Adds UI and calculation complexity
- Most calculators use full-year simplification with disclaimer

**Decision**: Use full-year equivalent calculation; add disclaimer about actual timing

**Rationale**:
- Keeps UI simple (no date picker needed)
- Provides reasonable estimate for planning purposes
- Complexity cost outweighs accuracy benefit for MVP
- Can be enhanced in future iteration if users request it

**Disclaimer Text**: "Tax benefit estimates assume full-year deductions. Actual benefits may vary based on loan origination date and filing status. Consult a tax professional for personalized advice."

---

### 5. Input Validation Strategy

**Question**: What validation approach should be used for new tax-related inputs?

**Findings**:
- Existing codebase uses Zod for loan input validation (see `src/lib/validations.ts`)
- Pattern: Define schema, export validator function, use in components
- Type-safe with TypeScript integration
- Provides clear error messages

**Decision**: Extend existing Zod schemas in `/lib/validations.ts`

**New Schemas**:
```typescript
// Filing status enum
FilingStatus = z.enum(['single', 'married_joint', 'married_separate', 'head_of_household'])

// Tax profile schema
TaxProfileSchema = z.object({
  annualIncome: z.number().positive().max(10000000, "Income must be reasonable"),
  filingStatus: FilingStatus,
  propertyTaxAnnual: z.number().min(0, "Property tax cannot be negative")
})
```

**Rationale**: Maintains consistency with existing validation patterns; leverages established tooling

---

### 6. Component State Management Approach

**Question**: How should tax-related state be managed in relation to mortgage calculation state?

**Findings**:
- Current pattern: `page.tsx` holds loan inputs, passes to child components
- Tax benefits depend on mortgage parameters (interest calculated from amortization)
- Tax inputs (income, filing status, property tax) are independent but related
- Options considered:
  1. Lift all state to page.tsx (current pattern)
  2. Create TaxContext provider
  3. Separate state management library

**Decision**: Lift tax-related state to parent component (page.tsx), pass as props

**Rationale**:
- Maintains consistency with existing loan input pattern
- Avoids introducing context/provider complexity for single-page feature
- Tax benefits calculation requires both mortgage and tax inputs
- Simple prop passing is sufficient for this scope

**State Structure**:
```typescript
const [taxProfile, setTaxProfile] = useState<TaxProfile>({
  annualIncome: 0,
  filingStatus: 'married_joint',
  propertyTaxAnnual: 0
})

// Pass to TaxBenefitsDisplay component
<TaxBenefitsDisplay
  loanResults={loanResults}
  taxProfile={taxProfile}
  onTaxProfileChange={setTaxProfile}
/>
```

---

### 7. Performance Considerations for Real-Time Calculations

**Question**: Will tax benefit calculations cause performance issues with real-time updates?

**Findings**:
- Tax calculations are pure functions: bracket lookup + arithmetic
- Estimated execution time: <1ms per calculation
- No external API calls or heavy computation
- React state updates already handle real-time mortgage calculations efficiently

**Decision**: No debouncing or optimization needed; use standard React state updates

**Rationale**: Calculations are trivial compared to rendering cost; premature optimization unnecessary

---

## Research Summary

All clarification questions from the specification have been resolved. Key technical decisions:

1. **Tax Rules**: Implement 2025 IRS brackets and limits as typed constants
2. **Rate Calculation**: Use marginal tax rate for accurate deduction benefits
3. **Deduction Method**: Compare itemized vs. standard, use greater, display both
4. **Simplifications**: Full-year calculation with disclaimer (no partial-year)
5. **Validation**: Extend existing Zod schemas for consistency
6. **State Management**: Lift to parent component (existing pattern)
7. **Performance**: No special optimization needed for calculation speed

**No blocking unknowns remain**. Ready to proceed to Phase 1 (Design & Contracts).

---

**Referenced Files**:
- `/src/lib/validations.ts` - Existing Zod validation patterns
- `/src/lib/mortgage-calculator.ts` - Calculation function patterns
- `/src/types/loan.ts` - Type definition patterns
- `/src/app/page.tsx` - State management patterns
