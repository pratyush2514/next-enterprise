"use client"

import React, { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { GoogleIcon } from "components/Auth/icons"
import type { ITunesResult } from "hooks/useCatalogSearch"
import { Link } from "i18n/navigation"
import { createClient } from "lib/supabase/client"
import { cn } from "lib/utils"

import { SONGS_ROUTES } from "./constants"
import { CloseIcon, MusicNoteIcon } from "./icons"

interface AuthOverlayProps {
  track: ITunesResult | null
  onClose: () => void
}

export function AuthOverlay({ track, onClose }: AuthOverlayProps) {
  const t = useTranslations("songs.authOverlay")
  const tAuth = useTranslations("auth")
  const prefersReducedMotion = useReducedMotion()
  const [oauthError, setOauthError] = useState<string | null>(null)

  const isOpen = track !== null
  const artworkUrl300 = track?.artworkUrl100?.replace("100x100", "300x300") ?? ""
  const artworkUrl600 = track?.artworkUrl100?.replace("100x100", "600x600") ?? ""

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            {/* Backdrop — blurred artwork background */}
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
              >
                <div className="absolute inset-0 overflow-hidden">
                  {artworkUrl600 && (
                    <Image
                      src={artworkUrl600}
                      alt=""
                      fill
                      unoptimized
                      className="scale-110 object-cover opacity-60 blur-[60px]"
                      sizes="100vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/70" />
                </div>
              </motion.div>
            </Dialog.Overlay>

            {/* Content card */}
            <Dialog.Content asChild>
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
                transition={prefersReducedMotion ? { duration: 0.1 } : { type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gray-900/90 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8">
                  {/* Close button */}
                  <Dialog.Close asChild>
                    <button
                      className="absolute top-4 right-4 rounded-full p-1 text-white/40 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                      aria-label={t("close")}
                    >
                      <CloseIcon className="size-5" />
                    </button>
                  </Dialog.Close>

                  {/* Song artwork */}
                  <div className="mx-auto mb-6 size-36 overflow-hidden rounded-xl shadow-2xl shadow-black/50 sm:size-48">
                    {artworkUrl300 ? (
                      <Image
                        src={artworkUrl300}
                        alt={`${track?.trackName} by ${track?.artistName}`}
                        width={300}
                        height={300}
                        unoptimized
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-white/5">
                        <MusicNoteIcon className="size-12 text-white/20" />
                      </div>
                    )}
                  </div>

                  {/* Copy */}
                  <p className="text-sm text-white/50">{t("startListening")}</p>
                  <Dialog.Title className="mt-1 text-xl font-bold text-white">{track?.trackName}</Dialog.Title>
                  <p className="text-sm text-white/60">{t("byArtist", { artist: track?.artistName })}</p>
                  <Dialog.Description className="mt-4 text-sm text-white/40">{t("subtitle")}</Dialog.Description>

                  {/* Sign up CTA */}
                  <Link
                    href={SONGS_ROUTES.SIGNUP}
                    className={cn(
                      "mt-6 block w-full rounded-full bg-emerald-400 py-3 text-center text-sm font-bold text-gray-900",
                      "transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-300 active:scale-[0.98]",
                      "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
                    )}
                  >
                    {t("signUpFree")}
                  </Link>

                  {/* Divider */}
                  <div className="flex items-center gap-4 py-4">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-xs font-medium tracking-wider text-white/30 uppercase">
                      {tAuth("dividerOr")}
                    </span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  {/* Google OAuth */}
                  {oauthError && (
                    <p className="mb-2 text-sm text-red-400" role="alert">
                      {oauthError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      setOauthError(null)
                      try {
                        const supabase = createClient()
                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: "google",
                          options: {
                            redirectTo: `${window.location.origin}/auth/callback`,
                          },
                        })
                        if (error) {
                          setOauthError(tAuth("errors.oauthFailed"))
                        }
                      } catch {
                        setOauthError(tAuth("errors.oauthFailed"))
                      }
                    }}
                    className={cn(
                      "flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white",
                      "transition-all duration-300 hover:bg-white/10",
                      "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                    )}
                  >
                    <GoogleIcon />
                    {tAuth("continueWithGoogle")}
                  </button>

                  {/* Login link */}
                  <p className="mt-4 text-sm text-white/40">
                    {t("haveAccount")}
                    <Link
                      href={SONGS_ROUTES.LOGIN}
                      className="font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                    >
                      {t("logIn")}
                    </Link>
                  </p>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
