/**
 * Tax benefit calculation functions for mortgage interest and property tax deductions
 * Based on 2025 federal tax code
 */

import { FilingStatus, TaxBracket, TaxProfile, TaxBenefitCalculation } from '@/types/tax';
import { LoanInputs } from './validations';
import { generateAmortizationSchedule } from './mortgage-calculator';

// 2025 Tax Constants

/** Qualified residence debt limit (post-TCJA) */
export const QUALIFIED_DEBT_LIMIT = 750000;

/** State and local tax (SALT) deduction cap */
export const SALT_CAP = 10000;

/** 2025 Standard deductions by filing status */
export const STANDARD_DEDUCTIONS_2025: Record<FilingStatus, number> = {
  single: 15000,
  married_joint: 30000,
  married_separate: 15000,
  head_of_household: 22500
};

/** 2025 Federal tax brackets by filing status */
export const TAX_BRACKETS_2025: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { rate: 0.10, minIncome: 0, maxIncome: 11600 },
    { rate: 0.12, minIncome: 11601, maxIncome: 47150 },
    { rate: 0.22, minIncome: 47151, maxIncome: 100525 },
    { rate: 0.24, minIncome: 100526, maxIncome: 191950 },
    { rate: 0.32, minIncome: 191951, maxIncome: 243725 },
    { rate: 0.35, minIncome: 243726, maxIncome: 609350 },
    { rate: 0.37, minIncome: 609351, maxIncome: null }
  ],
  married_joint: [
    { rate: 0.10, minIncome: 0, maxIncome: 23200 },
    { rate: 0.12, minIncome: 23201, maxIncome: 94300 },
    { rate: 0.22, minIncome: 94301, maxIncome: 201050 },
    { rate: 0.24, minIncome: 201051, maxIncome: 383900 },
    { rate: 0.32, minIncome: 383901, maxIncome: 487450 },
    { rate: 0.35, minIncome: 487451, maxIncome: 731200 },
    { rate: 0.37, minIncome: 731201, maxIncome: null }
  ],
  married_separate: [
    { rate: 0.10, minIncome: 0, maxIncome: 11600 },
    { rate: 0.12, minIncome: 11601, maxIncome: 47150 },
    { rate: 0.22, minIncome: 47151, maxIncome: 100525 },
    { rate: 0.24, minIncome: 100526, maxIncome: 191950 },
    { rate: 0.32, minIncome: 191951, maxIncome: 243725 },
    { rate: 0.35, minIncome: 243726, maxIncome: 365600 },
    { rate: 0.37, minIncome: 365601, maxIncome: null }
  ],
  head_of_household: [
    { rate: 0.10, minIncome: 0, maxIncome: 16550 },
    { rate: 0.12, minIncome: 16551, maxIncome: 63100 },
    { rate: 0.22, minIncome: 63101, maxIncome: 100500 },
    { rate: 0.24, minIncome: 100501, maxIncome: 191950 },
    { rate: 0.32, minIncome: 191951, maxIncome: 243700 },
    { rate: 0.35, minIncome: 243701, maxIncome: 609350 },
    { rate: 0.37, minIncome: 609351, maxIncome: null }
  ]
};

/**
 * Calculate the marginal tax rate for a given income and filing status
 * @param income Annual taxable income
 * @param filingStatus Federal tax filing status
 * @returns Marginal tax rate as decimal (e.g., 0.22 for 22%)
 */
export function calculateMarginalTaxRate(income: number, filingStatus: FilingStatus): number {
  const brackets = TAX_BRACKETS_2025[filingStatus];

  // Find the bracket where income falls
  for (const bracket of brackets) {
    if (bracket.maxIncome === null) {
      // Top bracket (no maximum)
      if (income >= bracket.minIncome) {
        return bracket.rate;
      }
    } else {
      // Standard bracket with upper limit
      if (income >= bracket.minIncome && income <= bracket.maxIncome) {
        return bracket.rate;
      }
    }
  }

  // Fallback to lowest bracket (should not reach here with proper data)
  return brackets[0].rate;
}

/**
 * Get the standard deduction for a given filing status
 * @param filingStatus Federal tax filing status
 * @returns Standard deduction amount for 2025
 */
export function getStandardDeduction(filingStatus: FilingStatus): number {
  return STANDARD_DEDUCTIONS_2025[filingStatus];
}

/**
 * Calculate first-year mortgage interest from loan parameters
 * @param loanInputs Loan parameters
 * @returns Total interest paid in first 12 months
 */
