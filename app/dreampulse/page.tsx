"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, DollarSign } from "lucide-react"
import DreamPulseWizard from "@/components/dreampulse/DreamPulseWizard"
import RevenueIntelligence from "@/components/dreampulse/RevenueIntelligence"

export default function DreamPulsePage() {
  const [activeTab, setActiveTab] = useState('competitor')

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 text-foreground relative overflow-hidden">
      <div className="relative z-10 main-container">
        <SidebarNav />
        <main className="ml-64 pt-8">
          {/* Header */}
          <div className="bg-white dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Competitor<span className="text-[#2563eb]"> Intelligence</span>
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    AI-powered competitive analysis and revenue intelligence
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#2563eb]/10 rounded-lg border border-[#2563eb]/20">
                  <span className="text-sm font-medium text-[#2563eb]">AI Powered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="competitor" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Competitor Intelligence
                </TabsTrigger>
                <TabsTrigger value="revenue" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Revenue Intelligence
                </TabsTrigger>
              </TabsList>

              <TabsContent value="competitor" className="mt-6">
                <DreamPulseWizard />
              </TabsContent>

              <TabsContent value="revenue" className="mt-6">
                <RevenueIntelligence />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
