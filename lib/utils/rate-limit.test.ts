import { beforeEach, describe, expect, it, vi } from "vitest"
import { rateLimit } from "./rate-limit"

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it("allows requests under the limit", async () => {
    const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 500 })
    await expect(limiter.check(5, "test-token")).resolves.toBeUndefined()
  })

  it("allows multiple requests up to the limit", async () => {
    const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 500 })

    for (let i = 0; i < 5; i++) {
      await expect(limiter.check(5, "test-token")).resolves.toBeUndefined()
    }
  })

  it("rejects requests over the limit", async () => {
    const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 500 })

    // Use up the limit
    for (let i = 0; i < 5; i++) {
      await limiter.check(5, "test-token")
    }

    // Next request should be rejected
    await expect(limiter.check(5, "test-token")).rejects.toBeUndefined()
  })

  it("tracks different tokens independently", async () => {
    const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 500 })

    // Use up limit for token-a
    for (let i = 0; i < 3; i++) {
      await limiter.check(3, "token-a")
    }

    // token-b should still be allowed
    await expect(limiter.check(3, "token-b")).resolves.toBeUndefined()

    // token-a should be rejected
    await expect(limiter.check(3, "token-a")).rejects.toBeUndefined()
  })
})
