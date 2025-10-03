import { z } from 'zod';

export const LoanInputsSchema = z.object({
  principal: z.number({
    required_error: "Principal amount is required",
    invalid_type_error: "Principal must be a number"
  })
    .min(1000, "Principal must be at least $1,000")
    .max(10_000_000, "Principal cannot exceed $10,000,000"),

  interestRate: z.number({
    required_error: "Interest rate is required",
    invalid_type_error: "Interest rate must be a number"
  })
    .min(0.01, "Interest rate must be at least 0.01%")
    .max(20, "Interest rate cannot exceed 20%"),

  termYears: z.number({
    required_error: "Loan term is required",
    invalid_type_error: "Loan term must be a number"
  })
    .int("Loan term must be a whole number")
    .min(1, "Loan term must be at least 1 year")
    .max(50, "Loan term cannot exceed 50 years"),

  propertyTax: z.number()
    .min(0, "Property tax cannot be negative")
    .optional(),

  insurance: z.number()
    .min(0, "Insurance cannot be negative")
    .optional(),

  hoaFees: z.number()
    .min(0, "HOA fees cannot be negative")
    .optional(),

  pmi: z.number()
    .min(0, "PMI cannot be negative")
    .optional()
});

export type LoanInputs = z.infer<typeof LoanInputsSchema>;
