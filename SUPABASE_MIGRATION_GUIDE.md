# Supabase Migration Guide

This guide explains how to migrate your DreamScale app from localStorage to Supabase.

## Overview

The app now uses a **hybrid approach**:
- **Supabase** (when user is authenticated) - Primary storage
- **localStorage** (fallback) - Backup storage for unauthenticated users or when Supabase is unavailable

## Database Schema

Run the SQL schema in `supabase-migration-schema.sql` in your Supabase SQL Editor to create all necessary tables:

1. `user_sessions` - General session data
2. `calendar_events` - Calendar events
3. `hypeos_data` - Venture Quest data (tasks, goals, quests)
4. `chat_conversations` - Bizora AI chat history
5. `systems_data` - Systems and SOPs
6. `revenue_data` - Revenue intelligence data
7. `leadership_data` - Leadership data
8. `teams_data` - Teams data
9. `feedback` - User feedback
10. `testimonials` - User testimonials
11. `daily_mood` - Daily mood tracking
12. `tasks_data` - Tasks data

## What's Been Migrated

### ✅ Completed Migrations

1. **Session Context** (`lib/session-context.tsx`)
   - Loads from Supabase when authenticated
   - Falls back to localStorage for unauthenticated users
   - Auto-saves to both Supabase and localStorage

2. **Revenue Intelligence** (`app/revenue-intelligence/page.tsx`)
   - Uses Supabase when authenticated
   - Falls back to localStorage

3. **Leadership** (`app/marketplace/page.tsx`)
   - Uses Supabase when authenticated
   - Falls back to localStorage

4. **Teams** (`app/teams/page.tsx`)
   - Uses Supabase when authenticated
   - Falls back to localStorage

5. **Feedback** (`app/feedback/page.tsx`)
   - Saves to Supabase when authenticated
   - Falls back to localStorage

6. **Onboarding** (`components/onboarding/integrated-onboarding.tsx`)
   - Saves to `user_profiles` table
   - Sets `onboarding_completed` flag

## Data Service Functions

All Supabase operations are handled through `lib/supabase-data.ts`:

```typescript
// Session data
saveSessionData(userId, sessionData)
loadSessionData(userId)

// Calendar
saveCalendarEvents(userId, events)
loadCalendarEvents(userId)

// HypeOS
saveHypeOSData(userId, hypeosData)
loadHypeOSData(userId)

// Chat
saveChatConversations(userId, conversations)
loadChatConversations(userId)

// Systems
saveSystemsData(userId, systemsData)
loadSystemsData(userId)

// Revenue
saveRevenueData(userId, revenueData)
loadRevenueData(userId)

// Leadership
saveLeadershipData(userId, leadershipData)
loadLeadershipData(userId)

// Teams
saveTeamsData(userId, teamsData)
loadTeamsData(userId)

// Feedback
saveFeedback(userId, email, feedbackData)
saveTestimonial(userId, email, testimonial)

// Daily Mood
saveDailyMood(userId, mood, date, timestamp)
loadDailyMood(userId, date)

// Tasks
saveTasksData(userId, tasksData)
loadTasksData(userId)
```

## How It Works

### For Authenticated Users

1. On page load, data is loaded from Supabase
2. When data changes, it's saved to both Supabase and localStorage
3. localStorage acts as a backup/cache

### For Unauthenticated Users

1. Data is stored in localStorage only
2. When user logs in, data can be migrated to Supabase (future enhancement)

## Error Handling

All Supabase operations include error handling:
- If Supabase save fails, data is still saved to localStorage
- If Supabase load fails, falls back to localStorage
- Errors are logged to console but don't break the app

## Row Level Security (RLS)

All tables have RLS enabled:
- Users can only access their own data
- Policies are set to `auth.uid() = user_id`

## Migration Steps

1. **Run the SQL schema** in Supabase SQL Editor:
   ```sql
   -- Copy and paste contents of supabase-migration-schema.sql
   ```

2. **Verify environment variables** are set:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Test the migration**:
   - Log in with Google OAuth
   - Create some data (calendar events, tasks, etc.)
   - Check Supabase dashboard to verify data is saved
   - Refresh page to verify data loads from Supabase

## Future Enhancements

- [ ] Automatic migration of localStorage data to Supabase on first login
- [ ] Data sync conflict resolution
- [ ] Offline mode with sync when online
- [ ] Batch operations for better performance

## Troubleshooting

### Data not saving to Supabase

1. Check browser console for errors
2. Verify user is authenticated (`useAuth()` hook)
3. Check Supabase RLS policies
4. Verify environment variables are set

### Data not loading from Supabase

1. Check browser console for errors
2. Verify data exists in Supabase dashboard
3. Check RLS policies allow read access
4. Verify user_id matches in database

### localStorage still being used

This is expected behavior! localStorage is used as:
- Backup when Supabase fails
- Primary storage for unauthenticated users
- Cache for faster initial loads

## Notes

- All data is saved to both Supabase and localStorage for redundancy
- localStorage keys remain the same for backward compatibility
- The migration is backward compatible - existing localStorage data still works
- No data loss during migration - both storage methods are maintained

