import { z } from 'zod'

export const deleteAccountSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
})

export const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(50000, 'Message too long'),
  conversationHistory: z.array(z.any()).optional().default([]),
  isResearch: z.boolean().optional().default(false),
  fileContent: z.string().optional(),
  fileAttachments: z.array(z.any()).optional(),
  userProfile: z.any().optional(),
  dailyMood: z.string().optional(),
  hobbies: z.array(z.string()).optional(),
  favoriteSong: z.string().optional(),
  userId: z.string().optional(),
})

export const taskGenerateSchema = z.object({
  onboardingData: z.object({
    businessName: z.string().optional(),
    industry: z.union([z.string(), z.array(z.string())]).optional(),
    businessStage: z.union([z.string(), z.array(z.string())]).optional(),
    challenges: z.union([z.string(), z.array(z.string())]).optional(),
    revenueGoal: z.union([z.string(), z.array(z.string())]).optional(),
    biggestGoal: z.union([z.string(), z.array(z.string())]).optional(),
    targetMarket: z.union([z.string(), z.array(z.string())]).optional(),
    teamSize: z.union([z.string(), z.array(z.string())]).optional(),
    monthlyRevenue: z.union([z.string(), z.array(z.string())]).optional(),
    primaryRevenue: z.union([z.string(), z.array(z.string())]).optional(),
    growthStrategy: z.union([z.string(), z.array(z.string())]).optional(),
  }).passthrough(),
})

export const welcomeEmailSchema = z.object({
  email: z.string().email('Invalid email format'),
})

export const rewardFulfillSchema = z.object({
  rewardId: z.number().int().positive(),
  userId: z.string().min(1),
  userEmail: z.string().email().optional(),
  userName: z.string().optional(),
  currentPoints: z.number().optional(),
  currentBadges: z.array(z.any()).optional().default([]),
  currentFeatures: z.array(z.any()).optional().default([]),
})

export const rewardEmailSchema = z.object({
  rewardId: z.number().int().positive(),
  email: z.string().email('Invalid email format'),
  userName: z.string().optional(),
  downloadLink: z.string().url().optional(),
  rewardTitle: z.string().optional(),
})

export const rewardDownloadSchema = z.object({
  rewardId: z.string().regex(/^\d+$/, 'Invalid reward ID'),
  token: z.string().min(1, 'Token is required'),
})
