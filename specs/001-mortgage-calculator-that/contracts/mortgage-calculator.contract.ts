/**
 * Contract Tests: Mortgage Calculator Functions
 *
 * These tests define the contract for the mortgage calculation library.
 * Tests will FAIL until implementation is complete (TDD approach).
 */

import { describe, it, expect } from '@jest/globals';
import type { LoanInputs } from '@/types/loan';

// Import functions to test (will not exist initially)
import {
  calculateMonthlyPayment,
  calculateLoanResults,
  generateAmortizationSchedule
} from '@/lib/mortgage-calculator';

describe('calculateMonthlyPayment', () => {
  it('calculates correct monthly payment for standard loan', () => {
    // Test case: $200,000 at 5% for 30 years
    // Expected: ~$1,073.64
    const result = calculateMonthlyPayment(200000, 5, 30);
    expect(result).toBeCloseTo(1073.64, 2);
  });

  it('handles 0% interest rate (simple division)', () => {
    // Test case: $100,000 at 0% for 10 years
    // Expected: $100,000 / 120 = $833.33
    const result = calculateMonthlyPayment(100000, 0, 10);
    expect(result).toBeCloseTo(833.33, 2);
  });

  it('calculates correctly for maximum boundary values', () => {
    // Test case: $10M at 20% for 50 years (boundary values)
    const result = calculateMonthlyPayment(10_000_000, 20, 50);
    expect(result).toBeGreaterThan(0);
    expect(Number.isFinite(result)).toBe(true);
  });

  it('calculates correctly for minimum boundary values', () => {
    // Test case: $1,000 at 0.01% for 1 year
    const result = calculateMonthlyPayment(1000, 0.01, 1);
    expect(result).toBeCloseTo(83.34, 2);
  });

  it('returns positive number for all valid inputs', () => {
    const result = calculateMonthlyPayment(150000, 3.5, 15);
    expect(result).toBeGreaterThan(0);
  });
});

describe('generateAmortizationSchedule', () => {
  it('generates correct number of entries', () => {
    const schedule = generateAmortizationSchedule(100000, 5, 10);
    expect(schedule).toHaveLength(120); // 10 years × 12 months
  });

  it('first payment has correct principal/interest split', () => {
    // $200,000 at 5% for 30 years
    const schedule = generateAmortizationSchedule(200000, 5, 30);
    const firstPayment = schedule[0];

    expect(firstPayment.paymentNumber).toBe(1);
    expect(firstPayment.interestPaid).toBeCloseTo(833.33, 2); // $200k × (5%/12)
    expect(firstPayment.principalPaid).toBeCloseTo(240.31, 2); // Payment - interest
    expect(firstPayment.remainingBalance).toBeCloseTo(199759.69, 2);
  });

  it('final payment zeroes out remaining balance', () => {
    const schedule = generateAmortizationSchedule(100000, 5, 10);
    const finalPayment = schedule[schedule.length - 1];

    expect(finalPayment.remainingBalance).toBeCloseTo(0, 2);
  });

  it('handles 0% interest rate correctly', () => {
    const schedule = generateAmortizationSchedule(12000, 0, 1);

    expect(schedule).toHaveLength(12);
    expect(schedule[0].interestPaid).toBe(0);
    expect(schedule[0].principalPaid).toBeCloseTo(1000, 2);
  });

  it('interest decreases and principal increases over time', () => {
    const schedule = generateAmortizationSchedule(200000, 5, 30);
    const firstPayment = schedule[0];
    const midPayment = schedule[180]; // 15 years in
    const lastPayment = schedule[359];

    expect(midPayment.interestPaid).toBeLessThan(firstPayment.interestPaid);
    expect(midPayment.principalPaid).toBeGreaterThan(firstPayment.principalPaid);
    expect(lastPayment.interestPaid).toBeLessThan(midPayment.interestPaid);
  });

  it('generates correct payment dates', () => {
    const startDate = new Date('2025-01-01');
    const schedule = generateAmortizationSchedule(100000, 5, 1, startDate);

    expect(schedule[0].paymentDate).toEqual(new Date('2025-02-01'));
    expect(schedule[11].paymentDate).toEqual(new Date('2026-01-01'));
  });

  it('handles maximum term (50 years / 600 payments)', () => {
    const schedule = generateAmortizationSchedule(1000000, 5, 50);
    expect(schedule).toHaveLength(600);
    expect(schedule[599].remainingBalance).toBeCloseTo(0, 2);
  });
});

