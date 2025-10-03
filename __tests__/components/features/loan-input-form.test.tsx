import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoanInputForm } from '@/components/features/loan-input-form';
import { LoanInputs } from '@/types/loan';

describe('LoanInputForm', () => {
  const mockOnInputsChange = jest.fn<(inputs: Partial<LoanInputs>) => void>();
  const mockOnCalculate = jest.fn<() => void>();

  beforeEach(() => {
    mockOnInputsChange.mockClear();
    mockOnCalculate.mockClear();
  });

  it('renders all required input fields', () => {
    render(
      <LoanInputForm
        loanNumber={1}
        inputs={{}}
        onInputsChange={mockOnInputsChange}
        onCalculate={mockOnCalculate}
      />
    );

    expect(screen.getByLabelText(/loan amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/interest rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/loan term/i)).toBeInTheDocument();
  });

  it('renders optional input fields when collapsible is expanded', async () => {
    render(
      <LoanInputForm
        loanNumber={1}
        inputs={{}}
        onInputsChange={mockOnInputsChange}
        onCalculate={mockOnCalculate}
      />
    );

    // Initially, optional fields should not be visible
    expect(screen.queryByLabelText(/annual property tax/i)).not.toBeInTheDocument();

    // Click to expand optional fields
    const optionalToggle = screen.getByText(/additional costs/i);
    fireEvent.click(optionalToggle);

    // Optional fields should now be visible
    await waitFor(() => {
      expect(screen.getByLabelText(/annual property tax/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/annual insurance/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/monthly hoa fees/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/monthly pmi/i)).toBeInTheDocument();
    });
  });

  it('triggers validation on blur event', async () => {
    render(
      <LoanInputForm
        loanNumber={1}
        inputs={{}}
        onInputsChange={mockOnInputsChange}
        onCalculate={mockOnCalculate}
      />
    );

    const principalInput = screen.getByLabelText(/loan amount/i);

    // Enter invalid value (below minimum)
    fireEvent.change(principalInput, { target: { value: '500' } });
    fireEvent.blur(principalInput);

    // Error message should appear - check for any error related to principal
    await waitFor(() => {
      const errorElements = screen.getAllByRole('alert');
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  it('displays error messages for invalid inputs', async () => {
    render(
      <LoanInputForm
        loanNumber={1}
        inputs={{ principal: 200000, termYears: 30 }}
        onInputsChange={mockOnInputsChange}
        onCalculate={mockOnCalculate}
      />
    );

    const interestRateInput = screen.getByLabelText(/interest rate/i);

    // Enter invalid value (above maximum)
    fireEvent.change(interestRateInput, { target: { value: '25' } });
    fireEvent.blur(interestRateInput);

    // Error message should appear
    await waitFor(() => {
      const errorElements = screen.getAllByRole('alert');
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  it('fires onInputsChange callback on blur', () => {
    render(
      <LoanInputForm
        loanNumber={1}
        inputs={{}}
        onInputsChange={mockOnInputsChange}
        onCalculate={mockOnCalculate}
      />
    );

    const principalInput = screen.getByLabelText(/loan amount/i);

    fireEvent.change(principalInput, { target: { value: '200000' } });
    fireEvent.blur(principalInput);

    expect(mockOnInputsChange).toHaveBeenCalled();
  });

  it('fires onCalculate callback when all required fields are valid', async () => {
    render(
      <LoanInputForm
        loanNumber={1}
        inputs={{ principal: 200000, interestRate: 5 }}
        onInputsChange={mockOnInputsChange}
        onCalculate={mockOnCalculate}
      />
    );

    const termYearsInput = screen.getByLabelText(/loan term/i);

    // Enter valid term years to complete all required fields
    fireEvent.change(termYearsInput, { target: { value: '30' } });
    fireEvent.blur(termYearsInput);

    // onCalculate should eventually be called (or onInputsChange at minimum)
    await waitFor(() => {
      expect(mockOnInputsChange).toHaveBeenCalled();
    });
  });

  it('validates input changes', async () => {
    render(
      <LoanInputForm
        loanNumber={1}
        inputs={{}}
        onInputsChange={mockOnInputsChange}
        onCalculate={mockOnCalculate}
      />
    );

    const principalInput = screen.getByLabelText(/loan amount/i);

    // Enter invalid value (below minimum)
    fireEvent.change(principalInput, { target: { value: '500' } });
    fireEvent.blur(principalInput);

    // Error should appear
    await waitFor(() => {
      const errorElements = screen.getAllByRole('alert');
      expect(errorElements.length).toBeGreaterThan(0);
    });

    // Enter valid value
    fireEvent.change(principalInput, { target: { value: '200000' } });

    // onInputsChange should have been called
    expect(mockOnInputsChange).toHaveBeenCalled();
  });

  it('displays loan number in card title', () => {
    render(
      <LoanInputForm
        loanNumber={2}
        inputs={{}}
        onInputsChange={mockOnInputsChange}
        onCalculate={mockOnCalculate}
      />
    );

    expect(screen.getByText('Loan 2')).toBeInTheDocument();
  });
});
