"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"

import { Link } from "i18n/navigation"
import { createClient } from "lib/supabase/client"
import { cn } from "lib/utils"
import { type LoginFormData, loginSchema } from "lib/validations/auth"

import { AuthCard } from "./AuthCard"
import { AuthDivider } from "./AuthDivider"
import { AuthFooterLink } from "./AuthFooterLink"
import { AuthInput } from "./AuthInput"
import { AUTH_ROUTES } from "./constants"
import { SpinnerIcon } from "./icons"
import { OAuthButtons } from "./OAuthButtons"

export function LoginForm() {
  const t = useTranslations("auth")
  const tv = useTranslations("auth.validation")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        setError(t("login.invalidCredentials"))
        setIsSubmitting(false)
      } else {
        window.location.href = AUTH_ROUTES.SONG
      }
    } catch {
      setError(t("errors.loginFailed"))
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard>
      <div className="mb-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">{t("login.title")}</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t("login.subtitle")}</p>
      </div>

      <OAuthButtons />
      <AuthDivider />

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
          label={t("login.emailLabel")}
          type="email"
          placeholder={t("login.emailPlaceholder")}
          autoComplete="email"
          error={errors.email ? tv(errors.email.message as string) : undefined}
          {...register("email")}
        />

        <AuthInput
          label={t("login.passwordLabel")}
          type="password"
          placeholder={t("login.passwordPlaceholder")}
          autoComplete="current-password"
          error={errors.password ? tv(errors.password.message as string) : undefined}
          {...register("password")}
        />

        <div className="flex justify-end">
          <Link
            href={AUTH_ROUTES.FORGOT_PASSWORD}
            className="inline-block py-2 text-sm text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400"
          >
            {t("login.forgotPassword")}
          </Link>
        </div>

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
          {isSubmitting ? t("login.submitting") : t("login.submitButton")}
        </button>
      </form>

      <AuthFooterLink text={t("login.noAccount")} linkText={t("login.signUpLink")} href={AUTH_ROUTES.SIGNUP} />
    </AuthCard>
  )
}
