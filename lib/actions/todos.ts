'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { calculateTaskXP } from '@/lib/gamification/xp-calculator'
import { calculateLevel } from '@/lib/gamification/xp-calculator'
import { updateStreak } from '@/lib/gamification/streak-tracker'

export type Todo = {
    id: string
    user_id: string
    title: string
    priority: 'low' | 'medium' | 'high'
    due_date: string | null
    completed: boolean
    recurring: boolean
    xp_reward: number
    created_at: string
    updated_at: string
    completed_at: string | null
}

export async function getTodos() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as Todo[]
}

export async function createTodo(formData: {
    title: string
    priority: 'low' | 'medium' | 'high'
    due_date?: string
    recurring?: boolean
}) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const xpReward = calculateTaskXP(formData.priority)

    const { data, error } = await supabase
        .from('todos')
        .insert([
            {
                user_id: user.id,
                title: formData.title,
                priority: formData.priority,
                due_date: formData.due_date || null,
                recurring: formData.recurring || false,
                xp_reward: xpReward,
            },
        ])
        .select()
        .single()

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/todos')
    return data as Todo
}

export async function updateTodo(id: string, updates: Partial<Todo>) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/todos')
    revalidatePath('/dashboard')
    return data as Todo
}

export async function toggleTodoComplete(id: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Get current todo
    const { data: todo, error: fetchError } = await supabase
        .from('todos')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (fetchError || !todo) throw new Error('Todo not found')

    const now = new Date().toISOString()
    const isCompleting = !todo.completed

    // Update todo status
    const { data, error } = await supabase
        .from('todos')
        .update({
            completed: isCompleting,
            completed_at: isCompleting ? now : null,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) throw new Error(error.message)

    // If completing, award XP and update streak
    if (isCompleting) {
        // Get current gamification stats
        const { data: stats } = await supabase
            .from('gamification_stats')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (stats) {
            const newTotalXP = stats.total_xp + todo.xp_reward
            const newLevel = calculateLevel(newTotalXP)

            // Update gamification stats
            await supabase
                .from('gamification_stats')
                .update({
                    total_xp: newTotalXP,
                    level: newLevel,
                })
                .eq('user_id', user.id)

            // Update streak
            await updateStreak(user.id)

            // Log activity
            await supabase.from('activity_log').insert({
                user_id: user.id,
                activity_type: 'task_completed',
                xp_earned: todo.xp_reward,
                metadata: {
                    todo_id: id,
                    title: todo.title,
                    priority: todo.priority,
                },
            })
        }
    }

    revalidatePath('/dashboard/todos')
    revalidatePath('/dashboard')
    return data as Todo
}

export async function deleteTodo(id: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/todos')
    revalidatePath('/dashboard')
}

export async function getTodosToday() {
    const todos = await getTodos()
    const today = new Date().toISOString().split('T')[0]

    return todos.filter((todo) => {
        if (!todo.due_date) return false
        return todo.due_date === today
    })
}

export async function getTodosThisWeek() {
    const todos = await getTodos()
    const today = new Date()
    const weekFromNow = new Date(today)
    weekFromNow.setDate(weekFromNow.getDate() + 7)

    return todos.filter((todo) => {
        if (!todo.due_date) return false
        const dueDate = new Date(todo.due_date)
        return dueDate >= today && dueDate <= weekFromNow
    })
}
