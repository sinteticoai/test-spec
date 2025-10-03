# Quickstart: Mortgage Calculator Validation

## Purpose
This quickstart validates that the mortgage calculator feature meets all acceptance criteria from the specification. Execute these steps to verify the implementation is complete and correct.

---

## Prerequisites
```bash
# Ensure dependencies installed
npm install

# Ensure development server can start
npm run dev

# Ensure tests can run
npm test
```

---

## Validation Scenarios

### Scenario 1: Basic Loan Comparison (FR-001 to FR-006)
**Objective**: Verify users can input and compare two standard loans.

**Steps**:
1. Navigate to `http://localhost:3000`
2. In **Loan 1** section, enter:
   - Principal: `$200,000`
   - Interest Rate: `5%`
   - Loan Term: `30 years`
3. Tab out of the Loan Term field (trigger blur event)
4. In **Loan 2** section, enter:
   - Principal: `$200,000`
   - Interest Rate: `4.5%`
   - Loan Term: `30 years`
5. Tab out of the Loan Term field

**Expected Results**:
- ✅ Loan 1 shows Monthly Payment (P&I): **~$1,073.64**
- ✅ Loan 1 shows Total Interest: **~$186,511.57**
- ✅ Loan 1 shows Total Cost: **~$386,511.57**
- ✅ Loan 2 shows Monthly Payment (P&I): **~$1,013.37**
- ✅ Loan 2 shows Total Interest: **~$164,813.42**
- ✅ Loan 2 shows Total Cost: **~$364,813.42**
- ✅ Both loans displayed **side by side** (on tablet/desktop)
- ✅ Calculations appear **automatically on blur** (no Calculate button needed)

---

### Scenario 2: Input Validation (FR-007, FR-008)
**Objective**: Verify validation rules enforce correct ranges.

**Steps**:
1. In Loan 1, enter Principal: `$500` (below minimum)
2. Tab out of field
3. Enter Interest Rate: `25%` (above maximum)
4. Tab out of field
5. Enter Loan Term: `60` years (above maximum)
6. Tab out of field

**Expected Results**:
- ✅ Principal field shows error: **"Principal must be at least $1,000"**
- ✅ Interest Rate field shows error: **"Interest rate cannot exceed 20%"**
- ✅ Loan Term field shows error: **"Loan term cannot exceed 50 years"**
- ✅ No calculation results displayed for invalid loan
- ✅ Error messages displayed **below each field** (or inline)

**Correction**:
1. Update Principal to `$150,000`
2. Update Interest Rate to `3.5%`
3. Update Loan Term to `15 years`
4. Tab out of final field

**Expected Results**:
- ✅ All error messages cleared
- ✅ Valid calculation results displayed: Monthly Payment **~$1,072.32**

---

### Scenario 3: Real-Time Updates (FR-009)
**Objective**: Verify calculations update on field blur.

**Steps**:
1. Enter valid Loan 1 data (any valid values)
2. Note the calculated Monthly Payment
3. Change Interest Rate from `5%` to `4%`
4. **Without clicking anything**, tab to next field (blur event)

**Expected Results**:
- ✅ Monthly Payment **updates immediately** on blur
- ✅ Total Interest and Total Cost also update
- ✅ Updates happen **without clicking Calculate button** (no button should exist)
- ✅ No update while typing (only on blur)

---

### Scenario 4: Additional Costs (FR-010, FR-016)
**Objective**: Verify optional additional costs included in total.

**Steps**:
1. In Loan 1, enter:
   - Principal: `$250,000`
   - Interest Rate: `5%`
   - Loan Term: `30 years`
   - Property Tax: `$3,600` (annual)
   - Insurance: `$1,200` (annual)
   - HOA Fees: `$150` (monthly)
   - PMI: `$100` (monthly)
2. Tab out of final field

**Expected Results**:
- ✅ **Monthly Payment (P&I)**: **~$1,342.05** (displayed separately)
- ✅ **Total Monthly Payment**: **~$1,992.05**
  - Breakdown: $1,342.05 + ($3,600/12) + ($1,200/12) + $150 + $100 = $1,992.05
