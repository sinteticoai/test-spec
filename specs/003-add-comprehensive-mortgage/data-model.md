# Data Model: Comprehensive Mortgage Calculator Factors

**Feature**: 003-add-comprehensive-mortgage
**Date**: 2025-10-03

## Entities

### 1. ClosingCosts

**Purpose**: Represents all upfront fees paid at closing

**Fields**:
```typescript
interface ClosingCosts {
  appraisalFee?: number;          // Home appraisal cost
  titleInsurance?: number;         // Title insurance premium
  titleSearchFee?: number;         // Title search/examination fee
  recordingFees?: number;          // Government recording fees
  attorneyFees?: number;           // Legal representation fees
  transferTax?: number;            // State/local transfer taxes
  surveyFee?: number;              // Property survey cost
  prepaidEscrow?: number;          // Upfront escrow deposit (taxes, insurance)
  otherClosingCosts?: number;      // Miscellaneous fees
  buyerAgentCommission?: number;   // Optional: buyer's agent fee if paid directly
}
```

**Validation Rules**:
- All fields optional (user may not have all costs)
- All values must be ≥ 0
- Typically range from $0 to $50,000 total

**Derived Calculations**:
```typescript
totalClosingCosts = sum(all fees) + discountPointsCost + originationPointsCost
netClosingCosts = totalClosingCosts - sellerConcessions - lenderCredits
```

---

### 2. PMIConfig

**Purpose**: Configuration for Private Mortgage Insurance

**Fields**:
```typescript
interface PMIConfig {
  type: 'monthly' | 'single_premium' | 'lender_paid' | 'none';
  monthlyRate?: number;           // Annual PMI rate (0.3% - 1.5%), required if type='monthly'
  singlePremiumAmount?: number;   // Upfront PMI cost, required if type='single_premium'
  removalMonth?: number;          // Calculated: month when PMI auto-terminates (78% LTV)
  removalDate?: Date;             // Calculated: date when PMI auto-terminates
}
```

**Validation Rules**:
- `type` is required
- If `type='monthly'`: `monthlyRate` required, range 0.003 to 0.015 (0.3% - 1.5%)
- If `type='single_premium'`: `singlePremiumAmount` required, must be > 0
- If `type='lender_paid'`: no additional fields (user enters higher interest rate manually)
- If `type='none'`: no additional fields (≥20% down payment)
- `removalMonth` and `removalDate` are read-only calculated fields

**State Transitions**:
```
Initial State: type='none' (default when down payment ≥ 20%)
              ↓
User selects type (if down payment < 20%)
              ↓
System calculates removalMonth based on amortization
              ↓
PMI active until removalMonth reached
              ↓
PMI removed from monthly payment after removalMonth
```

**Business Rules**:
- PMI required when LTV > 80% (down payment < 20%) for conventional loans
- PMI automatically terminates at 78% LTV per federal law (Homeowners Protection Act 1998)
- Monthly PMI calculation: `(loanAmount × monthlyRate) / 12`
- Single premium PMI added to closing costs, no monthly charge

---

### 3. ExtraPayments

**Purpose**: Payment acceleration strategies to reduce loan term and interest

**Fields**:
```typescript
interface ExtraPayments {
  extraMonthly?: number;          // Additional principal paid every month
  extraAnnual?: number;           // Additional principal paid once per year
  extraAnnualMonth?: number;      // Month (1-12) when annual extra payment is made
  lumpSums?: LumpSumPayment[];    // One-time extra payments
  biweeklyEnabled?: boolean;      // Enable bi-weekly payment schedule (26 payments/year)
}

interface LumpSumPayment {
  amount: number;                 // Payment amount
  paymentMonth: number;           // Month number (1-360) when payment is made
  paymentDate?: Date;             // Optional: display date
}
```

**Validation Rules**:
- All extra payment amounts must be ≥ 0
- `extraAnnualMonth` must be 1-12 if `extraAnnual` > 0
- `lumpSums` array can contain 0-10 entries (reasonable limit)
- Each lump sum must have valid `paymentMonth` (1 to loan term in months)
- `biweeklyEnabled` defaults to false

**Derived Calculations**:
```typescript
// Bi-weekly payment calculation
if (biweeklyEnabled) {
  biweeklyPayment = monthlyPayment / 2;
  annualExtraFromBiweekly = (biweeklyPayment × 26) - (monthlyPayment × 12);
  // Effectively one extra monthly payment per year
}

// Total extra principal per year
totalExtraAnnual = extraMonthly × 12 + extraAnnual + annualExtraFromBiweekly;
```

