/**
 * Contract Tests: Input Validation
 *
 * These tests define the contract for Zod validation schemas.
 * Tests will FAIL until implementation is complete (TDD approach).
 */

import { describe, it, expect } from '@jest/globals';
import { LoanInputsSchema } from '@/lib/validations';

describe('LoanInputsSchema - Principal Validation', () => {
  it('accepts valid principal within range', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 30
    });

    expect(result.success).toBe(true);
  });

  it('rejects principal below minimum ($1,000)', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 999,
      interestRate: 5,
      termYears: 30
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least $1,000');
    }
  });

  it('rejects principal above maximum ($10M)', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 10_000_001,
      interestRate: 5,
      termYears: 30
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('cannot exceed $10,000,000');
    }
  });

  it('accepts boundary values ($1,000 and $10M)', () => {
    const minResult = LoanInputsSchema.safeParse({
      principal: 1000,
      interestRate: 5,
      termYears: 30
    });

    const maxResult = LoanInputsSchema.safeParse({
      principal: 10_000_000,
      interestRate: 5,
      termYears: 30
    });

    expect(minResult.success).toBe(true);
    expect(maxResult.success).toBe(true);
  });

  it('rejects non-numeric principal', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 'not a number',
      interestRate: 5,
      termYears: 30
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('must be a number');
    }
  });

  it('rejects missing principal', () => {
    const result = LoanInputsSchema.safeParse({
      interestRate: 5,
      termYears: 30
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('required');
    }
  });
});

describe('LoanInputsSchema - Interest Rate Validation', () => {
  it('accepts valid interest rate within range', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5.5,
      termYears: 30
    });

    expect(result.success).toBe(true);
  });

  it('rejects interest rate below minimum (0.01%)', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 0.005,
      termYears: 30
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 0.01%');
    }
  });

  it('rejects interest rate above maximum (20%)', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 20.01,
      termYears: 30
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('cannot exceed 20%');
    }
  });

  it('accepts boundary values (0.01% and 20%)', () => {
    const minResult = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 0.01,
      termYears: 30
    });

    const maxResult = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 20,
      termYears: 30
    });

    expect(minResult.success).toBe(true);
    expect(maxResult.success).toBe(true);
  });

  it('rejects negative interest rate', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: -1,
      termYears: 30
    });

    expect(result.success).toBe(false);
  });
});

describe('LoanInputsSchema - Term Years Validation', () => {
  it('accepts valid term within range', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 30
    });

    expect(result.success).toBe(true);
  });

  it('rejects term below minimum (1 year)', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 0
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 1 year');
    }
  });

  it('rejects term above maximum (50 years)', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 51
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('cannot exceed 50 years');
    }
  });

  it('accepts boundary values (1 and 50 years)', () => {
    const minResult = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 1
    });

    const maxResult = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 50
    });

    expect(minResult.success).toBe(true);
    expect(maxResult.success).toBe(true);
  });

  it('rejects non-integer term', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 30.5
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('whole number');
    }
  });
});

describe('LoanInputsSchema - Optional Fields Validation', () => {
  it('accepts loan without optional fields', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 30
    });

    expect(result.success).toBe(true);
  });

  it('accepts valid property tax', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 30,
      propertyTax: 3600
    });

    expect(result.success).toBe(true);
  });

  it('rejects negative property tax', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 30,
      propertyTax: -100
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('cannot be negative');
    }
  });

  it('accepts zero property tax', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 30,
      propertyTax: 0
    });

    expect(result.success).toBe(true);
  });

  it('accepts valid insurance', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 30,
      insurance: 1200
    });

    expect(result.success).toBe(true);
  });

  it('rejects negative insurance', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 30,
      insurance: -50
    });

    expect(result.success).toBe(false);
  });

  it('accepts valid HOA fees', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 30,
      hoaFees: 150
    });

    expect(result.success).toBe(true);
  });

  it('rejects negative HOA fees', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 30,
      hoaFees: -25
    });

    expect(result.success).toBe(false);
  });

  it('accepts valid PMI', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 30,
      pmi: 100
    });

    expect(result.success).toBe(true);
  });

  it('rejects negative PMI', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 30,
      pmi: -10
    });

    expect(result.success).toBe(false);
  });

  it('accepts all optional fields together', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 30,
      propertyTax: 3600,
      insurance: 1200,
      hoaFees: 150,
      pmi: 100
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.propertyTax).toBe(3600);
      expect(result.data.insurance).toBe(1200);
      expect(result.data.hoaFees).toBe(150);
      expect(result.data.pmi).toBe(100);
    }
  });
});

describe('LoanInputsSchema - Multiple Validation Errors', () => {
  it('reports all validation errors at once', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 500,          // Too low
      interestRate: 25,        // Too high
      termYears: 60            // Too high
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('validates independent fields separately', () => {
    const result = LoanInputsSchema.safeParse({
      principal: 200000,
      interestRate: 5,
      termYears: 30,
      propertyTax: -100,
      insurance: -50
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBe(2); // Two negative optional fields
    }
  });
});

describe('LoanInputsSchema - Type Coercion', () => {
  it('does not coerce string numbers to numbers', () => {
    const result = LoanInputsSchema.safeParse({
      principal: '200000',
      interestRate: '5',
      termYears: '30'
    });

    expect(result.success).toBe(false);
  });

  it('rejects null values', () => {
    const result = LoanInputsSchema.safeParse({
      principal: null,
      interestRate: 5,
      termYears: 30
    });

    expect(result.success).toBe(false);
  });

  it('rejects undefined for required fields', () => {
    const result = LoanInputsSchema.safeParse({
      principal: undefined,
      interestRate: 5,
      termYears: 30
    });

    expect(result.success).toBe(false);
  });
});
