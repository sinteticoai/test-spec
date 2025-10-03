# Quickstart: Mortgage Tax Benefits Validation

**Feature**: 002-app-should-be
**Date**: 2025-10-03
**Purpose**: Manual validation scenarios to verify tax benefit calculations and UI behavior

---

## Prerequisites

```bash
# Start development server
npm run dev

# Open browser to
http://localhost:3000
```

---

## Test Scenario 1: Standard Itemization Benefit (MFJ)

**Goal**: Verify itemized deduction provides benefit for typical mortgage scenario

**Test Data**:
- Loan Amount: $400,000
- Interest Rate: 6.5%
- Term: 30 years
- Annual Income: $120,000
- Filing Status: Married Filing Jointly
- Property Tax (Annual): $12,000

**Steps**:
1. Enter mortgage details (loan amount, rate, term)
2. Scroll to Tax Benefits section (should be above Amortization Schedule)
3. Enter annual income: 120000
4. Select filing status: "Married Filing Jointly"
5. Enter property tax: 12000

**Expected Results**:
- ✅ Marginal Tax Rate displayed: **22%**
- ✅ First-Year Mortgage Interest: ~**$26,000**
- ✅ Property Tax Deduction: **$10,000** (with "SALT Cap Applied" indicator)
- ✅ Total Itemized Deductions: ~**$36,000**
- ✅ Standard Deduction: **$30,000**
- ✅ Recommended Method: **Itemized** (highlighted or checkmarked)
- ✅ Additional Benefit: ~**$6,000**
- ✅ Annual Tax Savings: ~**$1,320** ($6,000 × 0.22)
- ✅ Monthly Tax Savings: ~**$110** ($1,320 / 12)
- ✅ Effective Monthly Payment: **Original Payment - $110**
- ✅ Disclaimer text visible mentioning "estimates" and "consult a tax professional"

**Pass Criteria**: All calculations match expected values within $10 tolerance

---

## Test Scenario 2: Standard Deduction is Better (Low Mortgage)

**Goal**: Verify standard deduction is recommended when itemizing doesn't provide additional benefit

**Test Data**:
- Loan Amount: $100,000
- Interest Rate: 3.0%
- Term: 30 years
- Annual Income: $80,000
- Filing Status: Married Filing Jointly
- Property Tax (Annual): $3,000

**Steps**:
1. Enter mortgage details
2. Enter annual income: 80000
3. Select filing status: "Married Filing Jointly"
4. Enter property tax: 3000

**Expected Results**:
- ✅ Marginal Tax Rate displayed: **12%**
- ✅ First-Year Mortgage Interest: ~**$3,000**
- ✅ Property Tax Deduction: **$3,000** (under SALT cap, no indicator)
- ✅ Total Itemized Deductions: ~**$6,000**
- ✅ Standard Deduction: **$30,000**
- ✅ Recommended Method: **Standard** (highlighted)
- ✅ Additional Benefit: **$0**
- ✅ Annual Tax Savings: **$0**
- ✅ Monthly Tax Savings: **$0**
- ✅ Effective Monthly Payment: **Same as Original Payment**
- ✅ Message displayed: "Standard deduction provides greater benefit" or similar

**Pass Criteria**: System correctly identifies standard deduction is better; no false tax savings shown

---

## Test Scenario 3: Filing Status Change (MFJ → Single)

**Goal**: Verify calculations update correctly when filing status changes

**Test Data** (continuing from Scenario 1):
- Keep all mortgage and income data the same
- Change filing status from MFJ to Single

**Steps**:
1. Use same data as Scenario 1
2. Change filing status dropdown to "Single"

**Expected Results**:
- ✅ Marginal Tax Rate changes to: **24%** (different bracket for single filer)
- ✅ Standard Deduction changes to: **$15,000**
- ✅ Recommended Method: Still **Itemized** (total ~$36K > $15K)
- ✅ Additional Benefit: ~**$21,000** ($36K - $15K)
- ✅ Annual Tax Savings: ~**$5,040** ($21,000 × 0.24)
- ✅ Monthly Tax Savings: ~**$420** ($5,040 / 12)
- ✅ Effective Monthly Payment updates accordingly

