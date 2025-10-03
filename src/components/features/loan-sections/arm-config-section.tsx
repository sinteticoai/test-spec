'use client';

import { FormattedInput } from '@/components/ui/formatted-input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { ARMConfig } from '@/types/loan';

interface ARMConfigSectionProps {
  loanType: 'fixed' | 'arm';
  armConfig?: ARMConfig;
  onLoanTypeChange: (type: 'fixed' | 'arm') => void;
  onARMConfigChange: (field: keyof ARMConfig, value: number | string) => void;
}

export function ARMConfigSection({
  loanType,
  armConfig,
  onLoanTypeChange,
  onARMConfigChange
}: ARMConfigSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="loan-type">Loan Type</Label>
        <select
          id="loan-type"
          value={loanType}
          onChange={(e) => onLoanTypeChange(e.target.value as 'fixed' | 'arm')}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="fixed">Fixed Rate</option>
          <option value="arm">Adjustable Rate (ARM)</option>
        </select>
      </div>

      {loanType === 'arm' && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-orange-50 rounded-md hover:bg-orange-100">
            <span className="font-medium">ARM Configuration</span>
            <span className="text-sm text-gray-500">{isOpen ? '▼' : '▶'}</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="initial-fixed-period">Initial Fixed Period (Years)</Label>
                <select
                  id="initial-fixed-period"
                  value={armConfig?.initialFixedPeriodYears || 5}
                  onChange={(e) => onARMConfigChange('initialFixedPeriodYears', Number(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value={3}>3-Year ARM (3/6)</option>
                  <option value={5}>5-Year ARM (5/6)</option>
                  <option value={7}>7-Year ARM (7/6)</option>
                  <option value={10}>10-Year ARM (10/6)</option>
                </select>
                <p className="text-xs text-gray-500">Rate is fixed for this period</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjustment-frequency">Adjustment Frequency</Label>
                <select
                  id="adjustment-frequency"
                  value={armConfig?.adjustmentFrequency || 'annual'}
                  onChange={(e) => onARMConfigChange('adjustmentFrequency', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="annual">Annual (Every 12 months)</option>
                  <option value="semi-annual">Semi-Annual (Every 6 months)</option>
                </select>
                <p className="text-xs text-gray-500">How often rate adjusts after initial period</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="initial-cap">Initial Adjustment Cap (%)</Label>
                <FormattedInput
                  id="initial-cap"
                  formatType="number"
                  value={armConfig?.initialCap}
                  onChange={(v) => onARMConfigChange('initialCap', v || 0)}
                  placeholder="2"
                />
                <p className="text-xs text-gray-500">Max change at first adjustment</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodic-cap">Periodic Cap (%)</Label>
                <FormattedInput
                  id="periodic-cap"
                  formatType="number"
                  value={armConfig?.periodicCap}
                  onChange={(v) => onARMConfigChange('periodicCap', v || 0)}
                  placeholder="2"
                />
                <p className="text-xs text-gray-500">Max change per adjustment</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lifetime-cap">Lifetime Cap (%)</Label>
                <FormattedInput
                  id="lifetime-cap"
                  formatType="number"
                  value={armConfig?.lifetimeCap}
                  onChange={(v) => onARMConfigChange('lifetimeCap', v || 0)}
                  placeholder="5"
                />
                <p className="text-xs text-gray-500">Max total rate increase</p>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-orange-50 p-3 rounded space-y-1">
              <p className="font-medium mb-1">ARM Cap Structure Example:</p>
              <p>• 5/2/5 ARM: 5% initial cap, 2% periodic cap, 5% lifetime cap</p>
              <p>• Starting at 3.5% with 5/2/5 caps:</p>
              <p className="ml-3">- First adjustment: Max 8.5% (3.5% + 5%)</p>
              <p className="ml-3">- Subsequent adjustments: Max +2% per period</p>
              <p className="ml-3">- Lifetime maximum: 8.5% (3.5% + 5%)</p>
            </div>

            <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded">
              <p className="font-medium mb-1">⚠️ ARM Risk Disclosure:</p>
              <p>• Payment can increase significantly after initial period</p>
              <p>• Calculator shows worst-case scenario (max caps)</p>
              <p>• Consider your ability to afford maximum payment</p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
