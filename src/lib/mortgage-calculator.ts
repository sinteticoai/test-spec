import { LoanInputs, LoanResults, AmortizationEntry } from '@/types/loan';
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
      remainingBalance: Math.max(0, remainingBalance) // Ensure no negative balance due to rounding
    });
  }

  return schedule;
}

/**
 * Calculate complete loan results including all costs
 * @param inputs - Loan input parameters
 * @returns Complete loan calculation results
 */
export function calculateLoanResults(inputs: LoanInputs): LoanResults {
  // Calculate base P&I payment
  const monthlyPaymentPI = calculateMonthlyPayment(
    inputs.principal,
    inputs.interestRate,
    inputs.termYears
  );

  // Add optional costs to get total monthly payment
  const monthlyPropertyTax = (inputs.propertyTax || 0) / 12;
  const monthlyInsurance = (inputs.insurance || 0) / 12;
  const monthlyHOA = inputs.hoaFees || 0;
  const monthlyPMI = inputs.pmi || 0;

  const monthlyPaymentTotal = monthlyPaymentPI + monthlyPropertyTax + monthlyInsurance + monthlyHOA + monthlyPMI;

  // Generate amortization schedule
  const amortizationSchedule = generateAmortizationSchedule(
    inputs.principal,
    inputs.interestRate,
    inputs.termYears
  );

  // Calculate total interest from amortization schedule
  const totalInterest = amortizationSchedule.reduce(
    (sum, entry) => sum + entry.interestPaid,
    0
  );

  // Calculate total cost over life of loan
  const totalCost = monthlyPaymentTotal * inputs.termYears * 12;

  return {
    monthlyPaymentPI,
    monthlyPaymentTotal,
    totalInterest,
    totalCost,
    amortizationSchedule
  };
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
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
