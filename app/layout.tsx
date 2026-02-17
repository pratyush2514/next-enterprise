import "styles/tailwind.css"

import { ThemeProvider } from "components/ThemeProvider/ThemeProvider"
import { ThemeToggle } from "components/ThemeToggle/ThemeToggle"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-white">
        <ThemeProvider>
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
