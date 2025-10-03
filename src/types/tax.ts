/**
 * Tax-related type definitions for mortgage tax benefit calculations
 * Based on 2025 federal tax code
 */

/**
 * Federal tax filing status options
 */
export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head_of_household';

/**
 * User's tax profile information required for benefit calculations
 */
export interface TaxProfile {
  /** Annual taxable income in USD */
  annualIncome: number;
  /** Federal tax filing status */
  filingStatus: FilingStatus;
  /** Estimated annual property taxes in USD */
  propertyTaxAnnual: number;
}

/**
 * Federal income tax bracket definition for 2025
 */
export interface TaxBracket {
  /** Tax rate as decimal (e.g., 0.22 for 22%) */
  rate: number;
  /** Minimum income for bracket (inclusive) */
  minIncome: number;
  /** Maximum income for bracket (exclusive), null for top bracket */
  maxIncome: number | null;
}

/**
 * Complete tax benefit calculation results
 */
export interface TaxBenefitCalculation {
  // Input summary
  /** Original loan amount */
  loanAmount: number;
  /** Estimated first-year mortgage interest */
  firstYearInterest: number;

  // Deduction calculations
  /** Deductible mortgage interest (may be capped at $750K limit) */
  mortgageInterestDeduction: number;
  /** Deductible property tax (SALT capped at $10K) */
  propertyTaxDeduction: number;
  /** Sum of mortgage + property deductions */
  totalItemizedDeductions: number;
  /** Filing-status-specific standard deduction */
  standardDeduction: number;

  // Method selection
  /** Which deduction method provides greater benefit */
  recommendedMethod: 'itemized' | 'standard';
  /** Extra deduction beyond standard (0 if standard is better) */
  additionalItemizedBenefit: number;

  // Tax calculation
  /** User's marginal tax rate as decimal */
  marginalTaxRate: number;
  /** Estimated annual tax savings in USD */
  annualTaxSavings: number;
  /** Annual savings / 12 */
  monthlyTaxSavings: number;

  // Payment impact
  /** Monthly P&I + escrow before tax benefit */
  originalMonthlyPayment: number;
  /** Original payment - monthly tax savings */
  effectiveMonthlyPayment: number;

  // Flags and notes
  /** True if loan exceeds qualified debt limit */
  exceeds750kLimit: boolean;
  /** True if property tax exceeds $10K cap */
  exceedsSALTCap: boolean;
  /** True if itemizing beats standard deduction */
  itemizationBeneficial: boolean;
}
