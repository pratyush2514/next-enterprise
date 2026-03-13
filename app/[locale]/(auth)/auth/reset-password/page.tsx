"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"

import { AuthCard } from "components/Auth/AuthCard"
import { AuthInput } from "components/Auth/AuthInput"
import { AUTH_ROUTES } from "components/Auth/constants"
import { SpinnerIcon } from "components/Auth/icons"
import { createClient } from "lib/supabase/client"
import { cn } from "lib/utils"
import { passwordStepSchema } from "lib/validations/auth"

type ResetPasswordData = { password: string }

export default function ResetPasswordPage() {
  const t = useTranslations("auth")
  const tv = useTranslations("auth.validation")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(passwordStepSchema),
  })

  const onSubmit = async (data: ResetPasswordData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (updateError) {
        setError(t("errors.resetFailed"))
        setIsSubmitting(false)
      } else {
        window.location.href = `${AUTH_ROUTES.LOGIN}?reset=success`
      }
    } catch {
      setError(t("errors.resetFailed"))
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("resetPassword.title")}</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t("resetPassword.description")}</p>
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
          label={t("resetPassword.passwordLabel")}
          type="password"
          placeholder={t("resetPassword.passwordPlaceholder")}
          autoComplete="new-password"
          error={errors.password ? tv(errors.password.message as string) : undefined}
          {...register("password")}
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
          {isSubmitting ? t("resetPassword.submitting") : t("resetPassword.submit")}
        </button>
      </form>
    </AuthCard>
  )
}
