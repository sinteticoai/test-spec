'use client';

import { useState } from 'react';
import { LoanInputs, LoanResults as LoanResultsType } from '@/types/loan';
import { calculateLoanResults, isLoanComplete } from '@/lib/mortgage-calculator';
import { LoanInputForm } from './loan-input-form';
import { LoanResults } from './loan-results';
import { AmortizationSchedule } from './amortization-schedule';

export function LoanComparison() {
  const [loan1, setLoan1] = useState<Partial<LoanInputs>>({});
  const [loan2, setLoan2] = useState<Partial<LoanInputs>>({});
  const [results1, setResults1] = useState<LoanResultsType | null>(null);
  const [results2, setResults2] = useState<LoanResultsType | null>(null);

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
