# Research: Mortgage Calculator Implementation

## Overview
Research findings for implementing a mortgage loan comparison calculator using Next.js 15, shadcn/ui, and Lucide React icons.

---

## 1. Mortgage Calculation Algorithms

### Decision: Standard Fixed-Rate Mortgage Formula
Use the standard amortization formula for fixed-rate mortgages:

**Monthly Payment (P&I only)**:
```
M = P × [r(1 + r)^n] / [(1 + r)^n - 1]

Where:
M = Monthly payment
P = Principal loan amount
r = Monthly interest rate (annual rate / 12 / 100)
n = Number of payments (years × 12)
```

**Total Monthly Payment**:
```
Total = M + (annual_property_tax / 12) + (annual_insurance / 12) + monthly_HOA + monthly_PMI
```

**Amortization Schedule**:
For each payment period i (1 to n):
- Interest paid = Remaining balance × monthly rate
- Principal paid = Monthly payment - Interest paid
- New balance = Previous balance - Principal paid

### Rationale
- Industry-standard formula used by financial institutions
- Handles edge cases (0% interest rate → simple division)
- Accurate for terms up to 50 years (600 payments)
- JavaScript Number precision sufficient for currency (avoid floating-point issues with rounding)

### Alternatives Considered
- **BigInt/Decimal libraries**: Rejected - overkill for 2-decimal precision, adds bundle size
- **Server-side calculation**: Rejected - no backend per spec, client-side sufficient for responsiveness

---

## 2. Input Validation Strategy

### Decision: Zod Schema with Real-Time Validation
Implement validation using Zod schemas triggered on blur events.

**Validation Rules** (from FR-007):
```typescript
LoanInputSchema = {
  principal: z.number().min(1000).max(10_000_000),
  interestRate: z.number().min(0.01).max(20),
  termYears: z.number().int().min(1).max(50),
  propertyTax: z.number().min(0).optional(),
  insurance: z.number().min(0).optional(),
  hoaFees: z.number().min(0).optional(),
  pmi: z.number().min(0).optional()
}
```

**Input Normalization**:
- Accept "5", "5%", "0.05" for interest rate → normalize to 5
- Display errors inline below each field
- Disable calculation until both loans have valid core inputs (principal, rate, term)

### Rationale
- Zod provides type-safe runtime validation
- Blur event (FR-009) reduces validation noise during typing
- Optional fields allow progressive disclosure (users can skip additional costs)

### Alternatives Considered
- **React Hook Form + Yup**: Rejected - Zod better TypeScript integration
- **Native HTML5 validation**: Rejected - insufficient for complex range rules

---

## 3. shadcn/ui Component Selection

### Decision: Use These shadcn Components
Install via CLI: `npx shadcn-ui@latest add [component]`

**Required Components**:
- `card` - Container for each loan input/results
- `input` - Number inputs with validation states
- `label` - Accessible form labels
- `button` - Actions (calculate, toggle schedule)
- `collapsible` - Amortization schedule expansion (FR-012)
- `separator` - Visual dividers between sections
- `alert` - Validation error messages

**Icons** (Lucide React):
- `Calculator` - Page header
- `DollarSign` - Currency inputs
- `Percent` - Interest rate
- `Calendar` - Loan term
- `ChevronDown` / `ChevronUp` - Collapsible toggle
- `AlertCircle` - Error states

