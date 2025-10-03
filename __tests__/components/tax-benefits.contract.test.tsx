/**
 * Contract Tests for TaxBenefitsDisplay Component
 *
 * These tests define the expected UI behavior and prop handling.
 * They should FAIL initially and PASS after component implementation.
 *
 * Run with: npm test -- tax-benefits-component.contract
 */

import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaxBenefitsDisplay from '@/components/features/tax-benefits';
import { TaxBenefitCalculation, TaxProfile } from '@/types/tax';

describe('TaxBenefitsDisplay Component Contracts', () => {
  const mockTaxProfile: TaxProfile = {
    annualIncome: 120000,
    filingStatus: 'married_joint',
    propertyTaxAnnual: 12000
  };

  const mockCalculation: TaxBenefitCalculation = {
    loanAmount: 400000,
    firstYearInterest: 26000,
    mortgageInterestDeduction: 26000,
    propertyTaxDeduction: 10000,
    totalItemizedDeductions: 36000,
    standardDeduction: 30000,
    recommendedMethod: 'itemized',
    additionalItemizedBenefit: 6000,
    marginalTaxRate: 0.22,
    annualTaxSavings: 1320,
    monthlyTaxSavings: 110,
    originalMonthlyPayment: 2530,
    effectiveMonthlyPayment: 2420,
    exceeds750kLimit: false,
    exceedsSALTCap: true,
    itemizationBeneficial: true
  };

  describe('Rendering', () => {
    it('should render the tax benefits section', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={mockCalculation}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      expect(screen.getByText(/tax benefits/i)).toBeInTheDocument();
    });

    it('should display annual income input field', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={mockCalculation}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      const incomeInput = screen.getByLabelText(/annual income/i);
      expect(incomeInput).toBeInTheDocument();
      expect(incomeInput).toHaveValue(120000);
    });

    it('should display filing status selector', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={mockCalculation}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      const filingStatusSelect = screen.getByLabelText(/filing status/i);
      expect(filingStatusSelect).toBeInTheDocument();
    });

    it('should display property tax input field', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={mockCalculation}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      const propertyTaxInput = screen.getByLabelText(/property tax/i);
      expect(propertyTaxInput).toBeInTheDocument();
      expect(propertyTaxInput).toHaveValue(12000);
    });
  });

  describe('Calculation Display', () => {
    it('should display marginal tax rate', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={mockCalculation}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      expect(screen.getByText(/22%/)).toBeInTheDocument();
    });

    it('should display mortgage interest deduction', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={mockCalculation}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      expect(screen.getByText(/\$26,000/)).toBeInTheDocument(); // First year interest
    });

    it('should display property tax deduction with SALT cap indicator', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={mockCalculation}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      expect(screen.getByText(/\$10,000/)).toBeInTheDocument(); // SALT capped
      expect(screen.getByText(/capped/i)).toBeInTheDocument();
    });

    it('should display recommended deduction method', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={mockCalculation}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      expect(screen.getByText('Itemized (Recommended)')).toBeInTheDocument();
    });

    it('should display annual tax savings', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={mockCalculation}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      expect(screen.getByText(/\$1,320/)).toBeInTheDocument();
    });

    it('should display monthly tax savings', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={mockCalculation}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      expect(screen.getByText(/\$110/)).toBeInTheDocument();
    });

    it('should display effective monthly payment', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={mockCalculation}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      expect(screen.getByText(/\$2,420/)).toBeInTheDocument();
    });

    it('should display disclaimer text', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={mockCalculation}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      expect(screen.getByText(/estimates/i)).toBeInTheDocument();
      expect(screen.getByText(/tax professional/i)).toBeInTheDocument();
    });
  });

  describe('Standard Deduction Scenario', () => {
    const standardDeductionCalc: TaxBenefitCalculation = {
      ...mockCalculation,
      recommendedMethod: 'standard',
      itemizationBeneficial: false,
      additionalItemizedBenefit: 0,
      annualTaxSavings: 0,
      monthlyTaxSavings: 0,
      effectiveMonthlyPayment: mockCalculation.originalMonthlyPayment
    };

    it('should display standard deduction as recommended', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={standardDeductionCalc}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      expect(screen.getByText('Standard (Recommended)')).toBeInTheDocument();
    });

    it('should show zero additional benefit from itemizing', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={standardDeductionCalc}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      expect(screen.getByText('$0')).toBeInTheDocument();
      expect(screen.getByText(/no additional benefit/i)).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onTaxProfileChange when income is updated', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={mockCalculation}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      const incomeInput = screen.getByLabelText(/annual income/i);
      fireEvent.change(incomeInput, { target: { value: '150000' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockTaxProfile,
        annualIncome: 150000
      });
    });

    it('should call onTaxProfileChange when filing status is changed', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={mockCalculation}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      const filingStatusSelect = screen.getByLabelText(/filing status/i);
      fireEvent.change(filingStatusSelect, { target: { value: 'single' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockTaxProfile,
        filingStatus: 'single'
      });
    });

    it('should call onTaxProfileChange when property tax is updated', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={mockCalculation}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      const propertyTaxInput = screen.getByLabelText(/property tax/i);
      fireEvent.change(propertyTaxInput, { target: { value: '8000' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockTaxProfile,
        propertyTaxAnnual: 8000
      });
    });
  });

  describe('Warning Indicators', () => {
    it('should display warning when loan exceeds $750K limit', () => {
      const highLoanCalc: TaxBenefitCalculation = {
        ...mockCalculation,
        loanAmount: 800000,
        exceeds750kLimit: true
      };
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={highLoanCalc}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      expect(screen.getByText(/750,000/i)).toBeInTheDocument();
      expect(screen.getByText(/limit/i)).toBeInTheDocument();
    });

    it('should display info when SALT cap is applied', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={mockCalculation}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      expect(mockCalculation.exceedsSALTCap).toBe(true);
      expect(screen.getByText(/capped/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      const mockOnChange = jest.fn();
      render(
        <TaxBenefitsDisplay
          calculation={mockCalculation}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText(/annual income/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filing status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/property tax/i)).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      const mockOnChange = jest.fn();
      const { container } = render(
        <TaxBenefitsDisplay
          calculation={mockCalculation}
          taxProfile={mockTaxProfile}
          onTaxProfileChange={mockOnChange}
        />
      );

      // Should use semantic section or article tags
      expect(container.querySelector('section') || container.querySelector('article')).toBeInTheDocument();
    });
  });
});
