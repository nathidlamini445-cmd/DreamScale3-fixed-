'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSessionSafe } from '@/lib/session-context';
import {
  buildProgressAnalytics,
  type ProgressTask,
  type ProgressUser,
} from '@/lib/hypeos/progress-analytics';
import { loadDailyQuestActivity } from '@/lib/hypeos/daily-quest-sync';
import { buildGoalId } from '@/lib/hypeos/goal-storage';
import { updateUserHistory } from '@/lib/hypeos/daily-goals';
import {
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  Flame,
  Star,
  ArrowLeft,
} from 'lucide-react';

export default function ProgressPage() {
  const router = useRouter();
  const sessionContext = useSessionSafe();
  const { user: authUser } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [user, setUser] = useState<ProgressUser | null>(null);
  const [tasks, setTasks] = useState<ProgressTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userId =
    authUser?.id ||
    sessionContext?.sessionData?.email ||
    user?.name ||
    'default-user';

  // Enable scrolling (same as other Venture Quest sub-pages)
  useEffect(() => {
    document.documentElement.setAttribute('data-hypeos-page', 'true');
    document.body.setAttribute('data-hypeos-page', 'true');

    return () => {
      document.documentElement.removeAttribute('data-hypeos-page');
      document.body.removeAttribute('data-hypeos-page');
    };
  }, []);

  const loadData = useCallback(() => {
    try {
      const hypeos = sessionContext?.sessionData?.hypeos;
      let userToLoad: ProgressUser | null = hypeos?.user || null;
      let tasksToLoad: ProgressTask[] = hypeos?.tasks || [];

      if (!userToLoad || tasksToLoad.length === 0) {
        const stored = localStorage.getItem('dreamscale_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          const sessionUser = parsed?.hypeos?.user;
          const goalsList = parsed?.hypeos?.allGoals || [];
          userToLoad =
            userToLoad ||
            sessionUser ||
            (goalsList.length > 0 ? goalsList[0] : null);
          if (tasksToLoad.length === 0) {
            tasksToLoad = parsed?.hypeos?.tasks || [];
          }
        }
      }

      if (!userToLoad) {
        const savedUser = localStorage.getItem('hypeos:user');
        if (savedUser) {
          userToLoad = JSON.parse(savedUser);
        }
      }

      if (tasksToLoad.length === 0) {
        const savedTasks = localStorage.getItem('hypeos:tasks');
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks);
          if (Array.isArray(parsedTasks)) {
            tasksToLoad = parsedTasks;
          }
        }
      }

      if (userToLoad) {
        setUser({
          name: userToLoad.name || 'User',
          level: userToLoad.level || 1,
          hypePoints: userToLoad.hypePoints || 0,
          currentStreak: userToLoad.currentStreak || 0,
          longestStreak: userToLoad.longestStreak || 0,
          goalProgress: userToLoad.goalProgress || 0,
          goalTitle: userToLoad.goalTitle || '',
          goalTarget: userToLoad.goalTarget || '',
          goalCurrent: userToLoad.goalCurrent || '',
          category: userToLoad.category || '',
        });
      }

      setTasks(tasksToLoad);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    setIsLoading(false);
  }, [sessionContext?.sessionData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) loadData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadData]);

  // Backfill weekly history from today's path activity if needed
  useEffect(() => {
    if (isLoading || !user) return;
    const activity = loadDailyQuestActivity(
      user?.goalTitle && user?.category
        ? buildGoalId(user.goalTitle, user.category)
        : 'default'
    );
    if (activity.xpEarned <= 0) return;
    updateUserHistory(
      userId,
      activity.xpEarned,
      activity.tasksCompleted,
      user.currentStreak || 0
    );
  }, [isLoading, user, userId]);

  const analytics = useMemo(
    () => buildProgressAnalytics(user, tasks, userId),
    [user, tasks, userId]
  );

  const getMotivationalMessage = (progress: number) => {
    if (progress >= 90) return "You're absolutely crushing it";
    if (progress >= 80) return 'Incredible momentum';
    if (progress >= 70) return "You're on fire";
    if (progress >= 60) return 'Great progress';
    if (progress >= 50) return 'Halfway there';
    return 'Building momentum';
  };

  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { level: 'Legendary', color: 'text-gray-600' };
    if (streak >= 21) return { level: 'Expert', color: 'text-gray-600' };
    if (streak >= 14) return { level: 'Advanced', color: 'text-gray-600' };
    if (streak >= 7) return { level: 'Intermediate', color: 'text-gray-600' };
    if (streak >= 3) return { level: 'Beginner', color: 'text-gray-500' };
    return { level: 'Starting', color: 'text-gray-500' };
  };

  const streakLevel = getStreakLevel(analytics.streakData.current);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 dark:border-gray-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-dvh bg-white dark:bg-slate-950 overflow-y-auto overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-16 pb-24">
        <div className="mb-6">
          <button
            onClick={() => router.push('/venture-quest')}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-normal text-gray-900 dark:text-white mb-2 tracking-tight">
            Progress Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Track your growth and celebrate your wins
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {['week', 'month', 'quarter', 'year'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={
                selectedPeriod === period
                  ? '!bg-gray-900 hover:!bg-gray-800 !text-white dark:!bg-white dark:!text-gray-900 dark:hover:!bg-gray-100 font-medium'
                  : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 !text-gray-900 dark:!text-gray-300 font-medium'
              }
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white dark:bg-slate-900 border-gray-200/60 dark:border-gray-800/60">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Total Points
                </span>
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                {analytics.totalPoints.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {analytics.totalPoints > 0
                  ? 'Keep earning points'
                  : 'Start earning points'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-gray-200/60 dark:border-gray-800/60">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Flame className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Current Streak
                </span>
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                {analytics.streakData.current}
              </div>
              <div className={`text-xs ${streakLevel.color} dark:text-gray-400`}>
                {streakLevel.level}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-gray-200/60 dark:border-gray-800/60">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Goal Progress
                </span>
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                {analytics.monthlyProgress}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                On track to complete
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-gray-200/60 dark:border-gray-800/60">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Growth Velocity
                </span>
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                {analytics.growthVelocity ?? '—'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {analytics.growthVelocity
                  ? 'Compared to earlier this week'
                  : 'Building your baseline'}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white dark:bg-slate-900 border-gray-200/60 dark:border-gray-800/60">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Weekly Points</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-3">
                {analytics.weeklyPoints.map((points, index) => {
                  const maxPoints = Math.max(...analytics.weeklyPoints, 1);
                  const percentage = (points / maxPoints) * 100;
                  const dayNames = [
                    'Mon',
                    'Tue',
                    'Wed',
                    'Thu',
                    'Fri',
                    'Sat',
                    'Sun',
                  ];

                  return (
                    <div key={index} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          {dayNames[index]}
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {points} pts
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                        <div
                          className="bg-gray-900 dark:bg-white h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-gray-200/60 dark:border-gray-800/60">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Task Completion Rate</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-3">
                {Object.entries(analytics.taskCompletion).map(([impact, rate]) => (
                  <div key={impact} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400 capitalize">
                        {impact} Impact
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {rate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-gray-900 dark:bg-white h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-none">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Points by Category</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {analytics.categoryBreakdown.map((category, index) => (
                <div
                  key={index}
                  className="text-center p-3 border border-gray-200 dark:border-gray-800 rounded"
                >
                  <div className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {category.points}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                    {category.category}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {category.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-none">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analytics.weeklyInsights.map((insight, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 dark:border-gray-800 rounded"
                >
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mt-1.5"></div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {insight}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-none">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                {getMotivationalMessage(analytics.monthlyProgress)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                You&apos;re making incredible progress toward your goals. Keep up
                the amazing work.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  className="!bg-gray-900 hover:!bg-gray-800 !text-white dark:!bg-white dark:!text-gray-900 dark:hover:!bg-gray-100 font-medium"
                  onClick={() => router.push('/venture-quest')}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Continue Venture Quest
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 !text-gray-900 dark:!text-gray-300 font-medium"
                  onClick={() => router.push('/venture-quest/rewards')}
                >
                  <Star className="w-4 h-4 mr-2" />
                  View Rewards
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
