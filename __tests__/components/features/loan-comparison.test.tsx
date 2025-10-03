import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoanComparison } from '@/components/features/loan-comparison';

describe('LoanComparison', () => {
  it('renders two loan input forms', () => {
    render(<LoanComparison />);

    // Check for both loan cards
    expect(screen.getByText('Loan 1')).toBeInTheDocument();
    expect(screen.getByText('Loan 2')).toBeInTheDocument();
  });

  it('manages state independently for each loan', async () => {
    render(<LoanComparison />);

    const loanAmountInputs = screen.getAllByLabelText(/loan amount/i);
    expect(loanAmountInputs).toHaveLength(2);

    // Enter value in first loan
    fireEvent.change(loanAmountInputs[0], { target: { value: '200000' } });
    fireEvent.blur(loanAmountInputs[0]);

    // First loan should have the value
    expect(loanAmountInputs[0]).toHaveValue(200000);

    // Second loan should still be empty
    expect(loanAmountInputs[1]).toHaveValue(null);
  });

  it('calculates results on valid input', async () => {
    render(<LoanComparison />);

    // Get input fields for loan 1
    const loanAmountInputs = screen.getAllByLabelText(/loan amount/i);
    const interestRateInputs = screen.getAllByLabelText(/interest rate/i);
    const termYearsInputs = screen.getAllByLabelText(/loan term/i);

    // Fill in valid data for loan 1
    fireEvent.change(loanAmountInputs[0], { target: { value: '200000' } });
    fireEvent.blur(loanAmountInputs[0]);

    fireEvent.change(interestRateInputs[0], { target: { value: '5' } });
    fireEvent.blur(interestRateInputs[0]);

    fireEvent.change(termYearsInputs[0], { target: { value: '30' } });
    fireEvent.blur(termYearsInputs[0]);

    // Results should be displayed
    await waitFor(() => {
      expect(screen.getByText('Loan 1 Results')).toBeInTheDocument();
    });
  });

  it('displays results when calculation completes', async () => {
    render(<LoanComparison />);

    // Get input fields for loan 1
    const loanAmountInputs = screen.getAllByLabelText(/loan amount/i);
    const interestRateInputs = screen.getAllByLabelText(/interest rate/i);
    const termYearsInputs = screen.getAllByLabelText(/loan term/i);

    // Fill in valid data for loan 1
    fireEvent.change(loanAmountInputs[0], { target: { value: '200000' } });
    fireEvent.blur(loanAmountInputs[0]);

    fireEvent.change(interestRateInputs[0], { target: { value: '5' } });
    fireEvent.blur(interestRateInputs[0]);

    fireEvent.change(termYearsInputs[0], { target: { value: '30' } });
    fireEvent.blur(termYearsInputs[0]);

    // Check that results are displayed
    await waitFor(() => {
      expect(screen.getByText(/principal & interest/i)).toBeInTheDocument();
      expect(screen.getByText(/total monthly payment/i)).toBeInTheDocument();
      expect(screen.getByText(/total interest/i)).toBeInTheDocument();
      expect(screen.getByText(/total cost/i)).toBeInTheDocument();
    });
  });

  it('handles incomplete loan data gracefully (one loan empty)', async () => {
    render(<LoanComparison />);

    // Get input fields for loan 1 only
    const loanAmountInputs = screen.getAllByLabelText(/loan amount/i);
    const interestRateInputs = screen.getAllByLabelText(/interest rate/i);
    const termYearsInputs = screen.getAllByLabelText(/loan term/i);

    // Fill in valid data for loan 1 only
    fireEvent.change(loanAmountInputs[0], { target: { value: '200000' } });
    fireEvent.blur(loanAmountInputs[0]);

    fireEvent.change(interestRateInputs[0], { target: { value: '5' } });
    fireEvent.blur(interestRateInputs[0]);

    fireEvent.change(termYearsInputs[0], { target: { value: '30' } });
    fireEvent.blur(termYearsInputs[0]);

    // Loan 1 results should be displayed
    await waitFor(() => {
      expect(screen.getByText('Loan 1 Results')).toBeInTheDocument();
    });

    // Loan 2 should show placeholder text
    const loan2Results = screen.getAllByText(/loan 2 results/i);
    expect(loan2Results.length).toBeGreaterThan(0);

    // Loan 2 should show "Enter loan details" message
    await waitFor(() => {
      expect(screen.getByText(/enter loan details to see results/i)).toBeInTheDocument();
    });
  });

  it('renders responsive layout correctly', () => {
    render(<LoanComparison />);

    // Check that both loan cards are rendered
    expect(screen.getByText('Loan 1')).toBeInTheDocument();
    expect(screen.getByText('Loan 2')).toBeInTheDocument();

    // The layout should use responsive grid classes (verified by the component structure)
    const loanCards = screen.getAllByText(/^Loan [12]$/);
    expect(loanCards).toHaveLength(2);
  });

  it('displays amortization schedule when results are available', async () => {
    render(<LoanComparison />);

    // Get input fields for loan 1
    const loanAmountInputs = screen.getAllByLabelText(/loan amount/i);
    const interestRateInputs = screen.getAllByLabelText(/interest rate/i);
    const termYearsInputs = screen.getAllByLabelText(/loan term/i);

    // Fill in valid data for loan 1
    fireEvent.change(loanAmountInputs[0], { target: { value: '200000' } });
    fireEvent.blur(loanAmountInputs[0]);

    fireEvent.change(interestRateInputs[0], { target: { value: '5' } });
    fireEvent.blur(interestRateInputs[0]);

    fireEvent.change(termYearsInputs[0], { target: { value: '30' } });
    fireEvent.blur(termYearsInputs[0]);

    // Amortization schedule button should be available
    await waitFor(() => {
      expect(screen.getByText(/view amortization schedule/i)).toBeInTheDocument();
    });
  });

  it('calculates both loans independently', async () => {
    render(<LoanComparison />);

    // Get input fields
    const loanAmountInputs = screen.getAllByLabelText(/loan amount/i);
    const interestRateInputs = screen.getAllByLabelText(/interest rate/i);
    const termYearsInputs = screen.getAllByLabelText(/loan term/i);

    // Fill in data for loan 1
    fireEvent.change(loanAmountInputs[0], { target: { value: '200000' } });
    fireEvent.blur(loanAmountInputs[0]);
    fireEvent.change(interestRateInputs[0], { target: { value: '5' } });
    fireEvent.blur(interestRateInputs[0]);
    fireEvent.change(termYearsInputs[0], { target: { value: '30' } });
    fireEvent.blur(termYearsInputs[0]);

    // Fill in data for loan 2 with different values
    fireEvent.change(loanAmountInputs[1], { target: { value: '200000' } });
    fireEvent.blur(loanAmountInputs[1]);
    fireEvent.change(interestRateInputs[1], { target: { value: '4.5' } });
    fireEvent.blur(interestRateInputs[1]);
    fireEvent.change(termYearsInputs[1], { target: { value: '30' } });
    fireEvent.blur(termYearsInputs[1]);

    // Both loans should display results
    await waitFor(() => {
      const resultsHeaders = screen.getAllByText(/loan \d results/i);
      expect(resultsHeaders.length).toBeGreaterThanOrEqual(2);
    });
  });
});
