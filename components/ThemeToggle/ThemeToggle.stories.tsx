import type { Meta, StoryObj } from "@storybook/react"

import { ThemeToggle } from "./ThemeToggle"

const meta: Meta<typeof ThemeToggle> = {
  title: "ThemeToggle",
  component: ThemeToggle,
}

type Story = StoryObj<typeof ThemeToggle>

export const Default: Story = {}

export default meta
