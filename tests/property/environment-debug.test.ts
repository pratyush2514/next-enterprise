import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

describe("Environment Debug", () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("should show actual error message for missing NEXT_PUBLIC_SUPABASE_URL", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "valid-anon-key"
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000"

    try {
      await import("../../env.mjs")
      expect.fail("Should have thrown an error")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.log("Error message:", errorMessage)
      console.log("Includes NEXT_PUBLIC_SUPABASE_URL:", errorMessage.includes("NEXT_PUBLIC_SUPABASE_URL"))
      console.log("Includes SUPABASE_URL:", errorMessage.includes("SUPABASE_URL"))

      // Check if error is ZodError
      if (error && typeof error === "object" && "issues" in error) {
        console.log("Zod issues:", JSON.stringify((error as any).issues, null, 2)) // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    }
  })

  it("should show actual error for specific case", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test-project.supabase.co"
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test"
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000"

    try {
      const { env } = await import("../../env.mjs")
      console.log("Success! Loaded env:", {
        url: env.NEXT_PUBLIC_SUPABASE_URL,
        key: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        app: env.NEXT_PUBLIC_APP_URL,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.log("Error:", errorMessage)
      expect.fail(`Should not have thrown: ${errorMessage}`)
    }
  })
})