**Business Rules**:
- All extra payments applied to principal reduction, not interest
- Amortization schedule recalculated with extra payments
- Loan pays off early when principal + extra ≥ remaining balance
- Display: reduced term, total interest saved, payoff date

---

### 4. ARMConfig

**Purpose**: Configuration for Adjustable Rate Mortgage

**Fields**:
```typescript
interface ARMConfig {
  initialFixedPeriodYears: number;  // Years before first rate adjustment (3, 5, 7, 10)
  adjustmentFrequency: 'annual' | 'semi-annual';  // How often rate adjusts after initial period
  initialCap: number;                // Max rate increase at first adjustment (e.g., 2%)
  periodicCap: number;               // Max rate change per adjustment period (e.g., 2%)
  lifetimeCap: number;               // Max rate increase over loan life (e.g., 5%)
  projectedRateSchedule?: ARMRateEntry[];  // Calculated: projected rates over time
}

interface ARMRateEntry {
  year: number;
  rate: number;              // Projected rate (worst-case scenario)
  monthlyPayment: number;    // Payment at this rate
}
```

**Validation Rules**:
- `initialFixedPeriodYears` must be one of: 3, 5, 7, 10
- `adjustmentFrequency` required
- All caps must be ≥ 0 and ≤ 10 (reasonable percentage limits)
- `initialCap` typically 2-5%
- `periodicCap` typically 1-2%
- `lifetimeCap` typically 5-6%
- `projectedRateSchedule` is read-only calculated field

**Business Rules**:
- During initial fixed period: rate remains constant
- After initial period: rate adjusts according to frequency
- First adjustment: rate can increase by up to `initialCap`
- Subsequent adjustments: rate can change by up to `periodicCap`
- Rate never exceeds `initialRate + lifetimeCap`
- Projections use worst-case scenario (assume maximum increases)

**Example**:
```
5/1 ARM with initial rate 5%, 2/2/5 caps:
- Years 1-5: 5% (fixed)
- Year 6: Up to 7% (5% + 2% initial cap)
- Year 7: Up to 9% (7% + 2% periodic cap)
- Year 8+: Up to 10% (5% + 5% lifetime cap)
```

---

### 5. LoanInputs (Extended)

**Purpose**: Complete loan configuration including all comprehensive factors

**Fields**:
```typescript
interface LoanInputs {
  // Existing fields (unchanged)
  principal: number;              // Loan amount in USD
  interestRate: number;           // Annual interest rate (percentage)
  termYears: number;              // Loan term in years
  propertyTax?: number;           // Annual property tax
  insurance?: number;             // Annual homeowners insurance
  hoaFees?: number;               // Monthly HOA fees
  pmi?: number;                   // DEPRECATED: replaced by pmiConfig

  // NEW: Property & Down Payment
  propertyPrice?: number;         // Purchase price of property
  downPaymentPercent?: number;    // Down payment as percentage (0-100)
  downPaymentDollar?: number;     // Down payment as dollar amount

  // NEW: Points & Credits
  discountPoints?: number;        // Discount points purchased (0-4 typical)
  originationPoints?: number;     // Lender origination fee as points
  lenderCredits?: number;         // Credits toward closing costs
  sellerConcessions?: number;     // Amount seller pays toward buyer's closing costs

  // NEW: Comprehensive Structures
  closingCosts: ClosingCosts;     // Detailed closing cost breakdown
  pmiConfig: PMIConfig;           // PMI configuration
  extraPayments: ExtraPayments;   // Payment acceleration options
  loanType: 'fixed' | 'arm';      // Loan type selector
  armConfig?: ARMConfig;          // Required if loanType='arm'
}
```

**Validation Rules**:
- Existing fields: same validation as before
- `propertyPrice` must be > 0 if provided
- If both `downPaymentPercent` and `downPaymentDollar` provided, they must be consistent
- `principal` should equal `propertyPrice - downPayment` if property price provided
- `discountPoints` range: 0-4 (typical maximum)
- `originationPoints` range: 0-3 (typical maximum)
- `lenderCredits` and `sellerConcessions` must be ≥ 0
- `closingCosts`, `pmiConfig`, `extraPayments` always present (may have default/empty values)
- `armConfig` required if `loanType='arm'`, must be undefined if `loanType='fixed'`