**Pass Criteria**: All calculations recalculate instantly; no page reload required

---

## Test Scenario 4: High Property Tax (SALT Cap Applied)

**Goal**: Verify SALT cap correctly limits property tax deduction

**Test Data**:
- Loan Amount: $600,000
- Interest Rate: 7.0%
- Term: 30 years
- Annual Income: $200,000
- Filing Status: Married Filing Jointly
- Property Tax (Annual): $25,000

**Steps**:
1. Enter mortgage details
2. Enter annual income: 200000
3. Select filing status: "Married Filing Jointly"
4. Enter property tax: 25000

**Expected Results**:
- ✅ Marginal Tax Rate: **24%**
- ✅ Property Tax Deduction: **$10,000** (not $25,000)
- ✅ "SALT Cap Applied" indicator visible
- ✅ Message/tooltip explaining "$10,000 limit on state and local tax deductions"
- ✅ Recommended Method: **Itemized**
- ✅ Calculations use $10K cap, not entered $25K amount

**Pass Criteria**: SALT cap enforcement visible and correctly applied to calculations

---

## Test Scenario 5: Loan Exceeds $750K Qualified Debt Limit

**Goal**: Verify warning appears for loans above qualified debt limit

**Test Data**:
- Loan Amount: $1,000,000
- Interest Rate: 6.0%
- Term: 30 years
- Annual Income: $300,000
- Filing Status: Married Filing Jointly
- Property Tax (Annual): $18,000

**Steps**:
1. Enter mortgage details with $1M loan
2. Enter annual income: 300000
3. Select filing status: "Married Filing Jointly"
4. Enter property tax: 18000

**Expected Results**:
- ✅ Warning/alert displayed mentioning "$750,000 qualified debt limit"
- ✅ Explanation that interest on amount above $750K is not deductible
- ✅ Mortgage Interest Deduction: Limited to interest on $750K (not full $1M)
- ✅ Property Tax Deduction: **$10,000** (SALT capped)
- ✅ Calculations still function correctly with limited deduction

**Pass Criteria**: Warning is prominent; calculations use $750K limit for interest deduction

---

## Test Scenario 6: Real-Time Calculation Updates

**Goal**: Verify calculations update in real-time without manual refresh

**Test Data**: Start with Scenario 1 data

**Steps**:
1. Enter complete Scenario 1 data
2. Change annual income to: 180000 (type in field)
3. Observe tax rate and savings update
4. Change property tax to: 8000
5. Observe deductions update

**Expected Results**:
- ✅ Marginal Tax Rate updates from 22% to **24%** as income crosses bracket
- ✅ Annual Tax Savings recalculates with new rate
- ✅ Property Tax Deduction changes from $10,000 to **$8,000**
- ✅ "SALT Cap Applied" indicator disappears (under cap now)
- ✅ All downstream calculations (monthly savings, effective payment) update
- ✅ Updates happen immediately on input blur or keystroke (no button press needed)

**Pass Criteria**: All fields update reactively; no manual "Calculate" button required

---

## Test Scenario 7: All Four Filing Statuses

**Goal**: Verify all filing status options work correctly

**Test Data**:
- Loan Amount: $350,000
- Interest Rate: 6.0%
- Term: 30 years
- Annual Income: $100,000
- Property Tax (Annual): $8,000

**Steps**:
1. Enter mortgage details
2. Enter annual income and property tax
3. Test each filing status sequentially

**Expected Results**:

| Filing Status | Marginal Rate | Standard Deduction | Expected Method |
|---------------|---------------|-------------------|-----------------|
| Single | 22% | $15,000 | Itemized |
| Married Filing Jointly | 12% | $30,000 | Varies* |
| Married Filing Separately | 22% | $15,000 | Itemized |
| Head of Household | 22% | $22,500 | Varies* |

*Depends on first-year interest amount

- ✅ All four options selectable
- ✅ Standard deduction changes per filing status
- ✅ Marginal rate calculates correctly for each
- ✅ Recommended method updates based on comparison

**Pass Criteria**: All filing statuses produce correct, distinct calculations

---

## Test Scenario 8: Validation Errors

**Goal**: Verify input validation provides clear error messages

