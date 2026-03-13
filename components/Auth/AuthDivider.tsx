"use client"

import { useTranslations } from "next-intl"

export function AuthDivider() {
  const t = useTranslations("auth")

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
      <span className="text-xs font-medium tracking-wider text-gray-400 uppercase dark:text-gray-500">
        {t("dividerOr")}
      </span>
      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
    </div>
  )
}
