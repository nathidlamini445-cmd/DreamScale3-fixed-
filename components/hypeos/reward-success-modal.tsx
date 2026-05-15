'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Mail, Gift, Award, Sparkles } from 'lucide-react';
import { getRewardConfig, isDownloadReward, isBadgeReward, isFeatureReward } from '@/lib/rewards/reward-config';

interface RewardSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardId: number;
  rewardTitle: string;
  downloadLink?: string | null;
  emailSent?: boolean;
  fulfillmentType?: string;
  onViewHistory?: () => void;
}

export function RewardSuccessModal({
  isOpen,
  onClose,
  rewardId,
  rewardTitle,
  downloadLink,
  emailSent = false,
  fulfillmentType,
  onViewHistory,
}: RewardSuccessModalProps) {
  const rewardConfig = getRewardConfig(rewardId);
  const isDownload = isDownloadReward(rewardId);
  const isBadge = isBadgeReward(rewardId);
  const isFeature = isFeatureReward(rewardId);

  const handleDownload = () => {
    if (downloadLink) {
      window.open(downloadLink, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Reward Redeemed!
          </DialogTitle>
          <DialogDescription className="text-center mt-2">
            {rewardTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {/* Download Section */}
          {isDownload && downloadLink && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-[#39d2c0]" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Download Ready
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your reward is ready to download. Click the button below to get started.
              </p>
              <Button
                onClick={handleDownload}
                className="w-full bg-[#39d2c0] hover:bg-[#39d2c0]/90 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Now
              </Button>
            </div>
          )}

          {/* Badge Section */}
          {isBadge && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Badge Unlocked!
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This badge is now displayed on your profile. Keep up the great work!
              </p>
            </div>
          )}

          {/* Feature Section */}
          {isFeature && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Early Access Granted!
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You now have early access to new platform features. Look for the "Early Access" badge on new features!
              </p>
            </div>
          )}

          {/* Email Confirmation */}
          {emailSent && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4 text-[#39d2c0]" />
              <span>Confirmation email sent to your inbox</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {onViewHistory && (
              <Button
                variant="outline"
                onClick={onViewHistory}
                className="flex-1"
              >
                <Gift className="h-4 w-4 mr-2" />
                View History
              </Button>
            )}
            <Button
              onClick={onClose}
              className="flex-1 bg-[#39d2c0] hover:bg-[#39d2c0]/90 text-white"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
