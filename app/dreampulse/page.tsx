"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, DollarSign, ArrowLeft } from "lucide-react"
import Link from "next/link"
import DreamPulseWizard from "@/components/dreampulse/DreamPulseWizard"
import RevenueIntelligence from "@/components/dreampulse/RevenueIntelligence"

function DreamPulseContent() {
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
    <>
      {/* Main Content - Full Screen */}
      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg p-1 shadow-sm">
              <TabsTrigger 
                value="competitor" 
                className="flex items-center justify-center gap-2 rounded-md cursor-pointer transition-all duration-200 font-medium text-sm
                  data-[state=active]:bg-blue-500 dark:data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md
                  data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-700 dark:data-[state=inactive]:text-gray-300
                  hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <Search className="w-4 h-4" />
                <span>Competitor Intelligence</span>
              </TabsTrigger>
              <TabsTrigger 
                value="revenue" 
                className="flex items-center justify-center gap-2 rounded-md cursor-pointer transition-all duration-200 font-medium text-sm
                  data-[state=active]:bg-blue-500 dark:data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md
                  data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-700 dark:data-[state=inactive]:text-gray-300
                  hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <DollarSign className="w-4 h-4" />
                <span>Revenue Intelligence</span>
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
    </>
  )
}

export default function DreamPulsePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-foreground relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}></div>
      </div>
      
      <div className="relative z-10 main-container">
        {/* Back to Home Button - Top Left */}
        <div className="fixed top-6 left-6 z-50">
          <Link
            href="/"
            className="group flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-slate-800/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Wrap content in Suspense for useSearchParams */}
        <Suspense fallback={
          <main className="pt-24 px-4 sm:px-6 lg:px-8 pb-16">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 dark:border-gray-700 border-t-[#2563eb] mx-auto"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-[#2563eb] opacity-20"></div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Loading DreamPulse...</p>
                </div>
              </div>
            </div>
          </main>
        }>
          <DreamPulseContent />
        </Suspense>
      </div>
    </div>
  )
}
