"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { AuthCard } from "components/Auth/AuthCard"
import { AUTH_ROUTES } from "components/Auth/constants"
import { SpinnerIcon } from "components/Auth/icons"
import { Link } from "i18n/navigation"
import { cn } from "lib/utils"

export default function ConfirmEmailPage() {
  const t = useTranslations("auth")
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const handleResend = async () => {
    setResendStatus("sending")

    try {
      const { createClient } = await import("lib/supabase/client")
      const supabase = createClient()

      // Get email from the URL search params or local storage
      const params = new URLSearchParams(window.location.search)
      const email = params.get("email")

      if (!email) {
        setResendStatus("error")
        return
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      })

      if (error) {
        setResendStatus("error")
      } else {
        setResendStatus("sent")
      }
    } catch {
      setResendStatus("error")
    }
  }

  return (
    <AuthCard>
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
          <svg
            className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("confirmEmail.title")}</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t("confirmEmail.message")}</p>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendStatus === "sending" || resendStatus === "sent"}
          className={cn(
            "mt-4 inline-flex items-center gap-2 text-sm font-medium transition-colors",
            resendStatus === "sent"
              ? "text-emerald-600 dark:text-emerald-400"
              : resendStatus === "error"
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-600 hover:text-emerald-500 dark:text-emerald-400",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {resendStatus === "sending" && <SpinnerIcon className="animate-spin" />}
          {resendStatus === "idle" && t("confirmEmail.resend")}
          {resendStatus === "sending" && t("confirmEmail.resending")}
          {resendStatus === "sent" && t("confirmEmail.resendSuccess")}
          {resendStatus === "error" && t("confirmEmail.resendError")}
        </button>

        <div className="mt-6">
          <Link
            href={AUTH_ROUTES.LOGIN}
            className="text-sm text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400"
          >
            {t("confirmEmail.backToLogin")}
          </Link>
        </div>
      </div>
    </AuthCard>
  )
}
