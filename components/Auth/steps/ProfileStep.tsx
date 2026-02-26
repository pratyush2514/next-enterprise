"use client"

import { useCallback, useState } from "react"
import * as RadioGroup from "@radix-ui/react-radio-group"
import { useTranslations } from "next-intl"
import { Controller, useFormContext } from "react-hook-form"

import { cn } from "lib/utils"
import type { SignupFormData } from "lib/validations/auth"

import { AuthInput } from "../AuthInput"
import { SpinnerIcon } from "../icons"

const GENDER_OPTIONS = ["male", "female", "non-binary", "other", "prefer-not-to-say"] as const

const MONTH_KEYS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const

type ProfileStepProps = {
  onBack: () => void
  isSubmitting: boolean
}

export function ProfileStep({ onBack, isSubmitting }: ProfileStepProps) {
  const t = useTranslations("auth.signup.steps.profile")
  const ts = useTranslations("auth.signup")
  const tv = useTranslations("auth.validation")
  const tm = useTranslations("auth.months")
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<SignupFormData>()

  const [dobParts, setDobParts] = useState({ month: "", day: "", year: "" })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  const updateDob = useCallback(
    (part: "month" | "day" | "year", value: string) => {
      const updated = { ...dobParts, [part]: value }
      setDobParts(updated)
      if (updated.month && updated.day && updated.year) {
        setValue("dateOfBirth", `${updated.year}-${updated.month}-${updated.day}`, {
          shouldValidate: true,
        })
      }
    },
    [dobParts, setValue]
  )

  const selectClasses = cn(
    "w-full rounded-full border border-gray-200 bg-white py-3 px-4 text-sm shadow-sm transition-all duration-300 appearance-none",
    "focus:border-emerald-400 focus:shadow-md focus:ring-2 focus:ring-emerald-500/20 focus:outline-none",
    "dark:border-gray-700 dark:bg-gray-800 dark:text-white"
  )

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("heading")}</h2>

      {/* Name */}
      <AuthInput
        label={t("nameLabel")}
        type="text"
        placeholder={t("namePlaceholder")}
        autoComplete="name"
        error={errors.name ? tv(errors.name.message as string) : undefined}
        {...register("name")}
      />

      {/* Gender */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("genderLabel")}</label>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <RadioGroup.Root value={field.value} onValueChange={field.onChange} className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((option) => (
                <RadioGroup.Item
                  key={option}
                  value={option}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
                    field.value === option
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600"
                  )}
                >
                  {t(`genderOptions.${option}`)}
                </RadioGroup.Item>
              ))}
            </RadioGroup.Root>
          )}
        />
        {errors.gender && <p className="text-sm text-red-500">{tv(errors.gender.message as string)}</p>}
      </div>

      {/* Date of Birth */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("dobLabel")}</label>
        {/* Hidden input for react-hook-form registration */}
        <input type="hidden" {...register("dateOfBirth")} />
        <div className="grid grid-cols-3 gap-3">
          <select
            className={selectClasses}
            aria-label={t("dobMonth")}
            value={dobParts.month}
            onChange={(e) => updateDob("month", e.target.value)}
          >
            <option value="">{t("dobMonth")}</option>
            {MONTH_KEYS.map((key, i) => (
              <option key={key} value={String(i + 1).padStart(2, "0")}>
                {tm(key)}
              </option>
            ))}
          </select>
          <select
            className={selectClasses}
            aria-label={t("dobDay")}
            value={dobParts.day}
            onChange={(e) => updateDob("day", e.target.value)}
          >
            <option value="">{t("dobDay")}</option>
            {days.map((day) => (
              <option key={day} value={String(day).padStart(2, "0")}>
                {day}
              </option>
            ))}
          </select>
          <select
            className={selectClasses}
            aria-label={t("dobYear")}
            value={dobParts.year}
            onChange={(e) => updateDob("year", e.target.value)}
          >
            <option value="">{t("dobYear")}</option>
            {years.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
        </div>
        {errors.dateOfBirth && <p className="text-sm text-red-500">{tv(errors.dateOfBirth.message as string)}</p>}
      </div>

      {/* Buttons */}
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
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-all duration-300",
            "bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98]",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {isSubmitting && <SpinnerIcon className="animate-spin" />}
          {isSubmitting ? t("submitting") : t("submitButton")}
        </button>
      </div>
    </div>
  )
}
