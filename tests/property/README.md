# Property-Based Tests for Supabase Authentication

This directory contains property-based tests that validate the correctness properties of the Supabase authentication system. These tests are designed to verify universal properties that should hold true across all valid inputs and states.

## Test Files

| File                                | Properties Tested  | Description                                                                                                                    |
| ----------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `environment.property.test.ts`      | Property 8         | Validates that required environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are properly validated |
| `environment-debug.test.ts`         | Property 8         | Debug helper for CI environment variable issues                                                                                |
| `profile-creation.property.test.ts` | Property 5         | Verifies trigger-based profile auto-creation on signup                                                                         |
| `rls-policies.property.test.ts`     | Properties 2, 3, 4 | Tests RLS policies ensuring users cannot access other users' profiles or favorites                                             |
| `session-storage.property.test.ts`  | Properties 6, 7    | Validates session storage mechanisms (cookies for server-side, localStorage for client-side)                                   |

## Prerequisites

Most property tests in this directory require a running Supabase instance and the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (required for admin operations in tests)

Tests that require `SUPABASE_SERVICE_ROLE_KEY` will automatically skip with a descriptive message if the key is not set. This allows the test suite to pass in CI environments without a live Supabase instance.

## Running Tests

```bash
# Run all tests (property tests will skip if SUPABASE_SERVICE_ROLE_KEY is not set)
pnpm test

# Run only property tests
pnpm test tests/property

# Run with Supabase connection (for full integration testing)
SUPABASE_SERVICE_ROLE_KEY=your-key pnpm test tests/property
```

## Design Document Reference

These tests are derived from the correctness properties defined in the Supabase Authentication System design specification (`.kiro/specs/supabase-authentication-system/design.md`). Each test includes a comment tag referencing the specific property being validated:

```
// Feature: supabase-authentication-system, Property {number}: {property_text}
```

## Property Testing Approach

- **Environment tests** use Vitest's module reset capabilities to test env validation in isolation
- **Database tests** (RLS, profile creation) use Supabase admin client to create/delete test users
- **Session tests** validate that the correct storage mechanisms are used for each context
- All database tests clean up created users in `afterAll` hooks
