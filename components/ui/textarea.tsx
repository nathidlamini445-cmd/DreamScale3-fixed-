import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-900 px-3 py-2 text-base text-gray-900 dark:text-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.3)] transition-[color,box-shadow,border-color] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-gray-400/80 dark:focus-visible:border-gray-600/80 focus-visible:ring-gray-300/30 dark:focus-visible:ring-gray-700/30 focus-visible:ring-[2px]',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
