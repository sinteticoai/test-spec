# Feature Specification: Comprehensive Mortgage Calculator Factors

**Feature Branch**: `003-add-comprehensive-mortgage`
**Created**: 2025-10-03
**Status**: Draft
**Input**: User description: "Add comprehensive mortgage calculator factors including down payment options, points & rate buydown, closing costs, PMI options, extra payments, and ARM settings"

## Execution Flow (main)
```
1. Parse user description from Input
   → Feature request is clear: extend mortgage calculator with additional factors
2. Extract key concepts from description
   → Actors: Home buyers comparing mortgage options
   → Actions: Calculate accurate monthly payments and total costs with all factors
   → Data: Down payment, points, closing costs, PMI details, extra payments, ARM settings
   → Constraints: Calculations must be accurate and reflect real mortgage scenarios
3. For each unclear aspect:
   → ✅ RESOLVED: Down payment supports both percentage and dollar with sync
   → ✅ RESOLVED: PMI removal at 78% LTV (federal standard)
   → ✅ RESOLVED: Discount points reduce rate by 0.25% each
   → ✅ RESOLVED: Bi-weekly payments = 26 payments/year
4. Fill User Scenarios & Testing section
   → User can input property price and down payment
   → User can apply discount/origination points to adjust rate
   → User can configure PMI options and removal criteria
   → User can add extra payments to accelerate payoff
   → User can select ARM loan type with adjustment periods
5. Generate Functional Requirements
   → Each requirement addresses a missing factor from the comparison
6. Identify Key Entities
   → Loan configuration, payment schedule, closing cost breakdown
7. Run Review Checklist
   → ✅ All clarifications resolved - specification complete
8. Return: SUCCESS (spec ready for planning)
```

---

## Clarifications

### Session 2025-10-03
- Q: How should users enter down payment? → A: Both percentage and dollar amount with automatic synchronization
- Q: At what LTV percentage should PMI automatically terminate? → A: 78% LTV (federal standard for conventional loans)
- Q: How much should each discount point reduce the interest rate? → A: Fixed 0.25% per point (industry standard approximation)
- Q: How many payments per year should bi-weekly payment option generate? → A: 26 payments (true bi-weekly: every 2 weeks)

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## Current State Analysis

### Already Implemented in App
Based on existing `loan-input-form.tsx`:
- ✅ Loan Amount (Principal)
- ✅ Interest Rate
- ✅ Loan Term (years)
- ✅ Property Tax (Annual)
- ✅ Property Insurance (Annual)
- ✅ HOA Fees (Monthly)
- ✅ PMI (Monthly - as flat amount)

### Missing Factors from Reference
From the screenshot comparison, the app is missing:

**Basic Loan Details:**
- ❌ Property Price (separate from loan amount)
- ❌ Down Payment (percentage or dollar amount)

**Points & Rate Buydown:**
- ❌ Discount Points
- ❌ Origination Points
- ❌ Lender Credits

**Closing Costs:**
- ❌ Appraisal Fee
- ❌ Title Insurance
- ❌ Title Search Fee
- ❌ Recording Fees
- ❌ Attorney Fees
- ❌ Transfer Tax
- ❌ Survey Fee
- ❌ Prepaid Escrow
- ❌ Other Closing Costs
- ❌ Buyer's Agent Commission
- ❌ Seller Concessions

**PMI Options:**
- ❌ PMI Rate (currently only flat monthly amount)
- ❌ PMI Type (Monthly PMI vs. Single Premium vs. Lender-Paid)
- ❌ PMI Removal criteria (Automatic at 78% LTV)

**Extra Payments:**
- ❌ Extra Monthly Payment
- ❌ Extra Annual Payment
- ❌ One-Time Lump Sum
- ❌ Bi-weekly Payment Option (26 payments/year)

**Loan Type & ARM Settings:**
- ❌ Loan Type selection (Conventional vs. ARM)
- ❌ Adjustable Rate Mortgage (ARM) configuration

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a home buyer, I want to accurately calculate my total monthly mortgage payment and upfront costs by entering all relevant factors (property price, down payment, points, closing costs, PMI options, and payment acceleration strategies), so that I can make informed decisions when comparing different loan scenarios.

### Acceptance Scenarios

