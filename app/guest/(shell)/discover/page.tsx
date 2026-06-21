'use client'

import { Zap, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGuestWorkspace } from '@/lib/workspace/guest-context'

const starterResources = [
  {
    title: 'How Great Leaders Inspire Action',
    author: 'Simon Sinek',
    url: 'https://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action',
  },
  {
    title: 'The Power of Vulnerability',
    author: 'Brené Brown',
    url: 'https://www.ted.com/talks/brene_brown_the_power_of_vulnerability',
  },
  {
    title: 'Start With Why',
    author: 'Simon Sinek',
    url: 'https://simonsinek.com/books/start-with-why/',
  },
]

export default function GuestDiscoverPage() {
  const { session } = useGuestWorkspace()

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Zap className="w-6 h-6 text-[#005DFF]" />
          Discover
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Learning resources for {session?.workspaceName}
        </p>
      </div>

      <div className="grid gap-4">
        {starterResources.map((item) => (
          <div
            key={item.url}
            className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-center justify-between gap-4"
          >
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{item.title}</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{item.author}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="gap-2">
                Open
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
