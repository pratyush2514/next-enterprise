/**
 * Unit tests for API error handler
 *
 * Tests error mapping for PostgreSQL error codes and generic errors
 */

import { afterEach, describe, expect, it, vi } from "vitest"
import { handleAPIError } from "./api-errors"

interface ErrorBody {
  error: string
}

describe("handleAPIError", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("returns 404 for PGRST116 (Row not found)", async () => {
    const response = handleAPIError({ code: "PGRST116" })
    expect(response.status).toBe(404)
    const body = (await response.json()) as ErrorBody
    expect(body.error).toBe("Resource not found")
  })

  it("returns 409 for 23505 (Unique violation)", async () => {
    const response = handleAPIError({ code: "23505" })
    expect(response.status).toBe(409)
    const body = (await response.json()) as ErrorBody
    expect(body.error).toBe("Resource already exists")
  })

  it("returns 400 for 23503 (Foreign key violation)", async () => {
    const response = handleAPIError({ code: "23503" })
    expect(response.status).toBe(400)
    const body = (await response.json()) as ErrorBody
    expect(body.error).toBe("Invalid reference")
  })

  it("returns 500 for unknown errors", async () => {
    const response = handleAPIError(new Error("Something went wrong"))
    expect(response.status).toBe(500)
  })

  it("returns generic message in production", async () => {
    vi.stubEnv("NODE_ENV", "production")
    const response = handleAPIError(new Error("Sensitive details"))
    const body = (await response.json()) as ErrorBody
    expect(body.error).toBe("Internal server error")
  })

  it("returns error message in development", async () => {
    vi.stubEnv("NODE_ENV", "development")
    const response = handleAPIError(new Error("Debug info"))
    const body = (await response.json()) as ErrorBody
    expect(body.error).toBe("Debug info")
  })

  it("handles non-Error unknown values", async () => {
    vi.stubEnv("NODE_ENV", "development")
    const response = handleAPIError("string error")
    const body = (await response.json()) as ErrorBody
    expect(body.error).toBe("Unknown error")
  })
})
