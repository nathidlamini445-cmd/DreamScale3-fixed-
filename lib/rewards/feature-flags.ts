// Early Access Feature Flags
// Manages feature flags for early access rewards

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

// Feature flag definitions
export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  early_access: {
    id: 'early_access',
    name: 'Early Access to Features',
    description: 'Get early access to new platform features',
    enabled: false,
  },
};

/**
 * Get feature flag by ID
 */
export function getFeatureFlag(featureId: string): FeatureFlag | null {
  return FEATURE_FLAGS[featureId] || null;
}

/**
 * Check if user has early access to a feature
 */
export function hasFeatureAccess(
  earlyAccessFeatures: string[],
  featureId: string
): boolean {
  return earlyAccessFeatures.includes(featureId);
}

/**
 * Enable feature for user
 */
export function enableFeature(
  currentFeatures: string[],
  featureId: string
): string[] {
  // Don't add duplicate features
  if (currentFeatures.includes(featureId)) {
    return currentFeatures;
  }

  return [...currentFeatures, featureId];
}

/**
 * Disable feature for user
 */
export function disableFeature(
  currentFeatures: string[],
  featureId: string
): string[] {
  return currentFeatures.filter(id => id !== featureId);
}

/**
 * Get all enabled features for user
 */
export function getEnabledFeatures(featureIds: string[]): FeatureFlag[] {
  return featureIds
    .map(id => getFeatureFlag(id))
    .filter((flag): flag is FeatureFlag => flag !== null);
}

/**
 * Check if any early access features are enabled
 */
export function hasAnyEarlyAccess(featureIds: string[]): boolean {
  return featureIds.length > 0;
}