**Derived Calculations**:
```typescript
// Effective interest rate after discount points
effectiveRate = interestRate - (discountPoints × 0.25);

// Loan amount calculation
if (propertyPrice && downPaymentDollar) {
  principal = propertyPrice - downPaymentDollar;
}

// Down payment synchronization
if (propertyPrice && downPaymentPercent) {
  downPaymentDollar = propertyPrice × (downPaymentPercent / 100);
}
if (propertyPrice && downPaymentDollar) {
  downPaymentPercent = (downPaymentDollar / propertyPrice) × 100;
}

// LTV calculation
ltv = (principal / propertyPrice) × 100;

// PMI requirement
pmiRequired = ltv > 80; // down payment < 20%
```

---

### 6. LoanResults (Extended)

**Purpose**: Complete loan calculation results including all comprehensive factors

**Fields**:
```typescript
interface LoanResults {
  // Existing fields (unchanged)
  monthlyPaymentPI: number;       // Principal & Interest only
  monthlyPaymentTotal: number;    // Total including PITI + PMI + HOA
  totalInterest: number;          // Total interest paid over loan life
  totalCost: number;              // Total paid over loan life
  amortizationSchedule: AmortizationEntry[];

  // NEW: Closing costs
  totalClosingCosts: number;      // Sum of all closing costs + points
  netClosingCosts: number;        // After seller concessions & lender credits
  cashNeededAtClosing: number;    // Down payment + net closing costs

  // NEW: PMI details
  monthlyPMI?: number;            // Monthly PMI amount (if applicable)
  pmiRemovalMonth?: number;       // Month when PMI auto-terminates
  pmiRemovalDate?: Date;          // Date when PMI auto-terminates
  totalPMIPaid?: number;          // Total PMI paid before removal

  // NEW: Extra payments impact
  originalTermMonths: number;     // Original loan term
  acceleratedTermMonths?: number; // Reduced term with extra payments
  totalInterestSaved?: number;    // Interest saved from extra payments
  earlyPayoffDate?: Date;         // Payoff date with extra payments

  // NEW: ARM projections
  armProjections?: ARMProjection[];  // Payment projections for ARM loans
  worstCaseMaxPayment?: number;      // Highest possible payment (ARM lifetime cap)
  worstCaseTotalCost?: number;       // Total cost at worst-case rates
}

interface ARMProjection {
  year: number;
  projectedRate: number;
  monthlyPaymentPI: number;
  monthlyPaymentTotal: number;
}
```

**Validation Rules**:
- All currency amounts must be ≥ 0
- `acceleratedTermMonths` must be ≤ `originalTermMonths`
- `pmiRemovalMonth` must be ≤ `originalTermMonths`
- `armProjections` required if loan type is ARM, undefined otherwise

**Derived Calculations**:
```typescript
// Closing costs calculation
totalClosingCosts = sum(closingCosts) +
                   (principal × discountPoints / 100) +
                   (principal × originationPoints / 100);
netClosingCosts = totalClosingCosts - sellerConcessions - lenderCredits;
cashNeededAtClosing = downPaymentDollar + netClosingCosts;

// PMI calculations
if (pmiConfig.type === 'monthly') {
  monthlyPMI = (principal × pmiConfig.monthlyRate) / 12;
  // Find month when remaining balance ≤ 78% of property price
  pmiRemovalMonth = findPMIRemovalMonth(amortizationSchedule, propertyPrice);
  totalPMIPaid = monthlyPMI × pmiRemovalMonth;
}

// Extra payments impact
if (hasExtraPayments) {
  acceleratedSchedule = recalculateWithExtraPayments(amortizationSchedule, extraPayments);
  acceleratedTermMonths = acceleratedSchedule.length;
  totalInterestSaved = totalInterest - sum(acceleratedSchedule.map(e => e.interestPaid));
  earlyPayoffDate = acceleratedSchedule[acceleratedSchedule.length - 1].paymentDate;
}
```

---

### 7. AmortizationEntry (Extended)

**Purpose**: Single month's payment breakdown in amortization schedule

