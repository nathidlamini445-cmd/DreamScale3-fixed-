import { SignUp } from '@clerk/nextjs'

/**
 * Single-file signup route (no `[[...rest]]` folder).
 * Hash routing avoids catch-all folders that GitHub's upload UI often rejects.
 */
export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6">
        <img src="/Logo.png" alt="DreamScale" className="w-24 h-24 object-contain" />
        <SignUp routing="hash" signInUrl="/login" />
      </div>
    </div>
  )
}
