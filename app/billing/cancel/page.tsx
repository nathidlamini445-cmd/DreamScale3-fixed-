import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Payment cancelled — DreamScale',
}

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Payment cancelled
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          No charge was made. You can try again whenever you are ready.
        </p>
        <Button asChild>
          <Link href="/billing">Back to subscribe</Link>
        </Button>
      </div>
    </div>
  )
}
