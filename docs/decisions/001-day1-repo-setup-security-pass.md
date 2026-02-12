# ADR-001: Day 1 Repo Setup, Security Pass, and Tooling Standardization

## Status

Accepted

## Date

2026-02-11

## Context

The next-enterprise boilerplate was adopted as the foundation for a new project. A comprehensive Day 1 audit using AI-assisted code review (Claude Opus 4.6) identified 15+ issues spanning security vulnerabilities, dead dependencies, type safety gaps, tooling gaps, CI/CD drift, and configuration errors.

### Baseline Audit Results

**Before (pnpm audit):**

- 45 vulnerabilities: 4 critical, 13 high, 19 moderate, 9 low
- Key CVEs: React Server Components DoS, Next.js Image Optimization cache confusion/SSRF, Storybook env variable exposure, Playwright SSL cert verification bypass, axios SSRF/DoS, pbkdf2 cryptographic failures

## Findings and Resolutioned

#

### Security / Dependencies

| #   | Issue                                                                          | Severity      | Resolution           |
| --- | ------------------------------------------------------------------------------ | ------------- | -------------------- |
| 1   | `lodash ^4.17.21` unused (zero imports)                                        | Medium        | Removed              |
| 2   | `@radix-ui/react-form v0.0.3` experimental, unused                             | Medium        | Removed              |
| 3   | `tsc v2.0.4` (NOT TypeScript compiler), unmaintained                           | Medium        | Removed              |
| 4   | `eslint-config-next 15.1.6` unused (flat config uses plugin directly)          | Low           | Removed              |
| 5   | `next 15.3.8` with 4 CVEs (RSC DoS, Image Optimization, SSRF, cache confusion) | High          | Updated to 15.5.12   |
| 6   | `storybook 8.6.12` env variable exposure                                       | High          | Updated to 8.6.15    |
| 7   | `@playwright/test 1.52.0` SSL cert bypass                                      | High          | Updated to 1.58.2    |
| 8   | `webpack 5.94.0` pinned, 2 SSRF vulns                                          | Low           | Updated to ^5.105.1  |
| 9   | `@next/eslint-plugin-next 15.1.6` version mismatch                             | Medium        | Updated to ^15.5.12  |
| 10  | `prettier 3.0.3` pinned without caret                                          | Low           | Updated to ^3.8.1    |
| 11  | Transitive vulnerabilities (pbkdf2, sha.js, form-data, axios, qs, etc.)        | Critical/High | Added pnpm overrides |

**After (pnpm audit):**

- 8 vulnerabilities: 0 critical, 0 high, 1 moderate (vite Windows-only), 7 low
- All critical and high vulnerabilities resolved

### Code Quality

| #   | Issue                                                                       | Resolution                                           |
| --- | --------------------------------------------------------------------------- | ---------------------------------------------------- |
| 12  | `ButtonProps extends ButtonHTMLAttributes<HTMLAnchorElement>` type mismatch | Changed to `AnchorHTMLAttributes<HTMLAnchorElement>` |
| 13  | Storybook `argTypesRegex` deprecated in v8                                  | Removed; actions auto-detected by addon              |
| 14  | `.releaserc` invalid JSON (unquoted key, trailing commas)                   | Fixed to valid JSON                                  |
| 15  | No `.env.example` for team onboarding                                       | Created with documented variables                    |

### Tooling

| #   | Issue                                                | Resolution                                                   |
| --- | ---------------------------------------------------- | ------------------------------------------------------------ |
| 16  | No Husky / lint-staged                               | Installed; pre-commit runs prettier + eslint on staged files |
| 17  | `.pre-commit-config.yaml` (Python-based) coexistence | Kept for backward compatibility; Husky is primary            |
| 18  | `next lint` deprecated in Next.js 15.5               | Migrated lint script to `eslint .` directly                  |
| 19  | `next build` runs deprecated internal linter         | Set `eslint.ignoreDuringBuilds: true`; lint runs separately  |
| 20  | Missing `eslint-import-resolver-typescript`          | Installed for proper module resolution                       |

### CI/CD

| #   | Issue                                                 | Resolution    |
| --- | ----------------------------------------------------- | ------------- |
| 21  | `actions/setup-node@v3` deprecated across 3 workflows | Updated to v4 |
| 22  | `actions/cache@v3` in bundle analysis                 | Updated to v4 |
| 23  | `actions/github-script@v6`                            | Updated to v7 |
| 24  | `peter-evans/find-comment@v2`                         | Updated to v3 |
| 25  | `peter-evans/create-or-update-comment@v3`             | Updated to v4 |

## Key Tradeoffs

### Husky vs. pre-commit-config

We added Husky as the primary pre-commit mechanism since the project is Node.js-based and Husky integrates natively via the `prepare` lifecycle script. The existing `.pre-commit-config.yaml` was retained for teams that already have the Python `pre-commit` tool installed. Both can coexist without conflict.

### eslint-config-next removal

The project already migrated to ESLint flat config (`eslint.config.mjs`) which imports `@next/eslint-plugin-next` directly. `eslint-config-next` provided the legacy `.eslintrc`-style configuration. Removing it reduces the dependency surface with no functional change.

### next lint -> eslint .

Next.js 15.5 deprecates the `next lint` command. The migration to running `eslint .` directly provides identical behavior and is forward-compatible with Next.js 16. The `eslint.ignoreDuringBuilds` flag prevents `next build` from running the deprecated internal linter, since lint is enforced separately in both the pre-commit hook and CI pipeline.

### commitlint not added

We considered adding `@commitlint/cli` for the commit-msg hook but decided against it to minimize new dependencies. Conventional commit enforcement remains available via the existing `git-conventional-commits.yaml` configuration and can be enforced through CI.

### Button type fix scope

The existing Button component renders an `<a>` tag but declared `ButtonHTMLAttributes`. Rather than refactoring to a polymorphic component (which would be a larger scope change), we corrected the type interface to match the actual rendered element. A future ADR should evaluate whether to support both `<a>` and `<button>` rendering via an `as` prop.

### Remaining vulnerabilities

8 vulnerabilities remain (7 low, 1 moderate). The moderate one (`vite` server.fs.deny bypass) is Windows-only and only affects the dev server. The low ones are in transitive dev dependencies (brace-expansion, @eslint/plugin-kit, elliptic, tmp) with no practical exploit path in this project.

## Consequences

- `pnpm audit` reports 0 critical, 0 high vulnerabilities (down from 4 critical, 13 high)
- All local quality gates (lint, format, test, build) pass
- Pre-commit hooks via Husky ensure code quality on every commit
- CI pipelines use current action versions (no deprecation warnings)
- Type safety improved for Button component consumers
- Established `/docs/decisions/` directory for future ADRs
