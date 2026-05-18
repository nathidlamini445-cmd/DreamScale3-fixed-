'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Calendar,
  Zap,
  Flame,
  Star,
  ArrowLeft,
  Download,
  Share2
} from 'lucide-react';

interface User {
  name?: string;
  level?: number;
  hypePoints?: number;
  currentStreak?: number;
  longestStreak?: number;
  goalProgress?: number;
  goalTitle?: string;
  goalTarget?: string;
  goalCurrent?: string;
  category?: string;
}

interface Task {
  id: number;
  title: string;
  completed: boolean;
  points: number;
  impact?: 'high' | 'medium' | 'low';
  category?: string;
}

export default function ProgressPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalPoints: 0,
    weeklyPoints: [0, 0, 0, 0, 0, 0, 0],
    monthlyProgress: 0,
    streakData: {
      current: 0,
      longest: 0,
      average: 0
    },
    taskCompletion: {
      high: 0,
      medium: 0,
      low: 0
    },
    categoryBreakdown: [] as Array<{ category: string; points: number; percentage: number }>,
    weeklyInsights: [] as string[]
  });

  // Function to load data from storage
  const loadData = () => {
    try {
      // Load from dreamscale_session (same as other Venture Quest pages)
      const stored = localStorage.getItem('dreamscale_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        const sessionUser = parsed?.hypeos?.user;
        const goalsList = parsed?.hypeos?.allGoals || [];
        const sessionTasks = parsed?.hypeos?.tasks || [];
        
        // Use sessionUser if available, otherwise use first goal
        const userToLoad = sessionUser || (goalsList.length > 0 ? goalsList[0] : null);
        
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
            category: userToLoad.category || ''
          });
        }
        
        // Load tasks
        if (sessionTasks.length > 0) {
          setTasks(sessionTasks);
        } else {
          // Also try loading from individual localStorage keys (for compatibility)
          const savedTasks = localStorage.getItem('hypeos:tasks');
          if (savedTasks) {
            try {
              const parsedTasks = JSON.parse(savedTasks);
              if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
                setTasks(parsedTasks);
              }
            } catch (e) {
              console.warn('Failed to parse tasks', e);
            }
          }
        }
      } else {
        // Try loading from individual localStorage keys as fallback
        const savedUser = localStorage.getItem('hypeos:user');
        const savedTasks = localStorage.getItem('hypeos:tasks');
        
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
          } catch (e) {
            console.warn('Failed to parse user', e);
          }
        }
        
        if (savedTasks) {
          try {
            const parsedTasks = JSON.parse(savedTasks);
            if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
              setTasks(parsedTasks);
            }
          } catch (e) {
            console.warn('Failed to parse tasks', e);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    setIsLoading(false);
  };

  // Load real data from session storage on mount
  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dreamscale_session' || e.key === 'hypeos:user' || e.key === 'hypeos:tasks') {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);

    // Also poll every 2 seconds to catch changes from same tab
    const interval = setInterval(() => {
      loadData();
    }, 2000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Calculate analytics from real data
  useEffect(() => {
    if (!user && tasks.length === 0) return;

    // Calculate total points
    const totalPoints = user?.hypePoints || 0;

    // Calculate task completion by impact
    const completedTasks = tasks.filter(t => t.completed);
    const highImpactTasks = tasks.filter(t => t.impact === 'high');
    const mediumImpactTasks = tasks.filter(t => t.impact === 'medium');
    const lowImpactTasks = tasks.filter(t => t.impact === 'low');
    
    const highCompleted = highImpactTasks.filter(t => t.completed).length;
    const mediumCompleted = mediumImpactTasks.filter(t => t.completed).length;
    const lowCompleted = lowImpactTasks.filter(t => t.completed).length;
    
    const taskCompletion = {
      high: highImpactTasks.length > 0 ? Math.round((highCompleted / highImpactTasks.length) * 100) : 0,
      medium: mediumImpactTasks.length > 0 ? Math.round((mediumCompleted / mediumImpactTasks.length) * 100) : 0,
      low: lowImpactTasks.length > 0 ? Math.round((lowCompleted / lowImpactTasks.length) * 100) : 0
    };

    // Calculate category breakdown
    const categoryMap = new Map<string, number>();
    completedTasks.forEach(task => {
      const category = task.category || 'Other';
      const points = task.points || 0;
      categoryMap.set(category, (categoryMap.get(category) || 0) + points);
    });
    
    const totalCategoryPoints = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, points]) => ({
      category,
      points,
      percentage: totalCategoryPoints > 0 ? Math.round((points / totalCategoryPoints) * 100) : 0
    })).sort((a, b) => b.points - a.points);

    // Calculate weekly points (simplified - using completed tasks from this week)
    // For now, distribute completed tasks evenly across days
    const completedPoints = completedTasks.reduce((sum, task) => sum + (task.points || 0), 0);
    const avgDailyPoints = completedPoints > 0 ? Math.round(completedPoints / 7) : 0;
    const weeklyPoints = [avgDailyPoints, avgDailyPoints, avgDailyPoints, avgDailyPoints, avgDailyPoints, avgDailyPoints, avgDailyPoints];

    // Generate insights based on actual data
    const insights: string[] = [];
    if (completedTasks.length > 0) {
      insights.push(`You've completed ${completedTasks.length} task${completedTasks.length !== 1 ? 's' : ''} so far`);
    }
    if (user?.currentStreak && user.currentStreak > 0) {
      insights.push(`You're on a ${user.currentStreak}-day streak!`);
    }
    if (taskCompletion.high > 70) {
      insights.push("You're excelling at high-impact tasks");
    }
    if (totalPoints > 0) {
      insights.push(`You've earned ${totalPoints.toLocaleString()} points total`);
    }

    setAnalytics({
      totalPoints,
      weeklyPoints,
      monthlyProgress: user?.goalProgress || 0,
      streakData: {
        current: user?.currentStreak || 0,
        longest: user?.longestStreak || 0,
        average: user?.currentStreak || 0
      },
      taskCompletion,
      categoryBreakdown: categoryBreakdown.length > 0 ? categoryBreakdown : [
        { category: 'No data', points: 0, percentage: 0 }
      ],
      weeklyInsights: insights.length > 0 ? insights : ["Start completing tasks to see your analytics"]
    });
  }, [user, tasks]);

  const getMotivationalMessage = (progress: number) => {
    if (progress >= 90) return "You're absolutely crushing it";
    if (progress >= 80) return "Incredible momentum";
    if (progress >= 70) return "You're on fire";
    if (progress >= 60) return "Great progress";
    if (progress >= 50) return "Halfway there";
    return "Building momentum";
  };

  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { level: "Legendary", color: "text-gray-600" };
    if (streak >= 21) return { level: "Expert", color: "text-gray-600" };
    if (streak >= 14) return { level: "Advanced", color: "text-gray-600" };
    if (streak >= 7) return { level: "Intermediate", color: "text-gray-600" };
    if (streak >= 3) return { level: "Beginner", color: "text-gray-500" };
    return { level: "Starting", color: "text-gray-500" };
  };

  const streakLevel = getStreakLevel(analytics.streakData.current);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 dark:border-gray-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-8 py-16 pt-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/hypeos')}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-normal text-gray-900 dark:text-white mb-2 tracking-tight">
            Progress Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Track your growth and celebrate your wins
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex space-x-2 mb-8">
          {['week', 'month', 'quarter', 'year'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period 
                ? "!bg-gray-900 hover:!bg-gray-800 !text-white dark:!bg-white dark:!text-gray-900 dark:hover:!bg-gray-100 font-medium" 
                : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 !text-gray-900 dark:!text-gray-300 font-medium"}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white dark:bg-slate-900 border-gray-200/60 dark:border-gray-800/60 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.3)]">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Total Points</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                {analytics.totalPoints.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {analytics.totalPoints > 0 ? 'Keep earning points' : 'Start earning points'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-gray-200/60 dark:border-gray-800/60 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.3)]">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Flame className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Current Streak</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                {analytics.streakData.current}
              </div>
              <div className={`text-xs ${streakLevel.color} dark:text-gray-400`}>
                {streakLevel.level}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-gray-200/60 dark:border-gray-800/60 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.3)]">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Goal Progress</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                {analytics.monthlyProgress}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                On track to complete
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-gray-200/60 dark:border-gray-800/60 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.3)]">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Growth Velocity</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                +2.3x
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Faster than last month
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Points Chart */}
          <Card className="bg-white dark:bg-slate-900 border-gray-200/60 dark:border-gray-800/60 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.3)]">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Weekly Points</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-3">
                {analytics.weeklyPoints.map((points, index) => {
                  const maxPoints = Math.max(...analytics.weeklyPoints);
                  const percentage = maxPoints > 0 ? (points / maxPoints) * 100 : 0;
                  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                  
                  return (
                    <div key={index} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">{dayNames[index]}</span>
                        <span className="text-gray-900 dark:text-white font-medium">{points} pts</span>
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

          {/* Task Completion by Impact */}
          <Card className="bg-white dark:bg-slate-900 border-gray-200/60 dark:border-gray-800/60 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.3)]">
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
                      <span className="text-gray-500 dark:text-gray-400 capitalize">{impact} Impact</span>
                      <span className="text-gray-900 dark:text-white font-medium">{rate}%</span>
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

        {/* Category Breakdown */}
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
                <div key={index} className="text-center p-3 border border-gray-200 dark:border-gray-800 rounded">
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

        {/* Insights */}
        <Card className="mb-8 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-none">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>AI Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analytics.weeklyInsights.map((insight, index) => (
                <div key={index} className="p-3 border border-gray-200 dark:border-gray-800 rounded">
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mt-1.5"></div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Motivational Message */}
        <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-none">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                {getMotivationalMessage(analytics.monthlyProgress)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                You're making incredible progress toward your goals. Keep up the amazing work.
              </p>
              <div className="flex justify-center space-x-3">
                <Button 
                  className="!bg-gray-900 hover:!bg-gray-800 !text-white dark:!bg-white dark:!text-gray-900 dark:hover:!bg-gray-100 font-medium"
                  onClick={() => router.push('/hypeos/daily')}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Continue Today's Tasks
                </Button>
                <Button 
                  variant="outline"
                  className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 !text-gray-900 dark:!text-gray-300 font-medium"
                  onClick={() => router.push('/hypeos/rewards')}
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
