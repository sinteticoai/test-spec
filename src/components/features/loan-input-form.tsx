'use client';

import { useState } from 'react';
import { LoanInputs } from '@/types/loan';
import { LoanInputsSchema } from '@/lib/validations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormattedInput } from '@/components/ui/formatted-input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface LoanInputFormProps {
  loanNumber: 1 | 2;
  inputs: Partial<LoanInputs>;
  onInputsChange: (inputs: Partial<LoanInputs>) => void;
  onCalculate: () => void;
}

export function LoanInputForm({ loanNumber, inputs, onInputsChange, onCalculate }: LoanInputFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOptional, setShowOptional] = useState(false);

  const handleBlur = (field: keyof LoanInputs, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    const updatedInputs = { ...inputs, [field]: numValue };

    // Update inputs
    onInputsChange(updatedInputs);

    // Validate the specific field
    const result = LoanInputsSchema.safeParse(updatedInputs);

    if (!result.success) {
      const fieldError = result.error.issues.find(issue => issue.path[0] === field);
      if (fieldError) {
        setErrors(prev => ({ ...prev, [field]: fieldError.message }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } else {
      // Clear error for this field
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });

      // Trigger calculation if all required fields are valid
      onCalculate();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan {loanNumber}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Principal */}
        <div className="space-y-2">
          <Label htmlFor={`principal-${loanNumber}`}>
            Loan Amount
          </Label>
          <FormattedInput
            id={`principal-${loanNumber}`}
            formatType="currency"
            placeholder="$200,000"
            value={inputs.principal ?? ''}
            onChange={(value) => onInputsChange({ ...inputs, principal: value })}
            onBlur={(e) => handleBlur('principal', (e.target as HTMLInputElement).value)}
          />
          {errors.principal && (
            <Alert variant="destructive">
              <AlertDescription>{errors.principal}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <Label htmlFor={`interestRate-${loanNumber}`}>
            Interest Rate
          </Label>
          <FormattedInput
            id={`interestRate-${loanNumber}`}
            formatType="percentage"
            placeholder="5.00%"
            value={inputs.interestRate ?? ''}
            onChange={(value) => onInputsChange({ ...inputs, interestRate: value })}
            onBlur={(e) => handleBlur('interestRate', (e.target as HTMLInputElement).value)}
          />
          {errors.interestRate && (
            <Alert variant="destructive">
              <AlertDescription>{errors.interestRate}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Term Years */}
        <div className="space-y-2">
          <Label htmlFor={`termYears-${loanNumber}`} className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Loan Term (years)
          </Label>
          <FormattedInput
            id={`termYears-${loanNumber}`}
            formatType="number"
            placeholder="30"
            value={inputs.termYears ?? ''}
            onChange={(value) => onInputsChange({ ...inputs, termYears: value })}
            onBlur={(e) => handleBlur('termYears', (e.target as HTMLInputElement).value)}
          />
          {errors.termYears && (
            <Alert variant="destructive">
              <AlertDescription>{errors.termYears}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Optional Fields - Collapsible */}
        <Collapsible open={showOptional} onOpenChange={setShowOptional}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
            {showOptional ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Additional Costs (Optional)
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Property Tax */}
            <div className="space-y-2">
              <Label htmlFor={`propertyTax-${loanNumber}`}>
                Annual Property Tax
              </Label>
              <FormattedInput
                id={`propertyTax-${loanNumber}`}
                formatType="currency"
                placeholder="$3,600"
                value={inputs.propertyTax ?? ''}
                onChange={(value) => onInputsChange({ ...inputs, propertyTax: value })}
                onBlur={(e) => handleBlur('propertyTax', (e.target as HTMLInputElement).value)}
              />
              {errors.propertyTax && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.propertyTax}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Insurance */}
            <div className="space-y-2">
              <Label htmlFor={`insurance-${loanNumber}`}>
                Annual Insurance
              </Label>
              <FormattedInput
                id={`insurance-${loanNumber}`}
                formatType="currency"
                placeholder="$1,200"
                value={inputs.insurance ?? ''}
                onChange={(value) => onInputsChange({ ...inputs, insurance: value })}
                onBlur={(e) => handleBlur('insurance', (e.target as HTMLInputElement).value)}
              />
              {errors.insurance && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.insurance}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* HOA Fees */}
            <div className="space-y-2">
              <Label htmlFor={`hoaFees-${loanNumber}`}>
                Monthly HOA Fees
              </Label>
              <FormattedInput
                id={`hoaFees-${loanNumber}`}
                formatType="currency"
                placeholder="$150"
                value={inputs.hoaFees ?? ''}
                onChange={(value) => onInputsChange({ ...inputs, hoaFees: value })}
                onBlur={(e) => handleBlur('hoaFees', (e.target as HTMLInputElement).value)}
              />
              {errors.hoaFees && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.hoaFees}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* PMI */}
            <div className="space-y-2">
              <Label htmlFor={`pmi-${loanNumber}`}>
                Monthly PMI
              </Label>
              <FormattedInput
                id={`pmi-${loanNumber}`}
                formatType="currency"
                placeholder="$100"
                value={inputs.pmi ?? ''}
                onChange={(value) => onInputsChange({ ...inputs, pmi: value })}
                onBlur={(e) => handleBlur('pmi', (e.target as HTMLInputElement).value)}
              />
              {errors.pmi && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.pmi}</AlertDescription>
                </Alert>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