**Fields**:
```typescript
interface AmortizationEntry {
  // Existing fields (unchanged)
  paymentNumber: number;          // Payment sequence (1-360)
  paymentDate: Date;              // Payment due date
  principalPaid: number;          // Principal portion of payment
  interestPaid: number;           // Interest portion of payment
  remainingBalance: number;       // Loan balance after payment

  // NEW: PMI tracking
  pmiPaid?: number;               // PMI amount for this month (0 after removal)
  ltvPercent?: number;            // LTV ratio after this payment
  pmiActive: boolean;             // Whether PMI is active this month

  // NEW: Extra payments
  extraPrincipalPaid?: number;    // Extra principal applied this month
  totalPayment: number;           // Total payment including extra (PI + PMI + extra)

  // NEW: ARM rate tracking
  currentRate?: number;           // Current interest rate (for ARM loans)
  rateAdjustment?: boolean;       // True if rate adjusted this month
}
```

**Validation Rules**:
- `paymentNumber` must be sequential 1 to N
- `remainingBalance` must decrease monotonically (except rate increases in ARM)
- `pmiPaid` must be 0 after `pmiRemovalMonth`
- `ltvPercent` = `(remainingBalance / originalPropertyPrice) × 100`
- `pmiActive` = `ltvPercent > 78`

**Business Rules**:
- PMI automatically removed when `ltvPercent ≤ 78%`
- Extra payments reduce `remainingBalance` faster
- When `remainingBalance + totalPayment ≥ remainingBalance`, loan pays off (final payment)
- ARM rate changes reflected in `currentRate` field

---

## Entity Relationships

```
LoanInputs
├── contains → ClosingCosts (composition)
├── contains → PMIConfig (composition)
├── contains → ExtraPayments (composition)
└── contains → ARMConfig (composition, optional)

LoanResults
├── produces → AmortizationEntry[] (composition)
├── references → PMIConfig (for removal calculations)
├── references → ExtraPayments (for acceleration calculations)
└── produces → ARMProjection[] (composition, optional)

AmortizationEntry
├── tracks → PMI status per month
├── tracks → LTV ratio per month
└── tracks → ARM rate changes per month
```

## Data Flow

```
User Input (LoanInputs)
    ↓
Validation (Zod schemas)
    ↓
Derived Calculations
  - Effective rate (discount points)
  - Down payment sync (% ↔ $)
  - LTV calculation
  - PMI requirement check
    ↓
Core Calculations
  - Monthly payment (amortization formula)
  - Amortization schedule generation
  - PMI removal detection
  - Extra payment application
  - ARM rate projections
    ↓
Results Aggregation (LoanResults)
    ↓
Display to User
```

## State Management

**Storage Location**: Client-side React state (useState in loan-comparison.tsx)

**State Structure**:
```typescript
// In loan-comparison.tsx
const [loan1, setLoan1] = useState<Partial<LoanInputs>>({
  closingCosts: {},
  pmiConfig: { type: 'none' },
  extraPayments: {},
  loanType: 'fixed'
});
const [loan2, setLoan2] = useState<Partial<LoanInputs>>({ /* same defaults */ });

const [results1, setResults1] = useState<LoanResults | null>(null);
const [results2, setResults2] = useState<LoanResults | null>(null);
```

**Update Pattern**:
1. User changes input field
2. onChange handler updates LoanInputs state
3. Derived calculations trigger via useMemo
4. Results update automatically
5. UI re-renders with new calculations

**Memoization Strategy**:
```typescript
const results1 = useMemo(() => {
  if (!isLoanComplete(loan1)) return null;
  return calculateLoanResults(loan1);
}, [loan1]);
```

## Type Guards

```typescript
// Check if loan has complete required fields
function isLoanComplete(inputs: Partial<LoanInputs>): inputs is LoanInputs {
  return inputs.principal !== undefined &&
         inputs.interestRate !== undefined &&
         inputs.termYears !== undefined &&
         LoanInputsSchema.safeParse(inputs).success;
}

// Check if PMI is required
function isPMIRequired(inputs: LoanInputs): boolean {
  if (!inputs.propertyPrice || !inputs.downPaymentDollar) return false;
  const ltv = (inputs.principal / inputs.propertyPrice) × 100;
  return ltv > 80;
}

// Check if loan is ARM type
function isARMLoan(inputs: LoanInputs): inputs is LoanInputs & { armConfig: ARMConfig } {
  return inputs.loanType === 'arm' && inputs.armConfig !== undefined;
}
```
