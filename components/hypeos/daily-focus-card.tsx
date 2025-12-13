'use client';

import { useState } from 'react';
import { 
  CheckCircle, 
  Clock
} from 'lucide-react';

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
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);

  const handleComplete = (taskId: number) => {
    setCompletedTasks(prev => [...prev, taskId]);
    onTaskComplete(taskId);
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

      <div className="space-y-2">
        {tasks.map((task) => {
          const isCompleted = task.completed || completedTasks.includes(task.id);
          const difficulty = getDifficultyLabel(task.impact);
          
          return (
            <div 
              key={task.id} 
              id={`task-${task.id}`}
              className={`flex items-start justify-between gap-4 p-3 rounded-lg border-2 ${
                isCompleted 
                  ? 'opacity-70' 
                  : ''
              }`}
              style={{ backgroundColor: '#011635', borderColor: '#011635' }}
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Completion Checkbox */}
                <div 
                  className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 cursor-pointer ${
                    isCompleted 
                      ? 'bg-white border-white' 
                      : 'border-gray-400 bg-transparent'
                  }`}
                  onClick={() => !isCompleted && handleComplete(task.id)}
                >
                  {isCompleted && <CheckCircle className="w-3 h-3 text-blue-900" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Task Title */}
                  <p className={`text-sm mb-1.5 ${
                    isCompleted 
                      ? 'text-gray-400 line-through' 
                      : 'text-white'
                  }`}>
                    {task.title}
                  </p>
                  
                  {/* Task Details */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      task.impact === 'high' ? 'bg-red-900 dark:bg-red-950 text-white' :
                      task.impact === 'medium' ? 'bg-amber-900 dark:bg-amber-950 text-white' :
                      'bg-green-900 dark:bg-green-950 text-white'
                    }`}>
                      {difficulty}
                    </span>
                    <span className="text-xs text-gray-300">
                      +{Math.round(task.points * momentumMultiplier)} pts
                    </span>
                    {task.estimatedTime && (
                      <span className="text-xs text-gray-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimatedTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Complete Button */}
              {isCompleted ? (
                <div className="flex-shrink-0 pt-0">
                  <CheckCircle className="w-4 h-4 text-yellow-400" />
                </div>
              ) : (
                <button
                  onClick={() => handleComplete(task.id)}
                  className="text-xs text-white hover:text-gray-300 flex-shrink-0 cursor-pointer transition-colors pt-0"
                >
                  Complete
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
