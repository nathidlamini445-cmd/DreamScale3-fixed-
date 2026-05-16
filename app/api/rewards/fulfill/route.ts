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
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { rewardFulfillSchema } from '@/lib/validations';

import { createHmac } from 'crypto';

export const dynamic = 'force-dynamic';

const TOKEN_SECRET = process.env.DOWNLOAD_TOKEN_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'change-me-in-production';
const TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function generateDownloadToken(rewardId: number, userId: string): string {
  const timestamp = Date.now();
  const payload = `${rewardId}:${userId}:${timestamp}`;
  const signature = createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 10 reward fulfillments per minute per client
    const rateLimited = rateLimit(`reward-fulfill:${getClientIp(req)}`, 10, 60_000);
    if (rateLimited) return rateLimited;

    const body = await req.json();
    const parsed = rewardFulfillSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      rewardId,
      userId,
      userEmail,
      userName,
      currentPoints,
      currentBadges = [],
      currentFeatures = [],
    } = parsed.data;

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
