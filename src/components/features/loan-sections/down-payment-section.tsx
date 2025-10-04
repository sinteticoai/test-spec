'use client';

import { FormattedInput } from '@/components/ui/formatted-input';
import { Label } from '@/components/ui/label';
import { syncDownPayment } from '@/lib/mortgage-calculator';

interface DownPaymentSectionProps {
  loanNumber?: number;
  propertyPrice?: number;
  downPaymentPercent?: number;
  downPaymentDollar?: number;
  onPropertyPriceChange: (value: number | undefined) => void;
  onDownPaymentPercentChange: (value: number | undefined) => void;
  onDownPaymentDollarChange: (value: number | undefined) => void;
  onLoanAmountCalculated: (loanAmount: number) => void;
}

export function DownPaymentSection({
  loanNumber = 1,
  propertyPrice,
  downPaymentPercent,
  downPaymentDollar,
  onPropertyPriceChange,
  onDownPaymentPercentChange,
  onDownPaymentDollarChange,
  onLoanAmountCalculated
}: DownPaymentSectionProps) {

  const handlePropertyPriceChange = (value: number | undefined) => {
    onPropertyPriceChange(value);
    // If we have a down payment percent, recalculate the dollar amount
    if (value && downPaymentPercent !== undefined) {
      const synced = syncDownPayment(value, downPaymentPercent, undefined);
      onDownPaymentDollarChange(synced.dollar);
      onLoanAmountCalculated(synced.loanAmount);
    }
  };

  const handlePercentChange = (value: number | undefined) => {
    onDownPaymentPercentChange(value);
  };

  const handlePercentBlur = () => {
    if (propertyPrice && downPaymentPercent !== undefined) {
      const synced = syncDownPayment(propertyPrice, downPaymentPercent, undefined);
      onDownPaymentDollarChange(synced.dollar);
      onLoanAmountCalculated(synced.loanAmount);
    }
  };

  return (
    <div className="space-y-4">
      {/* Property Price - Full Width */}
      <div className="space-y-2">
        <Label htmlFor={`property-price-${loanNumber}`}>Property Price</Label>
        <FormattedInput
          id={`property-price-${loanNumber}`}
          formatType="currency"
          value={propertyPrice}
          onChange={handlePropertyPriceChange}
          placeholder="$500,000"
        />
      </div>

      {/* Down Payment % - Full Width */}
      <div className="space-y-2">
        <Label htmlFor={`down-payment-percent-${loanNumber}`}>Down Payment (%)</Label>
        <FormattedInput
          id={`down-payment-percent-${loanNumber}`}
          formatType="percentage"
          value={downPaymentPercent}
          onChange={handlePercentChange}
          onBlur={handlePercentBlur}
          placeholder="20%"
        />
      </div>

      {/* Down Payment $ - Full Width, Read-only with gray background */}
      <div className="space-y-2">
        <Label htmlFor={`down-payment-dollar-${loanNumber}`}>Down Payment ($)</Label>
        <FormattedInput
          id={`down-payment-dollar-${loanNumber}`}
          formatType="currency"
          value={downPaymentDollar}
          onChange={() => {}} // Read-only calculated field
          placeholder="Calculated"
          readOnly
          className="bg-gray-100"
        />
      </div>
    </div>
  );
}
