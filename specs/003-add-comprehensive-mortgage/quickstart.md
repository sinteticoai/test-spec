# Quickstart: Comprehensive Mortgage Calculator

**Feature**: 003-add-comprehensive-mortgage
**Date**: 2025-10-03

This quickstart validates that all 8 acceptance scenarios from the spec are working correctly.

## Prerequisites

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# In another terminal, run tests
npm test
```

## Acceptance Scenario Validation

### Scenario 1: Property Price and Down Payment ✅

**Given**: Evaluating a $700,000 property
**When**: Enter property price and 20% down payment
**Then**: System calculates loan amount as $560,000 and shows no PMI required

**Manual Test Steps**:
1. Navigate to http://localhost:3000
2. In Loan 1 form, locate "Property Price" field
3. Enter: `700000`
4. Locate "Down Payment (%)" field
5. Enter: `20`
6. Verify "Down Payment ($)" auto-populates to `$140,000`
7. Verify "Loan Amount" auto-calculates to `$560,000`
8. Click "Calculate Loan 1" button
9. Verify results show:
   - Monthly Payment (P&I): ~$3,359 (at 6% interest, 30 years)
   - PMI section shows: "No PMI Required (20% down payment)"

**Automated Test**:
```typescript
// __tests__/components/features/loan-input-form.test.tsx
describe('Scenario 1: Property Price and Down Payment', () => {
  it('calculates loan amount correctly with 20% down', () => {
    const inputs: LoanInputs = {
      propertyPrice: 700000,
      downPaymentPercent: 20,
      interestRate: 6.0,
      termYears: 30,
      closingCosts: {},
      pmiConfig: { type: 'none' },
      extraPayments: {},
      loanType: 'fixed'
    };

    const results = calculateComprehensiveLoanResults(inputs);

    expect(inputs.principal).toBe(560000);
    expect(inputs.downPaymentDollar).toBe(140000);
    expect(results.monthlyPMI).toBeUndefined();
    expect(results.pmiRemovalMonth).toBeNull();
  });
});
```

**Expected Outcome**: ✅ Loan amount calculated, PMI not required

---

### Scenario 2: Using Points to Buy Down Rate ✅

**Given**: Have a 6% interest rate quote
**When**: Purchase 1 discount point (1% of loan amount)
**Then**: Interest rate adjusts lower, monthly payment decreases, closing costs increase

**Manual Test Steps**:
1. Continue from Scenario 1 (or reset form)
2. Locate "Discount Points" field (under Points & Fees section)
3. Enter: `1`
4. Verify "Effective Interest Rate" updates to `5.75%` (6% - 0.25%)
5. Verify "Points Cost" shows: `$5,600` (1% of $560,000)
6. Click "Calculate Loan 1" button
7. Compare results:
   - Original monthly payment (6%): $3,359
   - New monthly payment (5.75%): $3,268
   - Savings: $91/month
8. Verify "Total Closing Costs" includes the $5,600 points cost

**Automated Test**:
```typescript
describe('Scenario 2: Using Points to Buy Down Rate', () => {
  it('reduces interest rate and increases closing costs', () => {
    const inputs: LoanInputs = {
      propertyPrice: 700000,
      downPaymentPercent: 20,
      principal: 560000,
      interestRate: 6.0,
      discountPoints: 1,
      termYears: 30,
      closingCosts: {},
      pmiConfig: { type: 'none' },
      extraPayments: {},
      loanType: 'fixed'
    };

    const effectiveRate = calculateEffectiveRate(6.0, 1);
    const pointsCost = calculatePointsCost(560000, 1, 0);
    const results = calculateComprehensiveLoanResults(inputs);

    expect(effectiveRate).toBe(5.75);
    expect(pointsCost).toBe(5600);
    expect(results.totalClosingCosts).toBeGreaterThanOrEqual(5600);
    expect(results.monthlyPaymentPI).toBeLessThan(3359); // Payment reduced
  });
});
```

**Expected Outcome**: ✅ Rate reduced by 0.25%, payment lower, closing costs higher

---

### Scenario 3: Lender Credits Reducing Closing Costs ✅

**Given**: Have $5,000 in closing costs
**When**: Apply $2,000 in lender credits
**Then**: Upfront cash needed decreases by $2,000

**Manual Test Steps**:
1. In Loan 1 form, expand "Closing Costs" section
2. Enter various closing costs totaling $5,000:
   - Appraisal Fee: `500`
   - Title Insurance: `2000`
   - Recording Fees: `1000`
   - Other Closing Costs: `1500`
3. Locate "Lender Credits" field (under Points & Fees)
4. Enter: `2000`
5. Click "Calculate Loan 1" button
6. Verify "Total Closing Costs": `$5,000`
7. Verify "Net Closing Costs": `$3,000` ($5,000 - $2,000 credits)
8. Verify "Cash Needed at Closing": `$143,000` ($140k down + $3k net closing)

**Automated Test**:
```typescript
describe('Scenario 3: Lender Credits Reducing Closing Costs', () => {
  it('reduces cash needed at closing by lender credit amount', () => {
    const inputs: LoanInputs = {
      propertyPrice: 700000,
      downPaymentDollar: 140000,
      principal: 560000,
      interestRate: 6.0,
      termYears: 30,
      lenderCredits: 2000,
      closingCosts: {
        appraisalFee: 500,
        titleInsurance: 2000,
        recordingFees: 1000,
        otherClosingCosts: 1500
      },
      pmiConfig: { type: 'none' },
      extraPayments: {},
      loanType: 'fixed'
    };

    const results = calculateComprehensiveLoanResults(inputs);

    expect(results.totalClosingCosts).toBe(5000);
    expect(results.netClosingCosts).toBe(3000); // 5000 - 2000 credits
    expect(results.cashNeededAtClosing).toBe(143000); // 140k down + 3k net
  });
});
```

**Expected Outcome**: ✅ Cash at closing reduced by lender credit amount

---

### Scenario 4: PMI Calculation and Removal ✅

**Given**: Put down 15% (85% LTV)
**When**: System calculates monthly PMI based on PMI rate
**Then**: PMI included in monthly payment, shows when PMI terminates at 78% LTV

**Manual Test Steps**:
1. In Loan 1 form, reset down payment
2. Enter "Down Payment (%)": `15`
3. Verify LTV displays: `85%`
4. Verify PMI section becomes visible (conditional rendering)
5. Select "PMI Type": `Monthly PMI`
6. Enter "PMI Rate (Annual %)": `0.5`
7. Click "Calculate Loan 1" button
8. Verify results show:
   - Monthly PMI: `$198.33` (($560k × 0.005) / 12)
   - Total Monthly Payment includes PMI
   - "PMI Removal Date" shows: ~Month 120-150 (when balance ≤ $546k = 78% of $700k)
9. Scroll to amortization schedule
10. Verify PMI column shows:
    - Months 1-119: `$198.33`
    - Month 120+: `$0` (PMI removed)

**Automated Test**:
```typescript
describe('Scenario 4: PMI Calculation and Removal', () => {
  it('calculates monthly PMI and finds removal month at 78% LTV', () => {
    const inputs: LoanInputs = {
      propertyPrice: 700000,
      downPaymentPercent: 15,
      principal: 595000, // 700k - 15%
      interestRate: 6.0,
      termYears: 30,
      closingCosts: {},
      pmiConfig: {
        type: 'monthly',
        monthlyRate: 0.005 // 0.5% annual
      },
      extraPayments: {},
      loanType: 'fixed'
    };

    const monthlyPMI = calculateMonthlyPMI(595000, inputs.pmiConfig);
    const results = calculateComprehensiveLoanResults(inputs);
    const targetBalance = 700000 * 0.78; // $546,000

    expect(monthlyPMI).toBeCloseTo(247.92, 2); // (595k × 0.005) / 12
    expect(results.monthlyPMI).toBeCloseTo(247.92, 2);
    expect(results.pmiRemovalMonth).toBeDefined();
    expect(results.pmiRemovalMonth).toBeGreaterThan(100);
    expect(results.pmiRemovalMonth).toBeLessThan(200);

    // Verify balance at removal month is ≤ 78% LTV
    const removalEntry = results.amortizationSchedule[results.pmiRemovalMonth! - 1];
    expect(removalEntry.remainingBalance).toBeLessThanOrEqual(targetBalance);
  });
});
```

**Expected Outcome**: ✅ PMI calculated, removal month identified, schedule updated

---

### Scenario 5: Extra Monthly Payments ✅

**Given**: Have a 30-year mortgage
**When**: Add $200 extra monthly payment
**Then**: System shows reduced loan term and total interest savings

**Manual Test Steps**:
1. In Loan 1 form, use base scenario (20% down, no PMI)
2. Expand "Extra Payments" section
3. Enter "Extra Monthly Payment": `200`
4. Click "Calculate Loan 1" button
5. Verify results show:
   - Original Term: 360 months (30 years)
   - Accelerated Term: ~281 months (23.4 years)
   - Time Saved: ~79 months (6.6 years)
   - Original Total Interest: ~$650,000
   - New Total Interest: ~$470,000
   - Interest Saved: ~$180,000
6. Scroll to amortization schedule
7. Verify schedule only has 281 entries (not 360)
8. Verify each entry shows "Extra Principal" column with $200

**Automated Test**:
```typescript
describe('Scenario 5: Extra Monthly Payments', () => {
  it('reduces loan term and total interest', () => {
    const inputs: LoanInputs = {
      propertyPrice: 700000,
      downPaymentPercent: 20,
      principal: 560000,
      interestRate: 6.0,
      termYears: 30,
      closingCosts: {},
      pmiConfig: { type: 'none' },
      extraPayments: {
        extraMonthly: 200
      },
      loanType: 'fixed'
    };

    const baseResults = calculateComprehensiveLoanResults({
      ...inputs,
      extraPayments: {}
    });
    const acceleratedResults = calculateComprehensiveLoanResults(inputs);

    expect(baseResults.originalTermMonths).toBe(360);
    expect(acceleratedResults.acceleratedTermMonths).toBeLessThan(360);
    expect(acceleratedResults.acceleratedTermMonths).toBeGreaterThan(250); // ~280 expected
    expect(acceleratedResults.totalInterestSaved).toBeGreaterThan(100000);

    // Verify schedule length matches accelerated term
    expect(acceleratedResults.amortizationSchedule.length).toBe(
      acceleratedResults.acceleratedTermMonths
    );
  });
});
```

**Expected Outcome**: ✅ Loan pays off ~6.6 years early, saves ~$180k interest

---

### Scenario 6: Bi-weekly Payment Strategy ✅

**Given**: Select bi-weekly payment option
**When**: System recalculates schedule
**Then**: Make 26 payments per year (every 2 weeks), payoff timeline accelerates

**Manual Test Steps**:
1. In Loan 1 form, use base scenario
2. Expand "Extra Payments" section
3. Check "Enable Bi-weekly Payments" toggle
4. Click "Calculate Loan 1" button
5. Verify results show:
   - Bi-weekly Payment: ~$1,680 (half of $3,359 monthly)
   - Effective Extra Annual Payment: ~$3,359 (1 extra monthly payment)
   - Accelerated Term: ~314 months (26.2 years)
   - Time Saved: ~46 months (3.8 years)
   - Interest Saved: ~$97,000
6. Verify explanation text: "26 payments per year (every 2 weeks) = 13 monthly payments annually"

**Automated Test**:
```typescript
describe('Scenario 6: Bi-weekly Payment Strategy', () => {
  it('creates 26 payments per year and accelerates payoff', () => {
    const inputs: LoanInputs = {
      propertyPrice: 700000,
      downPaymentPercent: 20,
      principal: 560000,
      interestRate: 6.0,
      termYears: 30,
      closingCosts: {},
      pmiConfig: { type: 'none' },
      extraPayments: {
        biweeklyEnabled: true
      },
      loanType: 'fixed'
    };

    const baseResults = calculateComprehensiveLoanResults({
      ...inputs,
      extraPayments: {}
    });
    const biweeklyResults = calculateComprehensiveLoanResults(inputs);

    const monthlyPayment = baseResults.monthlyPaymentPI;
    const biweeklyPayment = monthlyPayment / 2;
    const annualExtraFromBiweekly = (biweeklyPayment * 26) - (monthlyPayment * 12);

    expect(annualExtraFromBiweekly).toBeCloseTo(monthlyPayment, 0);
    expect(biweeklyResults.acceleratedTermMonths).toBeLessThan(360);
    expect(biweeklyResults.acceleratedTermMonths).toBeGreaterThan(300); // ~314 expected
    expect(biweeklyResults.totalInterestSaved).toBeGreaterThan(80000);
  });
});
```

**Expected Outcome**: ✅ Payoff ~3.8 years early, saves ~$97k interest

---

### Scenario 7: Comprehensive Closing Costs ✅

**Given**: Enter all closing cost line items
**When**: View results
**Then**: System shows total cash needed at closing including down payment and all fees

**Manual Test Steps**:
1. In Loan 1 form, expand "Closing Costs" section
2. Enter all 10 closing cost categories:
   - Appraisal Fee: `600`
   - Title Insurance: `2,500`
   - Title Search Fee: `400`
   - Recording Fees: `250`
   - Attorney Fees: `1,200`
   - Transfer Tax: `3,500`
   - Survey Fee: `500`
   - Prepaid Escrow: `4,000`
   - Other Closing Costs: `800`
   - Buyer's Agent Commission: `0` (optional)
3. Expand "Points & Fees" section
4. Enter:
   - Discount Points: `1` (costs $5,600)
   - Origination Points: `1` (costs $5,600)
   - Seller Concessions: `3,000`
   - Lender Credits: `1,000`
5. Click "Calculate Loan 1" button
6. Verify "Results" section shows:
   - Closing Costs Breakdown (table with all 10 items)
   - Discount Points Cost: `$5,600`
   - Origination Points Cost: `$5,600`
   - Total Closing Costs: `$24,950` (sum of all)
   - Seller Concessions: `-$3,000`
   - Lender Credits: `-$1,000`
   - Net Closing Costs: `$20,950`
   - Down Payment: `$140,000`
   - **Cash Needed at Closing: $160,950**

**Automated Test**:
```typescript
describe('Scenario 7: Comprehensive Closing Costs', () => {
  it('calculates total cash needed including all costs and credits', () => {
    const inputs: LoanInputs = {
      propertyPrice: 700000,
      downPaymentDollar: 140000,
      principal: 560000,
      interestRate: 6.0,
      discountPoints: 1,
      originationPoints: 1,
      sellerConcessions: 3000,
      lenderCredits: 1000,
      termYears: 30,
      closingCosts: {
        appraisalFee: 600,
        titleInsurance: 2500,
        titleSearchFee: 400,
        recordingFees: 250,
        attorneyFees: 1200,
        transferTax: 3500,
        surveyFee: 500,
        prepaidEscrow: 4000,
        otherClosingCosts: 800
      },
      pmiConfig: { type: 'none' },
      extraPayments: {},
      loanType: 'fixed'
    };

    const results = calculateComprehensiveLoanResults(inputs);

    expect(results.totalClosingCosts).toBe(24950);
    // 600+2500+400+250+1200+3500+500+4000+800 = 13750
    // + 5600 discount + 5600 origination = 24950
    expect(results.netClosingCosts).toBe(20950); // 24950 - 3000 - 1000
    expect(results.cashNeededAtClosing).toBe(160950); // 140000 + 20950
  });
});
```

**Expected Outcome**: ✅ All costs itemized, cash at closing calculated correctly

---

### Scenario 8: ARM Loan Configuration ✅

**Given**: Select ARM loan type
**When**: Configure initial rate period and adjustment caps
**Then**: System shows payment schedule with future rate adjustments

**Manual Test Steps**:
1. In Loan 1 form, locate "Loan Type" selector
2. Select: `Adjustable Rate Mortgage (ARM)`
3. Verify ARM configuration section appears
4. Enter ARM parameters:
   - Initial Fixed Period: `5 years`
   - Adjustment Frequency: `Annual`
   - Initial Cap: `2%`
   - Periodic Cap: `2%`
   - Lifetime Cap: `5%`
5. Enter base Interest Rate: `5%`
6. Click "Calculate Loan 1" button
7. Verify results show:
   - Years 1-5: 5% rate, $3,006/month (P&I)
   - Year 6: 7% rate, $3,524/month (worst case: 5% + 2% initial cap)
   - Year 7: 9% rate, $4,076/month (worst case: 7% + 2% periodic cap)
   - Year 8+: 10% rate, $4,420/month (capped at 5% + 5% lifetime cap)
   - Worst-Case Total Cost displayed
8. Verify amortization schedule highlights rate change months

**Automated Test**:
```typescript
describe('Scenario 8: ARM Loan Configuration', () => {
  it('generates worst-case payment projections for ARM', () => {
    const inputs: LoanInputs = {
      propertyPrice: 700000,
      downPaymentPercent: 20,
      principal: 560000,
      interestRate: 5.0,
      termYears: 30,
      closingCosts: {},
      pmiConfig: { type: 'none' },
      extraPayments: {},
      loanType: 'arm',
      armConfig: {
        initialFixedPeriodYears: 5,
        adjustmentFrequency: 'annual',
        initialCap: 2,
        periodicCap: 2,
        lifetimeCap: 5
      }
    };

    const results = calculateComprehensiveLoanResults(inputs);

    expect(results.armProjections).toBeDefined();
    expect(results.armProjections!.length).toBeGreaterThan(0);

    const projections = results.armProjections!;

    // Verify year 1-5: 5% rate
    expect(projections[0].rate).toBe(5.0);
    expect(projections[4].rate).toBe(5.0);

    // Verify year 6: 7% (5% + 2% initial cap)
    expect(projections[5].rate).toBe(7.0);

    // Verify year 7: 9% (7% + 2% periodic cap)
    expect(projections[6].rate).toBe(9.0);

    // Verify year 8+: capped at 10% (5% + 5% lifetime cap)
    expect(projections[7].rate).toBe(10.0);
    expect(projections[29].rate).toBe(10.0); // Last year still 10%

    expect(results.worstCaseMaxPayment).toBeDefined();
    expect(results.worstCaseMaxPayment).toBeGreaterThan(results.monthlyPaymentPI);
  });
});
```

**Expected Outcome**: ✅ ARM projections show worst-case rate increases and payments

---

## Integration Test Suite

Run all scenarios together:

```bash
npm test -- mortgage-calculations.test.ts
```

Expected output:
```
PASS __tests__/lib/mortgage-calculations.test.ts
  ✓ Scenario 1: Property Price and Down Payment (15ms)
  ✓ Scenario 2: Using Points to Buy Down Rate (12ms)
  ✓ Scenario 3: Lender Credits Reducing Closing Costs (10ms)
  ✓ Scenario 4: PMI Calculation and Removal (25ms)
  ✓ Scenario 5: Extra Monthly Payments (30ms)
  ✓ Scenario 6: Bi-weekly Payment Strategy (28ms)
  ✓ Scenario 7: Comprehensive Closing Costs (11ms)
  ✓ Scenario 8: ARM Loan Configuration (20ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Time:        2.451s
```

## Validation Checklist

- [ ] All 8 scenarios pass automated tests
- [ ] Manual testing confirms UI displays all calculated values
- [ ] Down payment sync (% ↔ $) works without lag
- [ ] PMI removal month shown in results and amortization schedule
- [ ] Extra payments reduce loan term and show savings
- [ ] Bi-weekly creates equivalent of 13 monthly payments annually
- [ ] All closing costs itemized in results breakdown
- [ ] ARM projections show worst-case scenario
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors: `npm run build`
- [ ] Linting passes: `npm run lint`

## Performance Verification

```bash
# Measure calculation performance (should be <100ms)
npm test -- --testNamePattern="Performance" --verbose
```

Expected: All calculations complete in <50ms on modern hardware

---

**Status**: Ready for implementation 🚀

Once implementation is complete, run through this quickstart to validate all acceptance scenarios are working as specified.
