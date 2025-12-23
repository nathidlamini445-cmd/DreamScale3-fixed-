'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface WelcomeLoadingScreenProps {
  isVisible: boolean
}

export function WelcomeLoadingScreen({ isVisible }: WelcomeLoadingScreenProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.8,
            exit: { duration: 0.6 }
          }}
          className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex items-center justify-center"
        >
          <div className="text-center space-y-12 px-4 max-w-4xl">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <div className="relative w-40 h-40 md:w-48 md:h-48">
                <Image
                  src="/Logo.png"
                  alt="DreamScale Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </motion.div>

            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-black dark:text-white">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-[#191970] via-[#000033] to-[#191970] dark:from-[#39d2c0] dark:via-[#005DFF] dark:to-[#39d2c0] bg-clip-text text-transparent">
                  DreamScale
                </span>
              </h1>
              <p className="text-2xl md:text-3xl lg:text-4xl text-gray-600 dark:text-gray-300 font-medium">
                Let's make your dreams come true
              </p>
            </motion.div>

            {/* Loading Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex justify-center pt-6"
            >
              <div className="relative w-24 h-24 md:w-28 md:h-28">
                <div className="absolute inset-0 border-[3px] md:border-4 border-[#191970]/20 dark:border-[#39d2c0]/20 rounded-full"></div>
                <motion.div
                  className="absolute inset-0 border-[3px] md:border-4 border-transparent border-t-[#191970] dark:border-t-[#39d2c0] rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
