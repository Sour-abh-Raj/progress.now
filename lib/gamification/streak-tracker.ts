import { createClient } from '@/lib/supabase/server'
import { calculateLevel, calculateStreakXP } from './xp-calculator'

/**
 * Check if streak should be broken based on last activity date
 */
export function checkStreakBreak(lastActivityDate: Date | null): boolean {
    if (!lastActivityDate) return true

    const now = new Date()
    const lastActivity = new Date(lastActivityDate)

    // Set both dates to midnight for accurate day comparison
    now.setHours(0, 0, 0, 0)
    lastActivity.setHours(0, 0, 0, 0)

    const diffTime = now.getTime() - lastActivity.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)

    // Streak breaks if last activity was more than 1 day ago
    return diffDays > 1
}

/**
 * Update user's streak based on current activity
 */
export async function updateStreak(userId: string): Promise<{
    currentStreak: number
    xpEarned: number
    streakBroken: boolean
}> {
    const supabase = await createClient()

    // Get current gamification stats
    const { data: stats, error } = await supabase
        .from('gamification_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error || !stats) {
        throw new Error('Failed to fetch gamification stats')
    }

    const today = new Date().toISOString().split('T')[0]
    const lastActivityDate = stats.last_activity_date
        ? new Date(stats.last_activity_date)
        : null

    // Check if this is activity for today already
    if (lastActivityDate?.toISOString().split('T')[0] === today) {
        return {
            currentStreak: stats.current_streak,
            xpEarned: 0,
            streakBroken: false,
        }
    }

    const streakBroken = checkStreakBreak(lastActivityDate)

    let currentStreak = streakBroken ? 1 : stats.current_streak + 1
    let xpEarned = calculateStreakXP(currentStreak)

    // Update gamification stats
    const { error: updateError } = await supabase
        .from('gamification_stats')
        .update({
            current_streak: currentStreak,
            longest_streak: Math.max(currentStreak, stats.longest_streak),
            last_activity_date: today,
            total_xp: stats.total_xp + xpEarned,
            level: calculateLevel(stats.total_xp + xpEarned),
        })
        .eq('user_id', userId)

    if (updateError) {
        throw new Error('Failed to update streak')
    }

    // Log activity
    await supabase.from('activity_log').insert({
        user_id: userId,
        activity_type: 'streak_updated',
        xp_earned: xpEarned,
        metadata: {
            streak: currentStreak,
            broken: streakBroken,
        },
    })

    return { currentStreak, xpEarned, streakBroken }
}

/**
 * Calculate weekly productivity score (0-100)
 * Based on tasks completed, projects advanced, and streak maintenance
 */
export async function calculateWeeklyScore(userId: string): Promise<number> {
    const supabase = await createClient()

    // Get activity from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: activities, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString())

    if (error || !activities) {
        return 0
    }

    // Count activities by type
    const taskCompletions = activities.filter(
        (a) => a.activity_type === 'task_completed'
    ).length
    const projectCompletions = activities.filter(
        (a) => a.activity_type === 'project_completed'
    ).length
    const streakDays = activities.filter(
        (a) => a.activity_type === 'streak_updated'
    ).length

    // Calculate score (weighted)
    // Tasks: 40%, Projects: 40%, Streak: 20%
    const taskScore = Math.min((taskCompletions / 20) * 40, 40) // Max 20 tasks/week
    const projectScore = Math.min((projectCompletions / 3) * 40, 40) // Max 3 projects/week
    const streakScore = (streakDays / 7) * 20 // 7 days = full score

    return Math.round(taskScore + projectScore + streakScore)
}

/**
 * Get streak statistics for visualization
 */
export async function getStreakHistory(
    userId: string,
    days: number = 30
): Promise<{ date: string; hasActivity: boolean }[]> {
    const supabase = await createClient()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: activities } = await supabase
        .from('activity_log')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())

    const activityDates = new Set(
        activities?.map((a) => new Date(a.created_at).toISOString().split('T')[0]) || []
    )

    const history: { date: string; hasActivity: boolean }[] = []
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateString = date.toISOString().split('T')[0]
        history.push({
            date: dateString,
            hasActivity: activityDates.has(dateString),
        })
    }

    return history
}
