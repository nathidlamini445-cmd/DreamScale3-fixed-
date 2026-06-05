import { SignIn } from '@clerk/nextjs'

/**
 * Single-file login route (no `[[...rest]]` folder).
 * Hash routing avoids catch-all folders that GitHub's upload UI often rejects.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6">
        <img src="/Logo.png" alt="DreamScale" className="w-24 h-24 object-contain" />
        <SignIn routing="hash" signUpUrl="/signup" />
      </div>
    </div>
  )
}
