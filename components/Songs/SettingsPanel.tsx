"use client"

import { useCallback, useEffect, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import * as Switch from "@radix-ui/react-switch"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"

import { trackThemeSwitch } from "lib/analytics"
import { cn } from "lib/utils"

import { CloseIcon } from "./icons"

interface SettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const t = useTranslations("songs.settings")
  const prefersReducedMotion = useReducedMotion()
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  const handleToggleTheme = useCallback(() => {
    const from = resolvedTheme ?? "unknown"
    const newTheme = resolvedTheme === "dark" ? "light" : "dark"

    trackThemeSwitch(from, newTheme)

    // Block all CSS transitions for instant switch
    const blocker = document.createElement("style")
    blocker.textContent = "*, *::before, *::after { transition: none !important; }"
    document.head.appendChild(blocker)

    document.documentElement.classList.toggle("dark", newTheme === "dark")
    document.documentElement.style.colorScheme = newTheme
    setTheme(newTheme)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        blocker.remove()
      })
    })
  }, [resolvedTheme, setTheme])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className={cn(
                  "fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6",
                  "border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-gray-900"
                )}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">{t("title")}</Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="rounded-full p-1.5 text-gray-400 transition-colors hover:text-gray-600 dark:text-white/40 dark:hover:text-white/60"
                      aria-label={t("close")}
                    >
                      <CloseIcon className="size-4" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="space-y-6">
                  {/* Appearance section */}
                  <div>
                    <h3 className="mb-3 text-xs font-bold tracking-[0.15em] text-gray-400 uppercase dark:text-white/30">
                      {t("appearance")}
                    </h3>
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-white/10">
                      <span className="text-sm font-medium text-gray-700 dark:text-white/80">{t("darkMode")}</span>
                      {mounted && (
                        <Switch.Root
                          checked={isDark}
                          onCheckedChange={handleToggleTheme}
                          className={cn(
                            "relative h-6 w-11 cursor-pointer rounded-full transition-colors duration-200",
                            isDark ? "bg-emerald-500" : "bg-gray-300"
                          )}
                        >
                          <Switch.Thumb
                            className={cn(
                              "block size-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                              isDark ? "translate-x-[22px]" : "translate-x-0.5"
                            )}
                          />
                        </Switch.Root>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
