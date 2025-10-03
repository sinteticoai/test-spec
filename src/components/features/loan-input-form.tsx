'use client';

import { useState } from 'react';
import { LoanInputs } from '@/types/loan';
import { LoanInputsSchema } from '@/lib/validations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, Percent, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

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
          <Label htmlFor={`principal-${loanNumber}`} className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Loan Amount
          </Label>
          <Input
            id={`principal-${loanNumber}`}
            type="number"
            placeholder="200000"
            value={inputs.principal ?? ''}
            onChange={(e) => onInputsChange({ ...inputs, principal: e.target.value === '' ? undefined : Number(e.target.value) })}
            onBlur={(e) => handleBlur('principal', e.target.value)}
          />
          {errors.principal && (
            <Alert variant="destructive">
              <AlertDescription>{errors.principal}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <Label htmlFor={`interestRate-${loanNumber}`} className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Interest Rate (%)
          </Label>
          <Input
            id={`interestRate-${loanNumber}`}
            type="number"
            step="0.01"
            placeholder="5.0"
            value={inputs.interestRate ?? ''}
            onChange={(e) => onInputsChange({ ...inputs, interestRate: e.target.value === '' ? undefined : Number(e.target.value) })}
            onBlur={(e) => handleBlur('interestRate', e.target.value)}
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
          <Input
            id={`termYears-${loanNumber}`}
            type="number"
            placeholder="30"
            value={inputs.termYears ?? ''}
            onChange={(e) => onInputsChange({ ...inputs, termYears: e.target.value === '' ? undefined : Number(e.target.value) })}
            onBlur={(e) => handleBlur('termYears', e.target.value)}
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
                Annual Property Tax ($)
              </Label>
              <Input
                id={`propertyTax-${loanNumber}`}
                type="number"
                placeholder="3600"
                value={inputs.propertyTax ?? ''}
                onChange={(e) => onInputsChange({ ...inputs, propertyTax: e.target.value === '' ? undefined : Number(e.target.value) })}
                onBlur={(e) => handleBlur('propertyTax', e.target.value)}
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
                Annual Insurance ($)
              </Label>
              <Input
                id={`insurance-${loanNumber}`}
                type="number"
                placeholder="1200"
                value={inputs.insurance ?? ''}
                onChange={(e) => onInputsChange({ ...inputs, insurance: e.target.value === '' ? undefined : Number(e.target.value) })}
                onBlur={(e) => handleBlur('insurance', e.target.value)}
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
                Monthly HOA Fees ($)
              </Label>
              <Input
                id={`hoaFees-${loanNumber}`}
                type="number"
                placeholder="150"
                value={inputs.hoaFees ?? ''}
                onChange={(e) => onInputsChange({ ...inputs, hoaFees: e.target.value === '' ? undefined : Number(e.target.value) })}
                onBlur={(e) => handleBlur('hoaFees', e.target.value)}
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
                Monthly PMI ($)
              </Label>
              <Input
                id={`pmi-${loanNumber}`}
                type="number"
                placeholder="100"
                value={inputs.pmi ?? ''}
                onChange={(e) => onInputsChange({ ...inputs, pmi: e.target.value === '' ? undefined : Number(e.target.value) })}
                onBlur={(e) => handleBlur('pmi', e.target.value)}
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
