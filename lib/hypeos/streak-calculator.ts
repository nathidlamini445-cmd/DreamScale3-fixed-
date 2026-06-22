// Venture Quest Streak Calculator
// Handles streak tracking, maintenance, and bonus calculations

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  streakStartDate: Date;
  totalDaysActive: number;
}

export interface StreakMilestone {
  days: number;
  name: string;
  description: string;
  multiplier: number;
  reward?: string;
}

export interface StreakStatus {
  isActive: boolean;
  daysUntilReset: number;
  canMaintain: boolean;
  nextMilestone?: StreakMilestone;
}

// Streak milestones and their rewards
export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 3,
    name: "Getting Started",
    description: "First 3 days completed!",
    multiplier: 1.5,
    reward: "1.5x Points Multiplier"
  },
  {
    days: 7,
    name: "Week Warrior",
    description: "One full week of consistency!",
    multiplier: 2.0,
    reward: "2x Points Multiplier + Bronze Rewards"
  },
  {
    days: 14,
    name: "Two Week Champion",
    description: "Two weeks of dedication!",
    multiplier: 2.5,
    reward: "2.5x Points Multiplier"
  },
  {
    days: 21,
    name: "Habit Master",
    description: "Three weeks - habit formed!",
    multiplier: 3.0,
    reward: "3x Points Multiplier + Silver Rewards"
  },
  {
    days: 30,
    name: "Monthly Legend",
    description: "One month of consistency!",
    multiplier: 3.5,
    reward: "3.5x Points Multiplier"
  },
  {
    days: 50,
    name: "Consistency King",
    description: "50 days of unstoppable progress!",
    multiplier: 4.0,
    reward: "4x Points Multiplier + Gold Rewards"
  },
  {
    days: 100,
    name: "Century Streak",
    description: "100 days - you're legendary!",
    multiplier: 5.0,
    reward: "5x Points Multiplier + Platinum Rewards"
  }
];

/** Parse stored last-active timestamp; missing/invalid → epoch (never active). */
export function parseLastActiveDate(value?: string | Date | null): Date {
  if (!value) return new Date(0)
  const d = value instanceof Date ? new Date(value.getTime()) : new Date(value)
  return Number.isNaN(d.getTime()) ? new Date(0) : d
}

export function daysSinceLastActiveMidnight(
  lastActiveDate: Date,
  today: Date = new Date()
): number {
  const lastMidnight = new Date(
    lastActiveDate.getFullYear(),
    lastActiveDate.getMonth(),
    lastActiveDate.getDate()
  )
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )
  return Math.floor(
    (todayMidnight.getTime() - lastMidnight.getTime()) / (1000 * 60 * 60 * 24)
  )
}

export function calculateStreakStatus(
  streakData: StreakData,
  today: Date = new Date()
): StreakStatus {
  const daysSinceLastActive = daysSinceLastActiveMidnight(
    streakData.lastActiveDate,
    today
  )

  // Duolingo-style: streak is alive if you practiced yesterday or today
  const isActive = daysSinceLastActive <= 1
  
  // Days until streak resets (if no activity today)
  const daysUntilReset = isActive ? 0 : 1;
  
  // Can maintain streak if last activity was yesterday
  const canMaintain = daysSinceLastActive === 1;

  // Find next milestone
  const nextMilestone = STREAK_MILESTONES.find(
    milestone => milestone.days > streakData.currentStreak
  );

  return {
    isActive,
    daysUntilReset,
    canMaintain,
    nextMilestone
  };
}

/**
 * Duolingo-style: if you skipped a full calendar day, streak breaks to 0 on load.
 * Does not fake activity — lastActiveDate is preserved.
 */
export function syncStreakOnDayChange(
  streakData: StreakData,
  today: Date = new Date()
): StreakData {
  const lastActive = parseLastActiveDate(streakData.lastActiveDate)

  if (streakData.currentStreak > 0) {
    // No recorded completion day — streak cannot be valid
    if (lastActive.getTime() <= 0) {
      return { ...streakData, lastActiveDate: lastActive, currentStreak: 0 }
    }

    const daysSince = daysSinceLastActiveMidnight(lastActive, today)

    // Duolingo-style: skip one or more full calendar days → streak breaks
    if (daysSince > 1) {
      return { ...streakData, lastActiveDate: lastActive, currentStreak: 0 }
    }
  }

  return { ...streakData, lastActiveDate: lastActive }
}

/** Alias for syncStreakOnDayChange */
export const syncStreakOnLoad = syncStreakOnDayChange

/** @deprecated Use syncStreakOnDayChange — kept for imports */
export function checkAndResetStreakIfNeeded(
  streakData: StreakData,
  currentDate: Date = new Date()
): StreakData {
  return syncStreakOnDayChange(streakData, currentDate)
}

export function shouldResetStreak(
  streakData: StreakData,
  currentDate: Date = new Date()
): boolean {
  return (
    daysSinceLastActiveMidnight(streakData.lastActiveDate, currentDate) > 1 &&
    streakData.currentStreak > 0
  )
}

