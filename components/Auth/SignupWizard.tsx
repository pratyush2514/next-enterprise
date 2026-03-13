"use client"

import { lazy, Suspense, useCallback, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import { FormProvider, useForm } from "react-hook-form"

import { useRouter } from "i18n/navigation"
import { createClient } from "lib/supabase/client"
import { type SignupFormData, signupSchema } from "lib/validations/auth"

import { AuthCard } from "./AuthCard"
import { AuthDivider } from "./AuthDivider"
import { AuthFooterLink } from "./AuthFooterLink"
import { AUTH_ROUTES, SIGNUP_STEPS } from "./constants"
import { OAuthButtons } from "./OAuthButtons"
import { StepProgress } from "./StepProgress"
import { StepTransition } from "./StepTransition"

const EmailStep = lazy(() => import("./steps/EmailStep").then((m) => ({ default: m.EmailStep })))
const PasswordStep = lazy(() => import("./steps/PasswordStep").then((m) => ({ default: m.PasswordStep })))
const ProfileStep = lazy(() => import("./steps/ProfileStep").then((m) => ({ default: m.ProfileStep })))

export function SignupWizard() {
  const t = useTranslations("auth")
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)

  const methods = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
  })

  const goNext = useCallback(() => {
    setDirection(1)
    setCurrentStep((s) => Math.min(s + 1, SIGNUP_STEPS.length - 1))
  }, [])

  const goBack = useCallback(() => {
    setDirection(-1)
    setCurrentStep((s) => Math.max(s - 1, 0))
  }, [])

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true)
    setSignupError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            date_of_birth: data.dateOfBirth,
            gender: data.gender,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setSignupError(t("errors.signupFailed"))
        setIsSubmitting(false)
      } else {
        router.push(`/auth/confirm-email?email=${encodeURIComponent(data.email)}`)
      }
    } catch {
      setSignupError(t("errors.signupFailed"))
      setIsSubmitting(false)
    }
  }

  const stepKey = SIGNUP_STEPS[currentStep]!

  return (
    <AuthCard>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("signup.title")}</h1>
      </div>

      {currentStep === 0 && (
        <>
          <OAuthButtons />
          <AuthDivider />
        </>
      )}

      <StepProgress currentStep={currentStep} />

      {signupError && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {signupError}
        </div>
      )}

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="mt-6">
          <AnimatePresence mode="wait" custom={direction}>
            <StepTransition direction={direction} stepKey={stepKey}>
              <Suspense
                fallback={
                  <div className="flex h-48 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                  </div>
                }
              >
                {stepKey === "email" && <EmailStep onNext={goNext} />}
                {stepKey === "password" && <PasswordStep onNext={goNext} onBack={goBack} />}
                {stepKey === "profile" && <ProfileStep onBack={goBack} isSubmitting={isSubmitting} />}
              </Suspense>
            </StepTransition>
          </AnimatePresence>
        </form>
      </FormProvider>

      <AuthFooterLink text={t("signup.hasAccount")} linkText={t("signup.logInLink")} href={AUTH_ROUTES.LOGIN} />
    </AuthCard>
  )
}
