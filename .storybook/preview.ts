import type { Preview } from "@storybook/react"
import React from "react"

import { ThemeProvider } from "../components/ThemeProvider/ThemeProvider"
import "../styles/tailwind.css"

const preview: Preview = {
  decorators: [(Story) => React.createElement(ThemeProvider, null, React.createElement(Story))],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
}

export default preview
