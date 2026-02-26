"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { createClient } from "lib/supabase/client"
import { cn } from "lib/utils"

import { GoogleIcon } from "./icons"

export function OAuthButtons() {
  const t = useTranslations("auth")
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setError(null)
    try {
      const supabase = createClient()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (oauthError) {
        setError(t("errors.oauthFailed"))
      }
    } catch {
      setError(t("errors.oauthFailed"))
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className={cn(
          "flex min-h-[44px] w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition-all duration-300",
          "hover:bg-gray-50 hover:shadow-sm",
          "dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        )}
      >
        <GoogleIcon />
        {t("continueWithGoogle")}
      </button>
    </div>
  )
}
