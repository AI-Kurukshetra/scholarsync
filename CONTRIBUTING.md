# Contributing to ScholarSync

Thank you for your interest in contributing to ScholarSync! This guide will help you get started.

## Development Setup

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install`
3. **Set up environment**: Copy `.env.example` to `.env.local` and fill in your credentials
4. **Run the dev server**: `npm run dev`

## Code Standards

- **TypeScript** — Strict mode is enabled. All new code must be fully typed.
- **ESLint** — Run `npm run lint` before committing. All warnings must be resolved.
- **Formatting** — We use consistent Tailwind class ordering and standard TypeScript conventions.

## Testing

- **Unit tests**: Write Jest tests for new components in `src/__tests__/`
- **E2E tests**: Write Playwright tests for new user flows in `e2e/`
- Run all tests before submitting a PR:
  ```bash
  npm test          # Unit tests
  npm run test:e2e  # E2E tests
  ```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear, descriptive commits
3. Ensure all tests pass and linting is clean
4. Open a PR with a clear description of what and why

## Project Structure

- `src/app/(dashboard)/` — Dashboard pages (one folder per module)
- `src/app/api/` — API routes
- `src/components/ui/` — Reusable shadcn/ui components
- `src/components/shared/` — Layout and shared components
- `src/lib/` — Utilities, auth, database, i18n
- `supabase/` — Database schema and migrations

## Branch Naming

- `feat/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation updates
