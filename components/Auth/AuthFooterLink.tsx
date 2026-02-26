"use client"

import { Link } from "i18n/navigation"

type AuthFooterLinkProps = {
  text: string
  linkText: string
  href: string
}

export function AuthFooterLink({ text, linkText, href }: AuthFooterLinkProps) {
  return (
    <p className="mt-6 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
      {text}{" "}
      <Link
        href={href}
        className="inline-block py-1 font-semibold text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
      >
        {linkText}
      </Link>
    </p>
  )
}
