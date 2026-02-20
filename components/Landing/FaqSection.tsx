"use client"

import { useState } from "react"
import * as Accordion from "@radix-ui/react-accordion"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

import { cn } from "lib/utils"

import { PlusIcon } from "./icons"
import { ScrollReveal } from "./ScrollReveal"

const FAQ_ITEMS = [
  {
    id: "faq-1",
    question: "What is Melodix?",
    answer:
      "Melodix is a curated music platform designed for businesses. We provide handpicked music channels for bars, restaurants, retail stores, salons, and any space that deserves a great soundtrack.",
  },
  {
    id: "faq-2",
    question: "How does the music catalog work?",
    answer:
      "Our catalog lets you search millions of tracks, preview them instantly on hover, and discover the perfect sound for your space. Browse by genre, mood, or artist to find exactly what you need.",
  },
  {
    id: "faq-3",
    question: "Can I preview songs before saving?",
    answer:
      "Yes. Simply hover over any track in the catalog to hear a 30-second preview. You can control playback, seek through the track, and browse without interruption.",
  },
  {
    id: "faq-4",
    question: "What genres and moods are available?",
    answer:
      "We cover everything from jazz and lo-fi to pop hits and classical. Our curated channels include Quick Start playlists, mood-based collections like Barista Bar and Chill Out Zone, and constantly updated discovery feeds.",
  },
  {
    id: "faq-5",
    question: "Is Melodix free to use?",
    answer:
      "You can explore the catalog and preview tracks for free. Premium plans unlock unlimited playback, custom playlists, and scheduling features tailored for your business.",
  },
  {
    id: "faq-6",
    question: "Where can I go if I have questions?",
    answer:
      "You can reach our support team via email at info@melodix.com or call us at 0800 023 3029. Our Help Center also has detailed articles covering every feature.",
  },
]

function AccordionItem({
  id,
  question,
  answer,
  isOpen,
}: {
  id: string
  question: string
  answer: string
  isOpen: boolean
}) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <Accordion.Item
      value={id}
      className="border-b border-gray-200 first:border-t dark:border-gray-800 dark:first:border-gray-800"
    >
      <Accordion.Header>
        <Accordion.Trigger
          className={cn(
            "group flex w-full items-center justify-between py-5 text-left text-base font-medium transition-colors",
            "text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300",
            "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-gray-950"
          )}
        >
          <span className="pr-4">{question}</span>
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full text-gray-400 transition-all duration-300 dark:text-gray-500",
              isOpen && "rotate-45 text-emerald-500 dark:text-emerald-400"
            )}
          >
            <PlusIcon />
          </span>
        </Accordion.Trigger>
      </Accordion.Header>

      <AnimatePresence initial={false}>
        {isOpen && (
          <Accordion.Content forceMount asChild>
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{
                height: { type: "spring", stiffness: 200, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="overflow-hidden"
            >
              <p className="pb-5 leading-relaxed text-gray-500 dark:text-gray-400">{answer}</p>
            </motion.div>
          </Accordion.Content>
        )}
      </AnimatePresence>
    </Accordion.Item>
  )
}

export function FaqSection() {
  const [openItem, setOpenItem] = useState<string>("")

  return (
    <section className="bg-white py-20 lg:py-28 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-20">
          {/* Left column — heading */}
          <ScrollReveal direction="left">
            <div className="lg:sticky lg:top-32">
              <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">FAQs</h2>
              <p className="mt-4 leading-relaxed text-gray-500 dark:text-gray-400">
                Dive into our FAQ section for more information on Melodix.
              </p>
            </div>
          </ScrollReveal>

          {/* Right column — accordion */}
          <ScrollReveal direction="right" delay={0.15}>
            <Accordion.Root type="single" collapsible value={openItem} onValueChange={setOpenItem}>
              {FAQ_ITEMS.map((item) => (
                <AccordionItem key={item.id} {...item} isOpen={openItem === item.id} />
              ))}
            </Accordion.Root>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
