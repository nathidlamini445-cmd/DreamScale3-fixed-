'use client';

import { useState } from 'react';
import { 
  CheckCircle, 
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBizoraLoading } from "@/lib/bizora-loading-context";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  points: number;
  impact: 'high' | 'medium' | 'low';
  estimatedTime?: string;
  category?: string;
  howToComplete?: string[]; // Step-by-step instructions
}

interface DailyFocusCardProps {
  tasks: Task[];
  onTaskComplete: (taskId: number) => void;
  onTaskSkip: (taskId: number) => void;
  streak: number;
  momentumMultiplier: number;
}

export default function DailyFocusCard({ 
  tasks, 
  onTaskComplete, 
  onTaskSkip, 
  streak, 
  momentumMultiplier 
}: DailyFocusCardProps) {
  const router = useRouter()
  const { setOpeningBizora } = useBizoraLoading()
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
  const [navigatingToBizora, setNavigatingToBizora] = useState<number | null>(null);

  const handleComplete = (taskId: number) => {
    setCompletedTasks(prev => [...prev, taskId]);
    onTaskComplete(taskId);
  };

  const toggleTaskInstructions = (taskId: number) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getDifficultyLabel = (impact: string) => {
    switch (impact) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  };

  const getDifficultyColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-medium text-gray-900 dark:text-white mb-4">
          Today's Focus
        </h2>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">Progress</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {completedCount}/{totalCount}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(completionRate)}%
            </span>
            {momentumMultiplier > 1 && (
              <button className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {momentumMultiplier}x
              </button>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-0.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-gray-900 dark:bg-white rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      <div className="space-y-1">
        {tasks.map((task) => {
          const isCompleted = task.completed || completedTasks.includes(task.id);
          const difficulty = getDifficultyLabel(task.impact);
          const isExpanded = expandedTasks.has(task.id);
          const hasInstructions = task.howToComplete && task.howToComplete.length > 0;
          
          return (
            <div 
              key={task.id} 
              id={`task-${task.id}`}
              className={`rounded border border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-slate-950 transition-all hover:border-gray-300 dark:hover:border-gray-700 ${
                isCompleted 
                  ? 'opacity-60' 
                  : 'cursor-pointer'
              }`}
              onClick={(e) => {
                // Only navigate if not clicking on action buttons
                if (!(e.target as HTMLElement).closest('.task-actions') && 
                    !(e.target as HTMLElement).closest('input') &&
                    !(e.target as HTMLElement).closest('button')) {
                  router.push(`/hypeos/task/${task.id}`)
                }
              }}
            >
              {/* Task Header */}
              <div className="flex items-start justify-between gap-3 p-2.5">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {/* Completion Checkbox */}
                  <div 
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 cursor-pointer ${
                      isCompleted 
                        ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white' 
                        : 'border-gray-300 dark:border-gray-600 bg-transparent'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation() // Prevent navigation when clicking checkbox
                      if (!isCompleted) {
                        handleComplete(task.id)
                      }
                    }}
                  >
                    {isCompleted && <CheckCircle className="w-2.5 h-2.5 text-white dark:text-gray-900" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Task Title - Clickable with Blue Shimmer */}
                    <Link 
                      href={`/hypeos/task/${task.id}`}
                      className={`text-sm mb-1 flex items-center gap-1.5 group ${
                        isCompleted 
                          ? 'text-gray-400 dark:text-gray-500 line-through' 
                          : 'text-blue-shimmer hover:underline'
                      }`}
                      onClick={(e) => {
                        // Don't navigate if clicking checkbox or complete button
                        if ((e.target as HTMLElement).closest('.task-actions')) {
                          e.preventDefault()
                        }
                      }}
                    >
                      <span>{task.title}</span>
                      {!isCompleted && (
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      )}
                    </Link>
                    
                    {/* Task Details - Minimalistic */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        task.impact === 'high' ? 'bg-red-500/10 dark:bg-red-950/50 text-red-600 dark:text-red-400' :
                        task.impact === 'medium' ? 'bg-amber-500/10 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400' :
                        'bg-green-500/10 dark:bg-green-950/50 text-green-600 dark:text-green-400'
                      }`}>
                        {difficulty}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{Math.round(task.points * momentumMultiplier)} pts
                      </span>
                      {task.estimatedTime && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.estimatedTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Complete Button and Dropdown */}
                <div className="flex items-center gap-1.5 flex-shrink-0 task-actions">
                  {/* Dropdown Button for Instructions - Always show if instructions exist */}
                  {hasInstructions && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Prevent navigation when clicking dropdown
                        toggleTaskInstructions(task.id)
                      }}
                      className="p-1 rounded hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
                      title="Show how to complete this task"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  )}
                  
                  {/* Complete Button */}
                  {isCompleted ? (
                    <div className="pt-0">
                      <CheckCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Prevent navigation when clicking Complete button
                        handleComplete(task.id)
                      }}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer transition-colors pt-0"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable Instructions Section */}
              {isExpanded && hasInstructions && (
                <div className="px-2.5 pb-2.5 pt-0 border-t border-gray-200/50 dark:border-gray-800/50 mt-1.5">
                  <div className="pt-2.5 space-y-2.5">
                    {/* Bizora AI Button - Minimalistic */}
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/30 rounded p-2.5 space-y-2">
                      <p className="text-xs text-blue-900 dark:text-blue-200 font-medium text-center leading-relaxed">
                        Feeling confused on how to complete this task or want more information?
                      </p>
                      <button
                        onClick={() => {
                          setNavigatingToBizora(task.id)
                          setOpeningBizora(true) // Show Bizora loading overlay
                          const bizoraUrl = `/bizora?task=${encodeURIComponent(task.title)}&instructions=${encodeURIComponent(JSON.stringify(task.howToComplete || []))}`
                          setTimeout(() => {
                            router.push(bizoraUrl)
                          }, 100)
                        }}
                        disabled={navigatingToBizora === task.id}
                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 text-white text-xs font-medium rounded transition-colors"
                      >
                        {navigatingToBizora === task.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Opening...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Ask Bizora AI</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Step-by-Step Instructions */}
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white mb-2">
                        How to Complete:
                      </p>
                      <ol className="space-y-1.5">
                        {task.howToComplete.map((step, index) => (
                          <li key={index} className="flex gap-2.5">
                            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-xs font-medium flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
