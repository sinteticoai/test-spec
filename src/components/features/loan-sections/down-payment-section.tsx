'use client';

import { FormattedInput } from '@/components/ui/formatted-input';
import { Label } from '@/components/ui/label';
import { syncDownPayment } from '@/lib/mortgage-calculator';

interface DownPaymentSectionProps {
  propertyPrice?: number;
  downPaymentPercent?: number;
  downPaymentDollar?: number;
  onPropertyPriceChange: (value: number | undefined) => void;
  onDownPaymentPercentChange: (value: number | undefined) => void;
  onDownPaymentDollarChange: (value: number | undefined) => void;
  onLoanAmountCalculated: (loanAmount: number) => void;
}

export function DownPaymentSection({
  propertyPrice,
  downPaymentPercent,
  downPaymentDollar,
  onPropertyPriceChange,
  onDownPaymentPercentChange,
  onDownPaymentDollarChange,
  onLoanAmountCalculated
}: DownPaymentSectionProps) {

  const handlePercentChange = (value: number | undefined) => {
    onDownPaymentPercentChange(value);
    if (propertyPrice && value !== undefined) {
      const synced = syncDownPayment(propertyPrice, value, undefined);
      onDownPaymentDollarChange(synced.dollar);
      onLoanAmountCalculated(synced.loanAmount);
    }
  };

  return (
    <div className="space-y-4">
      {/* Property Price - Full Width */}
      <div className="space-y-2">
        <Label htmlFor="property-price">Property Price</Label>
        <FormattedInput
          id="property-price"
          formatType="currency"
          value={propertyPrice}
          onChange={onPropertyPriceChange}
          placeholder="$500,000"
        />
      </div>

      {/* Down Payment % - Full Width */}
      <div className="space-y-2">
        <Label htmlFor="down-payment-percent">Down Payment (%)</Label>
        <FormattedInput
          id="down-payment-percent"
          formatType="percentage"
          value={downPaymentPercent}
          onChange={handlePercentChange}
          placeholder="20%"
        />
      </div>

      {/* Down Payment $ - Full Width, Read-only with gray background */}
      <div className="space-y-2">
        <Label htmlFor="down-payment-dollar">Down Payment ($)</Label>
        <FormattedInput
          id="down-payment-dollar"
          formatType="currency"
          value={downPaymentDollar}
          onChange={() => {}} // Read-only calculated field
          placeholder="Calculated"
          disabled
        />
      </div>
    </div>
  );
}
