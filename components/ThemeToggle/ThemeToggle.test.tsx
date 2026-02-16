import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mockSetTheme = vi.fn()
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: mockSetTheme,
    resolvedTheme: "light",
  }),
}))

import { ThemeToggle } from "./ThemeToggle"

describe("ThemeToggle", () => {
  it("renders the toggle button after mounting", async () => {
    render(<ThemeToggle />)
    const button = await screen.findByRole("button", { name: /switch to dark mode/i })
    expect(button).toBeInTheDocument()
  })

  it("calls setTheme when clicked", async () => {
    render(<ThemeToggle />)
    const button = await screen.findByRole("button", { name: /switch to dark mode/i })
    fireEvent.click(button)
    expect(mockSetTheme).toHaveBeenCalledWith("dark")
  })

  it("has correct aria-label for light mode", async () => {
    render(<ThemeToggle />)
    const button = await screen.findByRole("button", { name: /switch to dark mode/i })
    expect(button).toHaveAttribute("aria-label", "Switch to dark mode")
  })
})
