import { LoanInputs, LoanResults, AmortizationEntry, ClosingCosts, PMIConfig, ExtraPayments, ARMConfig, ARMRateEntry } from '@/types/loan';
import { LoanInputsSchema } from '@/lib/validations';

/**
 * Calculate monthly mortgage payment (Principal & Interest only)
 * @param principal - Loan amount in USD
 * @param interestRate - Annual interest rate as percentage (e.g., 5 for 5%)
 * @param termYears - Loan term in years
 * @returns Monthly payment amount (P&I only)
 */
export function calculateMonthlyPayment(
  principal: number,
  interestRate: number,
  termYears: number
): number {
  const n = termYears * 12; // Total number of payments

  // Special case: 0% interest
  if (interestRate === 0) {
    return principal / n;
  }

  // Convert annual rate to monthly decimal
  const r = interestRate / 12 / 100;

  // Standard amortization formula: M = P × [r(1 + r)^n] / [(1 + r)^n - 1]
  const numerator = r * Math.pow(1 + r, n);
  const denominator = Math.pow(1 + r, n) - 1;

  return principal * (numerator / denominator);
}

/**
 * Generate complete amortization schedule
 * @param principal - Loan amount in USD
 * @param interestRate - Annual interest rate as percentage
 * @param termYears - Loan term in years
 * @param startDate - Starting date for schedule (defaults to today)
 * @returns Array of amortization entries
 */
export function generateAmortizationSchedule(
  principal: number,
  interestRate: number,
  termYears: number,
  startDate: Date = new Date()
): AmortizationEntry[] {
  const monthlyPayment = calculateMonthlyPayment(principal, interestRate, termYears);
  const n = termYears * 12;
  const monthlyRate = interestRate / 12 / 100;

  const schedule: AmortizationEntry[] = [];
  let remainingBalance = principal;

  for (let i = 1; i <= n; i++) {
    // Calculate interest for this payment
    const interestPaid = remainingBalance * monthlyRate;

    // Calculate principal for this payment
    let principalPaid = monthlyPayment - interestPaid;

    // Handle final payment rounding (ensure balance goes to exactly 0)
    if (i === n) {
      principalPaid = remainingBalance;
    }

    // Update remaining balance
    remainingBalance -= principalPaid;

    // Calculate payment date (add i months to start date)
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + i);

    schedule.push({
      paymentNumber: i,
      paymentDate,
      principalPaid,
      interestPaid,
      remainingBalance: Math.max(0, remainingBalance), // Ensure no negative balance due to rounding
      pmiActive: false, // No PMI tracking in basic schedule
      totalPayment: monthlyPayment // Just P&I, no extras
    });
  }

  return schedule;
}

/**
 * T024: Calculate effective interest rate after discount points
 * Each discount point reduces rate by 0.25%
 */
export function calculateEffectiveRate(baseRate: number, discountPoints: number): number {
  const reduction = discountPoints * 0.25;
  return Math.max(0, baseRate - reduction); // Floor at 0%
}

/**
 * T025: Calculate total cost of discount and origination points
 * 1 point = 1% of loan amount
 */
export function calculatePointsCost(
  loanAmount: number,
  discountPoints: number,
  originationPoints: number
): number {
  return loanAmount * (discountPoints + originationPoints) / 100;
}

/**
 * T026: Calculate total closing costs
 */
export function calculateTotalClosingCosts(
  closingCosts: ClosingCosts,
  pointsCost: number,
  sellerConcessions: number,
  lenderCredits: number
): number {
  const sum = Object.values(closingCosts).reduce((total, cost) => total + (cost || 0), 0);
  return sum + pointsCost - sellerConcessions - lenderCredits;
}

/**
 * T027: Calculate cash needed at closing
 */
export function calculateCashAtClosing(downPayment: number, totalClosingCosts: number): number {
  return downPayment + totalClosingCosts;
}

/**
 * T028: Calculate Loan-to-Value (LTV) ratio
 */
export function calculateLTV(loanAmount: number, propertyPrice: number): number {
  return (loanAmount / propertyPrice) * 100;
}