**Steps**:
1. Enter negative income: -50000
2. Enter negative property tax: -5000
3. Leave income blank
4. Enter extremely high income: 50000000

**Expected Results**:
- ✅ Negative income: Error message "Income must be positive"
- ✅ Negative property tax: Error message "Property tax cannot be negative"
- ✅ Blank income: Error message "Income is required" or field highlights
- ✅ Excessive income: Warning "Income must be reasonable" (if > $10M limit)
- ✅ Calculations don't run with invalid inputs
- ✅ Error messages are clear and positioned near relevant inputs

**Pass Criteria**: Validation prevents invalid calculations; user guidance is clear

---

## Test Scenario 9: Zero Property Tax

**Goal**: Verify system handles zero property tax gracefully

**Test Data**:
- Loan Amount: $300,000
- Interest Rate: 5.5%
- Term: 30 years
- Annual Income: $100,000
- Filing Status: Single
- Property Tax (Annual): 0

**Steps**:
1. Enter all mortgage and tax data
2. Leave property tax as 0 or explicitly enter 0

**Expected Results**:
- ✅ Property Tax Deduction: **$0**
- ✅ Total Itemized Deductions: Only mortgage interest (no property tax)
- ✅ No SALT cap indicator (nothing to cap)
- ✅ Comparison still works: itemized vs. standard
- ✅ No errors or warnings about zero property tax

**Pass Criteria**: Zero is accepted as valid input; calculations proceed normally

---

## Test Scenario 10: UI Positioning (Spec Requirement)

**Goal**: Verify tax benefits section appears above amortization schedule

**Test Data**: Any complete dataset

**Steps**:
1. Enter complete mortgage and tax data
2. Scroll down results page
3. Observe section ordering

**Expected Results**:
- ✅ **Page order (top to bottom)**:
  1. Loan Input Form
  2. Monthly Payment Summary
  3. **Tax Benefits Section** ← Must be here
  4. Amortization Schedule
- ✅ Tax Benefits section is visually distinct (card, border, or heading)
- ✅ Section has clear heading: "Tax Benefits" or "Estimated Tax Savings"

**Pass Criteria**: Tax benefits positioned exactly as specified (above amortization)

---

## Regression Check: Existing Functionality

**Goal**: Ensure new feature doesn't break existing mortgage calculations

**Steps**:
1. Calculate mortgage without entering any tax data (leave tax fields empty or default)
2. Verify original monthly payment calculation still works
3. Verify amortization schedule still displays correctly

**Expected Results**:
- ✅ Mortgage calculations work independently of tax data
- ✅ If tax fields are empty/invalid, tax benefits section shows "Enter tax info to see benefits" or similar
- ✅ Amortization schedule unchanged from previous version
- ✅ No console errors

**Pass Criteria**: All existing features continue to work; tax benefits are additive, not breaking

---

## Performance Check

**Goal**: Verify calculations perform within performance requirements

**Steps**:
1. Open browser DevTools (F12) → Performance tab
2. Enter mortgage and tax data
3. Change filing status rapidly (toggle between options)
4. Observe calculation response time

**Expected Results**:
- ✅ Calculation updates complete in < 50ms (per spec)
- ✅ No UI freezing or lag
- ✅ Smooth 60fps interaction (if performance profiling)

**Pass Criteria**: Real-time updates feel instant; no performance degradation

---

## Acceptance Sign-Off Checklist

After completing all scenarios:

- [ ] All 10 test scenarios pass
- [ ] Tax benefits section positioned above amortization schedule
- [ ] All four filing statuses work correctly
- [ ] SALT cap correctly applied at $10,000
- [ ] $750,000 debt limit warning appears
- [ ] Standard vs. itemized comparison logic correct
- [ ] Real-time calculations update without manual refresh
- [ ] Input validation provides clear error messages
- [ ] Disclaimer text visible
- [ ] No breaking changes to existing functionality
- [ ] Performance within < 50ms calculation time

**Final Validation**: Run full test suite with `npm test` - all contract tests must pass

---

**Notes**:
- Calculation tolerances: Allow ±$10 difference due to rounding
- Browser compatibility: Test in Chrome, Firefox, Safari
- Responsive design: Verify on mobile viewport (tax inputs should remain usable)