**Scenario 1: Property Price and Down Payment**
1. **Given** I'm evaluating a $700,000 property, **When** I enter property price and 20% down payment, **Then** system calculates loan amount as $560,000 and shows no PMI required

**Scenario 2: Using Points to Buy Down Rate**
2. **Given** I have a 6% interest rate quote, **When** I purchase 1 discount point (1% of loan amount), **Then** my interest rate adjusts lower and monthly payment decreases, while closing costs increase

**Scenario 3: Lender Credits Reducing Closing Costs**
3. **Given** I have $5,000 in closing costs, **When** I apply $2,000 in lender credits, **Then** my upfront cash needed decreases by $2,000

**Scenario 4: PMI Calculation and Removal**
4. **Given** I put down 15% (85% LTV), **When** system calculates monthly PMI based on PMI rate, **Then** PMI is included in monthly payment and system shows when PMI will automatically terminate at 78% LTV

**Scenario 5: Extra Monthly Payments**
5. **Given** I have a 30-year mortgage, **When** I add $200 extra monthly payment, **Then** system shows reduced loan term and total interest savings

**Scenario 6: Bi-weekly Payment Strategy**
6. **Given** I select bi-weekly payment option, **When** system recalculates schedule, **Then** I make 26 payments per year (every 2 weeks) totaling 13 monthly payments annually, and payoff timeline accelerates

**Scenario 7: Comprehensive Closing Costs**
7. **Given** I enter all closing cost line items, **When** I view results, **Then** system shows total cash needed at closing including down payment and all fees

**Scenario 8: ARM Loan Configuration**
8. **Given** I select an ARM loan type, **When** I configure initial rate period and adjustment caps, **Then** system shows payment schedule with future rate adjustments

### Edge Cases
- What happens when down payment exceeds 20% and PMI is not required?
- How does system handle when seller concessions exceed actual closing costs?
- What if lender credits exceed closing costs?
- How does system calculate PMI for down payments between 3-20%?
- What happens when extra payments cause loan to be paid off early?
- How does system display amortization when bi-weekly payments are selected?
- When down payment fields show both percentage and dollar, changing one immediately updates the other

---

## Requirements *(mandatory)*

### Functional Requirements

**Property Price & Down Payment**
- **FR-001**: System MUST allow users to enter property price as a separate field from loan amount
- **FR-002**: System MUST allow users to enter down payment as either percentage OR dollar amount, with automatic synchronization between both representations
- **FR-002a**: When user enters down payment percentage, system MUST automatically calculate and display the corresponding dollar amount
- **FR-002b**: When user enters down payment dollar amount, system MUST automatically calculate and display the corresponding percentage
- **FR-003**: System MUST automatically calculate loan amount as (property price - down payment)
- **FR-004**: System MUST determine if PMI is required based on down payment percentage (< 20% typically requires PMI)

**Points & Rate Buydown**
- **FR-005**: System MUST allow users to enter discount points (paid upfront to reduce interest rate)
- **FR-006**: System MUST allow users to enter origination points (lender fees as percentage of loan)
- **FR-007**: System MUST allow users to enter lender credits (credits toward closing costs)
- **FR-008**: System MUST automatically reduce interest rate by 0.25% per discount point purchased (industry standard approximation)
- **FR-009**: System MUST add point costs to total closing costs (each point = 1% of loan amount)

**Comprehensive Closing Costs**
- **FR-010**: System MUST provide input fields for all standard closing cost categories:
  - Appraisal Fee
  - Title Insurance
  - Title Search Fee
  - Recording Fees
  - Attorney Fees
  - Transfer Tax
  - Survey Fee
  - Prepaid Escrow
  - Other Closing Costs
