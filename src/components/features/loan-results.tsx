import { LoanResults as LoanResultsType } from '@/types/loan';
import { formatCurrency } from '@/lib/mortgage-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface LoanResultsProps {
  loanNumber: 1 | 2;
  results: LoanResultsType | null;
}

export function LoanResults({ loanNumber, results }: LoanResultsProps) {
  if (!results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loan {loanNumber} Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Enter loan details to see results</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan {loanNumber} Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Monthly Payments */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Principal & Interest:</span>
            <span className="text-lg font-bold">{formatCurrency(results.monthlyPaymentPI)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Monthly Payment:</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(results.monthlyPaymentTotal)}</span>
          </div>
        </div>

        <Separator />

        {/* Total Interest */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total Interest:</span>
          <span className="text-lg">{formatCurrency(results.totalInterest)}</span>
        </div>

        {/* Total Cost */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total Cost:</span>
          <span className="text-lg">{formatCurrency(results.totalCost)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
