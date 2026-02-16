export const THEME = {
  DARK: "dark",
  LIGHT: "light",
} as const

export type ThemeValue = (typeof THEME)[keyof typeof THEME]

export const THEME_LABELS = {
  SWITCH_TO_LIGHT: "Switch to light mode",
  SWITCH_TO_DARK: "Switch to dark mode",
  TOGGLE: "Toggle theme",
} as const