- **FR-011**: System MUST allow users to enter buyer's agent commission if paid directly
- **FR-012**: System MUST allow users to enter seller concessions (amount seller pays toward buyer's closing costs)
- **FR-013**: System MUST calculate total closing costs as sum of all line items
- **FR-014**: System MUST calculate cash needed at closing as (down payment + closing costs - seller concessions - lender credits)

**PMI Options**
- **FR-015**: System MUST allow users to select PMI type: Monthly PMI, Single Premium Amount, or Lender-Paid PMI
- **FR-016**: System MUST allow users to enter PMI rate (as percentage of loan amount) for Monthly PMI calculation
- **FR-017**: System MUST calculate monthly PMI as (loan amount × PMI rate / 12) when Monthly PMI is selected
- **FR-018**: System MUST add single premium PMI to closing costs when Single Premium is selected
- **FR-019**: System MUST show when PMI will automatically terminate at 78% LTV based on original loan amortization schedule (per Homeowners Protection Act of 1998)
- **FR-020**: System MUST display that borrowers can request PMI removal at 80% LTV (requires appraisal), with automatic termination at 78% LTV
- **FR-021**: System MUST NOT require PMI when down payment is 20% or greater (80% LTV or less at origination)

**Extra Payments**
- **FR-022**: System MUST allow users to enter extra monthly payment amount
- **FR-023**: System MUST allow users to enter extra annual payment amount
- **FR-024**: System MUST allow users to enter one-time lump sum payment amount with date
- **FR-025**: System MUST provide option to switch to bi-weekly payment schedule with 26 payments per year (payment every 2 weeks)
- **FR-025a**: When bi-weekly payment is selected, system MUST calculate each payment as (monthly payment ÷ 2), resulting in one extra monthly payment per year
- **FR-026**: System MUST recalculate amortization schedule when extra payments are applied
- **FR-027**: System MUST show total interest saved and time saved when extra payments are used
- **FR-028**: System MUST apply extra payments to principal reduction (not interest)

**Loan Type & ARM Settings**
- **FR-029**: System MUST allow users to select loan type: Conventional (fixed rate) or Adjustable Rate Mortgage (ARM)
- **FR-030**: When ARM is selected, system MUST allow configuration of:
  - Initial fixed rate period (e.g., 3, 5, 7, 10 years)
  - Rate adjustment frequency after initial period (e.g., annually)
  - Initial interest rate cap (how much rate can increase at first adjustment)
  - Periodic cap (maximum rate change per adjustment period)
  - Lifetime cap (maximum rate over life of loan)
- **FR-031**: System MUST show payment schedule for ARM with projected rate adjustments
- **FR-032**: System MUST display worst-case scenario (maximum payments if rate hits lifetime cap)

**Results Display**
- **FR-033**: System MUST display total cash needed at closing prominently
- **FR-034**: System MUST show breakdown of closing costs by category
- **FR-035**: System MUST display monthly payment breakdown including: principal & interest, PMI (if applicable), property tax, insurance, HOA fees
- **FR-036**: System MUST show when PMI will be removed from monthly payment
- **FR-037**: System MUST display payoff timeline with and without extra payments for comparison
- **FR-038**: System MUST show total interest paid over life of loan with and without extra payments

### Key Entities

- **Loan Configuration**: Represents complete mortgage setup including property price, down payment, loan amount, interest rate, term, loan type (fixed/ARM), points purchased, and all optional costs

- **Closing Costs**: Collection of upfront fees including appraisal, title fees, recording fees, attorney fees, transfer tax, survey, prepaid escrow, agent commission, minus seller concessions and lender credits

- **PMI Configuration**: PMI type (monthly/single premium/lender-paid), PMI rate, calculated monthly PMI amount, removal threshold, projected removal date

- **Payment Schedule**: Amortization table showing month-by-month principal, interest, PMI (until removed), escrow amounts, with support for extra payments and bi-weekly schedules

- **Extra Payment Strategy**: Collection of payment acceleration options including extra monthly amount, extra annual amount, one-time lump sums, and bi-weekly payment flag

- **ARM Configuration**: Adjustable rate mortgage settings including initial rate period, adjustment frequency, rate caps (initial, periodic, lifetime), and projected rate adjustment schedule

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain (4 clarifications needed)
- [x] Requirements are testable and unambiguous (except clarified items)
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

**Outstanding Clarifications:**
1. Down payment input method (percentage vs dollar vs both)
2. PMI removal LTV threshold (78% or configurable)
3. Rate reduction per discount point (assume 0.25% or make configurable)
4. Bi-weekly payment schedule (26 or 24 payments per year)

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (4 items)
- [x] User scenarios defined
- [x] Requirements generated (37 functional requirements)
- [x] Entities identified (6 entities)
- [ ] Review checklist passed (pending clarifications)

---

## Next Steps

1. **Clarify the 4 outstanding questions** to remove ambiguity
2. **Run /plan** to generate implementation plan
3. **Review acceptance scenarios** with stakeholders
4. **Proceed to implementation** after plan approval
