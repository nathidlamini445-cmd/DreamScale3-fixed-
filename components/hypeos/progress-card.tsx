'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Zap, Star } from 'lucide-react';

interface ProgressCardProps {
  level?: number;
  currentPoints?: number;
  goalProgress?: number;
  goalCurrent?: string;
  goalTarget?: string;
  nextLevelProgress?: number;
  nextLevelPoints?: number;
  streak?: number;
  totalPoints?: number;
}

export default function ProgressCard({
  level = 1,
  currentPoints = 0,
  goalProgress = 0,
  goalCurrent = '0',
  goalTarget = '15000/m',
  nextLevelProgress = 0,
  nextLevelPoints = 100,
  streak = 0,
  totalPoints = 0
}: ProgressCardProps) {
  // Calculate circular progress (0-100%)
  const progressPercentage = Math.min(Math.max(goalProgress, 0), 100);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (progressPercentage / 100) * circumference;

  return (
    <Card className="w-full flex-1 bg-white dark:bg-slate-900 border-gray-200/60 dark:border-gray-800/60 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.3)]">
      <CardHeader className="pb-2 px-3 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
            Progress
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-gray-900 dark:text-white">
            <Star className="w-3 h-3" />
            <span>Level {level}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-3 pb-3">
        {/* Circular Progress Bar */}
        <div className="flex items-center justify-center py-2">
          <div className="relative w-36 h-36">
            <svg className="transform -rotate-90 w-36 h-36" viewBox="0 0 100 100">
              {/* Background circle - white ring */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                className="text-gray-900 dark:text-white"
              />
              {/* Progress circle - teal */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="text-[#39d2c0] transition-all duration-500"
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Math.round(progressPercentage)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Goal */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Goal</span>
            <span className="text-gray-900 dark:text-white">
              {goalCurrent} / {goalTarget}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
            <div 
              className="bg-gray-900 dark:bg-white h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(goalProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Next Level */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Next Level</span>
            <span className="text-gray-900 dark:text-white">
              {Math.round(nextLevelProgress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
            <div 
              className="bg-gray-900 dark:bg-white h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(nextLevelProgress, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {currentPoints} / {nextLevelPoints} points
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {streak} Streak
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {totalPoints} Points
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

