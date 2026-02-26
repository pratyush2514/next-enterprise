"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AuthCard } from "components/Auth/AuthCard"
import { AuthInput } from "components/Auth/AuthInput"
import { AUTH_ROUTES } from "components/Auth/constants"
import { SpinnerIcon } from "components/Auth/icons"
import { Link } from "i18n/navigation"
import { createClient } from "lib/supabase/client"
import { cn } from "lib/utils"

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
})

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const t = useTranslations("auth")
  const tv = useTranslations("auth.validation")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      })

      if (resetError) {
        setError(t("errors.resetFailed"))
        setIsSubmitting(false)
      } else {
        setSuccess(true)
        setIsSubmitting(false)
      }
    } catch {
      setError(t("errors.resetFailed"))
      setIsSubmitting(false)
    }
  }

  if (success) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("forgotPassword.successTitle")}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t("forgotPassword.successMessage")}</p>
          <Link
            href={AUTH_ROUTES.LOGIN}
            className="mt-6 inline-block text-sm text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400"
          >
            {t("forgotPassword.backToLogin")}
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("forgotPassword.title")}</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t("forgotPassword.description")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AnimatePresence>
          {error && (
            <motion.div
              className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
              initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 25 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AuthInput
          label={t("forgotPassword.emailLabel")}
          type="email"
          placeholder={t("forgotPassword.emailPlaceholder")}
          autoComplete="email"
          error={errors.email ? tv(errors.email.message as string) : undefined}
          {...register("email")}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-all duration-300",
            "bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98]",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {isSubmitting && <SpinnerIcon className="animate-spin" />}
          {isSubmitting ? t("forgotPassword.submitting") : t("forgotPassword.submit")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <Link
          href={AUTH_ROUTES.LOGIN}
          className="font-semibold text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          {t("forgotPassword.backToLogin")}
        </Link>
      </p>
    </AuthCard>
  )
}
