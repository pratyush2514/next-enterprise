import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useHoverIntent } from "./useHoverIntent"

describe("useHoverIntent", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns isHovering: false initially", () => {
    const { result } = renderHook(() => useHoverIntent(250))
    expect(result.current.isHovering).toBe(false)
  })

  it("sets isHovering to true after delay on pointer enter", () => {
    const { result } = renderHook(() => useHoverIntent(250))

    act(() => {
      result.current.containerProps.onPointerEnter({
        pointerType: "mouse",
      } as React.PointerEvent)
    })

    // Not yet — still within delay
    expect(result.current.isHovering).toBe(false)

    act(() => {
      vi.advanceTimersByTime(250)
    })

    expect(result.current.isHovering).toBe(true)
  })

  it("does not set isHovering if pointer leaves before delay", () => {
    const { result } = renderHook(() => useHoverIntent(250))

    act(() => {
      result.current.containerProps.onPointerEnter({
        pointerType: "mouse",
      } as React.PointerEvent)
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    act(() => {
      result.current.containerProps.onPointerLeave()
    })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.isHovering).toBe(false)
  })

  it("resets isHovering to false on pointer leave", () => {
    const { result } = renderHook(() => useHoverIntent(250))

    act(() => {
      result.current.containerProps.onPointerEnter({
        pointerType: "mouse",
      } as React.PointerEvent)
    })

    act(() => {
      vi.advanceTimersByTime(250)
    })

    expect(result.current.isHovering).toBe(true)

    act(() => {
      result.current.containerProps.onPointerLeave()
    })

    expect(result.current.isHovering).toBe(false)
  })

  it("ignores touch pointer events", () => {
    const { result } = renderHook(() => useHoverIntent(250))

    act(() => {
      result.current.containerProps.onPointerEnter({
        pointerType: "touch",
      } as React.PointerEvent)
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.isHovering).toBe(false)
  })

  it("sets isHovering immediately on focus", () => {
    const { result } = renderHook(() => useHoverIntent(250))

    act(() => {
      result.current.containerProps.onFocus()
    })

    expect(result.current.isHovering).toBe(true)
  })

  it("resets isHovering on blur", () => {
    const { result } = renderHook(() => useHoverIntent(250))

    act(() => {
      result.current.containerProps.onFocus()
    })

    expect(result.current.isHovering).toBe(true)

    act(() => {
      result.current.containerProps.onBlur()
    })

    expect(result.current.isHovering).toBe(false)
  })
})
