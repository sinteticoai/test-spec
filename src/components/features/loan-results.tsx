import { LoanResults as LoanResultsType } from '@/types/loan';
import { formatCurrency } from '@/lib/mortgage-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface LoanResultsProps {
  loanNumber: 1 | 2;
  results: LoanResultsType | null;
}

export function LoanResults({ loanNumber, results }: LoanResultsProps) {
  const [showClosingCosts, setShowClosingCosts] = useState(false);
  const [showPMIDetails, setShowPMIDetails] = useState(false);
  const [showARMProjections, setShowARMProjections] = useState(false);

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

  const hasClosingCosts = results.totalClosingCosts !== undefined && results.totalClosingCosts > 0;
  const hasPMI = results.monthlyPMI !== undefined && results.monthlyPMI > 0;
  const hasARMProjections = results.armProjections && results.armProjections.length > 0;

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

          {hasPMI && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-yellow-700">PMI:</span>
              <span className="text-lg font-bold text-yellow-700">{formatCurrency(results.monthlyPMI!)}</span>
            </div>
          )}

          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Monthly Payment:</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(results.monthlyPaymentTotal)}</span>
          </div>
        </div>

        <Separator />

        {/* Closing Costs Summary */}
        {hasClosingCosts && (
          <>
            <Collapsible open={showClosingCosts} onOpenChange={setShowClosingCosts}>
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-gray-50 p-2 rounded">
                <span className="text-sm font-medium">Closing Costs:</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{formatCurrency(results.totalClosingCosts!)}</span>
                  {showClosingCosts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2 pl-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gross Closing Costs:</span>
                  <span>{formatCurrency(results.totalClosingCosts!)}</span>
                </div>
                {results.netClosingCosts !== undefined && results.netClosingCosts !== results.totalClosingCosts && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">After Credits:</span>
                    <span className="font-medium">{formatCurrency(results.netClosingCosts)}</span>
                  </div>
                )}
                {results.cashNeededAtClosing !== undefined && (
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="font-medium">Cash Needed at Closing:</span>
                    <span className="font-bold">{formatCurrency(results.cashNeededAtClosing)}</span>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
            <Separator />
          </>
        )}

        {/* PMI Details */}
        {hasPMI && (
          <>
            <Collapsible open={showPMIDetails} onOpenChange={setShowPMIDetails}>
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-gray-50 p-2 rounded">
                <span className="text-sm font-medium text-yellow-700">PMI Information</span>
                {showPMIDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2 pl-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly PMI:</span>
                  <span className="text-yellow-700 font-medium">{formatCurrency(results.monthlyPMI!)}</span>
                </div>
                {results.pmiRemovalMonth && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Removal Month:</span>
                      <span>Month {results.pmiRemovalMonth}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Years Until Removal:</span>
                      <span>{(results.pmiRemovalMonth / 12).toFixed(1)} years</span>
                    </div>
                  </>
                )}
                <p className="text-xs text-muted-foreground pt-2">
                  PMI automatically terminates at 78% LTV. You can request removal at 80% LTV.
                </p>
              </CollapsibleContent>
            </Collapsible>
            <Separator />
          </>
        )}

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

        {/* ARM Projections */}
        {hasARMProjections && (
          <>
            <Separator />
            <Collapsible open={showARMProjections} onOpenChange={setShowARMProjections}>
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-orange-50 p-2 rounded">
                <span className="text-sm font-medium text-orange-700">ARM Rate Projections (Worst Case)</span>
                {showARMProjections ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="text-xs text-orange-700 bg-orange-50 p-2 rounded mb-2">
                  ⚠️ Showing maximum rate increases based on caps
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Year</th>
                      <th className="text-right py-2">Rate</th>
                      <th className="text-right py-2">Monthly Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.armProjections!.map((projection) => (
                      <tr key={projection.year} className="border-b">
                        <td className="py-2">{projection.year}</td>
                        <td className="text-right">{projection.rate.toFixed(3)}%</td>
                        <td className="text-right font-medium">{formatCurrency(projection.monthlyPayment)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {results.worstCaseMaxPayment && (
                  <div className="flex justify-between items-center mt-3 p-2 bg-orange-50 rounded">
                    <span className="text-sm font-medium text-orange-700">Maximum Possible Payment:</span>
                    <span className="text-lg font-bold text-orange-700">{formatCurrency(results.worstCaseMaxPayment)}</span>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </>
        )}
      </CardContent>
    </Card>
  );
}
