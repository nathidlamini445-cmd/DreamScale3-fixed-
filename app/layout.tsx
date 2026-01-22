import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { SessionProvider } from '@/lib/session-context'
import { LanguageProvider } from '@/lib/language-context'
import { BizoraLoadingProvider } from '@/lib/bizora-loading-context'
import { AuthProvider } from '@/contexts/AuthContext'
import { RouteGuard } from '@/components/auth/route-guard'
import { Toaster } from '@/components/ui/sonner'
import { AppWrapper } from '@/components/onboarding/app-wrapper'
import { BizoraLoadingOverlayWrapper } from '@/components/bizora-loading-wrapper'
import { FeedbackButton } from '@/components/feedback-button'
import { MobileBlocker } from '@/components/mobile-blocker'
import './globals.css'

export const metadata: Metadata = {
  title: 'DreamScale – Built for Visionaries',
  description: 'Your AI-powered business platform for building, scaling, and growing your business. Transform your vision into reality with DreamScale.',
  generator: 'DreamScale',
  keywords: ['AI business platform', 'entrepreneur tools', 'business scaling', 'AI-powered productivity', 'DreamScale'],
  authors: [{ name: 'DreamScale Team' }],
  creator: 'DreamScale',
  publisher: 'DreamScale',
  icons: {
    icon: [
      { url: '/Logo.png', type: 'image/png', sizes: '32x32' },
      { url: '/Logo.png', type: 'image/png', sizes: '16x16' },
    ],
    shortcut: '/Logo.png',
    apple: '/Logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dreamscale.com',
    siteName: 'DreamScale',
    title: 'DreamScale – Built for Visionaries',
    description: 'Your AI-powered business platform for building, scaling, and growing your business. Transform your vision into reality with DreamScale.',
    images: [
      {
        url: '/Logo.png',
        width: 1200,
        height: 630,
        alt: 'DreamScale – Built for Visionaries',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DreamScale – Built for Visionaries',
    description: 'Your AI-powered business platform for building, scaling, and growing your business. Transform your vision into reality with DreamScale.',
    images: ['/Logo.png'],
    creator: '@dreamscale',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <SessionProvider>
            <LanguageProvider>
              <BizoraLoadingProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="light"
                  enableSystem
                  disableTransitionOnChange
                >
                  <RouteGuard>
                    <MobileBlocker>
                      <div className="page-transition">
                        <AppWrapper>
                          {children}
                        </AppWrapper>
                        <FeedbackButton />
                        <Analytics />
                        <Toaster />
                      </div>
                    </MobileBlocker>
                  </RouteGuard>
                </ThemeProvider>
                <BizoraLoadingOverlayWrapper />
              </BizoraLoadingProvider>
            </LanguageProvider>
          </SessionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
