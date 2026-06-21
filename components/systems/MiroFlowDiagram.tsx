"use client"

import { useState } from 'react'
import { Workflow } from "./SystemBuilder"
import { ArrowRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface MiroFlowDiagramProps {
  workflow: Workflow
  onStepClick?: (step: string, index: number) => void
  variant?: 'default' | 'minimal'
}

export default function MiroFlowDiagram({
  workflow,
  onStepClick,
  variant = 'default',
}: MiroFlowDiagramProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const isMinimal = variant === 'minimal'

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className={`min-w-max ${isMinimal ? 'px-1 py-2' : 'px-4 py-6'}`}>
        <div className="flex flex-nowrap items-center justify-start gap-10">
          {workflow.steps.map((step, index) => (
            <div key={index} className="flex items-center gap-6">
              <div
                className="group relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Card
                  className={`
                    cursor-pointer transition-all duration-200
                    ${isMinimal
                      ? `w-64 min-w-[240px] max-w-[280px] rounded-md border p-4 shadow-none
                        ${hoveredIndex === index
                          ? 'border-[#37352F]/30 bg-[#F7F6F3] dark:border-white/20 dark:bg-white/[0.06]'
                          : 'border-[#E9E9E7] bg-white hover:border-[#37352F]/20 dark:border-white/10 dark:bg-[#252525]'
                        }`
                      : `w-96 min-w-[384px] max-w-[450px] rounded-xl border-2 p-6 shadow-lg
                        ${hoveredIndex === index
                          ? 'scale-105 border-[#39d2c0] shadow-xl ring-2 ring-[#39d2c0]/20'
                          : 'border-gray-300 hover:border-[#39d2c0]/50 hover:shadow-xl dark:border-gray-600'
                        }`
                    }
                  `}
                  onClick={() => onStepClick?.(step, index)}
                >
                  <div
                    className={
                      isMinimal
                        ? 'mb-2 text-xs font-medium text-[#9B9A97]'
                        : 'absolute -left-4 -top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#39d2c0] text-base font-bold text-white shadow-xl ring-4 ring-white dark:ring-gray-800'
                    }
                  >
                    {index + 1}
                  </div>

                  <div className={isMinimal ? '' : 'pt-3'}>
                    <p
                      className={
                        isMinimal
                          ? 'text-sm leading-relaxed text-[#37352F] dark:text-[#CFCFCB]'
                          : 'text-base font-semibold leading-relaxed text-gray-900 dark:text-white'
                      }
                    >
                      {step}
                    </p>
                  </div>

                  {!isMinimal && (
                    <div className="absolute -bottom-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white opacity-0 shadow-lg ring-2 ring-white transition-opacity group-hover:opacity-100 dark:ring-gray-800">
                      <Info className="h-4 w-4" />
                    </div>
                  )}
                </Card>
              </div>

              {index < workflow.steps.length - 1 && (
                <div className="flex items-center">
                  <ArrowRight
                    className={
                      isMinimal
                        ? 'h-5 w-5 text-[#E9E9E7] dark:text-white/20'
                        : 'h-10 w-10 text-gray-400 transition-colors group-hover:text-[#39d2c0] dark:text-gray-500'
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

