'use client';

import { FormattedInput } from '@/components/ui/formatted-input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { PMIConfig } from '@/types/loan';

interface PMIConfigSectionProps {
  pmiConfig: PMIConfig;
  ltvPercent?: number;
  onPmiTypeChange: (type: PMIConfig['type']) => void;
  onPmiRateChange: (value: number | undefined) => void;
  onSinglePremiumChange: (value: number | undefined) => void;
}

export function PMIConfigSection({
  pmiConfig,
  ltvPercent,
  onPmiTypeChange,
  onPmiRateChange,
  onSinglePremiumChange
}: PMIConfigSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const showSection = ltvPercent && ltvPercent > 80;

  if (!showSection) {
    return null; // Hide if LTV <= 80% (20% or more down payment)
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-yellow-50 rounded-md hover:bg-yellow-100">
        <span className="font-medium">PMI Configuration (LTV: {ltvPercent?.toFixed(1)}%)</span>
        <span className="text-sm text-gray-500">{isOpen ? '▼' : '▶'}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pmi-type">PMI Type</Label>
          <select
            id="pmi-type"
            value={pmiConfig.type}
            onChange={(e) => onPmiTypeChange(e.target.value as PMIConfig['type'])}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="monthly">Monthly PMI</option>
            <option value="single_premium">Single Premium (Upfront)</option>
            <option value="lender_paid">Lender-Paid PMI</option>
            <option value="none">No PMI</option>
          </select>
        </div>

        {pmiConfig.type === 'monthly' && (
          <div className="space-y-2">
            <Label htmlFor="pmi-rate">PMI Rate (Annual %)</Label>
            <FormattedInput
              id="pmi-rate"
              formatType="percentage"
              value={pmiConfig.monthlyRate ? pmiConfig.monthlyRate * 100 : undefined}
              onChange={(v) => onPmiRateChange(v ? v / 100 : undefined)}
              placeholder="0.5%"
            />
            <p className="text-xs text-gray-500">Typical range: 0.3% - 1.5%</p>
          </div>
        )}

        {pmiConfig.type === 'single_premium' && (
          <div className="space-y-2">
            <Label htmlFor="single-premium">Single Premium Amount</Label>
            <FormattedInput
              id="single-premium"
              formatType="currency"
              value={pmiConfig.singlePremiumAmount}
              onChange={onSinglePremiumChange}
              placeholder="$5,000"
            />
            <p className="text-xs text-gray-500">Paid upfront at closing</p>
          </div>
        )}

        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
          <p>• PMI automatically terminates at 78% LTV</p>
          <p>• You can request removal at 80% LTV (requires appraisal)</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
