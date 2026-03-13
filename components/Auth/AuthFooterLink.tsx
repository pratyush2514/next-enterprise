"use client"

import { Link } from "i18n/navigation"

type AuthFooterLinkProps = {
  text: string
  linkText: string
  href: string
}

export function AuthFooterLink({ text, linkText, href }: AuthFooterLinkProps) {
  return (
    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
      {text}{" "}
      <Link
        href={href}
        className="font-semibold text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
      >
        {linkText}
      </Link>
    </p>
  )
}
