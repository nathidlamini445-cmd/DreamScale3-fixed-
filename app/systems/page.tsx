"use client"

import { Suspense } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import SystemBuilder from "@/components/systems/SystemBuilder"
import { Settings } from "lucide-react"
import { useSubscriptionStatus } from "@/hooks/use-subscription-status"
import { ProPlanBadge } from "@/components/pro-plan-badge"

function SystemsPageContent() {
  const { isPro } = useSubscriptionStatus()

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground relative overflow-y-auto">
      <div className="relative z-10 main-container">
        <SidebarNav />
        <main className="ml-64 pt-8 overflow-y-auto">
          <div className="bg-white dark:bg-slate-950 border-b border-gray-200/60 dark:border-gray-800/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-6">
                <div>
                  <h1 className="text-3xl font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-7 h-7 text-[#39d2c0]" />
                    Systems
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Build and manage operational systems for your business
                  </p>
                </div>
                {isPro && <ProPlanBadge active />}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <SystemBuilder />
          </div>
        </main>
      </div>
    </div>
  )
}

export default function SystemsPage() {
  return (
    <Suspense fallback={null}>
      <SystemsPageContent />
    </Suspense>
  )
}
