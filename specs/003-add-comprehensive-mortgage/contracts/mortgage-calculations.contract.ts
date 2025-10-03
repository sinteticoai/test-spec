/**
 * CONTRACT: Mortgage Calculation Functions
 *
 * This file defines the contracts (function signatures and behavior specifications)
 * for all mortgage calculation functions required by the comprehensive calculator.
 *
 * These are CONTRACTS, not implementations. Implementation will happen in Phase 4.
 */

import { LoanInputs, LoanResults, AmortizationEntry, ClosingCosts, PMIConfig, ExtraPayments, ARMConfig } from '@/types/loan';

/**
 * CONTRACT: Calculate effective interest rate after discount points
 *
 * Behavior:
 * - Each discount point reduces rate by 0.25%
 * - Rate cannot go below 0%
 * - Input rate is annual percentage (e.g., 6.5 for 6.5%)
 *
 * @param baseRate - Original annual interest rate (percentage)
 * @param discountPoints - Number of discount points purchased (0-4 typical)
 * @returns Effective annual interest rate after discount points applied
 *
 * Examples:
 * - calculateEffectiveRate(6.0, 0) = 6.0
 * - calculateEffectiveRate(6.0, 1) = 5.75
 * - calculateEffectiveRate(6.0, 2) = 5.5
 * - calculateEffectiveRate(1.0, 10) = 0 (cannot go negative)
 */
export function calculateEffectiveRate(baseRate: number, discountPoints: number): number;

/**
 * CONTRACT: Calculate total cost of discount and origination points
 *
 * Behavior:
 * - 1 point = 1% of loan amount
 * - Result added to closing costs
 *
 * @param loanAmount - Principal loan amount
 * @param discountPoints - Discount points purchased
 * @param originationPoints - Origination points (lender fees)
 * @returns Total cost of all points in USD
 *
 * Examples:
 * - calculatePointsCost(500000, 1, 0) = 5000
 * - calculatePointsCost(500000, 1, 1) = 10000
 * - calculatePointsCost(500000, 0, 0) = 0
 */
export function calculatePointsCost(
  loanAmount: number,
  discountPoints: number,
  originationPoints: number
): number;

/**
 * CONTRACT: Calculate total closing costs
 *
 * Behavior:
 * - Sum all closing cost line items
 * - Add discount points cost
 * - Add origination points cost
 * - Subtract seller concessions
 * - Subtract lender credits
 *
 * @param closingCosts - Detailed closing cost breakdown
 * @param pointsCost - Total cost of discount + origination points
 * @param sellerConcessions - Amount seller pays toward closing
 * @param lenderCredits - Lender credits toward closing
 * @returns Net closing costs (can be negative if credits > costs)
 *
 * Examples:
 * - All costs $10k, no concessions/credits: returns 10000
 * - Costs $10k, $2k seller concessions, $1k lender credits: returns 7000
 */
export function calculateTotalClosingCosts(
  closingCosts: ClosingCosts,
  pointsCost: number,
  sellerConcessions: number,
  lenderCredits: number
): number;

/**
 * CONTRACT: Calculate cash needed at closing
 *
 * Behavior:
 * - Down payment (required)
 * - Plus: total closing costs
 * - Result must be ≥ 0
 *
 * @param downPayment - Down payment amount in USD
 * @param totalClosingCosts - Net closing costs
 * @returns Total cash needed at closing
 *
 * Examples:
 * - $100k down + $10k closing = $110k
 * - $100k down + $0 closing = $100k
 */
export function calculateCashAtClosing(downPayment: number, totalClosingCosts: number): number;

/**
 * CONTRACT: Calculate Loan-to-Value (LTV) ratio
 *
 * Behavior:
 * - LTV = (loan amount / property price) × 100
 * - Result is percentage (0-100+)
 * - Used to determine PMI requirement
 *
 * @param loanAmount - Principal loan amount
 * @param propertyPrice - Purchase price of property
 * @returns LTV ratio as percentage
 *
 * Examples:
 * - $400k loan / $500k property = 80% LTV
 * - $450k loan / $500k property = 90% LTV
 * - $500k loan / $500k property = 100% LTV (no down payment)
 */
export function calculateLTV(loanAmount: number, propertyPrice: number): number;

/**
 * CONTRACT: Calculate monthly PMI amount
 *
 * Behavior:
 * - Monthly PMI = (loan amount × annual PMI rate) / 12
 * - Only applies if PMI type is 'monthly'
 * - Returns 0 if PMI type is 'none', 'single_premium', or 'lender_paid'
 *
 * @param loanAmount - Principal loan amount
 * @param pmiConfig - PMI configuration
 * @returns Monthly PMI amount in USD
 *
 * Examples:
 * - $400k loan, 0.5% annual PMI rate: ($400k × 0.005) / 12 = $166.67/month
 * - $400k loan, 1% annual PMI rate: ($400k × 0.01) / 12 = $333.33/month
 * - PMI type 'none': returns 0
 */
export function calculateMonthlyPMI(loanAmount: number, pmiConfig: PMIConfig): number;

/**
 * CONTRACT: Find month when PMI automatically terminates (78% LTV)
 *
 * Behavior:
 * - Iterate through amortization schedule
 * - Calculate LTV for each month: (remaining balance / original property price) × 100
 * - Return first month where LTV ≤ 78%
 * - Returns null if never reaches 78% (shouldn't happen for standard loans)
 *
 * @param amortizationSchedule - Full amortization schedule
 * @param originalPropertyPrice - Property purchase price
 * @returns Month number (1-360) when PMI terminates, or null
 *
 * Examples:
 * - $500k property, $400k loan (80% LTV): Terminates when balance ≤ $390k (78% of $500k)
 * - Typical 80% LTV loan: PMI removal around month 120-150 (10-12.5 years)
 */
