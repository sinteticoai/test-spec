// T002: ClosingCosts interface
export interface ClosingCosts {
  appraisalFee?: number;
  titleInsurance?: number;
  titleSearchFee?: number;
  recordingFees?: number;
  attorneyFees?: number;
  transferTax?: number;
  surveyFee?: number;
  prepaidEscrow?: number;
  otherClosingCosts?: number;
  buyerAgentCommission?: number;
}

// T003: PMIConfig interface with discriminated union
export interface PMIConfig {
  type: 'monthly' | 'single_premium' | 'lender_paid' | 'none';
  monthlyRate?: number;
  singlePremiumAmount?: number;
  removalMonth?: number;
  removalDate?: Date;
}

// T004: ExtraPayments and LumpSumPayment interfaces
export interface LumpSumPayment {
  amount: number;
  paymentMonth: number;
  paymentDate?: Date;
}

export interface ExtraPayments {
  extraMonthly?: number;
  extraAnnual?: number;
  extraAnnualMonth?: number;
  lumpSums?: LumpSumPayment[];
  biweeklyEnabled?: boolean;
}

// T005: ARMConfig and ARMRateEntry interfaces
export interface ARMRateEntry {
  year: number;
  rate: number;
  monthlyPayment: number;
}

export interface ARMConfig {
  initialFixedPeriodYears: number;
  adjustmentFrequency: 'annual' | 'semi-annual';
  initialCap: number;
  periodicCap: number;
  lifetimeCap: number;
  projectedRateSchedule?: ARMRateEntry[];
}

// T001: Extended LoanInputs interface
export interface LoanInputs {
  // Existing fields
  principal: number;
  interestRate: number;
  termYears: number;
  propertyTax?: number;
  insurance?: number;
  hoaFees?: number;
  pmi?: number; // DEPRECATED: replaced by pmiConfig

  // NEW: Property & Down Payment
  propertyPrice?: number;
  downPaymentPercent?: number;
  downPaymentDollar?: number;

  // NEW: Points & Credits
  discountPoints?: number;
  originationPoints?: number;
  lenderCredits?: number;
  sellerConcessions?: number;

  // NEW: Comprehensive Structures
  closingCosts: ClosingCosts;
  pmiConfig: PMIConfig;
  extraPayments: ExtraPayments;
  loanType: 'fixed' | 'arm';
  armConfig?: ARMConfig;
}

// T007: Extended AmortizationEntry interface
export interface AmortizationEntry {
  // Existing fields
  paymentNumber: number;
  paymentDate: Date;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;

  // NEW: PMI tracking
  pmiPaid?: number;
  ltvPercent?: number;
  pmiActive: boolean;

  // NEW: Extra payments
  extraPrincipalPaid?: number;
  totalPayment: number;

  // NEW: ARM rate tracking
  currentRate?: number;
  rateAdjustment?: boolean;
}

// T006: Extended LoanResults interface
export interface LoanResults {
  // Existing fields
  monthlyPaymentPI: number;
  monthlyPaymentTotal: number;
  totalInterest: number;
  totalCost: number;
  amortizationSchedule: AmortizationEntry[];

  // NEW: Closing costs
  totalClosingCosts: number;
  netClosingCosts: number;
  cashNeededAtClosing: number;

  // NEW: PMI details
  monthlyPMI?: number;
  pmiRemovalMonth?: number;
  pmiRemovalDate?: Date;
  totalPMIPaid?: number;

  // NEW: Extra payments impact
  originalTermMonths: number;
  acceleratedTermMonths?: number;
  totalInterestSaved?: number;
  earlyPayoffDate?: Date;

  // NEW: ARM projections
  armProjections?: ARMRateEntry[];
  worstCaseMaxPayment?: number;
  worstCaseTotalCost?: number;
}
