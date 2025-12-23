'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';

export default function SquadsPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
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
            Squads
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Join forces with like-minded entrepreneurs
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-none max-w-2xl mx-auto">
          <CardHeader className="text-center pb-3 px-4 pt-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 border border-gray-200 dark:border-gray-800 rounded">
                <Users className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Squads Coming Soon
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We're building an accountability feature where you can join forces with like-minded entrepreneurs, 
              stay motivated together, and achieve your goals as a team.
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4 px-4 pb-4">
            <div className="border border-gray-200 dark:border-gray-800 rounded p-4">
              <h3 className="text-xs font-medium text-gray-900 dark:text-white mb-3">
                What to expect
              </h3>
              <ul className="text-left space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2 text-gray-400">•</span>
                  <span>Join or create accountability squads</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-gray-400">•</span>
                  <span>Track squad streaks and progress together</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-gray-400">•</span>
                  <span>Chat and motivate each other</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-gray-400">•</span>
                  <span>Compete in squad challenges</span>
                </li>
              </ul>
            </div>

            <Button 
              className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 font-medium"
              onClick={() => router.push('/hypeos')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
