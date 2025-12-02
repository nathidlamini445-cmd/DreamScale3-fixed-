'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DailyFocusCard from '@/components/hypeos/daily-focus-card';
import MiniWins from '@/components/hypeos/mini-wins';
import { ArrowLeft } from 'lucide-react';

// Mock data
const mockTasks = [
  { 
    id: 1, 
    title: "Post 3 TikToks", 
    completed: false, 
    points: 150, 
    impact: "medium" as const,
    category: "content",
    estimatedTime: "30 min"
  },
  { 
    id: 2, 
    title: "Email 5 potential clients", 
    completed: false, 
    points: 300, 
    impact: "high" as const,
    category: "sales",
    estimatedTime: "45 min"
  },
  { 
    id: 3, 
    title: "Update pricing page", 
    completed: false, 
    points: 200, 
    impact: "medium" as const,
    category: "admin",
    estimatedTime: "20 min"
  },
  { 
    id: 4, 
    title: "Research competitor pricing", 
    completed: false, 
    points: 100, 
    impact: "low" as const,
    category: "research",
    estimatedTime: "15 min"
  }
];

const mockMiniWins = [
  { 
    id: 1, 
    title: "Check analytics", 
    completed: false, 
    points: 25, 
    time: "2 min",
    category: "admin",
    difficulty: "easy" as const
  },
  { 
    id: 2, 
    title: "Reply to comments", 
    completed: false, 
    points: 30, 
    time: "3 min",
    category: "social",
    difficulty: "easy" as const
  },
  { 
    id: 3, 
    title: "Update bio", 
    completed: false, 
    points: 20, 
    time: "1 min",
    category: "admin",
    difficulty: "easy" as const
  }
];