- ✅ Two payment amounts **clearly separated** with labels:
  - "Principal & Interest: $1,342.05"
  - "Total Monthly Payment: $1,992.05" (or similar wording)
- ✅ Total Cost reflects additional costs: **~$717,138** (1,992.05 × 360 months)

---

### Scenario 5: Amortization Schedule (FR-012, FR-017)
**Objective**: Verify amortization schedule displays correctly.

**Steps**:
1. Enter valid Loan 1 data: $200,000 at 5% for 30 years
2. Tab out to calculate
3. Look for "View Amortization Schedule" or collapsible section
4. Click to expand schedule

**Expected Results**:
- ✅ Schedule is **collapsed/hidden by default**
- ✅ Clicking toggle **expands schedule**
- ✅ Schedule shows **360 rows** (30 years × 12)
- ✅ Columns displayed:
  - Payment Number (1 to 360)
  - Payment Date (assumes today as start, increments monthly)
  - Principal Paid
  - Interest Paid
  - Remaining Balance
- ✅ **First payment** shows:
  - Interest Paid: **~$833.33** (200,000 × 5% / 12)
  - Principal Paid: **~$240.31** (1,073.64 - 833.33)
  - Remaining Balance: **~$199,759.69**
- ✅ **Last payment (360)** shows:
  - Remaining Balance: **$0.00**
- ✅ Schedule is **scrollable** (if not fitting on screen)

---

### Scenario 6: Independent Loan Calculation (Edge Case)
**Objective**: Verify one loan can be calculated while the other is incomplete.

**Steps**:
1. In Loan 1, enter complete data:
   - Principal: `$100,000`
   - Interest Rate: `4%`
   - Loan Term: `15 years`
2. In Loan 2, enter only Principal: `$150,000` (leave other fields empty)
3. Tab out of Loan 1 fields

**Expected Results**:
- ✅ Loan 1 shows **valid calculation results**
- ✅ Loan 2 shows **"Enter loan details"** placeholder or empty state
- ✅ No error messages for Loan 2 (incomplete is allowed)
- ✅ Comparison still shows Loan 1 results

---

### Scenario 7: Edge Case - 0% Interest (Edge Case)
**Objective**: Verify handling of 0% interest rate.

**Steps**:
1. In Loan 1, enter:
   - Principal: `$12,000`
   - Interest Rate: `0.01%` (minimum allowed)
   - Loan Term: `1 year`
2. Tab out

**Expected Results**:
- ✅ Validation **rejects 0%** (below 0.01% minimum)
- ✅ Accepts **0.01%** and calculates correctly
- ✅ Monthly Payment: **~$1,000.50** (close to simple division)
- ✅ Total Interest: **very small** (< $10)

---

### Scenario 8: Edge Case - Maximum Values
**Objective**: Verify handling of boundary values.

**Steps**:
1. In Loan 1, enter:
   - Principal: `$10,000,000` (maximum)
   - Interest Rate: `20%` (maximum)
   - Loan Term: `50 years` (maximum)
2. Tab out

**Expected Results**:
- ✅ Validation **accepts all values** (at boundary)
- ✅ Calculation completes **without errors**
- ✅ Monthly Payment: **> $0** (valid positive number)
- ✅ Amortization Schedule: **600 rows** (50 years × 12)
- ✅ No "Infinity" or "NaN" displayed

---

### Scenario 9: Responsive Layout
**Objective**: Verify responsive design across devices.

**Steps**:
1. Open calculator on **desktop** (>1024px)
2. Resize browser to **tablet width** (~768px)
3. Resize to **mobile width** (<640px)

**Expected Results**:
- ✅ **Desktop**: Two columns side-by-side for both input and results
- ✅ **Tablet**: Two columns maintained
- ✅ **Mobile**: Single column, loans stacked vertically
- ✅ All inputs remain **accessible and usable** at all sizes
- ✅ Text remains **readable** (no tiny fonts)
- ✅ Buttons/links have adequate **touch targets** (≥44px) on mobile

