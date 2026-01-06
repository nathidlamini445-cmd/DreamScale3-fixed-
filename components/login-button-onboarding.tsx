'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogIn } from 'lucide-react'

export function LoginButton() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/login')
  }

  return (
    <Button
      variant="outline"
      className="fixed top-4 right-10 z-50 flex items-center gap-2"
      onClick={handleClick}
    >
      <LogIn className="w-4 h-4" />
      Login
    </Button>
  )
}

