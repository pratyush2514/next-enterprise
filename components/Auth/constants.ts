export const AUTH_ROUTES = {
  LOGIN: "/login",
  SIGNUP: "/signup",
  SONG: "/song",
} as const

export const SPRING_CONFIG = {
  stiffness: 80,
  damping: 20,
} as const

export const STEP_TRANSITION = {
  type: "spring" as const,
  stiffness: 80,
  damping: 20,
}

export const SIGNUP_STEPS = ["email", "password", "profile"] as const
export type SignupStep = (typeof SIGNUP_STEPS)[number]

export const PASSWORD_RULES = [
  { key: "letter" as const, test: (pw: string) => /[a-zA-Z]/.test(pw) },
  { key: "numberOrSpecial" as const, test: (pw: string) => /[0-9!@#$%^&*()]/.test(pw) },
  { key: "minLength" as const, test: (pw: string) => pw.length >= 10 },
] as const
