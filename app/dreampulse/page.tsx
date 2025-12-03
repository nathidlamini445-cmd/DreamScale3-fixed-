"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, DollarSign, ArrowLeft } from "lucide-react"
import Link from "next/link"
import DreamPulseWizard from "@/components/dreampulse/DreamPulseWizard"
import RevenueIntelligence from "@/components/dreampulse/RevenueIntelligence"

export default function DreamPulsePage() {
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams?.get('tab')
  const [activeTab, setActiveTab] = useState('competitor')

  useEffect(() => {
    if (tabFromUrl === 'revenue') {
      setActiveTab('revenue')
    } else if (tabFromUrl === 'competitor') {
      setActiveTab('competitor')
    }
  }, [tabFromUrl])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 text-foreground relative overflow-hidden">
      <div className="relative z-10 main-container">
        {/* Back to Home Button - Top Left */}
        <div className="fixed top-4 left-4 z-50">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Main Content - Full Screen */}
        <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="competitor" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Competitor Intelligence
                </TabsTrigger>
                <TabsTrigger value="revenue" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Revenue Intelligence
                </TabsTrigger>
              </TabsList>

              <TabsContent value="competitor" className="mt-0">
                <DreamPulseWizard />
              </TabsContent>

              <TabsContent value="revenue" className="mt-0">
                <RevenueIntelligence />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
