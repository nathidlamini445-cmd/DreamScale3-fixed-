'use client'

import { LogIn, UserPlus, Loader2 } from 'lucide-react'
import { useState } from 'react'

export function LoginButton() {
  const [isSigningIn, setIsSigningIn] = useState(false)

  // SINGLE OAuth function - used by BOTH Signup and Login buttons
  const handleGoogleOAuth = async (e: React.MouseEvent) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/498d4eaf-7f87-46a2-947c-4c9bd111de9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/login-button-onboarding.tsx:10',message:'handleGoogleOAuth called (LoginButton)',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    e.preventDefault()
    e.stopPropagation()
    
    setIsSigningIn(true)
    
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/498d4eaf-7f87-46a2-947c-4c9bd111de9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/login-button-onboarding.tsx:17',message:'Starting dynamic import (LoginButton)',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      const { signInWithGoogle } = await import('@/lib/auth-utils')
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/498d4eaf-7f87-46a2-947c-4c9bd111de9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/login-button-onboarding.tsx:19',message:'Calling signInWithGoogle (LoginButton)',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      await signInWithGoogle()
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/498d4eaf-7f87-46a2-947c-4c9bd111de9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/login-button-onboarding.tsx:21',message:'signInWithGoogle completed (LoginButton)',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      // If successful, user will be redirected to Google OAuth page
      // No need to set isSigningIn to false - redirect will happen
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/498d4eaf-7f87-46a2-947c-4c9bd111de9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/login-button-onboarding.tsx:25',message:'Error caught (LoginButton)',data:{errorMessage:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.error('OAuth error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.'
      alert(`Error: ${errorMessage}`)
      setIsSigningIn(false)
    }
  }

  return (
    <div className="flex items-center gap-3" style={{ zIndex: 1000 }}>
      {/* Sign Up Button */}
      <button
        onClick={(e) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/498d4eaf-7f87-46a2-947c-4c9bd111de9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/login-button-onboarding.tsx:32',message:'Sign Up button clicked',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          handleGoogleOAuth(e)
        }}
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
        onClick={(e) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/498d4eaf-7f87-46a2-947c-4c9bd111de9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/login-button-onboarding.tsx:59',message:'Login button clicked',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          handleGoogleOAuth(e)
        }}
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

