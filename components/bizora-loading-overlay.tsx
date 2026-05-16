'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Atom, Loader2 } from 'lucide-react'

interface BizoraLoadingOverlayProps {
  isVisible: boolean
}

export function BizoraLoadingOverlay({ isVisible }: BizoraLoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="text-center space-y-8 px-4 max-w-md">
            {/* Bizora AI Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex justify-center"
            >
              <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Atom className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Opening Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-3"
            >
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Opening Bizora AI
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Preparing your AI assistant...
              </p>
            </motion.div>

            {/* Loading Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex justify-center"
            >
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

