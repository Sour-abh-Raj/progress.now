/**
 * Badge System
 * Defines achievement badges and unlock conditions
 */

export interface Badge {
    id: string
    name: string
    description: string
    icon: string
    condition: (stats: UserStats) => boolean
}

export interface UserStats {
    totalXP: number
    level: number
    currentStreak: number
    longestStreak: number
    tasksCompleted: number
    projectsCompleted: number
    researchIdeas: number
}

export const BADGES: Badge[] = [
    {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first task',
        icon: '🎯',
        condition: (stats) => stats.tasksCompleted >= 1,
    },
    {
        id: 'task_master',
        name: 'Task Master',
        description: 'Complete 10 tasks',
        icon: '✅',
        condition: (stats) => stats.tasksCompleted >= 10,
    },
    {
        id: 'productivity_king',
        name: 'Productivity King',
        description: 'Complete 100 tasks',
        icon: '👑',
        condition: (stats) => stats.tasksCompleted >= 100,
    },
    {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        condition: (stats) => stats.currentStreak >= 7,
    },
    {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Maintain a 30-day streak',
        icon: '⚡',
        condition: (stats) => stats.currentStreak >= 30,
    },
    {
        id: 'streak_legend',
        name: 'Streak Legend',
        description: 'Achieve a 100-day streak',
        icon: '🌟',
        condition: (stats) => stats.longestStreak >= 100,
    },
    {
        id: 'project_starter',
        name: 'Project Starter',
        description: 'Complete your first project',
        icon: '🚀',
        condition: (stats) => stats.projectsCompleted >= 1,
    },
    {
        id: 'project_master',
        name: 'Project Master',
        description: 'Complete 10 projects',
        icon: '🏆',
        condition: (stats) => stats.projectsCompleted >= 10,
    },
    {
        id: 'visionary',
        name: 'Visionary',
        description: 'Create 25 research ideas',
        icon: '💡',
        condition: (stats) => stats.researchIdeas >= 25,
    },
    {
        id: 'rising_star',
        name: 'Rising Star',
        description: 'Reach level 5',
        icon: '⭐',
        condition: (stats) => stats.level >= 5,
    },
    {
        id: 'century_club',
        name: 'Century Club',
        description: 'Reach level 10',
        icon: '💯',
        condition: (stats) => stats.level >= 10,
    },
    {
        id: 'elite',
        name: 'Elite',
        description: 'Reach level 20',
        icon: '💎',
        condition: (stats) => stats.level >= 20,
    },
]

/**
 * Check which badges a user has unlocked
 */
export function getUnlockedBadges(stats: UserStats): Badge[] {
    return BADGES.filter((badge) => badge.condition(stats))
}

/**
 * Get next badge to unlock for motivation
 */
export function getNextBadge(stats: UserStats): Badge | null {
    const lockedBadges = BADGES.filter((badge) => !badge.condition(stats))

    if (lockedBadges.length === 0) return null

    // Return first locked badge (they're ordered by difficulty)
    return lockedBadges[0]
}

/**
 * Get badge unlock progress for a specific badge
 */
export function getBadgeProgress(badge: Badge, stats: UserStats): {
    unlocked: boolean
    progress: number
    description: string
} {
    const unlocked = badge.condition(stats)

    let progress = 0
    let description = badge.description

    // Calculate progress for specific badges
    if (badge.id === 'task_master') {
        progress = (stats.tasksCompleted / 10) * 100
        description = `${stats.tasksCompleted}/10 tasks completed`
    } else if (badge.id === 'productivity_king') {
        progress = (stats.tasksCompleted / 100) * 100
        description = `${stats.tasksCompleted}/100 tasks completed`
    } else if (badge.id === 'week_warrior') {
        progress = (stats.currentStreak / 7) * 100
        description = `${stats.currentStreak}/7 day streak`
    } else if (badge.id === 'unstoppable') {
        progress = (stats.currentStreak / 30) * 100
        description = `${stats.currentStreak}/30 day streak`
    } else if (badge.id === 'project_master') {
        progress = (stats.projectsCompleted / 10) * 100
        description = `${stats.projectsCompleted}/10 projects completed`
    } else if (badge.id === 'century_club') {
        progress = (stats.level / 10) * 100
        description = `Level ${stats.level}/10`
    }

    return {
        unlocked,
        progress: Math.min(progress, 100),
        description,
    }
}
