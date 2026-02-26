import type { SupabaseClient } from "@supabase/supabase-js"
import * as fc from "fast-check"
import { describe, expect, it, vi } from "vitest"
import { AuthService } from "./auth"
import type { SignUpParams } from "./auth"

/**
 * Property-based tests for AuthService
 *
 * Uses fast-check to generate random inputs and verify invariants.
 */

function createMockSupabase() {
  const mock = {
    auth: {
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: "user-123" } }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: "user-123" }, session: {} }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-123" } }, error: null }),
      resend: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: {} }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-123" } }, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://example.com/avatar.jpg" } }),
      })),
    },
  }
  return mock as typeof mock & SupabaseClient
}

describe("AuthService - Property Tests", () => {
  describe("signUp", () => {
    it("always calls supabase.auth.signUp with the provided email", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 10, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc
            .integer({ min: 1950, max: 2005 })
            .chain((year) =>
              fc
                .tuple(fc.integer({ min: 1, max: 12 }), fc.integer({ min: 1, max: 28 }))
                .map(([month, day]) => `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`)
            ),
          fc.constantFrom("male", "female", "non-binary", "other", "prefer-not-to-say"),
          async (email, password, fullName, dob, gender) => {
            const supabase = createMockSupabase()
            const service = new AuthService(supabase)
            const params: SignUpParams = {
              email,
              password,
              fullName,
              dateOfBirth: dob,
              gender,
            }

            await service.signUp(params)

            const signUpMock = supabase.auth.signUp as ReturnType<typeof vi.fn>
            expect(signUpMock).toHaveBeenCalledWith(expect.objectContaining({ email }))
          }
        ),
        { numRuns: 20 }
      )
    })
  })

  describe("signIn", () => {
    it("always passes email and password to signInWithPassword", async () => {
      await fc.assert(
        fc.asyncProperty(fc.emailAddress(), fc.string({ minLength: 1, maxLength: 100 }), async (email, password) => {
          const supabase = createMockSupabase()
          const service = new AuthService(supabase)

          await service.signIn({ email, password })

          const signInMock = supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>
          expect(signInMock).toHaveBeenCalledWith({ email, password })
        }),
        { numRuns: 20 }
      )
    })
  })

  describe("resetPasswordForEmail", () => {
    it("always passes the email to resetPasswordForEmail", async () => {
      await fc.assert(
        fc.asyncProperty(fc.emailAddress(), async (email) => {
          const supabase = createMockSupabase()
          const service = new AuthService(supabase)

          await service.resetPasswordForEmail(email)

          const resetMock = supabase.auth.resetPasswordForEmail as ReturnType<typeof vi.fn>
          expect(resetMock).toHaveBeenCalledWith(email, expect.objectContaining({ redirectTo: expect.any(String) }))
        }),
        { numRuns: 20 }
      )
    })
  })
})
