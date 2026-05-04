// Badge System
// Manages badge definitions, assignment, and display

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Badge {
  id: string;
  tier: BadgeTier;
  name: string;
  description: string;
  icon?: string;
  unlockedAt?: string;
}

// Badge definitions
export const BADGE_DEFINITIONS: Record<string, Badge> = {
  bronze: {
    id: 'bronze',
    tier: 'bronze',
    name: 'Bronze Badge',
    description: 'Exclusive bronze tier profile badge',
  },
  silver: {
    id: 'silver',
    tier: 'silver',
    name: 'Silver Badge',
    description: 'Exclusive silver tier profile badge',
  },
  gold: {
    id: 'gold',
    tier: 'gold',
    name: 'Gold Badge',
    description: 'Exclusive gold tier profile badge',
  },
  platinum: {
    id: 'platinum',
    tier: 'platinum',
    name: 'Platinum Badge',
    description: 'Ultimate platinum tier profile badge',
  },
};

/**
 * Get badge definition by ID
 */
export function getBadge(badgeId: string): Badge | null {
  return BADGE_DEFINITIONS[badgeId] || null;
}

/**
 * Get all badges for a user
 */
export function getUserBadges(badgeIds: string[]): Badge[] {
  return badgeIds
    .map(id => getBadge(id))
    .filter((badge): badge is Badge => badge !== null);
}

/**
 * Assign badge to user
 */
export function assignBadge(
  currentBadges: string[],
  badgeId: string
): string[] {
  // Don't add duplicate badges
  if (currentBadges.includes(badgeId)) {
    return currentBadges;
  }

  return [...currentBadges, badgeId];
}

/**
 * Get highest tier badge
 */
export function getHighestTierBadge(badgeIds: string[]): Badge | null {
  const tierOrder: BadgeTier[] = ['bronze', 'silver', 'gold', 'platinum'];
  const badges = getUserBadges(badgeIds);

  if (badges.length === 0) {
    return null;
  }

  // Sort by tier order
  badges.sort((a, b) => {
    const aIndex = tierOrder.indexOf(a.tier);
    const bIndex = tierOrder.indexOf(b.tier);
    return bIndex - aIndex; // Highest first
  });

  return badges[0];
}

/**
 * Check if user has badge
 */
export function hasBadge(badgeIds: string[], badgeId: string): boolean {
  return badgeIds.includes(badgeId);
}

/**
 * Get badge tier color class
 */
export function getBadgeColorClass(tier: BadgeTier): string {
  switch (tier) {
    case 'bronze':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'silver':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    case 'gold':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'platinum':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}