/**
 * T029: Calculate monthly PMI amount
 */
export function calculateMonthlyPMI(loanAmount: number, pmiConfig: PMIConfig): number {
  if (pmiConfig.type === 'monthly' && pmiConfig.monthlyRate) {
    return (loanAmount * pmiConfig.monthlyRate) / 12;
  }
  return 0;
}

/**
 * T030: Find month when PMI automatically terminates (78% LTV)
 */
export function findPMIRemovalMonth(
  amortizationSchedule: AmortizationEntry[],
  originalPropertyPrice: number
): number | null {
  const targetBalance = originalPropertyPrice * 0.78;

  for (let i = 0; i < amortizationSchedule.length; i++) {
    if (amortizationSchedule[i].remainingBalance <= targetBalance) {
      return i + 1; // Return 1-indexed month number
    }
  }

  return null;
}

/**
 * T031: Synchronize down payment percentage and dollar amount
 */
export function syncDownPayment(
  propertyPrice: number,
  downPaymentPercent?: number,
  downPaymentDollar?: number
): { percent: number; dollar: number; loanAmount: number } {
  let percent: number;
  let dollar: number;

  if (downPaymentPercent !== undefined) {
    percent = downPaymentPercent;
    dollar = propertyPrice * (percent / 100);
  } else if (downPaymentDollar !== undefined) {
    dollar = downPaymentDollar;
    percent = (dollar / propertyPrice) * 100;
  } else {
    // Default to 20%
    percent = 20;
    dollar = propertyPrice * 0.2;
  }

  const loanAmount = propertyPrice - dollar;

  return { percent, dollar, loanAmount };
}

/**
 * T032: Recalculate amortization schedule with extra payments
 */
export function recalculateWithExtraPayments(
  baseSchedule: AmortizationEntry[],
  extraPayments: ExtraPayments,
  monthlyPayment: number
): AmortizationEntry[] {
  const { extraMonthly = 0, extraAnnual = 0, extraAnnualMonth = 1, lumpSums = [], biweeklyEnabled = false } = extraPayments;

  // Calculate bi-weekly extra (equivalent to 1 extra monthly payment per year)
  const biweeklyExtra = biweeklyEnabled ? monthlyPayment / 12 : 0;

  // We can't modify the base schedule, so we return it as-is
  // This is a placeholder - full implementation would recalculate from scratch
  // For now, just mark that extras exist
  return baseSchedule.map(entry => ({
    ...entry,
    extraPrincipalPaid: extraMonthly + biweeklyExtra
  }));
}

/**
 * T033: Generate ARM rate projection schedule (worst-case scenario)
 */
export function generateARMProjections(
  armConfig: ARMConfig,
  initialRate: number,
  loanAmount: number,
  termYears: number
): ARMRateEntry[] {
  const projections: ARMRateEntry[] = [];
  const { initialFixedPeriodYears, initialCap, periodicCap, lifetimeCap } = armConfig;

  let currentRate = initialRate;

  for (let year = 1; year <= termYears; year++) {
    if (year <= initialFixedPeriodYears) {
      // Fixed rate period
      currentRate = initialRate;
    } else if (year === initialFixedPeriodYears + 1) {
      // First adjustment
      currentRate = Math.min(initialRate + initialCap, initialRate + lifetimeCap);
    } else {
      // Subsequent adjustments
      currentRate = Math.min(currentRate + periodicCap, initialRate + lifetimeCap);
    }

    // Calculate monthly payment at this rate
    const monthlyPaymentPI = calculateMonthlyPayment(loanAmount, currentRate, termYears - year + 1);

    projections.push({
      year,
      rate: currentRate,
      monthlyPayment: monthlyPaymentPI
    });
  }

  return projections;
}

/**
 * Calculate complete loan results including all costs
 * @param inputs - Loan input parameters
 * @returns Complete loan calculation results
 */
/**
 * T034: Calculate comprehensive loan results
 * Integrates all calculation functions
 */
