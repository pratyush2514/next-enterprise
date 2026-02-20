"use client"

/**
 * Liquid Glass components adapted from Kokonut UI (v2.0.0)
 * @author @dorianbaffier
 * @license MIT
 * @website https://kokonutui.com
 *
 * Adapted for this project:
 * - Import paths changed from @/ to bare paths
 * - NotificationCenter demo removed (replaced by AudioPreviewOverlay)
 * - VolumeBars accepts reducedMotion prop
 * - ProgressBar onSeek accepts time in seconds directly
 */

import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Pause, Play } from "lucide-react"

import { Button, type ButtonProps } from "components/ui/button"
import { Card } from "components/ui/card"
import { cn } from "lib/utils"

// Glass shadow constants — complex inset shadows for glass edge realism
// Light: rgba(0,0,0,...) for depth. Dark: rgba(255,255,255,...) for glass highlights.
const GLASS_SHADOW_LIGHT =
  "shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)]"

const GLASS_SHADOW_DARK =
  "dark:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]"

const GLASS_SHADOW = `${GLASS_SHADOW_LIGHT} ${GLASS_SHADOW_DARK}`

const DEFAULT_GLASS_FILTER_SCALE = 30
const BUTTON_GLASS_FILTER_SCALE = 70

// Shared glass filter — hidden SVG with 5-stage distortion pipeline:
// feTurbulence → feGaussianBlur → feDisplacementMap → feGaussianBlur → feComposite
type GlassFilterProps = {
  id: string
  scale?: number
}

const GlassFilter = React.memo(({ id, scale = DEFAULT_GLASS_FILTER_SCALE }: GlassFilterProps) => (
  <svg className="hidden">
    <title>Glass Effect Filter</title>
    <defs>
      <filter colorInterpolationFilters="sRGB" height="200%" id={id} width="200%" x="-50%" y="-50%">
        <feTurbulence baseFrequency="0.05 0.05" numOctaves={1} result="turbulence" seed={1} type="fractalNoise" />
        <feGaussianBlur in="turbulence" result="blurredNoise" stdDeviation={2} />
        <feDisplacementMap
          in="SourceGraphic"
          in2="blurredNoise"
          result="displaced"
          scale={scale}
          xChannelSelector="R"
          yChannelSelector="B"
        />
        <feGaussianBlur in="displaced" result="finalBlur" stdDeviation={4} />
        <feComposite in="finalBlur" in2="finalBlur" operator="over" />
      </filter>
    </defs>
  </svg>
))
GlassFilter.displayName = "GlassFilter"

// LiquidButton — extends shadcn Button with glass overlay and SVG filter
const liquidButtonVariants = cva("relative transition-transform duration-300", {
  variants: {
    liquidVariant: {
      default: "hover:scale-105",
      none: "",
    },
  },
  defaultVariants: {
    liquidVariant: "default",
  },
})

export type LiquidButtonProps = ButtonProps & {
  liquidVariant?: "default" | "none"
}

function LiquidButton({ className, liquidVariant = "default", children, ...props }: LiquidButtonProps) {
  const filterId = React.useId()

  return (
    <>
      <Button className={cn(liquidButtonVariants({ liquidVariant }), className)} {...props}>
        <div className={cn("pointer-events-none absolute inset-0 rounded-full transition-all", GLASS_SHADOW)} />
        <div
          className="pointer-events-none absolute inset-0 isolate -z-10 overflow-hidden rounded-md"
          style={{ backdropFilter: `url("#${filterId}")` }}
        />
        <span className="relative z-10">{children}</span>
      </Button>
      <GlassFilter id={filterId} scale={BUTTON_GLASS_FILTER_SCALE} />
    </>
  )
}

// LiquidGlassCard — extends shadcn Card with glass effect
const liquidGlassCardVariants = cva(
  "group relative overflow-hidden bg-background/20 backdrop-blur-[2px] transition-all duration-300",
  {
    variants: {
      glassSize: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      glassSize: "default",
    },
  }
)

export type LiquidGlassCardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof liquidGlassCardVariants> & {
    glassEffect?: boolean
  }

