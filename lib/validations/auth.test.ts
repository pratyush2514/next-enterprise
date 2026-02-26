import { describe, expect, it } from "vitest"
import { emailStepSchema, loginSchema, passwordStepSchema, profileStepSchema, signupSchema } from "./auth"

describe("Auth Validation Schemas", () => {
  describe("loginSchema", () => {
    it("accepts valid login data", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "password123",
      })
      expect(result.success).toBe(true)
    })

    it("rejects empty email", () => {
      const result = loginSchema.safeParse({
        email: "",
        password: "password123",
      })
      expect(result.success).toBe(false)
    })

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      })
      expect(result.success).toBe(false)
    })

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("emailStepSchema", () => {
    it("accepts valid email", () => {
      const result = emailStepSchema.safeParse({ email: "test@example.com" })
      expect(result.success).toBe(true)
    })

    it("rejects empty email", () => {
      const result = emailStepSchema.safeParse({ email: "" })
      expect(result.success).toBe(false)
    })

    it("rejects invalid email format", () => {
      const result = emailStepSchema.safeParse({ email: "invalid" })
      expect(result.success).toBe(false)
    })
  })

  describe("passwordStepSchema", () => {
    it("accepts valid password with letter and number", () => {
      const result = passwordStepSchema.safeParse({ password: "MyPassword1" })
      expect(result.success).toBe(true)
    })

    it("accepts valid password with letter and special char", () => {
      const result = passwordStepSchema.safeParse({ password: "MyPassword!" })
      expect(result.success).toBe(true)
    })

    it("rejects password shorter than 10 characters", () => {
      const result = passwordStepSchema.safeParse({ password: "Short1!" })
      expect(result.success).toBe(false)
    })

    it("rejects password without letters", () => {
      const result = passwordStepSchema.safeParse({ password: "1234567890!" })
      expect(result.success).toBe(false)
    })

    it("rejects password without number or special char", () => {
      const result = passwordStepSchema.safeParse({ password: "OnlyLettersHere" })
      expect(result.success).toBe(false)
    })
  })

  describe("profileStepSchema", () => {
    it("accepts valid profile data", () => {
      const result = profileStepSchema.safeParse({
        name: "John Doe",
        gender: "male",
        dateOfBirth: "1990-01-01",
      })
      expect(result.success).toBe(true)
    })

    it("rejects empty name", () => {
      const result = profileStepSchema.safeParse({
        name: "",
        gender: "male",
        dateOfBirth: "1990-01-01",
      })
      expect(result.success).toBe(false)
    })

    it("rejects invalid gender", () => {
      const result = profileStepSchema.safeParse({
        name: "John",
        gender: "invalid",
        dateOfBirth: "1990-01-01",
      })
      expect(result.success).toBe(false)
    })

    it("rejects empty date of birth", () => {
      const result = profileStepSchema.safeParse({
        name: "John",
        gender: "male",
        dateOfBirth: "",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("signupSchema", () => {
    it("accepts valid complete signup data", () => {
      const result = signupSchema.safeParse({
        email: "test@example.com",
        password: "SecurePass1!",
        name: "Test User",
        gender: "non-binary",
        dateOfBirth: "1995-06-15",
      })
      expect(result.success).toBe(true)
    })

    it("rejects incomplete signup data", () => {
      const result = signupSchema.safeParse({
        email: "test@example.com",
        password: "SecurePass1!",
      })
      expect(result.success).toBe(false)
    })
  })
})
