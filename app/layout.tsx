import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { SessionProvider } from '@/lib/session-context'
import { LanguageProvider } from '@/lib/language-context'
import { BizoraLoadingProvider } from '@/lib/bizora-loading-context'
import { Toaster } from '@/components/ui/sonner'
import { AppWrapper } from '@/components/onboarding/app-wrapper'
import { BizoraLoadingOverlayWrapper } from '@/components/bizora-loading-wrapper'
import { FeedbackButton } from '@/components/feedback-button'
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
            <BizoraLoadingProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
              >
                <AppWrapper>
                {children}
                </AppWrapper>
                <FeedbackButton />
                <Analytics />
                <Toaster />
              </ThemeProvider>
              <BizoraLoadingOverlayWrapper />
            </BizoraLoadingProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
