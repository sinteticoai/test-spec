import { z } from 'zod';

// Global error map to customize Zod v4 error messages
z.setErrorMap((issue) => {
  if (issue.code === z.ZodIssueCode.invalid_type && issue.path && issue.path.length > 0) {
    const fieldName = issue.path[0] as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inputValue = (issue as any).input; // Zod v4 uses 'input' property

    // Check if field is missing (undefined) - this takes priority
    if (inputValue === undefined && issue.expected === 'number') {
      if (fieldName === 'principal') return { message: 'Principal is required' };
      if (fieldName === 'interestRate') return { message: 'Interest rate is required' };
      if (fieldName === 'termYears') return { message: 'Loan term is required' };
    }
    // Type mismatch for number fields (non-undefined wrong type)
    else if (issue.expected === 'number' && inputValue !== undefined) {
      if (fieldName === 'principal') return { message: 'Principal must be a number' };
      if (fieldName === 'interestRate') return { message: 'Interest rate must be a number' };
      if (fieldName === 'termYears') return { message: 'Loan term must be a number' };
    }
  }
  // Return default error if no custom mapping applies
  return { message: `Invalid input` };
});

export const LoanInputsSchema = z.object({
  principal: z.number().min(1000, "Principal must be at least $1,000").max(10_000_000, "Principal cannot exceed $10,000,000"),
  interestRate: z.number().min(0.01, "Interest rate must be at least 0.01%").max(20, "Interest rate cannot exceed 20%"),
  termYears: z.number().int("Loan term must be a whole number").min(1, "Loan term must be at least 1 year").max(50, "Loan term cannot exceed 50 years"),
  propertyTax: z.number().min(0, "Property tax cannot be negative").optional(),
  insurance: z.number().min(0, "Insurance cannot be negative").optional(),
  hoaFees: z.number().min(0, "HOA fees cannot be negative").optional(),
  pmi: z.number().min(0, "PMI cannot be negative").optional()
});

export type LoanInputs = z.infer<typeof LoanInputsSchema>;

// Tax-related validation schemas
export const FilingStatusSchema = z.enum([
  'single',
  'married_joint',
  'married_separate',
  'head_of_household'
]);

export const TaxProfileSchema = z.object({
  annualIncome: z.number()
    .positive("Income must be positive")
    .max(10_000_000, "Income must be reasonable"),
  filingStatus: FilingStatusSchema,
  propertyTaxAnnual: z.number()
    .min(0, "Property tax cannot be negative")
});

export type TaxProfile = z.infer<typeof TaxProfileSchema>;