---

### Scenario 10: Accessibility
**Objective**: Verify keyboard navigation and screen reader support.

**Steps**:
1. Navigate page using **Tab key only** (no mouse)
2. Fill in all fields using keyboard
3. Activate amortization toggle using **Enter** or **Space**
4. Use screen reader (if available) to test labels

**Expected Results**:
- ✅ All inputs **reachable via Tab**
- ✅ Tab order is **logical** (top to bottom, left to right)
- ✅ Input fields have **visible focus indicators**
- ✅ Error messages **announced** by screen reader
- ✅ Collapsible schedule **toggleable via keyboard**
- ✅ All form labels **associated with inputs** (not just placeholder text)

---

## Automated Test Validation

### Unit Tests
```bash
npm test -- mortgage-calculator.test
```

**Expected**:
- ✅ All calculation tests pass
- ✅ Edge case tests pass (0% interest, boundary values)
- ✅ Amortization generation tests pass

### Contract Tests
```bash
npm test -- contracts/
```

**Expected**:
- ✅ `mortgage-calculator.contract.ts` passes
- ✅ `validation.contract.ts` passes

### Component Tests
```bash
npm test -- components/features/
```

**Expected**:
- ✅ `loan-input-form.test.tsx` passes
- ✅ `loan-comparison.test.tsx` passes
- ✅ Validation error rendering tests pass

---

## Performance Validation

### Calculation Speed (FR: <100ms latency)
**Steps**:
1. Open browser DevTools → Performance tab
2. Enter loan data and trigger calculation (blur event)
3. Check calculation time in Performance timeline

**Expected**:
- ✅ Calculation completes in **<100ms**
- ✅ No UI blocking during calculation

### Amortization Rendering (FR: 60fps animations)
**Steps**:
1. Expand amortization schedule for 50-year loan (600 rows)
2. Monitor FPS in DevTools Performance

**Expected**:
- ✅ Expansion animation maintains **≥60fps**
- ✅ Scrolling schedule is **smooth** (no jank)

---

## Build Validation

### Production Build
```bash
npm run build
```

**Expected**:
- ✅ Build completes **without errors**
- ✅ No TypeScript type errors
- ✅ No ESLint errors
- ✅ Bundle size reasonable (<500KB for feature code)

### Linting
```bash
npm run lint
```

**Expected**:
- ✅ Zero linting errors
- ✅ No accessibility warnings from eslint-plugin-jsx-a11y

---

## Sign-Off Checklist

### Functional Requirements
- [ ] FR-001: Two separate loan inputs
- [ ] FR-002: All required and optional fields present
- [ ] FR-003: Monthly payment displayed
- [ ] FR-004: Total interest displayed
- [ ] FR-005: Total cost displayed
- [ ] FR-006: Side-by-side comparison
- [ ] FR-007: Validation ranges enforced
- [ ] FR-008: Clear error messages
- [ ] FR-009: Blur event triggers calculation
- [ ] FR-010: Additional costs included in total
- [ ] FR-012: Amortization schedule collapsible
- [ ] FR-015: Anonymous access (no login)
- [ ] FR-016: P&I vs. Total breakdown shown
- [ ] FR-017: Amortization shows all required columns

### Non-Functional Requirements
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Calculation latency <100ms
- [ ] Smooth animations (60fps)
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] No console errors/warnings
- [ ] TypeScript strict mode (no `any` types)
- [ ] All tests passing

### Edge Cases
- [ ] 0.01% interest rate handled
- [ ] Maximum values ($10M, 20%, 50 years) handled
- [ ] Minimum values ($1K, 0.01%, 1 year) handled
- [ ] Incomplete loan data handled gracefully
- [ ] 600-payment amortization renders correctly

---

**Completion Status**: [ ] All scenarios validated | Date: _______ | Validated By: _______
