'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarNav } from '@/components/sidebar-nav';
import RewardStore from '@/components/hypeos/reward-store';
import { RewardSuccessModal } from '@/components/hypeos/reward-success-modal';
import { useSessionSafe } from '@/lib/session-context';

interface User {
  name: string;
  level: number;
  hypePoints: number;
  currentStreak: number;
  longestStreak: number;
  goalProgress: number;
  goalTitle: string;
  goalTarget: string;
  goalCurrent: string;
  category: string;
  hasCompletedOnboarding: boolean;
  badges?: string[];
  earlyAccessFeatures?: string[];
}

export default function RewardsPage() {
  const router = useRouter();
  const sessionContext = useSessionSafe();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemedRewards, setRedeemedRewards] = useState<Array<{
    rewardId: number;
    redeemedAt: string;
    downloadLink?: string;
    token?: string;
  }>>([]);
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    rewardId: number;
    rewardTitle: string;
    downloadLink?: string | null;
    emailSent?: boolean;
    fulfillmentType?: string;
  }>({
    isOpen: false,
    rewardId: 0,
    rewardTitle: '',
  });

  useEffect(() => {
    // Load user data from session (same as main Venture Quest page)
    try {
      const stored = localStorage.getItem('dreamscale_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        const sessionUser = parsed?.hypeos?.user;
        const goalsList = parsed?.hypeos?.allGoals || [];
        const redeemed = parsed?.hypeos?.redeemedRewards || [];
        
        // Use sessionUser if available, otherwise use first goal
        const userToLoad = sessionUser || (goalsList.length > 0 ? goalsList[0] : null);
        
        if (userToLoad && (userToLoad.goalTitle || goalsList.length > 0)) {
          // User has completed onboarding
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
            hasCompletedOnboarding: true
          });
        }
        
        // Load redeemed rewards
        setRedeemedRewards(redeemed);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    setIsLoading(false);
  }, []);

  const handleRedeemReward = async (rewardId: number, points: number) => {
    if (!user || !sessionContext) return;
    
    // Check if user has enough points
    if (user.hypePoints < points) {
      alert(`You need ${points - user.hypePoints} more points to redeem this reward!`);
      return;
    }

    setIsRedeeming(true);

    try {
      // Get user email from session
      const userEmail = sessionContext.sessionData?.email || null;
      const userId = user.name || 'user';
      
      // Get current badges and features from session
      const currentBadges = user.badges || [];
      const currentFeatures = user.earlyAccessFeatures || [];

      // Call fulfillment API
      const response = await fetch('/api/rewards/fulfill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rewardId,
          userId,
          userEmail,
          userName: user.name,
          currentPoints: user.hypePoints,
          currentBadges,
          currentFeatures,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to redeem reward');
      }

      const fulfillmentData = await response.json();

      // Deduct points and update user
      const updatedUser = {
        ...user,
        hypePoints: user.hypePoints - points,
        badges: fulfillmentData.userUpdates?.badges || currentBadges,
        earlyAccessFeatures: fulfillmentData.userUpdates?.earlyAccessFeatures || currentFeatures,
      };
      
      setUser(updatedUser);

      // Update session storage with redeemed reward
      try {
        const stored = localStorage.getItem('dreamscale_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          const redeemedRewards = parsed?.hypeos?.redeemedRewards || [];
          
          const updatedSession = {
            ...parsed,
            hypeos: {
              ...parsed.hypeos,
              user: {
                ...parsed.hypeos?.user,
                ...updatedUser
              },
              allGoals: parsed.hypeos?.allGoals?.map((g: any) => 
                g.goalTitle === updatedUser.goalTitle ? { ...g, ...updatedUser } : g
              ) || [],
              redeemedRewards: [
                ...redeemedRewards,
                {
                  rewardId: fulfillmentData.rewardId,
                  redeemedAt: fulfillmentData.redeemedAt,
                  downloadLink: fulfillmentData.downloadLink,
                  token: fulfillmentData.downloadToken,
                }
              ]
            }
          };
          localStorage.setItem('dreamscale_session', JSON.stringify(updatedSession));
          
          // Update session context
          sessionContext.updateHypeOSData({
            user: updatedUser,
            redeemedRewards: updatedSession.hypeos.redeemedRewards,
          });
          
          // Update local state
          setRedeemedRewards(updatedSession.hypeos.redeemedRewards);
        }
      } catch (error) {
        console.error('Error saving user data:', error);
      }

      // Show success modal
      setSuccessModal({
        isOpen: true,
        rewardId: fulfillmentData.rewardId,
        rewardTitle: fulfillmentData.rewardTitle,
        downloadLink: fulfillmentData.downloadLink,
        emailSent: fulfillmentData.emailSent,
        fulfillmentType: fulfillmentData.fulfillmentType,
      });
    } catch (error: any) {
      console.error('Error redeeming reward:', error);
      alert(error.message || 'Failed to redeem reward. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39d2c0] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading rewards...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <SidebarNav />
        <div className="ml-64 container mx-auto px-4 py-8 pt-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Please complete onboarding first
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You need to set up your goals before accessing the rewards store.
            </p>
            <button 
              onClick={() => router.push('/hypeos')}
              className="bg-[#39d2c0] hover:bg-[#39d2c0]/90 text-white px-6 py-2 rounded-lg"
            >
              Go to Venture Quest
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <RewardStore 
        userPoints={user.hypePoints}
        onRedeemReward={handleRedeemReward}
        isRedeeming={isRedeeming}
        redeemedRewards={redeemedRewards}
      />
      <RewardSuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        rewardId={successModal.rewardId}
        rewardTitle={successModal.rewardTitle}
        downloadLink={successModal.downloadLink}
        emailSent={successModal.emailSent}
        fulfillmentType={successModal.fulfillmentType}
        onViewHistory={() => {
          setSuccessModal({ ...successModal, isOpen: false });
          // Could navigate to reward history page if we create one
        }}
      />
    </div>
  );
}
