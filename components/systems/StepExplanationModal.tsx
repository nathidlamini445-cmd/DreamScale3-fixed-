"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Sparkles, X, GripHorizontal } from "lucide-react"
import { AIResponse } from "@/components/ai-response"
import { cn } from "@/lib/utils"

interface StepExplanationModalProps {
  isOpen: boolean
  onClose: () => void
  step: string
  stepNumber: number
  workflowName: string
  systemName: string
}

export default function StepExplanationModal({
  isOpen,
  onClose,
  step,
  stepNumber,
  workflowName,
  systemName,
}: StepExplanationModalProps) {
  const [explanation, setExplanation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({ startX: 0, startY: 0, offsetX: 0, offsetY: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset position when modal opens
  useEffect(() => {
    if (isOpen) {
      setOffset({ x: 0, y: 0 })
    }
  }, [isOpen, step, stepNumber])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      setExplanation("")
      setIsLoading(true)

      const fetchExplanation = async () => {
        try {
          const response = await fetch('/api/systems/explain-step', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
              step,
              stepNumber,
              workflowName,
              systemName,
            }),
          })

          const data = await response.json().catch(() => ({}))

          if (!response.ok) {
            const apiError =
              typeof data.error === 'string'
                ? data.error
                : 'Failed to generate explanation. Please try again.'
            throw new Error(apiError)
          }

          const explanationText =
            typeof data.response === 'string'
              ? data.response
              : typeof data.explanation === 'string'
                ? data.explanation
                : ''
          if (!explanationText.trim()) {
            throw new Error('The AI returned an empty response. Please try again.')
          }
          setExplanation(explanationText)
        } catch (error) {
          console.error('Failed to fetch explanation:', error)
          const message =
            error instanceof Error
              ? error.message
              : 'Sorry, I could not generate an explanation at this time. Please try again later.'
          setExplanation(message)
        } finally {
          setIsLoading(false)
        }
      }

      fetchExplanation()
    }
  }, [isOpen, step, stepNumber, systemName, workflowName])

  const onDragStart = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest('button')) return
      e.preventDefault()
      setIsDragging(true)
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        offsetX: offset.x,
        offsetY: offset.y,
      }
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    [offset]
  )

  const onDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      setOffset({
        x: dragRef.current.offsetX + (e.clientX - dragRef.current.startX),
        y: dragRef.current.offsetY + (e.clientY - dragRef.current.startY),
      })
    },
    [isDragging]
  )

  const onDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      {/* Draggable panel — starts centered, move via header */}
      <div
        role="dialog"
        aria-modal
        aria-labelledby="step-explanation-title"
        className={cn(
          'absolute left-1/2 top-1/2 flex max-h-[85vh] w-[min(42rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-slate-800',
          !isDragging && 'transition-transform duration-150'
        )}
        style={{
          transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
        }}
      >
        {/* Drag handle / header */}
        <div
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
          className={cn(
            'flex shrink-0 cursor-grab items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 select-none active:cursor-grabbing dark:border-gray-700',
            isDragging && 'cursor-grabbing'
          )}
        >
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-gray-400">
              <GripHorizontal className="h-3 w-3" />
              Drag to move
            </div>
            <h2
              id="step-explanation-title"
              className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-[#39d2c0]" />
              Step {stepNumber} Explanation
            </h2>
            <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
              {workflowName} · {systemName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-5 py-4">
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/50">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{step}</p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#39d2c0]" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Generating detailed explanation...
              </p>
            </div>
          ) : explanation ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <AIResponse content={explanation} />
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">Click to generate explanation</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
