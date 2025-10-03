export interface LoanInputs {
  principal: number;
  interestRate: number;
  termYears: number;
  propertyTax?: number;
  insurance?: number;
  hoaFees?: number;
  pmi?: number;
}

export interface AmortizationEntry {
  paymentNumber: number;
  paymentDate: Date;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export interface LoanResults {
  monthlyPaymentPI: number;
  monthlyPaymentTotal: number;
  totalInterest: number;
  totalCost: number;
  amortizationSchedule: AmortizationEntry[];
}
