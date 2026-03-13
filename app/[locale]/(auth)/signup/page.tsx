import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"

import { SignupWizard } from "components/Auth/SignupWizard"

export const metadata: Metadata = {
  title: "Sign Up | Melodix",
  description: "Create your Melodix account",
}

export default async function SignupPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  return <SignupWizard />
}
