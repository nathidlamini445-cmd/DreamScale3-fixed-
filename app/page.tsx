import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6">
        <img src="/Logo.png" alt="DreamScale" className="w-24 h-24 object-contain" />
        <SignUp routing="path" path="/signup" signInUrl="/login" />
      </div>
    </div>
  )
}
