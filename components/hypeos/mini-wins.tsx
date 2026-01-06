'use client';

import { useState } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

interface MiniWin {
  id: number;
  title: string;
  completed: boolean;
  points: number;
  time: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface MiniWinsProps {
  miniWins: MiniWin[];
  onComplete: (miniWinId: number) => void;
  streak: number;
}

export default function MiniWins({ miniWins, onComplete, streak }: MiniWinsProps) {
  const [completedWins, setCompletedWins] = useState<number[]>([]);

  const handleComplete = (miniWinId: number) => {
    setCompletedWins(prev => [...prev, miniWinId]);
    onComplete(miniWinId);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500 dark:bg-green-950 text-white';
      case 'medium': return 'bg-amber-500 dark:bg-amber-950 text-white';
      case 'hard': return 'bg-red-500 dark:bg-red-950 text-white';
      default: return 'bg-gray-500 dark:bg-gray-950 text-white';
    }
  };

  const completedCount = miniWins.filter(win => win.completed || completedWins.includes(win.id)).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-medium text-gray-900 dark:text-white">
          Mini Wins
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {completedCount}/{miniWins.length}
        </span>
      </div>
      
      {/* Separator Line */}
      <div className="w-full h-px bg-gray-200 dark:bg-gray-800 mb-4" />

      <div className="space-y-2">
        {miniWins.map((win) => {
          const isCompleted = win.completed || completedWins.includes(win.id);
          
          return (
            <div 
              key={win.id} 
              className={`flex items-start justify-between p-3 rounded-lg border-2 bg-white dark:bg-[#011635] border-gray-200 dark:border-[#011635] ${
                isCompleted 
                  ? 'opacity-70' 
                  : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Checkbox */}
                <div 
                  className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer flex-shrink-0 ${
                    isCompleted 
                      ? 'bg-blue-600 dark:bg-white border-blue-600 dark:border-white' 
                      : 'border-gray-400 dark:border-gray-400 bg-transparent'
                  }`}
                  onClick={() => !isCompleted && handleComplete(win.id)}
                >
                  {isCompleted && (
                    <CheckCircle2 className="w-3 h-3 text-white dark:text-blue-900" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className={`text-sm mb-1.5 ${
                    isCompleted 
                      ? 'text-gray-400 dark:text-gray-400 line-through' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {win.title}
                  </p>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {win.time}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      +{win.points} pts
                    </span>
                    {win.difficulty && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${getDifficultyColor(win.difficulty)}`}>
                        {win.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Complete Button */}
              {isCompleted ? (
                <div className="flex-shrink-0 pt-0">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                </div>
              ) : (
                <button
                  onClick={() => handleComplete(win.id)}
                  className="text-xs text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-300 flex-shrink-0 cursor-pointer transition-colors pt-0"
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