### Rationale
- shadcn components are unstyled primitives (full Tailwind control)
- Accessible by default (ARIA attributes)
- Tree-shakeable (only import what's used)
- Lucide icons match shadcn design language

### Alternatives Considered
- **Material-UI**: Rejected - opinionated styling, larger bundle
- **Headless UI**: Rejected - shadcn preferred per project spec

---

## 4. Responsive Layout Strategy

### Decision: Mobile-First Grid Layout
**Breakpoints** (Tailwind defaults):
- Mobile (<640px): Single column, stacked loans
- Tablet (640-1024px): Two columns, side-by-side loans
- Desktop (>1024px): Two columns with wider spacing

**Layout Pattern**:
```
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <LoanInputForm loan={1} />
  <LoanInputForm loan={2} />
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <LoanResults loan={1} />
  <LoanResults loan={2} />
</div>
```

### Rationale
- CSS Grid simplifies side-by-side comparison on larger screens
- Mobile stacking prioritizes readability
- Tailwind's responsive prefixes reduce custom CSS

### Alternatives Considered
- **Flexbox**: Rejected - Grid better for 2D layout
- **CSS Container Queries**: Rejected - not needed for simple 2-column

---

## 5. State Management Approach

### Decision: React useState (Client Component)
Centralize state in a parent Client Component:

```typescript
const [loan1, setLoan1] = useState<LoanInputs>({ ... })
const [loan2, setLoan2] = useState<LoanInputs>({ ... })
const [results1, setResults1] = useState<LoanResults | null>(null)
const [results2, setResults2] = useState<LoanResults | null>(null)
```

Calculate on blur → update results state.

### Rationale
- Simple feature doesn't need Zustand/Redux
- Client-only state (no persistence requirement)
- Props drilling minimal (flat component structure)

### Alternatives Considered
- **Context API**: Rejected - overkill for 4 state variables
- **URL state**: Rejected - no sharing/bookmarking requirement

---

## 6. Calculation Precision Handling

### Decision: Round to 2 Decimals at Display Time
- Perform calculations with full JavaScript Number precision
- Round to 2 decimals only when displaying currency
- Use `Intl.NumberFormat` for locale-aware formatting:

```typescript
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
```

### Rationale
- Avoids cumulative rounding errors in amortization schedule
- Locale-aware formatting improves UX
- USD-only per scope (FR-014 deferred)

### Alternatives Considered
- **Round at each calculation step**: Rejected - introduces error accumulation
- **Decimal.js library**: Rejected - unnecessary for 2-decimal precision

---

## 7. Amortization Schedule Performance

### Decision: Virtualization Not Required
Generate full amortization array (up to 600 entries for 50-year loan) but:
- Render as HTML table with CSS `overflow-y: auto`
- Max height constraint (e.g., 400px)
- Native scroll performance sufficient

### Rationale
- 600 rows × 5 columns = 3000 DOM nodes (manageable)
- Virtualization libraries (react-window) add complexity
- Collapsible by default (FR-012) reduces initial render cost

### Alternatives Considered
- **react-window**: Rejected - premature optimization
- **Pagination**: Rejected - users expect full schedule scroll

---

## 8. Testing Strategy

### Decision: Three Testing Layers

**Unit Tests** (Jest):
- `mortgage-calculator.ts` functions
- Test cases: standard loan, 0% interest, boundary values (50 years, $10M)

**Component Tests** (React Testing Library):
- `LoanInputForm`: validation, blur events
- `LoanComparison`: renders results correctly

**Integration Tests** (optional):
- Full user flow: input → blur → view results → expand schedule

### Rationale
- Unit tests catch calculation errors
- Component tests verify UI behavior
- Integration tests validate acceptance scenarios

### Alternatives Considered
- **E2E (Playwright)**: Deferred - overkill for single-page calculator

---

## 9. Accessibility Requirements

### Decision: WCAG 2.1 AA Compliance
- Semantic HTML: `<form>`, `<label>`, `<button>`
- ARIA labels for icons-only buttons
- Keyboard navigation: Tab order, Enter to submit
- Error announcements: `aria-live="polite"` for validation errors
- Focus management: Error fields get focus on validation failure

### Rationale
- Constitutional requirement (Code Review Standards)
- shadcn components provide baseline accessibility

### Alternatives Considered
- **WCAG AAA**: Deferred - AA sufficient for MVP

---

## 10. Edge Case Handling

### Decision: Graceful Degradation

**0% Interest Rate**:
- Formula becomes: M = P / n (simple division)
- Special case in calculation function

**Incomplete Loan Data**:
- Calculate only complete loan (FR: allow independent calculation)
- Show "Enter loan details" placeholder for incomplete side

**Boundary Values**:
- Test $10M principal, 50-year term in unit tests
- Ensure no precision loss (use test fixtures)

### Rationale
- Matches edge case requirements from spec
- Prevents division by zero errors
- Maintains UX when only one loan entered

---

## Summary of Decisions

| Aspect | Decision | Key Rationale |
|--------|----------|---------------|
| Calculation | Standard amortization formula | Industry standard, accurate |
| Validation | Zod schemas on blur | Type-safe, user-friendly |
| UI Components | shadcn/ui + Lucide icons | Per spec, accessible, customizable |
| Layout | CSS Grid, mobile-first | Responsive, simple |
| State | React useState | Sufficient for scope |
| Precision | Round at display (2 decimals) | Avoids error accumulation |
| Amortization | Full array, native scroll | Performance acceptable |
| Testing | Unit + Component tests | Matches constitutional requirements |
| Accessibility | WCAG 2.1 AA | Constitutional compliance |
| Edge Cases | Special handling + tests | Matches spec requirements |

---

**Status**: All Technical Context unknowns resolved. Ready for Phase 1 design.
