"use client"

import { MessageSquare } from "lucide-react"
import Link from "next/link"

export function FeedbackButton() {
  return (
    <Link
      href="/feedback"
      className="fixed bottom-32 left-6 z-50 group"
    >
      <div className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm border border-gray-200/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 opacity-70 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-900/20 hover:border-gray-300/30 dark:hover:border-gray-600/30 hover:shadow-lg hover:text-gray-900 dark:hover:text-gray-100">
        <MessageSquare className="w-4 h-4" />
        <span className="text-sm font-medium">Feedback</span>
      </div>
    </Link>
  )
}

