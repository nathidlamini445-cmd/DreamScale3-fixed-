'use client'



import { usePathname, useRouter } from 'next/navigation'

import { Home, Users, Zap, Atom, Building, Settings, Search } from 'lucide-react'

import { cn } from '@/lib/utils'

import { useGuestWorkspace } from '@/lib/workspace/guest-context'



const navItems = [

  { href: '/guest/dashboard', label: 'Home', icon: Home },

  { href: '/guest/systems', label: 'Systems', icon: Settings },

  { href: '/guest/intelligence', label: 'Competitive Intelligence', icon: Search },

  { href: '/guest/team', label: 'People', icon: Users },

  { href: '/guest/discover', label: 'Discover', icon: Zap },

  { href: '/guest/bizora', label: 'Bizora AI', icon: Atom },

]



export function GuestSidebarNav() {

  const pathname = usePathname()

  const router = useRouter()

  const { session } = useGuestWorkspace()



  return (

    <aside className="w-64 shrink-0 h-screen sticky top-0 z-40 border-r border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 flex flex-col">

      <div className="p-5 border-b border-gray-200 dark:border-slate-800">

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-lg bg-[#005DFF] flex items-center justify-center shrink-0">

            <Building className="w-5 h-5 text-white" />

          </div>

          <div className="min-w-0">

            <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-slate-400">

              Guest workspace

            </p>

            <p className="font-semibold text-gray-900 dark:text-white truncate">

              {session?.workspaceName ?? 'Workspace'}

            </p>

          </div>

        </div>

      </div>



      <nav className="flex-1 p-3 space-y-1">

        {navItems.map((item) => {

          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

          const Icon = item.icon

          return (

            <button

              key={item.href}

              type="button"

              onClick={() => router.push(item.href)}

              className={cn(

                'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left',

                active

                  ? 'bg-[#005DFF]/10 text-[#005DFF]'

                  : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'

              )}

            >

              <Icon className="w-4 h-4 shrink-0" />

              {item.label}

            </button>

          )

        })}

      </nav>



      <div className="p-4 border-t border-gray-200 dark:border-slate-800">

        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">

          Collaborating as a guest. Want your own account?{' '}

          <button

            type="button"

            onClick={() => router.push('/signup')}

            className="text-[#005DFF] underline"

          >

            Sign up

          </button>

        </p>

      </div>

    </aside>

  )

}


