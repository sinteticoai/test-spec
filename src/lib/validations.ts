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

// T008: ClosingCostsSchema
export const ClosingCostsSchema = z.object({
  appraisalFee: z.number().min(0, "Appraisal fee cannot be negative").optional(),
  titleInsurance: z.number().min(0, "Title insurance cannot be negative").optional(),
  titleSearchFee: z.number().min(0, "Title search fee cannot be negative").optional(),
  recordingFees: z.number().min(0, "Recording fees cannot be negative").optional(),
  attorneyFees: z.number().min(0, "Attorney fees cannot be negative").optional(),
  transferTax: z.number().min(0, "Transfer tax cannot be negative").optional(),
  surveyFee: z.number().min(0, "Survey fee cannot be negative").optional(),
  prepaidEscrow: z.number().min(0, "Prepaid escrow cannot be negative").optional(),
  otherClosingCosts: z.number().min(0, "Other closing costs cannot be negative").optional(),
  buyerAgentCommission: z.number().min(0, "Buyer agent commission cannot be negative").optional()
});

// T009: PMIConfigSchema with discriminated union
export const PMIConfigSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('monthly'),
    monthlyRate: z.number().min(0.003, "PMI rate must be at least 0.3%").max(0.015, "PMI rate cannot exceed 1.5%"),
    singlePremiumAmount: z.number().optional(),
    removalMonth: z.number().optional(),
    removalDate: z.date().optional()
  }),
  z.object({
    type: z.literal('single_premium'),
    singlePremiumAmount: z.number().positive("Single premium amount must be positive"),
    monthlyRate: z.number().optional(),
    removalMonth: z.number().optional(),
    removalDate: z.date().optional()
  }),
  z.object({
    type: z.literal('lender_paid'),
    monthlyRate: z.number().optional(),
    singlePremiumAmount: z.number().optional(),
    removalMonth: z.number().optional(),
    removalDate: z.date().optional()
  }),
  z.object({
    type: z.literal('none'),
    monthlyRate: z.number().optional(),
    singlePremiumAmount: z.number().optional(),
    removalMonth: z.number().optional(),
    removalDate: z.date().optional()
  })
]);

// T010: ExtraPaymentsSchema
export const LumpSumPaymentSchema = z.object({
  amount: z.number().positive("Lump sum amount must be positive"),
  paymentMonth: z.number().int().min(1, "Payment month must be at least 1"),
  paymentDate: z.date().optional()
});

export const ExtraPaymentsSchema = z.object({
  extraMonthly: z.number().min(0, "Extra monthly payment cannot be negative").optional(),
  extraAnnual: z.number().min(0, "Extra annual payment cannot be negative").optional(),
  extraAnnualMonth: z.number().int().min(1, "Month must be 1-12").max(12, "Month must be 1-12").optional(),
  lumpSums: z.array(LumpSumPaymentSchema).max(10, "Maximum 10 lump sum payments allowed").optional(),
  biweeklyEnabled: z.boolean().optional()
}).refine(
  (data) => {
    // If extraAnnual is provided, extraAnnualMonth must be provided
    if (data.extraAnnual && data.extraAnnual > 0 && !data.extraAnnualMonth) {
      return false;
    }
    return true;
  },
  {
    message: "Extra annual month is required when extra annual payment is specified"
  }
);

// T011: ARMConfigSchema
export const ARMConfigSchema = z.object({
  initialFixedPeriodYears: z.union([
    z.literal(3),
    z.literal(5),
    z.literal(7),
    z.literal(10)
  ]),
  adjustmentFrequency: z.enum(['annual', 'semi-annual']),
  initialCap: z.number().min(0, "Initial cap cannot be negative").max(10, "Initial cap cannot exceed 10%"),
  periodicCap: z.number().min(0, "Periodic cap cannot be negative").max(10, "Periodic cap cannot exceed 10%"),
  lifetimeCap: z.number().min(0, "Lifetime cap cannot be negative").max(10, "Lifetime cap cannot exceed 10%"),
  projectedRateSchedule: z.array(z.object({
    year: z.number(),
    rate: z.number(),
    monthlyPayment: z.number()
  })).optional()
});

// T012: Extended LoanInputsSchema
export const LoanInputsSchema = z.object({
  // Existing fields
  principal: z.number().min(1000, "Principal must be at least $1,000").max(10_000_000, "Principal cannot exceed $10,000,000"),
  interestRate: z.number().min(0.01, "Interest rate must be at least 0.01%").max(20, "Interest rate cannot exceed 20%"),
  termYears: z.number().int("Loan term must be a whole number").min(1, "Loan term must be at least 1 year").max(50, "Loan term cannot exceed 50 years"),
  propertyTax: z.number().min(0, "Property tax cannot be negative").optional(),
  insurance: z.number().min(0, "Insurance cannot be negative").optional(),
  hoaFees: z.number().min(0, "HOA fees cannot be negative").optional(),
  pmi: z.number().min(0, "PMI cannot be negative").optional(), // DEPRECATED

  // NEW fields
  propertyPrice: z.number().positive("Property price must be positive").optional(),
  downPaymentPercent: z.number().min(0, "Down payment percent cannot be negative").max(100, "Down payment percent cannot exceed 100%").optional(),
  downPaymentDollar: z.number().min(0, "Down payment cannot be negative").optional(),
  discountPoints: z.number().min(0, "Discount points cannot be negative").max(4, "Discount points typically don't exceed 4").optional(),
  originationPoints: z.number().min(0, "Origination points cannot be negative").max(3, "Origination points typically don't exceed 3").optional(),
  lenderCredits: z.number().min(0, "Lender credits cannot be negative").optional(),
  sellerConcessions: z.number().min(0, "Seller concessions cannot be negative").optional(),
  closingCosts: ClosingCostsSchema,
  pmiConfig: PMIConfigSchema,
  extraPayments: ExtraPaymentsSchema,
  loanType: z.enum(['fixed', 'arm']),
  armConfig: ARMConfigSchema.optional()
}).refine(
  (data) => {
    // If loanType is 'arm', armConfig must be provided
    if (data.loanType === 'arm' && !data.armConfig) {
      return false;
    }
    return true;
  },
  {
    message: "ARM configuration is required when loan type is ARM"
  }
);

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
