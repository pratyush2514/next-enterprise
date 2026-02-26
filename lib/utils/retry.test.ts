import { describe, expect, it, vi } from "vitest"
import { retryWithBackoff } from "./retry"

describe("retryWithBackoff", () => {
  it("returns result on first success", async () => {
    const fn = vi.fn().mockResolvedValue("success")
    const result = await retryWithBackoff(fn)
    expect(result).toBe("success")
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("retries on network errors and succeeds", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new TypeError("Failed to fetch")).mockResolvedValue("success")

    const result = await retryWithBackoff(fn, 3, 1)
    expect(result).toBe("success")
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it("throws immediately on non-network errors", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("Validation error"))

    await expect(retryWithBackoff(fn, 3, 1)).rejects.toThrow("Validation error")
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("throws after exhausting all retries", async () => {
    const fn = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"))

    await expect(retryWithBackoff(fn, 3, 1)).rejects.toThrow("Failed to fetch")
    expect(fn).toHaveBeenCalledTimes(3)
  })
})
