"use client"

import { useTranslations } from "next-intl"
import { useFormContext } from "react-hook-form"

import { useEmailCheck } from "hooks/useEmailCheck"
import { cn } from "lib/utils"
import type { SignupFormData } from "lib/validations/auth"

import { AuthInput } from "../AuthInput"
import { SpinnerIcon } from "../icons"

type EmailStepProps = {
  onNext: () => void
}

export function EmailStep({ onNext }: EmailStepProps) {
  const t = useTranslations("auth.signup.steps.email")
  const ts = useTranslations("auth.signup")
  const tv = useTranslations("auth.validation")
  const te = useTranslations("auth.errors")
  const {
    register,
    trigger,
    watch,
    formState: { errors },
  } = useFormContext<SignupFormData>()

  const email = watch("email") || ""
  const { isChecking, exists, error: checkError } = useEmailCheck(email)

  const handleNext = async () => {
    const valid = await trigger(["email"])
    if (valid && !exists && !isChecking) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("heading")}</h2>

      <div>
        <AuthInput
          label={t("label")}
          type="email"
          placeholder={t("placeholder")}
          autoComplete="email"
          error={
            errors.email
              ? tv(errors.email.message as string)
              : exists
                ? t("taken")
                : checkError
                  ? te(checkError)
                  : undefined
          }
          {...register("email")}
        />

        {/* Email check status */}
        {email && !errors.email && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            {isChecking && (
              <>
                <SpinnerIcon className="animate-spin text-gray-400" />
                <span className="text-gray-400">{t("checking")}</span>
              </>
            )}
            {!isChecking && exists === false && !checkError && (
              <span className="text-emerald-500">{t("available")}</span>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={isChecking || exists === true || !!errors.email || !!checkError}
        className={cn(
          "flex w-full items-center justify-center rounded-full py-3 text-sm font-semibold text-white transition-all duration-300",
          "bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98]",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        {ts("next")}
      </button>
    </div>
  )
}
