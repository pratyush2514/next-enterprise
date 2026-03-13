export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = "AuthError"
  }
}

export class ValidationError extends AuthError {
  constructor(
    message: string,
    public fields: Record<string, string>
  ) {
    super(message, "VALIDATION_ERROR", 400)
    this.name = "ValidationError"
  }
}

export class NetworkError extends AuthError {
  constructor(message: string) {
    super(message, "NETWORK_ERROR", 0)
    this.name = "NetworkError"
  }
}

export function handleAuthError(error: unknown, t: (key: string) => string): string {
  // Network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return t("errors.networkError")
  }

  // Supabase auth errors
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: string }).message

    if (message.includes("Invalid login credentials")) {
      return t("errors.invalidCredentials")
    }
    if (message.includes("Email not confirmed")) {
      return t("errors.emailNotConfirmed")
    }
    if (message.includes("User already registered")) {
      return t("errors.emailExists")
    }
    if (message.includes("Invalid token")) {
      return t("errors.invalidToken")
    }
    if (message.includes("Token expired")) {
      return t("errors.tokenExpired")
    }
  }

  // Generic error
  return t("errors.generic")
}
