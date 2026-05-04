'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  
  // Simple redirect to dashboard - no auth checks here
  // Auth resolver handles all auth routing

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/')
    }, 100)
    
    return () => clearTimeout(timer)
  }, [router])
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005DFF] mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  )
}

