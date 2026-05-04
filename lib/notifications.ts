// Notification system for showing badges when there are actual reminders/tasks

export interface NotificationData {
  hasCalendarReminders: boolean
  hasTaskReminders: boolean
  hasChatNotifications: boolean
  hasWorkflowNotifications: boolean
}

export interface FeatureNotifications {
  discover: boolean
  bizora: boolean
  skilldrops: boolean
  flowmatch: boolean
  pitchpoint: boolean
  calendar: boolean
  hypeos: boolean
  revenue: boolean
  teams: boolean
}

// Safely read + JSON.parse a localStorage key. Returns `fallback` when
// localStorage is unavailable, the key is missing, or the stored value is
// corrupted (so a single bad key can't crash the whole notification system).
function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const EMPTY_SEEN_FEATURES: FeatureNotifications = {
  discover: false,
  bizora: false,
  skilldrops: false,
  flowmatch: false,
  pitchpoint: false,
  calendar: false,
  hypeos: false,
  revenue: false,
  teams: false,
}

// Track which features have been "seen" by the user
export function markFeatureAsSeen(feature: keyof FeatureNotifications) {
  if (typeof window === 'undefined') return
  const seenFeatures = getSeenFeatures()
  seenFeatures[feature] = true
  try {
    localStorage.setItem('dreamscale:seen-features', JSON.stringify(seenFeatures))
  } catch {
    // storage quota or denied — ignore
  }
}

// Get which features have been seen
export function getSeenFeatures(): FeatureNotifications {
  return safeReadJson<FeatureNotifications>('dreamscale:seen-features', { ...EMPTY_SEEN_FEATURES })
}

// Check if a feature has updates that haven't been seen
export function hasUnseenUpdates(feature: keyof FeatureNotifications): boolean {
  const seenFeatures = getSeenFeatures()
  const hasUpdates = checkForUpdates(feature)
  
  return hasUpdates && !seenFeatures[feature]
}

// Check if a specific feature has updates
function checkForUpdates(feature: keyof FeatureNotifications): boolean {
  switch (feature) {
    case 'discover':
    case 'skilldrops': {
      const storedTasks = safeReadJson<any[]>('dreamscale:tasks', [])
      return storedTasks.some(
        (t: any) => t?.urgent === true || t?.priority === 'high' || t?.dueToday === true
      )
    }

    case 'bizora': {
      const storedChats = safeReadJson<any[]>('bizora:conversations', [])
      return storedChats.some((c: any) => c?.unread === true || c?.needsResponse === true)
    }

    case 'calendar': {
      const storedReminders = safeReadJson<any[]>('dreamscale:reminders', [])
      return storedReminders.some((r: any) => r?.urgent === true || r?.priority === 'high')
    }

    case 'hypeos': {
      const storedWorkflows = safeReadJson<any[]>('dreamscale:workflows', [])
      return storedWorkflows.some((w: any) => w?.urgent === true || w?.priority === 'high')
    }

    // Notifications disabled for these features — users create content on their own.
    case 'flowmatch': // Systems
    case 'revenue':
    case 'pitchpoint': // Leadership
    case 'teams':
      return false

    default:
      return false
  }
}

// Mock function to check for actual notifications
// In a real app, this would check your backend/database for pending reminders
export function getNotificationStatus(): NotificationData {
  const storedReminders = safeReadJson<any[]>('dreamscale:reminders', [])
  const storedTasks = safeReadJson<any[]>('dreamscale:tasks', [])
  const storedChats = safeReadJson<any[]>('bizora:conversations', [])

  const hasUrgentReminders = storedReminders.some(
    (r: any) => r?.urgent === true || r?.priority === 'high'
  )
  const hasUrgentTasks = storedTasks.some(
    (t: any) => t?.urgent === true || t?.priority === 'high' || t?.dueToday === true
  )
  const hasUnreadChats = storedChats.some(
    (c: any) => c?.unread === true || c?.needsResponse === true
  )

  return {
    hasCalendarReminders: hasUrgentReminders,
    hasTaskReminders: hasUrgentTasks,
    hasChatNotifications: hasUnreadChats,
    hasWorkflowNotifications: false,
  }
}

// Helper function to add a reminder (for testing)
export function addTestReminder(type: 'calendar' | 'task' | 'chat') {
  if (typeof window === 'undefined') return

  const key = `dreamscale:${type === 'chat' ? 'conversations' : type + 's'}`
  const data = safeReadJson<any[]>(key, [])

  data.push({
    id: Date.now().toString(),
    title: `URGENT: ${type} reminder`,
    timestamp: new Date().toISOString(),
    urgent: true,
    priority: 'high',
    dueToday: type === 'task',
    unread: type === 'chat',
    needsResponse: type === 'chat',
  })
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    /* ignore quota */
  }
}

// Helper function to clear notifications
export function clearNotifications(type: 'calendar' | 'task' | 'chat') {
  if (typeof window === 'undefined') return
  
  const key = `dreamscale:${type === 'chat' ? 'conversations' : type + 's'}`
  localStorage.removeItem(key)
}

// Helper function to clear ALL test data
export function clearAllTestData() {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('dreamscale:reminders')
  localStorage.removeItem('dreamscale:tasks')
  localStorage.removeItem('bizora:conversations')
  localStorage.removeItem('dreamscale:workflows')
  localStorage.removeItem('dreamscale:seen-features')
  console.log('All test data cleared')
}

// Helper function to add test notifications for demonstration
export function addTestNotification(feature: keyof FeatureNotifications) {
  if (typeof window === 'undefined') return
  
  const now = new Date().toISOString()
  
  const safeSet = (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* ignore quota */
    }
  }

  switch (feature) {
    case 'discover':
    case 'skilldrops':
    case 'pitchpoint': {
      const tasks = safeReadJson<any[]>('dreamscale:tasks', [])
      tasks.push({
        id: Date.now().toString(),
        title: `URGENT: New ${feature} update`,
        urgent: true,
        priority: 'high',
        dueToday: true,
        timestamp: now,
      })
      safeSet('dreamscale:tasks', tasks)
      break
    }

    case 'bizora': {
      const chats = safeReadJson<any[]>('bizora:conversations', [])
      chats.push({
        id: Date.now().toString(),
        title: `New chat notification`,
        unread: true,
        needsResponse: true,
        timestamp: now,
      })
      safeSet('bizora:conversations', chats)
      break
    }

    case 'calendar': {
      const reminders = safeReadJson<any[]>('dreamscale:reminders', [])
      reminders.push({
        id: Date.now().toString(),
        title: `URGENT: Calendar reminder`,
        urgent: true,
        priority: 'high',
        timestamp: now,
      })
      safeSet('dreamscale:reminders', reminders)
      break
    }

    case 'hypeos':
    case 'flowmatch':
    case 'revenue':
    case 'teams': {
      const workflows = safeReadJson<any[]>('dreamscale:workflows', [])
      workflows.push({
        id: Date.now().toString(),
        title: `URGENT: ${feature} workflow update`,
        urgent: true,
        priority: 'high',
        timestamp: now,
      })
      safeSet('dreamscale:workflows', workflows)
      break
    }
  }

  // Reset the "seen" status so notifications appear
  const seenFeatures = getSeenFeatures()
  seenFeatures[feature] = false
  try {
    localStorage.setItem('dreamscale:seen-features', JSON.stringify(seenFeatures))
  } catch {
    /* ignore quota */
  }
}
