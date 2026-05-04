'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Language, getTranslation, getTranslations, type Translations } from './translations'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string>) => string
  translations: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Load language from localStorage or default to 'en'
    try {
      const savedLanguage = localStorage.getItem('dreamscale_language') as Language
      if (savedLanguage && ['en', 'fr', 'de', 'es'].includes(savedLanguage)) {
        setLanguageState(savedLanguage)
      }
    } catch (error) {
      console.error('Error loading language:', error)
    }
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem('dreamscale_language', lang)
      // Update HTML lang attribute
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang
      }
    } catch (error) {
      console.error('Error saving language:', error)
    }
  }, [])

  // Update HTML lang attribute when language changes
  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language, mounted])

  const t = useCallback((key: string, params?: Record<string, string>) => {
    return getTranslation(language, key, params)
  }, [language])

  const translations = getTranslations(language)

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

// Safe hook that returns default values if not in provider
export function useLanguageSafe() {
  const context = useContext(LanguageContext)
  if (!context) {
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      t: (key: string) => key,
      translations: getTranslations('en')
    }
  }
  return context
}

