import { useMemo } from "react"

import { PASSWORD_RULES } from "components/Auth/constants"

export type PasswordCheck = {
  key: "letter" | "numberOrSpecial" | "minLength"
  passed: boolean
}

export function usePasswordStrength(password: string) {
  const checks: PasswordCheck[] = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ key: rule.key, passed: rule.test(password) })),
    [password]
  )

  const allPassed = checks.every((c) => c.passed)

  return { checks, allPassed }
}
