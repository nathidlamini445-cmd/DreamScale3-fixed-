// Reward Configuration System
// Defines reward metadata, file paths, download links, and fulfillment types

export type RewardFulfillmentType = 'download' | 'badge' | 'feature' | 'manual' | 'course';

export interface RewardConfig {
  id: number;
  title: string;
  fulfillmentType: RewardFulfillmentType;
  filePath?: string; // Path in public/rewards/ directory
  downloadLink?: string; // Direct download URL
  emailTemplate?: string; // Email template key
  requiresEmail?: boolean; // Whether email is required for this reward
  badgeId?: string; // Badge identifier for badge rewards
  featureId?: string; // Feature identifier for early access rewards
}

// Reward configuration mapping
export const REWARD_CONFIGS: Record<number, RewardConfig> = {
  // ========== BRONZE TIER TEMPLATES ==========
  1: {
    id: 1,
    title: "Email Template Pack",
    fulfillmentType: 'download',
    filePath: '/rewards/templates/email-template-pack.pdf',
    emailTemplate: 'template_download',
    requiresEmail: false,
  },
  2: {
    id: 2,
    title: "Social Media Templates",
    fulfillmentType: 'download',
    filePath: '/rewards/templates/social-media-templates.pdf',
    emailTemplate: 'template_download',
    requiresEmail: false,
  },
  15: {
    id: 15,
    title: "LinkedIn Post Templates",
    fulfillmentType: 'download',
    filePath: '/rewards/templates/linkedin-post-templates.pdf',
    emailTemplate: 'template_download',
    requiresEmail: false,
  },
  16: {
    id: 16,
    title: "Pitch Deck Template",
    fulfillmentType: 'download',
    filePath: '/rewards/templates/pitch-deck-template.pdf',
    emailTemplate: 'template_download',
    requiresEmail: false,
  },
  17: {
    id: 17,
    title: "Invoice Template Pack",
    fulfillmentType: 'download',
    filePath: '/rewards/templates/invoice-template-pack.pdf',
    emailTemplate: 'template_download',
    requiresEmail: false,
  },
  18: {
    id: 18,
    title: "Proposal Template Bundle",
    fulfillmentType: 'download',
    filePath: '/rewards/templates/proposal-template-bundle.pdf',
    emailTemplate: 'template_download',
    requiresEmail: false,
  },

  // ========== BRONZE TIER TOOLS/SPREADSHEETS ==========
  22: {
    id: 22,
    title: "Goal Tracker Spreadsheet",
    fulfillmentType: 'download',
    filePath: '/rewards/tools/goal-tracker-spreadsheet.xlsx',
    emailTemplate: 'tool_download',
    requiresEmail: false,
  },
  23: {
    id: 23,
    title: "Expense Tracker Tool",
    fulfillmentType: 'download',
    filePath: '/rewards/tools/expense-tracker-tool.xlsx',
    emailTemplate: 'tool_download',
    requiresEmail: false,
  },
  24: {
    id: 24,
    title: "Content Calendar Template",
    fulfillmentType: 'download',
    filePath: '/rewards/tools/content-calendar-template.xlsx',
    emailTemplate: 'tool_download',
    requiresEmail: false,
  },

  // ========== BRONZE TIER PERKS ==========
  25: {
    id: 25,
    title: "Early Access to Features",
    fulfillmentType: 'feature',
    featureId: 'early_access',
    emailTemplate: 'early_access_granted',
    requiresEmail: false,
  },
  26: {
    id: 26,
    title: "Profile Badge",
    fulfillmentType: 'badge',
    badgeId: 'bronze',
    emailTemplate: 'badge_unlock',
    requiresEmail: false,
  },

  // ========== SILVER TIER PERKS ==========
  36: {
    id: 36,
    title: "Silver Profile Badge",
    fulfillmentType: 'badge',
    badgeId: 'silver',
    emailTemplate: 'badge_unlock',
    requiresEmail: false,
  },

  // ========== GOLD TIER PERKS ==========
  41: {
    id: 41,
    title: "Gold Profile Badge",
    fulfillmentType: 'badge',
    badgeId: 'gold',
    emailTemplate: 'badge_unlock',
    requiresEmail: false,
  },

  // ========== PLATINUM TIER PERKS ==========
  50: {
    id: 50,
    title: "Platinum Profile Badge",
    fulfillmentType: 'badge',
    badgeId: 'platinum',
    emailTemplate: 'badge_unlock',
    requiresEmail: false,
  },
};

/**
 * Get reward configuration by ID
 */
export function getRewardConfig(rewardId: number): RewardConfig | null {
  return REWARD_CONFIGS[rewardId] || null;
}

/**
 * Check if reward requires download
 */
export function isDownloadReward(rewardId: number): boolean {
  const config = getRewardConfig(rewardId);
  return config?.fulfillmentType === 'download' || false;
}

/**
 * Check if reward is a badge
 */
export function isBadgeReward(rewardId: number): boolean {
  const config = getRewardConfig(rewardId);
  return config?.fulfillmentType === 'badge' || false;
}

/**
 * Check if reward is a feature flag
 */
export function isFeatureReward(rewardId: number): boolean {
  const config = getRewardConfig(rewardId);
  return config?.fulfillmentType === 'feature' || false;
}

/**
 * Generate download URL for a reward
 * Note: This is now primarily used for internal reference.
 * Actual download links should be generated via the fulfill API endpoint
 * which includes token validation.
 */
export function getDownloadUrl(rewardId: number, baseUrl?: string): string | null {
  const config = getRewardConfig(rewardId);
  if (!config || !config.filePath) {
    return null;
  }

  // If downloadLink is provided, use it
  if (config.downloadLink) {
    return config.downloadLink;
  }

  // Otherwise, construct from filePath (for reference only)
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}${config.filePath}`;
}

/**
 * Get all reward IDs for a specific fulfillment type
 */
export function getRewardsByType(type: RewardFulfillmentType): number[] {
  return Object.values(REWARD_CONFIGS)
    .filter(config => config.fulfillmentType === type)
    .map(config => config.id);
}
