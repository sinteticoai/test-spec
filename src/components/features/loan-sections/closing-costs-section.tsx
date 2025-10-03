'use client';

import { FormattedInput } from '@/components/ui/formatted-input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { ClosingCosts } from '@/types/loan';

interface ClosingCostsSectionProps {
  closingCosts: ClosingCosts;
  sellerConcessions?: number;
  onClosingCostsChange: (field: keyof ClosingCosts, value: number | undefined) => void;
  onSellerConcessionsChange: (value: number | undefined) => void;
}

export function ClosingCostsSection({
  closingCosts,
  sellerConcessions,
  onClosingCostsChange,
  onSellerConcessionsChange
}: ClosingCostsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-md hover:bg-gray-100">
        <span className="font-medium">Closing Costs</span>
        <span className="text-sm text-gray-500">{isOpen ? '▼' : '▶'}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="appraisal-fee">Appraisal Fee</Label>
            <FormattedInput
              id="appraisal-fee"
              formatType="currency"
              value={closingCosts.appraisalFee}
              onChange={(v) => onClosingCostsChange('appraisalFee', v)}
              placeholder="$500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title-insurance">Title Insurance</Label>
            <FormattedInput
              id="title-insurance"
              formatType="currency"
              value={closingCosts.titleInsurance}
              onChange={(v) => onClosingCostsChange('titleInsurance', v)}
              placeholder="$2,000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title-search-fee">Title Search Fee</Label>
            <FormattedInput
              id="title-search-fee"
              formatType="currency"
              value={closingCosts.titleSearchFee}
              onChange={(v) => onClosingCostsChange('titleSearchFee', v)}
              placeholder="$400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recording-fees">Recording Fees</Label>
            <FormattedInput
              id="recording-fees"
              formatType="currency"
              value={closingCosts.recordingFees}
              onChange={(v) => onClosingCostsChange('recordingFees', v)}
              placeholder="$250"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attorney-fees">Attorney Fees</Label>
            <FormattedInput
              id="attorney-fees"
              formatType="currency"
              value={closingCosts.attorneyFees}
              onChange={(v) => onClosingCostsChange('attorneyFees', v)}
              placeholder="$1,200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-tax">Transfer Tax</Label>
            <FormattedInput
              id="transfer-tax"
              formatType="currency"
              value={closingCosts.transferTax}
              onChange={(v) => onClosingCostsChange('transferTax', v)}
              placeholder="$3,500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="survey-fee">Survey Fee</Label>
            <FormattedInput
              id="survey-fee"
              formatType="currency"
              value={closingCosts.surveyFee}
              onChange={(v) => onClosingCostsChange('surveyFee', v)}
              placeholder="$500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prepaid-escrow">Prepaid Escrow</Label>
            <FormattedInput
              id="prepaid-escrow"
              formatType="currency"
              value={closingCosts.prepaidEscrow}
              onChange={(v) => onClosingCostsChange('prepaidEscrow', v)}
              placeholder="$4,000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="other-closing-costs">Other Costs</Label>
            <FormattedInput
              id="other-closing-costs"
              formatType="currency"
              value={closingCosts.otherClosingCosts}
              onChange={(v) => onClosingCostsChange('otherClosingCosts', v)}
              placeholder="$800"
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="seller-concessions">Seller Concessions</Label>
            <FormattedInput
              id="seller-concessions"
              formatType="currency"
              value={sellerConcessions}
              onChange={onSellerConcessionsChange}
              placeholder="$0"
            />
            <p className="text-xs text-gray-500">Amount seller pays toward closing costs</p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
