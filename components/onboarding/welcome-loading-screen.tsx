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
            duration: 0.8
          }}
          className="fixed inset-0 z-[100] bg-gradient-to-br from-white via-blue-100/50 to-cyan-100/60 dark:from-slate-950 dark:via-blue-950/30 dark:to-cyan-950/40 flex items-center justify-center"
        >
          <div className="text-center space-y-12 px-4 max-w-4xl">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <div className="relative w-40 h-40 md:w-48 md:h-48 bg-white/10 rounded-full" style={{ filter: 'drop-shadow(0 0 30px rgba(57, 210, 192, 0.8)) drop-shadow(0 0 60px rgba(0, 93, 255, 0.5))' }}>
                <Image
                  src="/Logo.png"
                  alt="DreamScale Logo"
                  fill
                  className="object-contain"
                  style={{ 
                    filter: 'brightness(2.5) contrast(1.3) saturate(1.4)',
                    WebkitFilter: 'brightness(2.5) contrast(1.3) saturate(1.4)'
                  }}
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
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-black dark:text-white" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
                Welcome to{' '}
                <span 
                  className="bg-gradient-to-r from-[#005DFF] via-[#39d2c0] to-[#005DFF] dark:from-[#39d2c0] dark:via-[#60a5fa] dark:to-[#39d2c0] bg-clip-text text-transparent"
                  style={{ 
                    filter: 'brightness(1.4)',
                    textShadow: '0 0 20px rgba(57, 210, 192, 0.4), 0 0 40px rgba(0, 93, 255, 0.2)'
                  }}
                >
                  DreamScale
                </span>
              </h1>
              <p className="text-2xl md:text-3xl lg:text-4xl text-black dark:text-gray-50 font-medium" style={{ textShadow: '0 1px 5px rgba(0, 0, 0, 0.1)' }}>
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
                <div className="absolute inset-0 border-[3px] md:border-4 border-[#005DFF]/50 dark:border-[#39d2c0]/60 rounded-full"></div>
                <motion.div
                  className="absolute inset-0 border-[3px] md:border-4 border-transparent border-t-[#005DFF] dark:border-t-[#39d2c0] rounded-full"
                  style={{ filter: 'brightness(1.5)' }}
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
