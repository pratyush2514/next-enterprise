import { z } from "zod"

// ── Login ────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
  password: z.string().min(1, "passwordRequired"),
})

export type LoginFormData = z.infer<typeof loginSchema>

// ── Signup step schemas (for per-step trigger()) ─────────────────────
export const emailStepSchema = z.object({
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
})

export const passwordStepSchema = z.object({
  password: z
    .string()
    .min(10, "passwordMinLength")
    .regex(/[a-zA-Z]/, "passwordLetter")
    .regex(/[0-9!@#$%^&*()]/, "passwordNumberOrSpecial"),
})

export const profileStepSchema = z.object({
  name: z.string().min(1, "nameRequired"),
  gender: z.enum(["male", "female", "non-binary", "other", "prefer-not-to-say"], {
    required_error: "genderRequired",
  }),
  dateOfBirth: z.string().min(1, "dobRequired"),
})

// ── Combined signup schema ───────────────────────────────────────────
export const signupSchema = emailStepSchema.merge(passwordStepSchema).merge(profileStepSchema)

export type SignupFormData = z.infer<typeof signupSchema>
