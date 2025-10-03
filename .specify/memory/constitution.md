<!--
Sync Impact Report:
- Version change: INITIAL → 1.0.0
- New principles added:
  1. Component Architecture
  2. Server-First Pattern
  3. Type Safety
  4. Code Organization
  5. Performance & Optimization
- New sections:
  - Next.js 15 Standards
  - Development Workflow
- Templates status:
  ✅ plan-template.md: No updates needed (constitution check section is flexible)
  ✅ spec-template.md: No updates needed (implementation-agnostic)
  ✅ tasks-template.md: No updates needed (adaptable to any framework)
- Follow-up TODOs: None
-->

# test-spec Constitution

## Core Principles

### I. Component Architecture

All React components MUST follow these rules:

- Use Server Components by default; mark Client Components explicitly with `'use client'`
- Maintain single responsibility per component
- Keep components under 200 lines; extract subcomponents when exceeding
- Avoid prop drilling beyond 2 levels; use composition or context
- Components must be independently testable

**Rationale**: Server Components reduce bundle size and improve performance. Single
responsibility ensures maintainability. Composition over prop drilling prevents
coupling.

### II. Server-First Pattern

Follow Next.js 15 server-first architecture:

- Data fetching MUST happen in Server Components or Server Actions
- Use Server Actions for mutations; avoid API routes for internal operations
- Client Components MUST be limited to interactivity requirements only
- Async Server Components preferred for data loading
- Cache strategies must be explicitly defined (`force-cache`, `no-store`, revalidate)

**Rationale**: Server-first reduces JavaScript sent to client, improves initial load
time, and enables better SEO. Explicit caching prevents surprises.

### III. Type Safety (NON-NEGOTIABLE)

TypeScript strict mode enforced across entire codebase:

- No `any` types except when interfacing with untyped libraries (must document)
- All props, state, and API responses MUST have explicit types
- Use Zod or similar for runtime validation at API boundaries
- Generic types preferred over union types when representing collections
- Type errors MUST be resolved before commits

**Rationale**: Type safety catches errors at compile time, serves as documentation,
and enables confident refactoring.

### IV. Code Organization

File structure follows Next.js 15 App Router conventions:

- `src/app/` for routes, layouts, and pages only
- `src/components/` for reusable components (separate `/ui` and `/features`)
- `src/lib/` for utilities, helpers, and business logic
- `src/types/` for shared TypeScript interfaces and types
- `src/actions/` for Server Actions
- Co-locate component styles, tests, and stories in same directory

**Rationale**: Consistent structure reduces cognitive load. Co-location makes related
files easy to find. Separation of concerns prevents circular dependencies.

### V. Performance & Optimization

Performance requirements enforced:

- Images MUST use Next.js Image component with appropriate sizing
- Fonts MUST use `next/font` with subset optimization
- Dynamic imports required for components over 50KB
- Route segments must specify static/dynamic rendering intent
- Metadata generation must use Next.js Metadata API

**Rationale**: Next.js provides built-in optimizations; not using them wastes
performance gains. Explicit rendering intent prevents accidental dynamic rendering.

## Next.js 15 Standards

### Routing Conventions

- File-based routing using App Router only (no Pages Router)
- Route groups `(group)` for organization without affecting URL structure
- Parallel routes `@slot` for complex layouts
- Intercepting routes `(..)` for modals and overlays
- Error boundaries via `error.tsx` in each route segment

### Data Patterns

- Streaming with `<Suspense>` for progressive rendering
- Parallel data fetching in layouts when possible
- Request deduplication automatic for identical fetches
- Partial Prerendering (PPR) enabled when stable
- ISR with time-based or on-demand revalidation

### Configuration

- Turbopack enabled for dev and build (`--turbopack` flag)
- ESLint with `eslint-config-next` rules enforced
- Tailwind CSS 4 for styling (configured with PostCSS)
- Path aliases using `@/*` for `src/*` imports

## Development Workflow

### Quality Gates

Before each commit:

1. `npm run lint` must pass with zero errors
2. `npm run build` must succeed without type errors
3. All modified components must render without console warnings
4. New features require corresponding tests

### Code Review Standards

Pull requests must verify:

- Server/Client Component boundaries are intentional
- No unnecessary client-side JavaScript
- Type safety maintained (no new `any` types)
- Performance considerations documented for dynamic routes
- Accessibility standards met (semantic HTML, ARIA when needed)

### Testing Expectations

- Integration tests for critical user flows
- Unit tests for utility functions and business logic
- Visual regression tests for UI components (when applicable)
- E2E tests for complete feature workflows (when applicable)

## Governance

This constitution supersedes project-level practices. All code changes must align
with principles defined here.

**Amendment Process**:
1. Propose changes via documented RFC
2. Identify affected code requiring migration
3. Update version following semantic versioning
4. Update all dependent templates and documentation

**Compliance**:
- Constitution violations require explicit justification in plan.md
- Unjustified complexity must be simplified before implementation
- Regular audits ensure continued alignment

**Version**: 1.0.0 | **Ratified**: 2025-10-03 | **Last Amended**: 2025-10-03
