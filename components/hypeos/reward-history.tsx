'use client';

import { useState, useEffect } from 'react';
import { Download, Award, Sparkles, Gift, Calendar } from 'lucide-react';
import { getRewardConfig, isDownloadReward, isBadgeReward, isFeatureReward } from '@/lib/rewards/reward-config';
import { getUserBadges } from '@/lib/rewards/badge-system';
import { getEnabledFeatures } from '@/lib/rewards/feature-flags';
import { useSessionSafe } from '@/lib/session-context';

export function RewardHistory() {
  const sessionContext = useSessionSafe();
  const [redeemedRewards, setRedeemedRewards] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const [userFeatures, setUserFeatures] = useState<string[]>([]);

  useEffect(() => {
    if (sessionContext?.sessionData) {
      const hypeos = sessionContext.sessionData.hypeos;
      setRedeemedRewards(hypeos?.redeemedRewards || []);
      setUserBadges(hypeos?.user?.badges || []);
      setUserFeatures(hypeos?.user?.earlyAccessFeatures || []);
    }
  }, [sessionContext?.sessionData]);

  const handleDownload = (downloadLink: string) => {
    if (downloadLink) {
      window.open(downloadLink, '_blank');
    }
  };

  const badges = getUserBadges(userBadges);
  const features = getEnabledFeatures(userFeatures);

  if (redeemedRewards.length === 0 && badges.length === 0 && features.length === 0) {
    return (
      <div className="text-center py-12">
        <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Rewards Yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Start earning points and redeem your first reward!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Redeemed Rewards */}
      {redeemedRewards.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Redeemed Rewards ({redeemedRewards.length})
          </h3>
          <div className="space-y-3">
            {redeemedRewards.map((reward, index) => {
              const config = getRewardConfig(reward.rewardId);
              const isDownload = isDownloadReward(reward.rewardId);
              
              return (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isDownload && <Download className="h-4 w-4 text-[#39d2c0]" />}
                        {isBadgeReward(reward.rewardId) && <Award className="h-4 w-4 text-yellow-500" />}
                        {isFeatureReward(reward.rewardId) && <Sparkles className="h-4 w-4 text-purple-500" />}
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {config?.title || `Reward #${reward.rewardId}`}
                        </h4>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(reward.redeemedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {isDownload && reward.downloadLink && (
                      <button
                        onClick={() => handleDownload(reward.downloadLink)}
                        className="text-sm text-[#39d2c0] hover:text-[#39d2c0]/80 transition-colors flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Your Badges ({badges.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-center"
              >
                <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {badge.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Early Access Features */}
      {features.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Early Access Features ({features.length})
          </h3>
          <div className="space-y-3">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {feature.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