export default function DailyFocusPage() {
  const router = useRouter();
  
  // Start with mock data to prevent hydration mismatch - ALL INCOMPLETE
  // Load from localStorage in useEffect (client-side only)
  const [tasks, setTasks] = useState(mockTasks.map(t => ({ ...t, completed: false })));
  const [miniWins, setMiniWins] = useState(mockMiniWins.map(w => ({ ...w, completed: false })));
  const [userPoints, setUserPoints] = useState(2450);
  const [currentStreak, setCurrentStreak] = useState(12);
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [userGoal, setUserGoal] = useState<{ goalTitle?: string; category?: string; goalTarget?: string } | null>(null);

  // Load from localStorage on client-side only (prevents hydration mismatch)
  useEffect(() => {
    try {
      const today = new Date().toDateString();
      let loadedAnyData = false;
      
      // Load tasks - reset completed status if it's a new day
      const savedTasks = localStorage.getItem('hypeos:daily:tasks');
      const savedTasksDate = localStorage.getItem('hypeos:daily:tasksLastDate');
      
      // Always check if savedTasksDate exists and matches today
      // If date doesn't match or is missing, clear everything
      if (!savedTasksDate || savedTasksDate !== today) {
        // It's a new day OR no date saved - clear ALL old data and reset
        console.log('📅 Clearing old task data - new day or no date saved', { savedTasksDate, today });
        localStorage.removeItem('hypeos:daily:tasks');
        localStorage.removeItem('hypeos:daily:tasksLastDate');
        localStorage.removeItem('hypeos:daily:miniWins');
        localStorage.removeItem('hypeos:daily:miniWinsLastDate');
        // Use fresh mock data with all tasks incomplete
        const freshTasks = mockTasks.map(t => ({ ...t, completed: false }));
        const freshMiniWins = mockMiniWins.map(w => ({ ...w, completed: false }));
        setTasks(freshTasks);
        setMiniWins(freshMiniWins);
        // Save fresh data with today's date
        localStorage.setItem('hypeos:daily:tasks', JSON.stringify(freshTasks));
        localStorage.setItem('hypeos:daily:tasksLastDate', today);
        localStorage.setItem('hypeos:daily:miniWins', JSON.stringify(freshMiniWins));
        localStorage.setItem('hypeos:daily:miniWinsLastDate', today);
        console.log('✅ Reset all tasks to incomplete for fresh start');
      } else if (savedTasks && savedTasksDate === today) {
        // Same day - load tasks but verify they're actually from today
        // Check if there's a completion timestamp to verify accuracy
        try {
          const parsed = JSON.parse(savedTasks);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const isValid = parsed.every((task: any) => 
              task && typeof task.id === 'number' && typeof task.title === 'string'
            );
            if (isValid) {
              // Verify completed tasks - if no completion timestamp exists, reset to false
              // This ensures only tasks completed in this session are marked complete
              const verifiedTasks = parsed.map((task: any) => {
                // If task is marked completed but has no completionDate, reset it
                // This handles stale data from previous sessions
                if (task.completed && !task.completionDate) {
                  return { ...task, completed: false };
                }
                // If task has completionDate but it's not today, reset it
                if (task.completed && task.completionDate) {
                  const completionDate = new Date(task.completionDate).toDateString();
                  if (completionDate !== today) {
                    return { ...task, completed: false, completionDate: undefined };
                  }
                }
                return task;
              });
              
              setTasks(verifiedTasks);
              // Save verified tasks back to localStorage
              if (JSON.stringify(verifiedTasks) !== JSON.stringify(parsed)) {
                localStorage.setItem('hypeos:daily:tasks', JSON.stringify(verifiedTasks));
                console.log('🔄 Reset stale completed tasks');
              }
              loadedAnyData = true;
              console.log('✅ Loaded daily tasks from localStorage:', verifiedTasks.length, 'tasks');
            } else {
              console.warn('⚠️ Invalid task structure in localStorage');
              localStorage.removeItem('hypeos:daily:tasks');
              localStorage.removeItem('hypeos:daily:tasksLastDate');
            }
          }
        } catch (parseError) {
          console.error('❌ Failed to parse tasks from localStorage:', parseError);
          localStorage.removeItem('hypeos:daily:tasks');
          localStorage.removeItem('hypeos:daily:tasksLastDate');
        }
      } else {
        // No saved data - use mock data with all tasks incomplete
        setTasks(mockTasks.map(t => ({ ...t, completed: false })));
        setMiniWins(mockMiniWins.map(w => ({ ...w, completed: false })));
      }
      
      // Load miniWins - verify completion dates
      const savedMiniWins = localStorage.getItem('hypeos:daily:miniWins');
      const savedMiniWinsDate = localStorage.getItem('hypeos:daily:miniWinsLastDate');
      if (savedMiniWins && savedMiniWinsDate === today) {
        // Same day - verify completion dates
        try {
          const parsed = JSON.parse(savedMiniWins);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Verify completed miniWins - reset if no completionDate or wrong date
            const verifiedMiniWins = parsed.map((win: any) => {
              if (win.completed && !win.completionDate) {
                return { ...win, completed: false };
              }
              if (win.completed && win.completionDate) {
                const completionDate = new Date(win.completionDate).toDateString();
                if (completionDate !== today) {
                  return { ...win, completed: false, completionDate: undefined };
                }
              }
              return win;
            });
            
            setMiniWins(verifiedMiniWins);
            // Save verified miniWins back to localStorage
            if (JSON.stringify(verifiedMiniWins) !== JSON.stringify(parsed)) {
              localStorage.setItem('hypeos:daily:miniWins', JSON.stringify(verifiedMiniWins));
              console.log('🔄 Reset stale completed miniWins');
            }
            loadedAnyData = true;
            console.log('✅ Loaded daily miniWins from localStorage:', verifiedMiniWins.length);
          }
        } catch (e) {
          console.warn('Failed to load daily miniWins from localStorage', e);
        }
      }
      
      // Load userPoints
      const savedPoints = localStorage.getItem('hypeos:daily:userPoints');
      if (savedPoints) {
        const points = parseInt(savedPoints, 10);
        if (!isNaN(points)) {
          setUserPoints(points);
          loadedAnyData = true;
          console.log('✅ Loaded user points from localStorage:', points);
        }
      }
      
      // Load streak
      const savedStreak = localStorage.getItem('hypeos:daily:currentStreak');
      if (savedStreak) {
        const streak = parseInt(savedStreak, 10);
        if (!isNaN(streak)) {
          setCurrentStreak(streak);
          loadedAnyData = true;
          console.log('✅ Loaded streak from localStorage:', streak);
        }
      }
      
      // Load user goal data from session
      try {
        const stored = localStorage.getItem('dreamscale_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          const sessionUser = parsed?.hypeos?.user || parsed?.hypeos?.allGoals?.[0];
          if (sessionUser) {
            setUserGoal({
              goalTitle: sessionUser.goalTitle,
              category: sessionUser.category,
              goalTarget: sessionUser.goalTarget
            });
          }
        }
      } catch (e) {
        console.warn('Failed to load user goal data:', e);
      }
      
      // Mark as loaded (even if no data was found, to prevent overwriting)
      setHasLoadedFromStorage(true);
    } catch (e) {
      console.error('❌ Failed to load from localStorage:', e);
      setHasLoadedFromStorage(true); // Still mark as loaded to prevent infinite loop
    }
  }, []); // Only run once on mount

  // Save tasks to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    // Don't save until we've loaded from localStorage (prevents overwriting saved data with mock data)
    if (!hasLoadedFromStorage) return;
    
    try {
      if (typeof window !== 'undefined' && tasks.length > 0) {
        const today = new Date().toDateString();
        const tasksJson = JSON.stringify(tasks);
        localStorage.setItem('hypeos:daily:tasks', tasksJson);
        localStorage.setItem('hypeos:daily:tasksLastDate', today);
        console.log('💾 Saved daily tasks to localStorage:', tasks.length, 'tasks', {
          completed: tasks.filter(t => t.completed).length
        });
      }
    } catch (e: any) {
      // Handle quota exceeded error
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        console.error('❌ localStorage quota exceeded! Clearing old data...');
        // Try to clear old data and retry
        try {
          // Clear tasks from previous days
          const today = new Date().toDateString();
          const savedDate = localStorage.getItem('hypeos:daily:tasksLastDate');
          if (savedDate && savedDate !== today) {
            localStorage.removeItem('hypeos:daily:tasks');
            localStorage.removeItem('hypeos:daily:tasksLastDate');
            // Retry saving
            localStorage.setItem('hypeos:daily:tasks', JSON.stringify(tasks));
            localStorage.setItem('hypeos:daily:tasksLastDate', today);
            console.log('✅ Retried save after clearing old data');
          }
        } catch (retryError) {
          console.error('❌ Still failed after clearing old data:', retryError);
        }
      } else {
        console.warn('Failed to save daily tasks to localStorage', e);
      }
    }
  }, [tasks, hasLoadedFromStorage]);

  // Save miniWins to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    // Don't save until we've loaded from localStorage
    if (!hasLoadedFromStorage) return;
    
    try {
      if (typeof window !== 'undefined' && miniWins.length > 0) {
        const today = new Date().toDateString();
        localStorage.setItem('hypeos:daily:miniWins', JSON.stringify(miniWins));
        localStorage.setItem('hypeos:daily:miniWinsLastDate', today);
        console.log('💾 Saved daily miniWins to localStorage:', miniWins.length);
      }
    } catch (e) {
      console.warn('Failed to save daily miniWins to localStorage', e);
    }
  }, [miniWins, hasLoadedFromStorage]);

  // Save userPoints to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    // Don't save until we've loaded from localStorage
    if (!hasLoadedFromStorage) return;
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('hypeos:daily:userPoints', userPoints.toString());
        console.log('💾 Saved user points to localStorage:', userPoints);
      }
    } catch (e) {
      console.warn('Failed to save user points to localStorage', e);
    }
  }, [userPoints, hasLoadedFromStorage]);

  // Save streak to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    // Don't save until we've loaded from localStorage
    if (!hasLoadedFromStorage) return;
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('hypeos:daily:currentStreak', currentStreak.toString());
        console.log('💾 Saved streak to localStorage:', currentStreak);
      }
    } catch (e) {
      console.warn('Failed to save streak to localStorage', e);
    }
  }, [currentStreak, hasLoadedFromStorage]);

  const completeTask = (taskId: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.warn('Task not found:', taskId);
        return;
      }

      const today = new Date().toISOString();
      const updatedTasks = tasks.map(t => 
        t.id === taskId 
          ? { ...t, completed: true, completionDate: today }
          : t
      );
      setTasks(updatedTasks);
      
      // Immediately save to localStorage (like Bizora)
      try {
        if (typeof window !== 'undefined') {
          const today = new Date().toDateString();
          const tasksJson = JSON.stringify(updatedTasks);
          localStorage.setItem('hypeos:daily:tasks', tasksJson);
          localStorage.setItem('hypeos:daily:tasksLastDate', today);
          console.log('💾 Immediately saved completed task to localStorage');
        }
      } catch (e: any) {
        // Handle quota exceeded error
        if (e.name === 'QuotaExceededError' || e.code === 22) {
          console.error('❌ localStorage quota exceeded when saving task!');
          // The useEffect will handle retry with clearing old data
        } else {
          console.error('❌ Failed to immediately save task to localStorage:', e);
        }
      }
      
      // Update points
      const newPoints = userPoints + task.points;
      setUserPoints(newPoints);
      
      // Immediately save points
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('hypeos:daily:userPoints', newPoints.toString());
        }
      } catch (e: any) {
        console.error('❌ Failed to save points to localStorage:', e);
      }
    } catch (error) {
      console.error('❌ Error completing task:', error);
      // Don't throw - just log the error
    }
  };

  const completeMiniWin = (miniWinId: number) => {
    const today = new Date().toISOString();
    const updatedMiniWins = miniWins.map(win => 
      win.id === miniWinId 
        ? { ...win, completed: true, completionDate: today }
        : win
    );
    setMiniWins(updatedMiniWins);
    
    // Immediately save to localStorage (like Bizora)
    try {
      if (typeof window !== 'undefined') {
        const today = new Date().toDateString();
        localStorage.setItem('hypeos:daily:miniWins', JSON.stringify(updatedMiniWins));
        localStorage.setItem('hypeos:daily:miniWinsLastDate', today);
        console.log('💾 Immediately saved completed miniWin to localStorage');
      }
    } catch (e) {
      console.warn('Failed to immediately save miniWin to localStorage', e);
    }
    
    const miniWin = miniWins.find(w => w.id === miniWinId);
    if (miniWin) {
      const newPoints = userPoints + miniWin.points;
      setUserPoints(newPoints);
      
      // Immediately save points
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('hypeos:daily:userPoints', newPoints.toString());
        }
      } catch (e) {
        console.warn('Failed to save points to localStorage', e);
      }
    }
  };

  const skipTask = (taskId: number) => {
    // Handle task skip logic
    console.log('Task skipped:', taskId);
  };

  // AI-powered task generation based on user's goal and niche
  const generateAITasks = async () => {
    setIsGeneratingTasks(true);
    
    try {
      // Get user's goal information
      const goalTitle = userGoal?.goalTitle || 'your business goal';
      const category = userGoal?.category || 'business';
      const goalTarget = userGoal?.goalTarget || '';
      
      // Generate personalized tasks based on category and goal
      const generatedTasks = generatePersonalizedTasks(goalTitle, category, goalTarget, tasks.length);
      
      // Add new tasks with unique IDs
      const newTasks = generatedTasks.map((task, index) => ({
        ...task,
        id: tasks.length + index + 1,
        completed: false
      }));
      
      const updatedTasks = [...tasks, ...newTasks];
      setTasks(updatedTasks);
      
      // Save to localStorage
      try {
        if (typeof window !== 'undefined') {
          const today = new Date().toDateString();
          localStorage.setItem('hypeos:daily:tasks', JSON.stringify(updatedTasks));
          localStorage.setItem('hypeos:daily:tasksLastDate', today);
          console.log('💾 Saved generated tasks to localStorage:', newTasks.length);
        }
      } catch (e) {
        console.warn('Failed to save generated tasks to localStorage', e);
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  // Generate personalized tasks based on user's goal and niche
  const generatePersonalizedTasks = (
    goalTitle: string,
    category: string,
    goalTarget: string,
    currentTaskCount: number
  ) => {
    const taskTemplates: Record<string, Array<{ title: string; impact: 'high' | 'medium' | 'low'; points: number; estimatedTime: string; category: string }>> = {
      revenue: [
        { title: `Create a pricing strategy document for ${goalTitle}`, impact: 'high', points: 350, estimatedTime: '45 min', category: 'strategy' },
        { title: `Research 3 successful competitors in your niche and analyze their pricing`, impact: 'high', points: 300, estimatedTime: '40 min', category: 'research' },
        { title: `Draft 5 personalized outreach messages for potential high-value clients`, impact: 'high', points: 400, estimatedTime: '50 min', category: 'sales' },
        { title: `Create a value proposition that clearly communicates your unique offer`, impact: 'medium', points: 250, estimatedTime: '35 min', category: 'marketing' },
        { title: `Set up a simple tracking system to monitor revenue streams`, impact: 'medium', points: 200, estimatedTime: '30 min', category: 'admin' },
        { title: `Identify 10 potential revenue opportunities in your current business`, impact: 'medium', points: 280, estimatedTime: '40 min', category: 'strategy' },
        { title: `Create a one-page sales sheet for your main offer`, impact: 'low', points: 150, estimatedTime: '25 min', category: 'marketing' },
        { title: `Review and optimize your current pricing structure`, impact: 'low', points: 120, estimatedTime: '20 min', category: 'admin' }
      ],
      content: [
        { title: `Plan and outline 3 pieces of content that align with ${goalTitle}`, impact: 'high', points: 350, estimatedTime: '45 min', category: 'content' },
        { title: `Create a content calendar for the next 2 weeks focused on your niche`, impact: 'high', points: 400, estimatedTime: '50 min', category: 'planning' },
        { title: `Write a detailed blog post or social media thread about your expertise`, impact: 'high', points: 450, estimatedTime: '60 min', category: 'content' },
        { title: `Engage with 10 posts in your niche and leave valuable comments`, impact: 'medium', points: 250, estimatedTime: '35 min', category: 'engagement' },
        { title: `Research trending topics in your niche and create content ideas list`, impact: 'medium', points: 280, estimatedTime: '40 min', category: 'research' },
        { title: `Optimize 3 existing pieces of content for better engagement`, impact: 'medium', points: 220, estimatedTime: '30 min', category: 'optimization' },
        { title: `Schedule your content for the next 3 days`, impact: 'low', points: 150, estimatedTime: '20 min', category: 'admin' },
        { title: `Update your social media bio to better reflect your current goals`, impact: 'low', points: 100, estimatedTime: '15 min', category: 'admin' }
      ],
      audience: [
        { title: `Conduct a deep dive analysis of your ideal customer avatar for ${goalTitle}`, impact: 'high', points: 400, estimatedTime: '50 min', category: 'research' },
        { title: `Create a detailed customer journey map from awareness to purchase`, impact: 'high', points: 450, estimatedTime: '60 min', category: 'strategy' },
        { title: `Interview 3 potential customers to understand their pain points`, impact: 'high', points: 500, estimatedTime: '75 min', category: 'research' },
        { title: `Analyze your current audience engagement data and identify patterns`, impact: 'medium', points: 300, estimatedTime: '40 min', category: 'analytics' },
        { title: `Create a survey to gather feedback from your existing audience`, impact: 'medium', points: 250, estimatedTime: '35 min', category: 'research' },
        { title: `Identify 5 online communities where your target audience hangs out`, impact: 'medium', points: 220, estimatedTime: '30 min', category: 'research' },
        { title: `Update your customer personas with new insights`, impact: 'low', points: 150, estimatedTime: '25 min', category: 'admin' },
        { title: `Review and respond to audience comments and messages`, impact: 'low', points: 120, estimatedTime: '20 min', category: 'engagement' }
      ],
      product: [
        { title: `Create a detailed feature list for your product/service related to ${goalTitle}`, impact: 'high', points: 400, estimatedTime: '50 min', category: 'product' },
        { title: `Develop a minimum viable product (MVP) plan with key features`, impact: 'high', points: 500, estimatedTime: '75 min', category: 'strategy' },
        { title: `Write user stories for 5 core features of your product`, impact: 'high', points: 450, estimatedTime: '60 min', category: 'product' },
        { title: `Research 3 similar products and create a competitive analysis`, impact: 'medium', points: 300, estimatedTime: '40 min', category: 'research' },
        { title: `Create a product roadmap for the next quarter`, impact: 'medium', points: 350, estimatedTime: '45 min', category: 'planning' },
        { title: `Design a simple prototype or mockup of your product`, impact: 'medium', points: 280, estimatedTime: '40 min', category: 'design' },
        { title: `Gather feedback from 3 beta testers or early users`, impact: 'low', points: 200, estimatedTime: '30 min', category: 'research' },
        { title: `Document your product's unique value proposition`, impact: 'low', points: 150, estimatedTime: '25 min', category: 'product' }
      ],
      business: [
        { title: `Create a strategic action plan for achieving ${goalTitle}`, impact: 'high', points: 450, estimatedTime: '60 min', category: 'strategy' },
        { title: `Identify and reach out to 5 potential partners or collaborators`, impact: 'high', points: 400, estimatedTime: '50 min', category: 'networking' },
        { title: `Develop a 90-day business plan with specific milestones`, impact: 'high', points: 500, estimatedTime: '75 min', category: 'planning' },
        { title: `Analyze your current business metrics and identify improvement areas`, impact: 'medium', points: 300, estimatedTime: '40 min', category: 'analytics' },
        { title: `Create a list of 10 potential revenue streams for your business`, impact: 'medium', points: 350, estimatedTime: '45 min', category: 'strategy' },
        { title: `Research and document 3 new business opportunities in your niche`, impact: 'medium', points: 280, estimatedTime: '40 min', category: 'research' },
        { title: `Update your business plan with recent progress and learnings`, impact: 'low', points: 200, estimatedTime: '30 min', category: 'admin' },
        { title: `Review and optimize your daily business operations`, impact: 'low', points: 150, estimatedTime: '25 min', category: 'optimization' }
      ]
    };

    // Get tasks for the category, or default to business
    const categoryTasks = taskTemplates[category.toLowerCase()] || taskTemplates.business;
    
    // Personalize tasks with user's goal title
    const personalizedTasks = categoryTasks.map(task => ({
      ...task,
      title: task.title.replace('your business goal', goalTitle).replace('your niche', category)
    }));

    // Return 3-4 random tasks
    const shuffled = personalizedTasks.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const completedMiniWins = miniWins.filter(win => win.completed).length;
  const totalMiniWins = miniWins.length;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-8 py-16 pt-28">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/hypeos')}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-normal text-gray-900 dark:text-white mb-2 tracking-tight">
            Daily Focus
          </h1>
          <div className="flex items-center gap-6 mt-4 text-sm text-gray-500 dark:text-gray-500">
            <span>{completedTasks} of {totalTasks} tasks completed</span>
            <span>{Math.round(completionRate)}%</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Today's Focus */}
          <DailyFocusCard
            tasks={tasks}
            onTaskComplete={completeTask}
            onTaskSkip={skipTask}
            streak={currentStreak}
            momentumMultiplier={currentStreak >= 3 ? 1.5 : 1.0}
          />

          {/* Mini Wins */}
          <MiniWins
            miniWins={miniWins}
            onComplete={completeMiniWin}
            streak={currentStreak}
          />
        </div>

        {/* More Tasks Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={generateAITasks}
            disabled={isGeneratingTasks}
            className="px-6 py-3 rounded-lg border-2 text-white hover:bg-opacity-80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ backgroundColor: '#011635', borderColor: '#011635' }}
          >
            {isGeneratingTasks ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Generating tasks...</span>
              </>
            ) : (
              <span>More Tasks</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
