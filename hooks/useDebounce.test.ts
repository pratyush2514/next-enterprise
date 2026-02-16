import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useDebounce } from "./useDebounce"

describe("useDebounce", () => {
  it("returns the initial value immediately", () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useDebounce("hello", 300))
    expect(result.current).toBe("hello")
    vi.useRealTimers()
  })

  it("debounces the value update", () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: "hello", delay: 300 },
    })

    rerender({ value: "world", delay: 300 })
    expect(result.current).toBe("hello")

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current).toBe("world")

    vi.useRealTimers()
  })

  it("resets the timer on new value", () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: "a", delay: 300 },
    })

    rerender({ value: "ab", delay: 300 })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    rerender({ value: "abc", delay: 300 })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    // Only 200ms passed since "abc", so still "a"
    expect(result.current).toBe("a")

    act(() => {
      vi.advanceTimersByTime(100)
    })
    // Now 300ms passed since "abc"
    expect(result.current).toBe("abc")

    vi.useRealTimers()
  })
})