function LiquidGlassCard({ className, glassSize, glassEffect = true, children, ...props }: LiquidGlassCardProps) {
  const filterId = React.useId()

  return (
    <Card className={cn(liquidGlassCardVariants({ glassSize }), className)} {...props}>
      <div className={cn("pointer-events-none absolute inset-0 rounded-lg transition-all", GLASS_SHADOW)} />

      {glassEffect && (
        <>
          <div
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-lg"
            style={{ backdropFilter: `url("#${filterId}")` }}
          />
          <GlassFilter id={filterId} scale={DEFAULT_GLASS_FILTER_SCALE} />
        </>
      )}

      <div className="relative z-10 w-full min-w-0 overflow-hidden">{children}</div>

      <div className="pointer-events-none absolute inset-0 z-20 rounded-lg bg-gradient-to-r from-transparent via-black/5 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:via-white/5" />
    </Card>
  )
}

// Volume bars — 8 animated gradient bars for audio visualization
const VOLUME_BAR_COUNT = 8
const BAR_DELAY_INCREMENT = 0.075
const STATIC_BAR_HEIGHT = "6px"

type VolumeBarsProps = {
  isPlaying: boolean
  reducedMotion?: boolean
}

const VolumeBars = React.memo(({ isPlaying, reducedMotion = false }: VolumeBarsProps) => {
  const bars = Array.from({ length: VOLUME_BAR_COUNT }, (_, i) => ({
    id: `bar-${i}`,
    delay: i * BAR_DELAY_INCREMENT,
  }))

  return (
    <div className="pointer-events-none flex h-8 w-10 items-end gap-0.5" aria-hidden="true">
      {bars.map((bar) => (
        <div
          className={cn("w-[3px] origin-bottom rounded-sm", isPlaying && !reducedMotion && "animate-bounce-music")}
          key={bar.id}
          style={{
            height: isPlaying && !reducedMotion ? undefined : STATIC_BAR_HEIGHT,
            animationDelay: `${bar.delay}s`,
            background: "linear-gradient(to top, #FF2E55, #FF6B88)",
          }}
        />
      ))}
    </div>
  )
})
VolumeBars.displayName = "VolumeBars"

// Progress bar — accessible slider for audio seek
const PROGRESS_PERCENTAGE_MULTIPLIER = 100
const SEEK_STEP_SECONDS = 2
const MIN_TIME = 0

const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = Math.floor(timeInSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

type ProgressBarProps = {
  currentTime: number
  totalDuration: number
  onSeek: (newTime: number) => void
}

const ProgressBar = React.memo(({ currentTime, totalDuration, onSeek }: ProgressBarProps) => {
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * PROGRESS_PERCENTAGE_MULTIPLIER : 0

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget
    const rect = bar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    const newTime = Math.min(Math.max(MIN_TIME, percent * totalDuration), totalDuration)
    onSeek(newTime)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault()
      onSeek(Math.min(currentTime + SEEK_STEP_SECONDS, totalDuration))
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      onSeek(Math.max(currentTime - SEEK_STEP_SECONDS, MIN_TIME))
    }
  }

  return (
    <>
      <div className="flex justify-between text-xs font-medium text-zinc-400 dark:text-zinc-500">
        <span className="tabular-nums">{formatTime(currentTime)}</span>
        <span className="tabular-nums">{formatTime(totalDuration)}</span>
      </div>
      <div
        aria-label="Playback progress"
        aria-valuemax={totalDuration}
        aria-valuemin={MIN_TIME}
        aria-valuenow={currentTime}
        className="relative z-10 h-1 w-full cursor-pointer overflow-hidden rounded-full bg-white/20"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="slider"
        tabIndex={0}
      >
        <div className="h-full bg-gradient-to-r from-[#FF2E55] to-[#FF6B88]" style={{ width: `${progress}%` }} />
      </div>
    </>
  )
})
ProgressBar.displayName = "ProgressBar"

export { LiquidButton, LiquidGlassCard, VolumeBars, ProgressBar, formatTime, Pause, Play }
