'use client';

import { FormattedInput } from '@/components/ui/formatted-input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface PointsFeesSectionProps {
  discountPoints?: number;
  originationPoints?: number;
  lenderCredits?: number;
  onDiscountPointsChange: (value: number | undefined) => void;
  onOriginationPointsChange: (value: number | undefined) => void;
  onLenderCreditsChange: (value: number | undefined) => void;
}

export function PointsFeesSection({
  discountPoints,
  originationPoints,
  lenderCredits,
  onDiscountPointsChange,
  onOriginationPointsChange,
  onLenderCreditsChange
}: PointsFeesSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-md hover:bg-gray-100">
        <span className="font-medium">Points & Fees</span>
        <span className="text-sm text-gray-500">{isOpen ? '▼' : '▶'}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="discount-points">Discount Points</Label>
            <FormattedInput
              id="discount-points"
              formatType="number"
              value={discountPoints}
              onChange={onDiscountPointsChange}
              placeholder="0"
            />
            <p className="text-xs text-gray-500">Each point = 0.25% rate reduction</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="origination-points">Origination Points</Label>
            <FormattedInput
              id="origination-points"
              formatType="number"
              value={originationPoints}
              onChange={onOriginationPointsChange}
              placeholder="0"
            />
            <p className="text-xs text-gray-500">Lender fees as % of loan</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lender-credits">Lender Credits</Label>
            <FormattedInput
              id="lender-credits"
              formatType="currency"
              value={lenderCredits}
              onChange={onLenderCreditsChange}
              placeholder="$0"
            />
            <p className="text-xs text-gray-500">Credits toward closing costs</p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
