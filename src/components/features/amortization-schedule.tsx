'use client';

import { useState } from 'react';
import { AmortizationEntry } from '@/types/loan';
import { formatCurrency } from '@/lib/mortgage-calculator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AmortizationScheduleProps {
  schedule: AmortizationEntry[];
}

export function AmortizationSchedule({ schedule }: AmortizationScheduleProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!schedule || schedule.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full flex justify-between items-center">
          <span>View Amortization Schedule ({schedule.length} payments)</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4">
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-right">Principal Paid</th>
                  <th className="px-4 py-2 text-right">Interest Paid</th>
                  <th className="px-4 py-2 text-right">Remaining Balance</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((entry) => (
                  <tr key={entry.paymentNumber} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-2">{entry.paymentNumber}</td>
                    <td className="px-4 py-2">
                      {entry.paymentDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short'
                      })}
                    </td>
                    <td className="px-4 py-2 text-right">{formatCurrency(entry.principalPaid)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(entry.interestPaid)}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(entry.remainingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
