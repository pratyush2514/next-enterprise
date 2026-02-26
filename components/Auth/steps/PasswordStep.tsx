"use client"

import { useTranslations } from "next-intl"
import { useFormContext } from "react-hook-form"

import { usePasswordStrength } from "hooks/usePasswordStrength"
import { cn } from "lib/utils"
import type { SignupFormData } from "lib/validations/auth"

import { AuthInput } from "../AuthInput"
import { PasswordChecklist } from "../PasswordChecklist"

type PasswordStepProps = {
  onNext: () => void
  onBack: () => void
}

export function PasswordStep({ onNext, onBack }: PasswordStepProps) {
  const t = useTranslations("auth.signup.steps.password")
  const ts = useTranslations("auth.signup")
  const tv = useTranslations("auth.validation")
  const {
    register,
    trigger,
    watch,
    formState: { errors },
  } = useFormContext<SignupFormData>()

  const password = watch("password") || ""
  const { checks, allPassed } = usePasswordStrength(password)

  const handleNext = async () => {
    const valid = await trigger(["password"])
    if (valid && allPassed) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("heading")}</h2>

      <div>
        <AuthInput
          label={t("label")}
          type="password"
          placeholder={t("placeholder")}
          autoComplete="new-password"
          error={errors.password?.message ? tv(errors.password.message) : undefined}
          {...register("password")}
        />
        <PasswordChecklist checks={checks} />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "flex-1 rounded-full border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition-all duration-300",
            "hover:bg-gray-50 active:scale-[0.98]",
            "dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          )}
        >
          {ts("back")}
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!allPassed}
          className={cn(
            "flex-1 rounded-full py-3 text-sm font-semibold text-white transition-all duration-300",
            "bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98]",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {ts("next")}
        </button>
      </div>
    </div>
  )
}
