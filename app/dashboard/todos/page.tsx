'use client'

import { useState } from 'react'
import { type Todo } from '@/lib/actions/todos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Trash2, Calendar } from 'lucide-react'
import { TodoListSkeleton } from '@/components/skeletons/todo-skeleton'
import { useTodos, useCreateTodo, useToggleTodo, useDeleteTodo } from '@/lib/hooks/use-todos'

export default function TodosPage() {
    const { data: todos = [], isLoading, isFetching } = useTodos()
    const createTodoMutation = useCreateTodo()
    const toggleTodoMutation = useToggleTodo()
    const deleteTodoMutation = useDeleteTodo()
    
    const [dialogOpen, setDialogOpen] = useState(false)
    const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'completed'>('all')

    // Form state
    const [title, setTitle] = useState('')
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
    const [dueDate, setDueDate] = useState('')

    const handleCreate = () => {
        if (!title.trim()) {
            toast.error('Please enter a title')
            return
        }

        createTodoMutation.mutate({
            title: title.trim(),
            priority,
            due_date: dueDate || undefined,
        })
        
        setTitle('')
        setPriority('medium')
        setDueDate('')
        setDialogOpen(false)
    }

    const handleToggle = (id: string) => {
        toggleTodoMutation.mutate(id)
    }

    const handleDelete = (id: string) => {
        if (!confirm('Are you sure you want to delete this todo?')) return
        deleteTodoMutation.mutate(id)
    }

    const filteredTodos = todos.filter((todo: Todo) => {
        const today = new Date().toISOString().split('T')[0]
        const weekFromNow = new Date()
        weekFromNow.setDate(weekFromNow.getDate() + 7)

        switch (filter) {
            case 'today':
                return todo.due_date === today && !todo.completed
            case 'week':
                return (
                    todo.due_date &&
                    new Date(todo.due_date) <= weekFromNow &&
                    !todo.completed
                )
            case 'completed':
                return todo.completed
            default:
                return true
        }
    })

    // Show skeleton only on initial load, not on background refetch
    if (isLoading) {
        return <TodoListSkeleton count={5} />
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">TODOs</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Manage your tasks and earn XP</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Todo
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Todo</DialogTitle>
                            <DialogDescription>
                                Add a new task to your list. Complete it to earn XP!
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="What needs to be done?"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={priority}
                                    onValueChange={(value: 'low' | 'medium' | 'high') =>
                                        setPriority(value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low (10 XP)</SelectItem>
                                        <SelectItem value="medium">Medium (20 XP)</SelectItem>
                                        <SelectItem value="high">High (30 XP)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="due_date">Due Date (Optional)</Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
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

            {/* Filters - Scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                >
                    All
                </Button>
                <Button
                    variant={filter === 'today' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('today')}
                >
                    Today
                </Button>
                <Button
                    variant={filter === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('week')}
                >
                    This Week
                </Button>
                <Button
                    variant={filter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('completed')}
                >
                    Completed
                </Button>
            </div>

            {/* Todos List */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {filter === 'all' && 'All Todos'}
                        {filter === 'today' && "Today's Todos"}
                        {filter === 'week' && 'This Week'}
                        {filter === 'completed' && 'Completed Todos'}
                    </CardTitle>
                    <CardDescription>
                        {filteredTodos.length} {filteredTodos.length === 1 ? 'task' : 'tasks'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredTodos.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No todos found. Create one to get started!
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {filteredTodos.map((todo) => (
                                <div
                                    key={todo.id}
                                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 w-full">
                                        <Checkbox
                                            checked={todo.completed}
                                            onCheckedChange={() => handleToggle(todo.id)}
                                            className="mt-1 sm:mt-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`font-medium break-words ${todo.completed ? 'line-through text-muted-foreground' : ''
                                                    }`}
                                            >
                                                {todo.title}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <Badge
                                                    variant={
                                                        todo.priority === 'high'
                                                            ? 'destructive'
                                                            : todo.priority === 'medium'
                                                                ? 'default'
                                                                : 'secondary'
                                                    }
                                                >
                                                    {todo.priority}
                                                </Badge>
                                                {todo.due_date && (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(todo.due_date).toLocaleDateString()}
                                                    </span>
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {todo.xp_reward} XP
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(todo.id)}
                                        className="self-end sm:self-auto"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
