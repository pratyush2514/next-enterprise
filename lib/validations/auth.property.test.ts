import * as fc from "fast-check"
import { describe, expect, it } from "vitest"
import { emailStepSchema, loginSchema, passwordStepSchema, profileStepSchema } from "./auth"

/**
 * Generate emails that conform to Zod's .email() validator.
 * fc.emailAddress() can produce addresses with special chars that Zod rejects.
 */
const zodSafeEmail = fc
  .tuple(
    fc.stringMatching(/^[a-z][a-z0-9]{0,15}$/),
    fc.stringMatching(/^[a-z][a-z0-9]{0,10}$/),
    fc.constantFrom("com", "org", "net", "io")
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`)

describe("Auth Validation Schemas - Property Tests", () => {
  describe("emailStepSchema", () => {
    it("accepts valid email addresses", () => {
      fc.assert(
        fc.property(zodSafeEmail, (email) => {
          const result = emailStepSchema.safeParse({ email })
          expect(result.success).toBe(true)
        })
      )
    })

    it("rejects empty strings", () => {
      const result = emailStepSchema.safeParse({ email: "" })
      expect(result.success).toBe(false)
    })

    it("rejects non-email strings", () => {
      fc.assert(
        fc.property(
          fc.string().filter((s) => !s.includes("@") && s.length > 0),
          (notAnEmail) => {
            const result = emailStepSchema.safeParse({ email: notAnEmail })
            expect(result.success).toBe(false)
          }
        )
      )
    })
  })

  describe("passwordStepSchema", () => {
    it("accepts passwords meeting all criteria", () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-zA-Z]{7,20}$/).map((s) => s + "1!a"),
          (password) => {
            const result = passwordStepSchema.safeParse({ password })
            expect(result.success).toBe(true)
          }
        )
      )
    })

    it("rejects passwords shorter than 10 characters", () => {
      const result = passwordStepSchema.safeParse({ password: "aB1" })
      expect(result.success).toBe(false)
    })
  })

  describe("profileStepSchema", () => {
    it("accepts valid profile data", () => {
      const validGenders = ["male", "female", "non-binary", "other", "prefer-not-to-say"] as const
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-zA-Z ]{1,50}$/).filter((s) => s.trim().length > 0),
          fc.constantFrom(...validGenders),
          fc.date({ min: new Date("1900-01-01"), max: new Date("2010-01-01") }).filter((d) => !isNaN(d.getTime())),
          (name, gender, date) => {
            const result = profileStepSchema.safeParse({
              name,
              gender,
              dateOfBirth: date.toISOString().split("T")[0],
            })
            expect(result.success).toBe(true)
          }
        )
      )
    })

    it("rejects empty name", () => {
      const result = profileStepSchema.safeParse({
        name: "",
        gender: "other",
        dateOfBirth: "1990-01-01",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("loginSchema", () => {
    it("accepts valid login data", () => {
      fc.assert(
        fc.property(zodSafeEmail, fc.stringMatching(/^[a-zA-Z0-9]{1,50}$/), (email, password) => {
          const result = loginSchema.safeParse({ email, password })
          expect(result.success).toBe(true)
        })
      )
    })
  })
})
