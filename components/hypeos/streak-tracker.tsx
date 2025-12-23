'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Flame, 
  Calendar, 
  Target,
  TrendingUp,
  Star,
  Zap,
  Trophy,
  Crown
} from 'lucide-react';

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
  streakGoal: number;
  onStreakMilestone?: (milestone: string) => void;
}

export default function StreakTracker({ 
  currentStreak, 
  longestStreak, 
  totalDaysActive, 
  streakGoal,
  onStreakMilestone 
}: StreakTrackerProps) {
  const [animatedStreak, setAnimatedStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStreak(currentStreak);
      
      // Check for milestone celebrations
      if (currentStreak > 0 && currentStreak % 7 === 0) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
        onStreakMilestone?.(`${currentStreak} day streak!`);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [currentStreak, onStreakMilestone]);

  const getStreakLevel = (streak: number) => {
    if (streak >= 100) return { level: 'Legendary', color: 'text-purple-600 dark:text-purple-400', icon: Crown };
    if (streak >= 50) return { level: 'Epic', color: 'text-red-600 dark:text-red-400', icon: Trophy };
    if (streak >= 30) return { level: 'Master', color: 'text-orange-600 dark:text-orange-400', icon: Star };
    if (streak >= 21) return { level: 'Expert', color: 'text-yellow-600 dark:text-yellow-400', icon: Zap };
    if (streak >= 14) return { level: 'Advanced', color: 'text-green-600 dark:text-green-400', icon: TrendingUp };
    if (streak >= 7) return { level: 'Intermediate', color: 'text-blue-600 dark:text-blue-400', icon: Target };
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
    return "🔥 Start your streak today! 🔥";
  };

  const getStreakRewards = (streak: number) => {
    const rewards = [];
    if (streak >= 3) rewards.push('1.5x Points Multiplier');
    if (streak >= 7) rewards.push('Unlock Bronze Rewards');
    if (streak >= 14) rewards.push('2x Points Multiplier');
    if (streak >= 21) rewards.push('Unlock Silver Rewards');
    if (streak >= 30) rewards.push('3x Points Multiplier');
    if (streak >= 50) rewards.push('Unlock Gold Rewards');
    if (streak >= 100) rewards.push('Legendary Status');
    return rewards;
  };

  const streakLevel = getStreakLevel(currentStreak);
  const streakMessage = getStreakMessage(currentStreak);
  const streakRewards = getStreakRewards(currentStreak);
  const streakProgress = Math.min((currentStreak / streakGoal) * 100, 100);

  const nextMilestone = () => {
    const milestones = [3, 7, 14, 21, 30, 50, 100];
    return milestones.find(milestone => milestone > currentStreak) || null;
  };

  const nextMilestoneValue = nextMilestone();
  const daysUntilNext = nextMilestoneValue ? nextMilestoneValue - currentStreak : 0;

  return (
    <Card className="w-full flex-1 bg-white dark:bg-slate-900 border-gray-200/60 dark:border-gray-800/60 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.3)]">
      <CardHeader className="pb-2 px-3 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
            Streak
          </CardTitle>
          <span className="text-xs text-gray-500 dark:text-gray-400">{streakLevel.level}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-3 pb-3">
        {/* Current Streak Display */}
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 dark:text-white leading-none">
            {animatedStreak}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">day streak</p>
        </div>

        {/* Progress Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Progress</span>
            <span className="text-gray-900 dark:text-white">{currentStreak}/{streakGoal}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
            <div 
              className="bg-gray-900 dark:bg-white h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((currentStreak / streakGoal) * 100, 100)}%` }}
            />
          </div>
          {nextMilestoneValue && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Next: {nextMilestoneValue} days ({daysUntilNext} more)
            </p>
          )}
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {longestStreak}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Longest</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {totalDaysActive}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Days</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Recent Activity</h4>
          <div className="flex gap-1">
            {Array.from({ length: 7 }, (_, i) => {
              const dayOffset = 6 - i;
              const isActive = currentStreak > dayOffset;
              return (
                <div
                  key={i}
                  className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${
                    isActive 
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {dayOffset === 0 ? 'T' : dayOffset === 1 ? 'Y' : dayOffset}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
