'use client';

import { FormattedInput } from '@/components/ui/formatted-input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { ExtraPayments, LumpSumPayment } from '@/types/loan';

interface ExtraPaymentsSectionProps {
  extraPayments: ExtraPayments;
  onExtraMonthlyChange: (value: number | undefined) => void;
  onExtraAnnualChange: (value: number | undefined) => void;
  onExtraAnnualMonthChange: (value: number | undefined) => void;
  onLumpSumsChange: (lumpSums: LumpSumPayment[]) => void;
}

export function ExtraPaymentsSection({
  extraPayments,
  onExtraMonthlyChange,
  onExtraAnnualChange,
  onExtraAnnualMonthChange,
  onLumpSumsChange
}: ExtraPaymentsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLumpSums, setShowLumpSums] = useState(false);

  const addLumpSum = () => {
    const currentLumpSums = extraPayments.lumpSums || [];
    onLumpSumsChange([
      ...currentLumpSums,
      { paymentMonth: 1, amount: 0 }
    ]);
    setShowLumpSums(true);
  };

  const updateLumpSum = (index: number, field: 'paymentMonth' | 'amount', value: number | undefined) => {
    const currentLumpSums = extraPayments.lumpSums || [];
    const updated = [...currentLumpSums];
    if (value !== undefined) {
      updated[index] = { ...updated[index], [field]: value };
      onLumpSumsChange(updated);
    }
  };

  const removeLumpSum = (index: number) => {
    const currentLumpSums = extraPayments.lumpSums || [];
    const updated = currentLumpSums.filter((_, i) => i !== index);
    onLumpSumsChange(updated);
    if (updated.length === 0) {
      setShowLumpSums(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-md hover:bg-gray-100">
        <span className="font-medium">Extra Payments (Optional)</span>
        <span className="text-sm text-gray-500">{isOpen ? '▼' : '▶'}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="extra-monthly">Extra Monthly Payment</Label>
            <FormattedInput
              id="extra-monthly"
              formatType="currency"
              value={extraPayments.extraMonthly}
              onChange={onExtraMonthlyChange}
              placeholder="$100"
            />
            <p className="text-xs text-gray-500">Added to every monthly payment</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra-annual">Extra Annual Payment</Label>
            <FormattedInput
              id="extra-annual"
              formatType="currency"
              value={extraPayments.extraAnnual}
              onChange={onExtraAnnualChange}
              placeholder="$1,000"
            />
            <p className="text-xs text-gray-500">Paid once per year</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra-annual-month">Annual Payment Month</Label>
            <FormattedInput
              id="extra-annual-month"
              formatType="number"
              value={extraPayments.extraAnnualMonth}
              onChange={onExtraAnnualMonthChange}
              placeholder="12"
            />
            <p className="text-xs text-gray-500">1-12 (e.g., 12 = December)</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <Label>One-Time Lump Sum Payments</Label>
            <button
              type="button"
              onClick={addLumpSum}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + Add Lump Sum
            </button>
          </div>

          {showLumpSums && extraPayments.lumpSums && extraPayments.lumpSums.length > 0 && (
            <div className="space-y-3">
              {extraPayments.lumpSums.map((lumpSum, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`lump-month-${index}`}>Payment Month</Label>
                    <FormattedInput
                      id={`lump-month-${index}`}
                      formatType="number"
                      value={lumpSum.paymentMonth}
                      onChange={(v) => updateLumpSum(index, 'paymentMonth', v)}
                      placeholder="1"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`lump-amount-${index}`}>Amount</Label>
                    <FormattedInput
                      id={`lump-amount-${index}`}
                      formatType="currency"
                      value={lumpSum.amount}
                      onChange={(v) => updateLumpSum(index, 'amount', v)}
                      placeholder="$5,000"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLumpSum(index)}
                    className="h-10 px-3 text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-500 mt-3">
            Extra payments reduce principal and save on interest over the life of the loan.
          </p>
        </div>

        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
          <p className="font-medium mb-1">Impact of Extra Payments:</p>
          <p>• Reduces total interest paid</p>
          <p>• Shortens loan term</p>
          <p>• Builds equity faster</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
