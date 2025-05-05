import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"
import "./globals.css"
import type React from "react"
import { ThemeProvider } from 'next-themes'
import DynamicBackground from './components/canvas/dynamic-background'

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "Manish.dev - Full Stack Developer",
  description: "Full stack developer portfolio showcasing projects and skills",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
  generator: 'MANISH SHARMA'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={spaceGrotesk.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DynamicBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
