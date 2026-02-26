import type { AuthError, Session, SupabaseClient, User } from "@supabase/supabase-js"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthService } from "./auth"
import type { SignInParams, SignUpParams } from "./auth"

/**
 * Unit tests for AuthService
 *
 * Tests authentication service methods with mocked Supabase client.
 * Requirements: 4.1, 4.3, 6.1, 6.4, 10.2, 11.2, 12.1
 */

const mockUser: Partial<User> = {
  id: "user-123",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: { full_name: "Test User" },
  aud: "authenticated",
  created_at: "2024-01-01T00:00:00Z",
}

const mockSession: Partial<Session> = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_in: 3600,
  token_type: "bearer",
  user: mockUser as User,
}

function createMockSupabase() {
  return {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      resend: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
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
  } as unknown as SupabaseClient
}

describe("AuthService", () => {
  let supabase: SupabaseClient
  let authService: AuthService

  beforeEach(() => {
    supabase = createMockSupabase()
    authService = new AuthService(supabase)
  })

  describe("signUp", () => {
    it("calls supabase.auth.signUp with correct params", async () => {
      const mockAuth = supabase.auth as unknown as { signUp: ReturnType<typeof vi.fn> }
      mockAuth.signUp.mockResolvedValue({ data: { user: mockUser }, error: null })

      const params: SignUpParams = {
        email: "test@example.com",
        password: "SecurePassword1!",
        fullName: "Test User",
        dateOfBirth: "1990-01-01",
        gender: "other",
      }

      const result = await authService.signUp(params)

      expect(mockAuth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: params.email,
          password: params.password,
        })
      )
      expect(result.data).toEqual(mockUser)
      expect(result.error).toBeNull()
    })

    it("returns error when signup fails", async () => {
      const mockError = { message: "User already registered" } as AuthError
      const mockAuth = supabase.auth as unknown as { signUp: ReturnType<typeof vi.fn> }
      mockAuth.signUp.mockResolvedValue({ data: { user: null }, error: mockError })

      const params: SignUpParams = {
        email: "test@example.com",
        password: "SecurePassword1!",
        fullName: "Test User",
        dateOfBirth: "1990-01-01",
        gender: "other",
      }

      const result = await authService.signUp(params)
      expect(result.error).toEqual(mockError)
    })
  })

  describe("signIn", () => {
    it("calls supabase.auth.signInWithPassword with correct params", async () => {
      const mockAuth = supabase.auth as unknown as { signInWithPassword: ReturnType<typeof vi.fn> }
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      const params: SignInParams = { email: "test@example.com", password: "SecurePassword1!" }
      const result = await authService.signIn(params)

      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: params.email,
        password: params.password,
      })
      expect(result.error).toBeNull()
    })
  })

  describe("signOut", () => {
    it("calls supabase.auth.signOut", async () => {
      const mockAuth = supabase.auth as unknown as { signOut: ReturnType<typeof vi.fn> }
      mockAuth.signOut.mockResolvedValue({ error: null })

      const result = await authService.signOut()
      expect(mockAuth.signOut).toHaveBeenCalled()
      expect(result.error).toBeNull()
    })
  })

  describe("resetPasswordForEmail", () => {
    it("calls supabase.auth.resetPasswordForEmail with correct email", async () => {
      const mockAuth = supabase.auth as unknown as { resetPasswordForEmail: ReturnType<typeof vi.fn> }
      mockAuth.resetPasswordForEmail.mockResolvedValue({ error: null })

      const result = await authService.resetPasswordForEmail("test@example.com")
      expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        "test@example.com",
        expect.objectContaining({ redirectTo: expect.any(String) })
      )
      expect(result.error).toBeNull()
    })
  })

  describe("getSession", () => {
    it("returns current session", async () => {
      const mockAuth = supabase.auth as unknown as { getSession: ReturnType<typeof vi.fn> }
      mockAuth.getSession.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      const result = await authService.getSession()
      expect(result.error).toBeNull()
    })
  })

  describe("getUser", () => {
    it("returns current user", async () => {
      const mockAuth = supabase.auth as unknown as { getUser: ReturnType<typeof vi.fn> }
      mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      const result = await authService.getUser()
      expect(result.data).toEqual(mockUser)
      expect(result.error).toBeNull()
    })
  })
})
