import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { SessionProvider } from '@/lib/session-context'
import { LanguageProvider } from '@/lib/language-context'
import { Toaster } from '@/components/ui/sonner'
import { AppWrapper } from '@/components/onboarding/app-wrapper'
import './globals.css'

export const metadata: Metadata = {
  title: 'DreamScale',
  description: 'Created by DreamScale dev',
  generator: 'DreamScale',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <SessionProvider>
          <LanguageProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <AppWrapper>
              {children}
              </AppWrapper>
              <Analytics />
              <Toaster />
            </ThemeProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
