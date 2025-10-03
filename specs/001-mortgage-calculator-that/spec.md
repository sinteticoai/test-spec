# Feature Specification: Mortgage Calculator with Loan Comparison

**Feature Branch**: `001-mortgage-calculator-that`
**Created**: 2025-10-03
**Status**: Draft
**Input**: User description: "mortgage Calculator that allows me to compare two loans."

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identified: calculator, mortgage loans, comparison, two loans
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → User flow: input loan details, view comparison results
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (data involved: loan details)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## Clarifications

### Session 2025-10-03
- Q: What are the acceptable value ranges for loan inputs? → A: Broad range: $1K–$10M principal, 0.01%–20% interest, 1–50 years term
- Q: Should calculations update on every keystroke or when user leaves a field? → A: When user leaves field (on blur)
- Q: Should the calculator support additional costs like property taxes, insurance, HOA fees, or PMI? → A: Yes, support all additional costs (taxes, insurance, HOA, PMI)
- Q: Should the calculator show an amortization schedule or just summary totals? → A: Summary + collapsible/optional amortization schedule
- Q: Should there be any user authentication or can anyone access the calculator anonymously? → A: Anonymous access only (no authentication required)

---

## User Scenarios & Testing

### Primary User Story
A homebuyer or homeowner wants to compare two different mortgage loan options to determine which offers better terms. They need to input the details of each loan (principal, interest rate, loan term, and optionally property taxes, insurance, HOA fees, and PMI) and see a clear comparison of monthly payments (both principal+interest and total with additional costs), total interest paid, and total cost over the life of each loan.

### Acceptance Scenarios
1. **Given** I have details for two mortgage loans, **When** I enter the principal amount, interest rate, and loan term for both loans, **Then** I see calculated monthly payment, total interest, and total cost for each loan side by side with option to view detailed amortization schedule
2. **Given** I have entered valid loan details, **When** I modify any input field and leave the field, **Then** the calculations update automatically to reflect the new values
3. **Given** I enter invalid data (negative numbers, non-numeric values, or zero term length), **When** I attempt to view results, **Then** I see clear error messages indicating what needs to be corrected
4. **Given** I have entered loan details in different formats (e.g., interest rate as 5 vs 5% vs 0.05), **When** the system processes my input, **Then** it correctly interprets and normalizes the values for calculation

### Edge Cases
- Interest rates below 0.01% must be rejected with validation error
- One loan field incomplete while other is fully filled: allow independent calculation, show results only for complete loan
- Loan amounts at upper boundary ($10M): must calculate accurately without precision loss
- Loan terms at upper boundary (50 years): must calculate accurately across 600 payment periods
- What precision is used for currency display (cents vs. whole dollars)?

## Requirements

### Functional Requirements
- **FR-001**: System MUST allow users to input loan details for two separate mortgages
- **FR-002**: System MUST accept the following inputs for each loan: principal amount, annual interest rate, loan term in years, and optional additional costs (annual property taxes, annual homeowners insurance, monthly HOA fees, monthly PMI)
- **FR-003**: System MUST calculate and display monthly payment amount for each loan
- **FR-004**: System MUST calculate and display total interest paid over the life of each loan
- **FR-005**: System MUST calculate and display total amount paid over the life of each loan
- **FR-006**: System MUST present both loans side by side for easy comparison
- **FR-007**: System MUST validate input values: principal amount between $1,000 and $10,000,000, annual interest rate between 0.01% and 20%, and loan term between 1 and 50 years
- **FR-008**: System MUST provide clear error messages when invalid data is entered
- **FR-009**: System MUST update calculations automatically when user leaves an input field (on blur event)
- **FR-010**: System MUST include additional costs (property taxes, insurance, HOA, PMI) in the total monthly payment calculation when provided
- **FR-016**: System MUST clearly separate and display the breakdown: principal + interest payment vs. total monthly payment including additional costs
- **FR-011**: System MUST [NEEDS CLARIFICATION: Should users be able to save or export comparison results?]
- **FR-012**: System MUST display summary totals by default (monthly payment, total interest, total cost) with an option to view a detailed amortization schedule
- **FR-017**: System MUST generate amortization schedule showing payment number, payment date, principal paid, interest paid, remaining balance for each payment period when requested by user
- **FR-013**: System MUST [NEEDS CLARIFICATION: Should users be able to compare different loan types (fixed vs. ARM, 30-year vs. 15-year), or is this purely for comparing terms?]
- **FR-014**: System MUST [NEEDS CLARIFICATION: What currency should be supported - USD only or multi-currency?]
- **FR-015**: System MUST allow anonymous access without requiring user authentication or account creation

### Key Entities
- **Loan**: Represents a mortgage loan with principal amount, annual interest rate, loan term in years, optional additional costs (annual property taxes, annual insurance, monthly HOA, monthly PMI), calculated principal+interest payment, total monthly payment, total interest, and total cost
- **Comparison**: Represents the side-by-side view of two loans showing their respective calculations and differences

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [x] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed (pending clarifications)

---