describe('calculateLoanResults', () => {
  it('calculates complete results for loan without additional costs', () => {
    const inputs: LoanInputs = {
      principal: 200000,
      interestRate: 5,
      termYears: 30
    };

    const results = calculateLoanResults(inputs);

    expect(results.monthlyPaymentPI).toBeCloseTo(1073.64, 2);
    expect(results.monthlyPaymentTotal).toBeCloseTo(1073.64, 2); // No additional costs
    expect(results.totalInterest).toBeCloseTo(186511.57, 2);
    expect(results.totalCost).toBeCloseTo(386511.57, 2);
    expect(results.amortizationSchedule).toHaveLength(360);
  });

  it('includes additional costs in total monthly payment', () => {
    const inputs: LoanInputs = {
      principal: 200000,
      interestRate: 5,
      termYears: 30,
      propertyTax: 3600,      // $3,600/year = $300/month
      insurance: 1200,        // $1,200/year = $100/month
      hoaFees: 50,
      pmi: 100
    };

    const results = calculateLoanResults(inputs);

    expect(results.monthlyPaymentPI).toBeCloseTo(1073.64, 2);
    // Total = 1073.64 + 300 + 100 + 50 + 100 = 1623.64
    expect(results.monthlyPaymentTotal).toBeCloseTo(1623.64, 2);
  });

  it('calculates total cost including all additional costs', () => {
    const inputs: LoanInputs = {
      principal: 100000,
      interestRate: 4,
      termYears: 15,
      propertyTax: 2400,
      insurance: 1200,
      hoaFees: 100,
      pmi: 50
    };

    const results = calculateLoanResults(inputs);

    // Total monthly × 180 months
    const expectedTotalCost = results.monthlyPaymentTotal * 180;
    expect(results.totalCost).toBeCloseTo(expectedTotalCost, 2);
  });

  it('handles missing optional fields (undefined)', () => {
    const inputs: LoanInputs = {
      principal: 150000,
      interestRate: 3.5,
      termYears: 20
      // No additional costs
    };

    const results = calculateLoanResults(inputs);

    expect(results.monthlyPaymentTotal).toBe(results.monthlyPaymentPI);
    expect(Number.isFinite(results.totalCost)).toBe(true);
  });

  it('matches total interest to sum of amortization schedule interest', () => {
    const inputs: LoanInputs = {
      principal: 250000,
      interestRate: 6,
      termYears: 30
    };

    const results = calculateLoanResults(inputs);
    const scheduleInterestSum = results.amortizationSchedule.reduce(
      (sum, entry) => sum + entry.interestPaid,
      0
    );

    expect(results.totalInterest).toBeCloseTo(scheduleInterestSum, 2);
  });
});

describe('Edge Cases', () => {
  it('handles very small principal amount ($1,000)', () => {
    const inputs: LoanInputs = {
      principal: 1000,
      interestRate: 5,
      termYears: 5
    };

    const results = calculateLoanResults(inputs);
    expect(results.monthlyPaymentPI).toBeGreaterThan(0);
    expect(results.amortizationSchedule[0].remainingBalance).toBeLessThan(1000);
  });

  it('handles very large principal amount ($10M)', () => {
    const inputs: LoanInputs = {
      principal: 10_000_000,
      interestRate: 5,
      termYears: 30
    };

    const results = calculateLoanResults(inputs);
    expect(results.monthlyPaymentPI).toBeGreaterThan(0);
    expect(Number.isFinite(results.totalCost)).toBe(true);
  });

  it('handles minimum interest rate (0.01%)', () => {
    const inputs: LoanInputs = {
      principal: 100000,
      interestRate: 0.01,
      termYears: 10
    };

    const results = calculateLoanResults(inputs);
    expect(results.totalInterest).toBeGreaterThan(0);
    expect(results.totalInterest).toBeLessThan(100); // Very low interest
  });

  it('handles maximum loan term (50 years)', () => {
    const inputs: LoanInputs = {
      principal: 500000,
      interestRate: 5,
      termYears: 50
    };

    const results = calculateLoanResults(inputs);
    expect(results.amortizationSchedule).toHaveLength(600);
    expect(results.amortizationSchedule[599].remainingBalance).toBeCloseTo(0, 2);
  });

  it('maintains precision for 50-year amortization', () => {
    const inputs: LoanInputs = {
      principal: 1000000,
      interestRate: 10,
      termYears: 50
    };

    const results = calculateLoanResults(inputs);
    const totalPrincipal = results.amortizationSchedule.reduce(
      (sum, entry) => sum + entry.principalPaid,
      0
    );

    // Total principal paid should equal original principal
    expect(totalPrincipal).toBeCloseTo(1000000, 0); // Within $1
  });
});