export function findPMIRemovalMonth(
  amortizationSchedule: AmortizationEntry[],
  originalPropertyPrice: number
): number | null;

/**
 * CONTRACT: Recalculate amortization schedule with extra payments
 *
 * Behavior:
 * - Start with standard amortization schedule
 * - Apply extra monthly payment every month
 * - Apply extra annual payment once per year (specified month)
 * - Apply lump sum payments on specified months
 * - Apply bi-weekly effect (equivalent to 1 extra monthly payment/year)
 * - Recalculate remaining balance and interest after each payment
 * - Terminate schedule when remaining balance reaches 0
 * - Return shortened schedule
 *
 * @param baseSchedule - Original amortization schedule without extra payments
 * @param extraPayments - Extra payment configuration
 * @param monthlyPayment - Base monthly P&I payment
 * @returns Modified amortization schedule with extra payments applied
 *
 * Examples:
 * - $200/month extra on $2,000 payment: Adds 10% to principal each month
 * - Bi-weekly enabled: Adds equivalent of 1 monthly payment per year
 * - $10k lump sum at month 60: Reduces remaining balance by $10k that month
 *
 * Side effects:
 * - Shortens loan term
 * - Reduces total interest paid
 * - Updates each AmortizationEntry.extraPrincipalPaid field
 */
export function recalculateWithExtraPayments(
  baseSchedule: AmortizationEntry[],
  extraPayments: ExtraPayments,
  monthlyPayment: number
): AmortizationEntry[];

/**
 * CONTRACT: Generate ARM rate projection schedule (worst-case scenario)
 *
 * Behavior:
 * - Years 1-N (initial fixed period): Use initial rate
 * - Year N+1 (first adjustment): initial rate + initial cap
 * - Years N+2 onward: previous rate + periodic cap
 * - Cap maximum rate at initial rate + lifetime cap
 * - Generate payment amount for each rate scenario
 * - Return year-by-year projection
 *
 * @param armConfig - ARM configuration
 * @param initialRate - Starting interest rate
 * @param loanAmount - Principal amount
 * @param termYears - Total loan term
 * @returns Array of projected rates and payments by year
 *
 * Examples:
 * - 5/1 ARM at 5%, 2/2/5 caps:
 *   Year 1-5: 5%
 *   Year 6: 7% (5% + 2% initial cap)
 *   Year 7: 9% (7% + 2% periodic cap)
 *   Year 8+: 10% (5% + 5% lifetime cap - capped)
 *
 * - 7/1 ARM at 4%, 5/1/6 caps:
 *   Year 1-7: 4%
 *   Year 8: 9% (4% + 5% initial cap)
 *   Year 9: 10% (9% + 1% periodic cap, but capped at 4% + 6% = 10%)
 *   Year 10+: 10% (lifetime cap reached)
 */
export function generateARMProjections(
  armConfig: ARMConfig,
  initialRate: number,
  loanAmount: number,
  termYears: number
): { year: number; rate: number; monthlyPayment: number }[];

/**
 * CONTRACT: Calculate comprehensive loan results
 *
 * Behavior:
 * - Validate all inputs
 * - Calculate effective rate (with discount points)
 * - Calculate base monthly payment (P&I)
 * - Calculate monthly PMI (if applicable)
 * - Calculate total monthly payment (P&I + PMI + escrow + HOA)
 * - Generate base amortization schedule
 * - Find PMI removal month
 * - Recalculate schedule with extra payments
 * - Calculate closing costs
 * - Calculate cash needed at closing
 * - Generate ARM projections (if ARM loan)
 * - Calculate interest savings from extra payments
 * - Return comprehensive results
 *
 * @param inputs - Complete loan configuration
 * @returns Comprehensive loan calculation results
 *
 * Throws:
 * - Error if required fields missing
 * - Error if validation fails (negative values, invalid ranges)
 * - Error if ARM selected but armConfig missing
 *
 * Examples:
 * - Standard 30-year fixed, 20% down: No PMI, standard schedule
 * - 30-year fixed, 10% down, 0.5% PMI: Monthly PMI until 78% LTV
 * - 30-year with $200/month extra: Payoff in ~22 years, save ~$80k interest
 * - 5/1 ARM: Fixed for 5 years, then projections show potential rate increases
 */
export function calculateComprehensiveLoanResults(inputs: LoanInputs): LoanResults;

/**
 * CONTRACT: Synchronize down payment percentage and dollar amount
 *
 * Behavior:
 * - If user changes percentage: recalculate dollar amount
 * - If user changes dollar amount: recalculate percentage
 * - Both values must remain in sync with property price
 * - Recalculate loan amount (property price - down payment)
 *
 * @param propertyPrice - Property purchase price
 * @param downPaymentPercent - Down payment as percentage (if changed)
 * @param downPaymentDollar - Down payment as dollar amount (if changed)
 * @returns Updated { percent, dollar, loanAmount }
 *
 * Examples:
 * - $500k property, user enters 20%: returns { percent: 20, dollar: 100000, loanAmount: 400000 }
 * - $500k property, user enters $100k: returns { percent: 20, dollar: 100000, loanAmount: 400000 }
 * - $500k property, user enters 15%: returns { percent: 15, dollar: 75000, loanAmount: 425000 }
 */
export function syncDownPayment(
  propertyPrice: number,
  downPaymentPercent?: number,
  downPaymentDollar?: number
): { percent: number; dollar: number; loanAmount: number };
