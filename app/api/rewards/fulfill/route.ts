import { NextRequest, NextResponse } from 'next/server';
import {
  getRewardConfig,
  getDownloadUrl,
  isDownloadReward,
  isBadgeReward,
  isFeatureReward,
} from '@/lib/rewards/reward-config';
import { assignBadge } from '@/lib/rewards/badge-system';
import { enableFeature } from '@/lib/rewards/feature-flags';

// Generate a simple token for download links (in production, use JWT or crypto)
function generateDownloadToken(rewardId: number, userId: string): string {
  const timestamp = Date.now();
  const data = `${rewardId}-${userId}-${timestamp}`;
  // Simple hash (in production, use proper crypto)
  return Buffer.from(data).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const {
      rewardId,
      userId,
      userEmail,
      userName,
      currentPoints,
      currentBadges = [],
      currentFeatures = [],
    } = await req.json();

    // Validate required fields
    if (!rewardId || !userId) {
      return NextResponse.json(
        { error: 'Reward ID and User ID are required' },
        { status: 400 }
      );
    }

    // Get reward configuration
    const rewardConfig = getRewardConfig(rewardId);
    if (!rewardConfig) {
      return NextResponse.json(
        { error: 'Invalid reward ID' },
        { status: 400 }
      );
    }

    // Generate download link if it's a download reward
    let downloadLink: string | null = null;
    let downloadToken: string | null = null;

    if (isDownloadReward(rewardId)) {
      downloadToken = generateDownloadToken(rewardId, userId);
      // Use API route for downloads instead of direct file paths
      const baseUrl = req.nextUrl.origin;
      downloadLink = `${baseUrl}/api/rewards/download?rewardId=${rewardId}&token=${downloadToken}`;
    }

    // Handle badge assignment
    let updatedBadges = currentBadges;
    if (isBadgeReward(rewardId) && rewardConfig.badgeId) {
      updatedBadges = assignBadge(currentBadges, rewardConfig.badgeId);
    }

    // Handle feature flag activation
    let updatedFeatures = currentFeatures;
    if (isFeatureReward(rewardId) && rewardConfig.featureId) {
      updatedFeatures = enableFeature(currentFeatures, rewardConfig.featureId);
    }

    // Email sending disabled - downloads are direct and immediate
    // Users get immediate download access through the download link
    let emailSent = false;

    // Prepare response data
    const fulfillmentData = {
      rewardId,
      rewardTitle: rewardConfig.title,
      fulfillmentType: rewardConfig.fulfillmentType,
      downloadLink,
      downloadToken,
      badgeId: isBadgeReward(rewardId) ? rewardConfig.badgeId : undefined,
      featureId: isFeatureReward(rewardId) ? rewardConfig.featureId : undefined,
      emailSent,
      redeemedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        ...fulfillmentData,
        // Include updated user data for frontend to update session
        userUpdates: {
          badges: updatedBadges,
          earlyAccessFeatures: updatedFeatures,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in reward fulfillment endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fulfill reward', success: false },
      { status: 500 }
    );
  }
}
