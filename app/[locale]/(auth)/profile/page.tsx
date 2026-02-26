"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"

import { AuthCard } from "components/Auth/AuthCard"
import { AuthInput } from "components/Auth/AuthInput"
import { AUTH_ROUTES } from "components/Auth/constants"
import { SpinnerIcon } from "components/Auth/icons"
import { useAuth } from "lib/contexts/auth-context"
import { createClient } from "lib/supabase/client"
import { cn } from "lib/utils"
import { profileStepSchema } from "lib/validations/auth"

type ProfileData = {
  name: string
  gender: "male" | "female" | "non-binary" | "other" | "prefer-not-to-say"
  dateOfBirth: string
}

export default function ProfilePage() {
  const t = useTranslations("auth")
  const tv = useTranslations("auth.validation")
  const { user, profile, loading, signOut, refreshProfile } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileStepSchema),
  })

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.full_name || "",
        gender: (profile.gender as ProfileData["gender"]) || "prefer-not-to-say",
        dateOfBirth: profile.date_of_birth || "",
      })
    }
  }, [profile, reset])

  const onSubmit = async (data: ProfileData) => {
    if (!user) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: data.name,
          gender: data.gender,
          date_of_birth: data.dateOfBirth,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) {
        setError(t("errors.updateFailed"))
      } else {
        setSuccess(true)
        await refreshProfile()
      }
    } catch {
      setError(t("errors.updateFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut()
    window.location.href = AUTH_ROUTES.LOGIN
  }

  if (loading) {
    return (
      <AuthCard className="max-w-lg">
        <div className="flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      </AuthCard>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AuthCard className="max-w-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("profile.title")}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AnimatePresence>
          {success && (
            <motion.div
              className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
              initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 25 }}
            >
              {t("profile.updateSuccess")}
            </motion.div>
          )}
        </AnimatePresence>

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

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("profile.emailLabel")}
          </label>
          <input
            type="email"
            value={user.email || ""}
            disabled
            className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          />
        </div>

        <AuthInput
          label={t("profile.nameLabel")}
          type="text"
          placeholder={t("profile.namePlaceholder")}
          error={errors.name ? tv(errors.name.message as string) : undefined}
          {...register("name")}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("profile.genderLabel")}
          </label>
          <select
            className={cn(
              "w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all duration-300",
              "focus:border-emerald-400 focus:shadow-md focus:ring-2 focus:ring-emerald-500/20 focus:outline-none",
              "dark:border-gray-700 dark:bg-gray-800 dark:text-white",
              errors.gender && "border-red-400 focus:border-red-400 focus:ring-red-500/20"
            )}
            {...register("gender")}
          >
            <option value="male">{t("signup.steps.profile.genderOptions.male")}</option>
            <option value="female">{t("signup.steps.profile.genderOptions.female")}</option>
            <option value="non-binary">{t("signup.steps.profile.genderOptions.non-binary")}</option>
            <option value="other">{t("signup.steps.profile.genderOptions.other")}</option>
            <option value="prefer-not-to-say">{t("signup.steps.profile.genderOptions.prefer-not-to-say")}</option>
          </select>
        </div>

        <AuthInput
          label={t("profile.dobLabel")}
          type="date"
          error={errors.dateOfBirth ? tv(errors.dateOfBirth.message as string) : undefined}
          {...register("dateOfBirth")}
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
          {isSubmitting ? t("profile.updating") : t("profile.update")}
        </button>
      </form>

      <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 py-3 text-sm font-semibold transition-all duration-300",
            "text-gray-700 hover:bg-gray-50 active:scale-[0.98]",
            "dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {isSigningOut && <SpinnerIcon className="animate-spin" />}
          {isSigningOut ? t("profile.signingOut") : t("profile.signOut")}
        </button>
      </div>
    </AuthCard>
  )
}
