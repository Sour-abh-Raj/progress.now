import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { getProgressToNextLevel } from '@/lib/gamification/xp-calculator'
import { calculateWeeklyScore } from '@/lib/gamification/streak-tracker'
import { Trophy, Flame, CheckCircle2, Target } from 'lucide-react'
import { getCurrentUser, getGamificationStats, getCachedTodos, getCachedProjects } from '@/lib/data/cached-queries'

export default async function DashboardPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Fetch data using cached queries (deduplicates within request)
    const [stats, todos, projects] = await Promise.all([
        getGamificationStats(user.id),
        getCachedTodos(user.id),
        getCachedProjects(user.id),
    ])

    // Calculate stats
    const todosToday = todos.filter((t) => {
        if (!t.due_date) return false
        return t.due_date === new Date().toISOString().split('T')[0]
    })
    const completedToday = todosToday.filter((t) => t.completed)

    const ongoingProjects = projects.filter((p) => p.status === 'ongoing')
    const completedProjects = projects.filter((p) => p.status === 'completed')

    const levelProgress = stats
        ? getProgressToNextLevel(stats.total_xp, stats.level)
        : { current: 0, required: 100, percentage: 0 }

    const weeklyScore = stats ? await calculateWeeklyScore(user.id) : 0

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                    Welcome back! 👋
                </h1>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                    Here's your productivity overview
                </p>
            </div>

            {/* Stats Grid - Single column on mobile, 2 cols on tablet, 4 on desktop */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Level</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.level || 1}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.total_xp || 0} total XP
                        </p>
                        <Progress value={levelProgress.percentage} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                            {Math.round(levelProgress.current)}/{Math.round(levelProgress.required)} XP to next level
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                        <Flame className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.current_streak || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Longest: {stats?.longest_streak || 0} days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasks Today</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {completedToday.length}/{todosToday.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {todosToday.length - completedToday.length} remaining
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Weekly Score</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{weeklyScore}/100</div>
                        <Progress value={weeklyScore} className="mt-2" />
                    </CardContent>
                </Card>
            </div>

            {/* Projects Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Projects Overview</CardTitle>
                    <CardDescription>
                        Your active and completed projects
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Ongoing</span>
                            <Badge variant="secondary">{ongoingProjects.length}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Completed</span>
                            <Badge variant="default">{completedProjects.length}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Total</span>
                            <Badge variant="outline">{projects.length}</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Today's Tasks */}
            <Card>
                <CardHeader>
                    <CardTitle>Today's Tasks</CardTitle>
                    <CardDescription>
                        {todosToday.length > 0 ? 'Complete these tasks to earn XP' : 'No tasks due today'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {todosToday.length > 0 ? (
                        <div className="space-y-2">
                            {todosToday.slice(0, 5).map((todo) => (
                                <div
                                    key={todo.id}
                                    className="flex items-center justify-between border-b pb-2 last:border-0"
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`h-2 w-2 rounded-full ${todo.completed ? 'bg-green-500' : 'bg-muted-foreground'
                                                }`}
                                        />
                                        <span className={todo.completed ? 'line-through text-muted-foreground' : ''}>
                                            {todo.title}
                                        </span>
                                    </div>
                                    <Badge variant={
                                        todo.priority === 'high' ? 'destructive' :
                                            todo.priority === 'medium' ? 'default' : 'secondary'
                                    }>
                                        {todo.priority}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            All caught up! Great job! 🎉
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
