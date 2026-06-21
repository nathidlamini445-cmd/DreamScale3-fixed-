'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Target, Calendar, Sparkles, Trophy, Crown, Star, Zap, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  longestStreak: number;
  weeklyProgress: number[];
}

function buildFallbackWeek(streak: number, todayIdx: number) {
  const w = [0, 0, 0, 0, 0, 0, 0];
  if (streak > 0) {
    w[todayIdx] = 1;
    for (let i = 1; i < streak && i < 7; i++) w[(todayIdx - i + 7) % 7] = 1;
  }
  return w;
}

export default function StreakCelebration({
  isOpen, 
  onClose, 
  currentStreak, 
  longestStreak,
  weeklyProgress 
}: StreakCelebrationProps) {
  const [animatedStreak, setAnimatedStreak] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Animate streak number counting up from 0 to current streak
      let count = 0;
      const increment = currentStreak > 0 ? Math.ceil(currentStreak / 20) : 1;
      const timer = setInterval(() => {
        count += increment;
        if (count >= currentStreak) {
          setAnimatedStreak(currentStreak);
          clearInterval(timer);
        } else {
          setAnimatedStreak(count);
        }
      }, 50);
      
      return () => clearInterval(timer);
    } else {
      setAnimatedStreak(0);
    }
  }, [isOpen, currentStreak]);

  const getStreakLevel = (streak: number) => {
    if (streak >= 100) return { level: 'Legendary', color: 'text-purple-600 dark:text-purple-400', icon: Crown };
    if (streak >= 50) return { level: 'Epic', color: 'text-red-600 dark:text-red-400', icon: Trophy };
    if (streak >= 30) return { level: 'Master', color: 'text-orange-600 dark:text-orange-400', icon: Star };
    if (streak >= 21) return { level: 'Expert', color: 'text-yellow-600 dark:text-yellow-400', icon: Zap };
    if (streak >= 14) return { level: 'Advanced', color: 'text-green-600 dark:text-green-400', icon: Target };
    if (streak >= 7) return { level: 'Intermediate', color: 'text-blue-600 dark:text-blue-400', icon: Calendar };
    if (streak >= 3) return { level: 'Beginner', color: 'text-gray-600 dark:text-gray-400', icon: Calendar };
    return { level: 'Starting', color: 'text-gray-500 dark:text-gray-500', icon: Calendar };
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 100) return "🔥 LEGENDARY! You're unstoppable! 🔥";
    if (streak >= 50) return "🔥 EPIC STREAK! You're a master! 🔥";
    if (streak >= 30) return "🔥 MASTER LEVEL! Incredible! 🔥";
    if (streak >= 21) return "🔥 EXPERT STREAK! On fire! 🔥";
    if (streak >= 14) return "🔥 ADVANCED! You're crushing it! 🔥";
    if (streak >= 7) return "🔥 INTERMEDIATE! Great momentum! 🔥";
    if (streak >= 3) return "🔥 BEGINNER! Building habits! 🔥";
    return "🎯 AMAZING START! You're building momentum! 🎯";
  };

  const getEncouragingMessage = (streak: number) => {
    if (streak >= 100) return "You're a true legend! 100+ days of consistency is incredible!";
    if (streak >= 50) return "Epic achievement! You've mastered the art of consistency!";
    if (streak >= 30) return "Master level unlocked! You're building unstoppable habits!";
    if (streak >= 21) return "Expert streak! You've formed a solid habit - keep going!";
    if (streak >= 14) return "Advanced level! Two weeks of dedication - you're on fire!";
    if (streak >= 7) return "Intermediate streak! One week down - momentum is building!";
    if (streak >= 3) return "Beginner streak! You're starting strong - keep the momentum!";
    return "First day complete! Every journey begins with a single step!";
  };

  const getMotivationalMessage = (streak: number) => {
    if (streak >= 100) return "You kept your Perfect Streak for 100+ days in a row!";
    if (streak >= 50) return "You kept your Perfect Streak for 50+ days in a row!";
    if (streak >= 30) return "You kept your Perfect Streak for 30+ days in a row!";
    if (streak >= 21) return "You kept your Perfect Streak for 3 weeks in a row!";
    if (streak >= 14) return "You kept your Perfect Streak for 2 weeks in a row!";
    if (streak >= 7) return "You kept your Perfect Streak for 1 week in a row!";
    if (streak >= 3) return "You kept your Perfect Streak for 3 days in a row!";
    return "You completed all your tasks today!";
  };

  const streakLevel = getStreakLevel(currentStreak);
  const streakMessage = getStreakMessage(currentStreak);
  const encouragingMessage = getEncouragingMessage(currentStreak);
  const motivationalMessage = getMotivationalMessage(currentStreak);

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();
  const week = weeklyProgress?.length === 7 ? weeklyProgress : buildFallbackWeek(currentStreak, today);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/20 dark:bg-black/40"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md mx-4"
          >
            {/* Main Celebration Card */}
            <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-slate-800 dark:via-slate-700 dark:to-slate-900 rounded-3xl p-8 shadow-2xl border-2 border-gray-200 dark:border-slate-600">
              
              {/* Streak flame */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <Flame className="h-16 w-16 text-orange-500 drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 20px #f97316)' }} />
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0"
                  >
                    <Flame className="h-16 w-16 text-orange-400 opacity-60" style={{ filter: 'drop-shadow(0 0 15px #fb923c)' }} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Streak Number */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-center mb-4"
              >
                <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
                  {animatedStreak}
                </div>
                <div className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  day streak
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {encouragingMessage}
                </motion.div>
              </motion.div>

              {/* Weekly Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="bg-gray-100 dark:bg-slate-800 rounded-2xl p-6 mb-6"
              >
                {/* Days of Week */}
                <div className="flex justify-between mb-3">
                  {daysOfWeek.map((day, index) => (
                    <span
                      key={index}
                      className={`text-sm font-medium ${
                        index === today
                          ? 'text-orange-500'
                          : week[index]
                            ? 'text-gray-700 dark:text-gray-300'
                            : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>

                {/* Week streak row (Duolingo-style) */}
                <div className="relative mb-4">
                  <div className="flex justify-between items-end">
                    {daysOfWeek.map((day, index) => {
                      const done = week[index] === 1
                      const isToday = index === today
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{
                            opacity: done ? 1 : 0.35,
                            scale: isToday && done ? 1.1 : done ? 1 : 0.85,
                          }}
                          transition={{ delay: 0.8 + index * 0.08, duration: 0.4 }}
                          className="flex flex-col items-center gap-1"
                        >
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                              done
                                ? 'border-orange-400 bg-orange-500/15'
                                : 'border-gray-300 dark:border-gray-600 bg-transparent'
                            } ${isToday ? 'ring-2 ring-orange-400/40' : ''}`}
                          >
                            {done ? (
                              <Flame
                                className="h-5 w-5 text-orange-500"
                                style={{ filter: 'drop-shadow(0 0 6px #f97316)' }}
                              />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                            )}
                          </div>
                          <span
                            className={`text-[10px] ${
                              isToday ? 'font-bold text-orange-500' : 'text-gray-500'
                            }`}
                          >
                            {day}
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Motivational Message */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center text-gray-900 dark:text-white text-sm font-medium"
                >
                  {motivationalMessage}
                </motion.p>
              </motion.div>

              {/* Streak Level Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="text-center mb-6"
              >
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/20 dark:bg-slate-800/50 backdrop-blur-sm ${streakLevel.color}`}>
                  {React.createElement(streakLevel.icon, { className: "h-5 w-5" })}
                  <span className="font-semibold">{streakLevel.level}</span>
                </div>
              </motion.div>

              {/* Continue Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="flex justify-center"
              >
                <Button
                  onClick={onClose}
                  className="bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  CONTINUE
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
