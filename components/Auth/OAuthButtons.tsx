"use client"

import { signIn } from "next-auth/react"
import { useTranslations } from "next-intl"

import { cn } from "lib/utils"

import { GoogleIcon } from "./icons"

export function OAuthButtons() {
  const t = useTranslations("auth")

  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className={cn(
        "flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition-all duration-300",
        "hover:bg-gray-50 hover:shadow-sm",
        "dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
      )}
    >
      <GoogleIcon />
      {t("continueWithGoogle")}
    </button>
  )
}
