'use client'

import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Dumbbell,
  Target,
  Gift,
  BarChart3,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { vq } from '@/lib/hypeos/path-ui-theme'

type NavId = 'learn' | 'practice' | 'quests' | 'rewards' | 'progress'

type LearnSidebarProps = {
  active?: NavId
  onNavigate?: (id: NavId) => void
}

const NAV_ITEMS: {
  id: NavId | 'home'
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
}[] = [
  { id: 'home', label: 'Home', icon: Home, href: '/dashboard' },
  { id: 'learn', label: 'Venture Quest', icon: BookOpen },
  { id: 'practice', label: 'Daily focus', icon: Dumbbell, href: '/venture-quest/daily' },
  { id: 'quests', label: 'Quests', icon: Target },
  { id: 'rewards', label: 'Rewards', icon: Gift, href: '/venture-quest/rewards' },
  { id: 'progress', label: 'Progress', icon: BarChart3, href: '/venture-quest/progress' },
]

export default function LearnSidebar({
  active = 'learn',
  onNavigate,
}: LearnSidebarProps) {
  const router = useRouter()

  const handleClick = (item: (typeof NAV_ITEMS)[0]) => {
    if (item.href) {
      router.push(item.href)
      return
    }
    if (item.id !== 'home') {
      onNavigate?.(item.id as NavId)
    }
  }

  return (
    <aside
      className={cn(
        'hidden w-[220px] shrink-0 flex-col border-r lg:flex',
        vq.surface,
        vq.border
      )}
    >
      <div className="px-5 py-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#39d2c0]/80">
          Venture Quest
        </p>
      </div>

      <nav data-hypeos-nav className="flex flex-1 flex-col gap-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = item.id === 'learn' && active === 'learn'
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                isActive
                  ? cn(vq.navActive)
                  : cn(vq.navInactive, 'hover:bg-gray-50 dark:hover:bg-white/[0.03]')
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', isActive && 'text-[#39d2c0]')} />
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
