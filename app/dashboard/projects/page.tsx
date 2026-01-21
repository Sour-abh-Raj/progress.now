'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { getProjects, createProject, deleteProject, type Project } from '@/lib/actions/projects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { ProjectListSkeleton } from '@/components/skeletons/project-skeleton'

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    // Form state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [status, setStatus] = useState<'planned' | 'ongoing' | 'completed'>('planned')

    const loadProjects = useCallback(async () => {
        try {
            const data = await getProjects()
            setProjects(data)
        } catch {
            toast.error('Failed to load projects')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadProjects()
    }, [loadProjects])

    const handleCreate = async () => {
        if (!title.trim()) {
            toast.error('Please enter a title')
            return
        }

        const trimmedTitle = title.trim()
        const trimmedDescription = description.trim()
        
        // Optimistic update: add project immediately
        const optimisticProject: Project = {
            id: `temp-${Date.now()}`,
            user_id: '',
            title: trimmedTitle,
            description: trimmedDescription || null,
            status,
            start_date: null,
            end_date: null,
            tags: null,
            xp_reward: 100,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        
        setProjects(prev => [optimisticProject, ...prev])
        setTitle('')
        setDescription('')
        setStatus('planned')
        setDialogOpen(false)
        toast.success('Project created!')

        startTransition(async () => {
            try {
                const newProject = await createProject({
                    title: trimmedTitle,
                    description: trimmedDescription || undefined,
                    status,
                })
                // Replace optimistic project with real one
                setProjects(prev => prev.map(p => 
                    p.id === optimisticProject.id ? newProject : p
                ))
            } catch {
                // Revert optimistic update on error
                setProjects(prev => prev.filter(p => p.id !== optimisticProject.id))
                toast.error('Failed to create project')
            }
        })
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return

        // Optimistic update: remove immediately
        const deletedProject = projects.find(p => p.id === id)
        setProjects(prev => prev.filter(p => p.id !== id))
        toast.success('Project deleted')

        startTransition(async () => {
            try {
                await deleteProject(id)
            } catch {
                // Revert optimistic update on error
                if (deletedProject) {
                    setProjects(prev => [...prev, deletedProject])
                }
                toast.error('Failed to delete project')
            }
        })
    }

    if (loading) {
        return <ProjectListSkeleton count={6} />
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Track your long-term goals</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Project</DialogTitle>
                            <DialogDescription>
                                Add a new project to track. Complete it to earn bonus XP!
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Project name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What is this project about?"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={status}
                                    onValueChange={(value: 'planned' | 'ongoing' | 'completed') =>
                                        setStatus(value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="planned">Planned</SelectItem>
                                        <SelectItem value="ongoing">Ongoing</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Projects Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.length === 0 ? (
                    <Card className="col-span-full">
                        <CardContent className="py-8">
                            <p className="text-center text-muted-foreground">
                                No projects yet. Create one to get started!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    projects.map((project) => (
                        <Card key={project.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">{project.title}</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(project.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Badge
                                        variant={
                                            project.status === 'completed'
                                                ? 'default'
                                                : project.status === 'ongoing'
                                                    ? 'secondary'
                                                    : 'outline'
                                        }
                                    >
                                        {project.status}
                                    </Badge>
                                    <Badge variant="outline">{project.xp_reward} XP</Badge>
                                </div>
                            </CardHeader>
                            {project.description && (
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {project.description}
                                    </p>
                                </CardContent>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
