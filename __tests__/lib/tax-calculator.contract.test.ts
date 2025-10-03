/**
 * Contract Tests for Tax Calculator Functions
 *
 * These tests define the expected behavior of tax calculation functions.
 * They should FAIL initially (no implementation yet) and PASS after implementation.
 *
 * Run with: npm test -- tax-calculator.contract
 */

import { describe, it, expect } from '@jest/globals';
import {
  calculateMarginalTaxRate,
  calculateFirstYearInterest,
  calculateTaxBenefits,
  getStandardDeduction
} from '@/lib/tax-calculator';
import { FilingStatus, TaxProfile } from '@/types/tax';
import { LoanInputs } from '@/lib/validations';

describe('Tax Calculator Contracts', () => {
  describe('calculateMarginalTaxRate', () => {
    it('should return correct rate for single filer in 22% bracket', () => {
      const rate = calculateMarginalTaxRate(75000, 'single');
      expect(rate).toBe(0.22);
    });

    it('should return correct rate for MFJ in 12% bracket', () => {
      const rate = calculateMarginalTaxRate(50000, 'married_joint');
      expect(rate).toBe(0.12);
    });

    it('should return correct rate for head of household in 24% bracket', () => {
      const rate = calculateMarginalTaxRate(150000, 'head_of_household');
      expect(rate).toBe(0.24);
    });

    it('should return 10% rate for income at bracket minimum', () => {
      const rate = calculateMarginalTaxRate(0, 'single');
      expect(rate).toBe(0.10);
    });

    it('should return 37% rate for very high income', () => {
      const rate = calculateMarginalTaxRate(1000000, 'single');
      expect(rate).toBe(0.37);
    });

    it('should handle bracket boundaries correctly (single $47,150 -> 12%)', () => {
      const rate = calculateMarginalTaxRate(47150, 'single');
      expect(rate).toBe(0.12);
    });

    it('should handle bracket boundaries correctly (single $47,151 -> 22%)', () => {
      const rate = calculateMarginalTaxRate(47151, 'single');
      expect(rate).toBe(0.22);
    });
  });

  describe('getStandardDeduction', () => {
    it('should return $15,000 for single filer', () => {
      expect(getStandardDeduction('single')).toBe(15000);
    });

    it('should return $30,000 for married filing jointly', () => {
      expect(getStandardDeduction('married_joint')).toBe(30000);
    });

    it('should return $15,000 for married filing separately', () => {
      expect(getStandardDeduction('married_separate')).toBe(15000);
    });

    it('should return $22,500 for head of household', () => {
      expect(getStandardDeduction('head_of_household')).toBe(22500);
    });
  });

  describe('calculateFirstYearInterest', () => {
    it('should calculate first year interest for 30-year mortgage', () => {
      const loanInputs: LoanInputs = {
        principal: 400000,
        interestRate: 6.5,
        termYears: 30
      };
      const interest = calculateFirstYearInterest(loanInputs);
      // First year interest should be ~$26,000 (approximate)
      expect(interest).toBeGreaterThan(25000);
      expect(interest).toBeLessThan(27000);
    });

    it('should calculate first year interest for 15-year mortgage', () => {
      const loanInputs: LoanInputs = {
        principal: 300000,
        interestRate: 5.5,
        termYears: 15
      };
      const interest = calculateFirstYearInterest(loanInputs);
      // First year interest should be ~$16,500 (approximate)
      expect(interest).toBeGreaterThan(16000);
      expect(interest).toBeLessThan(17000);
    });

    it('should return 0 for zero interest rate', () => {
      const loanInputs: LoanInputs = {
        principal: 300000,
        interestRate: 0,
        termYears: 30
      };
      const interest = calculateFirstYearInterest(loanInputs);
      expect(interest).toBe(0);
    });
  });

  describe('calculateTaxBenefits', () => {
    const standardLoanInputs: LoanInputs = {
      principal: 400000,
      interestRate: 6.5,
      termYears: 30,
      propertyTax: 12000,
      insurance: 1200,
      hoaFees: 0,
      pmi: 0
    };

    const standardTaxProfile: TaxProfile = {
      annualIncome: 120000,
      filingStatus: 'married_joint',
      propertyTaxAnnual: 12000
    };

    it('should recommend itemized deduction when beneficial', () => {
      const result = calculateTaxBenefits(standardLoanInputs, standardTaxProfile);
      expect(result.recommendedMethod).toBe('itemized');
      expect(result.itemizationBeneficial).toBe(true);
      expect(result.additionalItemizedBenefit).toBeGreaterThan(0);
    });

    it('should calculate correct marginal tax rate', () => {
      const result = calculateTaxBenefits(standardLoanInputs, standardTaxProfile);
      expect(result.marginalTaxRate).toBe(0.22); // $120K MFJ is in 22% bracket
    });

    it('should apply SALT cap to property tax deduction', () => {
      const result = calculateTaxBenefits(standardLoanInputs, standardTaxProfile);
      expect(result.propertyTaxDeduction).toBe(10000); // Capped at $10K
      expect(result.exceedsSALTCap).toBe(true);
    });

    it('should not exceed SALT cap when property tax is under $10K', () => {
      const lowPropertyTax: TaxProfile = {
        ...standardTaxProfile,
        propertyTaxAnnual: 8000
      };
      const result = calculateTaxBenefits(standardLoanInputs, lowPropertyTax);
      expect(result.propertyTaxDeduction).toBe(8000);
      expect(result.exceedsSALTCap).toBe(false);
    });

    it('should flag when loan exceeds $750K qualified debt limit', () => {
      const highLoan: LoanInputs = {
        ...standardLoanInputs,
        principal: 800000
      };
      const result = calculateTaxBenefits(highLoan, standardTaxProfile);
      expect(result.exceeds750kLimit).toBe(true);
      expect(result.loanAmount).toBe(800000);
    });

    it('should calculate monthly tax savings correctly', () => {
      const result = calculateTaxBenefits(standardLoanInputs, standardTaxProfile);
      expect(result.monthlyTaxSavings).toBe(result.annualTaxSavings / 12);
      expect(result.monthlyTaxSavings).toBeGreaterThan(0);
    });

    it('should calculate effective monthly payment', () => {
      const result = calculateTaxBenefits(standardLoanInputs, standardTaxProfile);
      expect(result.effectiveMonthlyPayment).toBe(
        result.originalMonthlyPayment - result.monthlyTaxSavings
      );
      expect(result.effectiveMonthlyPayment).toBeLessThan(result.originalMonthlyPayment);
    });

    it('should recommend standard deduction when itemizing is not beneficial', () => {
      const lowInterestLoan: LoanInputs = {
        principal: 100000,
        interestRate: 3.0,
        termYears: 30
      };
      const lowPropertyTax: TaxProfile = {
        annualIncome: 80000,
        filingStatus: 'married_joint',
        propertyTaxAnnual: 3000
      };
      const result = calculateTaxBenefits(lowInterestLoan, lowPropertyTax);
      expect(result.recommendedMethod).toBe('standard');
      expect(result.itemizationBeneficial).toBe(false);
      expect(result.additionalItemizedBenefit).toBe(0);
      expect(result.annualTaxSavings).toBe(0);
    });

    it('should use correct standard deduction for filing status', () => {
      const singleFiler: TaxProfile = {
        annualIncome: 80000,
        filingStatus: 'single',
        propertyTaxAnnual: 8000
      };
      const result = calculateTaxBenefits(standardLoanInputs, singleFiler);
      expect(result.standardDeduction).toBe(15000); // Single filer 2025
    });

    it('should calculate total itemized deductions correctly', () => {
      const result = calculateTaxBenefits(standardLoanInputs, standardTaxProfile);
      expect(result.totalItemizedDeductions).toBe(
        result.mortgageInterestDeduction + result.propertyTaxDeduction
      );
    });

    it('should set additional benefit to zero when standard deduction is better', () => {
      const minimalDeductions: TaxProfile = {
        annualIncome: 60000,
        filingStatus: 'married_joint',
        propertyTaxAnnual: 2000
      };
      const smallLoan: LoanInputs = {
        principal: 50000,
        interestRate: 4.0,
        termYears: 15
      };
      const result = calculateTaxBenefits(smallLoan, minimalDeductions);

      if (result.recommendedMethod === 'standard') {
        expect(result.additionalItemizedBenefit).toBe(0);
        expect(result.annualTaxSavings).toBe(0);
        expect(result.monthlyTaxSavings).toBe(0);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle $750K loan exactly (at limit)', () => {
      const loanInputs: LoanInputs = {
        principal: 750000,
        interestRate: 6.0,
        termYears: 30
      };
      const taxProfile: TaxProfile = {
        annualIncome: 200000,
        filingStatus: 'married_joint',
        propertyTaxAnnual: 10000
      };
      const result = calculateTaxBenefits(loanInputs, taxProfile);
      expect(result.exceeds750kLimit).toBe(false);
    });

    it('should handle $10K property tax exactly (at SALT cap)', () => {
      const loanInputs: LoanInputs = {
        principal: 400000,
        interestRate: 6.0,
        termYears: 30
      };
      const taxProfile: TaxProfile = {
        annualIncome: 120000,
        filingStatus: 'married_joint',
        propertyTaxAnnual: 10000
      };
      const result = calculateTaxBenefits(loanInputs, taxProfile);
      expect(result.propertyTaxDeduction).toBe(10000);
      expect(result.exceedsSALTCap).toBe(false);
    });

    it('should handle zero property tax', () => {
      const loanInputs: LoanInputs = {
        principal: 300000,
        interestRate: 5.5,
        termYears: 30
      };
      const taxProfile: TaxProfile = {
        annualIncome: 100000,
        filingStatus: 'single',
        propertyTaxAnnual: 0
      };
      const result = calculateTaxBenefits(loanInputs, taxProfile);
      expect(result.propertyTaxDeduction).toBe(0);
      expect(result.exceedsSALTCap).toBe(false);
    });

    it('should handle all four filing statuses', () => {
      const loanInputs: LoanInputs = {
        principal: 350000,
        interestRate: 6.0,
        termYears: 30
      };

      const statuses: FilingStatus[] = ['single', 'married_joint', 'married_separate', 'head_of_household'];

      statuses.forEach(status => {
        const taxProfile: TaxProfile = {
          annualIncome: 100000,
          filingStatus: status,
          propertyTaxAnnual: 8000
        };
        const result = calculateTaxBenefits(loanInputs, taxProfile);
        expect(result.standardDeduction).toBeGreaterThan(0);
      });
    });
  });
});
