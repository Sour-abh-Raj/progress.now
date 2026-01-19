'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { calculateProjectXP, calculateLevel } from '@/lib/gamification/xp-calculator'
import { updateStreak } from '@/lib/gamification/streak-tracker'

export type Project = {
    id: string
    user_id: string
    title: string
    description: string | null
    status: 'planned' | 'ongoing' | 'completed'
    start_date: string | null
    end_date: string | null
    tags: string[] | null
    xp_reward: number
    created_at: string
    updated_at: string
}

export async function getProjects() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as Project[]
}

export async function getProject(id: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error) throw new Error(error.message)
    return data as Project
}

export async function createProject(formData: {
    title: string
    description?: string
    status: 'planned' | 'ongoing' | 'completed'
    start_date?: string
    end_date?: string
    tags?: string[]
    xp_reward?: number
}) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('projects')
        .insert([
            {
                user_id: user.id,
                title: formData.title,
                description: formData.description || null,
                status: formData.status,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
                tags: formData.tags || null,
                xp_reward: formData.xp_reward || 100,
            },
        ])
        .select()
        .single()

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/projects')
    revalidatePath('/dashboard')
    return data as Project
}

export async function updateProject(id: string, updates: Partial<Project>) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Get current project to check if status changed to completed
    const { data: currentProject } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) throw new Error(error.message)

    // If project was just completed, award XP
    if (
        currentProject &&
        currentProject.status !== 'completed' &&
        updates.status === 'completed'
    ) {
        const xpEarned = calculateProjectXP(data)

        // Get current gamification stats
        const { data: stats } = await supabase
            .from('gamification_stats')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (stats) {
            const newTotalXP = stats.total_xp + xpEarned
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
                activity_type: 'project_completed',
                xp_earned: xpEarned,
                metadata: {
                    project_id: id,
                    title: data.title,
                },
            })
        }
    }

    revalidatePath('/dashboard/projects')
    revalidatePath('/dashboard')
    return data as Project
}

export async function deleteProject(id: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/projects')
    revalidatePath('/dashboard')
}

export async function getProjectsByStatus(status: 'planned' | 'ongoing' | 'completed') {
    const projects = await getProjects()
    return projects.filter((p) => p.status === status)
}
