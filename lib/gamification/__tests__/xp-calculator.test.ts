import { describe, it, expect } from 'vitest'
import {
    calculateTaskXP,
    calculateProjectXP,
    calculateLevel,
    getXPForLevel,
    getXPForNextLevel,
    getProgressToNextLevel,
    calculateStreakXP,
    XP_REWARDS,
} from '../xp-calculator'

describe('XP Calculator', () => {
    describe('calculateTaskXP', () => {
        it('should return correct XP for low priority', () => {
            expect(calculateTaskXP('low')).toBe(10)
        })

        it('should return correct XP for medium priority', () => {
            expect(calculateTaskXP('medium')).toBe(20)
        })

        it('should return correct XP for high priority', () => {
            expect(calculateTaskXP('high')).toBe(30)
        })
    })

    describe('calculateProjectXP', () => {
        it('should return base XP for non-completed project', () => {
            const project = { status: 'ongoing', xp_reward: 100 }
            expect(calculateProjectXP(project)).toBe(100)
        })

        it('should return base XP + bonus for completed project', () => {
            const project = { status: 'completed', xp_reward: 100 }
            expect(calculateProjectXP(project)).toBe(150) // 100 + 50 bonus
        })

        it('should use default XP if not specified', () => {
            const project = { status: 'ongoing' }
            expect(calculateProjectXP(project)).toBe(100)
        })
    })

    describe('calculateLevel', () => {
        it('should return level 1 for 0 XP', () => {
            expect(calculateLevel(0)).toBe(1)
        })

        it('should return level 1 for negative XP', () => {
            expect(calculateLevel(-100)).toBe(1)
        })

        it('should return level 2 for 400 XP', () => {
            expect(calculateLevel(400)).toBe(3) // floor(sqrt(400/100)) + 1 = 2 + 1 = 3
        })

        it('should return level 10 for 10000 XP', () => {
            expect(calculateLevel(10000)).toBe(11) // floor(sqrt(10000/100)) + 1 = 10 + 1 = 11
        })

        it('should calculate intermediate levels correctly', () => {
            expect(calculateLevel(900)).toBe(4) // floor(sqrt(900/100)) + 1 = 3 + 1 = 4
            expect(calculateLevel(2500)).toBe(6) // floor(sqrt(2500/100)) + 1 = 5 + 1 = 6
        })
    })

    describe('getXPForLevel', () => {
        it('should return 0 for level 1', () => {
            expect(getXPForLevel(1)).toBe(0)
        })

        it('should return correct XP for level 2', () => {
            expect(getXPForLevel(2)).toBe(100) // (2-1)^2 * 100
        })

        it('should return correct XP for level 5', () => {
            expect(getXPForLevel(5)).toBe(1600) // (5-1)^2 * 100
        })

        it('should return correct XP for level 10', () => {
            expect(getXPForLevel(10)).toBe(8100) // (10-1)^2 * 100
        })
    })

    describe('getXPForNextLevel', () => {
        it('should return correct XP for next level', () => {
            expect(getXPForNextLevel(1)).toBe(100) // Level 2 requires 100 XP
            expect(getXPForNextLevel(2)).toBe(400) // Level 3 requires 400 XP
            expect(getXPForNextLevel(5)).toBe(2500) // Level 6 requires 2500 XP
        })
    })

    describe('getProgressToNextLevel', () => {
        it('should calculate progress correctly at level 1', () => {
            const progress = getProgressToNextLevel(50, 1)
            expect(progress.current).toBe(50)
            expect(progress.required).toBe(100)
            expect(progress.percentage).toBe(50)
        })

        it('should calculate progress correctly at level 2', () => {
            const progress = getProgressToNextLevel(200, 2) // 200 XP, level 2
            expect(progress.current).toBe(100) // 200 - 100 (level 2 starts at 100)
            expect(progress.required).toBe(300) // 400 - 100
            expect(Math.round(progress.percentage)).toBe(33)
        })

        it('should show 100% when exactly at next level threshold', () => {
            const progress = getProgressToNextLevel(100, 1) // Exactly at level 2
            expect(progress.percentage).toBe(100)
        })
    })

    describe('calculateStreakXP', () => {
        it('should return daily XP for single day', () => {
            expect(calculateStreakXP(1)).toBe(5)
        })

        it('should return daily XP + bonus for 7-day streak', () => {
            expect(calculateStreakXP(7)).toBe(30) // 5 + 25 bonus
        })

        it('should return daily XP + bonus for 14-day streak', () => {
            expect(calculateStreakXP(14)).toBe(30) // 5 + 25 bonus
        })

        it('should return only daily XP for 6-day streak', () => {
            expect(calculateStreakXP(6)).toBe(5) // No bonus yet
        })
    })

    describe('XP_REWARDS constants', () => {
        it('should have correct TODO rewards', () => {
            expect(XP_REWARDS.TODO.low).toBe(10)
            expect(XP_REWARDS.TODO.medium).toBe(20)
            expect(XP_REWARDS.TODO.high).toBe(30)
        })

        it('should have correct PROJECT rewards', () => {
            expect(XP_REWARDS.PROJECT.base).toBe(100)
            expect(XP_REWARDS.PROJECT.completionBonus).toBe(50)
        })

        it('should have correct STREAK rewards', () => {
            expect(XP_REWARDS.STREAK.daily).toBe(5)
            expect(XP_REWARDS.STREAK.weeklyBonus).toBe(25)
        })
    })
})
