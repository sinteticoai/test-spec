'use client';

import { TaxBenefitCalculation, TaxProfile } from '@/types/tax';
import { formatCurrency } from '@/lib/mortgage-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FormattedInput } from '@/components/ui/formatted-input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TaxBenefitsDisplayProps {
  calculation: TaxBenefitCalculation | null;
  taxProfile: TaxProfile;
  onTaxProfileChange: (profile: TaxProfile) => void;
  onAnnualIncomeChange: (value: number | undefined) => void;
  onPropertyTaxChange: (value: number | undefined) => void;
  onFilingStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onFieldBlur: () => void;
}

export default function TaxBenefitsDisplay({
  calculation,
  taxProfile,
  onTaxProfileChange,
  onAnnualIncomeChange,
  onPropertyTaxChange,
  onFilingStatusChange,
  onFieldBlur
}: TaxBenefitsDisplayProps) {

  const formatPercentage = (rate: number): string => {
    return `${(rate * 100).toFixed(0)}%`;
  };

  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Tax Benefits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tax Profile Inputs */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Annual Income */}
              <div className="space-y-2">
                <Label htmlFor="annual-income">Annual Income</Label>
                <FormattedInput
                  id="annual-income"
                  formatType="currency"
                  value={taxProfile.annualIncome}
                  onChange={onAnnualIncomeChange}
                  onBlur={onFieldBlur}
                  placeholder="$120,000"
                />
              </div>

              {/* Filing Status */}
              <div className="space-y-2">
                <Label htmlFor="filing-status">Filing Status</Label>
                <select
                  id="filing-status"
                  value={taxProfile.filingStatus}
                  onChange={onFilingStatusChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Filing Status"
                >
                  <option value="single">Single</option>
                  <option value="married_joint">Married Filing Jointly</option>
                  <option value="married_separate">Married Filing Separately</option>
                  <option value="head_of_household">Head of Household</option>
                </select>
              </div>

              {/* Property Tax */}
              <div className="space-y-2">
                <Label htmlFor="property-tax-annual">Property Tax (Annual)</Label>
                <FormattedInput
                  id="property-tax-annual"
                  formatType="currency"
                  value={taxProfile.propertyTaxAnnual}
                  onChange={onPropertyTaxChange}
                  onBlur={onFieldBlur}
                  placeholder="$12,000"
                />
              </div>
            </div>
          </div>

          {calculation && (
            <>
              <Separator />

              {/* Warnings */}
              {calculation.exceeds750kLimit && (
            <Alert variant="destructive">
              <AlertDescription>
                Your loan exceeds the $750,000 qualified debt limit. Interest deduction is limited to the amount on $750,000.
              </AlertDescription>
            </Alert>
          )}

          {/* Tax Calculation Results */}
          <div className="space-y-4">
            {/* Marginal Tax Rate */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Marginal Tax Rate:</span>
              <span className="text-lg font-bold">{formatPercentage(calculation.marginalTaxRate)}</span>
            </div>

            <Separator />

            {/* Mortgage Interest Deduction */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Mortgage Interest Deduction:</span>
              <span className="text-lg">{formatCurrency(calculation.mortgageInterestDeduction)}</span>
            </div>

            {/* Property Tax Deduction */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Property Tax Deduction:
                {calculation.exceedsSALTCap && (
                  <span className="ml-2 text-xs text-muted-foreground">(SALT capped)</span>
                )}
              </span>
              <span className="text-lg">{formatCurrency(calculation.propertyTaxDeduction)}</span>
            </div>

            <Separator />

            {/* Deduction Method Comparison */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Deductions (Itemized):</span>
                <span className="text-lg">{formatCurrency(calculation.totalItemizedDeductions)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Deductions (Standard):</span>
                <span className="text-lg">{formatCurrency(calculation.standardDeduction)}</span>
              </div>
            </div>

            <Separator />

            {/* Recommended Method */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Recommended Method:</span>
              <span className="text-lg font-bold text-primary capitalize">
                {calculation.recommendedMethod === 'itemized' ? 'Itemized (Recommended)' : 'Standard (Recommended)'}
              </span>
            </div>

            {/* Additional Benefit or No Benefit Message */}
            {calculation.itemizationBeneficial ? (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Additional Benefit from Itemizing:</span>
                <span className="text-lg">{formatCurrency(calculation.additionalItemizedBenefit)}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Additional Benefit from Itemizing:</span>
                  <span className="text-lg">$0</span>
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  No additional benefit from itemizing. Standard deduction is better.
                </div>
              </div>
            )}

            <Separator />

            {/* Tax Savings */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Annual Tax Savings:</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(calculation.annualTaxSavings)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Monthly Tax Savings:</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(calculation.monthlyTaxSavings)}</span>
              </div>
            </div>

            <Separator />

            {/* Effective Monthly Payment */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Original Monthly Payment:</span>
                <span className="text-lg">{formatCurrency(calculation.originalMonthlyPayment)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Effective Monthly Payment (After Tax Savings):</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(calculation.effectiveMonthlyPayment)}</span>
              </div>
            </div>
          </div>

              <Separator />

              {/* Disclaimer */}
              <div className="text-xs text-muted-foreground">
                <p>
                  Tax benefit estimates assume full-year deductions. Actual benefits may vary based on your specific tax situation.
                  Consult a tax professional for personalized advice.
                </p>
              </div>
            </>
          )}

          {!calculation && (
            <p className="text-sm text-muted-foreground">
              Enter your tax information above to see potential tax benefits from mortgage interest and property tax deductions.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
