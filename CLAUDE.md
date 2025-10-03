# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.5.4 project using React 19, TypeScript, and Tailwind CSS 4. It uses Turbopack for faster builds and development.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

The dev server runs on http://localhost:3000 by default.

## Architecture

**Framework**: Next.js 15 with App Router architecture (src/app directory)

**Key Directories**:
- `src/app/` - App Router pages and layouts
  - `layout.tsx` - Root layout with Geist font configuration
  - `page.tsx` - Home page component
  - `globals.css` - Global Tailwind styles

**TypeScript Configuration**:
- Path alias: `@/*` maps to `./src/*`
- Target: ES2017
- Module resolution: bundler
- Strict mode enabled

**Styling**: Tailwind CSS 4 with PostCSS integration

**ESLint**: Configured with Next.js core-web-vitals and TypeScript presets
