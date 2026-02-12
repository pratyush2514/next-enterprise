import "styles/tailwind.css"

import { ThemeProvider } from "components/ThemeProvider/ThemeProvider"
import { ThemeToggle } from "components/ThemeToggle/ThemeToggle"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
