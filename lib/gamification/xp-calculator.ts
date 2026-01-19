/**
 * XP Calculation and Level Progression Logic
 */

// XP rewards configuration
export const XP_REWARDS = {
    TODO: {
        low: 10,
        medium: 20,
        high: 30,
    },
    PROJECT: {
        base: 100,
        completionBonus: 50,
    },
    RESEARCH: {
        created: 5,
    },
    STREAK: {
        daily: 5,
        weeklyBonus: 25,
    },
} as const

/**
 * Calculate XP reward for completing a task based on priority
 */
export function calculateTaskXP(priority: 'low' | 'medium' | 'high'): number {
    return XP_REWARDS.TODO[priority]
}

/**
 * Calculate XP reward for completing a project
 * Includes base XP + completion bonus
 */
export function calculateProjectXP(project: {
    status: string
    xp_reward?: number
}): number {
    const baseXP = project.xp_reward || XP_REWARDS.PROJECT.base
    if (project.status === 'completed') {
        return baseXP + XP_REWARDS.PROJECT.completionBonus
    }
    return baseXP
}

/**
 * Calculate user level based on total XP
 * Formula: level = floor(sqrt(totalXP / 100))
 * 
 * Level progression:
 * Level 1: 0 XP
 * Level 2: 400 XP
 * Level 3: 900 XP
 * Level 4: 1,600 XP
 * Level 5: 2,500 XP
 * Level 10: 10,000 XP
 * Level 20: 40,000 XP
 */
export function calculateLevel(totalXP: number): number {
    if (totalXP < 0) return 1
    return Math.floor(Math.sqrt(totalXP / 100)) + 1
}

/**
 * Get XP required for a specific level
 */
export function getXPForLevel(level: number): number {
    if (level <= 1) return 0
    return (level - 1) ** 2 * 100
}

/**
 * Get XP required to reach the next level
 */
export function getXPForNextLevel(currentLevel: number): number {
    return getXPForLevel(currentLevel + 1)
}

/**
 * Get progress to next level as a percentage
 */
export function getProgressToNextLevel(
    totalXP: number,
    currentLevel: number
): { current: number; required: number; percentage: number } {
    const currentLevelXP = getXPForLevel(currentLevel)
    const nextLevelXP = getXPForNextLevel(currentLevel)
    const xpInCurrentLevel = totalXP - currentLevelXP
    const xpRequiredForLevel = nextLevelXP - currentLevelXP

    return {
        current: xpInCurrentLevel,
        required: xpRequiredForLevel,
        percentage: (xpInCurrentLevel / xpRequiredForLevel) * 100,
    }
}

/**
 * Calculate XP for maintaining a streak
 */
export function calculateStreakXP(streakDays: number): number {
    let xp = XP_REWARDS.STREAK.daily

    // Bonus XP for week-long streaks
    if (streakDays % 7 === 0 && streakDays > 0) {
        xp += XP_REWARDS.STREAK.weeklyBonus
    }

    return xp
}
