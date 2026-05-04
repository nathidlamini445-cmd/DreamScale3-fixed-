"use client"

import { useState } from 'react'
import { Workflow } from "./SystemBuilder"
import { ArrowRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface MiroFlowDiagramProps {
  workflow: Workflow
  onStepClick?: (step: string, index: number) => void
}

export default function MiroFlowDiagram({ workflow, onStepClick }: MiroFlowDiagramProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-max px-4 py-6">
        <div className="flex items-center gap-10 flex-nowrap justify-start">
          {workflow.steps.map((step, index) => (
            <div key={index} className="flex items-center gap-6">
              {/* Step Box - Miro Style */}
              <div
                className="relative group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Card
                  className={`
                    w-96 min-w-[384px] max-w-[450px] p-6 bg-white dark:bg-gray-800 border-2 rounded-xl shadow-lg
                    transition-all duration-300 cursor-pointer
                    ${hoveredIndex === index 
                      ? 'border-[#39d2c0] shadow-xl scale-105 ring-2 ring-[#39d2c0]/20' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-[#39d2c0]/50 hover:shadow-xl'
                    }
                  `}
                  onClick={() => onStepClick?.(step, index)}
                >
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[#39d2c0] text-white flex items-center justify-center font-bold text-base shadow-xl ring-4 ring-white dark:ring-gray-800">
                    {index + 1}
                  </div>
                  
                  {/* Step Content */}
                  <div className="pt-3">
                    <p className="text-base font-semibold text-gray-900 dark:text-white leading-relaxed">
                      {step}
                    </p>
                  </div>
                  
                  {/* Info Icon */}
                  <div className="absolute -bottom-3 -right-3 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg ring-2 ring-white dark:ring-gray-800">
                    <Info className="w-4 h-4" />
                  </div>
                </Card>
              </div>

              {/* Arrow Connector */}
              {index < workflow.steps.length - 1 && (
                <div className="flex items-center">
                  <div className="relative">
                    <ArrowRight className="w-10 h-10 text-gray-400 dark:text-gray-500 transition-colors group-hover:text-[#39d2c0]" />
                    {/* Animated line effect */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-10 h-1 bg-[#39d2c0] animate-pulse opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