export function updateStreak(
  streakData: StreakData,
  activityDate: Date = new Date()
): StreakData {
  const lastActive = parseLastActiveDate(streakData.lastActiveDate)
  const daysSinceLastActive = daysSinceLastActiveMidnight(lastActive, activityDate)

  let newStreakData = { ...streakData, lastActiveDate: lastActive }

  if (daysSinceLastActive === 0) {
    if (newStreakData.currentStreak === 0) {
      newStreakData.currentStreak = 1
      newStreakData.longestStreak = Math.max(
        1,
        newStreakData.longestStreak
      )
      newStreakData.streakStartDate = activityDate
      newStreakData.totalDaysActive += 1
    }
    newStreakData.lastActiveDate = activityDate
    return newStreakData
  }

  if (daysSinceLastActive === 1) {
    newStreakData.currentStreak += 1
    newStreakData.longestStreak = Math.max(
      newStreakData.longestStreak,
      newStreakData.currentStreak
    )
    newStreakData.lastActiveDate = activityDate
    newStreakData.totalDaysActive += 1
    return newStreakData
  }

  if (daysSinceLastActive > 1) {
    newStreakData.currentStreak = 1
    newStreakData.streakStartDate = activityDate
    newStreakData.lastActiveDate = activityDate
    newStreakData.totalDaysActive += 1
    return newStreakData
  }

  newStreakData.lastActiveDate = activityDate
  return newStreakData
}

/** Award streak credit when the user completes meaningful work today. */
export function applyTodayActivityToStreak(
  streakData: StreakData,
  activityDate: Date = new Date()
): StreakData {
  return updateStreak(streakData, activityDate)
}

export function getStreakMultiplier(streak: number): number {
  // Find the highest applicable milestone
  const applicableMilestones = STREAK_MILESTONES.filter(
    milestone => streak >= milestone.days
  );

  if (applicableMilestones.length === 0) {
    return 1.0;
  }

  // Return the highest multiplier
  return Math.max(...applicableMilestones.map(m => m.multiplier));
}

export function getStreakLevel(streak: number): {
  level: string;
  color: string;
  icon: string;
} {
  if (streak >= 100) {
    return { level: "Legendary", color: "text-purple-600", icon: "👑" };
  } else if (streak >= 50) {
    return { level: "Epic", color: "text-red-600", icon: "🏆" };
  } else if (streak >= 30) {
    return { level: "Master", color: "text-orange-600", icon: "⭐" };
  } else if (streak >= 21) {
    return { level: "Expert", color: "text-yellow-600", icon: "⚡" };
  } else if (streak >= 14) {
    return { level: "Advanced", color: "text-green-600", icon: "🔥" };
  } else if (streak >= 7) {
    return { level: "Intermediate", color: "text-blue-600", icon: "💪" };
  } else if (streak >= 3) {
    return { level: "Beginner", color: "text-gray-600", icon: "🌱" };
  } else {
    return { level: "Starting", color: "text-gray-500", icon: "🚀" };
  }
}

export function getStreakMotivation(streak: number): string {
  const motivations = [
    "Every day counts! Keep building that momentum! 🚀",
    "You're building something amazing! 💪",
    "Consistency is your superpower! ⚡",
    "Each day makes you stronger! 🔥",
    "You're creating unstoppable habits! 🌟",
    "Progress compounds every single day! 📈",
    "You're becoming the person you want to be! 🎯"
  ];

  // Cycle through motivations based on streak
  const index = streak % motivations.length;
  return motivations[index];
}

export function calculateStreakBonus(
  basePoints: number,
  streak: number
): { multiplier: number; bonusPoints: number } {
  const multiplier = getStreakMultiplier(streak);
  const bonusPoints = Math.round(basePoints * (multiplier - 1));
  
  return { multiplier, bonusPoints };
}

export function getStreakCalendar(
  streakData: StreakData,
  days: number = 30
): Array<{ date: Date; active: boolean; streakDay: number }> {
  const calendar = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Check if this date was active (simplified logic)
    const isActive = Math.random() > 0.3; // Mock data - replace with real logic
    
    calendar.push({
      date,
      active: isActive,
      streakDay: isActive ? Math.max(1, streakData.currentStreak - i) : 0
    });
  }
  
  return calendar;
}

export function getStreakInsights(streakData: StreakData): {
  averageStreakLength: number;
  streakFrequency: number;
  bestStreakPeriod: string;
  recommendations: string[];
} {
  // Mock insights - replace with real calculations
  const insights = {
    averageStreakLength: Math.round(streakData.longestStreak * 0.6),
    streakFrequency: Math.round((streakData.totalDaysActive / 365) * 100),
    bestStreakPeriod: "Monday mornings",
    recommendations: [
      "Set a consistent daily reminder",
      "Complete at least one task before 10 AM",
      "Join an accountability squad",
      "Celebrate small wins daily"
    ]
  };

  return insights;
}

export function predictStreakOutcome(
  currentStreak: number,
  consistencyRate: number
): {
  predicted30Days: number;
  predicted90Days: number;
  confidence: number;
} {
  // Simple prediction model
  const dailyConsistency = consistencyRate / 100;
  const predicted30Days = Math.round(currentStreak + (30 * dailyConsistency));
  const predicted90Days = Math.round(currentStreak + (90 * dailyConsistency));
  
  // Confidence based on consistency rate
  const confidence = Math.min(95, Math.max(60, consistencyRate));

  return {
    predicted30Days,
    predicted90Days,
    confidence
  };
}

/** Build a 7-day (Sun–Sat) completion array for streak UI */
export function buildWeeklyProgress(
  currentStreak: number,
  todayCompleted = true
): number[] {
  const progress = [0, 0, 0, 0, 0, 0, 0]
  if (!todayCompleted || currentStreak <= 0) return progress

  const todayIdx = new Date().getDay()
  progress[todayIdx] = 1
  for (let i = 1; i < currentStreak && i < 7; i++) {
    progress[(todayIdx - i + 7) % 7] = 1
  }
  return progress
}
