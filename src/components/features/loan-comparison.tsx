'use client';

import { useState, useMemo, useCallback } from 'react';
import { LoanInputs, LoanResults as LoanResultsType } from '@/types/loan';
import { TaxProfile } from '@/types/tax';
import { calculateLoanResults, isLoanComplete } from '@/lib/mortgage-calculator';
import { calculateTaxBenefits } from '@/lib/tax-calculator';
import { LoanInputForm } from './loan-input-form';
import { LoanResults } from './loan-results';
import { AmortizationSchedule } from './amortization-schedule';
import TaxBenefitsDisplay from './tax-benefits';
import { FormattedInput } from '@/components/ui/formatted-input';

export function LoanComparison() {
  const [loan1, setLoan1] = useState<Partial<LoanInputs>>({});
  const [loan2, setLoan2] = useState<Partial<LoanInputs>>({});
  const [results1, setResults1] = useState<LoanResultsType | null>(null);
  const [results2, setResults2] = useState<LoanResultsType | null>(null);

  // Tax profile state (shared between loans)
  const [taxProfile, setTaxProfile] = useState<TaxProfile>({
    annualIncome: 0,
    filingStatus: 'married_joint',
    propertyTaxAnnual: 0
  });

  // Memoize the setTaxProfile callback to prevent re-renders
  const handleTaxProfileChange = useCallback((profile: TaxProfile) => {
    setTaxProfile(profile);
  }, []);

  // Store temporary values while typing (don't trigger calculations yet)
  const [tempTaxProfile, setTempTaxProfile] = useState<TaxProfile>(taxProfile);

  // Individual callbacks for each tax field - only update temp state while typing
  const handleAnnualIncomeChange = useCallback((value: number | undefined) => {
    setTempTaxProfile(prev => ({...prev, annualIncome: value || 0}));
  }, []);

  const handleFilingStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProfile = {...tempTaxProfile, filingStatus: e.target.value as TaxProfile['filingStatus']};
    setTempTaxProfile(newProfile);
    setTaxProfile(newProfile); // Update immediately for select
  }, [tempTaxProfile]);

  const handlePropertyTaxChange = useCallback((value: number | undefined) => {
    setTempTaxProfile(prev => ({...prev, propertyTaxAnnual: value || 0}));
  }, []);

  // Commit temp values to actual profile on blur
  const handleTaxFieldBlur = useCallback(() => {
    setTaxProfile(tempTaxProfile);
  }, [tempTaxProfile]);

  const handleLoan1Change = (inputs: Partial<LoanInputs>) => {
    setLoan1(inputs);
  };

  const handleLoan2Change = (inputs: Partial<LoanInputs>) => {
    setLoan2(inputs);
  };

  const calculateLoan1 = () => {
    if (isLoanComplete(loan1)) {
      try {
        const results = calculateLoanResults(loan1);
        setResults1(results);
      } catch (error) {
        console.error('Error calculating loan 1:', error);
        setResults1(null);
      }
    } else {
      setResults1(null);
    }
  };

  const calculateLoan2 = () => {
    if (isLoanComplete(loan2)) {
      try {
        const results = calculateLoanResults(loan2);
        setResults2(results);
      } catch (error) {
        console.error('Error calculating loan 2:', error);
        setResults2(null);
      }
    } else {
      setResults2(null);
    }
  };

  // Calculate tax benefits when loan results and tax profile are available
  const taxBenefits1 = useMemo(() => {
    if (results1 && isLoanComplete(loan1)) {
      // Only calculate if income is provided, otherwise return a placeholder
      if (taxProfile.annualIncome > 0) {
        return calculateTaxBenefits(loan1 as LoanInputs, taxProfile);
      }
      // Return null but we'll still show the form
      return null;
    }
    return null;
  }, [results1, taxProfile, loan1]);

  const taxBenefits2 = useMemo(() => {
    if (results2 && isLoanComplete(loan2)) {
      // Only calculate if income is provided, otherwise return a placeholder
      if (taxProfile.annualIncome > 0) {
        return calculateTaxBenefits(loan2 as LoanInputs, taxProfile);
      }
      // Return null but we'll still show the form
      return null;
    }
    return null;
  }, [results2, taxProfile, loan2]);

  // Show tax benefits section if we have loan results
  const showTaxBenefits1 = results1 !== null;
  const showTaxBenefits2 = results2 !== null;

  return (
    <div className="space-y-8">
      {/* Input Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LoanInputForm
          loanNumber={1}
          inputs={loan1}
          onInputsChange={handleLoan1Change}
          onCalculate={calculateLoan1}
        />
        <LoanInputForm
          loanNumber={2}
          inputs={loan2}
          onInputsChange={handleLoan2Change}
          onCalculate={calculateLoan2}
        />
      </div>

      {/* Results */}
      {(results1 || results2) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoanResults loanNumber={1} results={results1} />
          <LoanResults loanNumber={2} results={results2} />
        </div>
      )}

      {/* Tax Benefits Display */}
      {(showTaxBenefits1 || showTaxBenefits2) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {showTaxBenefits1 && (
            <TaxBenefitsDisplay
              calculation={taxBenefits1}
              taxProfile={tempTaxProfile}
              onTaxProfileChange={handleTaxProfileChange}
              onAnnualIncomeChange={handleAnnualIncomeChange}
              onPropertyTaxChange={handlePropertyTaxChange}
              onFilingStatusChange={handleFilingStatusChange}
              onFieldBlur={handleTaxFieldBlur}
            />
          )}
          {showTaxBenefits2 && (
            <TaxBenefitsDisplay
              calculation={taxBenefits2}
              taxProfile={tempTaxProfile}
              onTaxProfileChange={handleTaxProfileChange}
              onAnnualIncomeChange={handleAnnualIncomeChange}
              onPropertyTaxChange={handlePropertyTaxChange}
              onFilingStatusChange={handleFilingStatusChange}
              onFieldBlur={handleTaxFieldBlur}
            />
          )}
        </div>
      )}

      {/* Amortization Schedules */}
      {(results1 || results2) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results1 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Loan 1 Amortization</h3>
              <AmortizationSchedule schedule={results1.amortizationSchedule} />
            </div>
          )}
          {results2 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Loan 2 Amortization</h3>
              <AmortizationSchedule schedule={results2.amortizationSchedule} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
