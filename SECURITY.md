# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Security Measures

ScholarSync implements multiple layers of security:

- **Authentication** — Supabase Auth with session-based SSR middleware
- **Authorization** — 3-tier RBAC (Admin, Teacher, Parent) enforced at UI and API levels
- **Row-Level Security** — 28 PostgreSQL RLS policies ensuring data isolation at the database level
- **Input Validation** — Zod schemas on all API endpoints
- **Security Headers** — HSTS, X-Frame-Options, CSP, and Permissions-Policy via Next.js config
- **Environment Variables** — All secrets stored in `.env.local` (never committed to git)

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public GitHub issue
2. Email the maintainers with details of the vulnerability
3. Include steps to reproduce if possible
4. Allow reasonable time for a fix before public disclosure

We take all security reports seriously and will respond promptly.