export function calculateFirstYearInterest(loanInputs: LoanInputs): number {
  // Handle zero interest rate edge case
  if (loanInputs.interestRate === 0) {
    return 0;
  }

  // Generate amortization schedule
  const schedule = generateAmortizationSchedule(
    loanInputs.principal,
    loanInputs.interestRate,
    loanInputs.termYears
  );

  // Sum interest for first 12 payments
  const firstYearInterest = schedule
    .slice(0, 12)
    .reduce((total, payment) => total + payment.interestPaid, 0);

  return firstYearInterest;
}

/**
 * Calculate complete tax benefits from mortgage interest and property tax deductions
 * @param loanInputs Mortgage loan parameters
 * @param taxProfile User's tax profile
 * @returns Complete tax benefit calculation
 */
export function calculateTaxBenefits(
  loanInputs: LoanInputs,
  taxProfile: TaxProfile
): TaxBenefitCalculation {
  // Calculate first-year mortgage interest
  const firstYearInterest = calculateFirstYearInterest(loanInputs);

  // Apply $750K qualified debt limit to interest deduction
  // If loan exceeds limit, prorate the interest
  let mortgageInterestDeduction = firstYearInterest;
  if (loanInputs.principal > QUALIFIED_DEBT_LIMIT) {
    const ratio = QUALIFIED_DEBT_LIMIT / loanInputs.principal;
    mortgageInterestDeduction = firstYearInterest * ratio;
  }

  // Apply SALT cap to property tax deduction
  const propertyTaxDeduction = Math.min(taxProfile.propertyTaxAnnual, SALT_CAP);

  // Calculate total itemized deductions
  const totalItemizedDeductions = mortgageInterestDeduction + propertyTaxDeduction;

  // Get standard deduction for filing status
  const standardDeduction = getStandardDeduction(taxProfile.filingStatus);

  // Determine recommended method and calculate additional benefit
  let recommendedMethod: 'itemized' | 'standard';
  let additionalItemizedBenefit: number;
  let itemizationBeneficial: boolean;

  if (totalItemizedDeductions > standardDeduction) {
    recommendedMethod = 'itemized';
    additionalItemizedBenefit = totalItemizedDeductions - standardDeduction;
    itemizationBeneficial = true;
  } else {
    recommendedMethod = 'standard';
    additionalItemizedBenefit = 0;
    itemizationBeneficial = false;
  }

  // Calculate marginal tax rate
  const marginalTaxRate = calculateMarginalTaxRate(
    taxProfile.annualIncome,
    taxProfile.filingStatus
  );

  // Calculate tax savings (only from additional itemized benefit)
  const annualTaxSavings = additionalItemizedBenefit * marginalTaxRate;
  const monthlyTaxSavings = annualTaxSavings / 12;

  // Calculate original monthly payment (P&I + optional costs)
  const monthlyInterestRate = loanInputs.interestRate / 100 / 12;
  const numberOfPayments = loanInputs.termYears * 12;

  let monthlyPrincipalAndInterest: number;
  if (loanInputs.interestRate === 0) {
    monthlyPrincipalAndInterest = loanInputs.principal / numberOfPayments;
  } else {
    monthlyPrincipalAndInterest =
      loanInputs.principal *
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  }

  const monthlyPropertyTax = (loanInputs.propertyTax || 0) / 12;
  const monthlyInsurance = (loanInputs.insurance || 0) / 12;
  const monthlyHOA = (loanInputs.hoaFees || 0) / 12;
  const monthlyPMI = (loanInputs.pmi || 0) / 12;

  const originalMonthlyPayment =
    monthlyPrincipalAndInterest +
    monthlyPropertyTax +
    monthlyInsurance +
    monthlyHOA +
    monthlyPMI;

  // Calculate effective monthly payment after tax savings
  const effectiveMonthlyPayment = originalMonthlyPayment - monthlyTaxSavings;

  // Set flags
  const exceeds750kLimit = loanInputs.principal > QUALIFIED_DEBT_LIMIT;
  const exceedsSALTCap = taxProfile.propertyTaxAnnual > SALT_CAP;

  return {
    loanAmount: loanInputs.principal,
    firstYearInterest,
    mortgageInterestDeduction,
    propertyTaxDeduction,
    totalItemizedDeductions,
    standardDeduction,
    recommendedMethod,
    additionalItemizedBenefit,
    marginalTaxRate,
    annualTaxSavings,
    monthlyTaxSavings,
    originalMonthlyPayment,
    effectiveMonthlyPayment,
    exceeds750kLimit,
    exceedsSALTCap,
    itemizationBeneficial
  };
}