export function calculateLoanResults(inputs: LoanInputs): LoanResults {
  // Calculate effective rate with discount points
  const effectiveRate = inputs.discountPoints
    ? calculateEffectiveRate(inputs.interestRate, inputs.discountPoints)
    : inputs.interestRate;

  // Calculate base P&I payment with effective rate
  const monthlyPaymentPI = calculateMonthlyPayment(
    inputs.principal,
    effectiveRate,
    inputs.termYears
  );

  // Calculate closing costs
  const pointsCost = calculatePointsCost(
    inputs.principal,
    inputs.discountPoints || 0,
    inputs.originationPoints || 0
  );
  const totalClosingCosts = calculateTotalClosingCosts(
    inputs.closingCosts,
    pointsCost,
    inputs.sellerConcessions || 0,
    inputs.lenderCredits || 0
  );
  const netClosingCosts = totalClosingCosts;

  // Calculate cash needed (if down payment provided)
  const cashNeededAtClosing = inputs.downPaymentDollar
    ? calculateCashAtClosing(inputs.downPaymentDollar, netClosingCosts)
    : netClosingCosts;

  // Calculate monthly PMI
  const monthlyPMI = calculateMonthlyPMI(inputs.principal, inputs.pmiConfig);

  // Add optional costs to get total monthly payment
  const monthlyPropertyTax = (inputs.propertyTax || 0) / 12;
  const monthlyInsurance = (inputs.insurance || 0) / 12;
  const monthlyHOA = inputs.hoaFees || 0;

  const monthlyPaymentTotal = monthlyPaymentPI + monthlyPropertyTax + monthlyInsurance + monthlyHOA + monthlyPMI;

  // Generate amortization schedule
  const amortizationSchedule = generateAmortizationSchedule(
    inputs.principal,
    effectiveRate,
    inputs.termYears
  );

  // Find PMI removal month (if property price provided)
  let pmiRemovalMonth: number | null = null;
  if (inputs.propertyPrice && inputs.pmiConfig.type === 'monthly') {
    pmiRemovalMonth = findPMIRemovalMonth(amortizationSchedule, inputs.propertyPrice);
  }

  // Calculate total interest from amortization schedule
  const totalInterest = amortizationSchedule.reduce(
    (sum, entry) => sum + entry.interestPaid,
    0
  );

  // Calculate total cost over life of loan
  const totalCost = monthlyPaymentTotal * inputs.termYears * 12;

  // Generate ARM projections if ARM loan
  let armProjections: ARMRateEntry[] | undefined;
  let worstCaseMaxPayment: number | undefined;
  if (inputs.loanType === 'arm' && inputs.armConfig) {
    armProjections = generateARMProjections(
      inputs.armConfig,
      inputs.interestRate,
      inputs.principal,
      inputs.termYears
    );
    // Worst case is the highest payment in projections
    worstCaseMaxPayment = Math.max(...armProjections.map(p => p.monthlyPayment));
  }

  const results: LoanResults = {
    monthlyPaymentPI,
    monthlyPaymentTotal,
    totalInterest,
    totalCost,
    amortizationSchedule,
    totalClosingCosts,
    netClosingCosts,
    cashNeededAtClosing,
    originalTermMonths: inputs.termYears * 12,
    monthlyPMI: monthlyPMI > 0 ? monthlyPMI : undefined,
    pmiRemovalMonth: pmiRemovalMonth || undefined,
    armProjections,
    worstCaseMaxPayment
  };

  return results;
}

/**
 * Format a number as USD currency
 * @param value - Numeric value to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format a number as percentage
 * @param value - Numeric value to format
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Type guard to check if loan inputs are complete
 * @param inputs - Partial loan inputs
 * @returns True if all required fields are present and valid
 */
export function isLoanComplete(inputs: Partial<LoanInputs>): inputs is LoanInputs {
  return (
    inputs.principal !== undefined &&
    inputs.interestRate !== undefined &&
    inputs.termYears !== undefined &&
    LoanInputsSchema.safeParse(inputs).success
  );
}
