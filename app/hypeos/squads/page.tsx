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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="container mx-auto px-6 py-12 max-w-2xl">
        {/* Back Button */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            onClick={() => router.push('/hypeos')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Coming Soon Card */}
        <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Users className="h-12 w-12 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">
              Squads Coming Soon
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We're building an accountability feature where you can join forces with like-minded entrepreneurs, 
              stay motivated together, and achieve your goals as a team.
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                What to expect
              </h3>
              <ul className="text-left space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="mr-3 text-gray-400">•</span>
                  <span>Join or create accountability squads</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-gray-400">•</span>
                  <span>Track squad streaks and progress together</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-gray-400">•</span>
                  <span>Chat and motivate each other</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-gray-400">•</span>
                  <span>Compete in squad challenges</span>
                </li>
              </ul>
            </div>

            <Button 
              className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 font-medium"
              onClick={() => router.push('/hypeos')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to HypeOS
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
