'use client'

import { LogIn, UserPlus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export function LoginButton() {
  const router = useRouter()
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleLoginClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('✅ Login button clicked - triggering Google OAuth')
    
    if (!supabase) {
      alert('Supabase is not configured. Please check your environment variables.')
      console.error('Supabase client is null - check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
      return
    }

    setIsSigningIn(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/resolve`,
        }
      })
      
      if (error) {
        console.error('Google sign in error:', error)
        alert(`Failed to sign in with Google: ${error.message}`)
        setIsSigningIn(false)
      }
      // Note: If successful, user will be redirected to Google OAuth page
    } catch (error) {
      console.error('Sign in error:', error)
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Please try again.'}`)
      setIsSigningIn(false)
    }
  }

  const handleSignUpClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('✅ Sign Up button clicked - triggering Google OAuth')
    
    if (!supabase) {
      alert('Supabase is not configured. Please check your environment variables.')
      console.error('Supabase client is null - check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
      return
    }

    setIsSigningIn(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/resolve`,
        }
      })
      
      if (error) {
        console.error('Google sign up error:', error)
        alert(`Failed to sign up with Google: ${error.message}`)
        setIsSigningIn(false)
      }
      // Note: If successful, user will be redirected to Google OAuth page
    } catch (error) {
      console.error('Sign up error:', error)
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Please try again.'}`)
      setIsSigningIn(false)
    }
  }

  return (
    <div className="flex items-center gap-3" style={{ zIndex: 1000 }}>
      {/* Sign Up Button */}
      <button
        onClick={handleSignUpClick}
        disabled={isSigningIn}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#005DFF] hover:bg-[#0048CC] text-white rounded-lg transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-base font-semibold"
        style={{ 
          position: 'relative',
          pointerEvents: 'auto',
          display: 'inline-flex',
          textDecoration: 'none',
          border: 'none'
        }}
        aria-label="Sign Up"
      >
        {isSigningIn ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Signing up...</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            <span>Sign Up</span>
          </>
        )}
      </button>
      
      {/* Login Button */}
      <button
        onClick={handleLoginClick}
        disabled={isSigningIn}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-base font-semibold"
        style={{ 
          position: 'relative',
          pointerEvents: 'auto',
          display: 'inline-flex',
          textDecoration: 'none'
        }}
        aria-label="Login"
      >
        {isSigningIn ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </>
        )}
      </button>
    </div>
  )
}

